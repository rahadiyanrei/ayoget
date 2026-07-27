/**
 * PatternGenerator - Generates arrow patterns procedurally
 * Isolated from gameplay logic for future beatmap support
 */

import { GameConstants } from '../constants/GameConstants.js';

export class PatternGenerator {
    constructor() {
        this.directions = [...GameConstants.ARROW_DIRECTIONS];
        this.lastPatterns = [];
        this.maxHistorySize = 5;
    }

    /**
     * Generate a random arrow pattern
     * @param {number} [length] - Pattern length (4-9), or random if not specified
     * @returns {Array<string>} Array of direction strings
     */
    generatePattern(length) {
        // Use provided length or pick randomly from configured lengths
        if (!length) {
            const lengths = GameConstants.PATTERN_LENGTHS;
            length = lengths[Math.floor(Math.random() * lengths.length)];
        }

        // Clamp length to valid range
        length = Math.max(GameConstants.MIN_PATTERN_LENGTH, 
                         Math.min(GameConstants.MAX_PATTERN_LENGTH, length));

        let pattern = [];
        let lastDirection = null;
        let consecutiveCount = 0;
        const maxConsecutive = 2; // Max same direction in a row

        for (let i = 0; i < length; i++) {
            let availableDirections = this.directions.filter(dir => {
                // Avoid immediate repeats more than maxConsecutive times
                if (dir === lastDirection && consecutiveCount >= maxConsecutive) {
                    return false;
                }
                return true;
            });

            // If all directions filtered out (shouldn't happen), reset
            if (availableDirections.length === 0) {
                availableDirections = this.directions;
                consecutiveCount = 0;
            }

            // Pick random direction
            const direction = availableDirections[Math.floor(Math.random() * availableDirections.length)];
            pattern.push(direction);

            // Track consecutive same directions
            if (direction === lastDirection) {
                consecutiveCount++;
            } else {
                consecutiveCount = 0;
            }
            lastDirection = direction;
        }

        // Validate pattern doesn't match recent history
        if (this.isPatternInHistory(pattern)) {
            // Regenerate if too similar to recent patterns
            return this.generatePattern(length);
        }

        // Add to history
        this.addToHistory(pattern);

        return pattern;
    }

    /**
     * Check if pattern is similar to any in history
     * @param {Array<string>} pattern - Pattern to check
     * @returns {boolean} True if pattern is in history
     */
    isPatternInHistory(pattern) {
        const patternStr = pattern.join(',');
        return this.lastPatterns.some(p => p.join(',') === patternStr);
    }

    /**
     * Add pattern to history
     * @param {Array<string>} pattern - Pattern to add
     */
    addToHistory(pattern) {
        this.lastPatterns.push([...pattern]);
        
        // Keep history size limited
        if (this.lastPatterns.length > this.maxHistorySize) {
            this.lastPatterns.shift();
        }
    }

    /**
     * Clear pattern history
     */
    clearHistory() {
        this.lastPatterns = [];
    }

    /**
     * Generate multiple patterns for a song
     * @param {number} count - Number of patterns to generate
     * @param {number} [length] - Optional fixed length for all patterns
     * @returns {Array<Array<string>>} Array of patterns
     */
    generateMultiplePatterns(count, length) {
        const patterns = [];
        for (let i = 0; i < count; i++) {
            patterns.push(this.generatePattern(length));
        }
        return patterns;
    }

    /**
     * Get difficulty preset settings
     * @param {string} difficulty - 'easy', 'medium', 'hard'
     * @returns {Object} Difficulty settings
     */
    getDifficultyPreset(difficulty) {
        switch (difficulty.toLowerCase()) {
            case 'easy':
                return {
                    minLength: 4,
                    maxLength: 5,
                    allowConsecutive: true,
                    maxConsecutive: 2
                };
            
            case 'medium':
                return {
                    minLength: 5,
                    maxLength: 7,
                    allowConsecutive: true,
                    maxConsecutive: 2
                };
            
            case 'hard':
                return {
                    minLength: 6,
                    maxLength: 9,
                    allowConsecutive: false,
                    maxConsecutive: 1
                };
            
            default:
                return {
                    minLength: GameConstants.MIN_PATTERN_LENGTH,
                    maxLength: GameConstants.MAX_PATTERN_LENGTH,
                    allowConsecutive: true,
                    maxConsecutive: 2
                };
        }
    }

    /**
     * Convert pattern string array to key codes for AI
     * @param {Array<string>} pattern - Direction strings
     * @returns {Array<string>} Key codes
     */
    patternToKeyCodes(pattern) {
        const keyMap = {
            'left': 'ArrowLeft',
            'down': 'ArrowDown',
            'up': 'ArrowUp',
            'right': 'ArrowRight'
        };
        
        return pattern.map(dir => keyMap[dir]);
    }
}

export default PatternGenerator;
