/**
 * TimingEngine - Central timing source for all gameplay systems
 * Synchronizes gameplay with audio playback position
 * All timing-related queries go through this engine
 */

import { GameConstants } from '../constants/GameConstants.js';
import { clamp, isInRange, isInSplitRange } from '../utils/MathUtils.js';

export class TimingEngine {
    constructor() {
        this.audioEngine = null;
        this.beatEngine = null;
    }

    /**
     * Set the audio engine reference
     * @param {AudioEngine} audioEngine - Audio engine instance
     */
    setAudioEngine(audioEngine) {
        this.audioEngine = audioEngine;
    }

    /**
     * Set the beat engine reference
     * @param {BeatEngine} beatEngine - Beat engine instance
     */
    setBeatEngine(beatEngine) {
        this.beatEngine = beatEngine;
    }

    /**
     * Get current playback time from audio engine
     * @returns {number} Current time in seconds
     */
    getCurrentTime() {
        return this.audioEngine ? this.audioEngine.getCurrentTime() : 0;
    }

    /**
     * Get gauge progress (0-1) within current measure
     * Linear movement, no easing
     * @returns {number} Gauge progress percentage (0-100)
     */
    getGaugeProgress() {
        if (!this.beatEngine) {
            return 0;
        }

        const currentTime = this.getCurrentTime();
        const measureDuration = this.beatEngine.getMeasureDuration();
        
        // Calculate position within current measure
        const timeInMeasure = currentTime % measureDuration;
        const progress = timeInMeasure / measureDuration;
        
        return clamp(progress, 0, 1);
    }

    /**
     * Get gauge progress as percentage (0-100)
     * @returns {number} Gauge progress percentage
     */
    getGaugeProgressPercent() {
        return this.getGaugeProgress() * 100;
    }

    /**
     * Check if current gauge position is within a judge window
     * @param {string} judgeType - 'PERFECT', 'GREAT', or 'COOL'
     * @returns {boolean} True if within judge window
     */
    isWithinJudgeWindow(judgeType) {
        const progress = this.getGaugeProgress();
        const windows = GameConstants.JUDGE_WINDOWS;

        switch (judgeType.toUpperCase()) {
            case 'PERFECT':
                return isInRange(progress, windows.PERFECT.min, windows.PERFECT.max);
            
            case 'GREAT':
                return isInSplitRange(progress, windows.GREAT);
            
            case 'COOL':
                return isInSplitRange(progress, windows.COOL);
            
            default:
                return false;
        }
    }

    /**
     * Determine the judge result based on current gauge position
     * @returns {string} Judge result: 'PERFECT', 'GREAT', 'COOL', or 'MISS'
     */
    getJudgeResult() {
        if (this.isWithinJudgeWindow('PERFECT')) {
            return 'PERFECT';
        }
        if (this.isWithinJudgeWindow('GREAT')) {
            return 'GREAT';
        }
        if (this.isWithinJudgeWindow('COOL')) {
            return 'COOL';
        }
        return 'MISS';
    }

    /**
     * Get distance from perfect zone center (0.75)
     * @returns {number} Distance from perfect center
     */
    getDistanceFromPerfect() {
        const progress = this.getGaugeProgress();
        const perfectCenter = (GameConstants.JUDGE_WINDOWS.PERFECT.min + 
                               GameConstants.JUDGE_WINDOWS.PERFECT.max) / 2;
        return Math.abs(progress - perfectCenter);
    }

    /**
     * Get remaining time in current measure
     * @returns {number} Time remaining in seconds
     */
    getRemainingMeasureTime() {
        if (!this.beatEngine) {
            return 0;
        }

        const currentTime = this.getCurrentTime();
        const measureDuration = this.beatEngine.getMeasureDuration();
        const timeInMeasure = currentTime % measureDuration;
        
        return measureDuration - timeInMeasure;
    }

    /**
     * Get current beat index
     * @returns {number} Current beat index
     */
    getCurrentBeat() {
        if (!this.beatEngine) {
            return 0;
        }
        return this.beatEngine.getCurrentBeatIndex();
    }

    /**
     * Get current measure number
     * @returns {number} Current measure
     */
    getCurrentMeasure() {
        if (!this.beatEngine) {
            return 0;
        }
        return this.beatEngine.getCurrentMeasure();
    }

    /**
     * Get effective BPM
     * @returns {number} Current BPM
     */
    getBPM() {
        return this.beatEngine ? this.beatEngine.getEffectiveBPM() : GameConstants.DEFAULT_BPM;
    }

    /**
     * Get timing information for debug display
     * @returns {Object} Timing data
     */
    getDebugInfo() {

    /**
     * Get comprehensive timing data for game loop
     * @returns {Object} Timing data object
     */
    getTimingData() {
        return {
            currentTime: this.getCurrentTime(),
            gaugeProgress: this.getGaugeProgress(),
            currentBeat: this.getCurrentBeat(),
            currentMeasure: this.getCurrentMeasure(),
            bpm: this.getBPM(),
            judgeResult: this.getJudgeResult()
        };
    }

    /**
     * Update timing (called each frame)
     */
    update() {
        if (this.beatEngine) {
            this.beatEngine.update(this.getCurrentTime());
        }
    }
}

export default TimingEngine;
