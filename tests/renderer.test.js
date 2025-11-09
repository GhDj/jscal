/**
 * Renderer System Tests
 */

const { Renderer, DefaultTemplates } = require('../src/renderer');

describe('Renderer Class', () => {
    let renderer;

    beforeEach(() => {
        renderer = new Renderer();
    });

    test('should create renderer with default templates', () => {
        expect(renderer).toBeInstanceOf(Renderer);
        expect(renderer.templates).toBeDefined();
        expect(renderer.templates.dayCell).toBeDefined();
        expect(renderer.templates.eventItem).toBeDefined();
    });

    test('should create renderer with custom templates', () => {
        const customTemplate = (data) => `<div>${data.content}</div>`;
        const customRenderer = new Renderer({
            custom: customTemplate
        });

        expect(customRenderer.templates.custom).toBe(customTemplate);
        expect(customRenderer.templates.dayCell).toBeDefined(); // Still has defaults
    });

    test('should set custom template', () => {
        const myTemplate = (data) => `<p>${data.text}</p>`;
        renderer.setTemplate('myTemplate', myTemplate);

        expect(renderer.templates.myTemplate).toBe(myTemplate);
    });

    test('should throw error when setting non-function template', () => {
        expect(() => {
            renderer.setTemplate('invalid', 'not a function');
        }).toThrow('Template must be a function');
    });

    test('should get template', () => {
        const template = renderer.getTemplate('dayCell');
        expect(typeof template).toBe('function');
    });

    test('should render using template', () => {
        const customTemplate = (data) => `<div class="custom">${data.message}</div>`;
        renderer.setTemplate('customTemplate', customTemplate);

        const result = renderer.render('customTemplate', { message: 'Hello' });

        expect(result).toContain('Hello');
        expect(result).toContain('class="custom"');
    });

    test('should throw error when rendering non-existent template', () => {
        expect(() => {
            renderer.render('nonExistent', {});
        }).toThrow('Template "nonExistent" not found');
    });

    test('should render day cell', () => {
        const date = new Date('2025-11-05');
        const result = renderer.renderDayCell({
            date,
            dayNumber: 5,
            isCurrentMonth: true,
            isToday: true,
            events: [{ title: 'Meeting', color: '#ff0000' }]
        });

        expect(result).toContain('calendar-day');
        expect(result).toContain('current-month');
        expect(result).toContain('today');
        expect(result).toContain('5');
        expect(result).toContain('Meeting');
    });

    test('should render event item for month view', () => {
        const event = {
            uid: 'test-123',
            title: 'Team Meeting',
            start: new Date('2025-11-05T10:00:00'),
            location: 'Conference Room',
            color: '#667eea'
        };

        const result = renderer.renderEventItem(event, 'month');

        expect(result).toContain('event-item');
        expect(result).toContain('Team Meeting');
        expect(result).toContain('#667eea');
        expect(result).toContain('test-123');
    });

    test('should render event item for list view', () => {
        const event = {
            title: 'Team Meeting',
            start: new Date('2025-11-05T10:00:00'),
            location: 'Conference Room',
            description: 'Quarterly planning',
            priority: 1,
            isAllDay: false
        };

        const result = renderer.renderEventItem(event, 'list');

        expect(result).toContain('event-list-item');
        expect(result).toContain('Team Meeting');
        expect(result).toContain('Conference Room');
        expect(result).toContain('Quarterly planning');
        expect(result).toContain('priority-1');
    });

    test('should render calendar header', () => {
        const result = renderer.renderCalendarHeader(2025, 10);

        expect(result).toContain('calendar-header');
        expect(result).toContain('November 2025');
        expect(result).toContain('prev-month');
        expect(result).toContain('next-month');
    });

    test('should render weekday header', () => {
        const result = renderer.renderWeekdayHeader();

        expect(result).toContain('weekday-header');
        expect(result).toContain('Sun');
        expect(result).toContain('Mon');
        expect(result).toContain('Sat');
    });

    test('should render custom weekday header', () => {
        const customDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        const result = renderer.renderWeekdayHeader(customDays);

        expect(result).toContain('S');
        expect(result).toContain('M');
        expect(result).not.toContain('Sun');
    });

    test('should render month grid', () => {
        const weeks = [
            [
                { date: new Date('2025-11-01'), dayNumber: 1, isCurrentMonth: true, isToday: false, events: [] },
                { date: new Date('2025-11-02'), dayNumber: 2, isCurrentMonth: true, isToday: false, events: [] }
            ]
        ];

        const result = renderer.renderMonthGrid(weeks);

        expect(result).toContain('calendar-grid');
        expect(result).toContain('calendar-week');
        expect(result).toContain('calendar-day');
    });

    test('should render event details', () => {
        const event = {
            title: 'Important Meeting',
            start: new Date('2025-11-05T10:00:00'),
            end: new Date('2025-11-05T11:00:00'),
            location: 'Room 101',
            description: 'Discuss project roadmap',
            categories: ['Work', 'Planning'],
            priority: 1,
            status: 'CONFIRMED',
            organizer: { name: 'John Doe', email: 'john@example.com' },
            attendees: [
                { name: 'Jane Smith', email: 'jane@example.com' }
            ],
            isRecurring: true,
            recurrence: 'FREQ=WEEKLY'
        };

        const result = renderer.renderEventDetails(event);

        expect(result).toContain('event-details');
        expect(result).toContain('Important Meeting');
        expect(result).toContain('Room 101');
        expect(result).toContain('Discuss project roadmap');
        expect(result).toContain('Work, Planning');
        expect(result).toContain('1');
        expect(result).toContain('CONFIRMED');
        expect(result).toContain('John Doe');
        expect(result).toContain('Jane Smith');
        expect(result).toContain('FREQ=WEEKLY');
    });

    test('should reset all templates', () => {
        const customTemplate = (data) => `<div>${data.test}</div>`;
        renderer.setTemplate('dayCell', customTemplate);

        expect(renderer.templates.dayCell).toBe(customTemplate);

        renderer.resetTemplates();

        expect(renderer.templates.dayCell).toBe(DefaultTemplates.dayCell);
        expect(renderer.templates.dayCell).not.toBe(customTemplate);
    });

    test('should reset specific template', () => {
        const customTemplate = (data) => `<div>${data.test}</div>`;
        renderer.setTemplate('dayCell', customTemplate);
        renderer.setTemplate('eventItem', customTemplate);

        renderer.resetTemplate('dayCell');

        expect(renderer.templates.dayCell).toBe(DefaultTemplates.dayCell);
        expect(renderer.templates.eventItem).toBe(customTemplate);
    });

    test('should get all template names', () => {
        const names = renderer.getTemplateNames();

        expect(names).toContain('dayCell');
        expect(names).toContain('eventItem');
        expect(names).toContain('calendarHeader');
        expect(names).toContain('weekdayHeader');
        expect(names).toContain('monthGrid');
        expect(names).toContain('eventDetails');
    });

    test('should clone renderer', () => {
        const customTemplate = (data) => `<div>${data.test}</div>`;
        renderer.setTemplate('custom', customTemplate);

        const clone = renderer.clone();

        expect(clone).not.toBe(renderer);
        expect(clone.templates.custom).toBe(customTemplate);
        expect(clone.templates.dayCell).toBe(renderer.templates.dayCell);
    });

    test('should handle recurring event indicator', () => {
        const event = {
            title: 'Weekly Standup',
            isRecurring: true,
            color: '#00ff00'
        };

        const result = renderer.renderEventItem(event, 'month');

        expect(result).toContain('🔄');
        expect(result).toContain('Weekly Standup');
    });

    test('should handle all-day events in list view', () => {
        const event = {
            title: 'All Day Event',
            start: new Date('2025-11-05'),
            isAllDay: true
        };

        const result = renderer.renderEventItem(event, 'list');

        expect(result).toContain('All Day');
    });
});

