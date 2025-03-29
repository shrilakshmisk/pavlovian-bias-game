import numpy as np

class GoNoGoRLAgent:
    def __init__(self, learning_rate=0.1, beta=5.0,
                 action_bias=0.0, pavlovian_bias=0.0,
                 reward_sensitivity=1.0, punishment_sensitivity=1.0):
        """
        Initialize the RL agent.
        
        Parameters:
        - learning_rate: the speed of updating Q-values (α)
        - beta: inverse temperature parameter for softmax action selection
        - action_bias: a general bias towards one action (e.g., "go")
        - pavlovian_bias: bias modulating responses in proportion to stimulus valence
        - reward_sensitivity: scaling factor for reward outcomes (for positive reinforcement)
        - punishment_sensitivity: scaling factor for punishment outcomes (for negative reinforcement)
        
        Q-values are initialized to zero for both actions.
        """
        self.alpha = learning_rate
        self.beta = beta
        self.action_bias = action_bias
        self.pavlovian_bias = pavlovian_bias
        self.reward_sensitivity = reward_sensitivity
        self.punishment_sensitivity = punishment_sensitivity
        
        # Q-values for the two actions: 0 = "go", 1 = "no-go"
        self.Q = np.zeros(2)
    
    def softmax(self, weights):
        """Compute softmax probabilities from action weights."""
        exp_values = np.exp(self.beta * weights)
        return exp_values / np.sum(exp_values)
    
    def choose_action(self):
        """
        Select an action using a softmax over weighted Q-values.
        
        The weights can be modulated by:
          - a general action bias (e.g., favoring a 'go' response),
          - and a pavlovian bias (e.g., inhibiting 'go' when punishment is anticipated).
          
        Returns:
          action (0 for 'go', 1 for 'no-go') and the corresponding probability distribution.
        """
        # Base weights from Q-values
        weights = self.Q.copy()
        
        # Apply a general action bias: assume bias is applied to 'go' (action 0)
        weights[0] += self.action_bias
        
        # Incorporate a simple pavlovian bias: for example, if expected value is negative,
        # bias might increase the probability of 'no-go'. This is a rudimentary implementation.
        if self.Q[1] < 0:
            weights[1] += self.pavlovian_bias * abs(self.Q[1])
        
        probs = self.softmax(weights)
        action = np.random.choice([0, 1], p=probs)
        return action, probs
    
    def update(self, action, reward):
        """
        Update the Q-value for the selected action using a Rescorla-Wagner update rule.
        
        The update is based on a prediction error:
            Q(t+1) = Q(t) + α * (EffectiveReward - Q(t))
        where EffectiveReward scales the raw reward by reward or punishment sensitivity.
        """
        # Determine effective reward based on outcome sign.
        if reward >= 0:
            effective_reward = reward * self.reward_sensitivity
        else:
            effective_reward = reward * self.punishment_sensitivity
        
        # Compute prediction error and update Q-value for the taken action.
        prediction_error = effective_reward - self.Q[action]
        self.Q[action] += self.alpha * prediction_error

# Example usage:
if __name__ == '__main__':
    # Instantiate the agent with example parameters.
    agent = GoNoGoRLAgent(learning_rate=0.1, beta=5.0,
                            action_bias=0.2, pavlovian_bias=0.3,
                            reward_sensitivity=1.0, punishment_sensitivity=1.0)
    
    # Example trial outcomes (e.g., from a go/no-go task):
    # Positive values represent rewards, negative values represent punishments, 0 for no feedback.
    trial_rewards = [1, -1, 0, 1, -1, 1, 0, -1, 1, -1]
    
    for trial, reward in enumerate(trial_rewards):
        action, probs = agent.choose_action()
        print(f"Trial {trial + 1}: Action: {'go' if action == 0 else 'no-go'}, "
              f"Reward: {reward}, Q-values: {agent.Q}")
        agent.update(action, reward)
