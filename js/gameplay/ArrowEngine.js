/**
 * ArrowEngine - Handles arrow input validation and sequence tracking
 * Implements Audition Online-style input: wrong input resets entire sequence
 */

import { GameConstants } from '../constants/GameConstants.js';

export class ArrowEngine {
    constructor() {
        this.currentPattern = [];
        this.inputIndex = 0;
        this.isSequenceComplete = false;
        this.isWaitingForSpace = false;
        this.lastInputTime = 0;
        this.totalInputs = 0;
        this.correctInputs = 0;
    }

    /**
     * Set the current arrow pattern to match
     * @param {Array<string>} pattern - Array of direction strings
     */
    setPattern(pattern) {
        this.currentPattern = [...pattern];
        this.reset();
    }

    /**
     * Reset input state for new pattern
     */
    reset() {
        this.inputIndex = 0;
        this.isSequenceComplete = false;
        this.isWaitingForSpace = false;
        this.lastInputTime = 0;
    }

    /**
     * Process an arrow key input
     * @param {string} direction - Input direction ('left', 'down', 'up', 'right')
     * @returns {Object} Result object with success, reset, and message properties
     */
    processArrowInput(direction) {
        const result = {
            success: false,
            reset: false,
            message: '',
            currentIndex: this.inputIndex,
            totalIndex: this.currentPattern.length
        };

        // If waiting for SPACE, ignore arrow inputs
        if (this.isWaitingForSpace) {
            result.message = 'Waiting for SPACE';
            return result;
        }

        this.totalInputs++;
        this.lastInputTime = Date.now();

        // Check if input matches expected arrow
        if (direction === this.currentPattern[this.inputIndex]) {
            // Correct input
            this.correctInputs++;
            this.inputIndex++;
            result.success = true;
            result.currentIndex = this.inputIndex;

            // Check if pattern is complete
            if (this.inputIndex >= this.currentPattern.length) {
                this.isSequenceComplete = true;
                this.isWaitingForSpace = true;
                result.message = 'Pattern Complete! Press SPACE';
            } else {
                result.message = 'Correct!';
            }
        } else {
            // Wrong input - reset entire sequence (Audition Online style)
            this.inputIndex = 0;
            this.isSequenceComplete = false;
            this.isWaitingForSpace = false;
            result.reset = true;
            result.message = 'Wrong! Sequence Reset';
        }

        return result;
    }

    /**
     * Process SPACE input
     * @returns {Object} Result object indicating if SPACE was valid
     */
    processSpaceInput() {
        const result = {
            success: false,
            canPress: false,
            message: ''
        };

        // Can only press SPACE after completing the pattern
        if (!this.isWaitingForSpace) {
            result.message = 'Complete the pattern first';
            return result;
        }

        result.canPress = true;
        result.success = true;
        
        return result;
    }

    /**
     * Get the current input progress
     * @returns {Object} Progress information
     */
    getProgress() {
        return {
            currentIndex: this.inputIndex,
            totalLength: this.currentPattern.length,
            isComplete: this.isSequenceComplete,
            isWaitingForSpace: this.isWaitingForSpace,
            percentComplete: this.currentPattern.length > 0 
                ? (this.inputIndex / this.currentPattern.length) * 100 
                : 0
        };
    }

    /**
     * Get the next expected direction
     * @returns {string|null} Next direction or null if complete
     */
    getNextExpectedDirection() {
        if (this.isWaitingForSpace) {
            return 'space';
        }
        if (this.inputIndex >= this.currentPattern.length) {
            return null;
        }
        return this.currentPattern[this.inputIndex];
    }

    /**
     * Get all directions that should be highlighted as completed
     * @returns {Array<string>} Array of completed directions
     */
    getCompletedDirections() {
        return this.currentPattern.slice(0, this.inputIndex);
    }

    /**
     * Get accuracy percentage for current pattern
     * @returns {number} Accuracy percentage
     */
    getCurrentAccuracy() {
        if (this.totalInputs === 0) {
            return 100;
        }
        return (this.correctInputs / this.totalInputs) * 100;
    }

    /**
     * Get the full current pattern
     * @returns {Array<string>} Current pattern
     */
    getCurrentPattern() {
        return [...this.currentPattern];
    }

    /**
     * Check if engine has a pattern set
     * @returns {boolean} True if pattern is set
     */
    hasPattern() {
        return this.currentPattern.length > 0;
    }

    /**
     * Get input statistics
     * @returns {Object} Stats object
     */
    getStats() {
        return {
            totalInputs: this.totalInputs,
            correctInputs: this.correctInputs,
            accuracy: this.getCurrentAccuracy(),
            patternLength: this.currentPattern.length
        };
    }

    /**
     * Full reset including statistics
     */
    fullReset() {
        this.reset();
        this.totalInputs = 0;
        this.correctInputs = 0;
        this.currentPattern = [];
    }
}

export default ArrowEngine;
