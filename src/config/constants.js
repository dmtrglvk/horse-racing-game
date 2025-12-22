// Race Configuration
export const RACE_CONFIG = {
  // Total number of horses available for racing
  TOTAL_HORSES: 20,
  
  // Number of horses selected per round
  HORSES_PER_ROUND: 10,
  
  // Number of rounds in a race schedule
  TOTAL_ROUNDS: 6,
  
  // Race distances in meters for each round
  ROUND_DISTANCES: [1200, 1400, 1600, 1800, 2000, 2200],
  
  // Base distance used for speed calculation (meters)
  BASE_DISTANCE: 1200,
  
  // Finish line position as percentage of track width
  FINISH_LINE_POSITION: 100,
  
  // Delay between rounds in milliseconds
  ROUND_DELAY_MS: 1000,
  
  // Polling interval for checking pause state (milliseconds)
  PAUSE_CHECK_INTERVAL_MS: 100
}

// Horse Configuration
export const HORSE_CONFIG = {
  // Minimum condition score (1-100)
  MIN_CONDITION: 1,
  
  // Maximum condition score (1-100)
  MAX_CONDITION: 100,
  
  // Condition score range divisor for percentage calculation
  CONDITION_DIVISOR: 100
}

// Animation Configuration
export const ANIMATION_CONFIG = {
  // Maximum delta time cap to prevent large jumps (milliseconds)
  // Caps delta time to prevent animation glitches when tab is inactive
  MAX_DELTA_TIME_MS: 100,
  
  // Base speed multiplier for horse movement
  // This controls the overall speed of the race animation
  BASE_SPEED_MULTIPLIER: 0.1,
  
  // Random speed variation range
  // Horses get a random speed boost between 0.5x and 1.0x of their base speed
  MIN_SPEED_FACTOR: 0.5,
  MAX_SPEED_FACTOR: 1.0,
  
  // Position bounds for track display (percentage)
  MIN_POSITION: 0,
  MAX_POSITION: 100
}