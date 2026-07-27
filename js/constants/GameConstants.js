/**
 * GameConstants - Centralized configuration for the rhythm game
 * All magic numbers and configurable values should be stored here
 */

export const GameConstants = {
    // Judge Timing Windows (as percentage of gauge position)
    JUDGE_WINDOWS: {
        PERFECT: { min: 0.73, max: 0.77 },
        GREAT: { 
            min1: 0.69, max1: 0.73,
            min2: 0.77, max2: 0.81 
        },
        COOL: { 
            min1: 0.65, max1: 0.69,
            min2: 0.81, max2: 0.85 
        }
    },

    // Score values for each judge type
    SCORES: {
        PERFECT: 100,
        GREAT: 50,
        COOL: 20,
        MISS: 0
    },

    // Combo multiplier settings
    COMBO_MULTIPLIER_THRESHOLD: 10,
    COMBO_MULTIPLIER_INCREMENT: 0.1,

    // Beat Gauge dimensions
    GAUGE_WIDTH_PX: 480,
    GAUGE_HEIGHT_PX: 20,
    GAUGE_PERFECT_ZONE_PERCENT: 75,

    // Pattern generation settings
    PATTERN_LENGTHS: [4, 5, 6, 7, 8, 9],
    MIN_PATTERN_LENGTH: 4,
    MAX_PATTERN_LENGTH: 9,
    
    // Arrow directions
    ARROW_DIRECTIONS: ['left', 'down', 'up', 'right'],
    
    // Keyboard mappings
    KEY_MAPPINGS: {
        'ArrowLeft': 'left',
        'ArrowDown': 'down',
        'ArrowUp': 'up',
        'ArrowRight': 'right',
        ' ': 'space'
    },

    // BPM constraints
    BPM_MIN: 40,
    BPM_MAX: 300,
    
    // Audio settings
    AUDIO_SAMPLE_RATE: 44100,
    
    // Measure timing (4/4 time signature)
    BEATS_PER_MEASURE: 4,
    
    // Animation frame rate target
    TARGET_FPS: 60,
    
    // Debug settings
    DEBUG_ENABLED: true,
    
    // AI Player settings
    AI_HIT_WINDOW_OFFSET: 0.02, // Small offset to make AI more human-like
    
    // Game states
    GAME_STATES: {
        IDLE: 'IDLE',
        LOADING: 'LOADING',
        ANALYZING: 'ANALYZING',
        READY: 'READY',
        PLAYING: 'PLAYING',
        PAUSED: 'PAUSED',
        GAME_OVER: 'GAME_OVER'
    }
};

export default GameConstants;
