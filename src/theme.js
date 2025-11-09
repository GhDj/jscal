/**
 * Theme System
 * Provides theming capabilities with CSS variables
 */

class Theme {
    constructor(options = {}) {
        this.name = options.name || 'default';
        this.colors = options.colors || {};
        this.fonts = options.fonts || {};
        this.spacing = options.spacing || {};
        this.borders = options.borders || {};
        this.shadows = options.shadows || {};
        this.customCSS = options.customCSS || '';
    }

    /**
     * Apply theme to DOM element
     * @param {HTMLElement} element - Element to apply theme to
     */
    apply(element) {
        if (!element) {
            console.warn('No element provided to apply theme');
            return;
        }

        // Apply CSS variables
        this._applyCSSVariables(element);

        // Add theme class
        element.classList.add(`jscal-theme-${this.name}`);

        // Apply custom CSS if provided
        if (this.customCSS) {
            this._injectCustomCSS();
        }
    }

    /**
     * Apply CSS variables to element
     * @private
     */
    _applyCSSVariables(element) {
        const style = element.style;

        // Colors
        Object.entries(this.colors).forEach(([key, value]) => {
            style.setProperty(`--jscal-color-${key}`, value);
        });

        // Fonts
        Object.entries(this.fonts).forEach(([key, value]) => {
            style.setProperty(`--jscal-font-${key}`, value);
        });

        // Spacing
        Object.entries(this.spacing).forEach(([key, value]) => {
            style.setProperty(`--jscal-spacing-${key}`, value);
        });

        // Borders
        Object.entries(this.borders).forEach(([key, value]) => {
            style.setProperty(`--jscal-border-${key}`, value);
        });

        // Shadows
        Object.entries(this.shadows).forEach(([key, value]) => {
            style.setProperty(`--jscal-shadow-${key}`, value);
        });
    }

    /**
     * Inject custom CSS into document
     * @private
     */
    _injectCustomCSS() {
        const styleId = `jscal-theme-${this.name}-custom`;

        // Remove existing style if present
        const existing = document.getElementById(styleId);
        if (existing) {
            existing.remove();
        }

        // Create and inject new style
        const styleElement = document.createElement('style');
        styleElement.id = styleId;
        styleElement.textContent = this.customCSS;
        document.head.appendChild(styleElement);
    }

    /**
     * Remove theme from element
     * @param {HTMLElement} element - Element to remove theme from
     */
    remove(element) {
        if (!element) return;

        element.classList.remove(`jscal-theme-${this.name}`);

        // Remove CSS variables
        const style = element.style;
        const allKeys = [
            ...Object.keys(this.colors).map(k => `--jscal-color-${k}`),
            ...Object.keys(this.fonts).map(k => `--jscal-font-${k}`),
            ...Object.keys(this.spacing).map(k => `--jscal-spacing-${k}`),
            ...Object.keys(this.borders).map(k => `--jscal-border-${k}`),
            ...Object.keys(this.shadows).map(k => `--jscal-shadow-${k}`)
        ];

        allKeys.forEach(key => {
            style.removeProperty(key);
        });
    }

    /**
     * Get CSS variable value
     * @param {string} category - Category (color, font, etc.)
     * @param {string} key - Key within category
     * @returns {string} Value
     */
    get(category, key) {
        const map = {
            color: this.colors,
            font: this.fonts,
            spacing: this.spacing,
            border: this.borders,
            shadow: this.shadows
        };

        return map[category]?.[key];
    }

    /**
     * Set CSS variable value
     * @param {string} category - Category
     * @param {string} key - Key
     * @param {string} value - Value
     */
    set(category, key, value) {
        const map = {
            color: this.colors,
            font: this.fonts,
            spacing: this.spacing,
            border: this.borders,
            shadow: this.shadows
        };

        if (map[category]) {
            map[category][key] = value;
        }
    }

    /**
     * Merge with another theme
     * @param {Theme|Object} otherTheme - Theme to merge
     * @returns {Theme} New merged theme
     */
    merge(otherTheme) {
        const merged = new Theme({
            name: this.name,
            colors: { ...this.colors, ...(otherTheme.colors || {}) },
            fonts: { ...this.fonts, ...(otherTheme.fonts || {}) },
            spacing: { ...this.spacing, ...(otherTheme.spacing || {}) },
            borders: { ...this.borders, ...(otherTheme.borders || {}) },
            shadows: { ...this.shadows, ...(otherTheme.shadows || {}) },
            customCSS: this.customCSS + (otherTheme.customCSS || '')
        });

        return merged;
    }

    /**
     * Clone theme
     * @returns {Theme} Cloned theme
     */
    clone() {
        return new Theme({
            name: this.name,
            colors: { ...this.colors },
            fonts: { ...this.fonts },
            spacing: { ...this.spacing },
            borders: { ...this.borders },
            shadows: { ...this.shadows },
            customCSS: this.customCSS
        });
    }

    /**
     * Convert to plain object
     * @returns {Object} Plain object representation
     */
    toObject() {
        return {
            name: this.name,
            colors: this.colors,
            fonts: this.fonts,
            spacing: this.spacing,
            borders: this.borders,
            shadows: this.shadows,
            customCSS: this.customCSS
        };
    }
}

/**
 * Pre-built themes
 */
