/**
 * BeatEngine - Manages beat-based timing for gameplay
 * Reads from BeatProvider and provides measure/beat information
 */

import { GameConstants } from '../constants/GameConstants.js';

export class BeatEngine {
    constructor() {
        this.beatProvider = null;
        this.currentBeatIndex = 0;
        this.currentMeasure = 0;
        this.startTime = 0;
        this.manualBPM = null;
        this.bpmCorrectionEnabled = false;
    }

    /**
     * Set the beat provider
     * @param {BeatProvider} beatProvider - Beat provider instance
     */
    setBeatProvider(beatProvider) {
        this.beatProvider = beatProvider;
    }

    /**
     * Initialize the beat engine with start time
     * @param {number} startTime - Audio start time reference
     */
    initialize(startTime = 0) {
        this.startTime = startTime;
        this.currentBeatIndex = 0;
        this.currentMeasure = 0;
    }

    /**
     * Update beat tracking based on current time
     * @param {number} currentTime - Current audio playback time in seconds
     */
    update(currentTime) {
        if (!this.beatProvider.isReady()) {
            return;
        }

        const timeline = this.beatProvider.getTimeline();
        const newBeatIndex = timeline.getBeatIndexAtTime(currentTime);
        
        if (newBeatIndex !== this.currentBeatIndex && newBeatIndex >= 0) {
            this.currentBeatIndex = newBeatIndex;
            this.currentMeasure = Math.floor(this.currentBeatIndex / GameConstants.BEATS_PER_MEASURE);
        }
    }

    /**
     * Get the current beat index (0-based)
     * @returns {number} Current beat index
     */
    getCurrentBeatIndex() {
        return this.currentBeatIndex;
    }

    /**
     * Get the current measure number (0-based)
     * @returns {number} Current measure
     */
    getCurrentMeasure() {
        return this.currentMeasure;
    }

    /**
     * Get the beat position within the current measure (0-3 for 4/4 time)
     * @returns {number} Beat position in measure
     */
    getBeatInMeasure() {
        return this.currentBeatIndex % GameConstants.BEATS_PER_MEASURE;
    }

    /**
     * Check if we're on a downbeat (first beat of measure)
     * @returns {boolean} True if on downbeat
     */
    isOnDownbeat() {
        return this.getBeatInMeasure() === 0;
    }

    /**
     * Get time until next beat
     * @param {number} currentTime - Current time
     * @returns {number|null} Time to next beat
     */
    getTimeToNextBeat(currentTime) {
        if (!this.beatProvider.isReady()) {
            return null;
        }
        return this.beatProvider.getTimeline().getTimeToNextBeat(currentTime);
    }

    /**
     * Get time since last beat
     * @param {number} currentTime - Current time
     * @returns {number|null} Time since last beat
     */
    getTimeSinceLastBeat(currentTime) {
        if (!this.beatProvider.isReady()) {
            return null;
        }
        return this.beatProvider.getTimeline().getTimeSinceLastBeat(currentTime);
    }

    /**
     * Reset beat tracking
     */
    reset() {
        this.currentBeatIndex = 0;
        this.currentMeasure = 0;
    }

    /**
     * Get engine status
     * @returns {Object} Status object
     */
    getStatus() {
        return {
            currentBeatIndex: this.currentBeatIndex,
            currentMeasure: this.currentMeasure,
            beatInMeasure: this.getBeatInMeasure(),
            isOnDownbeat: this.isOnDownbeat()
        };
    }

    /**
     * Enable manual BPM correction
     * @param {number} bpm - Manual BPM value
     */
    enableManualBPM(bpm) {
        this.manualBPM = bpm;
        this.bpmCorrectionEnabled = true;
    }

    /**
     * Disable manual BPM correction
     */
    disableManualBPM() {
        this.manualBPM = null;
        this.bpmCorrectionEnabled = false;
    }

    /**
     * Get the effective BPM (manual or detected)
     * @returns {number} Effective BPM
     */
    getEffectiveBPM() {
        if (this.bpmCorrectionEnabled && this.manualBPM !== null) {
            return this.manualBPM;
        }
        return this.beatProvider ? this.beatProvider.getBPM() : GameConstants.DEFAULT_BPM;
    }

    /**
     * Get the detected BPM (before manual correction)
     * @returns {number} Detected BPM
     */
    getDetectedBPM() {
        return this.beatProvider ? this.beatProvider.getBPM() : GameConstants.DEFAULT_BPM;
    }

    /**
     * Get the measure duration in seconds based on effective BPM
     * @returns {number} Measure duration in seconds
     */
    getMeasureDuration() {
        const bpm = this.getEffectiveBPM();
        return (60 / bpm) * GameConstants.BEATS_PER_MEASURE;
    }

    /**
     * Reset beat tracking
     */
    reset() {
        this.currentBeatIndex = 0;
        this.currentMeasure = 0;
    }
}

export default BeatEngine;
