/**
 * Holiday Support
 * Built-in holiday calendars for different countries
 */

class Holidays {
    /**
     * Get holidays for a specific year and country
     * @param {number} year - Year to get holidays for
     * @param {string} country - Country code (US, UK, FR, etc.)
     * @returns {Array} Array of holiday events
     */
    static getHolidays(year, country = 'US') {
        const countryCode = country.toUpperCase();

        switch (countryCode) {
            case 'US':
                return this.getUSHolidays(year);
            case 'UK':
            case 'GB':
                return this.getUKHolidays(year);
            case 'FR':
                return this.getFranceHolidays(year);
            case 'CA':
                return this.getCanadaHolidays(year);
            default:
                return this.getUSHolidays(year);
        }
    }

    /**
     * US Federal Holidays
     */
    static getUSHolidays(year) {
        return [
            {
                title: "New Year's Day",
                start: new Date(year, 0, 1),
                end: new Date(year, 0, 1),
                isAllDay: true,
                categories: ['Holiday', 'US'],
                color: '#ff6b6b',
                description: 'Federal Holiday'
            },
            {
                title: "Martin Luther King Jr. Day",
                start: this.getNthWeekdayOfMonth(year, 0, 1, 3), // 3rd Monday of January
                end: this.getNthWeekdayOfMonth(year, 0, 1, 3),
                isAllDay: true,
                categories: ['Holiday', 'US'],
                color: '#ff6b6b',
                description: 'Federal Holiday'
            },
            {
                title: "Presidents' Day",
                start: this.getNthWeekdayOfMonth(year, 1, 1, 3), // 3rd Monday of February
                end: this.getNthWeekdayOfMonth(year, 1, 1, 3),
                isAllDay: true,
                categories: ['Holiday', 'US'],
                color: '#ff6b6b',
                description: 'Federal Holiday'
            },
            {
                title: "Memorial Day",
                start: this.getLastWeekdayOfMonth(year, 4, 1), // Last Monday of May
                end: this.getLastWeekdayOfMonth(year, 4, 1),
                isAllDay: true,
                categories: ['Holiday', 'US'],
                color: '#ff6b6b',
                description: 'Federal Holiday'
            },
            {
                title: "Independence Day",
                start: new Date(year, 6, 4),
                end: new Date(year, 6, 4),
                isAllDay: true,
                categories: ['Holiday', 'US'],
                color: '#ff6b6b',
                description: 'Federal Holiday'
            },
            {
                title: "Labor Day",
                start: this.getNthWeekdayOfMonth(year, 8, 1, 1), // 1st Monday of September
                end: this.getNthWeekdayOfMonth(year, 8, 1, 1),
                isAllDay: true,
                categories: ['Holiday', 'US'],
                color: '#ff6b6b',
                description: 'Federal Holiday'
            },
            {
                title: "Columbus Day",
                start: this.getNthWeekdayOfMonth(year, 9, 1, 2), // 2nd Monday of October
                end: this.getNthWeekdayOfMonth(year, 9, 1, 2),
                isAllDay: true,
                categories: ['Holiday', 'US'],
                color: '#ff6b6b',
                description: 'Federal Holiday'
            },
            {
                title: "Veterans Day",
                start: new Date(year, 10, 11),
                end: new Date(year, 10, 11),
                isAllDay: true,
                categories: ['Holiday', 'US'],
                color: '#ff6b6b',
                description: 'Federal Holiday'
            },
            {
                title: "Thanksgiving Day",
                start: this.getNthWeekdayOfMonth(year, 10, 4, 4), // 4th Thursday of November
                end: this.getNthWeekdayOfMonth(year, 10, 4, 4),
                isAllDay: true,
                categories: ['Holiday', 'US'],
                color: '#ff6b6b',
                description: 'Federal Holiday'
            },
            {
                title: "Christmas Day",
                start: new Date(year, 11, 25),
                end: new Date(year, 11, 25),
                isAllDay: true,
                categories: ['Holiday', 'US'],
                color: '#ff6b6b',
                description: 'Federal Holiday'
            }
        ];
    }

