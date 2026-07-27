/**
 * JudgeEngine - Calculates scoring, combo, and accuracy
 */

import { GameConstants } from '../constants/GameConstants.js';

export class JudgeEngine {
    constructor() {
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.totalNotes = 0;
        this.judgeCounts = {
            PERFECT: 0,
            GREAT: 0,
            COOL: 0,
            MISS: 0
        };
    }

    /**
     * Record a judge result and update score/combo
     * @param {string} judgeResult - 'PERFECT', 'GREAT', 'COOL', or 'MISS'
     * @returns {Object} Score update information
     */
    recordJudge(judgeResult) {
        const result = judgeResult.toUpperCase();
        this.totalNotes++;
        
        // Update judge counts
        if (this.judgeCounts.hasOwnProperty(result)) {
            this.judgeCounts[result]++;
        }

        // Update combo
        if (result === 'MISS') {
            this.combo = 0;
        } else {
            this.combo++;
            if (this.combo > this.maxCombo) {
                this.maxCombo = this.combo;
            }
        }

        // Calculate score with combo multiplier
        const baseScore = GameConstants.SCORES[result] || 0;
        const comboMultiplier = this.calculateComboMultiplier();
        const scoreGain = Math.floor(baseScore * comboMultiplier);
        
        this.score += scoreGain;

        return {
            judge: result,
            scoreGain,
            combo: this.combo,
            totalScore: this.score,
            comboMultiplier
        };
    }

    /**
     * Calculate combo multiplier based on current combo
     * @returns {number} Multiplier value
     */
    calculateComboMultiplier() {
        if (this.combo < GameConstants.COMBO_MULTIPLIER_THRESHOLD) {
            return 1.0;
        }

        const extraCombos = this.combo - GameConstants.COMBO_MULTIPLIER_THRESHOLD;
        const extraMultiplier = extraCombos * GameConstants.COMBO_MULTIPLIER_INCREMENT;
        
        return 1.0 + extraMultiplier;
    }

    /**
     * Get current accuracy percentage
     * @returns {number} Accuracy percentage (0-100)
     */
    getAccuracy() {
        if (this.totalNotes === 0) {
            return 100;
        }

        // Weighted accuracy: PERFECT=100%, GREAT=75%, COOL=50%, MISS=0%
        const weightedSum = 
            (this.judgeCounts.PERFECT * 100) +
            (this.judgeCounts.GREAT * 75) +
            (this.judgeCounts.COOL * 50) +
            (this.judgeCounts.MISS * 0);

        return (weightedSum / this.totalNotes);
    }

    /**
     * Get formatted accuracy string
     * @returns {string} Accuracy as percentage string
     */
    getAccuracyString() {
        return this.getAccuracy().toFixed(2) + '%';
    }

    /**
     * Reset all scoring data
     */
    reset() {
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.totalNotes = 0;
        this.judgeCounts = {
            PERFECT: 0,
            GREAT: 0,
            COOL: 0,
            MISS: 0
        };
    }

    /**
     * Get current scoring statistics
     * @returns {Object} Stats object
     */
    getStats() {
        return {
            score: this.score,
            combo: this.combo,
            maxCombo: this.maxCombo,
            accuracy: this.getAccuracy(),
            totalNotes: this.totalNotes,
            judgeCounts: { ...this.judgeCounts }
        };
    }

    /**
     * Get grade based on accuracy
     * @returns {string} Grade letter (S, A, B, C, D, F)
     */
    getGrade() {
        const accuracy = this.getAccuracy();
        
        if (accuracy >= 98) return 'S';
        if (accuracy >= 95) return 'A';
        if (accuracy >= 90) return 'B';
        if (accuracy >= 80) return 'C';
        if (accuracy >= 70) return 'D';
        return 'F';
    }

    /**
     * Get full results summary
     * @returns {Object} Complete results object
     */
    getResults() {
        return {
            score: this.score,
            maxCombo: this.maxCombo,
            accuracy: this.getAccuracy(),
            grade: this.getGrade(),
            judgeCounts: { ...this.judgeCounts },
            totalNotes: this.totalNotes
        };
    }
}

export default JudgeEngine;
