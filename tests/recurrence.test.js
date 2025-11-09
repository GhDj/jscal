const JSCal = require('../src/index');
const { Recurrence } = require('../src/index');

describe('Recurring Events', () => {
    let calendar;

    beforeEach(() => {
        calendar = new JSCal();
    });

    describe('parseRRule', () => {
        test('should parse daily RRULE', () => {
            const rule = Recurrence.parseRRule('FREQ=DAILY;COUNT=10');

            expect(rule.freq).toBe('DAILY');
            expect(rule.count).toBe(10);
        });

        test('should parse weekly RRULE with days', () => {
            const rule = Recurrence.parseRRule('FREQ=WEEKLY;BYDAY=MO,WE,FR;COUNT=12');

            expect(rule.freq).toBe('WEEKLY');
            expect(rule.byDay).toEqual(['MO', 'WE', 'FR']);
            expect(rule.count).toBe(12);
        });

        test('should parse monthly RRULE', () => {
            const rule = Recurrence.parseRRule('FREQ=MONTHLY;BYMONTHDAY=15;COUNT=6');

            expect(rule.freq).toBe('MONTHLY');
            expect(rule.byMonthDay).toEqual([15]);
            expect(rule.count).toBe(6);
        });

        test('should parse RRULE with UNTIL', () => {
            const rule = Recurrence.parseRRule('FREQ=DAILY;UNTIL=20251231T235959Z');

            expect(rule.freq).toBe('DAILY');
            expect(rule.until).toBeInstanceOf(Date);
        });

        test('should parse RRULE with interval', () => {
            const rule = Recurrence.parseRRule('FREQ=DAILY;INTERVAL=2;COUNT=10');

            expect(rule.freq).toBe('DAILY');
            expect(rule.interval).toBe(2);
        });

        test('should handle RRULE: prefix', () => {
            const rule = Recurrence.parseRRule('RRULE:FREQ=DAILY;COUNT=5');

            expect(rule.freq).toBe('DAILY');
            expect(rule.count).toBe(5);
        });
    });

    describe('formatRRule', () => {
        test('should format simple daily rule', () => {
            const rrule = Recurrence.formatRRule({
                freq: 'DAILY',
                count: 10
            });

            expect(rrule).toBe('RRULE:FREQ=DAILY;COUNT=10');
        });

        test('should format weekly rule with days', () => {
            const rrule = Recurrence.formatRRule({
                freq: 'WEEKLY',
                count: 12,
                byDay: ['MO', 'WE', 'FR']
            });

            expect(rrule).toContain('FREQ=WEEKLY');
            expect(rrule).toContain('COUNT=12');
            expect(rrule).toContain('BYDAY=MO,WE,FR');
        });

        test('should include interval if > 1', () => {
            const rrule = Recurrence.formatRRule({
                freq: 'DAILY',
                interval: 2,
                count: 10
            });

            expect(rrule).toContain('INTERVAL=2');
        });

        test('should not include interval if 1', () => {
            const rrule = Recurrence.formatRRule({
                freq: 'DAILY',
                interval: 1,
                count: 10
            });

            expect(rrule).not.toContain('INTERVAL');
        });
    });

    describe('expandRecurrence - Daily', () => {
        test('should expand daily recurrence', () => {
            const event = {
                uid: 'test',
                title: 'Daily Meeting',
                start: new Date('2025-11-05T10:00:00'),
                end: new Date('2025-11-05T11:00:00'),
                recurrence: 'FREQ=DAILY;COUNT=5'
            };

            const occurrences = Recurrence.expandRecurrence(
                event,
                new Date('2025-11-01'),
                new Date('2025-11-30')
            );

            expect(occurrences).toHaveLength(5);
            expect(occurrences[0].start).toEqual(new Date('2025-11-05T10:00:00'));
            expect(occurrences[1].start).toEqual(new Date('2025-11-06T10:00:00'));
            expect(occurrences[4].start).toEqual(new Date('2025-11-09T10:00:00'));
        });

        test('should expand daily with interval', () => {
            const event = {
                uid: 'test',
                title: 'Every Other Day',
                start: new Date('2025-11-05T10:00:00'),
                recurrence: { freq: 'DAILY', interval: 2, count: 5 }
            };

            const occurrences = Recurrence.expandRecurrence(
                event,
                new Date('2025-11-01'),
                new Date('2025-11-30')
            );

            expect(occurrences).toHaveLength(5);
            expect(occurrences[0].start).toEqual(new Date('2025-11-05T10:00:00'));
            expect(occurrences[1].start).toEqual(new Date('2025-11-07T10:00:00'));
            expect(occurrences[2].start).toEqual(new Date('2025-11-09T10:00:00'));
        });
    });

    describe('expandRecurrence - Weekly', () => {
        test('should expand weekly recurrence', () => {
            const event = {
                uid: 'test',
                title: 'Weekly Meeting',
                start: new Date('2025-11-05T10:00:00'), // Wednesday
                recurrence: 'FREQ=WEEKLY;COUNT=4'
            };

            const occurrences = Recurrence.expandRecurrence(
                event,
                new Date('2025-11-01'),
                new Date('2025-12-31')
            );

            expect(occurrences).toHaveLength(4);
            expect(occurrences[1].start).toEqual(new Date('2025-11-12T10:00:00'));
        });
    });

    describe('expandRecurrence - Monthly', () => {
        test('should expand monthly recurrence', () => {
            const event = {
                uid: 'test',
                title: 'Monthly Report',
                start: new Date('2025-11-15T10:00:00'),
                recurrence: 'FREQ=MONTHLY;COUNT=3'
            };

            const occurrences = Recurrence.expandRecurrence(
                event,
                new Date('2025-11-01'),
                new Date('2026-02-28')
            );

            expect(occurrences).toHaveLength(3);
            expect(occurrences[0].start.getMonth()).toBe(10); // November
            expect(occurrences[1].start.getMonth()).toBe(11); // December
            expect(occurrences[2].start.getMonth()).toBe(0);  // January
        });
    });

    describe('expandRecurrence - Yearly', () => {
        test('should expand yearly recurrence', () => {
            const event = {
                uid: 'test',
                title: 'Birthday',
                start: new Date('2025-11-15T00:00:00'),
                recurrence: 'FREQ=YEARLY;COUNT=3'
            };

            const occurrences = Recurrence.expandRecurrence(
                event,
                new Date('2025-01-01'),
                new Date('2028-12-31')
            );

            expect(occurrences).toHaveLength(3);
            expect(occurrences[0].start.getFullYear()).toBe(2025);
            expect(occurrences[1].start.getFullYear()).toBe(2026);
            expect(occurrences[2].start.getFullYear()).toBe(2027);
        });
    });

    describe('expandRecurrence - UNTIL', () => {
        test('should stop at UNTIL date', () => {
            const event = {
                uid: 'test',
                title: 'Daily Until End',
                start: new Date('2025-11-05T10:00:00'),
                recurrence: {
                    freq: 'DAILY',
                    until: new Date('2025-11-10T00:00:00')
                }
            };

            const occurrences = Recurrence.expandRecurrence(
                event,
                new Date('2025-11-01'),
                new Date('2025-11-30')
            );

            expect(occurrences.length).toBeLessThanOrEqual(6);
            expect(occurrences[occurrences.length - 1].start.getTime()).toBeLessThanOrEqual(
                new Date('2025-11-10T00:00:00').getTime()
            );
        });
    });

    describe('expandRecurrence - Duration', () => {
        test('should maintain event duration', () => {
            const event = {
                uid: 'test',
                title: '1-Hour Meeting',
                start: new Date('2025-11-05T10:00:00'),
                end: new Date('2025-11-05T11:00:00'),
                recurrence: 'FREQ=DAILY;COUNT=3'
            };

            const occurrences = Recurrence.expandRecurrence(
                event,
                new Date('2025-11-01'),
                new Date('2025-11-30')
            );

            occurrences.forEach((occ, index) => {
                const duration = occ.end - occ.start;
                expect(duration).toBe(60 * 60 * 1000); // 1 hour in milliseconds
            });
        });
    });

    describe('expandRecurrence - Metadata', () => {
        test('should add recurring metadata to occurrences', () => {
            const event = {
                uid: 'test',
                title: 'Recurring Event',
                start: new Date('2025-11-05T10:00:00'),
                recurrence: 'FREQ=DAILY;COUNT=3'
            };

            const occurrences = Recurrence.expandRecurrence(
                event,
                new Date('2025-11-01'),
                new Date('2025-11-30')
            );

            occurrences.forEach(occ => {
                expect(occ.isRecurring).toBe(true);
                expect(occ.recurringEventId).toBe('test');
                expect(occ.recurrenceDate).toBeInstanceOf(Date);
                expect(occ.uid).toContain('test_');
            });
        });
    });

    describe('Helper functions', () => {
        test('should create daily recurrence', () => {
            const rule = Recurrence.daily(10, 1);

            expect(rule.freq).toBe('DAILY');
            expect(rule.count).toBe(10);
            expect(rule.interval).toBe(1);
        });

        test('should create weekly recurrence', () => {
            const rule = Recurrence.weekly(12, ['MO', 'WE', 'FR']);

            expect(rule.freq).toBe('WEEKLY');
            expect(rule.count).toBe(12);
            expect(rule.byDay).toEqual(['MO', 'WE', 'FR']);
        });

        test('should create monthly recurrence', () => {
            const rule = Recurrence.monthly(6, 15);

            expect(rule.freq).toBe('MONTHLY');
            expect(rule.count).toBe(6);
            expect(rule.byMonthDay).toEqual([15]);
        });

        test('should create yearly recurrence', () => {
            const rule = Recurrence.yearly(5);

            expect(rule.freq).toBe('YEARLY');
            expect(rule.count).toBe(5);
        });
    });

    describe('Calendar Integration', () => {
        test('should parse recurring event from ICS', () => {
            const ics = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:recurring@test.com
DTSTART:20251105T100000Z
DTEND:20251105T110000Z
SUMMARY:Daily Standup
RRULE:FREQ=DAILY;COUNT=5
END:VEVENT
END:VCALENDAR`;

            calendar.loadICS(ics);

            const events = calendar.getAllEvents();
            expect(events).toHaveLength(1);
            expect(events[0].recurrence).toBeDefined();
            expect(events[0].rrule).toBeDefined();
        });

        test('should get expanded events for month', () => {
            calendar.addEvent({
                title: 'Daily Standup',
                start: new Date('2025-11-05T09:00:00'),
                recurrence: { freq: 'DAILY', count: 20 }
            });

            const events = calendar.getEventsForMonthExpanded(2025, 10); // November

            expect(events.length).toBeGreaterThan(1);
            expect(events[0].isRecurring).toBe(true);
        });

        test('should get all expanded events in range', () => {
            calendar.addEvent({
                title: 'Weekly Meeting',
                start: new Date('2025-11-05T10:00:00'),
                recurrence: { freq: 'WEEKLY', count: 4 }
            });

            const events = calendar.getAllEventsExpanded(
                new Date('2025-11-01'),
                new Date('2025-11-30')
            );

            expect(events.length).toBe(4);
        });

        test('should mix recurring and non-recurring events', () => {
            calendar.addEvent({
                title: 'One-time Event',
                start: new Date('2025-11-10T10:00:00')
            });

            calendar.addEvent({
                title: 'Daily Event',
                start: new Date('2025-11-05T10:00:00'),
                recurrence: { freq: 'DAILY', count: 5 }
            });

            const events = calendar.getAllEventsExpanded(
                new Date('2025-11-01'),
                new Date('2025-11-30')
            );

            expect(events.length).toBe(6); // 1 + 5
        });
    });

    describe('Create recurrence shortcuts', () => {
        test('should create daily recurrence rule', () => {
            const rule = calendar.createDailyRecurrence(10, 2);

            expect(rule.freq).toBe('DAILY');
            expect(rule.count).toBe(10);
            expect(rule.interval).toBe(2);
        });

        test('should create weekly recurrence rule', () => {
            const rule = calendar.createWeeklyRecurrence(8, ['MO', 'WE', 'FR']);

            expect(rule.freq).toBe('WEEKLY');
            expect(rule.byDay).toEqual(['MO', 'WE', 'FR']);
        });

        test('should create monthly recurrence rule', () => {
            const rule = calendar.createMonthlyRecurrence(12, 1);

            expect(rule.freq).toBe('MONTHLY');
            expect(rule.byMonthDay).toEqual([1]);
        });

        test('should create yearly recurrence rule', () => {
            const rule = calendar.createYearlyRecurrence(5);

            expect(rule.freq).toBe('YEARLY');
            expect(rule.count).toBe(5);
        });
    });
});
