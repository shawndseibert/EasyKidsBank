/* ========================================
   EasyKidsBank - Transaction List Component
   ======================================== */

const TransactionList = {
    /**
     * Create a transaction item
     * @param {object} transaction - Transaction object
     * @returns {string} HTML string
     */
    item(transaction) {
        const {
            type = 'deposit',
            amount = 0,
            description = '',
            createdAt,
            status = 'completed'
        } = transaction;

        const icon = Formatters.transactionIcon(type);
        const isPositive = type === 'deposit' || type === 'reward';
        const amountClass = isPositive ? 'positive' : 'negative';
        const amountPrefix = isPositive ? '+' : '-';
        const formattedAmount = Formatters.currency(Math.abs(amount));
        const formattedDate = Formatters.shortDate(createdAt);

        let statusBadge = '';
        if (status === 'pending') {
            statusBadge = '<span class="transaction-status pending">Pending</span>';
        }

        return `
            <div class="transaction-item" data-transaction-id="${transaction.id || ''}">
                <div class="transaction-icon ${type}">${icon}</div>
                <div class="transaction-details">
                    <div class="transaction-description">${Helpers.escapeHtml(description || Formatters.transactionType(type))}</div>
                    <div class="transaction-date">${formattedDate}</div>
                </div>
                <div class="transaction-right">
                    <div class="transaction-amount ${amountClass}">${amountPrefix}${formattedAmount}</div>
                    ${statusBadge}
                </div>
            </div>
        `;
    },

    /**
     * Create a transaction list
     * @param {array} transactions - Array of transaction objects
     * @param {object} options - List options
     * @returns {string} HTML string
     */
    create(transactions, options = {}) {
        const { limit = 10, showEmpty = true, emptyMessage = 'No transactions yet' } = options;

        if (!transactions || transactions.length === 0) {
            if (showEmpty) {
                return `
                    <div class="empty-state">
                        <div class="empty-state-icon">📝</div>
                        <h3 class="empty-state-title">${Helpers.escapeHtml(emptyMessage)}</h3>
                        <p class="empty-state-text">Transactions will appear here</p>
                    </div>
                `;
            }
            return '';
        }

        const limitedTransactions = transactions.slice(0, limit);

        return `
            <div class="transaction-list">
                ${limitedTransactions.map(t => this.item(t)).join('')}
            </div>
        `;
    },

    /**
     * Create a transaction section with header
     * @param {array} transactions - Array of transaction objects
     * @param {object} options - Section options
     * @returns {string} HTML string
     */
    section(transactions, options = {}) {
        const { title = 'Recent Activity', limit = 5, showViewAll = true } = options;

        return `
            <section class="transaction-section">
                <div class="section-header flex justify-between items-center mb-md">
                    <h3 class="section-title">${Helpers.escapeHtml(title)}</h3>
                    ${showViewAll && transactions.length > limit ? `
                        <button class="btn btn-ghost btn-sm" id="view-all-transactions">View All</button>
                    ` : ''}
                </div>
                ${this.create(transactions, { ...options, limit })}
            </section>
        `;
    },

    /**
     * Create loading skeleton for transactions
     * @param {number} count - Number of skeleton items
     * @returns {string} HTML string
     */
    skeleton(count = 3) {
        let html = '<div class="transaction-list">';
        for (let i = 0; i < count; i++) {
            html += Loader.transactionSkeleton();
        }
        html += '</div>';
        return html;
    },

    /**
     * Group transactions by date
     * @param {array} transactions - Array of transaction objects
     * @returns {object} Grouped transactions
     */
    groupByDate(transactions) {
        const groups = {};

        transactions.forEach(transaction => {
            let date = transaction.createdAt;

            // Handle Firestore Timestamp
            if (date && typeof date.toDate === 'function') {
                date = date.toDate();
            } else if (typeof date === 'number') {
                date = new Date(date);
            }

            if (!(date instanceof Date)) {
                date = new Date();
            }

            const dateKey = date.toDateString();

            if (!groups[dateKey]) {
                groups[dateKey] = {
                    date: date,
                    transactions: []
                };
            }

            groups[dateKey].transactions.push(transaction);
        });

        return groups;
    },

    /**
     * Create a grouped transaction list
     * @param {array} transactions - Array of transaction objects
     * @returns {string} HTML string
     */
    grouped(transactions) {
        if (!transactions || transactions.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-state-icon">📝</div>
                    <h3 class="empty-state-title">No transactions yet</h3>
                    <p class="empty-state-text">Your transaction history will appear here</p>
                </div>
            `;
        }

        const groups = this.groupByDate(transactions);
        let html = '';

        Object.values(groups)
            .sort((a, b) => b.date - a.date)
            .forEach(group => {
                const today = new Date();
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);

                let dateLabel;
                if (group.date.toDateString() === today.toDateString()) {
                    dateLabel = 'Today';
                } else if (group.date.toDateString() === yesterday.toDateString()) {
                    dateLabel = 'Yesterday';
                } else {
                    dateLabel = group.date.toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric'
                    });
                }

                html += `
                    <div class="transaction-group">
                        <h4 class="transaction-group-date">${dateLabel}</h4>
                        <div class="transaction-list">
                            ${group.transactions.map(t => this.item(t)).join('')}
                        </div>
                    </div>
                `;
            });

        return html;
    }
};

// Add styles for grouped transactions
const transactionStyles = document.createElement('style');
transactionStyles.textContent = `
    .transaction-section {
        margin-top: var(--space-lg);
    }

    .section-title {
        font-size: var(--font-size-md);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text);
    }

    .transaction-right {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: var(--space-xs);
    }

    .transaction-group {
        margin-bottom: var(--space-lg);
    }

    .transaction-group-date {
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
        color: var(--color-text-secondary);
        margin-bottom: var(--space-sm);
        padding-bottom: var(--space-xs);
        border-bottom: 1px solid var(--color-divider);
    }
`;
document.head.appendChild(transactionStyles);

// Make available globally
window.TransactionList = TransactionList;
