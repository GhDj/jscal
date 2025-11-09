/**
 * Recurrence Engine - Parse and expand recurring events (RRULE)
 */

class Recurrence {
    /**
     * Parse RRULE string
     * @param {string} rrule - RRULE string (e.g., "FREQ=DAILY;COUNT=10")
     * @returns {Object} Parsed recurrence rule
     */
    static parseRRule(rrule) {
        if (!rrule) {
            return null;
        }

        // Remove "RRULE:" prefix if present
        const ruleString = rrule.replace(/^RRULE:/i, '');

        const rule = {};
        const parts = ruleString.split(';');

        parts.forEach(part => {
            const [key, value] = part.split('=');
            if (!key || !value) return;

            const upperKey = key.toUpperCase();

            switch (upperKey) {
                case 'FREQ':
                    rule.freq = value.toUpperCase();
                    break;
                case 'COUNT':
                    rule.count = parseInt(value, 10);
                    break;
                case 'UNTIL':
                    rule.until = this.parseRRuleDate(value);
                    break;
                case 'INTERVAL':
                    rule.interval = parseInt(value, 10);
                    break;
                case 'BYDAY':
                    rule.byDay = value.split(',');
                    break;
                case 'BYMONTHDAY':
                    rule.byMonthDay = value.split(',').map(d => parseInt(d, 10));
                    break;
                case 'BYMONTH':
                    rule.byMonth = value.split(',').map(m => parseInt(m, 10));
                    break;
                case 'WKST':
                    rule.wkst = value.toUpperCase();
                    break;
                default:
                    rule[upperKey.toLowerCase()] = value;
            }
        });

        return rule;
    }

    /**
     * Parse RRULE date format (YYYYMMDDTHHMMSS or YYYYMMDDTHHMMSSZ)
     * @param {string} dateString - Date string
     * @returns {Date} Parsed date
     */
    static parseRRuleDate(dateString) {
        if (dateString.length === 8) {
            // YYYYMMDD
            const year = dateString.substring(0, 4);
            const month = dateString.substring(4, 6);
            const day = dateString.substring(6, 8);
            return new Date(year, parseInt(month) - 1, day);
        } else if (dateString.includes('T')) {
            // YYYYMMDDTHHMMSS or YYYYMMDDTHHMMSSZ
            const year = dateString.substring(0, 4);
            const month = dateString.substring(4, 6);
            const day = dateString.substring(6, 8);
            const hour = dateString.substring(9, 11);
            const minute = dateString.substring(11, 13);
            const second = dateString.substring(13, 15);

            if (dateString.endsWith('Z')) {
                return new Date(Date.UTC(
                    parseInt(year), parseInt(month) - 1, parseInt(day),
                    parseInt(hour), parseInt(minute), parseInt(second)
                ));
            } else {
                return new Date(
                    parseInt(year), parseInt(month) - 1, parseInt(day),
                    parseInt(hour), parseInt(minute), parseInt(second)
                );
            }
        }
        return new Date(dateString);
    }

    /**
     * Expand recurring event into occurrences
     * @param {Object} event - Event with recurrence rule
     * @param {Date} rangeStart - Start of expansion range
     * @param {Date} rangeEnd - End of expansion range
     * @param {number} maxOccurrences - Maximum occurrences to generate (default 730 = 2 years daily)
     * @returns {Array} Array of event occurrences
     */
    static expandRecurrence(event, rangeStart, rangeEnd, maxOccurrences = 730) {
        if (!event.recurrence && !event.rrule) {
            return [event];
        }

        const rrule = typeof event.recurrence === 'string'
            ? this.parseRRule(event.recurrence)
            : (event.recurrence || this.parseRRule(event.rrule));

        if (!rrule || !rrule.freq) {
            return [event];
        }

        const occurrences = [];
        const startDate = new Date(event.start);
        const eventDuration = event.end ? new Date(event.end) - startDate : 0;
        const interval = rrule.interval || 1;

        let currentDate = new Date(startDate);
        let count = 0;
        const maxCount = rrule.count || maxOccurrences;

        // Adjust range to include events that might overlap
        const expandedRangeStart = rangeStart ? new Date(rangeStart.getTime() - eventDuration) : null;

        while (count < maxCount) {
            // Check UNTIL constraint
            if (rrule.until && currentDate > rrule.until) {
                break;
            }

            // Check range constraints
            if (rangeEnd && currentDate > rangeEnd) {
                break;
            }

            // Check if in range
            const inRange = !expandedRangeStart || currentDate >= expandedRangeStart;

            if (inRange && this.matchesRule(currentDate, rrule, startDate)) {
                // Create occurrence
                const occurrence = {
                    ...event,
                    start: new Date(currentDate),
                    end: eventDuration ? new Date(currentDate.getTime() + eventDuration) : null,
                    uid: `${event.uid}_${currentDate.getTime()}`,
                    isRecurring: true,
                    recurringEventId: event.uid,
                    recurrenceDate: new Date(currentDate)
                };

                occurrences.push(occurrence);
                count++;
            }

            // Advance to next occurrence
            currentDate = this.getNextOccurrence(currentDate, rrule.freq, interval, rrule);

            // Safety check to prevent infinite loops
            if (occurrences.length > 0 && currentDate.getTime() === occurrences[occurrences.length - 1].start.getTime()) {
                break;
            }
        }

        return occurrences;
    }

