/**
 * JSCal - JavaScript Calendar with Theming
 */
class Calendar {
    constructor() {
        // Initialize JSCal library (loaded from UMD bundle)
        this.jscal = new JSCal();

        this.currentDate = new Date();
        this.selectedDate = null;

        // Set default theme if available
        if (JSCal.Themes && JSCal.Themes.default) {
            this.jscal.setTheme(JSCal.Themes.default);
        }

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.applyCurrentTheme();
        this.render();
    }

    setupEventListeners() {
        // Navigation buttons
        const prevMonth = document.getElementById('prevMonth');
        const nextMonth = document.getElementById('nextMonth');

        if (prevMonth) {
            prevMonth.addEventListener('click', () => {
                this.currentDate.setMonth(this.currentDate.getMonth() - 1);
                this.render();
            });
        }

        if (nextMonth) {
            nextMonth.addEventListener('click', () => {
                this.currentDate.setMonth(this.currentDate.getMonth() + 1);
                this.render();
            });
        }

        // File loading buttons
        const loadJson = document.getElementById('loadJson');
        const loadIcs = document.getElementById('loadIcs');
        const fileInput = document.getElementById('fileInput');

        if (loadJson && fileInput) {
            loadJson.addEventListener('click', () => {
                fileInput.accept = '.json';
                fileInput.onchange = (e) => this.loadJsonFile(e.target.files[0]);
                fileInput.click();
            });
        }

        if (loadIcs && fileInput) {
            loadIcs.addEventListener('click', () => {
                fileInput.accept = '.ics';
                fileInput.onchange = (e) => this.loadIcsFile(e.target.files[0]);
                fileInput.click();
            });
        }

        // Theme selector
        const themeSelector = document.getElementById('themeSelector');
        if (themeSelector) {
            themeSelector.addEventListener('change', (e) => {
                this.switchTheme(e.target.value);
            });
        }

        // Mini calendar navigation
        const miniPrevBtn = document.getElementById('miniPrevMonth');
        const miniNextBtn = document.getElementById('miniNextMonth');

        if (miniPrevBtn) {
            miniPrevBtn.addEventListener('click', () => {
                this.currentDate.setMonth(this.currentDate.getMonth() - 1);
                this.render();
            });
        }

        if (miniNextBtn) {
            miniNextBtn.addEventListener('click', () => {
                this.currentDate.setMonth(this.currentDate.getMonth() + 1);
                this.render();
            });
        }
    }

    /**
     * Apply current theme to calendar container
     */
    applyCurrentTheme() {
        const container = document.querySelector('.container');
        if (container && this.jscal.getTheme()) {
            this.jscal.applyTheme(container);
        }
    }

    /**
     * Switch to a different theme
     */
    switchTheme(themeName) {
        if (JSCal.Themes && JSCal.Themes[themeName]) {
            this.jscal.setTheme(JSCal.Themes[themeName]);
            this.applyCurrentTheme();
            console.log(`Switched to ${themeName} theme`);
        }
    }

    /**
     * Load events from JSON file
     */
    async loadJsonFile(file) {
        if (!file) return;

        try {
            const text = await file.text();
            this.jscal.loadJSON(text);
            this.render();
            this.showMessage(`Loaded ${this.jscal.getEventCount()} events from JSON`);
        } catch (error) {
            console.error('Error loading JSON:', error);
            this.showMessage('Error loading JSON file', 'error');
        }
    }

    /**
     * Load events from ICS file
     */
    async loadIcsFile(file) {
        if (!file) return;

        try {
            const text = await file.text();
            this.jscal.loadICS(text);
            this.render();
            this.showMessage(`Loaded ${this.jscal.getEventCount()} events from ICS`);
        } catch (error) {
            console.error('Error loading ICS:', error);
            this.showMessage('Error loading ICS file', 'error');
        }
    }

    /**
     * Load events from ICS URL
     */
    async loadIcsFromURL(url) {
        try {
            await this.jscal.loadICSFromURL(url);
            this.render();
            this.showMessage(`Loaded ${this.jscal.getEventCount()} events from URL`);
        } catch (error) {
            console.error('Error loading ICS from URL:', error);
            this.showMessage('Error loading ICS from URL', 'error');
        }
    }

    /**
     * Render the calendar
     */
    render() {
        this.renderMiniCalendar();
        this.renderHeader();
        this.renderCalendar();
        this.renderEventList();
    }

    /**
     * Render mini calendar navigator
     */
    renderMiniCalendar() {
        const miniCalendar = document.getElementById('miniCalendar');
        const miniMonthYear = document.getElementById('miniMonthYear');

        if (!miniCalendar || !miniMonthYear) {
            return;
        }

        const months = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];

        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();

