/**
 * Main entry point for the rhythm game
 * Initializes all modules and starts the game loop
 */

import { GameController } from './core/GameController.js';

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('Rhythm Game - Initializing...');
    
    // Create and start the game controller
    const game = new GameController();
    game.initialize();
    
    // Expose to window for debugging
    window.game = game;
});
