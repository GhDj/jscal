const JSONParser = require('../src/json-parser');

describe('JSONParser', () => {
    describe('parse', () => {
        test('should parse JSON string', () => {
            const jsonString = JSON.stringify([
                {
                    title: 'Test Event',
                    start: '2025-11-05T10:00:00',
                    end: '2025-11-05T11:00:00',
                    description: 'Test Description',
                    location: 'Test Location'
                }
            ]);

            const events = JSONParser.parse(jsonString);

            expect(events).toHaveLength(1);
            expect(events[0].title).toBe('Test Event');
            expect(events[0].description).toBe('Test Description');
            expect(events[0].location).toBe('Test Location');
            expect(events[0].start).toBeInstanceOf(Date);
            expect(events[0].end).toBeInstanceOf(Date);
        });

        test('should parse JSON object', () => {
            const jsonObject = [
                {
                    title: 'Test Event',
                    start: '2025-11-05T10:00:00',
                    end: '2025-11-05T11:00:00'
                }
            ];

            const events = JSONParser.parse(jsonObject);

            expect(events).toHaveLength(1);
            expect(events[0].title).toBe('Test Event');
        });

        test('should handle single object (not array)', () => {
            const jsonObject = {
                title: 'Test Event',
                start: '2025-11-05T10:00:00'
            };

            const events = JSONParser.parse(jsonObject);

            expect(events).toHaveLength(1);
            expect(events[0].title).toBe('Test Event');
        });

        test('should normalize different field names', () => {
            const events = JSONParser.parse([
                { summary: 'Event 1', startDate: '2025-11-05T10:00:00' },
                { name: 'Event 2', startTime: '2025-11-05T11:00:00' },
                { title: 'Event 3', start: '2025-11-05T12:00:00' }
            ]);

            expect(events).toHaveLength(3);
            expect(events[0].title).toBe('Event 1');
            expect(events[1].title).toBe('Event 2');
            expect(events[2].title).toBe('Event 3');
        });

        test('should handle missing optional fields', () => {
            const events = JSONParser.parse([
                {
                    title: 'Minimal Event',
                    start: '2025-11-05T10:00:00'
                }
            ]);

            expect(events).toHaveLength(1);
            expect(events[0].title).toBe('Minimal Event');
            expect(events[0].description).toBe('');
            expect(events[0].location).toBe('');
            expect(events[0].end).toBeNull();
            expect(events[0].uid).toBeTruthy();
        });

        test('should generate uid if not provided', () => {
            const events = JSONParser.parse([
                { title: 'Event 1', start: '2025-11-05T10:00:00' },
                { title: 'Event 2', start: '2025-11-05T11:00:00' }
            ]);

            expect(events[0].uid).toBeTruthy();
            expect(events[1].uid).toBeTruthy();
            expect(events[0].uid).not.toBe(events[1].uid);
        });

        test('should throw error for invalid JSON string', () => {
            expect(() => {
                JSONParser.parse('invalid json');
            }).toThrow('Invalid JSON format');
        });
    });

    describe('normalizeEvent', () => {
        test('should normalize standard event', () => {
            const event = JSONParser.normalizeEvent({
                title: 'Test',
                start: '2025-11-05T10:00:00',
                end: '2025-11-05T11:00:00',
                description: 'Desc',
                location: 'Location'
            });

            expect(event.title).toBe('Test');
            expect(event.start).toBeInstanceOf(Date);
            expect(event.end).toBeInstanceOf(Date);
            expect(event.description).toBe('Desc');
            expect(event.location).toBe('Location');
        });

        test('should use default title for missing title', () => {
            const event = JSONParser.normalizeEvent({
                start: '2025-11-05T10:00:00'
            });

            expect(event.title).toBe('Untitled');
        });
    });

    describe('validateEvent', () => {
        test('should validate valid event', () => {
            expect(JSONParser.validateEvent({
                title: 'Test',
                start: '2025-11-05T10:00:00'
            })).toBe(true);
        });

        test('should accept alternative field names', () => {
            expect(JSONParser.validateEvent({
                summary: 'Test',
                startDate: '2025-11-05T10:00:00'
            })).toBe(true);
        });

        test('should reject event without title', () => {
            expect(JSONParser.validateEvent({
                start: '2025-11-05T10:00:00'
            })).toBe(false);
        });

        test('should reject event without start', () => {
            expect(JSONParser.validateEvent({
                title: 'Test'
            })).toBe(false);
        });

        test('should reject null or undefined', () => {
            expect(JSONParser.validateEvent(null)).toBe(false);
            expect(JSONParser.validateEvent(undefined)).toBe(false);
        });

        test('should reject non-object', () => {
            expect(JSONParser.validateEvent('string')).toBe(false);
            expect(JSONParser.validateEvent(123)).toBe(false);
        });
    });
});
