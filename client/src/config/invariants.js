// invariants.js

// Durations (in milliseconds)
// branch go-incongruent and nogo-incongruent
export const FIXATION_DURATION = 1000; // Change this value to modify the fixation time
export const FEEDBACK_DURATION = 1000;   // Feedback popup duration
export const STIMULUS_DURATION = 4000;   // (Used in KnockScene for stimulus timing, if needed)
export const ADDITION_DURATION = 1500;        // Addition problem display duration

// branch trial
// export const FIXATION_DURATION = 1500; // Change this value to modify the fixation time
// export const FEEDBACK_DURATION = 2000;   // Feedback popup duration
// export const STIMULUS_DURATION = 5000;   // (Used in KnockScene for stimulus timing, if needed)
// export const ADDITION_DURATION = 1500;        // Addition problem display duration
// Trial block settings

// branch go-incongruent and nogo-incongruent
export const TOTAL_TRIALS_PER_BLOCK = 100;

// branch trial
// export const TOTAL_TRIALS_PER_BLOCK = 4;

// Define the order of blocks (MC, LC, HC, LC)
export const BLOCK_ORDER = ['MC', 'HC1', 'HC2', 'LC'];
export const BLOCK_ORDER_STRESS = ['LCS', 'HCS']; // two blocks


// branch go-incongruent
export const BLOCK_PROPORTIONS = {
  MC: { go1: 25, go2: 25, nogo1: 25, nogo2: 25 },   // 25% each
  LC: { go1: 35, go2: 15, nogo1: 35, nogo2: 15 },   // 35%, 15%, 35%, 15%
  HC1: { go1: 15, go2: 35, nogo1: 15, nogo2: 35 },    // 15%, 35%, 15%, 35%
  HC2: {go1: 15, go2: 50, nogo1: 15 , nogo2: 20}
};

// branch nogo-incongruent
// export const BLOCK_PROPORTIONS = {
//   MC: { go1: 25, go2: 25, nogo1: 25, nogo2: 25 },   // 25% each
//   LC: { go1: 35, go2: 15, nogo1: 35, nogo2: 15 },   // 35%, 15%, 35%, 15%
//   HC1: { go1: 15, go2: 35, nogo1: 15, nogo2: 35 },    // 15%, 35%, 15%, 35%
//   HC2: {go1: 15, go2: 20, nogo1: 15 , nogo2: 50}
// };

// branch trial
// export const BLOCK_PROPORTIONS = {
//   MC: { go1: 1, go2: 1, nogo1: 1, nogo2: 1 },   // 25% each
//   LC: { go1: 1, go2: 1, nogo1: 1, nogo2: 1 },   // 35%, 15%, 35%, 15%
//   HC1: { go1: 1, go2: 1, nogo1: 1, nogo2: 1 },    // 15%, 35%, 15%, 35%
//   HC2: {go1: 1, go2: 1, nogo1: 1 , nogo2: 1}

// Define the asset paths for your stimulus images (PNG files)
export const ASSET_PATHS = {
  goImage1: '/assets/goImage1.jpeg',
  goImage2: '/assets/goImage2.jpeg',
  nogoImage1: '/assets/noGoImage1.jpeg',
  nogoImage2: '/assets/noGoImage2.jpeg',
};