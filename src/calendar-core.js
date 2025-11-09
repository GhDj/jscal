/**
 * CalendarCore - Core calendar logic without DOM dependencies
 */
class CalendarCore {
    constructor() {
        this.events = [];
    }

    /**
     * Add events to the calendar
     * @param {Array} events - Array of event objects
     */
    addEvents(events) {
        if (!Array.isArray(events)) {
            events = [events];
        }
        this.events = [...this.events, ...events];
    }

    /**
     * Clear all events
     */
    clearEvents() {
        this.events = [];
    }

    /**
     * Get events for a specific date
     * @param {Date} date - The date to get events for
     * @returns {Array} Events on that date
     */
    getEventsForDate(date) {
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);

        return this.events.filter(event => {
            const eventDate = new Date(event.start);
            eventDate.setHours(0, 0, 0, 0);
            return eventDate.getTime() === targetDate.getTime();
        });
    }

    /**
     * Get events in a date range
     * @param {Date} startDate - Start of range
     * @param {Date} endDate - End of range
     * @returns {Array} Events in range
     */
    getEventsInRange(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        return this.events.filter(event => {
            const eventStart = new Date(event.start);
            return eventStart >= start && eventStart <= end;
        }).sort((a, b) => new Date(a.start) - new Date(b.start));
    }

    /**
     * Get events for a specific month
     * @param {number} year - Year
     * @param {number} month - Month (0-11)
     * @returns {Array} Events in that month
     */
    getEventsForMonth(year, month) {
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);
        return this.getEventsInRange(startDate, endDate);
    }

    /**
     * Get calendar grid data for a month
     * @param {number} year - Year
     * @param {number} month - Month (0-11)
     * @returns {Object} Calendar grid data
     */
    getMonthGrid(year, month) {
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const monthEvents = this.getEventsForMonth(year, month);

        const grid = [];

        // Add empty cells for days before month starts
        for (let i = 0; i < firstDay; i++) {
            grid.push({ day: null, events: [] });
        }

        // Add day cells
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dayEvents = this.getEventsForDate(date);
            grid.push({
                day,
                date,
                events: dayEvents,
                isToday: this.isToday(date)
            });
        }

        return {
            year,
            month,
            grid,
            totalEvents: monthEvents.length
        };
    }

    /**
     * Check if date is today
     * @param {Date} date - Date to check
     * @returns {boolean} True if today
     */
    isToday(date) {
        const today = new Date();
        const checkDate = new Date(date);

        return today.getFullYear() === checkDate.getFullYear() &&
               today.getMonth() === checkDate.getMonth() &&
               today.getDate() === checkDate.getDate();
    }

    /**
     * Get all events
     * @returns {Array} All events
     */
    getAllEvents() {
        return [...this.events].sort((a, b) => new Date(a.start) - new Date(b.start));
    }

    /**
     * Search events by title
     * @param {string} query - Search query
     * @returns {Array} Matching events
     */
    searchEvents(query) {
        const lowerQuery = query.toLowerCase();
        return this.events.filter(event =>
            event.title.toLowerCase().includes(lowerQuery) ||
            (event.description && event.description.toLowerCase().includes(lowerQuery)) ||
            (event.location && event.location.toLowerCase().includes(lowerQuery))
        );
    }

    /**
     * Get ISO week number for a date
     * @param {Date} date - The date
     * @returns {number} Week number (1-53)
     */
    getWeekNumber(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    }

    /**
     * Get year for ISO week
     * @param {Date} date - The date
     * @returns {number} ISO week year
     */
    getWeekYear(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        return d.getUTCFullYear();
    }

    /**
     * Find conflicting (overlapping) events
     * @param {Object} event - Event to check for conflicts
     * @returns {Array} Array of conflicting events
     */
    getConflictingEvents(event) {
        if (!event.start || !event.end) {
            return [];
        }

        const eventStart = new Date(event.start);
        const eventEnd = new Date(event.end);

        return this.events.filter(e => {
            // Don't compare event with itself
            if (e.uid === event.uid) {
                return false;
            }

            // Skip events without end times
            if (!e.end) {
                return false;
            }

            const eStart = new Date(e.start);
            const eEnd = new Date(e.end);

            // Check for overlap
            return (eventStart < eEnd && eventEnd > eStart);
        });
    }

    /**
     * Check if an event has conflicts
     * @param {Object} event - Event to check
     * @returns {boolean} True if event has conflicts
     */
    hasConflict(event) {
        return this.getConflictingEvents(event).length > 0;
    }

    /**
     * Filter events by category
     * @param {string|Array} categories - Category or categories to filter by
     * @returns {Array} Filtered events
     */
    filterByCategory(categories) {
        const categoryArray = Array.isArray(categories) ? categories : [categories];
        const lowerCategories = categoryArray.map(c => c.toLowerCase());

        return this.events.filter(event => {
            if (!event.categories || event.categories.length === 0) {
                return false;
            }
            return event.categories.some(cat =>
                lowerCategories.includes(cat.toLowerCase())
            );
        });
    }

    /**
     * Get events by priority level
     * @param {number} minPriority - Minimum priority (1-9, 1 is highest)
     * @param {number} maxPriority - Maximum priority (optional)
     * @returns {Array} Events with specified priority
     */
    getEventsByPriority(minPriority, maxPriority = 9) {
        return this.events.filter(event => {
            if (!event.priority) {
                return false;
            }
            return event.priority >= minPriority && event.priority <= maxPriority;
        }).sort((a, b) => a.priority - b.priority);
    }

    /**
     * Get high priority events (priority 1-3)
     * @returns {Array} High priority events
     */
    getHighPriorityEvents() {
        return this.getEventsByPriority(1, 3);
    }

    /**
     * Get all categories used in events
     * @returns {Array} Array of unique categories
     */
    getAllCategories() {
        const categorySet = new Set();
        this.events.forEach(event => {
            if (event.categories && Array.isArray(event.categories)) {
                event.categories.forEach(cat => categorySet.add(cat));
            }
        });
        return Array.from(categorySet).sort();
    }

    /**
     * Get events by status
     * @param {string} status - Status to filter by (CONFIRMED, TENTATIVE, CANCELLED)
     * @returns {Array} Events with specified status
     */
    getEventsByStatus(status) {
        const upperStatus = status.toUpperCase();
        return this.events.filter(event => event.status === upperStatus);
    }
}

// Export for CommonJS and ES modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CalendarCore;
}
