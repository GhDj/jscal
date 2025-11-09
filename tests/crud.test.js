const JSCal = require('../src/index');

describe('CRUD Operations', () => {
    let calendar;

    beforeEach(() => {
        calendar = new JSCal();
    });

    describe('addEvent', () => {
        test('should add a new event', () => {
            const event = calendar.addEvent({
                title: 'New Event',
                start: new Date('2025-11-05T10:00:00'),
                end: new Date('2025-11-05T11:00:00')
            });

            expect(event.title).toBe('New Event');
            expect(event.uid).toBeDefined();
            expect(calendar.getEventCount()).toBe(1);
        });

        test('should generate UID if not provided', () => {
            const event = calendar.addEvent({
                title: 'Test',
                start: new Date()
            });

            expect(event.uid).toBeDefined();
            expect(event.uid).toContain('@jscal');
        });

        test('should throw error for invalid event', () => {
            expect(() => {
                calendar.addEvent({});
            }).toThrow();
        });

        test('should throw error for event without title', () => {
            expect(() => {
                calendar.addEvent({
                    start: new Date()
                });
            }).toThrow('Event must have a title');
        });

        test('should throw error for event without start', () => {
            expect(() => {
                calendar.addEvent({
                    title: 'Test'
                });
            }).toThrow('Event must have a start date');
        });
    });

    describe('updateEvent', () => {
        test('should update existing event', () => {
            const event = calendar.addEvent({
                title: 'Original',
                start: new Date('2025-11-05T10:00:00')
            });

            const updated = calendar.updateEvent(event.uid, {
                title: 'Updated',
                description: 'New description'
            });

            expect(updated.title).toBe('Updated');
            expect(updated.description).toBe('New description');
            expect(updated.uid).toBe(event.uid);
        });

        test('should return null for non-existent event', () => {
            const updated = calendar.updateEvent('non-existent-uid', {
                title: 'Updated'
            });

            expect(updated).toBeNull();
        });

        test('should preserve UID when updating', () => {
            const event = calendar.addEvent({
                title: 'Test',
                start: new Date()
            });

            const originalUID = event.uid;

            calendar.updateEvent(event.uid, {
                title: 'Updated',
                uid: 'different-uid' // Try to change UID
            });

            const found = calendar.findEventByUID(originalUID);
            expect(found).toBeDefined();
            expect(found.uid).toBe(originalUID);
        });

        test('should update multiple fields', () => {
            const event = calendar.addEvent({
                title: 'Original',
                start: new Date('2025-11-05T10:00:00'),
                description: 'Old desc'
            });

            calendar.updateEvent(event.uid, {
                title: 'New Title',
                description: 'New Description',
                location: 'New Location',
                priority: 1
            });

            const updated = calendar.findEventByUID(event.uid);
            expect(updated.title).toBe('New Title');
            expect(updated.description).toBe('New Description');
            expect(updated.location).toBe('New Location');
            expect(updated.priority).toBe(1);
        });
    });

    describe('deleteEvent', () => {
        test('should delete event by UID', () => {
            const event = calendar.addEvent({
                title: 'To Delete',
                start: new Date()
            });

            expect(calendar.getEventCount()).toBe(1);

            const deleted = calendar.deleteEvent(event.uid);

            expect(deleted).toBe(true);
            expect(calendar.getEventCount()).toBe(0);
        });

        test('should return false for non-existent event', () => {
            const deleted = calendar.deleteEvent('non-existent-uid');
            expect(deleted).toBe(false);
        });

        test('should only delete specified event', () => {
            const event1 = calendar.addEvent({ title: 'Event 1', start: new Date() });
            const event2 = calendar.addEvent({ title: 'Event 2', start: new Date() });

            calendar.deleteEvent(event1.uid);

            expect(calendar.getEventCount()).toBe(1);
            expect(calendar.findEventByUID(event2.uid)).toBeDefined();
        });
    });

    describe('deleteEvents', () => {
        test('should delete multiple events', () => {
            const event1 = calendar.addEvent({ title: 'Event 1', start: new Date() });
            const event2 = calendar.addEvent({ title: 'Event 2', start: new Date() });
            const event3 = calendar.addEvent({ title: 'Event 3', start: new Date() });

            const deleted = calendar.deleteEvents([event1.uid, event2.uid]);

            expect(deleted).toBe(2);
            expect(calendar.getEventCount()).toBe(1);
            expect(calendar.findEventByUID(event3.uid)).toBeDefined();
        });

        test('should handle mix of existing and non-existing UIDs', () => {
            const event = calendar.addEvent({ title: 'Event', start: new Date() });

            const deleted = calendar.deleteEvents([event.uid, 'non-existent']);

            expect(deleted).toBe(1);
            expect(calendar.getEventCount()).toBe(0);
        });
    });

    describe('findEventByUID', () => {
        test('should find event by UID', () => {
            const event = calendar.addEvent({
                title: 'Find Me',
                start: new Date()
            });

            const found = calendar.findEventByUID(event.uid);

            expect(found).toBeDefined();
            expect(found.title).toBe('Find Me');
            expect(found.uid).toBe(event.uid);
        });

        test('should return null for non-existent UID', () => {
            const found = calendar.findEventByUID('non-existent');
            expect(found).toBeNull();
        });
    });

    describe('findEvents', () => {
        beforeEach(() => {
            calendar.addEvent({ title: 'Meeting', start: new Date('2025-11-05'), priority: 1 });
            calendar.addEvent({ title: 'Lunch', start: new Date('2025-11-06'), priority: 5 });
            calendar.addEvent({ title: 'Review', start: new Date('2025-11-07'), priority: 1 });
        });

        test('should find events by predicate', () => {
            const highPriority = calendar.findEvents(e => e.priority === 1);

            expect(highPriority).toHaveLength(2);
            expect(highPriority[0].title).toBe('Meeting');
            expect(highPriority[1].title).toBe('Review');
        });

        test('should find events by title', () => {
            const meetings = calendar.findEvents(e => e.title.includes('Meeting'));

            expect(meetings).toHaveLength(1);
            expect(meetings[0].title).toBe('Meeting');
        });
    });

    describe('duplicateEvent', () => {
        test('should duplicate event with new UID', () => {
            const original = calendar.addEvent({
                title: 'Original',
                start: new Date('2025-11-05T10:00:00'),
                description: 'Original description'
            });

            const duplicate = calendar.duplicateEvent(original.uid);

            expect(duplicate).toBeDefined();
            expect(duplicate.title).toBe('Original');
            expect(duplicate.description).toBe('Original description');
            expect(duplicate.uid).not.toBe(original.uid);
            expect(calendar.getEventCount()).toBe(2);
        });

        test('should apply modifications when duplicating', () => {
            const original = calendar.addEvent({
                title: 'Original',
                start: new Date('2025-11-05T10:00:00')
            });

            const duplicate = calendar.duplicateEvent(original.uid, {
                title: 'Copy of Original',
                start: new Date('2025-11-06T10:00:00')
            });

            expect(duplicate.title).toBe('Copy of Original');
            expect(duplicate.start).toEqual(new Date('2025-11-06T10:00:00'));
        });

        test('should return null for non-existent event', () => {
            const duplicate = calendar.duplicateEvent('non-existent');
            expect(duplicate).toBeNull();
        });
    });

    describe('moveEvent', () => {
        test('should move event to new date', () => {
            const event = calendar.addEvent({
                title: 'Meeting',
                start: new Date('2025-11-05T10:00:00'),
                end: new Date('2025-11-05T11:00:00')
            });

            const moved = calendar.moveEvent(
                event.uid,
                new Date('2025-11-06T14:00:00')
            );

            expect(moved.start).toEqual(new Date('2025-11-06T14:00:00'));
            expect(moved.end).toEqual(new Date('2025-11-06T15:00:00')); // Duration maintained
        });

        test('should not keep duration if specified', () => {
            const event = calendar.addEvent({
                title: 'Meeting',
                start: new Date('2025-11-05T10:00:00'),
                end: new Date('2025-11-05T11:00:00')
            });

            const moved = calendar.moveEvent(
                event.uid,
                new Date('2025-11-06T14:00:00'),
                false // Don't keep duration
            );

            expect(moved.start).toEqual(new Date('2025-11-06T14:00:00'));
            expect(moved.end).toBeNull();
        });

        test('should return null for non-existent event', () => {
            const moved = calendar.moveEvent('non-existent', new Date());
            expect(moved).toBeNull();
        });
    });

    describe('validateEvent', () => {
        test('should validate correct event', () => {
            const result = calendar.validateEvent({
                title: 'Valid Event',
                start: new Date('2025-11-05T10:00:00')
            });

            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        test('should reject event without title', () => {
            const result = calendar.validateEvent({
                start: new Date()
            });

            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Event must have a title');
        });

        test('should reject event without start', () => {
            const result = calendar.validateEvent({
                title: 'Test'
            });

            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Event must have a start date');
        });

        test('should reject end before start', () => {
            const result = calendar.validateEvent({
                title: 'Test',
                start: new Date('2025-11-05T11:00:00'),
                end: new Date('2025-11-05T10:00:00')
            });

            expect(result.valid).toBe(false);
            expect(result.errors).toContain('End date must be after start date');
        });

        test('should reject invalid date', () => {
            const result = calendar.validateEvent({
                title: 'Test',
                start: 'invalid-date'
            });

            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Invalid start date');
        });
    });

    describe('getEventCount', () => {
        test('should return 0 for empty calendar', () => {
            expect(calendar.getEventCount()).toBe(0);
        });

        test('should return correct count', () => {
            calendar.addEvent({ title: 'Event 1', start: new Date() });
            calendar.addEvent({ title: 'Event 2', start: new Date() });
            calendar.addEvent({ title: 'Event 3', start: new Date() });

            expect(calendar.getEventCount()).toBe(3);
        });

        test('should update count after deletion', () => {
            const event = calendar.addEvent({ title: 'Event', start: new Date() });
            expect(calendar.getEventCount()).toBe(1);

            calendar.deleteEvent(event.uid);
            expect(calendar.getEventCount()).toBe(0);
        });
    });
});
