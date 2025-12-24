/* ========================================
   EasyKidsBank - Navigation Bar Component
   ======================================== */

const NavBar = {
    /**
     * Create a navigation bar
     * @param {object} options - Navigation bar options
     * @returns {string} HTML string
     */
    create(options = {}) {
        const {
            title = 'EasyKidsBank',
            showBack = false,
            showLogo = false,
            rightContent = '',
            onBack = null
        } = options;

        const backButton = showBack ? `
            <button class="nav-back-btn btn-ghost btn-sm" id="nav-back-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 12H5"></path>
                    <path d="M12 19l-7-7 7-7"></path>
                </svg>
                <span>Back</span>
            </button>
        ` : '';

        const logo = showLogo ? `
            <div class="nav-bar-title">
                <span class="logo-icon">🏦</span>
                <span>${Helpers.escapeHtml(title)}</span>
            </div>
        ` : `<h1 class="nav-bar-title">${Helpers.escapeHtml(title)}</h1>`;

        return `
            <nav class="nav-bar">
                <div class="flex items-center gap-md">
                    ${backButton}
                    ${!showBack ? logo : ''}
                </div>
                <div class="nav-bar-actions">
                    ${rightContent}
                </div>
            </nav>
        `;
    },

    /**
     * Bind navigation bar events
     * @param {HTMLElement} container - Container element
     * @param {object} handlers - Event handlers
     */
    bindEvents(container, handlers = {}) {
        const backBtn = container.querySelector('#nav-back-btn');
        if (backBtn && handlers.onBack) {
            backBtn.addEventListener('click', handlers.onBack);
        }
    },

    /**
     * Create parent dashboard navigation
     * @param {number} pendingCount - Number of pending requests
     * @returns {string} HTML string
     */
    parentDashboard(pendingCount = 0) {
        const badge = pendingCount > 0 ? `<span class="badge">${pendingCount}</span>` : '';

        return this.create({
            title: 'EasyKidsBank',
            showLogo: true,
            rightContent: `
                <button class="btn btn-ghost btn-icon" id="nav-requests-btn" aria-label="Pending Requests">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                    ${badge}
                </button>
                <button class="btn btn-ghost btn-icon" id="nav-settings-btn" aria-label="Settings">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                    </svg>
                </button>
            `
        });
    },

    /**
     * Create kid dashboard navigation
     * @param {object} kid - Current kid object
     * @returns {string} HTML string
     */
    kidDashboard(kid) {
        return this.create({
            title: `${kid?.name || 'My Bank'} ${kid?.avatarEmoji || ''}`,
            showLogo: false,
            rightContent: `
                <button class="btn btn-ghost btn-icon" id="nav-profile-btn" aria-label="My Profile">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                </button>
                <button class="btn btn-ghost btn-icon" id="nav-exit-btn" aria-label="Exit Kid Mode">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                </button>
            `
        });
    },

    /**
     * Create simple back navigation
     * @param {string} title - Page title
     * @returns {string} HTML string
     */
    simple(title) {
        return this.create({
            title,
            showBack: true
        });
    }
};

// Make available globally
window.NavBar = NavBar;
