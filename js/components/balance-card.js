/* ========================================
   EasyKidsBank - Balance Card Component
   ======================================== */

const BalanceCard = {
    /**
     * Create a balance card
     * @param {number} balanceCents - Balance in cents
     * @param {object} options - Card options
     * @returns {string} HTML string
     */
    create(balanceCents = 0, options = {}) {
        const {
            label = 'Current Balance',
            showCurrency = true,
            size = 'lg', // 'sm', 'md', 'lg'
            animated = true
        } = options;

        const formattedAmount = Formatters.amount(balanceCents);
        const animationClass = animated ? 'balance-animate' : '';

        const sizeClasses = {
            sm: 'balance-card-sm',
            md: '',
            lg: 'balance-card-lg'
        };

        return `
            <div class="balance-card ${sizeClasses[size] || ''} ${animationClass}">
                <span class="balance-label">${Helpers.escapeHtml(label)}</span>
                <div class="balance-display">
                    ${showCurrency ? '<span class="balance-currency">$</span>' : ''}
                    <span class="balance-amount" data-balance="${balanceCents}">${formattedAmount}</span>
                </div>
            </div>
        `;
    },

    /**
     * Create a mini balance display (for cards, headers, etc.)
     * @param {number} balanceCents - Balance in cents
     * @returns {string} HTML string
     */
    mini(balanceCents = 0) {
        return `
            <span class="balance-mini">
                ${Formatters.currency(balanceCents)}
            </span>
        `;
    },

    /**
     * Update balance with animation
     * @param {HTMLElement} container - Container with balance card
     * @param {number} newBalanceCents - New balance in cents
     * @param {string} changeType - Type of change ('increment' or 'decrement')
     */
    update(container, newBalanceCents, changeType = null) {
        const amountEl = container.querySelector('.balance-amount');
        if (!amountEl) return;

        const oldBalance = parseInt(amountEl.dataset.balance) || 0;
        const newFormatted = Formatters.amount(newBalanceCents);

        // Determine change type if not provided
        if (!changeType) {
            changeType = newBalanceCents > oldBalance ? 'increment' : 'decrement';
        }

        // Add animation class
        const card = container.querySelector('.balance-card');
        if (card) {
            card.classList.remove('balance-increment', 'balance-decrement');
            if (newBalanceCents !== oldBalance) {
                card.classList.add(`balance-${changeType}`);

                // Remove class after animation
                setTimeout(() => {
                    card.classList.remove(`balance-${changeType}`);
                }, 300);
            }
        }

        // Animate the number change
        this.animateValue(amountEl, oldBalance, newBalanceCents, 500);
        amountEl.dataset.balance = newBalanceCents;
    },

    /**
     * Animate a value change
     * @param {HTMLElement} element - Element to animate
     * @param {number} start - Start value (in cents)
     * @param {number} end - End value (in cents)
     * @param {number} duration - Animation duration in ms
     */
    animateValue(element, start, end, duration) {
        const startTime = performance.now();
        const diff = end - start;

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (ease out)
            const easeProgress = 1 - Math.pow(1 - progress, 3);

            const current = Math.round(start + diff * easeProgress);
            element.textContent = Formatters.amount(current);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }
};

// Add additional styles for balance card sizes
const balanceStyles = document.createElement('style');
balanceStyles.textContent = `
    .balance-card-sm {
        padding: var(--space-md);
    }
    .balance-card-sm .balance-label {
        font-size: var(--font-size-xs);
    }
    .balance-card-sm .balance-amount {
        font-size: var(--font-size-xl);
    }
    .balance-card-sm .balance-currency {
        font-size: var(--font-size-md);
    }

    .balance-card-lg {
        padding: var(--space-2xl) var(--space-xl);
    }

    .balance-display {
        display: flex;
        align-items: baseline;
        justify-content: center;
        gap: var(--space-xs);
    }

    .balance-mini {
        font-weight: var(--font-weight-bold);
        color: var(--color-primary);
    }
`;
document.head.appendChild(balanceStyles);

// Make available globally
window.BalanceCard = BalanceCard;
