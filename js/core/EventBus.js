/**
 * EventBus - Simple event emitter for decoupled communication between modules
 */

export class EventBus {
    constructor() {
        this.events = new Map();
    }

    /**
     * Subscribe to an event
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     * @returns {Function} Unsubscribe function
     */
    on(event, callback) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        this.events.get(event).push(callback);

        // Return unsubscribe function
        return () => this.off(event, callback);
    }

    /**
     * Unsubscribe from an event
     * @param {string} event - Event name
     * @param {Function} callback - Callback function to remove
     */
    off(event, callback) {
        if (!this.events.has(event)) return;
        
        const callbacks = this.events.get(event);
        const index = callbacks.indexOf(callback);
        if (index !== -1) {
            callbacks.splice(index, 1);
        }
    }

    /**
     * Emit an event with optional data
     * @param {string} event - Event name
     * @param {*} data - Data to pass to callbacks
     */
    emit(event, data) {
        if (!this.events.has(event)) return;
        
        const callbacks = this.events.get(event);
        callbacks.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in event callback for "${event}":`, error);
            }
        });
    }

    /**
     * Remove all listeners for an event or all events
     * @param {string} [event] - Optional event name to clear
     */
    clear(event) {
        if (event) {
            this.events.delete(event);
        } else {
            this.events.clear();
        }
    }

    /**
     * Get the number of listeners for an event
     * @param {string} event - Event name
     * @returns {number} Number of listeners
     */
    listenerCount(event) {
        if (!this.events.has(event)) return 0;
        return this.events.get(event).length;
    }
}

// Event types used throughout the application
export const GameEvents = {
    // Audio events
    AUDIO_LOADED: 'audio:loaded',
    AUDIO_DECODED: 'audio:decoded',
    AUDIO_PLAYING: 'audio:playing',
    AUDIO_PAUSED: 'audio:paused',
    AUDIO_STOPPED: 'audio:stopped',
    
    // Beat detection events
    BEAT_ANALYSIS_STARTED: 'beat:analysis_started',
    BEAT_ANALYSIS_COMPLETE: 'beat:analysis_complete',
    BEAT_ANALYSIS_ERROR: 'beat:analysis_error',
    
    // Game state events
    GAME_STATE_CHANGED: 'game:state_changed',
    GAME_STARTED: 'game:started',
    GAME_PAUSED: 'game:paused',
    GAME_RESUMED: 'game:resumed',
    GAME_OVER: 'game:over',
    
    // Gameplay events
    PATTERN_GENERATED: 'gameplay:pattern_generated',
    INPUT_RECEIVED: 'gameplay:input_received',
    JUDGE_RESULT: 'gameplay:judge_result',
    COMBO_UPDATED: 'gameplay:combo_updated',
    SCORE_UPDATED: 'gameplay:score_updated',
    
    // UI events
    UI_UPDATE: 'ui:update',
    DEBUG_UPDATE: 'ui:debug_update'
};

export default EventBus;
