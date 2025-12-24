/* ========================================
   EasyKidsBank - Landing View
   ======================================== */

const LandingView = {
    container: null,

    /**
     * Mount the view
     * @param {HTMLElement} container - Container element
     */
    mount(container) {
        this.container = container;
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
            <div class="view view-centered landing-view">
                <div class="landing-content">
                    <!-- Logo & Title -->
                    <div class="landing-header animate slideUp">
                        <div class="landing-logo">
                            <span class="landing-logo-icon">🏦</span>
                        </div>
                        <h1 class="landing-title">EasyKidsBank</h1>
                        <p class="landing-subtitle">A fun way to learn about saving!</p>
                    </div>

                    <!-- Main Actions -->
                    <div class="landing-actions animate slideUp animate-delay-200">
                        <button class="btn btn-primary btn-xl btn-block" id="btn-parent-login">
                            <span>👨‍👩‍👧‍👦</span>
                            <span>I'm a Parent</span>
                        </button>

                        <button class="btn btn-secondary btn-xl btn-block" id="btn-kid-login">
                            <span>👶</span>
                            <span>I'm a Kid</span>
                        </button>
                    </div>

                    <!-- Features Preview -->
                    <div class="landing-features animate slideUp animate-delay-300">
                        <div class="feature-item">
                            <span class="feature-icon">💰</span>
                            <span class="feature-text">Track Savings</span>
                        </div>
                        <div class="feature-item">
                            <span class="feature-icon">🎨</span>
                            <span class="feature-text">Fun Themes</span>
                        </div>
                        <div class="feature-item">
                            <span class="feature-icon">📱</span>
                            <span class="feature-text">Easy to Use</span>
                        </div>
                    </div>
                </div>

                <!-- Firebase Warning (if not configured) -->
                ${!FirebaseConfig.isConfigured() ? `
                    <div class="firebase-warning animate slideUp animate-delay-400">
                        <p>⚠️ Firebase is not configured yet.</p>
                        <p class="text-sm">Edit <code>js/config/firebase-config.js</code> to add your Firebase credentials.</p>
                    </div>
                ` : ''}
            </div>
        `;
    },

    /**
     * Bind event listeners
     */
    bindEvents() {
        const parentBtn = this.container.querySelector('#btn-parent-login');
        const kidBtn = this.container.querySelector('#btn-kid-login');

        parentBtn.addEventListener('click', () => {
            Router.navigate('parent-login');
        });

        kidBtn.addEventListener('click', () => {
            const authorizedKidId = AuthService.getAuthorizedKid();

            if (authorizedKidId) {
                Router.navigate('kid-login', { params: [authorizedKidId] });
            } else if (Store.getState('isAuthenticated')) {
                // Or if a parent is already logged in
                Router.navigate('kid-login');
            } else {
                // Otherwise, a parent must log in first
                Toast.info('Please have a parent log in first!');
                Router.navigate('parent-login');
            }
        });
    }
};

// Add landing view styles
const landingStyles = document.createElement('style');
landingStyles.textContent = `
    .landing-view {
        background: linear-gradient(135deg, var(--color-background) 0%, var(--color-surface) 100%);
        padding: var(--space-xl);
    }

    .landing-content {
        width: 100%;
        max-width: 320px;
        text-align: center;
    }

    .landing-header {
        margin-bottom: var(--space-2xl);
    }

    .landing-logo {
        margin-bottom: var(--space-md);
    }

    .landing-logo-icon {
        font-size: 5rem;
        display: inline-block;
        animation: bounce 2s ease-in-out infinite;
    }

    .landing-title {
        font-size: var(--font-size-2xl);
        font-weight: var(--font-weight-bold);
        color: var(--color-primary);
        margin-bottom: var(--space-xs);
    }

    .landing-subtitle {
        font-size: var(--font-size-md);
        color: var(--color-text-secondary);
    }

    .landing-actions {
        display: flex;
        flex-direction: column;
        gap: var(--space-md);
        margin-bottom: var(--space-2xl);
    }

    .landing-actions .btn {
        gap: var(--space-md);
    }

    .landing-features {
        display: flex;
        justify-content: center;
        gap: var(--space-lg);
        flex-wrap: wrap;
    }

    .feature-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-xs);
    }

    .feature-icon {
        font-size: 1.5rem;
    }

    .feature-text {
        font-size: var(--font-size-xs);
        color: var(--color-text-secondary);
        font-weight: var(--font-weight-medium);
    }

    .firebase-warning {
        position: fixed;
        bottom: var(--space-lg);
        left: var(--space-md);
        right: var(--space-md);
        background-color: var(--color-warning);
        color: #856404;
        padding: var(--space-md);
        border-radius: var(--radius-md);
        text-align: center;
        font-size: var(--font-size-sm);
    }

    .firebase-warning code {
        background-color: rgba(0,0,0,0.1);
        padding: 2px 6px;
        border-radius: 4px;
        font-family: monospace;
    }
`;
document.head.appendChild(landingStyles);

// Make available globally
window.LandingView = LandingView;
