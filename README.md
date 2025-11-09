# JSCal - JavaScript Calendar

A lightweight, zero-dependency JavaScript calendar library that can read events from ICS streams or JSON files.

## Features

- **Event Parsing**: ICS/iCalendar (RFC 5545) and JSON formats
- **CRUD Operations**: Add, update, delete, and find events
- **Recurring Events**: Full RRULE support (DAILY, WEEKLY, MONTHLY, YEARLY)
- **Mini Calendar Navigator**: Compact month view with event indicators
- **Detailed Calendar View**: Full calendar with event titles and descriptions
- **Categories & Priorities**: Organize and filter events
- **Conflict Detection**: Identify overlapping events
- **Holiday Support**: Built-in holidays for US, UK, FR, CA
- **Theming**: 5 pre-built themes + custom theme support
- **Templating**: Customizable HTML rendering for calendar components
- **Month/Week Views**: Flexible calendar grid generation
- **Event Search**: Search and filter by multiple criteria
- **Zero Dependencies**: Lightweight and fast
- **Works Everywhere**: Node.js and browsers (CommonJS, ES Modules, UMD)
- **Well Tested**: 208 passing tests with 80% coverage
- **TypeScript Support**: Type definitions (coming in v1.3.0)

## Installation

```bash
npm install jscal-calendar
```

## Quick Start

### Node.js

```javascript
const JSCal = require('jscal-calendar');

const calendar = new JSCal();

// Load from ICS file
const fs = require('fs');
const icsContent = fs.readFileSync('events.ics', 'utf-8');
calendar.loadICS(icsContent);

// Load from JSON
const jsonEvents = [
  {
    title: "Team Meeting",
    start: "2025-11-05T10:00:00",
    end: "2025-11-05T11:00:00",
    description: "Weekly sync"
  }
];
calendar.loadJSON(jsonEvents);

// Get events for a specific date
const events = calendar.getEventsForDate(new Date('2025-11-05'));
console.log(events);
```

### Browser (UMD)

```html
<script src="node_modules/jscal-calendar/dist/index.umd.js"></script>
<script>
  const calendar = new JSCal();

  // Load from URL
  calendar.loadICSFromURL('https://example.com/calendar.ics')
    .then(events => {
      console.log('Loaded events:', events);
    });
</script>
```

### ES Modules

```javascript
import JSCal from 'jscal-calendar';

const calendar = new JSCal();
calendar.loadJSON(myEvents);
```

## API Reference

### Main Class: `JSCal`

#### Constructor

```javascript
const calendar = new JSCal();
```

#### Methods

##### `loadICS(icsContent: string): Array`
Load events from ICS string content.

```javascript
const events = calendar.loadICS(icsString);
```

##### `loadICSFromURL(url: string): Promise<Array>`
Load events from ICS URL (works in both Node.js and browser).

```javascript
await calendar.loadICSFromURL('https://example.com/calendar.ics');
```

##### `loadJSON(jsonData: string | Object): Array`
Load events from JSON string or object.

```javascript
calendar.loadJSON([
  { title: "Event", start: "2025-11-05T10:00:00" }
]);
```

##### `addEvents(events: Array | Object): void`
Add custom events to the calendar.

```javascript
calendar.addEvents({
  title: "Custom Event",
  start: new Date(),
  end: new Date()
});
```

##### `clearEvents(): void`
Remove all events from the calendar.

```javascript
calendar.clearEvents();
```

##### `getEventsForDate(date: Date): Array`
Get all events for a specific date.

```javascript
const events = calendar.getEventsForDate(new Date('2025-11-05'));
```

##### `getEventsInRange(startDate: Date, endDate: Date): Array`
Get events within a date range.

```javascript
const events = calendar.getEventsInRange(
  new Date('2025-11-01'),
  new Date('2025-11-30')
);
```

##### `getEventsForMonth(year: number, month: number): Array`
Get all events for a specific month (month is 0-indexed).

```javascript
const events = calendar.getEventsForMonth(2025, 10); // November 2025
```

##### `getMonthGrid(year: number, month: number): Object`
Get calendar grid data for rendering a month view.

```javascript
const grid = calendar.getMonthGrid(2025, 10);
// Returns: { year, month, grid: [...], totalEvents }
```

##### `getAllEvents(): Array`
Get all events sorted by start date.

```javascript
const allEvents = calendar.getAllEvents();
```

##### `searchEvents(query: string): Array`
Search events by title, description, or location.

