/* ========================================
   EasyKidsBank - Kid Card Component
   ======================================== */

const KidCard = {
    /**
     * Create a kid card
     * @param {object} kid - Kid object
     * @param {object} options - Card options
     * @returns {string} HTML string
     */
    create(kid, options = {}) {
        const {
            showBalance = true,
            showArrow = true,
            clickable = true,
            showActions = false
        } = options;

        const balance = showBalance ? `
            <div class="kid-balance">${Formatters.currency(kid.balance || 0)}</div>
        ` : '';

        const arrow = showArrow ? `
            <span class="kid-card-arrow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 18l6-6-6-6"></path>
                </svg>
            </span>
        ` : '';

        const actions = showActions ? `
            <div class="kid-card-actions">
                <button class="btn btn-ghost btn-sm btn-icon" data-action="add-money" title="Add Money">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="16"></line>
                        <line x1="8" y1="12" x2="16" y2="12"></line>
                    </svg>
                </button>
                <button class="btn btn-ghost btn-sm btn-icon" data-action="remove-money" title="Remove Money">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="8" y1="12" x2="16" y2="12"></line>
                    </svg>
                </button>
            </div>
        ` : arrow;

        return `
            <div class="kid-card ${clickable ? 'tap-highlight' : ''}" data-kid-id="${kid.id}" ${clickable ? 'role="button" tabindex="0"' : ''}>
                <div class="kid-avatar">${kid.avatarEmoji || '👤'}</div>
                <div class="kid-info">
                    <div class="kid-name">${Helpers.escapeHtml(kid.name || 'Unknown')}</div>
                    ${balance}
                </div>
                ${actions}
            </div>
        `;
    },

    /**
     * Create a list of kid cards
     * @param {array} kids - Array of kid objects
     * @param {object} options - List options
     * @returns {string} HTML string
     */
    list(kids, options = {}) {
        if (!kids || kids.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-state-icon">👶</div>
                    <h3 class="empty-state-title">No kids yet</h3>
                    <p class="empty-state-text">Add your first child to get started!</p>
                </div>
            `;
        }

        return `
            <div class="kid-card-list stagger-children">
                ${kids.map(kid => this.create(kid, options)).join('')}
            </div>
        `;
    },

    /**
     * Create a kid selection card (for kid login)
     * @param {object} kid - Kid object
     * @returns {string} HTML string
     */
    selection(kid) {
        return `
            <div class="kid-selection-card tap-highlight" data-kid-id="${kid.id}" role="button" tabindex="0">
                <div class="kid-selection-avatar">${kid.avatarEmoji || '👤'}</div>
                <div class="kid-selection-name">${Helpers.escapeHtml(kid.name || 'Unknown')}</div>
            </div>
        `;
    },

    /**
     * Create a kid selection grid
     * @param {array} kids - Array of kid objects
     * @returns {string} HTML string
     */
    selectionGrid(kids) {
        if (!kids || kids.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-state-icon">👶</div>
                    <h3 class="empty-state-title">No kids available</h3>
                    <p class="empty-state-text">Ask a parent to create your account first!</p>
                </div>
            `;
        }

        return `
            <div class="kid-selection-grid">
                ${kids.map(kid => this.selection(kid)).join('')}
            </div>
        `;
    },

    /**
     * Bind click events to kid cards
     * @param {HTMLElement} container - Container element
     * @param {function} onClick - Click handler (receives kid id)
     * @param {object} actionHandlers - Action button handlers
     */
    bindEvents(container, onClick, actionHandlers = {}) {
        const cards = container.querySelectorAll('.kid-card, .kid-selection-card');

        cards.forEach(card => {
            card.addEventListener('click', (e) => {
                // Don't trigger if clicking an action button
                if (e.target.closest('[data-action]')) return;

                const kidId = card.dataset.kidId;
                if (onClick) onClick(kidId);
            });

            // Keyboard accessibility
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    card.click();
                }
            });
        });

        // Bind action buttons
        if (actionHandlers.onAddMoney) {
            container.querySelectorAll('[data-action="add-money"]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const kidId = btn.closest('.kid-card').dataset.kidId;
                    actionHandlers.onAddMoney(kidId);
                });
            });
        }

        if (actionHandlers.onRemoveMoney) {
            container.querySelectorAll('[data-action="remove-money"]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const kidId = btn.closest('.kid-card').dataset.kidId;
                    actionHandlers.onRemoveMoney(kidId);
                });
            });
        }
    }
};

// Add styles for kid selection
const kidSelectionStyles = document.createElement('style');
kidSelectionStyles.textContent = `
    .kid-card-list {
        display: flex;
        flex-direction: column;
        gap: var(--space-md);
    }

    .kid-card-actions {
        display: flex;
        gap: var(--space-xs);
    }

    .kid-selection-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
        gap: var(--space-md);
        max-width: 400px;
        margin: 0 auto;
    }

    .kid-selection-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-sm);
        padding: var(--space-lg);
        background-color: var(--color-surface);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-md);
        cursor: pointer;
        transition: all var(--transition-fast);
    }

    .kid-selection-card:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-lg);
    }

    .kid-selection-card:active {
        transform: translateY(0);
    }

    .kid-selection-avatar {
        width: 64px;
        height: 64px;
        border-radius: var(--radius-full);
        background-color: var(--color-primary-light);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2rem;
    }

    .kid-selection-name {
        font-weight: var(--font-weight-semibold);
        color: var(--color-text);
        text-align: center;
    }
`;
document.head.appendChild(kidSelectionStyles);

// Make available globally
window.KidCard = KidCard;