describe('DefaultTemplates', () => {
    test('should have all required templates', () => {
        expect(DefaultTemplates.dayCell).toBeDefined();
        expect(DefaultTemplates.eventItem).toBeDefined();
        expect(DefaultTemplates.calendarHeader).toBeDefined();
        expect(DefaultTemplates.weekdayHeader).toBeDefined();
        expect(DefaultTemplates.monthGrid).toBeDefined();
        expect(DefaultTemplates.eventDetails).toBeDefined();
        expect(DefaultTemplates.weekView).toBeDefined();
    });

    test('all templates should be functions', () => {
        Object.values(DefaultTemplates).forEach(template => {
            expect(typeof template).toBe('function');
        });
    });

    test('dayCell template should handle different states', () => {
        const baseData = {
            date: new Date('2025-11-05'),
            dayNumber: 5,
            isCurrentMonth: true,
            isToday: false,
            events: []
        };

        const current = DefaultTemplates.dayCell(baseData);
        expect(current).toContain('current-month');
        expect(current).not.toContain('other-month');

        const today = DefaultTemplates.dayCell({ ...baseData, isToday: true });
        expect(today).toContain('today');

        const other = DefaultTemplates.dayCell({ ...baseData, isCurrentMonth: false });
        expect(other).toContain('other-month');
    });
});