        // Update header
        miniMonthYear.textContent = `${months[month]} ${year}`;

        // Clear calendar
        miniCalendar.innerHTML = '';

        // Add day headers (single letter)
        const dayHeaders = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        dayHeaders.forEach(day => {
            const header = document.createElement('div');
            header.className = 'mini-day-header';
            header.textContent = day;
            miniCalendar.appendChild(header);
        });

        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();

        // Add empty cells for days before month starts
        for (let i = 0; i < firstDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'mini-day-cell empty';
            miniCalendar.appendChild(emptyCell);
        }

        // Add day cells
        for (let day = 1; day <= daysInMonth; day++) {
            const dayCell = document.createElement('div');
            dayCell.className = 'mini-day-cell';
            dayCell.textContent = day;

            const date = new Date(year, month, day);

            // Highlight today
            if (date.toDateString() === today.toDateString()) {
                dayCell.classList.add('today');
            }

            // Highlight if selected
            if (this.selectedDate && date.toDateString() === this.selectedDate.toDateString()) {
                dayCell.classList.add('selected');
            }

            // Highlight if has events
            const dayEvents = this.getEventsForDate(date);
            if (dayEvents.length > 0) {
                dayCell.classList.add('has-events');
            }

            // Click handler
            dayCell.addEventListener('click', () => {
                this.selectedDate = date;
                this.renderMiniCalendar();
                this.renderEventList();

                // Also update main calendar if different month
                if (date.getMonth() !== this.currentDate.getMonth() ||
                    date.getFullYear() !== this.currentDate.getFullYear()) {
                    this.currentDate = new Date(date);
                    this.renderHeader();
                    this.renderCalendar();
                }
            });

            miniCalendar.appendChild(dayCell);
        }
    }

    renderHeader() {
        const monthYear = document.getElementById('monthYear');
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];

        const currentMonth = this.currentDate.getMonth();
        const currentYear = this.currentDate.getFullYear();

        // Create clickable month text
        const monthText = document.createElement('span');
        monthText.className = 'month-text clickable';
        monthText.textContent = months[currentMonth];
        monthText.addEventListener('click', () => this.showMonthPicker());

        // Create clickable year text
        const yearText = document.createElement('span');
        yearText.className = 'year-text clickable';
        yearText.textContent = currentYear;
        yearText.addEventListener('click', () => this.showYearPicker());

        // Clear and rebuild the container
        monthYear.innerHTML = '';
        monthYear.appendChild(monthText);
        monthYear.appendChild(yearText);
    }

    /**
     * Show month picker popup
     */
    showMonthPicker() {
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];

        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'picker-overlay';
        overlay.id = 'monthPickerOverlay';

        // Create popup
        const popup = document.createElement('div');
        popup.className = 'picker-popup';

        // Header
        const header = document.createElement('div');
        header.className = 'picker-header';
        header.innerHTML = '<h3>Select Month</h3>';
        popup.appendChild(header);

        // Month grid
        const grid = document.createElement('div');
        grid.className = 'month-grid';

        months.forEach((month, index) => {
            const monthItem = document.createElement('div');
            monthItem.className = 'month-item';
            if (index === this.currentDate.getMonth()) {
                monthItem.classList.add('selected');
            }
            monthItem.textContent = month;
            monthItem.addEventListener('click', () => {
                this.currentDate.setMonth(index);
                this.render();
                overlay.remove();
            });
            grid.appendChild(monthItem);
        });

        popup.appendChild(grid);
        overlay.appendChild(popup);
        document.body.appendChild(overlay);

        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });
    }

    /**
     * Show year picker popup
     */
    showYearPicker() {
        const currentYear = this.currentDate.getFullYear();

        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'picker-overlay';
        overlay.id = 'yearPickerOverlay';

        // Create popup
        const popup = document.createElement('div');
        popup.className = 'picker-popup year-picker';

        // Header with navigation
        const header = document.createElement('div');
        header.className = 'picker-header';

        const startDecade = Math.floor(currentYear / 10) * 10;
        const endDecade = startDecade + 9;

        header.innerHTML = `
            <button class="decade-nav" id="prevDecade">‹</button>
            <h3>${startDecade} - ${endDecade}</h3>
            <button class="decade-nav" id="nextDecade">›</button>
        `;
        popup.appendChild(header);

        // Year grid
        const grid = document.createElement('div');
        grid.className = 'year-grid';
        grid.id = 'yearGrid';

        const renderYears = (baseYear) => {
            grid.innerHTML = '';
            const start = Math.floor(baseYear / 10) * 10;

            // Update header
            header.querySelector('h3').textContent = `${start} - ${start + 9}`;

            for (let year = start - 1; year <= start + 10; year++) {
                const yearItem = document.createElement('div');
                yearItem.className = 'year-item';
                if (year < start || year > start + 9) {
                    yearItem.classList.add('out-of-range');
                }
                if (year === currentYear) {
                    yearItem.classList.add('selected');
                }
                yearItem.textContent = year;
                yearItem.addEventListener('click', () => {
                    this.currentDate.setFullYear(year);
                    this.render();
                    overlay.remove();
                });
                grid.appendChild(yearItem);
            }
        };

        renderYears(currentYear);
        popup.appendChild(grid);

        // Add navigation listeners
        header.querySelector('#prevDecade').addEventListener('click', () => {
            const newBase = parseInt(header.querySelector('h3').textContent.split(' - ')[0]) - 10;
            renderYears(newBase);
        });

        header.querySelector('#nextDecade').addEventListener('click', () => {
            const newBase = parseInt(header.querySelector('h3').textContent.split(' - ')[0]) + 10;
            renderYears(newBase);
        });

        overlay.appendChild(popup);
        document.body.appendChild(overlay);

        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });
    }

    renderCalendar() {
        const calendar = document.getElementById('calendar');
        calendar.innerHTML = '';

        // Add day headers
        const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayHeaders.forEach(day => {
            const header = document.createElement('div');
            header.className = 'day-header';
            header.textContent = day;
            calendar.appendChild(header);
        });

        // Get first day of month and number of days
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Add empty cells for days before month starts
        for (let i = 0; i < firstDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'day-cell empty';
            calendar.appendChild(emptyCell);
        }

        // Add day cells
        for (let day = 1; day <= daysInMonth; day++) {
            const dayCell = document.createElement('div');
            dayCell.className = 'day-cell';

            const date = new Date(year, month, day);
            const today = new Date();

            // Highlight today
            if (date.toDateString() === today.toDateString()) {
                dayCell.classList.add('today');
            }

            // Add day number
            const dayNumber = document.createElement('div');
            dayNumber.className = 'day-number';
            dayNumber.textContent = day;
            dayCell.appendChild(dayNumber);

            // Check for events on this day
            const dayEvents = this.getEventsForDate(date);
            if (dayEvents.length > 0) {
                dayCell.classList.add('has-events');

                // Create container for events
                const eventsContainer = document.createElement('div');
                eventsContainer.className = 'day-events';

                // Show first 3 events, then "+N more" if there are more
                const maxVisible = 3;
                const visibleEvents = dayEvents.slice(0, maxVisible);

                visibleEvents.forEach(event => {
                    const eventItem = document.createElement('div');
                    eventItem.className = 'mini-event';
                    eventItem.textContent = event.title;

                    // Apply event color if available
                    if (event.color) {
                        eventItem.style.borderLeftColor = event.color;
                    }

                    // Add click handler to show event details
                    eventItem.addEventListener('click', (e) => {
                        e.stopPropagation(); // Prevent day cell click
                        this.showEventPopup(event);
                    });

                    eventsContainer.appendChild(eventItem);
                });

                // Show "+N more" if there are more events
                if (dayEvents.length > maxVisible) {
                    const moreIndicator = document.createElement('div');
                    moreIndicator.className = 'more-events';
                    moreIndicator.textContent = `+${dayEvents.length - maxVisible} more`;
                    eventsContainer.appendChild(moreIndicator);
                }

                dayCell.appendChild(eventsContainer);
            }

            // Click handler
            dayCell.addEventListener('click', () => {
                // In clean view, always select the date and show events
                // In detailed view, only select if there are no event badges clicked
                this.selectDate(date);

                // Add visual selection
                document.querySelectorAll('.day-cell').forEach(cell => {
                    cell.classList.remove('selected');
                });
                dayCell.classList.add('selected');
            });

            calendar.appendChild(dayCell);
        }
    }

    /**
     * Get events for a specific date
     */
    getEventsForDate(date) {
        return this.jscal.getEventsForDate(date);
    }

    /**
     * Select a date and show its events
     */
    selectDate(date) {
        this.selectedDate = date;
        this.renderEventList();
    }

    /**
     * Render event list
     */
    renderEventList() {
        const eventList = document.getElementById('eventList');

        let eventsToShow = this.selectedDate ?
            this.getEventsForDate(this.selectedDate) :
            this.jscal.getAllEvents();

        // Show selected date header
        const eventListContainer = eventList.parentElement;
        const existingHeader = eventListContainer.querySelector('h3');
        if (this.selectedDate) {
            existingHeader.textContent = `Events - ${this.selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
        } else {
            existingHeader.textContent = 'All Events';
        }

        if (eventsToShow.length === 0) {
            eventList.innerHTML = '<p class="no-events">No events to display</p>';
            return;
        }

        // Sort events by start date
        eventsToShow.sort((a, b) => new Date(a.start) - new Date(b.start));

        eventList.innerHTML = eventsToShow.map(event => `
            <div class="event-item" style="${event.color ? 'border-left: 4px solid ' + event.color : ''}">
                <div class="event-title">${this.escapeHtml(event.title)}</div>
                <div class="event-time">
                    ${this.formatDateTime(event.start)}
                    ${event.end ? ' - ' + this.formatDateTime(event.end) : ''}
                </div>
                ${event.location ? `<div class="event-location">📍 ${this.escapeHtml(event.location)}</div>` : ''}
                ${event.description ? `<div class="event-description">${this.escapeHtml(event.description)}</div>` : ''}
                ${event.categories && event.categories.length ? `<div class="event-categories">${event.categories.join(', ')}</div>` : ''}
            </div>
        `).join('');
    }

    /**
     * Format date/time for display
     */
    formatDateTime(date) {
        const d = new Date(date);
        return d.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Show a message to the user
     */
    showMessage(message, type = 'success') {
        // Simple alert for now - could be enhanced with a toast notification
        console.log(`[${type.toUpperCase()}] ${message}`);
        alert(message);
    }

    /**
     * Show event details popup
     */
    showEventPopup(event) {
        // Remove existing popup if any
        this.closeEventPopup();

        // Create popup overlay
        const overlay = document.createElement('div');
        overlay.className = 'event-popup-overlay';
        overlay.id = 'eventPopup';

        // Create popup content
        const popup = document.createElement('div');
        popup.className = 'event-popup';

        // Build popup HTML
        popup.innerHTML = `
            <div class="event-popup-header">
                <h3>${this.escapeHtml(event.title)}</h3>
                <button class="popup-close" id="closePopup">&times;</button>
            </div>
            <div class="event-popup-body">
                <div class="popup-detail">
                    <span class="popup-label">⏰ Time:</span>
                    <span class="popup-value">
                        ${event.isAllDay ? 'All Day' : this.formatDateTime(event.start)}
                        ${event.end && !event.isAllDay ? ' - ' + this.formatDateTime(event.end) : ''}
                    </span>
                </div>
                ${event.location ? `
                    <div class="popup-detail">
                        <span class="popup-label">📍 Location:</span>
                        <span class="popup-value">${this.escapeHtml(event.location)}</span>
                    </div>
                ` : ''}
                ${event.description ? `
                    <div class="popup-detail">
                        <span class="popup-label">📝 Description:</span>
                        <span class="popup-value">${this.escapeHtml(event.description)}</span>
                    </div>
                ` : ''}
                ${event.categories && event.categories.length ? `
                    <div class="popup-detail">
                        <span class="popup-label">🏷️ Categories:</span>
                        <span class="popup-value">${event.categories.map(c => this.escapeHtml(c)).join(', ')}</span>
                    </div>
                ` : ''}
                ${event.priority ? `
                    <div class="popup-detail">
                        <span class="popup-label">⚡ Priority:</span>
                        <span class="popup-value">${event.priority}</span>
                    </div>
                ` : ''}
                ${event.status ? `
                    <div class="popup-detail">
                        <span class="popup-label">✓ Status:</span>
                        <span class="popup-value">${event.status}</span>
                    </div>
                ` : ''}
                ${event.organizer ? `
                    <div class="popup-detail">
                        <span class="popup-label">👤 Organizer:</span>
                        <span class="popup-value">${event.organizer.name || event.organizer.email}</span>
                    </div>
                ` : ''}
                ${event.attendees && event.attendees.length ? `
                    <div class="popup-detail">
                        <span class="popup-label">👥 Attendees:</span>
                        <span class="popup-value">${event.attendees.map(a => a.name || a.email).join(', ')}</span>
                    </div>
                ` : ''}
                ${event.isRecurring ? `
                    <div class="popup-detail">
                        <span class="popup-label">🔄 Recurring:</span>
                        <span class="popup-value">${event.recurrence || 'Yes'}</span>
                    </div>
                ` : ''}
            </div>
        `;

        overlay.appendChild(popup);
        document.body.appendChild(overlay);

        // Add event listeners
        document.getElementById('closePopup').addEventListener('click', () => this.closeEventPopup());
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.closeEventPopup();
            }
        });

        // Close on Escape key
        this.popupKeyHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeEventPopup();
            }
        };
        document.addEventListener('keydown', this.popupKeyHandler);
    }

    /**
     * Close event popup
     */
    closeEventPopup() {
        const popup = document.getElementById('eventPopup');
        if (popup) {
            popup.remove();
        }
        if (this.popupKeyHandler) {
            document.removeEventListener('keydown', this.popupKeyHandler);
            this.popupKeyHandler = null;
        }
    }
}

// Initialize calendar when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.calendar = new Calendar();
});
