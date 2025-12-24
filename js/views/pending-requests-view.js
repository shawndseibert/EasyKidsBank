/* ========================================
   EasyKidsBank - Pending Requests View
   ======================================== */

const PendingRequestsView = {
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
        const requests = Store.getState('pendingRequests');

        this.container.innerHTML = `
            ${NavBar.simple('Pending Requests')}

            <div class="view pending-requests-view">
                <div class="container">
                    ${requests.length > 0 ? `
                        <p class="requests-count">${requests.length} pending request${requests.length > 1 ? 's' : ''}</p>
                        <div class="requests-list stagger-children">
                            ${requests.map(request => this.renderRequestCard(request)).join('')}
                        </div>
                    ` : `
                        <div class="empty-state">
                            <div class="empty-state-icon">✨</div>
                            <h3 class="empty-state-title">All caught up!</h3>
                            <p class="empty-state-text">No pending deposit requests</p>
                        </div>
                    `}
                </div>
            </div>
        `;
    },

    /**
     * Render a request card
     * @param {object} request - Request object
     * @returns {string} HTML string
     */
    renderRequestCard(request) {
        return `
            <div class="request-card" data-request-id="${request.id}">
                <div class="request-header">
                    <div class="request-avatar">${request.kidAvatar || '👶'}</div>
                    <div class="request-info">
                        <div class="request-kid-name">${Helpers.escapeHtml(request.kidName)}</div>
                        <div class="request-date">${Formatters.relativeTime(request.createdAt)}</div>
                    </div>
                    <div class="request-amount">${Formatters.currency(request.amount)}</div>
                </div>

                ${request.description ? `
                    <div class="request-description">
                        "${Helpers.escapeHtml(request.description)}"
                    </div>
                ` : ''}

                <div class="request-actions">
                    <button class="btn btn-danger" data-action="deny">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                        Deny
                    </button>
                    <button class="btn btn-success" data-action="approve">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        Approve
                    </button>
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
            onBack: () => Router.navigate('parent-dashboard')
        });

        // Request action buttons
        this.container.querySelectorAll('.request-card').forEach(card => {
            const requestId = card.dataset.requestId;

            card.querySelector('[data-action="approve"]')?.addEventListener('click', () => {
                this.approveRequest(requestId);
            });

            card.querySelector('[data-action="deny"]')?.addEventListener('click', () => {
                this.denyRequest(requestId);
            });
        });
    },

    /**
     * Subscribe to state changes
     */
    subscribeToState() {
        const unsub = Store.subscribe('pendingRequests', () => {
            this.render();
            this.bindEvents();
        });
        this.unsubscribers.push(unsub);
    },

    /**
     * Approve a request
     * @param {string} requestId - Request ID
     */
    async approveRequest(requestId) {
        const requests = Store.getState('pendingRequests');
        const request = requests.find(r => r.id === requestId);
        if (!request) return;

        const note = await Modal.prompt({
            title: 'Approve Request',
            message: `Approve ${Formatters.currency(request.amount)} deposit for ${request.kidName}?`,
            placeholder: 'Add a note (optional)',
            confirmText: 'Approve'
        });

        // If user cancelled (pressed escape or cancel)
        if (note === null) return;

        const result = await FirestoreService.approveRequest(requestId, note);

        if (result.success) {
            Toast.success(`Approved! Added ${Formatters.currency(request.amount)} to ${request.kidName}'s account`);
        } else {
            Toast.error(result.error);
        }
    },

    /**
     * Deny a request
     * @param {string} requestId - Request ID
     */
    async denyRequest(requestId) {
        const requests = Store.getState('pendingRequests');
        const request = requests.find(r => r.id === requestId);
        if (!request) return;

        const confirmed = await Modal.confirm({
            title: 'Deny Request',
            message: `Deny ${request.kidName}'s request for ${Formatters.currency(request.amount)}?`,
            confirmText: 'Deny',
            danger: true
        });

        if (!confirmed) return;

        const result = await FirestoreService.denyRequest(requestId);

        if (result.success) {
            Toast.info('Request denied');
        } else {
            Toast.error(result.error);
        }
    }
};

// Add pending requests view styles
const pendingRequestsStyles = document.createElement('style');
pendingRequestsStyles.textContent = `
    .pending-requests-view {
        padding-top: 0;
    }

    .requests-count {
        font-size: var(--font-size-sm);
        color: var(--color-text-secondary);
        margin-bottom: var(--space-md);
    }

    .requests-list {
        display: flex;
        flex-direction: column;
        gap: var(--space-md);
    }
`;
document.head.appendChild(pendingRequestsStyles);

// Make available globally
window.PendingRequestsView = PendingRequestsView;
