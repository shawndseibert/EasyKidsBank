/* ========================================
   EasyKidsBank - Parent Login View
   ======================================== */

const ParentLoginView = {
    container: null,
    mode: 'login', // 'login' or 'signup'

    /**
     * Mount the view
     * @param {HTMLElement} container - Container element
     */
    mount(container) {
        this.container = container;
        this.mode = 'login';
        this.render();
        this.bindEvents();
    },

    /**
     * Unmount the view
     */
    unmount() {
        this.container = null;
    },

    /**
     * Render the view
     */
    render() {
        const isLogin = this.mode === 'login';

        this.container.innerHTML = `
            <div class="view parent-login-view">
                <!-- Back Button -->
                <button class="btn btn-ghost back-btn" id="btn-back">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M19 12H5"></path>
                        <path d="M12 19l-7-7 7-7"></path>
                    </svg>
                    Back
                </button>

                <div class="login-content animate slideUp">
                    <!-- Header -->
                    <div class="login-header">
                        <span class="login-icon">👨‍👩‍👧‍👦</span>
                        <h1 class="login-title">${isLogin ? 'Parent Login' : 'Create Account'}</h1>
                        <p class="login-subtitle">${isLogin ? 'Sign in to manage your kids\' accounts' : 'Create your parent account'}</p>
                    </div>

                    <!-- Form -->
                    <form class="login-form" id="login-form">
                        ${!isLogin ? `
                            <div class="input-group">
                                <label class="input-label" for="display-name">Your Name</label>
                                <input type="text" class="input" id="display-name" placeholder="Enter your name" autocomplete="name">
                                <span class="input-error-text" id="display-name-error"></span>
                            </div>
                        ` : ''}

                        <div class="input-group">
                            <label class="input-label" for="email">Email</label>
                            <input type="email" class="input" id="email" placeholder="Enter your email" autocomplete="email" required>
                            <span class="input-error-text" id="email-error"></span>
                        </div>

                        <div class="input-group">
                            <label class="input-label" for="password">Password</label>
                            <input type="password" class="input" id="password" placeholder="${isLogin ? 'Enter your password' : 'Create a password'}" autocomplete="${isLogin ? 'current-password' : 'new-password'}" required>
                            <span class="input-error-text" id="password-error"></span>
                        </div>

                        ${!isLogin ? `
                            <div class="input-group">
                                <label class="input-label" for="password-confirm">Confirm Password</label>
                                <input type="password" class="input" id="password-confirm" placeholder="Confirm your password" autocomplete="new-password" required>
                                <span class="input-error-text" id="password-confirm-error"></span>
                            </div>
                        ` : ''}

                        <button type="submit" class="btn btn-primary btn-lg btn-block" id="btn-submit">
                            ${isLogin ? 'Sign In' : 'Create Account'}
                        </button>

                        ${isLogin ? `
                            <button type="button" class="btn btn-ghost btn-sm" id="btn-forgot-password">
                                Forgot Password?
                            </button>
                        ` : ''}
                    </form>

                    <!-- Divider -->
                    <div class="divider-text">or continue with</div>

                    <!-- Google Sign In -->
                    <button class="btn btn-secondary btn-lg btn-block google-btn" id="btn-google">
                        <svg width="20" height="20" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Continue with Google
                    </button>

                    <!-- Toggle Mode -->
                    <p class="login-toggle">
                        ${isLogin ? "Don't have an account?" : 'Already have an account?'}
                        <button type="button" class="btn btn-ghost btn-sm" id="btn-toggle-mode">
                            ${isLogin ? 'Sign Up' : 'Sign In'}
                        </button>
                    </p>
                </div>
            </div>
        `;
    },

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Back button
        this.container.querySelector('#btn-back').addEventListener('click', () => {
            Router.navigate('landing');
        });

        // Form submission
        this.container.querySelector('#login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // Google sign in
        this.container.querySelector('#btn-google').addEventListener('click', () => {
            this.handleGoogleSignIn();
        });

        // Toggle mode
        this.container.querySelector('#btn-toggle-mode').addEventListener('click', () => {
            this.mode = this.mode === 'login' ? 'signup' : 'login';
            this.render();
            this.bindEvents();
        });

        // Forgot password
        const forgotBtn = this.container.querySelector('#btn-forgot-password');
        if (forgotBtn) {
            forgotBtn.addEventListener('click', () => {
                this.handleForgotPassword();
            });
        }

        // Clear errors on input
        this.container.querySelectorAll('.input').forEach(input => {
            input.addEventListener('input', () => {
                input.classList.remove('input-error');
                const errorEl = this.container.querySelector(`#${input.id}-error`);
                if (errorEl) errorEl.textContent = '';
            });
        });
    },

    /**
     * Handle form submission
     */
    async handleSubmit() {
        const email = this.container.querySelector('#email').value.trim();
        const password = this.container.querySelector('#password').value;
        const isLogin = this.mode === 'login';

        // Validate
        const emailValidation = Validators.email(email);
        if (!emailValidation.valid) {
            this.showError('email', emailValidation.error);
            return;
        }

        const passwordValidation = Validators.password(password);
        if (!passwordValidation.valid) {
            this.showError('password', passwordValidation.error);
            return;
        }

        if (!isLogin) {
            const displayName = this.container.querySelector('#display-name').value.trim();
            const passwordConfirm = this.container.querySelector('#password-confirm').value;

            const nameValidation = Validators.displayName(displayName);
            if (!nameValidation.valid) {
                this.showError('display-name', nameValidation.error);
                return;
            }

            const confirmValidation = Validators.passwordConfirm(password, passwordConfirm);
            if (!confirmValidation.valid) {
                this.showError('password-confirm', confirmValidation.error);
                return;
            }

            // Sign up
            const result = await AuthService.signUp(email, password, displayName);
            if (result.success) {
                Toast.success('Account created successfully!');
                Router.navigate('parent-dashboard');
            } else {
                Toast.error(result.error);
            }
        } else {
            // Sign in
            const result = await AuthService.signIn(email, password);
            if (result.success) {
                Toast.success('Welcome back!');
                Router.navigate('parent-dashboard');
            } else {
                Toast.error(result.error);
            }
        }
    },

    /**
     * Handle Google sign in
     */
    async handleGoogleSignIn() {
        const result = await AuthService.signInWithGoogle();
        if (result.success) {
            Toast.success('Welcome!');
            Router.navigate('parent-dashboard');
        } else {
            if (result.error !== 'Sign-in was cancelled.') {
                Toast.error(result.error);
            }
        }
    },

    /**
     * Handle forgot password
     */
    async handleForgotPassword() {
        const email = await Modal.prompt({
            title: 'Reset Password',
            message: 'Enter your email address and we\'ll send you a password reset link.',
            placeholder: 'your@email.com',
            inputType: 'email',
            confirmText: 'Send Reset Link'
        });

        if (email) {
            const validation = Validators.email(email);
            if (!validation.valid) {
                Toast.error(validation.error);
                return;
            }

            const result = await AuthService.resetPassword(email);
            if (result.success) {
                Toast.success('Password reset email sent! Check your inbox.');
            } else {
                Toast.error(result.error);
            }
        }
    },

    /**
     * Show field error
     * @param {string} fieldId - Field ID
     * @param {string} error - Error message
     */
    showError(fieldId, error) {
        const input = this.container.querySelector(`#${fieldId}`);
        const errorEl = this.container.querySelector(`#${fieldId}-error`);

        if (input) input.classList.add('input-error');
        if (errorEl) errorEl.textContent = error;
    }
};

