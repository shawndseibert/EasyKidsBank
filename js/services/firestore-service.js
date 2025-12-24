/* ========================================
   EasyKidsBank - Firestore Service
   ======================================== */

const FirestoreService = {
    // Unsubscribe functions for real-time listeners
    unsubscribers: [],

    /**
     * Initialize Firestore service
     */
    init() {
        // Nothing to initialize yet
    },

    /**
     * Clean up listeners
     */
    cleanup() {
        this.unsubscribers.forEach(unsub => unsub());
        this.unsubscribers = [];
    },

    // ========================================
    // KIDS MANAGEMENT
    // ========================================

    /**
     * Load all kids for current parent
     */
    async loadKids() {
        const user = Store.getState('user');
        if (!user || !FirebaseConfig.isConfigured()) return;

        try {
            // Set up real-time listener
            const unsubscribe = FirebaseConfig.db
                .collection('kids')
                .where('parentId', '==', user.uid)
                .orderBy('createdAt', 'desc')
                .onSnapshot((snapshot) => {
                    const kids = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    Store.setKids(kids);
                }, (error) => {
                    console.error('Error loading kids:', error);
                    Toast.error('Failed to load kids');
                });

            this.unsubscribers.push(unsubscribe);

        } catch (error) {
            console.error('Error setting up kids listener:', error);
        }
    },

    /**
     * Create a new kid
     * @param {object} kidData - Kid data
     * @returns {Promise<object>} Result object
     */
    async createKid(kidData) {
        const user = Store.getState('user');
        if (!user || !FirebaseConfig.isConfigured()) {
            return { success: false, error: 'Not authenticated' };
        }

        try {
            const docRef = await FirebaseConfig.db.collection('kids').add({
                parentId: user.uid,
                name: kidData.name,
                pin: kidData.pin, // In production, hash this
                balance: kidData.initialBalance || 0,
                theme: 'default',
                customThemes: [],
                avatarEmoji: kidData.avatarEmoji || '😊',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastLogin: null
            });

            return { success: true, id: docRef.id };

        } catch (error) {
            console.error('Error creating kid:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Update a kid
     * @param {string} kidId - Kid ID
     * @param {object} updates - Updates to apply
     * @returns {Promise<object>} Result object
     */
    async updateKid(kidId, updates) {
        if (!FirebaseConfig.isConfigured()) {
            return { success: false, error: 'Firebase not configured' };
        }

        try {
            await FirebaseConfig.db.collection('kids').doc(kidId).update({
                ...updates,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            return { success: true };

        } catch (error) {
            console.error('Error updating kid:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Delete a kid
     * @param {string} kidId - Kid ID
     * @returns {Promise<object>} Result object
     */
    async deleteKid(kidId) {
        if (!FirebaseConfig.isConfigured()) {
            return { success: false, error: 'Firebase not configured' };
        }

        try {
            // Delete kid document
            await FirebaseConfig.db.collection('kids').doc(kidId).delete();

            // Delete related transactions
            const transactionsQuery = await FirebaseConfig.db
                .collection('transactions')
                .where('kidId', '==', kidId)
                .get();

            const batch = FirebaseConfig.db.batch();
            transactionsQuery.docs.forEach(doc => {
                batch.delete(doc.ref);
            });

            // Delete related deposit requests
            const requestsQuery = await FirebaseConfig.db
                .collection('depositRequests')
                .where('kidId', '==', kidId)
                .get();

            requestsQuery.docs.forEach(doc => {
                batch.delete(doc.ref);
            });

            await batch.commit();

            return { success: true };

        } catch (error) {
            console.error('Error deleting kid:', error);
            return { success: false, error: error.message };
        }
    },

    // ========================================
    // TRANSACTIONS
    // ========================================

    /**
     * Load transactions for a kid
     * @param {string} kidId - Kid ID
     */
    async loadTransactions(kidId) {
        if (!FirebaseConfig.isConfigured()) return;

        try {
            const unsubscribe = FirebaseConfig.db
                .collection('transactions')
                .where('kidId', '==', kidId)
                .orderBy('createdAt', 'desc')
                .limit(50)
                .onSnapshot((snapshot) => {
                    const transactions = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    Store.setTransactions(transactions);
                }, (error) => {
                    console.error('Error loading transactions:', error);
                });

            this.unsubscribers.push(unsubscribe);

        } catch (error) {
            console.error('Error setting up transactions listener:', error);
        }
    },

    /**
     * Add money to a kid's account
     * @param {string} kidId - Kid ID
     * @param {number} amountCents - Amount in cents
     * @param {string} description - Transaction description
     * @param {string} type - Transaction type ('deposit', 'reward')
     * @returns {Promise<object>} Result object
     */
    async addMoney(kidId, amountCents, description, type = 'deposit') {
        const user = Store.getState('user');
        if (!user || !FirebaseConfig.isConfigured()) {
            return { success: false, error: 'Not authenticated' };
        }

        try {
            const batch = FirebaseConfig.db.batch();

            // Get kid reference
            const kidRef = FirebaseConfig.db.collection('kids').doc(kidId);

            // Update balance
            batch.update(kidRef, {
                balance: firebase.firestore.FieldValue.increment(amountCents),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Create transaction record
            const transactionRef = FirebaseConfig.db.collection('transactions').doc();
            batch.set(transactionRef, {
                kidId,
                parentId: user.uid,
                type,
                amount: amountCents,
                description: description || Formatters.transactionType(type),
                status: 'completed',
                requestedBy: 'parent',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                processedAt: firebase.firestore.FieldValue.serverTimestamp(),
                processedBy: user.uid
            });

            await batch.commit();

            // Update local state immediately
            const kids = Store.getState('kids');
            const kid = kids.find(k => k.id === kidId);
            if (kid) {
                Store.updateKid(kidId, { balance: kid.balance + amountCents });
            }

            return { success: true };

        } catch (error) {
            console.error('Error adding money:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Remove money from a kid's account (penalty/withdrawal)
     * @param {string} kidId - Kid ID
     * @param {number} amountCents - Amount in cents (positive number)
     * @param {string} description - Transaction description
     * @param {string} type - Transaction type ('withdrawal', 'penalty')
     * @returns {Promise<object>} Result object
     */
    async removeMoney(kidId, amountCents, description, type = 'withdrawal') {
        const user = Store.getState('user');
        if (!user || !FirebaseConfig.isConfigured()) {
            return { success: false, error: 'Not authenticated' };
        }

        // Check if kid has enough balance
        const kids = Store.getState('kids');
        const kid = kids.find(k => k.id === kidId);
        if (!kid || kid.balance < amountCents) {
            return { success: false, error: 'Insufficient balance' };
        }

        try {
            const batch = FirebaseConfig.db.batch();

            // Get kid reference
            const kidRef = FirebaseConfig.db.collection('kids').doc(kidId);

            // Update balance (subtract)
            batch.update(kidRef, {
                balance: firebase.firestore.FieldValue.increment(-amountCents),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Create transaction record
            const transactionRef = FirebaseConfig.db.collection('transactions').doc();
            batch.set(transactionRef, {
                kidId,
                parentId: user.uid,
                type,
                amount: amountCents,
                description: description || Formatters.transactionType(type),
                status: 'completed',
                requestedBy: 'parent',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                processedAt: firebase.firestore.FieldValue.serverTimestamp(),
                processedBy: user.uid
            });

            await batch.commit();

            // Update local state immediately
            Store.updateKid(kidId, { balance: kid.balance - amountCents });

            return { success: true };

        } catch (error) {
            console.error('Error removing money:', error);
            return { success: false, error: error.message };
        }
    },

    // ========================================
    // DEPOSIT REQUESTS
    // ========================================

    /**
     * Load pending deposit requests
     */
    async loadPendingRequests() {
        const user = Store.getState('user');
        if (!user || !FirebaseConfig.isConfigured()) return;

        try {
            const unsubscribe = FirebaseConfig.db
                .collection('depositRequests')
                .where('parentId', '==', user.uid)
                .where('status', '==', 'pending')
                .orderBy('createdAt', 'desc')
                .onSnapshot((snapshot) => {
                    const requests = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    Store.setPendingRequests(requests);
                }, (error) => {
                    console.error('Error loading pending requests:', error);
                });

            this.unsubscribers.push(unsubscribe);

        } catch (error) {
            console.error('Error setting up pending requests listener:', error);
        }
    },

    /**
     * Create a deposit request (from kid)
     * @param {number} amountCents - Amount in cents
     * @param {string} description - Request description
     * @returns {Promise<object>} Result object
     */
    async createDepositRequest(amountCents, description) {
        const user = Store.getState('user');
        const kid = Store.getState('currentKid');

        if (!user || !kid || !FirebaseConfig.isConfigured()) {
            return { success: false, error: 'Not authenticated' };
        }

        try {
            await FirebaseConfig.db.collection('depositRequests').add({
                kidId: kid.id,
                kidName: kid.name,
                kidAvatar: kid.avatarEmoji,
                parentId: user.uid,
                amount: amountCents,
                description: description || 'Deposit request',
                status: 'pending',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                processedAt: null,
                parentNote: null
            });

            return { success: true };

        } catch (error) {
            console.error('Error creating deposit request:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Approve a deposit request
     * @param {string} requestId - Request ID
     * @param {string} note - Optional parent note
     * @returns {Promise<object>} Result object
     */
    async approveRequest(requestId, note = '') {
        const user = Store.getState('user');
        if (!user || !FirebaseConfig.isConfigured()) {
            return { success: false, error: 'Not authenticated' };
        }

        try {
            // Get the request
            const requestDoc = await FirebaseConfig.db.collection('depositRequests').doc(requestId).get();
            if (!requestDoc.exists) {
                return { success: false, error: 'Request not found' };
            }

            const request = requestDoc.data();
            const batch = FirebaseConfig.db.batch();

            // Update request status
            batch.update(requestDoc.ref, {
                status: 'approved',
                processedAt: firebase.firestore.FieldValue.serverTimestamp(),
                parentNote: note || null
            });

            // Add money to kid's account
            const kidRef = FirebaseConfig.db.collection('kids').doc(request.kidId);
            batch.update(kidRef, {
                balance: firebase.firestore.FieldValue.increment(request.amount),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Create transaction record
            const transactionRef = FirebaseConfig.db.collection('transactions').doc();
            batch.set(transactionRef, {
                kidId: request.kidId,
                parentId: user.uid,
                type: 'deposit',
                amount: request.amount,
                description: request.description,
                status: 'completed',
                requestedBy: 'kid',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                processedAt: firebase.firestore.FieldValue.serverTimestamp(),
                processedBy: user.uid
            });

            await batch.commit();

            // Update local state
            Store.removeRequest(requestId);
            const kids = Store.getState('kids');
            const kid = kids.find(k => k.id === request.kidId);
            if (kid) {
                Store.updateKid(request.kidId, { balance: kid.balance + request.amount });
            }

            return { success: true };

        } catch (error) {
            console.error('Error approving request:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Deny a deposit request
     * @param {string} requestId - Request ID
     * @param {string} note - Optional parent note explaining denial
     * @returns {Promise<object>} Result object
     */
    async denyRequest(requestId, note = '') {
        if (!FirebaseConfig.isConfigured()) {
            return { success: false, error: 'Firebase not configured' };
        }

        try {
            await FirebaseConfig.db.collection('depositRequests').doc(requestId).update({
                status: 'denied',
                processedAt: firebase.firestore.FieldValue.serverTimestamp(),
                parentNote: note || null
            });

            Store.removeRequest(requestId);

            return { success: true };

        } catch (error) {
            console.error('Error denying request:', error);
            return { success: false, error: error.message };
        }
    },

    // ========================================
    // THEMES
    // ========================================

    /**
     * Save kid's theme preference
     * @param {string} kidId - Kid ID
     * @param {string} themeId - Theme ID
     * @returns {Promise<object>} Result object
     */
    async saveKidTheme(kidId, themeId) {
        return this.updateKid(kidId, { theme: themeId });
    },

    /**
     * Save custom theme to kid's account
     * @param {string} kidId - Kid ID
     * @param {object} theme - Custom theme object
     * @returns {Promise<object>} Result object
     */
    async saveCustomTheme(kidId, theme) {
        if (!FirebaseConfig.isConfigured()) {
            return { success: false, error: 'Firebase not configured' };
        }

        try {
            await FirebaseConfig.db.collection('kids').doc(kidId).update({
                customThemes: firebase.firestore.FieldValue.arrayUnion(theme),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            return { success: true };

        } catch (error) {
            console.error('Error saving custom theme:', error);
            return { success: false, error: error.message };
        }
    }
};

// Make available globally
window.FirestoreService = FirestoreService;
