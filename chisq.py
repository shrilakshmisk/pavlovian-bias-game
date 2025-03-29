#!/usr/bin/env python
"""
HDDM Go/No-go Fitting using the Chi-Square Approach

This script demonstrates an initial code for simulating and fitting go/no-go data 
using HDDM with the chi-square (gsquare) method. The approach is described in:

    de Gee JW, Tsetsos T, McCormick DA, McGinley MJ & Donner TH. (2018).
    Phasic arousal optimizes decision computations in mice and humans. bioRxiv.
    
    Ratcliff, R., Huang-Pollock, C., & McKoon, G. (2016).
    Modeling individual differences in the go/no-go task with a diffusion model.
    Decision, 5(1), 42-62.

© Copyright 2022, Thomas V. Wiecki, Mads Lund Pedersen, Alexander Fengler, 
Krishn Bera, Michael J. Frank, Brown University.
"""

import sys, os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import hddm
from joblib import Parallel, delayed
from IPython import embed as shell

def get_choice(row):
    """
    Determines the choice based on condition and response.
    """
    if row.condition == 'present':
        if row.response == 1:
            return 1
        else:
            return 0
    elif row.condition == 'absent':
        if row.response == 0:
            return 1
        else:
            return 0

def simulate_data(a, v, t, z, dc, sv=0, sz=0, st=0, condition=0, nr_trials1=1000, nr_trials2=1000):
    """
    Simulates stim-coded data.
    """
    parameters1 = {'a': a, 'v': v+dc, 't': t, 'z': z, 'sv': sv, 'sz': sz, 'st': st}
    parameters2 = {'a': a, 'v': v-dc, 't': t, 'z': 1-z, 'sv': sv, 'sz': sz, 'st': st}
    df_sim1, params_sim1 = hddm.generate.gen_rand_data(params=parameters1, size=nr_trials1, subjs=1, subj_noise=0)
    df_sim1['condition'] = 'present'
    df_sim2, params_sim2 = hddm.generate.gen_rand_data(params=parameters2, size=nr_trials2, subjs=1, subj_noise=0)
    df_sim2['condition'] = 'absent'
    df_sim = pd.concat((df_sim1, df_sim2))
    df_sim['bias_response'] = df_sim.apply(get_choice, axis=1)
    df_sim['correct'] = df_sim['response'].astype(int)
    df_sim['response'] = df_sim['bias_response'].astype(int)
    df_sim['stimulus'] = np.array((np.array(df_sim['response'] == 1) & np.array(df_sim['correct'] == 1)) +
                                  (np.array(df_sim['response'] == 0) & np.array(df_sim['correct'] == 0)),
                                  dtype=int)
    df_sim['condition'] = condition
    df_sim = df_sim.drop(columns=['bias_response'])
    return df_sim

def fit_subject(data, quantiles):
    """
    Fits the HDDM model using the chi-square (gsquare) method.
    """
    subj_idx = np.unique(data['subj_idx'])
    m = hddm.HDDMStimCoding(data, stim_col='stimulus', split_param='v', drift_criterion=True, 
                            bias=True, p_outlier=0,
                            depends_on={'v': 'condition', 'a': 'condition', 't': 'condition', 
                                        'z': 'condition', 'dc': 'condition'})
    m.optimize('gsquare', quantiles=quantiles, n_runs=8)
    res = pd.concat((pd.DataFrame([m.values], index=[subj_idx]),
                     pd.DataFrame([m.bic_info], index=[subj_idx])), axis=1)
    return res

