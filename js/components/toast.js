/* ========================================
   EasyKidsBank - Toast Notification Component
   ======================================== */

const Toast = {
    // Container element
    container: null,

    // Active toasts
    toasts: new Map(),

    // Default options
    defaultOptions: {
        duration: 4000,
        dismissible: true
    },

    /**
     * Initialize toast container
     */
    init() {
        this.container = document.getElementById('toast-container');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        }
    },

    /**
     * Show a toast notification
     * @param {string} message - Message to display
     * @param {string} type - Type of toast ('success', 'error', 'warning', 'info')
     * @param {object} options - Toast options
     * @returns {string} Toast ID
     */
    show(message, type = 'info', options = {}) {
        if (!this.container) this.init();

        const opts = { ...this.defaultOptions, ...options };
        const id = Helpers.generateId();

        // Icon based on type
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };

        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'polite');
        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || icons.info}</span>
            <span class="toast-message">${Helpers.escapeHtml(message)}</span>
            ${opts.dismissible ? '<button class="toast-dismiss btn-icon btn-sm" aria-label="Dismiss">✕</button>' : ''}
        `;

        // Add click handler for dismiss button
        if (opts.dismissible) {
            const dismissBtn = toast.querySelector('.toast-dismiss');
            dismissBtn.addEventListener('click', () => this.dismiss(id));
        }

        // Add to container
        this.container.appendChild(toast);
        this.toasts.set(id, { element: toast, timeout: null });

        // Auto dismiss after duration
        if (opts.duration > 0) {
            const timeout = setTimeout(() => this.dismiss(id), opts.duration);
            this.toasts.get(id).timeout = timeout;
        }

        return id;
    },

    /**
     * Dismiss a toast
     * @param {string} id - Toast ID to dismiss
     */
    dismiss(id) {
        const toastData = this.toasts.get(id);
        if (!toastData) return;

        const { element, timeout } = toastData;

        // Clear timeout if exists
        if (timeout) clearTimeout(timeout);

        // Add hiding class for animation
        element.classList.add('hiding');

        // Remove after animation
        setTimeout(() => {
            element.remove();
            this.toasts.delete(id);
        }, 150);
    },

    /**
     * Dismiss all toasts
     */
    dismissAll() {
        for (const id of this.toasts.keys()) {
            this.dismiss(id);
        }
    },

    /**
     * Show success toast
     * @param {string} message - Message to display
     * @param {object} options - Toast options
     * @returns {string} Toast ID
     */
    success(message, options = {}) {
        return this.show(message, 'success', options);
    },

    /**
     * Show error toast
     * @param {string} message - Message to display
     * @param {object} options - Toast options
     * @returns {string} Toast ID
     */
    error(message, options = {}) {
        return this.show(message, 'error', { duration: 6000, ...options });
    },

    /**
     * Show warning toast
     * @param {string} message - Message to display
     * @param {object} options - Toast options
     * @returns {string} Toast ID
     */
    warning(message, options = {}) {
        return this.show(message, 'warning', options);
    },

    /**
     * Show info toast
     * @param {string} message - Message to display
     * @param {object} options - Toast options
     * @returns {string} Toast ID
     */
    info(message, options = {}) {
        return this.show(message, 'info', options);
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => Toast.init());

// Make available globally
window.Toast = Toast;
