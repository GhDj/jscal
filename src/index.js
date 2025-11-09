/**
 * JSCal - JavaScript Calendar Library
 * Main entry point
 */

const ICSParser = require('./ics-parser');
const JSONParser = require('./json-parser');
const CalendarCore = require('./calendar-core');
const Holidays = require('./holidays');
const EventManager = require('./event-manager');
const Recurrence = require('./recurrence');
const { Theme, Themes } = require('./theme');
const { Renderer, DefaultTemplates } = require('./renderer');

/**
 * Main Calendar class combining all functionality
 */
class JSCal {
    constructor(options = {}) {
        this.core = new CalendarCore();
        this.eventManager = new EventManager(this.core);
        this.theme = options.theme || null;
        this.renderer = options.renderer || new Renderer();
    }

    /**
     * Load events from ICS string
     * @param {string} icsContent - ICS file content
     * @returns {Array} Parsed events
     */
    loadICS(icsContent) {
        const events = ICSParser.parse(icsContent);
        this.core.addEvents(events);
        return events;
    }

    /**
     * Load events from ICS URL
     * @param {string} url - URL to fetch ICS from
     * @returns {Promise<Array>} Parsed events
     */
    async loadICSFromURL(url) {
        const events = await ICSParser.parseFromURL(url);
        this.core.addEvents(events);
        return events;
    }

    /**
     * Load events from JSON
     * @param {string|Object} jsonData - JSON data
     * @returns {Array} Parsed events
     */
    loadJSON(jsonData) {
        const events = JSONParser.parse(jsonData);
        this.core.addEvents(events);
        return events;
    }

    /**
     * Add custom events
     * @param {Array|Object} events - Event(s) to add
     */
    addEvents(events) {
        this.core.addEvents(events);
    }

    /**
     * Clear all events
     */
    clearEvents() {
        this.core.clearEvents();
    }

    /**
     * Get events for a specific date
     * @param {Date} date - The date
     * @returns {Array} Events on that date
     */
    getEventsForDate(date) {
        return this.core.getEventsForDate(date);
    }

    /**
     * Get events in a date range
     * @param {Date} startDate - Start of range
     * @param {Date} endDate - End of range
     * @returns {Array} Events in range
     */
    getEventsInRange(startDate, endDate) {
        return this.core.getEventsInRange(startDate, endDate);
    }

    /**
     * Get events for a specific month
     * @param {number} year - Year
     * @param {number} month - Month (0-11)
     * @returns {Array} Events in that month
     */
    getEventsForMonth(year, month) {
        return this.core.getEventsForMonth(year, month);
    }

    /**
     * Get calendar grid for a month
     * @param {number} year - Year
     * @param {number} month - Month (0-11)
     * @returns {Object} Calendar grid data
     */
    getMonthGrid(year, month) {
        return this.core.getMonthGrid(year, month);
    }

    /**
     * Get all events
     * @returns {Array} All events sorted by start date
     */
    getAllEvents() {
        return this.core.getAllEvents();
    }

    /**
     * Search events
     * @param {string} query - Search query
     * @returns {Array} Matching events
     */
    searchEvents(query) {
        return this.core.searchEvents(query);
    }

    /**
     * Get ISO week number for a date
     * @param {Date} date - The date
     * @returns {number} Week number
     */
    getWeekNumber(date) {
        return this.core.getWeekNumber(date);
    }

    /**
     * Get ISO week year for a date
     * @param {Date} date - The date
     * @returns {number} Week year
     */
    getWeekYear(date) {
        return this.core.getWeekYear(date);
    }

    /**
     * Get conflicting events for an event
     * @param {Object} event - Event to check
     * @returns {Array} Conflicting events
     */
    getConflictingEvents(event) {
        return this.core.getConflictingEvents(event);
    }

    /**
     * Check if an event has conflicts
     * @param {Object} event - Event to check
     * @returns {boolean} True if has conflicts
     */
    hasConflict(event) {
        return this.core.hasConflict(event);
    }

    /**
     * Filter events by category
     * @param {string|Array} categories - Category or categories
     * @returns {Array} Filtered events
     */
    filterByCategory(categories) {
        return this.core.filterByCategory(categories);
    }

    /**
     * Get events by priority
     * @param {number} minPriority - Minimum priority
     * @param {number} maxPriority - Maximum priority
     * @returns {Array} Events with specified priority
     */
    getEventsByPriority(minPriority, maxPriority) {
        return this.core.getEventsByPriority(minPriority, maxPriority);
    }

