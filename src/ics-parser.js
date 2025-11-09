/**
 * ICS Parser - Parses ICS/iCalendar format
 */
class ICSParser {
    /**
     * Parse ICS content string
     * @param {string} icsContent - The raw ICS file content
     * @returns {Array} Array of event objects
     */
    static parse(icsContent) {
        const events = [];
        const lines = icsContent.split(/\r?\n/);
        let currentEvent = null;
        let inEvent = false;

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();

            // Handle line folding (continuation lines start with space or tab)
            while (i + 1 < lines.length && /^[ \t]/.test(lines[i + 1])) {
                i++;
                line += lines[i].trim();
            }

            if (line === 'BEGIN:VEVENT') {
                inEvent = true;
                currentEvent = {
                    title: '',
                    start: null,
                    end: null,
                    description: '',
                    location: '',
                    uid: '',
                    categories: [],
                    color: null,
                    priority: null,
                    attachments: [],
                    status: null,
                    isAllDay: false,
                    organizer: null,
                    attendees: []
                };
            } else if (line === 'END:VEVENT' && inEvent) {
                inEvent = false;
                if (currentEvent && currentEvent.start) {
                    events.push(currentEvent);
                }
                currentEvent = null;
            } else if (inEvent && currentEvent) {
                const colonIndex = line.indexOf(':');
                if (colonIndex === -1) continue;

                const fullKey = line.substring(0, colonIndex);
                const value = line.substring(colonIndex + 1);

                // Extract key without parameters (e.g., DTSTART;TZID=... -> DTSTART)
                const key = fullKey.split(';')[0];

                switch (key) {
                    case 'SUMMARY':
                        currentEvent.title = this.unescapeText(value);
                        break;
                    case 'DTSTART':
                        currentEvent.start = this.parseDate(value, fullKey);
                        // Check if it's an all-day event (VALUE=DATE)
                        if (fullKey.includes('VALUE=DATE')) {
                            currentEvent.isAllDay = true;
                        }
                        break;
                    case 'DTEND':
                        currentEvent.end = this.parseDate(value, fullKey);
                        break;
                    case 'DESCRIPTION':
                        currentEvent.description = this.unescapeText(value);
                        break;
                    case 'LOCATION':
                        currentEvent.location = this.unescapeText(value);
                        break;
                    case 'UID':
                        currentEvent.uid = value;
                        break;
                    case 'CATEGORIES':
                        // Categories can be comma-separated
                        currentEvent.categories = value.split(',').map(cat => this.unescapeText(cat.trim()));
                        break;
                    case 'COLOR':
                        currentEvent.color = value;
                        break;
                    case 'PRIORITY':
                        currentEvent.priority = parseInt(value, 10);
                        break;
                    case 'ATTACH':
                        currentEvent.attachments.push(this.unescapeText(value));
                        break;
                    case 'STATUS':
                        currentEvent.status = value.toUpperCase();
                        break;
                    case 'CLASS':
                        currentEvent.class = value.toUpperCase();
                        break;
                    case 'ORGANIZER':
                        currentEvent.organizer = this.parseOrganizer(value, fullKey);
                        break;
                    case 'ATTENDEE':
                        currentEvent.attendees.push(this.parseAttendee(value, fullKey));
                        break;
                    case 'RRULE':
                        currentEvent.recurrence = value;
                        currentEvent.rrule = value;
                        break;
                }
            }
        }

