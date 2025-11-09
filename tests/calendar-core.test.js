const CalendarCore = require('../src/calendar-core');

describe('CalendarCore', () => {
    let calendar;

    beforeEach(() => {
        calendar = new CalendarCore();
    });

    describe('addEvents', () => {
        test('should add single event', () => {
            const event = {
                title: 'Test Event',
                start: new Date('2025-11-05T10:00:00'),
                end: new Date('2025-11-05T11:00:00')
            };

            calendar.addEvents(event);

            expect(calendar.events).toHaveLength(1);
            expect(calendar.events[0].title).toBe('Test Event');
        });

        test('should add multiple events', () => {
            const events = [
                { title: 'Event 1', start: new Date('2025-11-05T10:00:00') },
                { title: 'Event 2', start: new Date('2025-11-06T10:00:00') }
            ];

            calendar.addEvents(events);

            expect(calendar.events).toHaveLength(2);
        });

        test('should append to existing events', () => {
            calendar.addEvents({ title: 'Event 1', start: new Date() });
            calendar.addEvents({ title: 'Event 2', start: new Date() });

            expect(calendar.events).toHaveLength(2);
        });
    });

    describe('clearEvents', () => {
        test('should clear all events', () => {
            calendar.addEvents([
                { title: 'Event 1', start: new Date() },
                { title: 'Event 2', start: new Date() }
            ]);

            calendar.clearEvents();

            expect(calendar.events).toHaveLength(0);
        });
    });

    describe('getEventsForDate', () => {
        beforeEach(() => {
            calendar.addEvents([
                { title: 'Event 1', start: new Date('2025-11-05T10:00:00') },
                { title: 'Event 2', start: new Date('2025-11-05T14:00:00') },
                { title: 'Event 3', start: new Date('2025-11-06T10:00:00') }
            ]);
        });

        test('should get events for specific date', () => {
            const events = calendar.getEventsForDate(new Date('2025-11-05'));

            expect(events).toHaveLength(2);
            expect(events[0].title).toBe('Event 1');
            expect(events[1].title).toBe('Event 2');
        });

        test('should return empty array for date with no events', () => {
            const events = calendar.getEventsForDate(new Date('2025-11-07'));

            expect(events).toHaveLength(0);
        });

        test('should ignore time when matching dates', () => {
            const events = calendar.getEventsForDate(new Date('2025-11-05T23:59:59'));

            expect(events).toHaveLength(2);
        });
    });

    describe('getEventsInRange', () => {
        beforeEach(() => {
            calendar.addEvents([
                { title: 'Event 1', start: new Date('2025-11-05T10:00:00') },
                { title: 'Event 2', start: new Date('2025-11-10T10:00:00') },
                { title: 'Event 3', start: new Date('2025-11-15T10:00:00') },
                { title: 'Event 4', start: new Date('2025-11-20T10:00:00') }
            ]);
        });

        test('should get events in date range', () => {
            const events = calendar.getEventsInRange(
                new Date('2025-11-08'),
                new Date('2025-11-16')
            );

            expect(events).toHaveLength(2);
            expect(events[0].title).toBe('Event 2');
            expect(events[1].title).toBe('Event 3');
        });

        test('should return events sorted by start date', () => {
            const events = calendar.getEventsInRange(
                new Date('2025-11-01'),
                new Date('2025-11-30')
            );

            expect(events).toHaveLength(4);
            for (let i = 1; i < events.length; i++) {
                expect(events[i].start >= events[i - 1].start).toBe(true);
            }
        });
    });

    describe('getEventsForMonth', () => {
        beforeEach(() => {
            calendar.addEvents([
                { title: 'Nov Event 1', start: new Date('2025-11-05T10:00:00') },
                { title: 'Nov Event 2', start: new Date('2025-11-15T10:00:00') },
                { title: 'Dec Event', start: new Date('2025-12-05T10:00:00') }
            ]);
        });

        test('should get events for specific month', () => {
            const events = calendar.getEventsForMonth(2025, 10); // November (0-indexed)

            expect(events).toHaveLength(2);
            expect(events[0].title).toBe('Nov Event 1');
            expect(events[1].title).toBe('Nov Event 2');
        });

        test('should return empty array for month with no events', () => {
            const events = calendar.getEventsForMonth(2025, 9); // October

            expect(events).toHaveLength(0);
        });
    });

    describe('getMonthGrid', () => {
        beforeEach(() => {
            calendar.addEvents([
                { title: 'Event 1', start: new Date('2025-11-05T10:00:00') },
                { title: 'Event 2', start: new Date('2025-11-05T14:00:00') },
                { title: 'Event 3', start: new Date('2025-11-15T10:00:00') }
            ]);
        });

        test('should generate calendar grid for month', () => {
            const grid = calendar.getMonthGrid(2025, 10); // November

            expect(grid.year).toBe(2025);
            expect(grid.month).toBe(10);
            expect(grid.grid).toBeDefined();
            expect(grid.totalEvents).toBe(3);
        });

        test('should include empty cells for days before month starts', () => {
            const grid = calendar.getMonthGrid(2025, 10); // November 2025 starts on Saturday (day 6)

            // First cell should be empty if month doesn't start on Sunday
            const firstDay = new Date(2025, 10, 1).getDay();
            if (firstDay > 0) {
                expect(grid.grid[0].day).toBeNull();
            }
        });

        test('should include events in grid cells', () => {
            const grid = calendar.getMonthGrid(2025, 10);

            // Find the cell for November 5th
            const nov5Cell = grid.grid.find(cell => cell.day === 5);

            expect(nov5Cell).toBeDefined();
            expect(nov5Cell.events).toHaveLength(2);
        });

        test('should mark today in grid', () => {
            const today = new Date();
            calendar.clearEvents();
            calendar.addEvents({ title: 'Today Event', start: today });

            const grid = calendar.getMonthGrid(today.getFullYear(), today.getMonth());
            const todayCell = grid.grid.find(cell => cell.day === today.getDate());

            expect(todayCell.isToday).toBe(true);
        });
    });

    describe('isToday', () => {
        test('should return true for today', () => {
            const today = new Date();
            expect(calendar.isToday(today)).toBe(true);
        });

        test('should return false for other dates', () => {
            const otherDate = new Date('2025-11-05');
            const today = new Date();

            if (otherDate.toDateString() !== today.toDateString()) {
                expect(calendar.isToday(otherDate)).toBe(false);
            }
        });
    });

    describe('getAllEvents', () => {
        test('should return all events sorted', () => {
            calendar.addEvents([
                { title: 'Event 3', start: new Date('2025-11-15T10:00:00') },
                { title: 'Event 1', start: new Date('2025-11-05T10:00:00') },
                { title: 'Event 2', start: new Date('2025-11-10T10:00:00') }
            ]);

            const events = calendar.getAllEvents();

            expect(events).toHaveLength(3);
            expect(events[0].title).toBe('Event 1');
            expect(events[1].title).toBe('Event 2');
            expect(events[2].title).toBe('Event 3');
        });

        test('should return copy of events array', () => {
            calendar.addEvents({ title: 'Event', start: new Date() });

            const events = calendar.getAllEvents();
            events.push({ title: 'New', start: new Date() });

            expect(calendar.events).toHaveLength(1);
        });
    });

    describe('searchEvents', () => {
        beforeEach(() => {
            calendar.addEvents([
                {
                    title: 'Team Meeting',
                    start: new Date('2025-11-05T10:00:00'),
                    description: 'Discuss project status'
                },
                {
                    title: 'Client Call',
                    start: new Date('2025-11-06T10:00:00'),
                    location: 'Conference Room'
                },
                {
                    title: 'Code Review',
                    start: new Date('2025-11-07T10:00:00'),
                    description: 'Review team pull requests'
                }
            ]);
        });

        test('should search by title', () => {
            const events = calendar.searchEvents('meeting');

            expect(events).toHaveLength(1);
            expect(events[0].title).toBe('Team Meeting');
        });

        test('should search by description', () => {
            const events = calendar.searchEvents('team');

            expect(events).toHaveLength(2);
        });

        test('should search by location', () => {
            const events = calendar.searchEvents('conference');

            expect(events).toHaveLength(1);
            expect(events[0].title).toBe('Client Call');
        });

        test('should be case insensitive', () => {
            const events = calendar.searchEvents('TEAM');

            expect(events).toHaveLength(2);
        });

        test('should return empty array for no matches', () => {
            const events = calendar.searchEvents('xyz123');

            expect(events).toHaveLength(0);
        });
    });
});
