const CalendarCore = require('../src/calendar-core');
const Holidays = require('../src/holidays');
const JSONParser = require('../src/json-parser');
const ICSParser = require('../src/ics-parser');

describe('New Features', () => {
    describe('Week Numbers', () => {
        let calendar;

        beforeEach(() => {
            calendar = new CalendarCore();
        });

        test('should get week number for a date', () => {
            // January 1, 2025 is week 1
            const weekNum = calendar.getWeekNumber(new Date(2025, 0, 1));
            expect(weekNum).toBeGreaterThan(0);
            expect(weekNum).toBeLessThanOrEqual(53);
        });

        test('should get week year', () => {
            const weekYear = calendar.getWeekYear(new Date(2025, 0, 1));
            expect(weekYear).toBe(2025);
        });
    });

    describe('Conflict Detection', () => {
        let calendar;

        beforeEach(() => {
            calendar = new CalendarCore();
            calendar.addEvents([
                {
                    uid: 'event1',
                    title: 'Event 1',
                    start: new Date('2025-11-05T10:00:00'),
                    end: new Date('2025-11-05T11:00:00')
                },
                {
                    uid: 'event2',
                    title: 'Event 2',
                    start: new Date('2025-11-05T10:30:00'),
                    end: new Date('2025-11-05T11:30:00')
                },
                {
                    uid: 'event3',
                    title: 'Event 3',
                    start: new Date('2025-11-05T12:00:00'),
                    end: new Date('2025-11-05T13:00:00')
                }
            ]);
        });

        test('should detect conflicting events', () => {
            const conflicts = calendar.getConflictingEvents({
                uid: 'test',
                start: new Date('2025-11-05T10:45:00'),
                end: new Date('2025-11-05T11:15:00')
            });

            expect(conflicts.length).toBe(2); // Conflicts with event1 and event2
        });

        test('should detect if event has conflicts', () => {
            const hasConflict = calendar.hasConflict({
                uid: 'test',
                start: new Date('2025-11-05T10:45:00'),
                end: new Date('2025-11-05T11:15:00')
            });

            expect(hasConflict).toBe(true);
        });

        test('should not detect conflict for non-overlapping events', () => {
            const conflicts = calendar.getConflictingEvents({
                uid: 'test',
                start: new Date('2025-11-05T14:00:00'),
                end: new Date('2025-11-05T15:00:00')
            });

            expect(conflicts.length).toBe(0);
        });

        test('should not compare event with itself', () => {
            const conflicts = calendar.getConflictingEvents({
                uid: 'event1',
                start: new Date('2025-11-05T10:00:00'),
                end: new Date('2025-11-05T11:00:00')
            });

            expect(conflicts).not.toContainEqual(
                expect.objectContaining({ uid: 'event1' })
            );
        });
    });

    describe('Categories and Filtering', () => {
        let calendar;

        beforeEach(() => {
            calendar = new CalendarCore();
            calendar.addEvents([
                {
                    title: 'Work Meeting',
                    start: new Date('2025-11-05T10:00:00'),
                    categories: ['Work', 'Meeting']
                },
                {
                    title: 'Personal Appointment',
                    start: new Date('2025-11-06T14:00:00'),
                    categories: ['Personal']
                },
                {
                    title: 'Team Sync',
                    start: new Date('2025-11-07T09:00:00'),
                    categories: ['Work', 'Team']
                }
            ]);
        });

        test('should filter events by single category', () => {
            const workEvents = calendar.filterByCategory('Work');
            expect(workEvents.length).toBe(2);
        });

        test('should filter events by multiple categories', () => {
            const events = calendar.filterByCategory(['Personal', 'Team']);
            expect(events.length).toBe(2);
        });

        test('should get all categories', () => {
            const categories = calendar.getAllCategories();
            expect(categories).toContain('Work');
            expect(categories).toContain('Personal');
            expect(categories).toContain('Meeting');
            expect(categories).toContain('Team');
        });

        test('should be case insensitive', () => {
            const workEvents = calendar.filterByCategory('work');
            expect(workEvents.length).toBe(2);
        });
    });

    describe('Priority Support', () => {
        let calendar;

        beforeEach(() => {
            calendar = new CalendarCore();
            calendar.addEvents([
                { title: 'High Priority', start: new Date(), priority: 1 },
                { title: 'Medium Priority', start: new Date(), priority: 5 },
                { title: 'Low Priority', start: new Date(), priority: 9 },
                { title: 'No Priority', start: new Date() }
            ]);
        });

        test('should get events by priority range', () => {
            const highPriority = calendar.getEventsByPriority(1, 3);
            expect(highPriority.length).toBe(1);
            expect(highPriority[0].title).toBe('High Priority');
        });

        test('should get high priority events', () => {
            const events = calendar.getHighPriorityEvents();
            expect(events.length).toBe(1);
        });

        test('should sort by priority', () => {
            const events = calendar.getEventsByPriority(1, 9);
            expect(events[0].priority).toBe(1);
            expect(events[events.length - 1].priority).toBe(9);
        });
    });

    describe('Status Support', () => {
        let calendar;

        beforeEach(() => {
            calendar = new CalendarCore();
            calendar.addEvents([
                { title: 'Confirmed', start: new Date(), status: 'CONFIRMED' },
                { title: 'Tentative', start: new Date(), status: 'TENTATIVE' },
                { title: 'Cancelled', start: new Date(), status: 'CANCELLED' }
            ]);
        });

        test('should filter by status', () => {
            const confirmed = calendar.getEventsByStatus('CONFIRMED');
            expect(confirmed.length).toBe(1);
            expect(confirmed[0].title).toBe('Confirmed');
        });

        test('should be case insensitive', () => {
            const tentative = calendar.getEventsByStatus('tentative');
            expect(tentative.length).toBe(1);
        });
    });

    describe('Holidays', () => {
        test('should get US holidays for a year', () => {
            const holidays = Holidays.getHolidays(2025, 'US');
            expect(holidays.length).toBeGreaterThan(0);
            expect(holidays.some(h => h.title.includes('Christmas'))).toBe(true);
        });

        test('should get UK holidays for a year', () => {
            const holidays = Holidays.getHolidays(2025, 'UK');
            expect(holidays.length).toBeGreaterThan(0);
            expect(holidays.some(h => h.title.includes('Christmas'))).toBe(true);
        });

        test('should get France holidays for a year', () => {
            const holidays = Holidays.getHolidays(2025, 'FR');
            expect(holidays.length).toBeGreaterThan(0);
            expect(holidays.some(h => h.title.includes('Bastille'))).toBe(true);
        });

        test('should get Canada holidays for a year', () => {
            const holidays = Holidays.getHolidays(2025, 'CA');
            expect(holidays.length).toBeGreaterThan(0);
            expect(holidays.some(h => h.title.includes('Canada Day'))).toBe(true);
        });

        test('holidays should have category', () => {
            const holidays = Holidays.getHolidays(2025, 'US');
            expect(holidays[0].categories).toContain('Holiday');
        });

        test('holidays should be all-day events', () => {
            const holidays = Holidays.getHolidays(2025, 'US');
            expect(holidays[0].isAllDay).toBe(true);
        });
    });

    describe('Enhanced JSON Parser', () => {
        test('should parse categories from string', () => {
            const events = JSONParser.parse([
                { title: 'Event', start: '2025-11-05', categories: 'Work, Meeting' }
            ]);
            expect(events[0].categories).toEqual(['Work', 'Meeting']);
        });

        test('should parse categories from array', () => {
            const events = JSONParser.parse([
                { title: 'Event', start: '2025-11-05', categories: ['Work', 'Meeting'] }
            ]);
            expect(events[0].categories).toEqual(['Work', 'Meeting']);
        });

        test('should parse category field', () => {
            const events = JSONParser.parse([
                { title: 'Event', start: '2025-11-05', category: 'Work' }
            ]);
            expect(events[0].categories).toEqual(['Work']);
        });

        test('should parse tags as categories', () => {
            const events = JSONParser.parse([
                { title: 'Event', start: '2025-11-05', tags: ['Important', 'Urgent'] }
            ]);
            expect(events[0].categories).toEqual(['Important', 'Urgent']);
        });

        test('should parse color', () => {
            const events = JSONParser.parse([
                { title: 'Event', start: '2025-11-05', color: '#ff0000' }
            ]);
            expect(events[0].color).toBe('#ff0000');
        });

        test('should parse priority', () => {
            const events = JSONParser.parse([
                { title: 'Event', start: '2025-11-05', priority: 1 }
            ]);
            expect(events[0].priority).toBe(1);
        });

        test('should parse attachments from array', () => {
            const events = JSONParser.parse([
                { title: 'Event', start: '2025-11-05', attachments: ['file1.pdf', 'file2.pdf'] }
            ]);
            expect(events[0].attachments).toEqual(['file1.pdf', 'file2.pdf']);
        });

        test('should parse isAllDay', () => {
            const events = JSONParser.parse([
                { title: 'Event', start: '2025-11-05', isAllDay: true }
            ]);
            expect(events[0].isAllDay).toBe(true);
        });
    });

    describe('Enhanced ICS Parser', () => {
        test('should parse CATEGORIES', () => {
            const ics = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:test@example.com
DTSTART:20251105T100000Z
DTEND:20251105T110000Z
SUMMARY:Test Event
CATEGORIES:Work,Meeting
END:VEVENT
END:VCALENDAR`;

            const events = ICSParser.parse(ics);
            expect(events[0].categories).toEqual(['Work', 'Meeting']);
        });

        test('should parse COLOR', () => {
            const ics = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:test@example.com
DTSTART:20251105T100000Z
DTEND:20251105T110000Z
SUMMARY:Test Event
COLOR:#ff0000
END:VEVENT
END:VCALENDAR`;

            const events = ICSParser.parse(ics);
            expect(events[0].color).toBe('#ff0000');
        });

        test('should parse PRIORITY', () => {
            const ics = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:test@example.com
DTSTART:20251105T100000Z
DTEND:20251105T110000Z
SUMMARY:Test Event
PRIORITY:1
END:VEVENT
END:VCALENDAR`;

            const events = ICSParser.parse(ics);
            expect(events[0].priority).toBe(1);
        });

        test('should parse STATUS', () => {
            const ics = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:test@example.com
DTSTART:20251105T100000Z
DTEND:20251105T110000Z
SUMMARY:Test Event
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

            const events = ICSParser.parse(ics);
            expect(events[0].status).toBe('CONFIRMED');
        });

        test('should detect all-day events', () => {
            const ics = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:test@example.com
DTSTART;VALUE=DATE:20251105
DTEND;VALUE=DATE:20251106
SUMMARY:All Day Event
END:VEVENT
END:VCALENDAR`;

            const events = ICSParser.parse(ics);
            expect(events[0].isAllDay).toBe(true);
        });

        test('should parse ATTACH', () => {
            const ics = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:test@example.com
DTSTART:20251105T100000Z
DTEND:20251105T110000Z
SUMMARY:Test Event
ATTACH:https://example.com/file.pdf
END:VEVENT
END:VCALENDAR`;

            const events = ICSParser.parse(ics);
            expect(events[0].attachments).toContain('https://example.com/file.pdf');
        });
    });
});