    /**
     * Get high priority events
     * @returns {Array} High priority events
     */
    getHighPriorityEvents() {
        return this.core.getHighPriorityEvents();
    }

    /**
     * Get all categories
     * @returns {Array} Array of categories
     */
    getAllCategories() {
        return this.core.getAllCategories();
    }

    /**
     * Get events by status
     * @param {string} status - Status to filter by
     * @returns {Array} Events with specified status
     */
    getEventsByStatus(status) {
        return this.core.getEventsByStatus(status);
    }

    /**
     * Load holidays for a year and country
     * @param {number} year - Year
     * @param {string} country - Country code (US, UK, FR, CA)
     * @returns {Array} Holiday events
     */
    loadHolidays(year, country = 'US') {
        const holidays = Holidays.getHolidays(year, country);
        this.core.addEvents(holidays);
        return holidays;
    }

    // ============================================
    // CRUD Operations
    // ============================================

    /**
     * Add a single event
     * @param {Object} event - Event to add
     * @returns {Object} Added event with UID
     */
    addEvent(event) {
        return this.eventManager.addEvent(event);
    }

    /**
     * Update an existing event
     * @param {string} uid - UID of event to update
     * @param {Object} updates - Fields to update
     * @returns {Object|null} Updated event or null if not found
     */
    updateEvent(uid, updates) {
        return this.eventManager.updateEvent(uid, updates);
    }

    /**
     * Delete an event
     * @param {string} uid - UID of event to delete
     * @returns {boolean} True if deleted, false if not found
     */
    deleteEvent(uid) {
        return this.eventManager.deleteEvent(uid);
    }

    /**
     * Delete multiple events
     * @param {Array<string>} uids - Array of UIDs to delete
     * @returns {number} Number of events deleted
     */
    deleteEvents(uids) {
        return this.eventManager.deleteEvents(uids);
    }

    /**
     * Find event by UID
     * @param {string} uid - UID to search for
     * @returns {Object|null} Event or null if not found
     */
    findEventByUID(uid) {
        return this.eventManager.findEventByUID(uid);
    }

    /**
     * Find events matching criteria
     * @param {Function} predicate - Filter function
     * @returns {Array} Matching events
     */
    findEvents(predicate) {
        return this.eventManager.findEvents(predicate);
    }

    /**
     * Duplicate an event
     * @param {string} uid - UID of event to duplicate
     * @param {Object} modifications - Optional modifications
     * @returns {Object|null} New event or null if original not found
     */
    duplicateEvent(uid, modifications) {
        return this.eventManager.duplicateEvent(uid, modifications);
    }

    /**
     * Move event to different date/time
     * @param {string} uid - UID of event to move
     * @param {Date} newStart - New start date/time
     * @param {boolean} keepDuration - If true, adjust end time
     * @returns {Object|null} Updated event or null if not found
     */
    moveEvent(uid, newStart, keepDuration = true) {
        return this.eventManager.moveEvent(uid, newStart, keepDuration);
    }

    /**
     * Validate event object
     * @param {Object} event - Event to validate
     * @returns {Object} Validation result { valid, errors }
     */
    validateEvent(event) {
        return this.eventManager.validateEvent(event);
    }

    /**
     * Get event count
     * @returns {number} Number of events
     */
    getEventCount() {
        return this.eventManager.getEventCount();
    }

    // ============================================
    // Recurring Events
    // ============================================

    /**
     * Expand recurring event into occurrences
     * @param {Object} event - Event with recurrence rule
     * @param {Date} rangeStart - Start of expansion range
     * @param {Date} rangeEnd - End of expansion range
     * @param {number} maxOccurrences - Maximum occurrences
     * @returns {Array} Array of event occurrences
     */
    expandRecurrence(event, rangeStart, rangeEnd, maxOccurrences) {
        return Recurrence.expandRecurrence(event, rangeStart, rangeEnd, maxOccurrences);
    }

    /**
     * Get all events including expanded recurring events
     * @param {Date} rangeStart - Start of range
     * @param {Date} rangeEnd - End of range
     * @returns {Array} All events with recurring events expanded
     */
    getAllEventsExpanded(rangeStart, rangeEnd) {
        const allEvents = [];

        this.core.events.forEach(event => {
            if (event.recurrence || event.rrule) {
                // Expand recurring event
                const occurrences = Recurrence.expandRecurrence(event, rangeStart, rangeEnd);
                allEvents.push(...occurrences);
            } else {
                // Non-recurring event
                if (!rangeStart || !rangeEnd ||
                    (new Date(event.start) >= rangeStart && new Date(event.start) <= rangeEnd)) {
                    allEvents.push(event);
                }
            }
        });

        return allEvents.sort((a, b) => new Date(a.start) - new Date(b.start));
    }

