/* ========================================
   EasyKidsBank - Manage Kids View
   ======================================== */

const ManageKidsView = {
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
        const kids = Store.getState('kids');

        this.container.innerHTML = `
            ${NavBar.simple('Manage Kids')}

            <div class="view manage-kids-view">
                <div class="container">
                    ${kids.length > 0 ? `
                        <div class="kids-manage-list stagger-children">
                            ${kids.map(kid => this.renderKidCard(kid)).join('')}
                        </div>
                    ` : `
                        <div class="empty-state">
                            <div class="empty-state-icon">👶</div>
                            <h3 class="empty-state-title">No kids yet</h3>
                            <p class="empty-state-text">Add your first child to get started!</p>
                        </div>
                    `}

                    <button class="btn btn-primary btn-lg btn-block mt-xl" id="btn-add-kid">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Add Kid
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * Render a kid management card
     * @param {object} kid - Kid object
     * @returns {string} HTML string
     */
    renderKidCard(kid) {
        return `
            <div class="kid-manage-card" data-kid-id="${kid.id}">
                <div class="kid-manage-info">
                    <div class="kid-manage-avatar">${kid.avatarEmoji}</div>
                    <div class="kid-manage-details">
                        <div class="kid-manage-name">${Helpers.escapeHtml(kid.name)}</div>
                        <div class="kid-manage-balance">${Formatters.currency(kid.balance)}</div>
                    </div>
                </div>
                <div class="kid-manage-actions">
                    <button class="btn btn-ghost btn-sm btn-icon" data-action="edit" title="Edit">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="btn btn-ghost btn-sm btn-icon" data-action="delete" title="Delete">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
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

        // Add kid button
        this.container.querySelector('#btn-add-kid')?.addEventListener('click', () => {
            ParentDashboardView.showAddKidModal();
        });

        // Kid action buttons
        this.container.querySelectorAll('.kid-manage-card').forEach(card => {
            const kidId = card.dataset.kidId;

            card.querySelector('[data-action="edit"]')?.addEventListener('click', () => {
                this.showEditKidModal(kidId);
            });

            card.querySelector('[data-action="delete"]')?.addEventListener('click', () => {
                this.confirmDeleteKid(kidId);
            });
        });
    },

    /**
     * Subscribe to state changes
     */
    subscribeToState() {
        const unsub = Store.subscribe('kids', () => {
            this.render();
            this.bindEvents();
        });
        this.unsubscribers.push(unsub);
    },

    /**
     * Show edit kid modal
     * @param {string} kidId - Kid ID
     */
    showEditKidModal(kidId) {
        const kids = Store.getState('kids');
        const kid = kids.find(k => k.id === kidId);
        if (!kid) return;

        const avatars = ['😊', '😎', '🦊', '🐱', '🐶', '🦁', '🐼', '🐨', '🐰', '🦄', '🐸', '🐙'];

        const content = `
            <form id="edit-kid-form">
                <div class="input-group mb-md">
                    <label class="input-label">Kid's Name</label>
                    <input type="text" class="input" id="edit-kid-name" value="${Helpers.escapeHtml(kid.name)}" required>
                </div>

                <div class="input-group mb-md">
                    <label class="input-label">Avatar</label>
                    <div class="avatar-grid" id="avatar-grid">
                        ${avatars.map(emoji => `
                            <button type="button" class="avatar-option ${emoji === kid.avatarEmoji ? 'selected' : ''}" data-avatar="${emoji}">
                                ${emoji}
                            </button>
                        `).join('')}
                    </div>
                </div>

                <div class="input-group">
                    <label class="input-label">New PIN (leave blank to keep current)</label>
                    <input type="password" class="input input-lg" id="edit-kid-pin" placeholder="••••" maxlength="4" pattern="[0-9]{4}" inputmode="numeric">
                </div>
            </form>
        `;

        const footer = `
            <button class="btn btn-secondary" data-action="cancel">Cancel</button>
            <button class="btn btn-primary" data-action="save">Save Changes</button>
        `;

        Modal.show({
            title: 'Edit Kid',
            content,
            footer
        });

        // Avatar selection
        const avatarGrid = document.querySelector('#avatar-grid');
        let selectedAvatar = kid.avatarEmoji;

        avatarGrid.addEventListener('click', (e) => {
            const option = e.target.closest('.avatar-option');
            if (!option) return;

            avatarGrid.querySelectorAll('.avatar-option').forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
            selectedAvatar = option.dataset.avatar;
        });

        // Form submission
        document.querySelector('[data-action="cancel"]').addEventListener('click', () => Modal.close());
        document.querySelector('[data-action="save"]').addEventListener('click', async () => {
            const name = document.querySelector('#edit-kid-name').value.trim();
            const newPin = document.querySelector('#edit-kid-pin').value;

            // Validate name
            const nameValidation = Validators.kidName(name);
            if (!nameValidation.valid) {
                Toast.error(nameValidation.error);
                return;
            }

            // Prepare updates
            const updates = {
                name,
                avatarEmoji: selectedAvatar
            };

            // Validate and add PIN if provided
            if (newPin) {
                const pinValidation = Validators.pin(newPin);
                if (!pinValidation.valid) {
                    Toast.error(pinValidation.error);
                    return;
                }
                updates.pin = newPin;
            }

            const result = await FirestoreService.updateKid(kidId, updates);

            if (result.success) {
                Toast.success('Changes saved!');
                Modal.close();
            } else {
                Toast.error(result.error);
            }
        });
    },

    /**
     * Confirm and delete kid
     * @param {string} kidId - Kid ID
     */
    async confirmDeleteKid(kidId) {
        const kids = Store.getState('kids');
        const kid = kids.find(k => k.id === kidId);
        if (!kid) return;

        const confirmed = await Modal.confirm({
            title: 'Delete Account',
            message: `Are you sure you want to delete ${kid.name}'s account? This will also delete all their transactions and cannot be undone.`,
            confirmText: 'Delete',
            danger: true
        });

        if (confirmed) {
            const result = await FirestoreService.deleteKid(kidId);

            if (result.success) {
                Toast.success(`${kid.name}'s account deleted`);
            } else {
                Toast.error(result.error);
            }
        }
    }
};

// Add manage kids view styles
const manageKidsStyles = document.createElement('style');
manageKidsStyles.textContent = `
    .manage-kids-view {
        padding-top: 0;
    }

    .kids-manage-list {
        display: flex;
        flex-direction: column;
        gap: var(--space-md);
    }

    .kid-manage-card {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background-color: var(--color-surface);
        border-radius: var(--radius-lg);
        padding: var(--space-md);
        box-shadow: var(--shadow-sm);
    }

    .kid-manage-info {
        display: flex;
        align-items: center;
        gap: var(--space-md);
    }

    .kid-manage-avatar {
        width: 48px;
        height: 48px;
        border-radius: var(--radius-full);
        background-color: var(--color-primary-light);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
    }

    .kid-manage-name {
        font-weight: var(--font-weight-semibold);
        color: var(--color-text);
    }

    .kid-manage-balance {
        font-size: var(--font-size-sm);
        color: var(--color-primary);
        font-weight: var(--font-weight-medium);
    }

    .kid-manage-actions {
        display: flex;
        gap: var(--space-xs);
    }

    .kid-manage-actions [data-action="delete"] {
        color: var(--color-error);
    }
`;
document.head.appendChild(manageKidsStyles);

// Make available globally
window.ManageKidsView = ManageKidsView;