def summary_plot(df_group, df_sim_group=None, quantiles=[0, 0.1, 0.3, 0.5, 0.7, 0.9], xlim=None):
    """
    Plots data and model fit summaries for each subject.
    """
    nr_subjects = len(np.unique(df_group['subj_idx']))
    fig = plt.figure(figsize=(10, nr_subjects*2))
    plt_nr = 1
    for s in np.unique(df_group['subj_idx']):
        print("Subject:", s)
        df = df_group.loc[df_group['subj_idx'] == s].copy()
        df_sim = df_sim_group.loc[df_sim_group['subj_idx'] == s].copy() if df_sim_group is not None else None

        # Prepare RT for correct vs. error plots.
        df['rt_acc'] = df['rt'].copy()
        df.loc[df['correct'] == 0, 'rt_acc'] = df.loc[df['correct'] == 0, 'rt_acc'] * -1
        df['rt_resp'] = df['rt'].copy()
        df.loc[df['response'] == 0, 'rt_resp'] = df.loc[df['response'] == 0, 'rt_resp'] * -1

        if df_sim is not None:
            df_sim['rt_acc'] = df_sim['rt'].copy()
            df_sim.loc[df_sim['correct'] == 0, 'rt_acc'] = df_sim.loc[df_sim['correct'] == 0, 'rt_acc'] * -1
            df_sim['rt_resp'] = df_sim['rt'].copy()
            df_sim.loc[df_sim['response'] == 0, 'rt_resp'] = df_sim.loc[df_sim['response'] == 0, 'rt_resp'] * -1

        max_rt = np.percentile(df_sim.loc[~np.isnan(df_sim['rt']), 'rt'], 99) if df_sim is not None \
                 else np.percentile(df.loc[~np.isnan(df['rt']), 'rt'], 99)
        bins = np.linspace(-max_rt, max_rt, 21)

        # Plot RT distributions: correct vs. error.
        ax = fig.add_subplot(nr_subjects, 4, plt_nr)
        N, bins, patches = ax.hist(df['rt_acc'], bins=bins, density=True, color='green', alpha=0.5)
        for bin_val, bin_edge, patch in zip(N, bins, patches):
            if bin_edge < 0:
                plt.setp(patch, 'facecolor', 'r')
        if df_sim is not None:
            ax.hist(df_sim['rt_acc'], bins=bins, density=True, histtype='step', color='k', alpha=1)
        ax.set_title('P(correct)={}'.format(round(df['correct'].mean(), 3)))
        ax.set_xlabel('RT (s)')
        ax.set_ylabel('Probability density')
        plt_nr += 1

        # Plot conditional accuracy.
        ax = fig.add_subplot(nr_subjects, 4, plt_nr)
        df['rt_bin'] = pd.qcut(df['rt'], quantiles, labels=False)
        d = df.groupby(['rt_bin']).mean().reset_index()
        ax.errorbar(d['rt'], d['correct'], fmt='-o', color='orange', markersize=10)
        if df_sim is not None:
            df_sim['rt_bin'] = pd.qcut(df_sim['rt'], quantiles, labels=False)
            d_sim = df_sim.groupby(['rt_bin']).mean().reset_index()
            ax.errorbar(d_sim['rt'], d_sim['correct'], fmt='x', color='k', markersize=6)
        if xlim:
            ax.set_xlim(xlim)
        ax.set_ylim(0, 1)
        ax.set_title('Conditional accuracy')
        ax.set_xlabel('RT (quantiles)')
        ax.set_ylabel('P(correct)')
        plt_nr += 1

        # Plot RT distributions: response 1 vs. 0.
        ax = fig.add_subplot(nr_subjects, 4, plt_nr)
        if df['rt'].isna().sum() > 0:
            bar_width = 1
            fraction_yes = df['response'].mean()
            fraction_yes_sim = df_sim['response'].mean() if df_sim is not None else fraction_yes
            hist, edges = np.histogram(df['rt_resp'], bins=bins, density=True)
            hist = hist * fraction_yes
            hist_sim, edges_sim = np.histogram(df_sim['rt_resp'], bins=bins, density=True) if df_sim is not None else (hist, edges)
            hist_sim = hist_sim * fraction_yes_sim
            ax.bar(edges[:-1], hist, width=np.diff(edges)[0], align='edge',
                   color='magenta', alpha=0.5, linewidth=0)
            ax.step(edges_sim[:-1] + np.diff(edges)[0], hist_sim, color='black', lw=1)
            no_height = (1 - fraction_yes) / bar_width
            no_height_sim = (1 - fraction_yes_sim) / bar_width
            ax.bar(x=-1.5, height=no_height, width=bar_width, alpha=0.5, color='cyan', align='center')
            ax.hlines(y=no_height_sim, xmin=-2, xmax=-1, lw=0.5, colors='black')
            ax.vlines(x=-2, ymin=0, ymax=no_height_sim, lw=0.5, colors='black')
            ax.vlines(x=-1, ymin=0, ymax=no_height_sim, lw=0.5, colors='black')
        else:
            N, bins, patches = ax.hist(df['rt_resp'], bins=bins, density=True,
                                       color='magenta', alpha=0.5)
            for bin_val, bin_edge, patch in zip(N, bins, patches):
                if bin_edge < 0:
                    plt.setp(patch, 'facecolor', 'cyan')
            if df_sim is not None:
                ax.hist(df_sim['rt_resp'], bins=bins, density=True,
                        histtype='step', color='k', alpha=1)
        ax.set_title('P(bias)={}'.format(round(df['response'].mean(), 3)))
        ax.set_xlabel('RT (s)')
        ax.set_ylabel('Probability density')
        plt_nr += 1

        # Plot conditional response.
        ax = fig.add_subplot(nr_subjects, 4, plt_nr)
        df['rt_bin'] = pd.qcut(df['rt'], quantiles, labels=False)
        d = df.groupby(['rt_bin']).mean().reset_index()
        ax.errorbar(d['rt'], d['response'], fmt='-o', color='orange', markersize=10)
        if df_sim is not None:
            df_sim['rt_bin'] = pd.qcut(df_sim['rt'], quantiles, labels=False)
            d_sim = df_sim.groupby(['rt_bin']).mean().reset_index()
            ax.errorbar(d_sim['rt'], d_sim['response'], fmt='x', color='k', markersize=6)
        if xlim:
            ax.set_xlim(xlim)
        ax.set_ylim(0, 1)
        ax.set_title('Conditional response')
        ax.set_xlabel('RT (quantiles)')
        ax.set_ylabel('P(bias)')
        plt_nr += 1

    sns.despine(offset=3, trim=True)
    plt.tight_layout()
    return fig

