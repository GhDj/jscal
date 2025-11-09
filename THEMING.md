# JSCal Theming & Templating Guide

Complete guide to customizing the appearance and layout of your JSCal calendar.

## Table of Contents

- [Theme System](#theme-system)
- [Pre-built Themes](#pre-built-themes)
- [Custom Themes](#custom-themes)
- [Renderer System](#renderer-system)
- [Custom Templates](#custom-templates)
- [CSS Variables Reference](#css-variables-reference)
- [Complete Examples](#complete-examples)

---

## Theme System

JSCal uses a powerful CSS variable-based theme system that allows you to customize colors, fonts, spacing, borders, and shadows without writing CSS.

### Basic Usage

```javascript
const { JSCal, Themes } = require('@jscal/calendar');

// Create calendar with a theme
const calendar = new JSCal({
    theme: Themes.dark
});

// Apply theme to your calendar container
const container = document.getElementById('calendar-container');
calendar.applyTheme(container);

// Switch themes dynamically
calendar.setTheme(Themes.minimal);
calendar.applyTheme(container);
```

### In the Browser

```html
<div id="calendar-container" class="container">
    <!-- Your calendar HTML -->
</div>

<script>
    const calendar = new JSCal();
    calendar.setTheme(Themes.dark);
    calendar.applyTheme(document.querySelector('.container'));
</script>
```

---

## Pre-built Themes

JSCal comes with 5 professionally designed themes ready to use.

### Default Theme
Modern purple gradient theme with rounded corners.

```javascript
calendar.setTheme(Themes.default);
```

**Colors:**
- Primary: `#667eea` (Purple)
- Background: `#ffffff` (White)
- Text: `#333333` (Dark Gray)

### Dark Theme
Sleek dark mode for low-light environments.

```javascript
calendar.setTheme(Themes.dark);
```

**Colors:**
- Primary: `#818cf8` (Light Purple)
- Background: `#1e1e1e` (Dark Gray)
- Text: `#e0e0e0` (Light Gray)

### Minimal Theme
Clean, minimalist black-and-white design with serif fonts.

```javascript
calendar.setTheme(Themes.minimal);
```

**Colors:**
- Primary: `#000000` (Black)
- Background: `#ffffff` (White)
- No border radius or shadows

### Colorful Theme
Bright, playful theme with vibrant colors.

```javascript
calendar.setTheme(Themes.colorful);
```

**Colors:**
- Primary: `#ff6b6b` (Red)
- Secondary: `#4ecdc4` (Teal)
- Background: `#ffe66d` (Yellow)

### Corporate Theme
Professional blue theme for business applications.

```javascript
calendar.setTheme(Themes.corporate);
```

**Colors:**
- Primary: `#003f5c` (Navy Blue)
- Background: `#f8f9fa` (Light Gray)
- Clean, professional styling

---

## Custom Themes

Create your own custom themes to match your brand.

### Creating a Custom Theme

```javascript
const { Theme } = require('@jscal/calendar');

const myTheme = new Theme({
    name: 'my-brand',
    colors: {
        primary: '#ff6600',
        secondary: '#00aaff',
        background: '#ffffff',
        surface: '#f5f5f5',
        text: '#222222',
        textSecondary: '#666666',
        border: '#dddddd',
        hover: '#eeeeee',
        today: '#fff3cd',
        event: '#d1ecf1',
        eventText: '#0c5460'
    },
    fonts: {
        family: 'Inter, sans-serif',
        sizeBase: '14px',
        sizeSmall: '12px',
        sizeLarge: '18px',
        sizeTitle: '24px',
        weightNormal: '400',
        weightBold: '600'
    },
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px'
    },
    borders: {
        radius: '6px',
        radiusSmall: '3px',
        radiusLarge: '12px',
        width: '1px',
        style: 'solid'
    },
    shadows: {
        sm: '0 1px 3px rgba(0,0,0,0.12)',
        md: '0 4px 6px rgba(0,0,0,0.15)',
        lg: '0 10px 25px rgba(0,0,0,0.2)'
    }
});

calendar.setTheme(myTheme);
```

### Theme with Custom CSS

Add custom CSS rules to your theme:

```javascript
const customTheme = new Theme({
    name: 'custom',
    colors: {
        primary: '#667eea'
    },
    customCSS: `
        .event-item {
            border-left: 4px solid var(--jscal-color-primary);
            animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
    `
});
```

### Merging Themes

Extend an existing theme with custom overrides:

```javascript
const customDark = Themes.dark.merge({
    colors: {
        primary: '#ff6b6b',  // Override primary color
        accent: '#00ff00'     // Add new color
    }
});

calendar.setTheme(customDark);
```

### Theme Methods

```javascript
// Get theme values
const primaryColor = myTheme.get('color', 'primary');

// Set theme values
myTheme.set('color', 'primary', '#ff0000');

// Clone theme
const clonedTheme = myTheme.clone();

// Convert to plain object
const themeData = myTheme.toObject();

// Remove theme from element
myTheme.remove(element);
```

---

## Renderer System

The Renderer system allows you to customize how calendar components are rendered as HTML.

### Basic Usage

```javascript
const { Renderer } = require('@jscal/calendar');

const calendar = new JSCal({
    renderer: new Renderer()
});

// Or set renderer later
const customRenderer = new Renderer();
calendar.setRenderer(customRenderer);
```

### Available Templates

The Renderer provides these default templates:

- `dayCell` - Individual day cells in month grid
- `eventItem` - Event list items
- `calendarHeader` - Month/year header with navigation
- `weekdayHeader` - Day names header (Sun, Mon, etc.)
- `monthGrid` - Complete month grid
- `eventDetails` - Event detail popup/modal
- `weekView` - Week view layout

---

## Custom Templates

Override default templates to customize rendering.

### Custom Day Cell Template

```javascript
calendar.setTemplate('dayCell', (data) => {
    const { date, dayNumber, isCurrentMonth, isToday, events } = data;

    return `
        <div class="my-day-cell ${isToday ? 'highlight' : ''}">
            <span class="day-num">${dayNumber}</span>
            ${events.length > 0 ? `
                <div class="event-dots">
                    ${events.map(e => `<span class="dot" style="background: ${e.color}"></span>`).join('')}
                </div>
            ` : ''}
        </div>
    `;
});
```

### Custom Event Item Template

```javascript
calendar.setTemplate('eventItem', (data) => {
    const { event, viewType } = data;

    return `
        <div class="custom-event" data-id="${event.uid}">
            <h4>${event.title}</h4>
            <p>${new Date(event.start).toLocaleString()}</p>
            ${event.priority ? `<span class="priority-${event.priority}">!</span>` : ''}
        </div>
    `;
});
```

### Custom Calendar Header

```javascript
calendar.setTemplate('calendarHeader', (data) => {
    const { year, month, monthName } = data;

    return `
        <header class="cal-header">
            <button onclick="prevMonth()">←</button>
            <h1>${monthName} ${year}</h1>
            <button onclick="nextMonth()">→</button>
        </header>
    `;
});
```

### Rendering with Templates

```javascript
// Render a specific template
const html = calendar.render('dayCell', {
    date: new Date(),
    dayNumber: 15,
    isCurrentMonth: true,
    isToday: true,
    events: []
});

// Inject into DOM
document.getElementById('container').innerHTML = html;
```

### Reset Templates

```javascript
// Reset specific template to default
calendar.getRenderer().resetTemplate('dayCell');

// Reset all templates to defaults
calendar.getRenderer().resetTemplates();
```

---

## CSS Variables Reference

All theme CSS variables and their purposes:

### Colors

```css
--jscal-color-primary         /* Main brand color */
--jscal-color-secondary       /* Secondary brand color */
--jscal-color-background      /* Main background */
--jscal-color-surface         /* Card/panel background */
--jscal-color-text            /* Primary text color */
--jscal-color-textSecondary   /* Secondary text color */
--jscal-color-border          /* Border color */
--jscal-color-hover           /* Hover state background */
--jscal-color-today           /* Today highlight color */
--jscal-color-event           /* Event background */
--jscal-color-eventText       /* Event text color */
```

### Fonts

```css
--jscal-font-family           /* Font family */
--jscal-font-sizeBase         /* Base font size (14px) */
--jscal-font-sizeSmall        /* Small text (12px) */
--jscal-font-sizeLarge        /* Large text (18px) */
--jscal-font-sizeTitle        /* Title text (24px) */
--jscal-font-weightNormal     /* Normal weight (400) */
--jscal-font-weightBold       /* Bold weight (600) */
```

### Spacing

```css
--jscal-spacing-xs            /* Extra small (4px) */
--jscal-spacing-sm            /* Small (8px) */
--jscal-spacing-md            /* Medium (16px) */
--jscal-spacing-lg            /* Large (24px) */
--jscal-spacing-xl            /* Extra large (32px) */
```

### Borders

```css
--jscal-border-radius         /* Default radius (8px) */
--jscal-border-radiusSmall    /* Small radius (4px) */
--jscal-border-radiusLarge    /* Large radius (16px) */
--jscal-border-width          /* Border width (1px) */
--jscal-border-style          /* Border style (solid) */
```

### Shadows

```css
--jscal-shadow-sm             /* Small shadow */
--jscal-shadow-md             /* Medium shadow */
--jscal-shadow-lg             /* Large shadow */
```

### Using CSS Variables Directly

You can also use these variables in your own CSS:

```css
.my-custom-element {
    background: var(--jscal-color-surface);
    color: var(--jscal-color-text);
    padding: var(--jscal-spacing-md);
    border-radius: var(--jscal-border-radius);
    box-shadow: var(--jscal-shadow-sm);
}
```

---

## Complete Examples

### Example 1: Theme Switcher

```html
<select id="theme-selector">
    <option value="default">Default</option>
    <option value="dark">Dark</option>
    <option value="minimal">Minimal</option>
    <option value="colorful">Colorful</option>
    <option value="corporate">Corporate</option>
</select>

<div id="calendar"></div>

<script>
    const calendar = new JSCal();
    const container = document.getElementById('calendar');

    // Set initial theme
    calendar.setTheme(Themes.default);
    calendar.applyTheme(container);

    // Theme switcher
    document.getElementById('theme-selector').addEventListener('change', (e) => {
        const themeName = e.target.value;
        calendar.setTheme(Themes[themeName]);
        calendar.applyTheme(container);
    });
</script>
```

### Example 2: Custom Brand Theme

```javascript
// Create theme matching your brand
const brandTheme = new Theme({
    name: 'my-company',
    colors: {
        primary: '#1a73e8',        // Company blue
        secondary: '#34a853',      // Company green
        background: '#ffffff',
        surface: '#f8f9fa',
        text: '#202124',
        textSecondary: '#5f6368',
        border: '#dadce0',
        hover: '#f1f3f4',
        today: '#e8f0fe',
        event: '#d2e3fc',
        eventText: '#185abc'
    },
    fonts: {
        family: '"Google Sans", Roboto, sans-serif',
        sizeBase: '14px',
        weightBold: '500'
    },
    borders: {
        radius: '8px'
    }
});

calendar.setTheme(brandTheme);
```

### Example 3: Custom Event Rendering

```javascript
// Custom event rendering with icons
calendar.setTemplate('eventItem', ({ event, viewType }) => {
    const icons = {
        'Work': '💼',
        'Personal': '🏠',
        'Meeting': '👥',
        'Holiday': '🏖️'
    };

    const icon = event.categories && event.categories[0]
        ? icons[event.categories[0]] || '📅'
        : '📅';

    return `
        <div class="event" style="border-left-color: ${event.color || '#ccc'}">
            <span class="icon">${icon}</span>
            <div class="event-content">
                <strong>${event.title}</strong>
                ${event.isRecurring ? '<span class="recurring">🔄</span>' : ''}
                <div class="time">${new Date(event.start).toLocaleTimeString()}</div>
            </div>
        </div>
    `;
});
```

### Example 4: Dark Mode Toggle

```javascript
let isDarkMode = false;

function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    const theme = isDarkMode ? Themes.dark : Themes.default;
    calendar.setTheme(theme);
    calendar.applyTheme(document.querySelector('.container'));

    // Save preference
    localStorage.setItem('darkMode', isDarkMode);
}

// Load saved preference
const savedMode = localStorage.getItem('darkMode') === 'true';
if (savedMode) {
    toggleDarkMode();
}
```

### Example 5: Completely Custom Renderer

```javascript
class CustomRenderer extends Renderer {
    constructor() {
        super({
            dayCell: (data) => this.renderCustomDay(data),
            eventItem: (data) => this.renderCustomEvent(data)
        });
    }

    renderCustomDay({ date, dayNumber, events }) {
        const hasEvents = events.length > 0;
        const eventCount = events.length;

        return `
            <div class="custom-day ${hasEvents ? 'has-events' : ''}">
                <div class="day-header">
                    <span class="number">${dayNumber}</span>
                    ${hasEvents ? `<span class="badge">${eventCount}</span>` : ''}
                </div>
                <div class="event-preview">
                    ${events.slice(0, 3).map(e => `
                        <div class="mini-event" style="background: ${e.color}">
                            ${e.title.substring(0, 15)}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderCustomEvent({ event }) {
        return `
            <article class="event-card">
                <header>
                    <h3>${event.title}</h3>
                    ${event.priority ? `<span class="priority">${event.priority}</span>` : ''}
                </header>
                <time>${new Date(event.start).toLocaleString()}</time>
                ${event.location ? `<address>${event.location}</address>` : ''}
            </article>
        `;
    }
}

calendar.setRenderer(new CustomRenderer());
```

---

## Best Practices

1. **Use CSS Variables**: Always reference CSS variables with fallbacks:
   ```css
   color: var(--jscal-color-text, #333);
   ```

2. **Theme Consistency**: Keep color palettes consistent across your theme.

3. **Accessibility**: Ensure sufficient color contrast for readability.

4. **Performance**: Avoid complex selectors in custom CSS.

5. **Mobile-Friendly**: Test themes on different screen sizes.

6. **Template Safety**: Always escape user-generated content in templates.

---

## TypeScript Support

Theme and Renderer are fully typed (types coming in v1.3.0):

```typescript
import { JSCal, Theme, Themes, Renderer } from '@jscal/calendar';

const theme: Theme = new Theme({
    name: 'custom',
    colors: {
        primary: '#667eea'
    }
});

const calendar: JSCal = new JSCal({ theme });
```

---

## FAQ

**Q: Can I change individual theme properties after creation?**
A: Yes! Use `theme.set('color', 'primary', '#ff0000')`.

**Q: How do I persist theme selection?**
A: Save the theme name to localStorage and load on initialization.

**Q: Can I use SCSS/LESS variables?**
A: Yes, compile them to CSS variables that JSCal can use.

**Q: Do themes work with all browsers?**
A: Yes, CSS variables are supported in all modern browsers (IE11+).

**Q: Can I animate theme changes?**
A: Yes! Add transition properties to your CSS:
```css
.container * {
    transition: background-color 0.3s, color 0.3s;
}
```

---

## Resources

- [Full API Documentation](./README.md)
- [Theme Examples](./examples/themes/)
- [Renderer Examples](./examples/renderers/)
- [Contributing Guidelines](./CONTRIBUTING.md)

---

**Version**: 1.2.0
**Last Updated**: November 2025
