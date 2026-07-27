/**
 * StateMachine - Manages game state transitions
 */

import { GameConstants } from '../constants/GameConstants.js';

export class StateMachine {
    constructor(initialState = GameConstants.GAME_STATES.IDLE) {
        this.currentState = initialState;
        this.stateHistory = [];
        this.transitions = new Map();
        this.onStateChangeCallbacks = [];
    }

    /**
     * Define allowed transitions for a state
     * @param {string} fromState - Source state
     * @param {string[]} toStates - Array of allowed target states
     */
    addTransition(fromState, toStates) {
        if (!this.transitions.has(fromState)) {
            this.transitions.set(fromState, []);
        }
        this.transitions.get(fromState).push(...toStates);
    }

    /**
     * Check if a transition is allowed
     * @param {string} fromState - Source state
     * @param {string} toState - Target state
     * @returns {boolean} True if transition is allowed
     */
    canTransition(fromState, toState) {
        const allowedTransitions = this.transitions.get(fromState);
        if (!allowedTransitions) return false;
        return allowedTransitions.includes(toState);
    }

    /**
     * Transition to a new state
     * @param {string} newState - Target state
     * @param {*} [data] - Optional data to pass with the transition
     * @returns {boolean} True if transition was successful
     */
    transition(newState, data = null) {
        // Allow any transition if no rules are defined for current state
        if (this.currentState === newState) {
            return false; // Already in this state
        }

        const canTransition = this.canTransition(this.currentState, newState);
        
        // If no rules defined for current state, allow the transition
        if (!canTransition && this.transitions.has(this.currentState)) {
            console.warn(`Invalid transition from ${this.currentState} to ${newState}`);
            return false;
        }

        // Store previous state in history
        this.stateHistory.push({
            state: this.currentState,
            timestamp: Date.now()
        });

        // Keep history limited
        if (this.stateHistory.length > 50) {
            this.stateHistory.shift();
        }

        const previousState = this.currentState;
        this.currentState = newState;

        // Notify callbacks
        this.onStateChangeCallbacks.forEach(callback => {
            try {
                callback(newState, previousState, data);
            } catch (error) {
                console.error('Error in state change callback:', error);
            }
        });

        return true;
    }

    /**
     * Get the current state
     * @returns {string} Current state
     */
    getState() {
        return this.currentState;
    }

    /**
     * Check if in a specific state
     * @param {string} state - State to check
     * @returns {boolean} True if currently in that state
     */
    isInState(state) {
        return this.currentState === state;
    }

    /**
     * Register a callback for state changes
     * @param {Function} callback - Callback function
     * @returns {Function} Unsubscribe function
     */
    onStateChange(callback) {
        this.onStateChangeCallbacks.push(callback);
        return () => {
            const index = this.onStateChangeCallbacks.indexOf(callback);
            if (index !== -1) {
                this.onStateChangeCallbacks.splice(index, 1);
            }
        };
    }

    /**
     * Get the previous state
     * @returns {string|null} Previous state or null if no history
     */
    getPreviousState() {
        if (this.stateHistory.length === 0) return null;
        return this.stateHistory[this.stateHistory.length - 1].state;
    }

    /**
     * Get state history
     * @returns {Array} Array of state history entries
     */
    getHistory() {
        return [...this.stateHistory];
    }

    /**
     * Reset to initial state
     * @param {string} [initialState] - Optional new initial state
     */
    reset(initialState = GameConstants.GAME_STATES.IDLE) {
        this.currentState = initialState;
        this.stateHistory = [];
    }
}

// Default state machine setup for rhythm game
export function createGameStateMachine() {
    const sm = new StateMachine(GameConstants.GAME_STATES.IDLE);
    
    // Define allowed transitions
    sm.addTransition(GameConstants.GAME_STATES.IDLE, [
        GameConstants.GAME_STATES.LOADING,
        GameConstants.GAME_STATES.ANALYZING
    ]);
    
    sm.addTransition(GameConstants.GAME_STATES.LOADING, [
        GameConstants.GAME_STATES.ANALYZING,
        GameConstants.GAME_STATES.IDLE
    ]);
    
    sm.addTransition(GameConstants.GAME_STATES.ANALYZING, [
        GameConstants.GAME_STATES.READY,
        GameConstants.GAME_STATES.IDLE
    ]);
    
    sm.addTransition(GameConstants.GAME_STATES.READY, [
        GameConstants.GAME_STATES.PLAYING,
        GameConstants.GAME_STATES.IDLE
    ]);
    
    sm.addTransition(GameConstants.GAME_STATES.PLAYING, [
        GameConstants.GAME_STATES.PAUSED,
        GameConstants.GAME_STATES.GAME_OVER,
        GameConstants.GAME_STATES.IDLE
    ]);
    
    sm.addTransition(GameConstants.GAME_STATES.PAUSED, [
        GameConstants.GAME_STATES.PLAYING,
        GameConstants.GAME_STATES.IDLE
    ]);
    
    sm.addTransition(GameConstants.GAME_STATES.GAME_OVER, [
        GameConstants.GAME_STATES.IDLE,
        GameConstants.GAME_STATES.READY
    ]);
    
    return sm;
}

export default StateMachine;
