/* ========================================
   EasyKidsBank - Loader Component
   ======================================== */

const Loader = {
    /**
     * Show the loading screen
     */
    show() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.remove('hidden');
        }
    },

    /**
     * Hide the loading screen
     */
    hide() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
    },

    /**
     * Create an inline loading spinner
     * @param {string} size - Size of spinner ('sm', 'md', 'lg')
     * @returns {string} HTML string
     */
    spinner(size = 'md') {
        const sizes = {
            sm: '20px',
            md: '32px',
            lg: '48px'
        };

        const spinnerSize = sizes[size] || sizes.md;

        return `
            <div class="inline-spinner" style="width: ${spinnerSize}; height: ${spinnerSize};">
                <div class="loading-spinner" style="width: 100%; height: 100%;"></div>
            </div>
        `;
    },

    /**
     * Create a full-page loading overlay
     * @param {string} message - Optional message to display
     * @returns {HTMLElement} Overlay element
     */
    createOverlay(message = 'Loading...') {
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <p class="loading-message">${Helpers.escapeHtml(message)}</p>
            </div>
        `;

        // Add styles for overlay if not already present
        if (!document.getElementById('loader-overlay-styles')) {
            const style = document.createElement('style');
            style.id = 'loader-overlay-styles';
            style.textContent = `
                .loading-overlay {
                    position: fixed;
                    inset: 0;
                    background-color: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    animation: fadeIn var(--transition-fast) ease-out;
                }
                .loading-overlay .loading-content {
                    background-color: var(--color-surface);
                    padding: var(--space-xl);
                    border-radius: var(--radius-lg);
                    text-align: center;
                    box-shadow: var(--shadow-xl);
                }
                .loading-overlay .loading-message {
                    margin-top: var(--space-md);
                    color: var(--color-text-secondary);
                    font-size: var(--font-size-sm);
                }
                .inline-spinner {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                }
            `;
            document.head.appendChild(style);
        }

        return overlay;
    },

    /**
     * Show a loading overlay with message
     * @param {string} message - Message to display
     * @returns {function} Function to remove the overlay
     */
    showOverlay(message = 'Loading...') {
        const overlay = this.createOverlay(message);
        document.body.appendChild(overlay);

        return () => {
            overlay.classList.add('hiding');
            setTimeout(() => {
                overlay.remove();
            }, 150);
        };
    },

    /**
     * Create skeleton loading placeholder
     * @param {string} type - Type of skeleton ('text', 'avatar', 'card', 'button')
     * @param {object} options - Options for the skeleton
     * @returns {string} HTML string
     */
    skeleton(type = 'text', options = {}) {
        const { width = '100%', height, lines = 1 } = options;

        switch (type) {
            case 'text':
                let textHtml = '';
                for (let i = 0; i < lines; i++) {
                    const lineWidth = i === lines - 1 && lines > 1 ? '60%' : width;
                    textHtml += `<div class="skeleton skeleton-text" style="width: ${lineWidth}; margin-bottom: 0.5rem;"></div>`;
                }
                return textHtml;

            case 'avatar':
                return `<div class="skeleton skeleton-avatar"></div>`;

            case 'card':
                return `<div class="skeleton skeleton-card" style="height: ${height || '80px'};"></div>`;

            case 'button':
                return `<div class="skeleton" style="width: ${width}; height: ${height || '48px'}; border-radius: var(--radius-md);"></div>`;

            default:
                return `<div class="skeleton" style="width: ${width}; height: ${height || '1rem'};"></div>`;
        }
    },

    /**
     * Create a kid card skeleton
     * @returns {string} HTML string
     */
    kidCardSkeleton() {
        return `
            <div class="kid-card" style="cursor: default;">
                <div class="skeleton skeleton-avatar"></div>
                <div class="kid-info" style="flex: 1;">
                    <div class="skeleton skeleton-text" style="width: 60%; margin-bottom: 0.5rem;"></div>
                    <div class="skeleton skeleton-text" style="width: 40%;"></div>
                </div>
            </div>
        `;
    },

    /**
     * Create a transaction skeleton
     * @returns {string} HTML string
     */
    transactionSkeleton() {
        return `
            <div class="transaction-item">
                <div class="skeleton" style="width: 40px; height: 40px; border-radius: 50%;"></div>
                <div class="transaction-details" style="flex: 1;">
                    <div class="skeleton skeleton-text" style="width: 70%; margin-bottom: 0.25rem;"></div>
                    <div class="skeleton skeleton-text" style="width: 40%; height: 0.75rem;"></div>
                </div>
                <div class="skeleton skeleton-text" style="width: 60px;"></div>
            </div>
        `;
    }
};

// Make available globally
window.Loader = Loader;