if __name__ == '__main__':
    # Settings
    go_nogo = True   # If True, RTs for one response alternative will be set to NaN
    n_subjects = 4
    trials_per_level = 10000

    # Define parameters for two conditions.
    params0 = {'cond': 0, 'v': 0.5, 'a': 2.0, 't': 0.3, 'z': 0.5, 'dc': -0.2, 'sz': 0, 'st': 0, 'sv': 0}
    params1 = {'cond': 1, 'v': 0.5, 'a': 2.0, 't': 0.3, 'z': 0.5, 'dc': 0.2, 'sz': 0, 'st': 0, 'sv': 0}

    # Simulate data for each subject and both conditions.
    dfs = []
    for i in range(n_subjects):
        df0 = simulate_data(a=params0['a'], v=params0['v'], t=params0['t'], z=params0['z'],
                            dc=params0['dc'], sv=params0['sv'], st=params0['st'], sz=params0['sz'],
                            condition=params0['cond'], nr_trials1=trials_per_level, nr_trials2=trials_per_level)
        df1 = simulate_data(a=params1['a'], v=params1['v'], t=params1['t'], z=params1['z'],
                            dc=params1['dc'], sv=params1['sv'], st=params1['st'], sz=params1['sz'],
                            condition=params1['cond'], nr_trials1=trials_per_level, nr_trials2=trials_per_level)
        df = pd.concat((df0, df1))
        df['subj_idx'] = i
        dfs.append(df)
    df_emp = pd.concat(dfs)

    if go_nogo:
        df_emp.loc[df_emp["response"] == 0, 'rt'] = np.NaN

    # Fit using the chi-square (gsquare) method.
    quantiles = [0.1, 0.3, 0.5, 0.7, 0.9]
    params_fitted = pd.concat(Parallel(n_jobs=n_subjects)(
        delayed(fit_subject)(data, quantiles) for idx, data in df_emp.groupby('subj_idx')
    ))
    print("Fitted parameters:")
    print(params_fitted.head())

    # Remove unnecessary columns from the fitted parameters.
    params_fitted.drop(['bic', 'likelihood', 'penalty', 'z_trans(0)', 'z_trans(1)'], axis=1, inplace=True)
    print("Processed fitted parameters:")
    print(params_fitted.head())

    # Simulate new data based on the fitted parameters.
    dfs_sim = []
    for i in range(n_subjects):
        df0 = simulate_data(a=params_fitted.loc[i, 'a(0)'], v=params_fitted.loc[i, 'v(0)'],
                            t=params_fitted.loc[i, 't(0)'], z=params_fitted.loc[i, 'z(0)'],
                            dc=params_fitted.loc[i, 'dc(0)'], condition=0, 
                            nr_trials1=trials_per_level, nr_trials2=trials_per_level)
        df1 = simulate_data(a=params_fitted.loc[i, 'a(1)'], v=params_fitted.loc[i, 'v(1)'],
                            t=params_fitted.loc[i, 't(1)'], z=params_fitted.loc[i, 'z(1)'],
                            dc=params_fitted.loc[i, 'dc(1)'], condition=1, 
                            nr_trials1=trials_per_level, nr_trials2=trials_per_level)
        df_sim = pd.concat((df0, df1))
        df_sim['subj_idx'] = i
        dfs_sim.append(df_sim)
    df_sim = pd.concat(dfs_sim)

    if go_nogo:
        df_sim.loc[df_sim["response"] == 0, 'rt'] = np.NaN

    # Plot true vs. recovered parameter values.
    x = np.arange(5) * 2
    y0 = np.array([params0['a'], params0['v'], params0['t'], params0['z'], params0['dc']])
    y1 = np.array([params1['a'], params1['v'], params1['t'], params1['z'], params1['dc']])
    fig_params = plt.figure(figsize=(5, 2))
    ax = fig_params.add_subplot(111)
    ax.scatter(x, y0, marker="o", s=100, color='orange', label='True value')
    ax.scatter(x+1, y1, marker="o", s=100, color='orange')
    sns.stripplot(data=params_fitted, jitter=False, size=2, edgecolor='black',
                  linewidth=0.25, alpha=1, palette=['black', 'black'], ax=ax)
    plt.ylabel('Param value')
    plt.legend()
    sns.despine(offset=5, trim=True)
    plt.tight_layout()
    plt.show()

    # Plot data with model fits for each condition.
    for c in np.unique(df_emp['condition']):
        print("\nCONDITION {}".format(c))
        summary_plot(df_group=df_emp.loc[df_emp['condition'] == c],
                     df_sim_group=df_sim.loc[df_sim['condition'] == c])
    plt.show()
