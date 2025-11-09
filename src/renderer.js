/**
 * Renderer System
 * Provides customizable templates for rendering calendar components
 */

/**
 * Default template functions
 */
const DefaultTemplates = {
    /**
     * Render a day cell in the month grid
     * @param {Object} data - { date, dayNumber, isCurrentMonth, isToday, events }
     * @returns {string} HTML string
     */
    dayCell: (data) => {
        const { date, dayNumber, isCurrentMonth, isToday, events } = data;
        const classes = [
            'calendar-day',
            isCurrentMonth ? 'current-month' : 'other-month',
            isToday ? 'today' : ''
        ].filter(Boolean).join(' ');

        const eventsHTML = events.map(event => `
            <div class="event-item" style="background-color: ${event.color || 'var(--jscal-color-event)'}">
                ${event.title}
            </div>
        `).join('');

        return `
            <div class="${classes}" data-date="${date.toISOString()}">
                <div class="day-number">${dayNumber}</div>
                <div class="day-events">${eventsHTML}</div>
            </div>
        `;
    },

    /**
     * Render an event item
     * @param {Object} data - { event, viewType }
     * @returns {string} HTML string
     */
    eventItem: (data) => {
        const { event, viewType = 'month' } = data;
        const color = event.color || 'var(--jscal-color-event)';
        const priorityClass = event.priority ? `priority-${event.priority}` : '';
        const statusClass = event.status ? `status-${event.status.toLowerCase()}` : '';

        if (viewType === 'list') {
            return `
                <div class="event-list-item ${priorityClass} ${statusClass}" style="border-left: 4px solid ${color}">
                    <div class="event-time">
                        ${event.isAllDay ? 'All Day' : new Date(event.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                    <div class="event-content">
                        <div class="event-title">${event.title}</div>
                        ${event.location ? `<div class="event-location">${event.location}</div>` : ''}
                        ${event.description ? `<div class="event-description">${event.description}</div>` : ''}
                    </div>
                    ${event.priority ? `<div class="event-priority">!</div>` : ''}
                </div>
            `;
        }

        return `
            <div class="event-item ${priorityClass} ${statusClass}"
                 style="background-color: ${color}"
                 data-uid="${event.uid}"
                 title="${event.title}${event.location ? ' - ' + event.location : ''}">
                ${event.isRecurring ? '🔄 ' : ''}${event.title}
            </div>
        `;
    },

    /**
     * Render calendar header with month/year
     * @param {Object} data - { year, month, monthName }
     * @returns {string} HTML string
     */
    calendarHeader: (data) => {
        const { year, month, monthName } = data;

        return `
            <div class="calendar-header">
                <button class="nav-button prev-month" data-action="prev">‹</button>
                <h2 class="calendar-title">${monthName} ${year}</h2>
                <button class="nav-button next-month" data-action="next">›</button>
            </div>
        `;
    },

    /**
     * Render weekday header row
     * @param {Object} data - { weekdays }
     * @returns {string} HTML string
     */
    weekdayHeader: (data) => {
        const { weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] } = data;

        return `
            <div class="weekday-header">
                ${weekdays.map(day => `<div class="weekday">${day}</div>`).join('')}
            </div>
        `;
    },

    /**
     * Render month grid
     * @param {Object} data - { weeks, renderDay }
     * @returns {string} HTML string
     */
    monthGrid: (data) => {
        const { weeks, renderDay } = data;

        return `
            <div class="calendar-grid">
                ${weeks.map(week => `
                    <div class="calendar-week">
                        ${week.map(day => renderDay(day)).join('')}
                    </div>
                `).join('')}
            </div>
        `;
    },

    /**
     * Render event details popup/modal
     * @param {Object} data - { event }
     * @returns {string} HTML string
     */
    eventDetails: (data) => {
        const { event } = data;

        return `
            <div class="event-details">
                <div class="event-details-header">
                    <h3>${event.title}</h3>
                    <button class="close-button" data-action="close">×</button>
                </div>
                <div class="event-details-body">
                    <div class="detail-row">
                        <span class="detail-label">Start:</span>
                        <span class="detail-value">${new Date(event.start).toLocaleString()}</span>
                    </div>
                    ${event.end ? `
                        <div class="detail-row">
                            <span class="detail-label">End:</span>
                            <span class="detail-value">${new Date(event.end).toLocaleString()}</span>
                        </div>
                    ` : ''}
                    ${event.location ? `
                        <div class="detail-row">
                            <span class="detail-label">Location:</span>
                            <span class="detail-value">${event.location}</span>
                        </div>
                    ` : ''}
                    ${event.description ? `
                        <div class="detail-row">
                            <span class="detail-label">Description:</span>
                            <span class="detail-value">${event.description}</span>
                        </div>
                    ` : ''}
                    ${event.categories && event.categories.length ? `
                        <div class="detail-row">
                            <span class="detail-label">Categories:</span>
                            <span class="detail-value">${event.categories.join(', ')}</span>
                        </div>
                    ` : ''}
                    ${event.priority ? `
                        <div class="detail-row">
                            <span class="detail-label">Priority:</span>
                            <span class="detail-value">${event.priority}</span>
                        </div>
                    ` : ''}
                    ${event.status ? `
                        <div class="detail-row">
                            <span class="detail-label">Status:</span>
                            <span class="detail-value">${event.status}</span>
                        </div>
                    ` : ''}
                    ${event.organizer ? `
                        <div class="detail-row">
                            <span class="detail-label">Organizer:</span>
                            <span class="detail-value">${event.organizer.name || event.organizer.email}</span>
                        </div>
                    ` : ''}
                    ${event.attendees && event.attendees.length ? `
                        <div class="detail-row">
                            <span class="detail-label">Attendees:</span>
                            <span class="detail-value">
                                ${event.attendees.map(a => a.name || a.email).join(', ')}
                            </span>
                        </div>
                    ` : ''}
                    ${event.isRecurring ? `
                        <div class="detail-row">
                            <span class="detail-label">Recurrence:</span>
                            <span class="detail-value">${event.recurrence || event.rrule}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    },

    /**
     * Render week view
     * @param {Object} data - { weekDays, events, hours }
     * @returns {string} HTML string
     */
    weekView: (data) => {
        const { weekDays, events, hours = Array.from({length: 24}, (_, i) => i) } = data;

        return `
            <div class="week-view">
                <div class="week-header">
                    ${weekDays.map(day => `
                        <div class="week-day-header">
                            <div class="week-day-name">${day.dayName}</div>
                            <div class="week-day-date">${day.date}</div>
                        </div>
                    `).join('')}
                </div>
                <div class="week-grid">
                    ${hours.map(hour => `
                        <div class="week-hour" data-hour="${hour}">
                            <div class="hour-label">${hour}:00</div>
                            ${weekDays.map(day => `
                                <div class="hour-cell" data-date="${day.fullDate}" data-hour="${hour}">
                                    ${events.filter(e =>
                                        new Date(e.start).getDate() === day.date &&
                                        new Date(e.start).getHours() === hour
                                    ).map(e => DefaultTemplates.eventItem({event: e, viewType: 'week'})).join('')}
                                </div>
                            `).join('')}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
};

