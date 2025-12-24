/* ========================================
   EasyKidsBank - Kid Profile View
   ======================================== */

const KidProfileView = {
    container: null,
    unsubscribers: [],

    /**
     * Mount the view
     * @param {HTMLElement} container - Container element
     */
    mount(container) {
        this.container = container;
        this.render();
        this.bindEvents();
        this.subscribeToState();
    },

    /**
     * Unmount the view
     */
    unmount() {
        this.unsubscribers.forEach(unsub => unsub());
        this.unsubscribers = [];
        this.container = null;
    },

    /**
     * Render the view
     */
    render() {
        const kid = Store.getState('currentKid');
        const currentTheme = kid?.theme || 'default';

        if (!kid) {
            Router.navigate('landing');
            return;
        }

        this.container.innerHTML = `
            ${NavBar.simple('My Profile')}

            <div class="view kid-profile-view">
                <div class="container">
                    <!-- Profile Header -->
                    <div class="profile-header animate slideUp">
                        <div class="profile-avatar">${kid.avatarEmoji}</div>
                        <h1 class="profile-name">${Helpers.escapeHtml(kid.name)}</h1>
                        <div class="profile-balance">${Formatters.currency(kid.balance)}</div>
                    </div>

                    <!-- Theme Selection -->
                    <section class="profile-section animate slideUp animate-delay-100">
                        <h2 class="profile-section-title">Choose Your Theme</h2>
                        <p class="profile-section-subtitle">Pick your favorite colors!</p>

                        ${ThemePicker.create(currentTheme, kid.customThemes || [])}
                    </section>

                    <!-- Create Custom Theme Button -->
                    <div class="animate slideUp animate-delay-200">
                        <button class="btn btn-secondary btn-lg btn-block" id="btn-create-theme">
                            <span>🎨</span>
                            <span>Create My Own Theme</span>
                        </button>
                    </div>
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
            onBack: () => Router.navigate('kid-dashboard')
        });

        // Theme selection
        ThemePicker.bindEvents(this.container, async (themeId) => {
            const kid = Store.getState('currentKid');

            // Apply theme immediately
            ThemeService.apply(themeId);

            // Save to Firestore
            const result = await FirestoreService.saveKidTheme(kid.id, themeId);

            if (result.success) {
                Toast.success('Theme saved!');
            } else {
                Toast.error('Could not save theme');
            }
        });

        // Create custom theme button
        this.container.querySelector('#btn-create-theme')?.addEventListener('click', () => {
            Router.navigate('theme-creator');
        });
    },

    /**
     * Subscribe to state changes
     */
    subscribeToState() {
        const unsub = Store.subscribe('currentKid', () => {
            this.render();
            this.bindEvents();
        });
        this.unsubscribers.push(unsub);
    }
};

// Add kid profile view styles
const kidProfileStyles = document.createElement('style');
kidProfileStyles.textContent = `
    .kid-profile-view {
        padding-top: 0;
    }

    .profile-header {
        text-align: center;
        margin-bottom: var(--space-xl);
    }

    .profile-avatar {
        width: 100px;
        height: 100px;
        border-radius: var(--radius-full);
        background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 3rem;
        margin: 0 auto var(--space-md);
        box-shadow: var(--shadow-lg);
    }

    .profile-name {
        font-size: var(--font-size-xl);
        font-weight: var(--font-weight-bold);
        color: var(--color-text);
        margin-bottom: var(--space-xs);
    }

    .profile-balance {
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-bold);
        color: var(--color-primary);
    }

    .profile-section {
        margin-bottom: var(--space-xl);
    }

    .profile-section-title {
        font-size: var(--font-size-md);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text);
        margin-bottom: var(--space-xs);
    }

    .profile-section-subtitle {
        font-size: var(--font-size-sm);
        color: var(--color-text-secondary);
        margin-bottom: var(--space-md);
    }
`;
document.head.appendChild(kidProfileStyles);

// Make available globally
window.KidProfileView = KidProfileView;
