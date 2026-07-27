/**
 * AudioEngine - Handles Web Audio API operations
 * Responsible for: loading, decoding, playback control, seeking
 * NOT responsible for beat detection
 */

import { GameConstants } from '../constants/GameConstants.js';
import { EventBus, GameEvents } from '../core/EventBus.js';

export class AudioEngine {
    constructor(eventBus) {
        this.eventBus = eventBus || new EventBus();
        this.audioContext = null;
        this.audioBuffer = null;
        this.sourceNode = null;
        this.gainNode = null;
        this.isPlaying = false;
        this.startTime = 0;
        this.pauseTime = 0;
        this.currentFileName = '';
        
        // Initialize audio context on user interaction
        this.initAudioContext();
    }

    /**
     * Initialize the AudioContext (must be called after user interaction)
     */
    async initAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
                sampleRate: GameConstants.AUDIO_SAMPLE_RATE
            });
            
            // Create gain node for volume control
            this.gainNode = this.audioContext.createGain();
            this.gainNode.connect(this.audioContext.destination);
            this.gainNode.gain.value = 1.0;
        }
        
        // Resume context if suspended (browser autoplay policy)
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }

    /**
     * Load an audio file from File object
     * @param {File} file - Audio file to load
     * @returns {Promise<boolean>} True if loaded successfully
     */
    async loadFile(file) {
        try {
            this.currentFileName = file.name;
            this.eventBus.emit(GameEvents.AUDIO_LOADED, { fileName: file.name });
            
            const arrayBuffer = await file.arrayBuffer();
            return await this.decodeAudioData(arrayBuffer);
        } catch (error) {
            console.error('Error loading audio file:', error);
            throw error;
        }
    }

    /**
     * Decode audio data
     * @param {ArrayBuffer} arrayBuffer - Audio data
     * @returns {Promise<boolean>} True if decoded successfully
     */
    async decodeAudioData(arrayBuffer) {
        try {
            await this.initAudioContext();
            
            this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            
            this.eventBus.emit(GameEvents.AUDIO_DECODED, {
                duration: this.audioBuffer.duration,
                sampleRate: this.audioBuffer.sampleRate,
                channels: this.audioBuffer.numberOfChannels
            });
            
            return true;
        } catch (error) {
            console.error('Error decoding audio data:', error);
            throw error;
        }
    }

    /**
     * Get the decoded AudioBuffer
     * @returns {AudioBuffer|null} The audio buffer or null if not loaded
     */
    getAudioBuffer() {
        return this.audioBuffer;
    }

    /**
     * Start playback
     * @param {number} [offset=0] - Start time offset in seconds
     * @returns {boolean} True if playback started
     */
    play(offset = 0) {
        if (!this.audioBuffer) {
            console.warn('No audio buffer loaded');
            return false;
        }

        // Stop any existing playback
        this.stop();

        try {
            this.sourceNode = this.audioContext.createBufferSource();
            this.sourceNode.buffer = this.audioBuffer;
            this.sourceNode.connect(this.gainNode);
            
            this.startTime = this.audioContext.currentTime - offset;
            this.sourceNode.start(0, offset);
            this.isPlaying = true;
            this.pauseTime = 0;

            // Handle playback end
            this.sourceNode.onended = () => {
                if (this.isPlaying && this.getCurrentTime() >= this.audioBuffer.duration) {
                    this.isPlaying = false;
                    this.eventBus.emit(GameEvents.AUDIO_STOPPED, {});
                }
            };

            this.eventBus.emit(GameEvents.AUDIO_PLAYING, { offset });
            return true;
        } catch (error) {
            console.error('Error starting playback:', error);
            return false;
        }
    }

    /**
     * Pause playback
     * @returns {boolean} True if paused successfully
     */
    pause() {
        if (!this.isPlaying || !this.sourceNode) {
            return false;
        }

        try {
            this.pauseTime = this.getCurrentTime();
            this.sourceNode.stop();
            this.sourceNode = null;
            this.isPlaying = false;

            this.eventBus.emit(GameEvents.AUDIO_PAUSED, { pauseTime: this.pauseTime });
            return true;
        } catch (error) {
            console.error('Error pausing playback:', error);
            return false;
        }
    }

    /**
     * Stop playback and reset position
     */
    stop() {
        if (this.sourceNode) {
            try {
                this.sourceNode.stop();
            } catch (e) {
                // Ignore if already stopped
            }
            this.sourceNode = null;
        }
        this.isPlaying = false;
        this.pauseTime = 0;
        this.startTime = 0;
        
        this.eventBus.emit(GameEvents.AUDIO_STOPPED, {});
    }

    /**
     * Seek to a specific time
     * @param {number} time - Time in seconds to seek to
     * @returns {boolean} True if seeked successfully
     */
    seekTo(time) {
        if (!this.audioBuffer) return false;
        
        // Clamp time to valid range
        time = Math.max(0, Math.min(time, this.audioBuffer.duration));
        
        const wasPlaying = this.isPlaying;
        
        if (wasPlaying) {
            this.pause();
        }
        
        this.pauseTime = time;
        
        if (wasPlaying) {
            this.play(time);
        }
        
        return true;
    }

    /**
     * Get current playback time
     * @returns {number} Current time in seconds
     */
    getCurrentTime() {
        if (!this.isPlaying || !this.audioContext) {
            return this.pauseTime;
        }
        
        const currentTime = this.audioContext.currentTime - this.startTime;
        return Math.min(currentTime, this.audioBuffer?.duration || 0);
    }

    /**
     * Get audio duration
     * @returns {number} Duration in seconds
     */
    getDuration() {
        return this.audioBuffer?.duration || 0;
    }

    /**
     * Check if audio is ready for playback
     * @returns {boolean} True if audio is loaded and decoded
     */
    isReady() {
        return this.audioBuffer !== null && this.audioContext !== null;
    }

    /**
     * Set volume
     * @param {number} volume - Volume level (0-1)
     */
    setVolume(volume) {
        if (this.gainNode) {
            this.gainNode.gain.value = Math.max(0, Math.min(1, volume));
        }
    }

    /**
     * Get current filename
     * @returns {string} Current audio filename
     */
    getFileName() {
        return this.currentFileName;
    }

    /**
     * Cleanup resources
     */
    dispose() {
        this.stop();
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        this.audioBuffer = null;
        this.gainNode = null;
    }
}

export default AudioEngine;
