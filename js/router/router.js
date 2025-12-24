/* ========================================
   EasyKidsBank - SPA Router
   ======================================== */

const Router = {
    // Route definitions
    routes: {
        'landing': {
            title: 'Welcome',
            view: 'LandingView',
            requiresAuth: false
        },
        'parent-login': {
            title: 'Parent Login',
            view: 'ParentLoginView',
            requiresAuth: false
        },
        'kid-login': {
            title: 'Kid Login',
            view: 'KidLoginView',
            requiresAuth: true
        },
        'parent-dashboard': {
            title: 'Dashboard',
            view: 'ParentDashboardView',
            requiresAuth: true
        },
        'kid-dashboard': {
            title: 'My Bank',
            view: 'KidDashboardView',
            requiresAuth: true,
            requiresKidMode: true
        },
        'manage-kids': {
            title: 'Manage Kids',
            view: 'ManageKidsView',
            requiresAuth: true
        },
        'pending-requests': {
            title: 'Pending Requests',
            view: 'PendingRequestsView',
            requiresAuth: true
        },
        'kid-profile': {
            title: 'My Profile',
            view: 'KidProfileView',
            requiresAuth: true,
            requiresKidMode: true
        },
        'theme-creator': {
            title: 'Create Theme',
            view: 'ThemeCreatorView',
            requiresAuth: true
        }
    },

    // Current route info
    currentRoute: null,
    currentView: null,
    viewContainer: null,

    /**
     * Initialize the router
     */
    init() {
        // Get the app container
        this.viewContainer = document.getElementById('app');

        // Listen for hash changes
        window.addEventListener('hashchange', () => this.handleRouteChange());

        // Handle initial route
        this.handleRouteChange();
    },

    /**
     * Handle route changes
     */
    handleRouteChange() {
        // Get the route from hash (remove the # and any query params)
        const hash = window.location.hash.slice(1) || 'landing';
        const [routeName, ...params] = hash.split('/');

        // Get route config
        const route = this.routes[routeName];

        if (!route) {
            // Route not found, go to landing
            this.navigate('landing');
            return;
        }

        // Check authentication requirements
        if (route.requiresAuth && !Store.getState('isAuthenticated')) {
            this.navigate('parent-login');
            return;
        }

        // Check kid mode requirements
        if (route.requiresKidMode && !Store.getState('isKidMode')) {
            this.navigate('parent-dashboard');
            return;
        }

        // Update document title
        document.title = `${route.title} | EasyKidsBank`;

        // Store current route
        this.currentRoute = routeName;
        Store.setCurrentView(routeName);

        // Unmount current view
        if (this.currentView && typeof this.currentView.unmount === 'function') {
            this.currentView.unmount();
        }

        // Mount new view
        this.mountView(route.view, params);
    },

    /**
     * Mount a view
     * @param {string} viewName - Name of the view to mount
     * @param {array} params - Route parameters
     */
    mountView(viewName, params = []) {
        // Get the view object
        const View = window[viewName];

        if (!View) {
            console.error(`View not found: ${viewName}`);
            return;
        }

        // Clear loading screen if it's still showing
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }

        // Create view container
        this.viewContainer.innerHTML = '<div class="view-wrapper"></div>';
        const wrapper = this.viewContainer.querySelector('.view-wrapper');

        // Mount the view
        try {
            this.currentView = View;
            View.mount(wrapper, params);
        } catch (error) {
            console.error(`Error mounting view ${viewName}:`, error);
            Toast.error('Something went wrong. Please try again.');
        }
    },

    /**
     * Navigate to a route
     * @param {string} route - Route name
     * @param {object} options - Navigation options
     */
    navigate(route, options = {}) {
        const { replace = false, params = [] } = options;

        // Build the hash
        let hash = `#${route}`;
        if (params.length > 0) {
            hash += '/' + params.join('/');
        }

        // Navigate
        if (replace) {
            window.location.replace(hash);
        } else {
            window.location.hash = hash;
        }
    },

    /**
     * Go back in history
     */
    back() {
        window.history.back();
    },

    /**
     * Check if on a specific route
     * @param {string} route - Route to check
     * @returns {boolean}
     */
    isRoute(route) {
        return this.currentRoute === route;
    },

    /**
     * Get current route
     * @returns {string}
     */
    getCurrentRoute() {
        return this.currentRoute;
    },

    /**
     * Get route params from hash
     * @returns {array}
     */
    getParams() {
        const hash = window.location.hash.slice(1) || '';
        const [, ...params] = hash.split('/');
        return params;
    },

    /**
     * Redirect based on auth state
     */
    redirectToHome() {
        if (Store.getState('isKidMode')) {
            this.navigate('kid-dashboard');
        } else if (Store.getState('isAuthenticated')) {
            this.navigate('parent-dashboard');
        } else {
            this.navigate('landing');
        }
    }
};

// Make available globally
window.Router = Router;
