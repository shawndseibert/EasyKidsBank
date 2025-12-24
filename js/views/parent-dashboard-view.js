/* ========================================
   EasyKidsBank - Parent Dashboard View
   ======================================== */

const ParentDashboardView = {
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
        const user = Store.getState('user');
        const kids = Store.getState('kids');
        const pendingCount = Store.getPendingCount();

        this.container.innerHTML = `
            ${NavBar.parentDashboard(pendingCount)}

            <div class="view parent-dashboard">
                <div class="container">
                    <!-- Welcome Header -->
                    <div class="dashboard-header animate slideUp">
                        <h1 class="dashboard-title">Hi, ${Helpers.escapeHtml(user?.displayName?.split(' ')[0] || 'Parent')}!</h1>
                        <p class="dashboard-subtitle">Manage your kids' bank accounts</p>
                    </div>

                    <!-- Pending Requests Alert -->
                    ${pendingCount > 0 ? `
                        <div class="pending-alert animate slideUp animate-delay-100" id="pending-alert">
                            <div class="pending-alert-content">
                                <span class="pending-alert-icon">🔔</span>
                                <span class="pending-alert-text">
                                    You have <strong>${pendingCount}</strong> pending deposit request${pendingCount > 1 ? 's' : ''}
                                </span>
                            </div>
                            <button class="btn btn-primary btn-sm">Review</button>
                        </div>
                    ` : ''}

                    <!-- Kids Section -->
                    <section class="dashboard-section animate slideUp animate-delay-200">
                        <div class="section-header">
                            <h2 class="section-title">Your Kids</h2>
                            <button class="btn btn-primary btn-sm" id="btn-add-kid">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                                Add Kid
                            </button>
                        </div>

                        <div class="kids-list" id="kids-list">
                            ${KidCard.list(kids, { showBalance: true, showArrow: true })}
                        </div>
                    </section>

                    <!-- Quick Actions -->
                    <section class="dashboard-section animate slideUp animate-delay-300">
                        <h2 class="section-title">Quick Actions</h2>
                        <div class="quick-actions">
                            <button class="quick-action-btn" id="btn-kid-mode">
                                <span class="quick-action-icon">👶</span>
                                <span class="quick-action-label">Kid Mode</span>
                            </button>
                            <button class="quick-action-btn" id="btn-manage-kids">
                                <span class="quick-action-icon">⚙️</span>
                                <span class="quick-action-label">Manage</span>
                            </button>
                            <button class="quick-action-btn" id="btn-sign-out">
                                <span class="quick-action-icon">🚪</span>
                                <span class="quick-action-label">Sign Out</span>
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        `;
    },

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Navigation buttons
        const requestsBtn = this.container.querySelector('#nav-requests-btn');
        if (requestsBtn) {
            requestsBtn.addEventListener('click', () => {
                Router.navigate('pending-requests');
            });
        }

        const settingsBtn = this.container.querySelector('#nav-settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.showSettingsMenu();
            });
        }

        // Pending alert
        const pendingAlert = this.container.querySelector('#pending-alert');
        if (pendingAlert) {
            pendingAlert.addEventListener('click', () => {
                Router.navigate('pending-requests');
            });
        }

        // Add kid button
        const addKidBtn = this.container.querySelector('#btn-add-kid');
        if (addKidBtn) {
            addKidBtn.addEventListener('click', () => {
                this.showAddKidModal();
            });
        }

        // Kid cards
        KidCard.bindEvents(this.container, (kidId) => {
            this.showKidActions(kidId);
        });

        // Quick actions
        this.container.querySelector('#btn-kid-mode')?.addEventListener('click', () => {
            Router.navigate('kid-login');
        });

        this.container.querySelector('#btn-manage-kids')?.addEventListener('click', () => {
            Router.navigate('manage-kids');
        });

        this.container.querySelector('#btn-sign-out')?.addEventListener('click', () => {
            this.handleSignOut();
        });
    },

    /**
     * Subscribe to state changes
     */
    subscribeToState() {
        const unsubKids = Store.subscribe('kids', () => {
            this.render();
            this.bindEvents();
        });
        this.unsubscribers.push(unsubKids);

        const unsubRequests = Store.subscribe('pendingRequests', () => {
            this.render();
            this.bindEvents();
        });
        this.unsubscribers.push(unsubRequests);
    },

    /**
     * Show add kid modal
     */
    showAddKidModal() {
        const avatars = ['😊', '😎', '🦊', '🐱', '🐶', '🦁', '🐼', '🐨', '🐰', '🦄', '🐸', '🐙'];

        const content = `
            <form id="add-kid-form">
                <div class="input-group mb-md">
                    <label class="input-label" for="kid-name">Kid's Name</label>
                    <input type="text" class="input" id="kid-name" placeholder="Enter name" required>
                </div>

                <div class="input-group mb-md">
                    <label class="input-label">Choose an Avatar</label>
                    <div class="avatar-grid" id="avatar-grid">
                        ${avatars.map((emoji, i) => `
                            <button type="button" class="avatar-option ${i === 0 ? 'selected' : ''}" data-avatar="${emoji}" aria-label="${emoji}">
                                ${emoji}
                            </button>
                        `).join('')}
                    </div>
                </div>

                <div class="input-group mb-md">
                    <label class="input-label" for="kid-pin">Create a 4-digit PIN</label>
                    <input type="password" class="input input-lg" id="kid-pin" placeholder="••••" maxlength="4" pattern="[0-9]{4}" inputmode="numeric" required>
                    <span class="input-hint">This PIN will be used to log in</span>
                </div>

                <div class="input-group">
                    <label class="input-label" for="kid-balance">Starting Balance (optional)</label>
                    <input type="text" class="input" id="kid-balance" placeholder="$0.00" inputmode="decimal">
                </div>
            </form>
        `;

        const footer = `
            <button class="btn btn-secondary" data-action="cancel">Cancel</button>
            <button class="btn btn-primary" data-action="create">Create Account</button>
        `;

        Modal.show({
            title: 'Add a Kid',
            content,
            footer,
            size: 'md'
        });

        // Avatar selection
        const avatarGrid = document.querySelector('#avatar-grid');
        let selectedAvatar = avatars[0];

        avatarGrid.addEventListener('click', (e) => {
            const option = e.target.closest('.avatar-option');
            if (!option) return;

            avatarGrid.querySelectorAll('.avatar-option').forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
            selectedAvatar = option.dataset.avatar;
        });

        // Form submission
        document.querySelector('[data-action="cancel"]').addEventListener('click', () => Modal.close());
        document.querySelector('[data-action="create"]').addEventListener('click', async (e) => {
            const createButton = e.currentTarget;
            const name = document.querySelector('#kid-name').value.trim();
            const pin = document.querySelector('#kid-pin').value;
            const balanceInput = document.querySelector('#kid-balance').value;

            // Validate
            const nameValidation = Validators.kidName(name);
            if (!nameValidation.valid) {
                Toast.error(nameValidation.error);
                return;
            }

            const pinValidation = Validators.pin(pin);
            if (!pinValidation.valid) {
                Toast.error(pinValidation.error);
                return;
            }

            // Parse balance
            let initialBalance = 0;
            if (balanceInput) {
                const amountValidation = Validators.amount(balanceInput, 0);
                if (!amountValidation.valid) {
                    Toast.error(amountValidation.error);
                    return;
                }
                initialBalance = amountValidation.cents;
            }

            Helpers.setButtonLoading(createButton, true);

            // Create kid
            const result = await FirestoreService.createKid({
                name,
                pin,
                avatarEmoji: selectedAvatar,
                initialBalance
            });

            Helpers.setButtonLoading(createButton, false);

            if (result.success) {
                Toast.success(`${name}'s account created!`);
                Modal.close();
            } else {
                Toast.error(result.error);
            }
        });
    },

    /**
     * Show kid actions modal
     * @param {string} kidId - Kid ID
     */
    showKidActions(kidId) {
        const kids = Store.getState('kids');
        const kid = kids.find(k => k.id === kidId);
        if (!kid) return;

        const content = `
            <div class="kid-actions-header">
                <div class="kid-actions-avatar">${kid.avatarEmoji}</div>
                <h3 class="kid-actions-name">${Helpers.escapeHtml(kid.name)}</h3>
                <div class="kid-actions-balance">${Formatters.currency(kid.balance)}</div>
            </div>

            <div class="kid-actions-list">
                <button class="kid-action-item" data-action="add-money">
                    <span class="kid-action-icon">💰</span>
                    <span class="kid-action-label">Add Money</span>
                </button>
                <button class="kid-action-item" data-action="remove-money">
                    <span class="kid-action-icon">💸</span>
                    <span class="kid-action-label">Remove Money / Penalty</span>
                </button>
                <button class="kid-action-item" data-action="view-history">
                    <span class="kid-action-icon">📋</span>
                    <span class="kid-action-label">View Transaction History</span>
                </button>
            </div>
        `;

        Modal.show({
            title: '',
            content,
            size: 'sm'
        });

        // Bind action buttons
        document.querySelector('[data-action="add-money"]').addEventListener('click', () => {
            Modal.close();
            this.showAddMoneyModal(kid);
        });

        document.querySelector('[data-action="remove-money"]').addEventListener('click', () => {
            Modal.close();
            this.showRemoveMoneyModal(kid);
        });

        document.querySelector('[data-action="view-history"]').addEventListener('click', () => {
            Modal.close();
            // TODO: Navigate to kid's transaction history
            Toast.info('Transaction history coming soon!');
        });
    },

    /**
     * Show add money modal
     * @param {object} kid - Kid object
     */
    showAddMoneyModal(kid) {
        const content = `
            <form id="add-money-form">
                <p class="text-secondary mb-md">Add money to ${Helpers.escapeHtml(kid.name)}'s account</p>

                <div class="input-group mb-md">
                    <label class="input-label" for="add-amount">Amount</label>
                    <input type="text" class="input input-lg" id="add-amount" placeholder="$0.00" inputmode="decimal" required>
                </div>

                <div class="input-group">
                    <label class="input-label" for="add-description">Description (optional)</label>
                    <input type="text" class="input" id="add-description" placeholder="e.g., Allowance, Birthday gift">
                </div>
            </form>
        `;

        const footer = `
            <button class="btn btn-secondary" data-action="cancel">Cancel</button>
            <button class="btn btn-success" data-action="add">Add Money</button>
        `;

        Modal.show({
            title: 'Add Money',
            content,
            footer
        });

        document.querySelector('[data-action="cancel"]').addEventListener('click', () => Modal.close());
        document.querySelector('[data-action="add"]').addEventListener('click', async (e) => {
            const addButton = e.currentTarget;
            const amountInput = document.querySelector('#add-amount').value;
            const description = document.querySelector('#add-description').value.trim();

            const amountValidation = Validators.amount(amountInput);
            if (!amountValidation.valid) {
                Toast.error(amountValidation.error);
                return;
            }

            Helpers.setButtonLoading(addButton, true);

            const result = await FirestoreService.addMoney(kid.id, amountValidation.cents, description);

            Helpers.setButtonLoading(addButton, false);

            if (result.success) {
                Toast.success(`Added ${Formatters.currency(amountValidation.cents)} to ${kid.name}'s account!`);
                Modal.close();
            } else {
                Toast.error(result.error);
            }
        });
    },

    /**
     * Show remove money modal
     * @param {object} kid - Kid object
     */
    showRemoveMoneyModal(kid) {
        const content = `
            <form id="remove-money-form">
                <p class="text-secondary mb-md">Remove money from ${Helpers.escapeHtml(kid.name)}'s account</p>
                <p class="text-sm text-secondary mb-md">Current balance: <strong>${Formatters.currency(kid.balance)}</strong></p>

                <div class="input-group mb-md">
                    <label class="input-label" for="remove-amount">Amount</label>
                    <input type="text" class="input input-lg" id="remove-amount" placeholder="$0.00" inputmode="decimal" required>
                </div>

                <div class="input-group">
                    <label class="input-label" for="remove-reason">Reason</label>
                    <input type="text" class="input" id="remove-reason" placeholder="e.g., Didn't do chores">
                </div>
            </form>
        `;

        const footer = `
            <button class="btn btn-secondary" data-action="cancel">Cancel</button>
            <button class="btn btn-danger" data-action="remove">Remove Money</button>
        `;

        Modal.show({
            title: 'Remove Money / Penalty',
            content,
            footer
        });

        document.querySelector('[data-action="cancel"]').addEventListener('click', () => Modal.close());
        document.querySelector('[data-action="remove"]').addEventListener('click', async (e) => {
            const removeButton = e.currentTarget;
            const amountInput = document.querySelector('#remove-amount').value;
            const reason = document.querySelector('#remove-reason').value.trim();

            const amountValidation = Validators.amount(amountInput);
            if (!amountValidation.valid) {
                Toast.error(amountValidation.error);
                return;
            }

            if (amountValidation.cents > kid.balance) {
                Toast.error('Amount exceeds current balance');
                return;
            }

            Helpers.setButtonLoading(removeButton, true);

            const result = await FirestoreService.removeMoney(kid.id, amountValidation.cents, reason, 'penalty');

            Helpers.setButtonLoading(removeButton, false);

            if (result.success) {
                Toast.success(`Removed ${Formatters.currency(amountValidation.cents)} from ${kid.name}'s account`);
                Modal.close();
            } else {
                Toast.error(result.error);
            }
        });
    },

    /**
     * Show settings menu
     */
    showSettingsMenu() {
        const content = `
            <div class="settings-list">
                <button class="settings-item" data-action="theme">
                    <span class="settings-icon">🎨</span>
                    <span class="settings-label">Change Theme</span>
                </button>
                <button class="settings-item" data-action="account">
                    <span class="settings-icon">👤</span>
                    <span class="settings-label">Account Settings</span>
                </button>
                <button class="settings-item danger" data-action="signout">
                    <span class="settings-icon">🚪</span>
                    <span class="settings-label">Sign Out</span>
                </button>
            </div>
        `;

        Modal.show({
            title: 'Settings',
            content,
            size: 'sm'
        });

        document.querySelector('[data-action="theme"]').addEventListener('click', () => {
            Modal.close();
            this.showThemeModal();
        });

        document.querySelector('[data-action="account"]').addEventListener('click', () => {
            Modal.close();
            Toast.info('Account settings coming soon!');
        });

        document.querySelector('[data-action="signout"]').addEventListener('click', () => {
            Modal.close();
            this.handleSignOut();
        });
    },

    /**
     * Show theme selection modal
     */
    showThemeModal() {
        const currentTheme = ThemeService.getCurrentTheme();

        Modal.show({
            title: 'Choose Theme',
            content: ThemePicker.grid(currentTheme),
            size: 'md'
        });

        ThemePicker.bindEvents(document.querySelector('.modal-content'), (themeId) => {
            ThemeService.apply(themeId);
        });
    },

    /**
     * Handle sign out
     */
    async handleSignOut() {
        Modal.show({
            title: 'Sign Out',
            content: '<p class="text-secondary">Are you sure you want to sign out?</p>',
            footer: `
                <button class="btn btn-secondary" data-action="cancel">Cancel</button>
                <button class="btn btn-danger" data-action="confirm">Sign Out</button>
            `,
            size: 'sm',
            onClose: () => {}
        });

        const modal = document.querySelector('.modal-overlay');
        const confirmBtn = modal.querySelector('[data-action="confirm"]');
        const cancelBtn = modal.querySelector('[data-action="cancel"]');

        cancelBtn.addEventListener('click', () => Modal.close());

        confirmBtn.addEventListener('click', async () => {
            Helpers.setButtonLoading(confirmBtn, true);
            await AuthService.signOut();
            // No need to set loading to false, as the modal will close
            Modal.close();
            Router.navigate('landing');
        });
    }
};

