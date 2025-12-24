/* ========================================
   EasyKidsBank - Main Application
   ======================================== */

const App = {
    /**
     * Initialize the application
     */
    async init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.start());
        } else {
            this.start();
        }
    },

    /**
     * Start the application
     */
    async start() {
        try {
            // Initialize services
            ThemeService.init();
            AuthService.init();
            FirestoreService.init();

            // Wait for auth state to be determined
            await this.waitForAuthState();

            // Initialize router
            Router.init();

            // Hide loading screen
            Loader.hide();

        } catch (error) {
            Loader.hide();
            Toast.error('Failed to initialize app. Please refresh.');
        }
    },

    /**
     * Wait for auth state to be determined
     * @returns {Promise<void>}
     */
    waitForAuthState() {
        return new Promise((resolve) => {
            // If Firebase is not configured, resolve immediately
            if (!FirebaseConfig.isConfigured()) {
                Store.setState('isInitialized', true);
                resolve();
                return;
            }

            // Check if already initialized
            if (Store.getState('isInitialized')) {
                resolve();
                return;
            }

            // Wait for auth state change
            const unsubscribe = Store.subscribe('isInitialized', (isInit) => {
                if (isInit) {
                    unsubscribe();
                    resolve();
                }
            });

            // Timeout after 5 seconds
            setTimeout(() => {
                Store.setState('isInitialized', true);
                resolve();
            }, 5000);
        });
    }
};

// Start the app
App.init();

// Make available globally
window.App = App;
