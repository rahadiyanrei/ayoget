/**
 * BeatTimeline - Stores and provides access to precomputed beat positions
 * Immutable data structure for beat information
 */

export class BeatTimeline {
    constructor(bpm, beats, confidence = 1.0) {
        this.bpm = bpm;
        this.beats = Object.freeze([...beats]); // Immutable array
        this.confidence = confidence;
        this.duration = beats.length > 0 ? beats[beats.length - 1] : 0;
        this.beatCount = beats.length;
        
        // Precompute beat intervals for faster lookup
        this.intervals = [];
        for (let i = 1; i < beats.length; i++) {
            this.intervals.push(beats[i] - beats[i - 1]);
        }
    }

    /**
     * Get the beat index at a specific time
     * @param {number} time - Time in seconds
     * @returns {number} Beat index (0-based), or -1 if before first beat
     */
    getBeatIndexAtTime(time) {
        if (time < this.beats[0]) {
            return -1;
        }
        
        // Binary search for efficiency
        let left = 0;
        let right = this.beats.length - 1;
        
        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            if (this.beats[mid] <= time) {
                if (mid === this.beats.length - 1 || this.beats[mid + 1] > time) {
                    return mid;
                }
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        
        return 0;
    }

    /**
     * Get the time of a specific beat
     * @param {number} beatIndex - Beat index (0-based)
     * @returns {number|null} Beat time in seconds, or null if out of range
     */
    getBeatTime(beatIndex) {
        if (beatIndex < 0 || beatIndex >= this.beats.length) {
            return null;
        }
        return this.beats[beatIndex];
    }

    /**
     * Get the next beat time after current time
     * @param {number} currentTime - Current time in seconds
     * @returns {number|null} Next beat time, or null if no more beats
     */
    getNextBeatTime(currentTime) {
        const index = this.getBeatIndexAtTime(currentTime);
        const nextIndex = index + 1;
        
        if (nextIndex >= this.beats.length) {
            return null;
        }
        
        return this.beats[nextIndex];
    }

    /**
     * Get the previous beat time before current time
     * @param {number} currentTime - Current time in seconds
     * @returns {number|null} Previous beat time, or null if before first beat
     */
    getPreviousBeatTime(currentTime) {
        const index = this.getBeatIndexAtTime(currentTime);
        
        if (index < 0) {
            return null;
        }
        
        return this.beats[index];
    }

    /**
     * Get time until next beat
     * @param {number} currentTime - Current time in seconds
     * @returns {number|null} Time until next beat in seconds
     */
    getTimeToNextBeat(currentTime) {
        const nextBeat = this.getNextBeatTime(currentTime);
        if (nextBeat === null) {
            return null;
        }
        return nextBeat - currentTime;
    }

    /**
     * Get time since last beat
     * @param {number} currentTime - Current time in seconds
     * @returns {number|null} Time since last beat in seconds
     */
    getTimeSinceLastBeat(currentTime) {
        const lastBeat = this.getPreviousBeatTime(currentTime);
        if (lastBeat === null) {
            return null;
        }
        return currentTime - lastBeat;
    }

    /**
     * Get all beats within a time range
     * @param {number} startTime - Start time in seconds
     * @param {number} endTime - End time in seconds
     * @returns {Array} Array of beat times within range
     */
    getBeatsInRange(startTime, endTime) {
        const startIndex = this.getBeatIndexAtTime(startTime);
        const endIndex = this.getBeatIndexAtTime(endTime);
        
        if (startIndex === -1 && endIndex === -1) {
            return [];
        }
        
        const actualStart = startIndex === -1 ? 0 : startIndex;
        const actualEnd = endIndex === -1 ? this.beats.length - 1 : endIndex;
        
        return this.beats.slice(actualStart, actualEnd + 1);
    }

    /**
     * Get the average beat interval
     * @returns {number} Average interval in seconds
     */
    getAverageInterval() {
        if (this.intervals.length === 0) {
            return 60 / this.bpm;
        }
        
        const sum = this.intervals.reduce((a, b) => a + b, 0);
        return sum / this.intervals.length;
    }

    /**
     * Check if a time is close to a beat
     * @param {number} time - Time in seconds
     * @param {number} tolerance - Tolerance in seconds
     * @returns {boolean} True if time is within tolerance of any beat
     */
    isNearBeat(time, tolerance = 0.1) {
        const index = this.getBeatIndexAtTime(time);
        if (index === -1) {
            return false;
        }
        
        const beatTime = this.beats[index];
        const nextBeatTime = this.getNextBeatTime(time);
        
        return Math.abs(time - beatTime) <= tolerance ||
               (nextBeatTime !== null && Math.abs(time - nextBeatTime) <= tolerance);
    }

    /**
     * Create a new BeatTimeline with adjusted BPM
     * @param {number} newBPM - New BPM value
     * @returns {BeatTimeline} New timeline with adjusted beats
     */
    adjustBPM(newBPM) {
        if (newBPM === this.bpm) {
            return this;
        }
        
        const ratio = this.bpm / newBPM;
        const adjustedBeats = this.beats.map(beat => beat * ratio);
        
        return new BeatTimeline(newBPM, adjustedBeats, this.confidence);
    }

    /**
     * Get timeline information as an object
     * @returns {Object} Timeline info
     */
    getInfo() {
        return {
            bpm: this.bpm,
            beatCount: this.beatCount,
            duration: this.duration,
            confidence: this.confidence,
            averageInterval: this.getAverageInterval()
        };
    }

    /**
     * Export timeline as JSON
     * @returns {string} JSON string
     */
    toJSON() {
        return JSON.stringify({
            bpm: this.bpm,
            beats: this.beats,
            confidence: this.confidence
        });
    }

    /**
     * Import timeline from JSON
     * @param {string} jsonString - JSON string
     * @returns {BeatTimeline} New timeline instance
     */
    static fromJSON(jsonString) {
        const data = JSON.parse(jsonString);
        return new BeatTimeline(data.bpm, data.beats, data.confidence);
    }
}

export default BeatTimeline;
