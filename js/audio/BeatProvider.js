/**
 * BeatProvider - Abstracts beat data source for gameplay engines
 * Provides a consistent interface regardless of beat detection method
 */

import { BeatTimeline } from './BeatTimeline.js';
import { GameConstants } from '../constants/GameConstants.js';

export class BeatProvider {
    constructor() {
        this.timeline = null;
        this.detectedBPM = null;
        this.manualBPM = null;
        this.isManualBPMEnabled = false;
    }

    /**
     * Set the beat timeline from beat detection
     * @param {BeatTimeline} timeline - The detected beat timeline
     */
    setTimeline(timeline) {
        this.timeline = timeline;
        this.detectedBPM = timeline.bpm;
        this.manualBPM = null;
        this.isManualBPMEnabled = false;
    }

    /**
     * Enable manual BPM override
     * @param {number} bpm - Manual BPM value
     */
    enableManualBPM(bpm) {
        if (bpm < GameConstants.BPM_MIN || bpm > GameConstants.BPM_MAX) {
            throw new Error(`BPM must be between ${GameConstants.BPM_MIN} and ${GameConstants.BPM_MAX}`);
        }
        
        this.manualBPM = bpm;
        this.isManualBPMEnabled = true;
        
        // Regenerate timeline with new BPM if we have detected beats
        if (this.timeline && this.detectedBPM) {
            this.timeline = this.timeline.adjustBPM(bpm);
        }
    }

    /**
     * Disable manual BPM and return to detected BPM
     */
    disableManualBPM() {
        this.isManualBPMEnabled = false;
        
        // Restore original timeline if we have it
        if (this.detectedBPM && this.timeline) {
            // Timeline was already adjusted, need to restore from original
            // This would require storing the original beats array
            // For now, manual BPM change is permanent until re-analysis
        }
        
        this.manualBPM = null;
    }

    /**
     * Get the effective BPM (manual or detected)
     * @returns {number} Current BPM
     */
    getEffectiveBPM() {
        if (this.isManualBPMEnabled && this.manualBPM !== null) {
            return this.manualBPM;
        }
        return this.detectedBPM || 120; // Default fallback
    }

    /**
     * Check if manual BPM is enabled
     * @returns {boolean} True if using manual BPM
     */
    isUsingManualBPM() {
        return this.isManualBPMEnabled;
    }

    /**
     * Get the current beat timeline
     * @returns {BeatTimeline|null} Current timeline
     */
    getTimeline() {
        return this.timeline;
    }

    /**
     * Get detected BPM (before manual override)
     * @returns {number|null} Detected BPM
     */
    getDetectedBPM() {
        return this.detectedBPM;
    }

    /**
     * Get manual BPM if set
     * @returns {number|null} Manual BPM
     */
    getManualBPM() {
        return this.manualBPM;
    }

    /**
     * Get current measure duration based on effective BPM
     * @returns {number} Measure duration in seconds
     */
    getMeasureDuration() {
        const bpm = this.getEffectiveBPM();
        const beatDuration = 60 / bpm;
        return beatDuration * GameConstants.BEATS_PER_MEASURE;
    }

    /**
     * Get beat duration based on effective BPM
     * @returns {number} Beat duration in seconds
     */
    getBeatDuration() {
        const bpm = this.getEffectiveBPM();
        return 60 / bpm;
    }

    /**
     * Check if beat data is available
     * @returns {boolean} True if timeline is set
     */
    isReady() {
        return this.timeline !== null;
    }

    /**
     * Reset all beat data
     */
    reset() {
        this.timeline = null;
        this.detectedBPM = null;
        this.manualBPM = null;
        this.isManualBPMEnabled = false;
    }

    /**
     * Get provider status information
     * @returns {Object} Status object
     */
    getStatus() {
        return {
            hasTimeline: this.timeline !== null,
            detectedBPM: this.detectedBPM,
            manualBPM: this.manualBPM,
            isManualBPMEnabled: this.isManualBPMEnabled,
            effectiveBPM: this.getEffectiveBPM(),
            measureDuration: this.getMeasureDuration(),
            beatDuration: this.beatDuration
        };
    }
}

export default BeatProvider;