    /**
     * Check if date matches recurrence rule constraints
     * @param {Date} date - Date to check
     * @param {Object} rrule - Recurrence rule
     * @param {Date} startDate - Original event start date
     * @returns {boolean} True if matches
     */
    static matchesRule(date, rrule, startDate) {
        // BYMONTH check
        if (rrule.byMonth && rrule.byMonth.length > 0) {
            if (!rrule.byMonth.includes(date.getMonth() + 1)) {
                return false;
            }
        }

        // BYMONTHDAY check
        if (rrule.byMonthDay && rrule.byMonthDay.length > 0) {
            if (!rrule.byMonthDay.includes(date.getDate())) {
                return false;
            }
        }

        // BYDAY check (e.g., MO, TU, WE)
        if (rrule.byDay && rrule.byDay.length > 0) {
            const dayOfWeek = this.getDayOfWeekCode(date.getDay());
            if (!rrule.byDay.includes(dayOfWeek)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get next occurrence date
     * @param {Date} current - Current date
     * @param {string} freq - Frequency (DAILY, WEEKLY, MONTHLY, YEARLY)
     * @param {number} interval - Interval
     * @param {Object} rrule - Full recurrence rule
     * @returns {Date} Next occurrence
     */
    static getNextOccurrence(current, freq, interval, rrule) {
        const next = new Date(current);

        switch (freq) {
            case 'DAILY':
                next.setDate(next.getDate() + interval);
                break;

            case 'WEEKLY':
                next.setDate(next.getDate() + (7 * interval));
                break;

            case 'MONTHLY':
                next.setMonth(next.getMonth() + interval);
                break;

            case 'YEARLY':
                next.setFullYear(next.getFullYear() + interval);
                break;

            default:
                // Default to daily if unknown frequency
                next.setDate(next.getDate() + interval);
        }

        return next;
    }

    /**
     * Get day of week code (MO, TU, WE, TH, FR, SA, SU)
     * @param {number} dayOfWeek - Day of week (0 = Sunday)
     * @returns {string} Day code
     */
    static getDayOfWeekCode(dayOfWeek) {
        const days = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
        return days[dayOfWeek];
    }

    /**
     * Create RRULE string from rule object
     * @param {Object} rule - Recurrence rule object
     * @returns {string} RRULE string
     */
    static formatRRule(rule) {
        const parts = [];

        if (rule.freq) {
            parts.push(`FREQ=${rule.freq.toUpperCase()}`);
        }

        if (rule.count) {
            parts.push(`COUNT=${rule.count}`);
        }

        if (rule.until) {
            const until = this.formatRRuleDate(rule.until);
            parts.push(`UNTIL=${until}`);
        }

        if (rule.interval && rule.interval > 1) {
            parts.push(`INTERVAL=${rule.interval}`);
        }

        if (rule.byDay && rule.byDay.length > 0) {
            parts.push(`BYDAY=${rule.byDay.join(',')}`);
        }

        if (rule.byMonthDay && rule.byMonthDay.length > 0) {
            parts.push(`BYMONTHDAY=${rule.byMonthDay.join(',')}`);
        }

        if (rule.byMonth && rule.byMonth.length > 0) {
            parts.push(`BYMONTH=${rule.byMonth.join(',')}`);
        }

        if (rule.wkst) {
            parts.push(`WKST=${rule.wkst}`);
        }

        return parts.length > 0 ? `RRULE:${parts.join(';')}` : '';
    }

    /**
     * Format date for RRULE
     * @param {Date} date - Date to format
     * @returns {string} Formatted date (YYYYMMDDTHHMMSSZ)
     */
    static formatRRuleDate(date) {
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        const hour = String(date.getUTCHours()).padStart(2, '0');
        const minute = String(date.getUTCMinutes()).padStart(2, '0');
        const second = String(date.getUTCSeconds()).padStart(2, '0');

        return `${year}${month}${day}T${hour}${minute}${second}Z`;
    }

    /**
     * Create simple recurrence rules (helper functions)
     */

    /**
     * Create daily recurrence
     * @param {number} count - Number of occurrences
     * @param {number} interval - Days between occurrences
     * @returns {Object} Recurrence rule
     */
    static daily(count = 10, interval = 1) {
        return { freq: 'DAILY', count, interval };
    }

    /**
     * Create weekly recurrence
     * @param {number} count - Number of occurrences
     * @param {Array<string>} days - Days of week (MO, TU, etc.)
     * @returns {Object} Recurrence rule
     */
    static weekly(count = 10, days = null) {
        const rule = { freq: 'WEEKLY', count };
        if (days) {
            rule.byDay = days;
        }
        return rule;
    }

    /**
     * Create monthly recurrence
     * @param {number} count - Number of occurrences
     * @param {number} dayOfMonth - Day of month (1-31)
     * @returns {Object} Recurrence rule
     */
    static monthly(count = 12, dayOfMonth = null) {
        const rule = { freq: 'MONTHLY', count };
        if (dayOfMonth) {
            rule.byMonthDay = [dayOfMonth];
        }
        return rule;
    }

    /**
     * Create yearly recurrence
     * @param {number} count - Number of occurrences
     * @returns {Object} Recurrence rule
     */
    static yearly(count = 5) {
        return { freq: 'YEARLY', count };
    }
}

// Export for CommonJS and ES modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Recurrence;
}