```javascript
const results = calendar.searchEvents('meeting');
```

### Standalone Parsers

You can also use the parsers independently:

```javascript
const { ICSParser, JSONParser } = require('jscal-calendar');

// Parse ICS
const icsEvents = ICSParser.parse(icsString);

// Parse JSON
const jsonEvents = JSONParser.parse(jsonString);
```

## Event Object Format

All events are normalized to this format:

```javascript
{
  title: string,        // Event title
  start: Date,          // Start date/time
  end: Date | null,     // End date/time (optional)
  description: string,  // Event description
  location: string,     // Event location
  uid: string          // Unique identifier
}
```

## JSON Input Format

JSCal accepts flexible JSON formats:

```json
[
  {
    "title": "Event Title",
    "start": "2025-11-15T10:00:00",
    "end": "2025-11-15T11:00:00",
    "description": "Event description",
    "location": "Office"
  }
]
```

Alternative field names are also supported:
- `title`, `summary`, or `name` for the event title
- `start`, `startDate`, or `startTime` for the start date
- `end`, `endDate`, or `endTime` for the end date
- `description` or `desc` for the description
- `location` or `place` for the location

## ICS Support

Supports standard ICS/iCalendar format (RFC 5545):

- `VEVENT` components
- `DTSTART` and `DTEND` (both date and datetime formats)
- `SUMMARY`, `DESCRIPTION`, `LOCATION`
- Line folding
- Text escaping (`\n`, `\,`, `\;`, `\\`)
- UTC and local time formats

## Development

### Running Tests

```bash
npm test
```

### Building

```bash
npm run build
```

### Running the Demo

```bash
npm start
```

Then open http://localhost:8080 in your browser.

## Theming & Customization

JSCal includes a powerful theming system with 5 pre-built themes and support for custom themes.

### Using Pre-built Themes

```javascript
const { JSCal, Themes } = require('jscal-calendar');

const calendar = new JSCal({ theme: Themes.dark });
calendar.applyTheme(document.getElementById('calendar-container'));
```

**Available themes:**
- `Themes.default` - Modern purple gradient theme
- `Themes.dark` - Dark mode theme
- `Themes.minimal` - Clean minimal theme
- `Themes.colorful` - Bright, vibrant theme
- `Themes.corporate` - Professional blue theme

### Creating Custom Themes

```javascript
const { Theme } = require('jscal-calendar');

const customTheme = new Theme({
    name: 'my-theme',
    colors: {
        primary: '#667eea',
        background: '#ffffff',
        text: '#333333'
    },
    fonts: {
        family: 'Inter, sans-serif',
        sizeBase: '14px'
    },
    spacing: {
        md: '16px',
        lg: '24px'
    }
});

calendar.setTheme(customTheme);
```

### Custom Templates

Customize how calendar components are rendered:

```javascript
calendar.setTemplate('eventItem', ({ event }) => `
    <div class="my-event">
        <h4>${event.title}</h4>
        <p>${new Date(event.start).toLocaleString()}</p>
    </div>
`);
```

For complete theming documentation, see [THEMING.md](./THEMING.md).

## Examples

See the demo files for a complete example:
- `index.html` - Interactive calendar UI with theme switcher
- `calendar.js` - Calendar rendering with DOM
- `sample-events.json` - Sample JSON events
- `sample-events.ics` - Sample ICS events

## Browser Compatibility

- Modern browsers (ES6+)
- Node.js 14+

## Documentation

- **[THEMING.md](THEMING.md)** - Complete theming and customization guide
- **[SESSION_NOTES.md](SESSION_NOTES.md)** - Development session notes and continuation guide
- **[WORDPRESS_INTEGRATION.md](WORDPRESS_INTEGRATION.md)** - WordPress plugin integration guide
- **[WORDPRESS_FILES.md](WORDPRESS_FILES.md)** - Quick guide: Which files to copy for WordPress

## License

MIT License - see LICENSE file for details

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Screenshots

The demo includes:
- **Mini Calendar Navigator**: Compact dark-themed month selector with event indicators
- **Detailed Calendar**: Full calendar view with event titles and descriptions
- **Event Details**: Click any event to see full details in a popup
- **Theme Switcher**: Toggle between 5 pre-built themes
- **File Import**: Load events from ICS or JSON files

## Links

- GitHub: https://github.com/GhDj/jscal
- Issues: https://github.com/GhDj/jscal/issues
- npm: https://www.npmjs.com/package/jscal-calendar
