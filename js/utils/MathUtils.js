/**
 * MathUtils - Mathematical helper functions for the rhythm game
 */

/**
 * Clamp a value between min and max
 * @param {number} value - The value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation between two values
 * @param {number} a - Start value
 * @param {number} b - End value
 * @param {number} t - Interpolation factor (0-1)
 * @returns {number} Interpolated value
 */
export function lerp(a, b, t) {
    return a + (b - a) * t;
}

/**
 * Map a value from one range to another
 * @param {number} value - Value to map
 * @param {number} inMin - Input minimum
 * @param {number} inMax - Input maximum
 * @param {number} outMin - Output minimum
 * @param {number} outMax - Output maximum
 * @returns {number} Mapped value
 */
export function mapRange(value, inMin, inMax, outMin, outMax) {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

/**
 * Check if a value is within a range (inclusive)
 * @param {number} value - Value to check
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {boolean} True if value is within range
 */
export function isInRange(value, min, max) {
    return value >= min && value <= max;
}

/**
 * Check if a value is within any of two ranges (for split ranges like GREAT/COOL)
 * @param {number} value - Value to check
 * @param {Object} rangeObj - Object with min1, max1, min2, max2 properties
 * @returns {boolean} True if value is within either range
 */
export function isInSplitRange(value, rangeObj) {
    const inFirstRange = value >= rangeObj.min1 && value <= rangeObj.max1;
    const inSecondRange = value >= rangeObj.min2 && value <= rangeObj.max2;
    return inFirstRange || inSecondRange;
}

/**
 * Calculate the distance between two values
 * @param {number} a - First value
 * @param {number} b - Second value
 * @returns {number} Absolute distance
 */
export function distance(a, b) {
    return Math.abs(a - b);
}

/**
 * Format time in seconds to MM:SS format
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
export function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Round to specified decimal places
 * @param {number} value - Value to round
 * @param {number} decimals - Number of decimal places
 * @returns {number} Rounded value
 */
export function roundToDecimals(value, decimals) {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
}

export default {
    clamp,
    lerp,
    mapRange,
    isInRange,
    isInSplitRange,
    distance,
    formatTime,
    roundToDecimals
};
