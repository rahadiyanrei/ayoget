/**
 * AIPlayer - Automated player that mimics human gameplay
 * Uses the same input pipeline as human players
 */

import { GameConstants } from '../constants/GameConstants.js';

export class AIPlayer {
    constructor(timingEngine, arrowEngine) {
        this.timingEngine = timingEngine;
        this.arrowEngine = arrowEngine;
        this.isEnabled = false;
        this.lastInputTime = 0;
        this.inputDelay = 50; // Minimum ms between inputs
        this.perfectZoneTarget = 0.75; // Center of perfect zone
        this.humanVariation = 0.01; // Small timing variation to feel more human
    }

    /**
     * Enable or disable AI player
     * @param {boolean} enabled - Enable state
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
    }

    /**
     * Check if AI is enabled
     * @returns {boolean} Enabled state
     */
    isEnabled() {
        return this.isEnabled;
    }

    /**
     * Update AI logic - call every frame during gameplay
     * @returns {Object|null} Input action to perform, or null if no action
     */
    update() {
        if (!this.isEnabled) {
            return null;
        }

        const now = Date.now();
        
        // Rate limit inputs
        if (now - this.lastInputTime < this.inputDelay) {
            return null;
        }

        const progress = this.arrowEngine.getProgress();

        // Phase 1: Complete arrow sequence
        if (!progress.isWaitingForSpace && progress.totalLength > 0) {
            return this.handleArrowInput(progress);
        }

        // Phase 2: Press SPACE in perfect zone
        if (progress.isWaitingForSpace) {
            return this.handleSpaceInput();
        }

        return null;
    }

    /**
     * Handle arrow input phase
     * @param {Object} progress - Current progress state
     * @returns {Object|null} Arrow input action
     */
    handleArrowInput(progress) {
        const nextDirection = this.arrowEngine.getNextExpectedDirection();
        
        if (!nextDirection || nextDirection === 'space') {
            return null;
        }

        // Add small random delay for human-like feel
        const randomDelay = Math.random() * 30;
        if (Date.now() - this.lastInputTime < this.inputDelay + randomDelay) {
            return null;
        }

        this.lastInputTime = Date.now();
        
        return {
            type: 'arrow',
            direction: nextDirection,
            isAI: true
        };
    }

    /**
     * Handle SPACE input phase
     * Waits for gauge to be in perfect zone
     * @returns {Object|null} SPACE input action
     */
    handleSpaceInput() {
        const gaugeProgress = this.timingEngine.getGaugeProgress();
        
        // Add human-like variation to target
        const targetWithVariation = this.perfectZoneTarget + 
            (Math.random() - 0.5) * this.humanVariation * 2;

        // Check if we're close to the perfect zone
        const distanceToTarget = Math.abs(gaugeProgress - targetWithVariation);
        
        // Perfect zone range
        const perfectMin = GameConstants.JUDGE_WINDOWS.PERFECT.min;
        const perfectMax = GameConstants.JUDGE_WINDOWS.PERFECT.max;

        // Press SPACE when in perfect zone
        if (gaugeProgress >= perfectMin && gaugeProgress <= perfectMax) {
            // Add reaction time delay
            const reactionDelay = 80 + Math.random() * 40; // 80-120ms human-like
            if (Date.now() - this.lastInputTime < reactionDelay) {
                return null;
            }

            this.lastInputTime = Date.now();
            
            return {
                type: 'space',
                gaugeProgress: gaugeProgress,
                distanceFromPerfect: distanceToTarget,
                isAI: true
            };
        }

        // If we missed the perfect zone entirely, press anyway to continue
        if (gaugeProgress > perfectMax + 0.05) {
            this.lastInputTime = Date.now();
            
            return {
                type: 'space',
                gaugeProgress: gaugeProgress,
                missed: true,
                isAI: true
            };
        }

        return null;
    }

    /**
     * Set AI difficulty/skill level
     * @param {string} level - 'easy', 'medium', 'hard', 'perfect'
     */
    setDifficulty(level) {
        switch (level.toLowerCase()) {
            case 'easy':
                this.humanVariation = 0.03;
                this.inputDelay = 100;
                break;
            case 'medium':
                this.humanVariation = 0.02;
                this.inputDelay = 70;
                break;
            case 'hard':
                this.humanVariation = 0.01;
                this.inputDelay = 50;
                break;
            case 'perfect':
                this.humanVariation = 0.002;
                this.inputDelay = 30;
                break;
            default:
                this.humanVariation = 0.01;
                this.inputDelay = 50;
        }
    }

    /**
     * Reset AI state
     */
    reset() {
        this.lastInputTime = 0;
    }
}

export default AIPlayer;
