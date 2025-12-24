/* ========================================
   EasyKidsBank - Theme Service
   ======================================== */

const ThemeService = {
    // Storage key
    STORAGE_KEY: 'easykidsbank-theme',

    /**
     * Initialize theme service
     */
    init() {
        // Load saved theme on init
        this.loadSavedTheme();
    },

    /**
     * Apply a theme by ID
     * @param {string} themeId - Theme ID to apply
     */
    apply(themeId) {
        // Get theme from ThemePicker
        const theme = ThemePicker.getTheme(themeId);

        // Apply to document
        if (themeId === 'default') {
            document.documentElement.removeAttribute('data-theme');
        } else {
            document.documentElement.setAttribute('data-theme', themeId);
        }

        // Save preference
        Helpers.storage.set(this.STORAGE_KEY, themeId);

        // Update store
        Store.setTheme(themeId);

        // Update theme-color meta tag for mobile browsers
        if (theme) {
            const metaThemeColor = document.querySelector('meta[name="theme-color"]');
            if (metaThemeColor) {
                metaThemeColor.setAttribute('content', theme.colors.primary);
            }
        }
    },

    /**
     * Apply a theme temporarily by ID without saving to localStorage
     * @param {string} themeId - Theme ID to apply
     */
    applyTemporary(themeId) {
        // Get theme from ThemePicker
        const theme = ThemePicker.getTheme(themeId);

        // Apply to document
        if (themeId === 'default') {
            document.documentElement.removeAttribute('data-theme');
        } else {
            document.documentElement.setAttribute('data-theme', themeId);
        }

        // Update store
        Store.setTheme(themeId);

        // Update theme-color meta tag for mobile browsers
        if (theme) {
            const metaThemeColor = document.querySelector('meta[name="theme-color"]');
            if (metaThemeColor) {
                metaThemeColor.setAttribute('content', theme.colors.primary);
            }
        }
    },

    /**
     * Apply custom theme colors
     * @param {object} colors - Custom color values
     */
    applyCustom(colors) {
        const root = document.documentElement;

        // Map custom colors to CSS variables
        const colorMap = {
            primary: '--color-primary',
            primaryLight: '--color-primary-light',
            primaryDark: '--color-primary-dark',
            secondary: '--color-secondary',
            secondaryLight: '--color-secondary-light',
            secondaryDark: '--color-secondary-dark',
            background: '--color-background',
            surface: '--color-surface',
            text: '--color-text',
            textSecondary: '--color-text-secondary',
            textInverse: '--color-text-inverse',
            accent: '--color-accent',
            success: '--color-success',
            warning: '--color-warning',
            error: '--color-error',
            inputBg: '--color-input-bg',
            inputBorder: '--color-input-border',
            divider: '--color-divider'
        };

        // Apply each color
        for (const [key, cssVar] of Object.entries(colorMap)) {
            if (colors[key]) {
                root.style.setProperty(cssVar, colors[key]);
            }
        }

        // Generate light/dark variants if not provided
        if (colors.primary && !colors.primaryLight) {
            root.style.setProperty('--color-primary-light', this.lighten(colors.primary, 20));
        }
        if (colors.primary && !colors.primaryDark) {
            root.style.setProperty('--color-primary-dark', this.darken(colors.primary, 15));
        }
    },

    /**
     * Load saved theme from storage
     */
    loadSavedTheme() {
        const savedTheme = Helpers.storage.get(this.STORAGE_KEY, 'default');
        this.apply(savedTheme);
    },

    /**
     * Get current theme ID
     * @returns {string} Current theme ID
     */
    getCurrentTheme() {
        return Store.getState('currentTheme') || 'default';
    },

    /**
     * Reset to default theme
     */
    reset() {
        this.apply('default');
        document.documentElement.removeAttribute('style');
    },

    /**
     * Lighten a color
     * @param {string} color - Hex color
     * @param {number} percent - Percentage to lighten
     * @returns {string} Lightened hex color
     */
    lighten(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;

        return '#' + (
            0x1000000 +
            (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
            (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
            (B < 255 ? (B < 1 ? 0 : B) : 255)
        ).toString(16).slice(1);
    },

    /**
     * Darken a color
     * @param {string} color - Hex color
     * @param {number} percent - Percentage to darken
     * @returns {string} Darkened hex color
     */
    darken(color, percent) {
        return this.lighten(color, -percent);
    },

    /**
     * Check if a color is dark
     * @param {string} color - Hex color
     * @returns {boolean} True if color is dark
     */
    isDark(color) {
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);

        // Calculate luminance
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance < 0.5;
    },

    /**
     * Get contrasting text color for a background
     * @param {string} backgroundColor - Hex color
     * @returns {string} Black or white hex color
     */
    getContrastColor(backgroundColor) {
        return this.isDark(backgroundColor) ? '#ffffff' : '#2d3436';
    },

    /**
     * Create a custom theme object
     * @param {string} name - Theme name
     * @param {object} colors - Theme colors
     * @returns {object} Theme object
     */
    createCustomTheme(name, colors) {
        return {
            id: 'custom-' + Helpers.generateId(),
            name,
            colors: {
                primary: colors.primary || '#4a90d9',
                secondary: colors.secondary || '#a29bfe',
                background: colors.background || '#f0f4f8',
                surface: colors.surface || '#ffffff',
                text: colors.text || '#2d3436',
                textSecondary: colors.textSecondary || '#636e72',
                accent: colors.accent || '#00cec9',
                success: colors.success || '#00b894',
                warning: colors.warning || '#fdcb6e',
                error: colors.error || '#e17055'
            },
            isCustom: true,
            createdAt: new Date()
        };
    }
};

// Make available globally
window.ThemeService = ThemeService;
