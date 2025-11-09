/**
 * Theme System Tests
 * @jest-environment jsdom
 */

const { Theme, Themes } = require('../src/theme');

describe('Theme Class', () => {
    test('should create a theme with default values', () => {
        const theme = new Theme();
        expect(theme.name).toBe('default');
        expect(theme.colors).toEqual({});
        expect(theme.fonts).toEqual({});
        expect(theme.spacing).toEqual({});
        expect(theme.borders).toEqual({});
        expect(theme.shadows).toEqual({});
        expect(theme.customCSS).toBe('');
    });

    test('should create a theme with custom values', () => {
        const theme = new Theme({
            name: 'custom',
            colors: {
                primary: '#ff0000',
                secondary: '#00ff00'
            },
            fonts: {
                family: 'Arial'
            }
        });

        expect(theme.name).toBe('custom');
        expect(theme.colors.primary).toBe('#ff0000');
        expect(theme.colors.secondary).toBe('#00ff00');
        expect(theme.fonts.family).toBe('Arial');
    });

    test('should apply theme to element', () => {
        const theme = new Theme({
            name: 'test',
            colors: {
                primary: '#667eea',
                background: '#ffffff'
            }
        });

        const element = document.createElement('div');
        theme.apply(element);

        expect(element.classList.contains('jscal-theme-test')).toBe(true);
        expect(element.style.getPropertyValue('--jscal-color-primary')).toBe('#667eea');
        expect(element.style.getPropertyValue('--jscal-color-background')).toBe('#ffffff');
    });

    test('should handle null element in apply', () => {
        const theme = new Theme();
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

        theme.apply(null);

        expect(consoleSpy).toHaveBeenCalledWith('No element provided to apply theme');
        consoleSpy.mockRestore();
    });

    test('should remove theme from element', () => {
        const theme = new Theme({
            name: 'test',
            colors: {
                primary: '#667eea'
            }
        });

        const element = document.createElement('div');
        theme.apply(element);

        expect(element.classList.contains('jscal-theme-test')).toBe(true);

        theme.remove(element);

        expect(element.classList.contains('jscal-theme-test')).toBe(false);
        expect(element.style.getPropertyValue('--jscal-color-primary')).toBe('');
    });

    test('should get theme values', () => {
        const theme = new Theme({
            colors: {
                primary: '#667eea'
            },
            fonts: {
                family: 'Arial'
            }
        });

        expect(theme.get('color', 'primary')).toBe('#667eea');
        expect(theme.get('font', 'family')).toBe('Arial');
        expect(theme.get('color', 'nonexistent')).toBeUndefined();
        expect(theme.get('invalid', 'key')).toBeUndefined();
    });

    test('should set theme values', () => {
        const theme = new Theme();

        theme.set('color', 'primary', '#ff0000');
        theme.set('font', 'family', 'Helvetica');

        expect(theme.colors.primary).toBe('#ff0000');
        expect(theme.fonts.family).toBe('Helvetica');
    });

    test('should merge themes', () => {
        const theme1 = new Theme({
            name: 'base',
            colors: {
                primary: '#667eea',
                secondary: '#764ba2'
            },
            fonts: {
                family: 'Arial'
            },
            customCSS: '.base { color: blue; }'
        });

        const theme2 = new Theme({
            colors: {
                secondary: '#ff0000',
                tertiary: '#00ff00'
            },
            fonts: {
                size: '16px'
            },
            customCSS: '.override { color: red; }'
        });

        const merged = theme1.merge(theme2);

        expect(merged.name).toBe('base');
        expect(merged.colors.primary).toBe('#667eea');
        expect(merged.colors.secondary).toBe('#ff0000'); // Overridden
        expect(merged.colors.tertiary).toBe('#00ff00'); // Added
        expect(merged.fonts.family).toBe('Arial');
        expect(merged.fonts.size).toBe('16px');
        expect(merged.customCSS).toBe('.base { color: blue; }.override { color: red; }');
    });

    test('should clone theme', () => {
        const original = new Theme({
            name: 'original',
            colors: {
                primary: '#667eea'
            }
        });

        const clone = original.clone();

        expect(clone).not.toBe(original);
        expect(clone.name).toBe('original');
        expect(clone.colors.primary).toBe('#667eea');

        // Modify clone shouldn't affect original
        clone.colors.primary = '#ff0000';
        expect(original.colors.primary).toBe('#667eea');
    });

    test('should convert to plain object', () => {
        const theme = new Theme({
            name: 'test',
            colors: {
                primary: '#667eea'
            },
            fonts: {
                family: 'Arial'
            }
        });

        const obj = theme.toObject();

        expect(obj).toEqual({
            name: 'test',
            colors: {
                primary: '#667eea'
            },
            fonts: {
                family: 'Arial'
            },
            spacing: {},
            borders: {},
            shadows: {},
            customCSS: ''
        });
    });

    test('should inject custom CSS', () => {
        const theme = new Theme({
            name: 'custom-css-theme',
            customCSS: '.test { color: red; }'
        });

        const element = document.createElement('div');
        theme.apply(element);

        const styleElement = document.getElementById('jscal-theme-custom-css-theme-custom');
        expect(styleElement).not.toBeNull();
        expect(styleElement.textContent).toBe('.test { color: red; }');

        // Clean up
        styleElement.remove();
    });
});

describe('Pre-built Themes', () => {
    test('should have default theme', () => {
        expect(Themes.default).toBeInstanceOf(Theme);
        expect(Themes.default.name).toBe('default');
        expect(Themes.default.colors.primary).toBeDefined();
    });

    test('should have dark theme', () => {
        expect(Themes.dark).toBeInstanceOf(Theme);
        expect(Themes.dark.name).toBe('dark');
        expect(Themes.dark.colors.background).toBe('#1e1e1e');
    });

    test('should have minimal theme', () => {
        expect(Themes.minimal).toBeInstanceOf(Theme);
        expect(Themes.minimal.name).toBe('minimal');
        expect(Themes.minimal.borders.radius).toBe('0px');
    });

    test('should have colorful theme', () => {
        expect(Themes.colorful).toBeInstanceOf(Theme);
        expect(Themes.colorful.name).toBe('colorful');
        expect(Themes.colorful.colors.background).toBe('#ffe66d');
    });

    test('should have corporate theme', () => {
        expect(Themes.corporate).toBeInstanceOf(Theme);
        expect(Themes.corporate.name).toBe('corporate');
        expect(Themes.corporate.colors.primary).toBe('#003f5c');
    });

    test('all themes should have required properties', () => {
        const themeNames = ['default', 'dark', 'minimal', 'colorful', 'corporate'];

        themeNames.forEach(name => {
            const theme = Themes[name];
            expect(theme).toBeInstanceOf(Theme);
            expect(theme.colors).toBeDefined();
            expect(theme.fonts).toBeDefined();
            expect(theme.spacing).toBeDefined();
            expect(theme.borders).toBeDefined();
            expect(theme.shadows).toBeDefined();
        });
    });
});