    /**
     * UK Bank Holidays
     */
    static getUKHolidays(year) {
        return [
            {
                title: "New Year's Day",
                start: new Date(year, 0, 1),
                end: new Date(year, 0, 1),
                isAllDay: true,
                categories: ['Holiday', 'UK'],
                color: '#4ecdc4',
                description: 'Bank Holiday'
            },
            {
                title: "Good Friday",
                start: this.getEaster(year, -2),
                end: this.getEaster(year, -2),
                isAllDay: true,
                categories: ['Holiday', 'UK'],
                color: '#4ecdc4',
                description: 'Bank Holiday'
            },
            {
                title: "Easter Monday",
                start: this.getEaster(year, 1),
                end: this.getEaster(year, 1),
                isAllDay: true,
                categories: ['Holiday', 'UK'],
                color: '#4ecdc4',
                description: 'Bank Holiday'
            },
            {
                title: "Early May Bank Holiday",
                start: this.getNthWeekdayOfMonth(year, 4, 1, 1), // 1st Monday of May
                end: this.getNthWeekdayOfMonth(year, 4, 1, 1),
                isAllDay: true,
                categories: ['Holiday', 'UK'],
                color: '#4ecdc4',
                description: 'Bank Holiday'
            },
            {
                title: "Spring Bank Holiday",
                start: this.getLastWeekdayOfMonth(year, 4, 1), // Last Monday of May
                end: this.getLastWeekdayOfMonth(year, 4, 1),
                isAllDay: true,
                categories: ['Holiday', 'UK'],
                color: '#4ecdc4',
                description: 'Bank Holiday'
            },
            {
                title: "Summer Bank Holiday",
                start: this.getLastWeekdayOfMonth(year, 7, 1), // Last Monday of August
                end: this.getLastWeekdayOfMonth(year, 7, 1),
                isAllDay: true,
                categories: ['Holiday', 'UK'],
                color: '#4ecdc4',
                description: 'Bank Holiday'
            },
            {
                title: "Christmas Day",
                start: new Date(year, 11, 25),
                end: new Date(year, 11, 25),
                isAllDay: true,
                categories: ['Holiday', 'UK'],
                color: '#4ecdc4',
                description: 'Bank Holiday'
            },
            {
                title: "Boxing Day",
                start: new Date(year, 11, 26),
                end: new Date(year, 11, 26),
                isAllDay: true,
                categories: ['Holiday', 'UK'],
                color: '#4ecdc4',
                description: 'Bank Holiday'
            }
        ];
    }

    /**
     * France Public Holidays
     */
    static getFranceHolidays(year) {
        return [
            {
                title: "New Year's Day",
                start: new Date(year, 0, 1),
                end: new Date(year, 0, 1),
                isAllDay: true,
                categories: ['Holiday', 'FR'],
                color: '#95e1d3',
                description: 'Public Holiday'
            },
            {
                title: "Easter Monday",
                start: this.getEaster(year, 1),
                end: this.getEaster(year, 1),
                isAllDay: true,
                categories: ['Holiday', 'FR'],
                color: '#95e1d3',
                description: 'Public Holiday'
            },
            {
                title: "Labour Day",
                start: new Date(year, 4, 1),
                end: new Date(year, 4, 1),
                isAllDay: true,
                categories: ['Holiday', 'FR'],
                color: '#95e1d3',
                description: 'Public Holiday'
            },
            {
                title: "Victory in Europe Day",
                start: new Date(year, 4, 8),
                end: new Date(year, 4, 8),
                isAllDay: true,
                categories: ['Holiday', 'FR'],
                color: '#95e1d3',
                description: 'Public Holiday'
            },
            {
                title: "Bastille Day",
                start: new Date(year, 6, 14),
                end: new Date(year, 6, 14),
                isAllDay: true,
                categories: ['Holiday', 'FR'],
                color: '#95e1d3',
                description: 'Public Holiday'
            },
            {
                title: "Assumption of Mary",
                start: new Date(year, 7, 15),
                end: new Date(year, 7, 15),
                isAllDay: true,
                categories: ['Holiday', 'FR'],
                color: '#95e1d3',
                description: 'Public Holiday'
            },
            {
                title: "All Saints' Day",
                start: new Date(year, 10, 1),
                end: new Date(year, 10, 1),
                isAllDay: true,
                categories: ['Holiday', 'FR'],
                color: '#95e1d3',
                description: 'Public Holiday'
            },
            {
                title: "Armistice Day",
                start: new Date(year, 10, 11),
                end: new Date(year, 10, 11),
                isAllDay: true,
                categories: ['Holiday', 'FR'],
                color: '#95e1d3',
                description: 'Public Holiday'
            },
            {
                title: "Christmas Day",
                start: new Date(year, 11, 25),
                end: new Date(year, 11, 25),
                isAllDay: true,
                categories: ['Holiday', 'FR'],
                color: '#95e1d3',
                description: 'Public Holiday'
            }
        ];
    }

