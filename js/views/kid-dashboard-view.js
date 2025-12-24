/* ========================================
   EasyKidsBank - Kid Dashboard View
   ======================================== */

const KidDashboardView = {
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
        const transactions = Store.getState('transactions');

        if (!kid) {
            Router.navigate('landing');
            return;
        }

        this.container.innerHTML = `
            ${NavBar.kidDashboard(kid)}

            <div class="view kid-dashboard">
                <div class="container">
                    <!-- Balance Card -->
                    <div class="balance-section animate slideUp">
                        ${BalanceCard.create(kid.balance, {
                            label: 'My Savings',
                            size: 'lg'
                        })}
                    </div>

                    <!-- Actions -->
                    <div class="kid-actions animate slideUp animate-delay-100">
                        <button class="btn btn-primary btn-lg btn-block" id="btn-request-deposit">
                            <span>💰</span>
                            <span>Request Deposit</span>
                        </button>
                    </div>

                    <!-- Recent Activity -->
                    <div class="animate slideUp animate-delay-200">
                        ${TransactionList.section(transactions, {
                            title: 'My Activity',
                            limit: 5,
                            showViewAll: false
                        })}
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Profile button
        const profileBtn = this.container.querySelector('#nav-profile-btn');
        if (profileBtn) {
            profileBtn.addEventListener('click', () => {
                Router.navigate('kid-profile');
            });
        }

        // Exit button
        const exitBtn = this.container.querySelector('#nav-exit-btn');
        if (exitBtn) {
            exitBtn.addEventListener('click', () => {
                this.handleExit();
            });
        }

        // Request deposit button
        const requestBtn = this.container.querySelector('#btn-request-deposit');
        if (requestBtn) {
            requestBtn.addEventListener('click', () => {
                this.showRequestDepositModal();
            });
        }
    },

    /**
     * Subscribe to state changes
     */
    subscribeToState() {
        const unsubKid = Store.subscribe('currentKid', () => {
            this.render();
            this.bindEvents();
        });
        this.unsubscribers.push(unsubKid);

        const unsubTransactions = Store.subscribe('transactions', () => {
            this.render();
            this.bindEvents();
        });
        this.unsubscribers.push(unsubTransactions);
    },

    /**
     * Show request deposit modal
     */
    showRequestDepositModal() {
        const kid = Store.getState('currentKid');

        const content = `
            <form id="request-form">
                <p class="text-secondary mb-md">Ask your parent to add money to your account</p>

                <div class="input-group mb-md">
                    <label class="input-label" for="request-amount">How much do you want to deposit?</label>
                    <input type="text" class="input input-lg" id="request-amount" placeholder="$0.00" inputmode="decimal" required>
                </div>

                <div class="input-group">
                    <label class="input-label" for="request-description">What is this money for?</label>
                    <input type="text" class="input" id="request-description" placeholder="e.g., Birthday money, Allowance">
                    <span class="input-hint">Tell your parent where this money came from</span>
                </div>
            </form>
        `;

        const footer = `
            <button class="btn btn-secondary" data-action="cancel">Cancel</button>
            <button class="btn btn-primary" data-action="request">Send Request</button>
        `;

        Modal.show({
            title: 'Request Deposit',
            content,
            footer
        });

        document.querySelector('[data-action="cancel"]').addEventListener('click', () => Modal.close());
        document.querySelector('[data-action="request"]').addEventListener('click', async (e) => {
            const requestButton = e.currentTarget;
            const amountInput = document.querySelector('#request-amount').value;
            const description = document.querySelector('#request-description').value.trim();

            const amountValidation = Validators.amount(amountInput);
            if (!amountValidation.valid) {
                Toast.error(amountValidation.error);
                return;
            }

            Helpers.setButtonLoading(requestButton, true);

            const result = await FirestoreService.createDepositRequest(
                amountValidation.cents,
                description || 'Deposit request'
            );

            Helpers.setButtonLoading(requestButton, false);

            if (result.success) {
                Toast.success('Request sent! Your parent will review it.');
                Modal.close();
            } else {
                Toast.error(result.error);
            }
        });
    },

    /**
     * Handle exit kid mode
     */
    async handleExit() {
        Modal.show({
            title: 'Exit Kid Mode',
            content: '<p class="text-secondary">Are you sure you want to exit?</p>',
            footer: `
                <button class="btn btn-secondary" data-action="cancel">Stay</button>
                <button class="btn btn-primary" data-action="confirm">Exit</button>
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
            AuthService.exitKidMode();
            // No need to set loading to false, as the modal will close
            Modal.close();
            Router.navigate('parent-dashboard');
        });
    }
};

// Add kid dashboard styles
const kidDashboardStyles = document.createElement('style');
kidDashboardStyles.textContent = `
    .kid-dashboard {
        padding-top: 0;
    }

    .balance-section {
        margin-bottom: var(--space-xl);
    }

    .kid-actions {
        margin-bottom: var(--space-xl);
    }

    .kid-actions .btn {
        gap: var(--space-md);
    }
`;
document.head.appendChild(kidDashboardStyles);

// Make available globally
window.KidDashboardView = KidDashboardView;
