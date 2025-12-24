/* ========================================
   EasyKidsBank - Theme Creator View
   ======================================== */

const ThemeCreatorView = {
    container: null,
    colors: {
        primary: '#4a90d9',
        secondary: '#a29bfe',
        background: '#f0f4f8',
        accent: '#00cec9'
    },

    /**
     * Mount the view
     * @param {HTMLElement} container - Container element
     */
    mount(container) {
        this.container = container;
        // Reset to defaults
        this.colors = {
            primary: '#4a90d9',
            secondary: '#a29bfe',
            background: '#f0f4f8',
            accent: '#00cec9'
        };
        this.render();
        this.bindEvents();
    },

    /**
     * Unmount the view
     */
    unmount() {
        this.container = null;
    },

    /**
     * Render the view
     */
    render() {
        this.container.innerHTML = `
            ${NavBar.simple('Create Theme')}

            <div class="view theme-creator-view">
                <div class="container">
                    <!-- Theme Name -->
                    <div class="input-group mb-lg animate slideUp">
                        <label class="input-label">Theme Name</label>
                        <input type="text" class="input" id="theme-name" placeholder="My Awesome Theme" maxlength="30">
                    </div>

                    <!-- Color Pickers -->
                    <section class="color-pickers animate slideUp animate-delay-100">
                        <h3 class="color-section-title">Choose Your Colors</h3>

                        <div class="color-picker-grid">
                            ${this.renderColorPicker('primary', 'Main Color', this.colors.primary)}
                            ${this.renderColorPicker('secondary', 'Second Color', this.colors.secondary)}
                            ${this.renderColorPicker('background', 'Background', this.colors.background)}
                            ${this.renderColorPicker('accent', 'Accent', this.colors.accent)}
                        </div>
                    </section>

                    <!-- Live Preview -->
                    <section class="theme-preview-section animate slideUp animate-delay-200">
                        <h3 class="preview-title">Preview</h3>
                        <div class="theme-preview-card" id="preview-card">
                            <div class="preview-header">
                                <div class="preview-avatar">🎨</div>
                                <span>Your Theme</span>
                            </div>
                            <div class="preview-balance">$50.00</div>
                            <button class="preview-button">Sample Button</button>
                        </div>
                    </section>

                    <!-- Save Button -->
                    <div class="animate slideUp animate-delay-300">
                        <button class="btn btn-primary btn-lg btn-block" id="btn-save-theme">
                            Save My Theme
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.updatePreview();
    },

    /**
     * Render a color picker
     * @param {string} id - Color ID
     * @param {string} label - Label text
     * @param {string} value - Current color value
     * @returns {string} HTML string
     */
    renderColorPicker(id, label, value) {
        return `
            <div class="color-picker-item">
                <label class="color-picker-label" for="color-${id}">${label}</label>
                <div class="color-picker-control">
                    <input type="color" class="color-input" id="color-${id}" value="${value}" data-color-id="${id}">
                    <span class="color-value">${value}</span>
                </div>
            </div>
        `;
    },

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Back button
        NavBar.bindEvents(this.container, {
            onBack: () => {
                // Reset theme to saved theme
                const kid = Store.getState('currentKid');
                if (kid?.theme) {
                    ThemeService.apply(kid.theme);
                } else {
                    ThemeService.loadSavedTheme();
                }
                Router.navigate('kid-profile');
            }
        });

        // Color pickers
        this.container.querySelectorAll('.color-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const colorId = e.target.dataset.colorId;
                const value = e.target.value;

                this.colors[colorId] = value;

                // Update displayed value
                e.target.parentElement.querySelector('.color-value').textContent = value;

                // Update preview
                this.updatePreview();
            });
        });

        // Save button
        this.container.querySelector('#btn-save-theme')?.addEventListener('click', () => {
            this.saveTheme();
        });
    },

    /**
     * Update the preview card
     */
    updatePreview() {
        const previewCard = this.container.querySelector('#preview-card');
        if (!previewCard) return;

        previewCard.style.setProperty('--preview-primary', this.colors.primary);
        previewCard.style.setProperty('--preview-secondary', this.colors.secondary);
        previewCard.style.setProperty('--preview-background', this.colors.background);
        previewCard.style.setProperty('--preview-accent', this.colors.accent);

        // Also apply to document for live preview
        ThemeService.applyCustom({
            primary: this.colors.primary,
            secondary: this.colors.secondary,
            background: this.colors.background,
            accent: this.colors.accent
        });
    },

    /**
     * Save the custom theme
     */
    async saveTheme() {
        const nameInput = this.container.querySelector('#theme-name');
        const name = nameInput.value.trim() || 'My Custom Theme';

        const kid = Store.getState('currentKid');
        if (!kid) {
            Toast.error('Not logged in');
            return;
        }

        // Create theme object
        const theme = ThemeService.createCustomTheme(name, this.colors);

        // Save to Firestore
        const result = await FirestoreService.saveCustomTheme(kid.id, theme);

        if (result.success) {
            // Also save as current theme
            await FirestoreService.saveKidTheme(kid.id, theme.id);

            Toast.success('Theme saved!');
            Router.navigate('kid-profile');
        } else {
            Toast.error(result.error);
        }
    }
};

// Add theme creator view styles
const themeCreatorStyles = document.createElement('style');
themeCreatorStyles.textContent = `
    .theme-creator-view {
        padding-top: 0;
    }

    .color-section-title {
        font-size: var(--font-size-md);
        font-weight: var(--font-weight-semibold);
        margin-bottom: var(--space-md);
    }

    .color-picker-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--space-md);
        margin-bottom: var(--space-xl);
    }

    .color-picker-item {
        background-color: var(--color-surface);
        padding: var(--space-md);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-sm);
    }

    .color-picker-label {
        display: block;
        font-size: var(--font-size-xs);
        font-weight: var(--font-weight-medium);
        color: var(--color-text-secondary);
        margin-bottom: var(--space-sm);
    }

    .color-picker-control {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
    }

    .color-input {
        width: 48px;
        height: 48px;
        border: none;
        border-radius: var(--radius-md);
        cursor: pointer;
        padding: 0;
        overflow: hidden;
    }

    .color-input::-webkit-color-swatch-wrapper {
        padding: 0;
    }

    .color-input::-webkit-color-swatch {
        border: none;
        border-radius: var(--radius-md);
    }

    .color-value {
        font-family: monospace;
        font-size: var(--font-size-sm);
        color: var(--color-text-secondary);
        text-transform: uppercase;
    }

    .theme-preview-section {
        margin-bottom: var(--space-xl);
    }

    .preview-title {
        font-size: var(--font-size-md);
        font-weight: var(--font-weight-semibold);
        margin-bottom: var(--space-md);
    }

    .theme-preview-card {
        --preview-primary: #4a90d9;
        --preview-secondary: #a29bfe;
        --preview-background: #f0f4f8;
        --preview-accent: #00cec9;

        background-color: var(--preview-background);
        border-radius: var(--radius-xl);
        padding: var(--space-lg);
        box-shadow: var(--shadow-md);
    }

    .preview-header {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        margin-bottom: var(--space-md);
        font-weight: var(--font-weight-semibold);
        color: var(--preview-primary);
    }

    .preview-avatar {
        width: 40px;
        height: 40px;
        border-radius: var(--radius-full);
        background-color: var(--preview-secondary);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.25rem;
    }

    .preview-balance {
        font-size: var(--font-size-2xl);
        font-weight: var(--font-weight-bold);
        color: var(--preview-primary);
        text-align: center;
        margin-bottom: var(--space-md);
    }

    .preview-button {
        width: 100%;
        padding: var(--space-md);
        background-color: var(--preview-primary);
        color: white;
        border: none;
        border-radius: var(--radius-md);
        font-weight: var(--font-weight-semibold);
        cursor: pointer;
    }

    @media (max-width: 360px) {
        .color-picker-grid {
            grid-template-columns: 1fr;
        }
    }
`;
document.head.appendChild(themeCreatorStyles);

// Make available globally
window.ThemeCreatorView = ThemeCreatorView;
