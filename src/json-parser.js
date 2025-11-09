/**
 * JSON Event Parser
 */
class JSONParser {
    /**
     * Parse JSON events
     * @param {string|Object} jsonData - JSON string or parsed object
     * @returns {Array} Array of normalized event objects
     */
    static parse(jsonData) {
        let data;

        // Parse string if needed
        if (typeof jsonData === 'string') {
            try {
                data = JSON.parse(jsonData);
            } catch (error) {
                console.error('Error parsing JSON:', error);
                throw new Error('Invalid JSON format');
            }
        } else {
            data = jsonData;
        }

        // Ensure data is an array
        if (!Array.isArray(data)) {
            data = [data];
        }

        // Normalize events
        return data.map(event => this.normalizeEvent(event));
    }

    /**
     * Normalize event object to standard format
     * @param {Object} event - Raw event object
     * @returns {Object} Normalized event object
     */
    static normalizeEvent(event) {
        // Parse categories if it's a string or array
        let categories = [];
        if (event.categories) {
            if (typeof event.categories === 'string') {
                categories = event.categories.split(',').map(c => c.trim());
            } else if (Array.isArray(event.categories)) {
                categories = event.categories;
            }
        } else if (event.category) {
            categories = [event.category];
        } else if (event.tags) {
            categories = Array.isArray(event.tags) ? event.tags : [event.tags];
        }

        // Parse attachments
        let attachments = [];
        if (event.attachments) {
            attachments = Array.isArray(event.attachments) ? event.attachments : [event.attachments];
        } else if (event.attach) {
            attachments = Array.isArray(event.attach) ? event.attach : [event.attach];
        }

        return {
            title: event.title || event.summary || event.name || 'Untitled',
            start: new Date(event.start || event.startDate || event.startTime),
            end: event.end || event.endDate || event.endTime
                ? new Date(event.end || event.endDate || event.endTime)
                : null,
            description: event.description || event.desc || '',
            location: event.location || event.place || '',
            uid: event.uid || event.id || Math.random().toString(36).substr(2, 9),
            categories: categories,
            color: event.color || null,
            priority: event.priority || null,
            attachments: attachments,
            status: event.status ? event.status.toUpperCase() : null,
            isAllDay: event.isAllDay || event.allDay || false,
            organizer: event.organizer || null,
            attendees: event.attendees || []
        };
    }

    /**
     * Validate event object
     * @param {Object} event - Event object to validate
     * @returns {boolean} True if valid
     */
    static validateEvent(event) {
        if (!event || typeof event !== 'object') {
            return false;
        }

        // Must have at least a title or summary and a start date
        const hasTitle = event.title || event.summary || event.name;
        const hasStart = event.start || event.startDate || event.startTime;

        return !!(hasTitle && hasStart);
    }
}

// Export for CommonJS and ES modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = JSONParser;
}
