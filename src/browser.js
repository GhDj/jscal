/**
 * Browser Bundle - All-in-one build for browsers
 * Exposes JSCal and all sub-modules as globals
 */

// Import all modules
const ICSParser = require('./ics-parser');
const JSONParser = require('./json-parser');
const CalendarCore = require('./calendar-core');
const Holidays = require('./holidays');
const EventManager = require('./event-manager');
const Recurrence = require('./recurrence');
const { Theme, Themes } = require('./theme');
const { Renderer, DefaultTemplates } = require('./renderer');
const JSCalClass = require('./index');

// Augment JSCal with all exports
JSCalClass.Theme = Theme;
JSCalClass.Themes = Themes;
JSCalClass.Renderer = Renderer;
JSCalClass.DefaultTemplates = DefaultTemplates;
JSCalClass.ICSParser = ICSParser;
JSCalClass.JSONParser = JSONParser;
JSCalClass.CalendarCore = CalendarCore;
JSCalClass.Holidays = Holidays;
JSCalClass.EventManager = EventManager;
JSCalClass.Recurrence = Recurrence;

// Export for module systems
module.exports = JSCalClass;
