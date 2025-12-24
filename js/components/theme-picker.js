/* ========================================
   EasyKidsBank - Theme Picker Component
   ======================================== */

const ThemePicker = {
    // Pre-defined themes
    themes: {
        'default': {
            name: 'Friendly Blue',
            category: 'cool',
            colors: {
                primary: '#4a90d9',
                secondary: '#a29bfe',
                background: '#f0f4f8',
                accent: '#00cec9'
            }
        },
        'ocean-blue': {
            name: 'Ocean Blue',
            category: 'cool',
            colors: {
                primary: '#0984e3',
                secondary: '#00cec9',
                background: '#e8f4f8',
                accent: '#00cec9'
            }
        },
        'forest-green': {
            name: 'Forest Adventure',
            category: 'cool',
            colors: {
                primary: '#00b894',
                secondary: '#81c784',
                background: '#e8f5e9',
                accent: '#26de81'
            }
        },
        'sunset-orange': {
            name: 'Sunset Glow',
            category: 'warm',
            colors: {
                primary: '#e17055',
                secondary: '#fdcb6e',
                background: '#fff3e0',
                accent: '#ff9f43'
            }
        },
        'berry-pink': {
            name: 'Berry Blast',
            category: 'warm',
            colors: {
                primary: '#e84393',
                secondary: '#a29bfe',
                background: '#fce4ec',
                accent: '#ff7675'
            }
        },
        'space-adventure': {
            name: 'Space Adventure',
            category: 'fun',
            colors: {
                primary: '#6c5ce7',
                secondary: '#00cec9',
                background: '#1e1e2e',
                accent: '#00cec9'
            }
        },
        'rainbow-party': {
            name: 'Rainbow Party',
            category: 'fun',
            colors: {
                primary: '#ff6b6b',
                secondary: '#feca57',
                background: '#f8f9fa',
                accent: '#48dbfb'
            }
        },
        'lavender-dreams': {
            name: 'Lavender Dreams',
            category: 'calm',
            colors: {
                primary: '#9b59b6',
                secondary: '#ce93d8',
                background: '#f3e5f5',
                accent: '#ab47bc'
            }
        },
        'mint-fresh': {
            name: 'Mint Fresh',
            category: 'calm',
            colors: {
                primary: '#26a69a',
                secondary: '#4db6ac',
                background: '#e0f2f1',
                accent: '#4db6ac'
            }
        }
    },

    /**
     * Create a theme preview
     * @param {string} themeId - Theme ID
     * @param {object} theme - Theme object
     * @param {boolean} selected - Whether this theme is selected
     * @returns {string} HTML string
     */
    preview(themeId, theme, selected = false) {
        const colors = theme.colors;

        return `
            <div class="theme-option ${selected ? 'selected' : ''}" data-theme-id="${themeId}" role="button" tabindex="0">
                <div class="theme-preview">
                    <div class="theme-preview-stripe" style="background-color: ${colors.primary}"></div>
                    <div class="theme-preview-stripe" style="background-color: ${colors.secondary}"></div>
                    <div class="theme-preview-stripe" style="background-color: ${colors.background}"></div>
                    <div class="theme-preview-stripe" style="background-color: ${colors.accent}"></div>
                </div>
                <div class="theme-name">${Helpers.escapeHtml(theme.name)}</div>
                ${selected ? '<div class="theme-selected-badge">✓</div>' : ''}
            </div>
        `;
    },

    /**
     * Create the theme picker grid
     * @param {string} currentTheme - Currently selected theme ID
     * @param {array} customThemes - Array of custom theme objects
     * @returns {string} HTML string
     */
    create(currentTheme = 'default', customThemes = []) {
        let html = '<div class="theme-picker">';

        // Category labels
        const categories = {
            cool: 'Cool',
            warm: 'Warm',
            fun: 'Fun',
            calm: 'Calm',
            custom: 'My Themes'
        };

        // Group themes by category
        const groupedThemes = {};
        for (const [id, theme] of Object.entries(this.themes)) {
            const category = theme.category || 'cool';
            if (!groupedThemes[category]) {
                groupedThemes[category] = [];
            }
            groupedThemes[category].push({ id, theme });
        }

        // Add custom themes
        if (customThemes && customThemes.length > 0) {
            groupedThemes['custom'] = customThemes.map(t => ({
                id: t.id,
                theme: { name: t.name, colors: t.colors }
            }));
        }

        // Render each category
        for (const [category, themes] of Object.entries(groupedThemes)) {
            html += `
                <div class="theme-category">
                    <h4 class="theme-category-label">${categories[category] || category}</h4>
                    <div class="theme-grid">
                        ${themes.map(({ id, theme }) =>
                            this.preview(id, theme, id === currentTheme)
                        ).join('')}
                    </div>
                </div>
            `;
        }

        html += '</div>';
        return html;
    },

    /**
     * Create a simple theme grid without categories
     * @param {string} currentTheme - Currently selected theme ID
     * @returns {string} HTML string
     */
    grid(currentTheme = 'default') {
        return `
            <div class="theme-grid">
                ${Object.entries(this.themes).map(([id, theme]) =>
                    this.preview(id, theme, id === currentTheme)
                ).join('')}
            </div>
        `;
    },

    /**
     * Bind events to theme picker
     * @param {HTMLElement} container - Container element
     * @param {function} onSelect - Selection handler
     */
    bindEvents(container, onSelect) {
        const options = container.querySelectorAll('.theme-option');

        options.forEach(option => {
            option.addEventListener('click', () => {
                const themeId = option.dataset.themeId;

                // Update selected state visually
                options.forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');

                if (onSelect) onSelect(themeId);
            });

            // Keyboard accessibility
            option.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    option.click();
                }
            });
        });
    },

    /**
     * Get theme by ID
     * @param {string} themeId - Theme ID
     * @returns {object|null} Theme object or null
     */
    getTheme(themeId) {
        return this.themes[themeId] || null;
    },

    /**
     * Get all theme IDs
     * @returns {array} Array of theme IDs
     */
    getThemeIds() {
        return Object.keys(this.themes);
    }
};

// Add styles for theme picker
const themePickerStyles = document.createElement('style');
themePickerStyles.textContent = `
    .theme-picker {
        display: flex;
        flex-direction: column;
        gap: var(--space-lg);
    }

    .theme-category-label {
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
        color: var(--color-text-secondary);
        margin-bottom: var(--space-sm);
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .theme-option {
        position: relative;
    }

    .theme-selected-badge {
        position: absolute;
        top: var(--space-sm);
        right: var(--space-sm);
        width: 24px;
        height: 24px;
        border-radius: var(--radius-full);
        background-color: var(--color-primary);
        color: var(--color-text-inverse);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-bold);
    }
`;
document.head.appendChild(themePickerStyles);

// Make available globally
window.ThemePicker = ThemePicker;