    /**
     * Canada Federal Holidays
     */
    static getCanadaHolidays(year) {
        return [
            {
                title: "New Year's Day",
                start: new Date(year, 0, 1),
                end: new Date(year, 0, 1),
                isAllDay: true,
                categories: ['Holiday', 'CA'],
                color: '#f38181',
                description: 'Federal Holiday'
            },
            {
                title: "Good Friday",
                start: this.getEaster(year, -2),
                end: this.getEaster(year, -2),
                isAllDay: true,
                categories: ['Holiday', 'CA'],
                color: '#f38181',
                description: 'Federal Holiday'
            },
            {
                title: "Victoria Day",
                start: this.getVictoriaDay(year),
                end: this.getVictoriaDay(year),
                isAllDay: true,
                categories: ['Holiday', 'CA'],
                color: '#f38181',
                description: 'Federal Holiday'
            },
            {
                title: "Canada Day",
                start: new Date(year, 6, 1),
                end: new Date(year, 6, 1),
                isAllDay: true,
                categories: ['Holiday', 'CA'],
                color: '#f38181',
                description: 'Federal Holiday'
            },
            {
                title: "Labour Day",
                start: this.getNthWeekdayOfMonth(year, 8, 1, 1), // 1st Monday of September
                end: this.getNthWeekdayOfMonth(year, 8, 1, 1),
                isAllDay: true,
                categories: ['Holiday', 'CA'],
                color: '#f38181',
                description: 'Federal Holiday'
            },
            {
                title: "Thanksgiving",
                start: this.getNthWeekdayOfMonth(year, 9, 1, 2), // 2nd Monday of October
                end: this.getNthWeekdayOfMonth(year, 9, 1, 2),
                isAllDay: true,
                categories: ['Holiday', 'CA'],
                color: '#f38181',
                description: 'Federal Holiday'
            },
            {
                title: "Remembrance Day",
                start: new Date(year, 10, 11),
                end: new Date(year, 10, 11),
                isAllDay: true,
                categories: ['Holiday', 'CA'],
                color: '#f38181',
                description: 'Federal Holiday'
            },
            {
                title: "Christmas Day",
                start: new Date(year, 11, 25),
                end: new Date(year, 11, 25),
                isAllDay: true,
                categories: ['Holiday', 'CA'],
                color: '#f38181',
                description: 'Federal Holiday'
            },
            {
                title: "Boxing Day",
                start: new Date(year, 11, 26),
                end: new Date(year, 11, 26),
                isAllDay: true,
                categories: ['Holiday', 'CA'],
                color: '#f38181',
                description: 'Federal Holiday'
            }
        ];
    }

    /**
     * Calculate Easter Sunday using Computus algorithm
     * @param {number} year - Year
     * @param {number} offset - Days offset from Easter (0 for Easter, -2 for Good Friday, 1 for Easter Monday)
     * @returns {Date} Easter date
     */
    static getEaster(year, offset = 0) {
        const a = year % 19;
        const b = Math.floor(year / 100);
        const c = year % 100;
        const d = Math.floor(b / 4);
        const e = b % 4;
        const f = Math.floor((b + 8) / 25);
        const g = Math.floor((b - f + 1) / 3);
        const h = (19 * a + b - d - g + 15) % 30;
        const i = Math.floor(c / 4);
        const k = c % 4;
        const l = (32 + 2 * e + 2 * i - h - k) % 7;
        const m = Math.floor((a + 11 * h + 22 * l) / 451);
        const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
        const day = ((h + l - 7 * m + 114) % 31) + 1;

        const easter = new Date(year, month, day);
        easter.setDate(easter.getDate() + offset);
        return easter;
    }

    /**
     * Get nth weekday of month
     * @param {number} year - Year
     * @param {number} month - Month (0-11)
     * @param {number} weekday - Weekday (0=Sunday, 1=Monday, ...)
     * @param {number} n - Which occurrence (1=first, 2=second, etc.)
     * @returns {Date} Date of nth weekday
     */
    static getNthWeekdayOfMonth(year, month, weekday, n) {
        const firstDay = new Date(year, month, 1);
        const firstWeekday = firstDay.getDay();
        let day = 1 + (weekday - firstWeekday + 7) % 7;
        day += (n - 1) * 7;
        return new Date(year, month, day);
    }

    /**
     * Get last weekday of month
     * @param {number} year - Year
     * @param {number} month - Month (0-11)
     * @param {number} weekday - Weekday (0=Sunday, 1=Monday, ...)
     * @returns {Date} Date of last occurrence of weekday
     */
    static getLastWeekdayOfMonth(year, month, weekday) {
        const lastDay = new Date(year, month + 1, 0);
        const lastWeekday = lastDay.getDay();
        const diff = (lastWeekday - weekday + 7) % 7;
        return new Date(year, month, lastDay.getDate() - diff);
    }

    /**
     * Victoria Day (Canada) - Monday before May 25
     */
    static getVictoriaDay(year) {
        const may24 = new Date(year, 4, 24);
        const day = may24.getDay();
        const daysToMonday = (day + 6) % 7;
        return new Date(year, 4, 24 - daysToMonday);
    }
}

// Export for CommonJS and ES modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Holidays;
}
