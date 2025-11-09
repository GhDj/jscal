const JSCal = require('../src/index');
const { ICSParser, JSONParser, CalendarCore } = require('../src/index');

describe('JSCal', () => {
    let calendar;

    beforeEach(() => {
        calendar = new JSCal();
    });

    test('should create calendar instance', () => {
        expect(calendar).toBeDefined();
        expect(calendar.core).toBeInstanceOf(CalendarCore);
    });

    describe('loadICS', () => {
        test('should load and parse ICS content', () => {
            const ics = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:test@example.com
DTSTART:20251105T100000Z
DTEND:20251105T110000Z
SUMMARY:Test Event
DESCRIPTION:Test Description
END:VEVENT
END:VCALENDAR`;

            const events = calendar.loadICS(ics);

            expect(events).toHaveLength(1);
            expect(events[0].title).toBe('Test Event');
            expect(calendar.getAllEvents()).toHaveLength(1);
        });
    });

    describe('loadJSON', () => {
        test('should load and parse JSON string', () => {
            const json = JSON.stringify([
                {
                    title: 'JSON Event',
                    start: '2025-11-05T10:00:00',
                    end: '2025-11-05T11:00:00'
                }
            ]);

            const events = calendar.loadJSON(json);

            expect(events).toHaveLength(1);
            expect(events[0].title).toBe('JSON Event');
            expect(calendar.getAllEvents()).toHaveLength(1);
        });

        test('should load and parse JSON object', () => {
            const json = [
                {
                    title: 'JSON Event',
                    start: '2025-11-05T10:00:00'
                }
            ];

            const events = calendar.loadJSON(json);

            expect(events).toHaveLength(1);
            expect(events[0].title).toBe('JSON Event');
        });
    });

    describe('addEvents', () => {
        test('should add custom events', () => {
            const event = {
                title: 'Custom Event',
                start: new Date('2025-11-05T10:00:00'),
                end: new Date('2025-11-05T11:00:00')
            };

            calendar.addEvents(event);

            expect(calendar.getAllEvents()).toHaveLength(1);
            expect(calendar.getAllEvents()[0].title).toBe('Custom Event');
        });
    });

    describe('clearEvents', () => {
        test('should clear all events', () => {
            calendar.addEvents({
                title: 'Event',
                start: new Date()
            });

            expect(calendar.getAllEvents()).toHaveLength(1);

            calendar.clearEvents();

            expect(calendar.getAllEvents()).toHaveLength(0);
        });
    });

    describe('event query methods', () => {
        beforeEach(() => {
            calendar.loadJSON([
                {
                    title: 'Event 1',
                    start: '2025-11-05T10:00:00',
                    description: 'First event'
                },
                {
                    title: 'Event 2',
                    start: '2025-11-10T10:00:00',
                    description: 'Second event'
                },
                {
                    title: 'Event 3',
                    start: '2025-11-15T10:00:00',
                    location: 'Office'
                }
            ]);
        });

        test('getEventsForDate should return events for specific date', () => {
            const events = calendar.getEventsForDate(new Date('2025-11-05'));

            expect(events).toHaveLength(1);
            expect(events[0].title).toBe('Event 1');
        });

        test('getEventsInRange should return events in date range', () => {
            const events = calendar.getEventsInRange(
                new Date('2025-11-08'),
                new Date('2025-11-16')
            );

            expect(events).toHaveLength(2);
            expect(events[0].title).toBe('Event 2');
            expect(events[1].title).toBe('Event 3');
        });

        test('getEventsForMonth should return events for month', () => {
            const events = calendar.getEventsForMonth(2025, 10); // November

            expect(events).toHaveLength(3);
        });

        test('getMonthGrid should return grid data', () => {
            const grid = calendar.getMonthGrid(2025, 10);

            expect(grid.year).toBe(2025);
            expect(grid.month).toBe(10);
            expect(grid.totalEvents).toBe(3);
            expect(grid.grid).toBeDefined();
        });

        test('getAllEvents should return all events', () => {
            const events = calendar.getAllEvents();

            expect(events).toHaveLength(3);
        });

        test('searchEvents should find matching events', () => {
            const events = calendar.searchEvents('office');

            expect(events).toHaveLength(1);
            expect(events[0].title).toBe('Event 3');
        });
    });

    describe('module exports', () => {
        test('should export ICSParser', () => {
            expect(ICSParser).toBeDefined();
            expect(typeof ICSParser.parse).toBe('function');
        });

        test('should export JSONParser', () => {
            expect(JSONParser).toBeDefined();
            expect(typeof JSONParser.parse).toBe('function');
        });

        test('should export CalendarCore', () => {
            expect(CalendarCore).toBeDefined();
        });

        test('should have default export', () => {
            expect(JSCal).toBeDefined();
        });
    });
});