const Themes = {
    /**
     * Default theme
     */
    default: new Theme({
        name: 'default',
        colors: {
            primary: '#667eea',
            secondary: '#764ba2',
            background: '#ffffff',
            surface: '#f8f9ff',
            text: '#333333',
            textSecondary: '#666666',
            border: '#e0e0e0',
            hover: '#f0f0f0',
            today: '#e8ebff',
            event: '#fff4e6',
            eventText: '#ff6b6b'
        },
        fonts: {
            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
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
            radius: '8px',
            radiusSmall: '4px',
            radiusLarge: '16px',
            width: '1px',
            style: 'solid'
        },
        shadows: {
            sm: '0 2px 4px rgba(0, 0, 0, 0.1)',
            md: '0 4px 12px rgba(0, 0, 0, 0.15)',
            lg: '0 8px 24px rgba(0, 0, 0, 0.2)'
        }
    }),

    /**
     * Dark theme
     */
    dark: new Theme({
        name: 'dark',
        colors: {
            primary: '#818cf8',
            secondary: '#a78bfa',
            background: '#1e1e1e',
            surface: '#2d2d2d',
            text: '#e0e0e0',
            textSecondary: '#a0a0a0',
            border: '#404040',
            hover: '#3a3a3a',
            today: '#3b3f5c',
            event: '#4a3f2f',
            eventText: '#fbbf24'
        },
        fonts: {
            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
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
            radius: '8px',
            radiusSmall: '4px',
            radiusLarge: '16px',
            width: '1px',
            style: 'solid'
        },
        shadows: {
            sm: '0 2px 4px rgba(0, 0, 0, 0.3)',
            md: '0 4px 12px rgba(0, 0, 0, 0.4)',
            lg: '0 8px 24px rgba(0, 0, 0, 0.5)'
        }
    }),

    /**
     * Light minimal theme
     */
    minimal: new Theme({
        name: 'minimal',
        colors: {
            primary: '#000000',
            secondary: '#333333',
            background: '#ffffff',
            surface: '#fafafa',
            text: '#000000',
            textSecondary: '#666666',
            border: '#e5e5e5',
            hover: '#f5f5f5',
            today: '#f0f0f0',
            event: '#f8f8f8',
            eventText: '#000000'
        },
        fonts: {
            family: 'Georgia, serif',
            sizeBase: '14px',
            sizeSmall: '12px',
            sizeLarge: '18px',
            sizeTitle: '24px',
            weightNormal: '400',
            weightBold: '500'
        },
        spacing: {
            xs: '2px',
            sm: '6px',
            md: '12px',
            lg: '18px',
            xl: '24px'
        },
        borders: {
            radius: '0px',
            radiusSmall: '0px',
            radiusLarge: '0px',
            width: '1px',
            style: 'solid'
        },
        shadows: {
            sm: 'none',
            md: 'none',
            lg: 'none'
        }
    }),

    /**
     * Colorful theme
     */
    colorful: new Theme({
        name: 'colorful',
        colors: {
            primary: '#ff6b6b',
            secondary: '#4ecdc4',
            background: '#ffe66d',
            surface: '#fff',
            text: '#292f36',
            textSecondary: '#4a5568',
            border: '#ffd93d',
            hover: '#fff9e6',
            today: '#ff9a9a',
            event: '#a8e6cf',
            eventText: '#2d5f3f'
        },
        fonts: {
            family: 'Comic Sans MS, cursive',
            sizeBase: '14px',
            sizeSmall: '12px',
            sizeLarge: '18px',
            sizeTitle: '26px',
            weightNormal: '400',
            weightBold: '700'
        },
        spacing: {
            xs: '6px',
            sm: '10px',
            md: '18px',
            lg: '28px',
            xl: '36px'
        },
        borders: {
            radius: '12px',
            radiusSmall: '6px',
            radiusLarge: '20px',
            width: '2px',
            style: 'solid'
        },
        shadows: {
            sm: '0 3px 6px rgba(0, 0, 0, 0.15)',
            md: '0 6px 16px rgba(0, 0, 0, 0.2)',
            lg: '0 10px 30px rgba(0, 0, 0, 0.25)'
        }
    }),

    /**
     * Corporate/Professional theme
     */
    corporate: new Theme({
        name: 'corporate',
        colors: {
            primary: '#003f5c',
            secondary: '#2f4b7c',
            background: '#f8f9fa',
            surface: '#ffffff',
            text: '#212529',
            textSecondary: '#6c757d',
            border: '#dee2e6',
            hover: '#e9ecef',
            today: '#d7e3f4',
            event: '#e7f1ff',
            eventText: '#003f5c'
        },
        fonts: {
            family: 'Arial, Helvetica, sans-serif',
            sizeBase: '13px',
            sizeSmall: '11px',
            sizeLarge: '16px',
            sizeTitle: '20px',
            weightNormal: '400',
            weightBold: '600'
        },
        spacing: {
            xs: '4px',
            sm: '8px',
            md: '12px',
            lg: '20px',
            xl: '28px'
        },
        borders: {
            radius: '4px',
            radiusSmall: '2px',
            radiusLarge: '8px',
            width: '1px',
            style: 'solid'
        },
        shadows: {
            sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
            md: '0 2px 8px rgba(0, 0, 0, 0.12)',
            lg: '0 4px 16px rgba(0, 0, 0, 0.15)'
        }
    })
};

// Export for CommonJS and ES modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Theme, Themes };
}