/**
 * Renderer class for managing calendar templates
 */
class Renderer {
    constructor(customTemplates = {}) {
        // Merge custom templates with defaults
        this.templates = {
            ...DefaultTemplates,
            ...customTemplates
        };
    }

    /**
     * Set a custom template
     * @param {string} name - Template name
     * @param {Function} templateFn - Template function
     */
    setTemplate(name, templateFn) {
        if (typeof templateFn !== 'function') {
            throw new Error('Template must be a function');
        }
        this.templates[name] = templateFn;
    }

    /**
     * Get a template
     * @param {string} name - Template name
     * @returns {Function} Template function
     */
    getTemplate(name) {
        return this.templates[name] || DefaultTemplates[name];
    }

    /**
     * Render using a template
     * @param {string} name - Template name
     * @param {Object} data - Data to pass to template
     * @returns {string} Rendered HTML
     */
    render(name, data) {
        const template = this.getTemplate(name);
        if (!template) {
            throw new Error(`Template "${name}" not found`);
        }
        return template(data);
    }

    /**
     * Render a day cell
     * @param {Object} data - Day data
     * @returns {string} HTML string
     */
    renderDayCell(data) {
        return this.render('dayCell', data);
    }

    /**
     * Render an event item
     * @param {Object} event - Event object
     * @param {string} viewType - View type (month, week, day, list)
     * @returns {string} HTML string
     */
    renderEventItem(event, viewType = 'month') {
        return this.render('eventItem', { event, viewType });
    }

    /**
     * Render calendar header
     * @param {number} year - Year
     * @param {number} month - Month (0-11)
     * @returns {string} HTML string
     */
    renderCalendarHeader(year, month) {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return this.render('calendarHeader', {
            year,
            month,
            monthName: monthNames[month]
        });
    }

    /**
     * Render weekday header
     * @param {Array<string>} weekdays - Optional custom weekday names
     * @returns {string} HTML string
     */
    renderWeekdayHeader(weekdays) {
        return this.render('weekdayHeader', { weekdays });
    }

    /**
     * Render month grid
     * @param {Array<Array>} weeks - Grid of weeks/days
     * @returns {string} HTML string
     */
    renderMonthGrid(weeks) {
        const renderDay = (day) => this.renderDayCell(day);
        return this.render('monthGrid', { weeks, renderDay });
    }

    /**
     * Render event details
     * @param {Object} event - Event object
     * @returns {string} HTML string
     */
    renderEventDetails(event) {
        return this.render('eventDetails', { event });
    }

    /**
     * Render week view
     * @param {Array} weekDays - Array of day objects
     * @param {Array} events - Events for the week
     * @returns {string} HTML string
     */
    renderWeekView(weekDays, events) {
        return this.render('weekView', { weekDays, events });
    }

    /**
     * Reset to default templates
     */
    resetTemplates() {
        this.templates = { ...DefaultTemplates };
    }

    /**
     * Reset specific template to default
     * @param {string} name - Template name
     */
    resetTemplate(name) {
        if (DefaultTemplates[name]) {
            this.templates[name] = DefaultTemplates[name];
        }
    }

    /**
     * Get all template names
     * @returns {Array<string>} Template names
     */
    getTemplateNames() {
        return Object.keys(this.templates);
    }

    /**
     * Clone renderer with current templates
     * @returns {Renderer} New renderer instance
     */
    clone() {
        return new Renderer({ ...this.templates });
    }
}

// Export for CommonJS and ES modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Renderer, DefaultTemplates };
}