        return events;
    }

    /**
     * Parse ICS date format to JavaScript Date
     * @param {string} dateString - ICS date string
     * @param {string} fullKey - Full key with parameters
     * @returns {Date} JavaScript Date object
     */
    static parseDate(dateString, fullKey) {
        // Remove VALUE=DATE if present
        dateString = dateString.trim();

        // Check if it's a date-only format (YYYYMMDD)
        if (dateString.length === 8) {
            const year = dateString.substring(0, 4);
            const month = dateString.substring(4, 6);
            const day = dateString.substring(6, 8);
            return new Date(year, parseInt(month) - 1, day);
        }

        // DateTime format: YYYYMMDDTHHmmss or YYYYMMDDTHHmmssZ
        if (dateString.includes('T')) {
            const year = dateString.substring(0, 4);
            const month = dateString.substring(4, 6);
            const day = dateString.substring(6, 8);
            const hour = dateString.substring(9, 11);
            const minute = dateString.substring(11, 13);
            const second = dateString.substring(13, 15);

            // If ends with Z, it's UTC
            if (dateString.endsWith('Z')) {
                return new Date(Date.UTC(
                    parseInt(year),
                    parseInt(month) - 1,
                    parseInt(day),
                    parseInt(hour),
                    parseInt(minute),
                    parseInt(second)
                ));
            } else {
                return new Date(
                    parseInt(year),
                    parseInt(month) - 1,
                    parseInt(day),
                    parseInt(hour),
                    parseInt(minute),
                    parseInt(second)
                );
            }
        }

        // Fallback
        return new Date(dateString);
    }

    /**
     * Unescape ICS text (handle \n, \, etc.)
     * @param {string} text - Escaped text
     * @returns {string} Unescaped text
     */
    static unescapeText(text) {
        return text
            .replace(/\\n/g, '\n')
            .replace(/\\,/g, ',')
            .replace(/\\;/g, ';')
            .replace(/\\\\/g, '\\');
    }

    /**
     * Parse ORGANIZER field
     * @param {string} value - Organizer value
     * @param {string} fullKey - Full key with parameters
     * @returns {Object} Organizer object
     */
    static parseOrganizer(value, fullKey) {
        const organizer = { email: value.replace('mailto:', '') };

        // Extract CN (Common Name) from parameters
        const cnMatch = fullKey.match(/CN=([^;:]+)/);
        if (cnMatch) {
            organizer.name = this.unescapeText(cnMatch[1].replace(/^"(.*)"$/, '$1'));
        }

        return organizer;
    }

    /**
     * Parse ATTENDEE field
     * @param {string} value - Attendee value
     * @param {string} fullKey - Full key with parameters
     * @returns {Object} Attendee object
     */
    static parseAttendee(value, fullKey) {
        const attendee = { email: value.replace('mailto:', '') };

        // Extract CN (Common Name)
        const cnMatch = fullKey.match(/CN=([^;:]+)/);
        if (cnMatch) {
            attendee.name = this.unescapeText(cnMatch[1].replace(/^"(.*)"$/, '$1'));
        }

        // Extract PARTSTAT (Participation Status)
        const partstatMatch = fullKey.match(/PARTSTAT=([^;:]+)/);
        if (partstatMatch) {
            attendee.status = partstatMatch[1].toUpperCase();
        }

        // Extract ROLE
        const roleMatch = fullKey.match(/ROLE=([^;:]+)/);
        if (roleMatch) {
            attendee.role = roleMatch[1].toUpperCase();
        }

        return attendee;
    }

    /**
     * Parse ICS from URL or stream (browser/Node.js compatible)
     * @param {string} url - URL to fetch ICS from
     * @returns {Promise<Array>} Promise resolving to array of events
     */
    static async parseFromURL(url) {
        try {
            // Check if we're in Node.js environment
            if (typeof window === 'undefined') {
                // Node.js - use https/http module
                const https = require('https');
                const http = require('http');
                const urlModule = require('url');

                return new Promise((resolve, reject) => {
                    const parsedUrl = urlModule.parse(url);
                    const protocol = parsedUrl.protocol === 'https:' ? https : http;

                    protocol.get(url, (res) => {
                        let data = '';
                        res.on('data', (chunk) => data += chunk);
                        res.on('end', () => {
                            try {
                                resolve(this.parse(data));
                            } catch (error) {
                                reject(error);
                            }
                        });
                    }).on('error', reject);
                });
            } else {
                // Browser - use fetch
                const response = await fetch(url);
                const text = await response.text();
                return this.parse(text);
            }
        } catch (error) {
            console.error('Error fetching ICS:', error);
            throw error;
        }
    }
}

// Export for CommonJS and ES modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ICSParser;
}