// Add parent login view styles
const parentLoginStyles = document.createElement('style');
parentLoginStyles.textContent = `
    .parent-login-view {
        padding: var(--space-lg);
    }

    .back-btn {
        margin-bottom: var(--space-lg);
    }

    .login-content {
        max-width: 360px;
        margin: 0 auto;
    }

    .login-header {
        text-align: center;
        margin-bottom: var(--space-xl);
    }

    .login-icon {
        font-size: 3rem;
        display: block;
        margin-bottom: var(--space-sm);
    }

    .login-title {
        font-size: var(--font-size-xl);
        font-weight: var(--font-weight-bold);
        color: var(--color-text);
        margin-bottom: var(--space-xs);
    }

    .login-subtitle {
        font-size: var(--font-size-sm);
        color: var(--color-text-secondary);
    }

    .login-form {
        display: flex;
        flex-direction: column;
        gap: var(--space-md);
        margin-bottom: var(--space-lg);
    }

    .login-form .btn-ghost {
        align-self: center;
    }

    .google-btn {
        margin-bottom: var(--space-lg);
    }

    .google-btn svg {
        flex-shrink: 0;
    }

    .login-toggle {
        text-align: center;
        font-size: var(--font-size-sm);
        color: var(--color-text-secondary);
    }

    .login-toggle .btn {
        color: var(--color-primary);
        font-weight: var(--font-weight-semibold);
    }
`;
document.head.appendChild(parentLoginStyles);

// Make available globally
window.ParentLoginView = ParentLoginView;
