/* ========================================
   EasyKidsBank - State Management Store
   ======================================== */

const Store = {
    // Application State
    state: {
        // Auth state
        user: null,              // Current authenticated parent user
        isAuthenticated: false,  // Whether parent is logged in

        // Kid mode state
        currentKid: null,        // Currently selected kid (when in kid mode)
        isKidMode: false,        // Whether viewing as a kid

        // Data
        kids: [],                // Parent's children
        transactions: [],        // Transactions for current view
        pendingRequests: [],     // Deposit requests awaiting approval

        // UI state
        currentTheme: 'default', // Active theme ID
        isLoading: false,        // Global loading state
        error: null,             // Global error state

        // App state
        isInitialized: false,    // Whether app has finished initializing
        currentView: 'landing'   // Current view/route
    },

    // Listeners map for state changes
    listeners: new Map(),

    /**
     * Subscribe to state changes
     * @param {string} key - State key to listen to ('*' for all changes)
     * @param {function} callback - Function to call on change
     * @returns {function} Unsubscribe function
     */
    subscribe(key, callback) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, new Set());
        }
        this.listeners.get(key).add(callback);

        // Return unsubscribe function
        return () => this.unsubscribe(key, callback);
    },

    /**
     * Unsubscribe from state changes
     * @param {string} key - State key
     * @param {function} callback - Function to remove
     */
    unsubscribe(key, callback) {
        const callbacks = this.listeners.get(key);
        if (callbacks) {
            callbacks.delete(callback);
        }
    },

    /**
     * Update state and notify listeners
     * @param {string} key - State key to update
     * @param {*} value - New value
     */
    setState(key, value) {
        const oldValue = this.state[key];

        // Don't update if value is the same
        if (oldValue === value) return;

        // Update state
        this.state[key] = value;

        // Notify specific key listeners
        const keyCallbacks = this.listeners.get(key);
        if (keyCallbacks) {
            keyCallbacks.forEach(cb => {
                try {
                    cb(value, oldValue);
                } catch (error) {
                    // Error in state listener for key
                }
            });
        }

        // Notify wildcard listeners
        const wildcardCallbacks = this.listeners.get('*');
        if (wildcardCallbacks) {
            wildcardCallbacks.forEach(cb => {
                try {
                    cb(this.state, key, value, oldValue);
                } catch (error) {
                    // Error in wildcard state listener
                }
            });
        }
    },

    /**
     * Get state value
     * @param {string} key - State key (optional, returns all state if omitted)
     * @returns {*} State value
     */
    getState(key) {
        return key ? this.state[key] : { ...this.state };
    },

    /**
     * Batch update multiple state values
     * @param {object} updates - Object with state updates
     */
    batchUpdate(updates) {
        for (const [key, value] of Object.entries(updates)) {
            this.setState(key, value);
        }
    },

    /**
     * Reset state to initial values
     */
    reset() {
        this.batchUpdate({
            user: null,
            isAuthenticated: false,
            currentKid: null,
            isKidMode: false,
            kids: [],
            transactions: [],
            pendingRequests: [],
            isLoading: false,
            error: null,
            currentView: 'landing'
        });
    },

    /**
     * Set loading state
     * @param {boolean} loading - Loading state
     */
    setLoading(loading) {
        this.setState('isLoading', loading);
    },

    /**
     * Set error state
     * @param {string|null} error - Error message or null to clear
     */
    setError(error) {
        this.setState('error', error);
    },

    /**
     * Set authenticated user
     * @param {object|null} user - User object or null to clear
     */
    setUser(user) {
        this.batchUpdate({
            user,
            isAuthenticated: !!user
        });
    },

    /**
     * Enter kid mode
     * @param {object} kid - Kid object
     */
    enterKidMode(kid) {
        this.batchUpdate({
            currentKid: kid,
            isKidMode: true
        });
    },

    /**
     * Exit kid mode
     */
    exitKidMode() {
        this.batchUpdate({
            currentKid: null,
            isKidMode: false,
            transactions: []
        });
    },

    /**
     * Update kids list
     * @param {array} kids - Array of kid objects
     */
    setKids(kids) {
        this.setState('kids', kids);
    },

    /**
     * Add a kid to the list
     * @param {object} kid - Kid object to add
     */
    addKid(kid) {
        const kids = [...this.state.kids, kid];
        this.setState('kids', kids);
    },

    /**
     * Update a kid in the list
     * @param {string} kidId - Kid ID to update
     * @param {object} updates - Updates to apply
     */
    updateKid(kidId, updates) {
        const kids = this.state.kids.map(kid =>
            kid.id === kidId ? { ...kid, ...updates } : kid
        );
        this.setState('kids', kids);

        // Also update currentKid if it's the one being updated
        if (this.state.currentKid && this.state.currentKid.id === kidId) {
            this.setState('currentKid', { ...this.state.currentKid, ...updates });
        }
    },

    /**
     * Remove a kid from the list
     * @param {string} kidId - Kid ID to remove
     */
    removeKid(kidId) {
        const kids = this.state.kids.filter(kid => kid.id !== kidId);
        this.setState('kids', kids);
    },

    /**
     * Update transactions list
     * @param {array} transactions - Array of transaction objects
     */
    setTransactions(transactions) {
        this.setState('transactions', transactions);
    },

    /**
     * Add a transaction
     * @param {object} transaction - Transaction to add
     */
    addTransaction(transaction) {
        const transactions = [transaction, ...this.state.transactions];
        this.setState('transactions', transactions);
    },

    /**
     * Update pending requests
     * @param {array} requests - Array of request objects
     */
    setPendingRequests(requests) {
        this.setState('pendingRequests', requests);
    },

    /**
     * Remove a pending request
     * @param {string} requestId - Request ID to remove
     */
    removeRequest(requestId) {
        const requests = this.state.pendingRequests.filter(req => req.id !== requestId);
        this.setState('pendingRequests', requests);
    },

    /**
     * Set current theme
     * @param {string} themeId - Theme ID
     */
    setTheme(themeId) {
        this.setState('currentTheme', themeId);
    },

    /**
     * Set current view
     * @param {string} view - View name
     */
    setCurrentView(view) {
        this.setState('currentView', view);
    },

    /**
     * Get count of pending requests
     * @returns {number} Count of pending requests
     */
    getPendingCount() {
        return this.state.pendingRequests.length;
    }
};

// Make available globally
window.Store = Store;