// Add parent dashboard styles
const dashboardStyles = document.createElement('style');
dashboardStyles.textContent = `
    .parent-dashboard {
        padding-top: 0;
    }

    .dashboard-header {
        margin-bottom: var(--space-lg);
    }

    .dashboard-title {
        font-size: var(--font-size-xl);
        font-weight: var(--font-weight-bold);
        color: var(--color-text);
        margin-bottom: var(--space-xs);
    }

    .dashboard-subtitle {
        font-size: var(--font-size-sm);
        color: var(--color-text-secondary);
    }

    .dashboard-section {
        margin-bottom: var(--space-xl);
    }

    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--space-md);
    }

    .section-title {
        font-size: var(--font-size-md);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text);
    }

    .pending-alert {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background-color: var(--color-warning);
        color: #856404;
        padding: var(--space-md);
        border-radius: var(--radius-md);
        margin-bottom: var(--space-lg);
        cursor: pointer;
    }

    .pending-alert-content {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
    }

    .pending-alert-icon {
        font-size: 1.25rem;
    }

    .quick-actions {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--space-md);
    }

    .quick-action-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-sm);
        padding: var(--space-lg);
        background-color: var(--color-surface);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-sm);
        transition: all var(--transition-fast);
    }

    .quick-action-btn:hover {
        box-shadow: var(--shadow-md);
        transform: translateY(-2px);
    }

    .quick-action-icon {
        font-size: 1.5rem;
    }

    .quick-action-label {
        font-size: var(--font-size-xs);
        font-weight: var(--font-weight-medium);
        color: var(--color-text-secondary);
    }

    .kid-actions-header {
        text-align: center;
        margin-bottom: var(--space-lg);
    }

    .kid-actions-avatar {
        width: 64px;
        height: 64px;
        border-radius: var(--radius-full);
        background-color: var(--color-primary-light);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2rem;
        margin: 0 auto var(--space-sm);
    }

    .kid-actions-name {
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-semibold);
        margin-bottom: var(--space-xs);
    }

    .kid-actions-balance {
        font-size: var(--font-size-xl);
        font-weight: var(--font-weight-bold);
        color: var(--color-primary);
    }

    .kid-actions-list {
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
    }

    .kid-action-item {
        display: flex;
        align-items: center;
        gap: var(--space-md);
        padding: var(--space-md);
        border-radius: var(--radius-md);
        background-color: var(--color-input-bg);
        transition: all var(--transition-fast);
    }

    .kid-action-item:hover {
        background-color: var(--color-primary-light);
    }

    .kid-action-icon {
        font-size: 1.25rem;
    }

    .kid-action-label {
        font-weight: var(--font-weight-medium);
    }

    .settings-list {
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
    }

    .settings-item {
        display: flex;
        align-items: center;
        gap: var(--space-md);
        padding: var(--space-md);
        border-radius: var(--radius-md);
        background-color: var(--color-input-bg);
        transition: all var(--transition-fast);
        width: 100%;
        text-align: left;
    }

    .settings-item:hover {
        background-color: var(--color-primary-light);
    }

    .settings-item.danger {
        color: var(--color-error);
    }

    .settings-item.danger:hover {
        background-color: rgba(225, 112, 85, 0.15);
    }

    .settings-icon {
        font-size: 1.25rem;
    }

    .settings-label {
        font-weight: var(--font-weight-medium);
    }
`;
document.head.appendChild(dashboardStyles);

// Make available globally
window.ParentDashboardView = ParentDashboardView;
