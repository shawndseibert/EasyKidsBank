/* ========================================
   EasyKidsBank - Authentication Service
   ======================================== */

const AuthService = {
    // Google Auth Provider
    googleProvider: null,

    /**
     * Initialize auth service
     */
    init() {
        if (!FirebaseConfig.isConfigured()) {
            console.warn('Firebase is not configured. Auth will not work.');
            return;
        }

        // Initialize Google provider
        this.googleProvider = new firebase.auth.GoogleAuthProvider();

        // Listen for auth state changes
        FirebaseConfig.auth.onAuthStateChanged((user) => {
            this.handleAuthStateChange(user);
        });
    },

    /**
     * Handle auth state changes
     * @param {object|null} user - Firebase user object
     */
    async handleAuthStateChange(user) {
        if (user) {
            // User is signed in
            const userData = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || user.email.split('@')[0],
                photoURL: user.photoURL
            };

            Store.setUser(userData);

            // Check if parent document exists, create if not
            await this.ensureParentDocument(userData);

            // Load parent's kids
            await FirestoreService.loadKids();

            // Load pending requests
            await FirestoreService.loadPendingRequests();

        } else {
            // User is signed out
            Store.reset();
        }

        // Mark app as initialized
        Store.setState('isInitialized', true);
    },

    /**
     * Ensure parent document exists in Firestore
     * @param {object} userData - User data
     */
    async ensureParentDocument(userData) {
        if (!FirebaseConfig.isConfigured()) return;

        try {
            const parentRef = FirebaseConfig.db.collection('parents').doc(userData.uid);
            const doc = await parentRef.get();

            if (!doc.exists) {
                // Create parent document
                await parentRef.set({
                    email: userData.email,
                    displayName: userData.displayName,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    settings: {
                        defaultTheme: 'default',
                        notifications: true
                    }
                });
            }
        } catch (error) {
            console.error('Error ensuring parent document:', error);
        }
    },

    /**
     * Sign up with email and password
     * @param {string} email - User email
     * @param {string} password - User password
     * @param {string} displayName - Display name
     * @returns {Promise<object>} Result object
     */
    async signUp(email, password, displayName) {
        if (!FirebaseConfig.isConfigured()) {
            return { success: false, error: 'Firebase is not configured. Please add your Firebase config.' };
        }

        try {
            Store.setLoading(true);

            const result = await FirebaseConfig.auth.createUserWithEmailAndPassword(email, password);

            // Update display name
            if (displayName) {
                await result.user.updateProfile({ displayName });
            }

            Store.setLoading(false);
            return { success: true, user: result.user };

        } catch (error) {
            Store.setLoading(false);
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    },

    /**
     * Sign in with email and password
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<object>} Result object
     */
    async signIn(email, password) {
        if (!FirebaseConfig.isConfigured()) {
            return { success: false, error: 'Firebase is not configured. Please add your Firebase config.' };
        }

        try {
            Store.setLoading(true);

            const result = await FirebaseConfig.auth.signInWithEmailAndPassword(email, password);

            Store.setLoading(false);
            return { success: true, user: result.user };

        } catch (error) {
            Store.setLoading(false);
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    },

    /**
     * Sign in with Google
     * @returns {Promise<object>} Result object
     */
    async signInWithGoogle() {
        if (!FirebaseConfig.isConfigured()) {
            return { success: false, error: 'Firebase is not configured. Please add your Firebase config.' };
        }

        try {
            Store.setLoading(true);

            const result = await FirebaseConfig.auth.signInWithPopup(this.googleProvider);

            Store.setLoading(false);
            return { success: true, user: result.user };

        } catch (error) {
            Store.setLoading(false);
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    },

    /**
     * Sign out
     * @returns {Promise<object>} Result object
     */
    async signOut() {
        try {
            // Exit kid mode if active
            if (Store.getState('isKidMode')) {
                Store.exitKidMode();
            }

            await FirebaseConfig.auth.signOut();
            return { success: true };

        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    /**
     * Send password reset email
     * @param {string} email - User email
     * @returns {Promise<object>} Result object
     */
    async resetPassword(email) {
        if (!FirebaseConfig.isConfigured()) {
            return { success: false, error: 'Firebase is not configured.' };
        }

        try {
            await FirebaseConfig.auth.sendPasswordResetEmail(email);
            return { success: true };

        } catch (error) {
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    },

    /**
     * Verify kid PIN
     * @param {string} kidId - Kid ID
     * @param {string} pin - PIN to verify
     * @returns {Promise<object>} Result object
     */
    async verifyKidPin(kidId, pin) {
        const kids = Store.getState('kids');
        const kid = kids.find(k => k.id === kidId);

        if (!kid) {
            return { success: false, error: 'Kid not found' };
        }

        // Simple PIN verification (in production, use hashed comparison)
        if (kid.pin === pin) {
            return { success: true, kid };
        } else {
            Toast.error(`PIN mismatch. Stored: ${kid.pin}, Entered: ${pin}`);
            return { success: false, error: 'Incorrect PIN' };
        }
    },

    /**
     * Enter kid mode
     * @param {object} kid - Kid object
     */
    enterKidMode(kid) {
        // Apply kid's theme if they have one
        if (kid.theme) {
            ThemeService.applyTemporary(kid.theme);
        }

        // Enter kid mode in store
        Store.enterKidMode(kid);

        // Load kid's transactions
        FirestoreService.loadTransactions(kid.id);
    },

    /**
     * Exit kid mode
     */
    exitKidMode() {
        // Reset to default theme
        ThemeService.loadSavedTheme();

        // Exit kid mode in store
        Store.exitKidMode();
    },

    /**
     * Get current user
     * @returns {object|null} Current user or null
     */
    getCurrentUser() {
        return Store.getState('user');
    },

    /**
     * Check if user is authenticated
     * @returns {boolean}
     */
    isAuthenticated() {
        return Store.getState('isAuthenticated');
    },

    /**
     * Check if in kid mode
     * @returns {boolean}
     */
    isKidMode() {
        return Store.getState('isKidMode');
    },

    /**
     * Get current kid
     * @returns {object|null}
     */
    getCurrentKid() {
        return Store.getState('currentKid');
    },

    /**
     * Convert Firebase error codes to user-friendly messages
     * @param {string} code - Firebase error code
     * @returns {string} User-friendly error message
     */
    getErrorMessage(code) {
        const messages = {
            'auth/email-already-in-use': 'This email is already registered. Try signing in instead.',
            'auth/invalid-email': 'Please enter a valid email address.',
            'auth/operation-not-allowed': 'This sign-in method is not enabled.',
            'auth/weak-password': 'Password should be at least 6 characters.',
            'auth/user-disabled': 'This account has been disabled.',
            'auth/user-not-found': 'No account found with this email.',
            'auth/wrong-password': 'Incorrect password. Please try again.',
            'auth/invalid-credential': 'Invalid email or password.',
            'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
            'auth/popup-closed-by-user': 'Sign-in was cancelled.',
            'auth/network-request-failed': 'Network error. Please check your connection.',
            'auth/requires-recent-login': 'Please sign in again to complete this action.'
        };

        return messages[code] || 'An error occurred. Please try again.';
    }
};

// Make available globally
window.AuthService = AuthService;
