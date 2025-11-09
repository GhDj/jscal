/**
 * Event Manager - CRUD operations for events
 */

class EventManager {
    constructor(calendarCore) {
        this.core = calendarCore;
    }

    /**
     * Add a single event
     * @param {Object} event - Event to add
     * @returns {Object} Added event with generated UID if not provided
     */
    addEvent(event) {
        // Validate event
        if (!event || typeof event !== 'object') {
            throw new Error('Event must be an object');
        }

        if (!event.title && !event.summary) {
            throw new Error('Event must have a title');
        }

        if (!event.start && !event.startDate) {
            throw new Error('Event must have a start date');
        }

        // Normalize event
        const normalizedEvent = this.normalizeEvent(event);

        // Add to calendar
        this.core.addEvents([normalizedEvent]);

        return normalizedEvent;
    }

    /**
     * Update an existing event
     * @param {string} uid - UID of event to update
     * @param {Object} updates - Fields to update
     * @returns {Object|null} Updated event or null if not found
     */
    updateEvent(uid, updates) {
        if (!uid) {
            throw new Error('UID is required to update an event');
        }

        // Find event index
        const index = this.core.events.findIndex(e => e.uid === uid);

        if (index === -1) {
            return null;
        }

        // Merge updates with existing event
        const updatedEvent = {
            ...this.core.events[index],
            ...updates,
            uid: this.core.events[index].uid // Preserve UID
        };

        // Update in place
        this.core.events[index] = updatedEvent;

        return updatedEvent;
    }

    /**
     * Delete an event by UID
     * @param {string} uid - UID of event to delete
     * @returns {boolean} True if deleted, false if not found
     */
    deleteEvent(uid) {
        if (!uid) {
            throw new Error('UID is required to delete an event');
        }

        const initialLength = this.core.events.length;
        this.core.events = this.core.events.filter(e => e.uid !== uid);

        return this.core.events.length < initialLength;
    }

    /**
     * Delete multiple events by UIDs
     * @param {Array<string>} uids - Array of UIDs to delete
     * @returns {number} Number of events deleted
     */
    deleteEvents(uids) {
        if (!Array.isArray(uids)) {
            throw new Error('UIDs must be an array');
        }

        const uidSet = new Set(uids);
        const initialLength = this.core.events.length;
        this.core.events = this.core.events.filter(e => !uidSet.has(e.uid));

        return initialLength - this.core.events.length;
    }

    /**
     * Find event by UID
     * @param {string} uid - UID to search for
     * @returns {Object|null} Event or null if not found
     */
    findEventByUID(uid) {
        return this.core.events.find(e => e.uid === uid) || null;
    }

    /**
     * Find events matching criteria
     * @param {Function} predicate - Filter function
     * @returns {Array} Matching events
     */
    findEvents(predicate) {
        return this.core.events.filter(predicate);
    }

    /**
     * Replace all events (bulk update)
     * @param {Array} events - New events array
     */
    replaceAllEvents(events) {
        this.core.events = events.map(e => this.normalizeEvent(e));
    }

    /**
     * Duplicate an event
     * @param {string} uid - UID of event to duplicate
     * @param {Object} modifications - Optional modifications to apply
     * @returns {Object|null} New event or null if original not found
     */
    duplicateEvent(uid, modifications = {}) {
        const original = this.findEventByUID(uid);
        if (!original) {
            return null;
        }

        // Create copy with new UID
        const duplicate = {
            ...original,
            ...modifications,
            uid: this.generateUID()
        };

        this.core.addEvents([duplicate]);

        return duplicate;
    }

    /**
     * Move event to different date/time
     * @param {string} uid - UID of event to move
     * @param {Date} newStart - New start date/time
     * @param {boolean} keepDuration - If true, adjust end time to maintain duration
     * @returns {Object|null} Updated event or null if not found
     */
    moveEvent(uid, newStart, keepDuration = true) {
        const event = this.findEventByUID(uid);
        if (!event) {
            return null;
        }

        const updates = { start: newStart };

        if (keepDuration && event.end) {
            const duration = new Date(event.end) - new Date(event.start);
            updates.end = new Date(newStart.getTime() + duration);
        } else if (!keepDuration) {
            // Explicitly remove end if not keeping duration
            updates.end = null;
        }

        return this.updateEvent(uid, updates);
    }

    /**
     * Normalize event object
     * @param {Object} event - Raw event
     * @returns {Object} Normalized event
     */
    normalizeEvent(event) {
        return {
            title: event.title || event.summary || 'Untitled',
            start: event.start instanceof Date ? event.start : new Date(event.start || event.startDate),
            end: event.end ? (event.end instanceof Date ? event.end : new Date(event.end)) : null,
            description: event.description || event.desc || '',
            location: event.location || event.place || '',
            uid: event.uid || event.id || this.generateUID(),
            categories: event.categories || [],
            color: event.color || null,
            priority: event.priority || null,
            attachments: event.attachments || [],
            status: event.status || null,
            isAllDay: event.isAllDay || event.allDay || false,
            organizer: event.organizer || null,
            attendees: event.attendees || [],
            recurrence: event.recurrence || event.rrule || null
        };
    }

    /**
     * Generate a unique ID
     * @returns {string} Unique ID
     */
    generateUID() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 9);
        return `${timestamp}-${random}@jscal`;
    }

    /**
     * Validate event object
     * @param {Object} event - Event to validate
     * @returns {Object} Validation result { valid: boolean, errors: Array }
     */
    validateEvent(event) {
        const errors = [];

        if (!event || typeof event !== 'object') {
            return { valid: false, errors: ['Event must be an object'] };
        }

        if (!event.title && !event.summary) {
            errors.push('Event must have a title');
        }

        if (!event.start && !event.startDate) {
            errors.push('Event must have a start date');
        }

        // Validate date objects
        if (event.start) {
            const startDate = event.start instanceof Date ? event.start : new Date(event.start);
            if (isNaN(startDate.getTime())) {
                errors.push('Invalid start date');
            }
        }

        if (event.end) {
            const endDate = event.end instanceof Date ? event.end : new Date(event.end);
            if (isNaN(endDate.getTime())) {
                errors.push('Invalid end date');
            }

            // Check that end is after start
            if (event.start) {
                const start = new Date(event.start);
                const end = new Date(event.end);
                if (end < start) {
                    errors.push('End date must be after start date');
                }
            }
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Get event count
     * @returns {number} Number of events
     */
    getEventCount() {
        return this.core.events.length;
    }

    /**
     * Check if event exists
     * @param {string} uid - UID to check
     * @returns {boolean} True if exists
     */
    hasEvent(uid) {
        return this.core.events.some(e => e.uid === uid);
    }
}

// Export for CommonJS and ES modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EventManager;
}
