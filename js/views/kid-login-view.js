/* ========================================
   EasyKidsBank - Kid Login View
   ======================================== */

const KidLoginView = {
    container: null,
    selectedKid: null,
    pin: '',

    /**
     * Mount the view
     * @param {HTMLElement} container - Container element
     */
    mount(container, params) {
        this.container = container;
        this.selectedKid = null;
        this.pin = '';
        this.unsubscribers = [];

        const kidId = params && params[0];

        if (kidId) {
            const kids = Store.getState('kids');
            if (kids.length > 0) {
                this.selectedKid = kids.find(k => k.id === kidId);
                this.render();
                this.bindEvents();
            } else {
                // Show a loading spinner
                this.container.innerHTML = '<div class="loading-spinner" style="margin: auto;"></div>';
                const unsub = Store.subscribe('kids', (newKids) => {
                    if (newKids.length > 0) {
                        this.selectedKid = newKids.find(k => k.id === kidId);
                        this.render();
                        this.bindEvents();
                        unsub();
                    }
                });
                this.unsubscribers.push(unsub);
            }
        } else {
            this.render();
            this.bindEvents();
        }
    },

    /**
     * Unmount the view
     */
    unmount() {
        this.unsubscribers.forEach(unsub => unsub());
        this.unsubscribers = [];
        this.container = null;
        this.selectedKid = null;
        this.pin = '';
    },

    /**
     * Render the view
     */
    render() {
        const kids = Store.getState('kids');

        if (this.selectedKid) {
            this.renderPinEntry();
        } else {
            this.renderKidSelection(kids);
        }
    },

    /**
     * Render kid selection screen
     * @param {array} kids - Array of kid objects
     */
    renderKidSelection(kids) {
        this.container.innerHTML = `
            <div class="view kid-login-view">
                <!-- Back Button -->
                <button class="btn btn-ghost back-btn" id="btn-back">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M19 12H5"></path>
                        <path d="M12 19l-7-7 7-7"></path>
                    </svg>
                    Back
                </button>

                <div class="kid-login-content animate slideUp">
                    <div class="kid-login-header">
                        <span class="kid-login-icon">👋</span>
                        <h1 class="kid-login-title">Who's using the bank?</h1>
                        <p class="kid-login-subtitle">Tap your name to log in</p>
                    </div>

                    <div class="kid-selection-container">
                        ${KidCard.selectionGrid(kids)}
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Render PIN entry screen
     */
    renderPinEntry() {
        const pinDots = this.pin.length;

        this.container.innerHTML = `
            <div class="view kid-login-view">
                <!-- Back Button -->
                <button class="btn btn-ghost back-btn" id="btn-back-pin">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M19 12H5"></path>
                        <path d="M12 19l-7-7 7-7"></path>
                    </svg>
                    Back
                </button>

                <div class="pin-entry-content animate slideUp">
                    <div class="pin-entry-header">
                        <div class="pin-entry-avatar">${this.selectedKid.avatarEmoji || '👤'}</div>
                        <h1 class="pin-entry-title">Hi, ${Helpers.escapeHtml(this.selectedKid.name)}!</h1>
                        <p class="pin-entry-subtitle">Enter your PIN</p>
                    </div>

                    <!-- PIN Display -->
                    <div class="pin-display" id="pin-display">
                        <div class="pin-dot ${pinDots >= 1 ? 'filled' : ''}"></div>
                        <div class="pin-dot ${pinDots >= 2 ? 'filled' : ''}"></div>
                        <div class="pin-dot ${pinDots >= 3 ? 'filled' : ''}"></div>
                        <div class="pin-dot ${pinDots >= 4 ? 'filled' : ''}"></div>
                    </div>

                    <!-- PIN Pad -->
                    <div class="pin-pad" id="pin-pad">
                        <button class="pin-key" data-key="1">1</button>
                        <button class="pin-key" data-key="2">2</button>
                        <button class="pin-key" data-key="3">3</button>
                        <button class="pin-key" data-key="4">4</button>
                        <button class="pin-key" data-key="5">5</button>
                        <button class="pin-key" data-key="6">6</button>
                        <button class="pin-key" data-key="7">7</button>
                        <button class="pin-key" data-key="8">8</button>
                        <button class="pin-key" data-key="9">9</button>
                        <button class="pin-key action" data-key="clear">C</button>
                        <button class="pin-key" data-key="0">0</button>
                        <button class="pin-key action backspace" data-key="backspace">←</button>
                    </div>
                </div>
            </div>
        `;

        this.bindPinEvents();
    },

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Back button
        const backBtn = this.container.querySelector('#btn-back');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                Router.navigate('landing');
            });
        }

        // Kid selection
        KidCard.bindEvents(this.container, (kidId) => {
            const kids = Store.getState('kids');
            this.selectedKid = kids.find(k => k.id === kidId);
            if (this.selectedKid) {
                this.render();
            }
        });
    },

    /**
     * Bind PIN pad events
     */
    bindPinEvents() {
        // Back button (from PIN screen)
        const backBtn = this.container.querySelector('#btn-back-pin');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.selectedKid = null;
                this.pin = '';
                this.render();
                this.bindEvents();
            });
        }

        // PIN pad keys
        const pinPad = this.container.querySelector('#pin-pad');
        if (pinPad) {
            pinPad.addEventListener('click', (e) => {
                const key = e.target.closest('.pin-key');
                if (!key) return;

                const value = key.dataset.key;
                this.handlePinInput(value);
            });
        }

        // Keyboard support
        document.addEventListener('keydown', this.handleKeydown.bind(this));
    },

    /**
     * Handle keyboard input
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleKeydown(e) {
        if (!this.selectedKid) return;

        if (e.key >= '0' && e.key <= '9') {
            this.handlePinInput(e.key);
        } else if (e.key === 'Backspace') {
            this.handlePinInput('backspace');
        } else if (e.key === 'Escape') {
            this.handlePinInput('clear');
        }
    },

    /**
     * Handle PIN input
     * @param {string} value - Key pressed
     */
    async handlePinInput(value) {
        if (value === 'clear') {
            this.pin = '';
        } else if (value === 'backspace') {
            this.pin = this.pin.slice(0, -1);
        } else if (this.pin.length < 4) {
            this.pin += value;
        }

        // Update display
        this.updatePinDisplay();

        // Check if PIN is complete
        if (this.pin.length === 4) {
            await this.verifyPin();
        }
    },

    /**
     * Update PIN display
     */
    updatePinDisplay() {
        const dots = this.container.querySelectorAll('.pin-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('filled', index < this.pin.length);
            dot.classList.remove('error');
        });
    },

    /**
     * Verify the entered PIN
     */
    async verifyPin() {
        const result = await AuthService.verifyKidPin(this.selectedKid.id, this.pin);

        if (result.success) {
            // Success! Enter kid mode
            Toast.success(`Welcome, ${this.selectedKid.name}!`);
            AuthService.enterKidMode(result.kid);
            Router.navigate('kid-dashboard');
        } else {
            // Wrong PIN
            this.showPinError();
            this.pin = '';
        }
    },

    /**
     * Show PIN error animation
     */
    showPinError() {
        const dots = this.container.querySelectorAll('.pin-dot');
        dots.forEach(dot => {
            dot.classList.add('error');
        });

        Toast.error('Wrong PIN. Try again!');

        // Reset after animation
        setTimeout(() => {
            this.updatePinDisplay();
        }, 500);
    }
};

// Add kid login view styles
const kidLoginStyles = document.createElement('style');
kidLoginStyles.textContent = `
    .kid-login-view {
        padding: var(--space-lg);
    }

    .kid-login-content,
    .pin-entry-content {
        max-width: 400px;
        margin: 0 auto;
        text-align: center;
    }

    .kid-login-header,
    .pin-entry-header {
        margin-bottom: var(--space-xl);
    }

    .kid-login-icon {
        font-size: 3rem;
        display: block;
        margin-bottom: var(--space-sm);
    }

    .kid-login-title,
    .pin-entry-title {
        font-size: var(--font-size-xl);
        font-weight: var(--font-weight-bold);
        color: var(--color-text);
        margin-bottom: var(--space-xs);
    }

    .kid-login-subtitle,
    .pin-entry-subtitle {
        font-size: var(--font-size-sm);
        color: var(--color-text-secondary);
    }

    .kid-selection-container {
        margin-top: var(--space-lg);
    }

    .pin-entry-avatar {
        width: 80px;
        height: 80px;
        border-radius: var(--radius-full);
        background-color: var(--color-primary-light);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2.5rem;
        margin: 0 auto var(--space-md);
    }
`;
document.head.appendChild(kidLoginStyles);

// Make available globally
window.KidLoginView = KidLoginView;