    /**
     * Get events for a specific month (with recurring events expanded)
     * @param {number} year - Year
     * @param {number} month - Month (0-11)
     * @returns {Array} Events in that month
     */
    getEventsForMonthExpanded(year, month) {
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0, 23, 59, 59);
        return this.getAllEventsExpanded(startDate, endDate);
    }

    /**
     * Parse RRULE string
     * @param {string} rrule - RRULE string
     * @returns {Object} Parsed rule
     */
    parseRRule(rrule) {
        return Recurrence.parseRRule(rrule);
    }

    /**
     * Format RRULE object to string
     * @param {Object} rule - Recurrence rule object
     * @returns {string} RRULE string
     */
    formatRRule(rule) {
        return Recurrence.formatRRule(rule);
    }

    /**
     * Create daily recurrence rule
     * @param {number} count - Number of occurrences
     * @param {number} interval - Days between occurrences
     * @returns {Object} Recurrence rule
     */
    createDailyRecurrence(count, interval) {
        return Recurrence.daily(count, interval);
    }

    /**
     * Create weekly recurrence rule
     * @param {number} count - Number of occurrences
     * @param {Array<string>} days - Days of week
     * @returns {Object} Recurrence rule
     */
    createWeeklyRecurrence(count, days) {
        return Recurrence.weekly(count, days);
    }

    /**
     * Create monthly recurrence rule
     * @param {number} count - Number of occurrences
     * @param {number} dayOfMonth - Day of month
     * @returns {Object} Recurrence rule
     */
    createMonthlyRecurrence(count, dayOfMonth) {
        return Recurrence.monthly(count, dayOfMonth);
    }

    /**
     * Create yearly recurrence rule
     * @param {number} count - Number of occurrences
     * @returns {Object} Recurrence rule
     */
    createYearlyRecurrence(count) {
        return Recurrence.yearly(count);
    }

    // ============================================
    // Theming & Rendering
    // ============================================

    /**
     * Set calendar theme
     * @param {Theme|Object} theme - Theme to apply
     */
    setTheme(theme) {
        if (theme instanceof Theme) {
            this.theme = theme;
        } else {
            this.theme = new Theme(theme);
        }
    }

    /**
     * Get current theme
     * @returns {Theme|null} Current theme
     */
    getTheme() {
        return this.theme;
    }

    /**
     * Apply theme to DOM element
     * @param {HTMLElement} element - Element to apply theme to
     */
    applyTheme(element) {
        if (!this.theme) {
            console.warn('No theme set. Use setTheme() first.');
            return;
        }
        this.theme.apply(element);
    }

    /**
     * Remove theme from element
     * @param {HTMLElement} element - Element to remove theme from
     */
    removeTheme(element) {
        if (!this.theme) return;
        this.theme.remove(element);
    }

    /**
     * Set custom renderer
     * @param {Renderer} renderer - Custom renderer
     */
    setRenderer(renderer) {
        if (!(renderer instanceof Renderer)) {
            throw new Error('Renderer must be an instance of Renderer class');
        }
        this.renderer = renderer;
    }

    /**
     * Get current renderer
     * @returns {Renderer} Current renderer
     */
    getRenderer() {
        return this.renderer;
    }

    /**
     * Set a custom template
     * @param {string} name - Template name
     * @param {Function} templateFn - Template function
     */
    setTemplate(name, templateFn) {
        this.renderer.setTemplate(name, templateFn);
    }

    /**
     * Render using a template
     * @param {string} name - Template name
     * @param {Object} data - Data for template
     * @returns {string} Rendered HTML
     */
    render(name, data) {
        return this.renderer.render(name, data);
    }
}

// Export everything
module.exports = JSCal;
module.exports.JSCal = JSCal;
module.exports.ICSParser = ICSParser;
module.exports.JSONParser = JSONParser;
module.exports.CalendarCore = CalendarCore;
module.exports.Holidays = Holidays;
module.exports.EventManager = EventManager;
module.exports.Recurrence = Recurrence;
module.exports.Theme = Theme;
module.exports.Themes = Themes;
module.exports.Renderer = Renderer;
module.exports.DefaultTemplates = DefaultTemplates;
module.exports.default = JSCal;
