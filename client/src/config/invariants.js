// invariants.js

// Durations (in milliseconds)
export const FIXATION_DURATION = 500; // Change this value to modify the fixation time
export const FEEDBACK_DURATION = 1000;   // Feedback popup duration
export const STIMULUS_DURATION = 3000;   // (Used in KnockScene for stimulus timing, if needed)
export const ADDITION_DURATION = 1500;        // Addition problem display duration


// Trial block settings
export const TOTAL_TRIALS_PER_BLOCK = 100;

// Define the order of blocks (MC, LC, HC, LC)
export const BLOCK_ORDER = ['MC', 'HC1', 'HC2', 'LC'];
export const BLOCK_ORDER_STRESS = ['LCS', 'HCS']; // two blocks

// // Define trial proportions for stress game blocks
// export const BLOCK_PROPORTIONS_STRESS = {
//   LCS: { go1: 7, go2: 3, nogo1: 7, nogo2: 3 },
//   HCS: { go1: 3, go2: 7, nogo1: 3, nogo2: 7 }
// };
// Define the trial proportions for each conflict type (each block has 20 trials)
export const BLOCK_PROPORTIONS = {
  MC: { go1: 25, go2: 25, nogo1: 25, nogo2: 25 },   // 25% each
  LC: { go1: 35, go2: 15, nogo1: 35, nogo2: 15 },   // 35%, 15%, 35%, 15%
  HC1: { go1: 15, go2: 35, nogo1: 15, nogo2: 35 },    // 15%, 35%, 15%, 35%
  HC2: {go1: 15, go2: 50, nogo1: 15 , nogo2: 20}
};

// Define the asset paths for your stimulus images (PNG files)
export const ASSET_PATHS = {
  goImage1: '/assets/goImage1.png',
  goImage2: '/assets/goImage2.png',
  nogoImage1: '/assets/noGoImage1.png',
  nogoImage2: '/assets/noGoImage2.png',
};