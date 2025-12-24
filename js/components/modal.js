/* ========================================
   EasyKidsBank - Modal Component
   ======================================== */

const Modal = {
    // Container element
    container: null,

    // Currently open modal
    currentModal: null,

    // Callback for close
    onCloseCallback: null,

    /**
     * Initialize modal container
     */
    init() {
        this.container = document.getElementById('modal-container');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'modal-container';
            document.body.appendChild(this.container);
        }

        // Close modal on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentModal) {
                this.close();
            }
        });
    },

    /**
     * Show a modal
     * @param {object} options - Modal options
     * @returns {HTMLElement} Modal element
     */
    show(options = {}) {
        if (!this.container) this.init();

        const {
            title = '',
            content = '',
            footer = null,
            size = 'md', // 'sm', 'md', 'lg', 'full'
            closable = true,
            onClose = null,
            className = ''
        } = options;

        // Store callback
        this.onCloseCallback = onClose;

        // Size classes
        const sizeStyles = {
            sm: 'max-width: 320px;',
            md: 'max-width: 400px;',
            lg: 'max-width: 540px;',
            full: 'max-width: calc(100vw - 2rem); max-height: calc(100vh - 2rem);'
        };

        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal ${className}" style="${sizeStyles[size] || sizeStyles.md}" role="dialog" aria-modal="true" ${title ? `aria-labelledby="modal-title"` : ''}>
                ${title ? `
                    <div class="modal-header">
                        <h2 class="modal-title" id="modal-title">${Helpers.escapeHtml(title)}</h2>
                        ${closable ? `
                            <button class="modal-close btn-icon" aria-label="Close modal">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        ` : ''}
                    </div>
                ` : ''}
                <div class="modal-content">
                    ${typeof content === 'string' ? content : ''}
                </div>
                ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
            </div>
        `;

        // Append content if it's an element
        if (typeof content !== 'string' && content instanceof Node) {
            overlay.querySelector('.modal-content').appendChild(content);
        }

        // Handle overlay click to close
        if (closable) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    Toast.info('Overlay clicked');
                    this.close();
                }
            });

            // Close button handler
            const closeBtn = overlay.querySelector('.modal-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.close());
            }
        }

        // Add to container
        this.container.appendChild(overlay);
        this.currentModal = overlay;

        // Prevent body scroll
        document.body.style.overflow = 'hidden';

        // Focus first focusable element
        setTimeout(() => {
            const focusable = overlay.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (focusable) focusable.focus();
        }, 100);

        return overlay;
    },

    /**
     * Close the current modal
     * @param {*} result - Result to pass to onClose callback
     */
    close(result = null) {
        if (!this.currentModal) return;

        Toast.info('Modal.close() called');

        // Add closing animation
        const modal = this.currentModal.querySelector('.modal');
        modal.style.animation = 'scaleOut var(--transition-fast) ease-in forwards';
        this.currentModal.style.animation = 'fadeOut var(--transition-fast) ease-in forwards';

        // Remove after animation
        setTimeout(() => {
            if (this.currentModal) {
                this.currentModal.remove();
                this.currentModal = null;
            }

            // Restore body scroll
            document.body.style.overflow = '';

            // Call callback
            if (this.onCloseCallback) {
                this.onCloseCallback(result);
                this.onCloseCallback = null;
            }
        }, 150);
    },

    /**
     * Show a confirm dialog
     * @param {object} options - Confirm options
     * @returns {Promise<boolean>} Resolves to true if confirmed, false otherwise
     */
    confirm(options = {}) {
        const {
            title = 'Confirm',
            message = 'Are you sure?',
            confirmText = 'Confirm',
            cancelText = 'Cancel',
            confirmClass = 'btn-primary',
            danger = false
        } = options;

        return new Promise((resolve) => {
            const content = `<p class="text-secondary">${Helpers.escapeHtml(message)}</p>`;
            const footer = `
                <button class="btn btn-secondary" data-action="cancel">${Helpers.escapeHtml(cancelText)}</button>
                <button class="btn ${danger ? 'btn-danger' : confirmClass}" data-action="confirm">${Helpers.escapeHtml(confirmText)}</button>
            `;

            const modal = this.show({
                title,
                content,
                footer,
                size: 'sm',
                onClose: (result) => resolve(result === true)
            });

            // Button handlers
            modal.querySelector('[data-action="cancel"]').addEventListener('click', () => {
                this.close(false);
            });

            modal.querySelector('[data-action="confirm"]').addEventListener('click', () => {
                this.close(true);
            });
        });
    },

    /**
     * Show an alert dialog
     * @param {object} options - Alert options
     * @returns {Promise<void>} Resolves when closed
     */
    alert(options = {}) {
        const {
            title = 'Alert',
            message = '',
            buttonText = 'OK'
        } = options;

        return new Promise((resolve) => {
            const content = `<p class="text-secondary">${Helpers.escapeHtml(message)}</p>`;
            const footer = `
                <button class="btn btn-primary btn-block" data-action="ok">${Helpers.escapeHtml(buttonText)}</button>
            `;

            const modal = this.show({
                title,
                content,
                footer,
                size: 'sm',
                onClose: () => resolve()
            });

            modal.querySelector('[data-action="ok"]').addEventListener('click', () => {
                this.close();
            });
        });
    },

    /**
     * Show a prompt dialog
     * @param {object} options - Prompt options
     * @returns {Promise<string|null>} Resolves to input value or null if cancelled
     */
    prompt(options = {}) {
        const {
            title = 'Input',
            message = '',
            placeholder = '',
            defaultValue = '',
            inputType = 'text',
            confirmText = 'OK',
            cancelText = 'Cancel'
        } = options;

        return new Promise((resolve) => {
            const content = `
                ${message ? `<p class="text-secondary mb-md">${Helpers.escapeHtml(message)}</p>` : ''}
                <input type="${inputType}" class="input" placeholder="${Helpers.escapeHtml(placeholder)}" value="${Helpers.escapeHtml(defaultValue)}" id="modal-prompt-input">
            `;
            const footer = `
                <button class="btn btn-secondary" data-action="cancel">${Helpers.escapeHtml(cancelText)}</button>
                <button class="btn btn-primary" data-action="confirm">${Helpers.escapeHtml(confirmText)}</button>
            `;

            const modal = this.show({
                title,
                content,
                footer,
                size: 'sm',
                onClose: (result) => resolve(result)
            });

            const input = modal.querySelector('#modal-prompt-input');
            input.focus();
            input.select();

            // Enter key to confirm
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.close(input.value);
                }
            });

            modal.querySelector('[data-action="cancel"]').addEventListener('click', () => {
                this.close(null);
            });

            modal.querySelector('[data-action="confirm"]').addEventListener('click', () => {
                this.close(input.value);
            });
        });
    },

    /**
     * Update modal content
     * @param {string|Node} content - New content
     */
    updateContent(content) {
        if (!this.currentModal) return;

        const contentEl = this.currentModal.querySelector('.modal-content');
        if (typeof content === 'string') {
            contentEl.innerHTML = content;
        } else {
            contentEl.innerHTML = '';
            contentEl.appendChild(content);
        }
    },

    /**
     * Update modal footer
     * @param {string} footer - New footer HTML
     */
    updateFooter(footer) {
        if (!this.currentModal) return;

        let footerEl = this.currentModal.querySelector('.modal-footer');
        if (!footerEl) {
            footerEl = document.createElement('div');
            footerEl.className = 'modal-footer';
            this.currentModal.querySelector('.modal').appendChild(footerEl);
        }

        footerEl.innerHTML = footer;
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => Modal.init());

// Make available globally
window.Modal = Modal;
