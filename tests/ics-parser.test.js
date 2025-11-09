const ICSParser = require('../src/ics-parser');

describe('ICSParser', () => {
    describe('parse', () => {
        test('should parse basic ICS event', () => {
            const ics = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:test@example.com
DTSTART:20251105T100000Z
DTEND:20251105T110000Z
SUMMARY:Test Event
DESCRIPTION:Test Description
LOCATION:Test Location
END:VEVENT
END:VCALENDAR`;

            const events = ICSParser.parse(ics);

            expect(events).toHaveLength(1);
            expect(events[0].title).toBe('Test Event');
            expect(events[0].description).toBe('Test Description');
            expect(events[0].location).toBe('Test Location');
            expect(events[0].uid).toBe('test@example.com');
            expect(events[0].start).toBeInstanceOf(Date);
            expect(events[0].end).toBeInstanceOf(Date);
        });

        test('should parse multiple events', () => {
            const ics = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:event1@example.com
DTSTART:20251105T100000Z
DTEND:20251105T110000Z
SUMMARY:Event 1
END:VEVENT
BEGIN:VEVENT
UID:event2@example.com
DTSTART:20251106T100000Z
DTEND:20251106T110000Z
SUMMARY:Event 2
END:VEVENT
END:VCALENDAR`;

            const events = ICSParser.parse(ics);

            expect(events).toHaveLength(2);
            expect(events[0].title).toBe('Event 1');
            expect(events[1].title).toBe('Event 2');
        });

        test('should handle date-only format', () => {
            const ics = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:test@example.com
DTSTART:20251105
DTEND:20251106
SUMMARY:All Day Event
END:VEVENT
END:VCALENDAR`;

            const events = ICSParser.parse(ics);

            expect(events).toHaveLength(1);
            expect(events[0].start).toBeInstanceOf(Date);
            expect(events[0].start.getFullYear()).toBe(2025);
            expect(events[0].start.getMonth()).toBe(10); // November (0-indexed)
            expect(events[0].start.getDate()).toBe(5);
        });

        test('should handle line folding', () => {
            const ics = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:test@example.com
DTSTART:20251105T100000Z
DTEND:20251105T110000Z
SUMMARY:This is a very long summary that
  spans multiple lines
DESCRIPTION:This is a very long description that
  also spans
  multiple lines
END:VEVENT
END:VCALENDAR`;

            const events = ICSParser.parse(ics);

            expect(events).toHaveLength(1);
            expect(events[0].title).toBe('This is a very long summary thatspans multiple lines');
            expect(events[0].description).toContain('This is a very long description');
        });

        test('should unescape text correctly', () => {
            const ics = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:test@example.com
DTSTART:20251105T100000Z
DTEND:20251105T110000Z
SUMMARY:Event with\\, comma and\\; semicolon
DESCRIPTION:Line 1\\nLine 2\\nLine 3
END:VEVENT
END:VCALENDAR`;

            const events = ICSParser.parse(ics);

            expect(events).toHaveLength(1);
            expect(events[0].title).toBe('Event with, comma and; semicolon');
            expect(events[0].description).toBe('Line 1\nLine 2\nLine 3');
        });

        test('should handle events without end date', () => {
            const ics = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:test@example.com
DTSTART:20251105T100000Z
SUMMARY:Event without end
END:VEVENT
END:VCALENDAR`;

            const events = ICSParser.parse(ics);

            expect(events).toHaveLength(1);
            expect(events[0].start).toBeInstanceOf(Date);
            expect(events[0].end).toBeNull();
        });

        test('should ignore events without start date', () => {
            const ics = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:test@example.com
SUMMARY:Invalid Event
END:VEVENT
END:VCALENDAR`;

            const events = ICSParser.parse(ics);

            expect(events).toHaveLength(0);
        });
    });

    describe('parseDate', () => {
        test('should parse UTC datetime', () => {
            const date = ICSParser.parseDate('20251105T100000Z', 'DTSTART');

            expect(date).toBeInstanceOf(Date);
            expect(date.getUTCFullYear()).toBe(2025);
            expect(date.getUTCMonth()).toBe(10); // November
            expect(date.getUTCDate()).toBe(5);
            expect(date.getUTCHours()).toBe(10);
            expect(date.getUTCMinutes()).toBe(0);
        });

        test('should parse local datetime', () => {
            const date = ICSParser.parseDate('20251105T100000', 'DTSTART');

            expect(date).toBeInstanceOf(Date);
            expect(date.getFullYear()).toBe(2025);
            expect(date.getMonth()).toBe(10); // November
            expect(date.getDate()).toBe(5);
            expect(date.getHours()).toBe(10);
        });

        test('should parse date-only format', () => {
            const date = ICSParser.parseDate('20251105', 'DTSTART');

            expect(date).toBeInstanceOf(Date);
            expect(date.getFullYear()).toBe(2025);
            expect(date.getMonth()).toBe(10);
            expect(date.getDate()).toBe(5);
        });
    });

    describe('unescapeText', () => {
        test('should unescape newlines', () => {
            expect(ICSParser.unescapeText('Line 1\\nLine 2')).toBe('Line 1\nLine 2');
        });

        test('should unescape commas', () => {
            expect(ICSParser.unescapeText('Hello\\, World')).toBe('Hello, World');
        });

        test('should unescape semicolons', () => {
            expect(ICSParser.unescapeText('Hello\\; World')).toBe('Hello; World');
        });

        test('should unescape backslashes', () => {
            expect(ICSParser.unescapeText('Hello\\\\ World')).toBe('Hello\\ World');
        });

        test('should handle multiple escapes', () => {
            expect(ICSParser.unescapeText('A\\, B\\; C\\nD\\\\ E'))
                .toBe('A, B; C\nD\\ E');
        });
    });
});
