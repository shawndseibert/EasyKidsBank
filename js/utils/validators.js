/* ========================================
   EasyKidsBank - Validators
   ======================================== */

const Validators = {
    /**
     * Validate email address
     * @param {string} email - Email to validate
     * @returns {object} { valid: boolean, error: string|null }
     */
    email(email) {
        if (!email || !email.trim()) {
            return { valid: false, error: 'Email is required' };
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return { valid: false, error: 'Please enter a valid email address' };
        }

        return { valid: true, error: null };
    },

    /**
     * Validate password
     * @param {string} password - Password to validate
     * @returns {object} { valid: boolean, error: string|null }
     */
    password(password) {
        if (!password) {
            return { valid: false, error: 'Password is required' };
        }

        if (password.length < 6) {
            return { valid: false, error: 'Password must be at least 6 characters' };
        }

        return { valid: true, error: null };
    },

    /**
     * Validate password confirmation
     * @param {string} password - Original password
     * @param {string} confirm - Confirmation password
     * @returns {object} { valid: boolean, error: string|null }
     */
    passwordConfirm(password, confirm) {
        if (!confirm) {
            return { valid: false, error: 'Please confirm your password' };
        }

        if (password !== confirm) {
            return { valid: false, error: 'Passwords do not match' };
        }

        return { valid: true, error: null };
    },

    /**
     * Validate kid name
     * @param {string} name - Name to validate
     * @returns {object} { valid: boolean, error: string|null }
     */
    kidName(name) {
        if (!name || !name.trim()) {
            return { valid: false, error: 'Name is required' };
        }

        const trimmedName = name.trim();

        if (trimmedName.length < 2) {
            return { valid: false, error: 'Name must be at least 2 characters' };
        }

        if (trimmedName.length > 30) {
            return { valid: false, error: 'Name must be less than 30 characters' };
        }

        // Only allow letters, spaces, hyphens, and apostrophes
        const nameRegex = /^[a-zA-Z\s'-]+$/;
        if (!nameRegex.test(trimmedName)) {
            return { valid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
        }

        return { valid: true, error: null };
    },

    /**
     * Validate PIN
     * @param {string} pin - PIN to validate
     * @param {number} length - Required PIN length (default 4)
     * @returns {object} { valid: boolean, error: string|null }
     */
    pin(pin, length = 4) {
        if (!pin) {
            return { valid: false, error: 'PIN is required' };
        }

        if (pin.length !== length) {
            return { valid: false, error: `PIN must be exactly ${length} digits` };
        }

        if (!/^\d+$/.test(pin)) {
            return { valid: false, error: 'PIN must contain only numbers' };
        }

        // Check for simple patterns
        const simplePatterns = ['1234', '0000', '1111', '2222', '3333', '4444', '5555', '6666', '7777', '8888', '9999', '4321'];
        if (simplePatterns.includes(pin)) {
            return { valid: false, error: 'Please choose a less common PIN' };
        }

        return { valid: true, error: null };
    },

    /**
     * Validate amount (in dollars)
     * @param {string|number} amount - Amount to validate
     * @param {number} min - Minimum amount (default 0.01)
     * @param {number} max - Maximum amount (default 10000)
     * @returns {object} { valid: boolean, error: string|null, cents: number }
     */
    amount(amount, min = 0.01, max = 10000) {
        // Convert to number if string
        const numAmount = typeof amount === 'string'
            ? parseFloat(amount.replace(/[^0-9.]/g, ''))
            : amount;

        if (isNaN(numAmount) || numAmount === null || numAmount === undefined) {
            return { valid: false, error: 'Please enter a valid amount', cents: 0 };
        }

        if (numAmount < min) {
            return { valid: false, error: `Amount must be at least $${min.toFixed(2)}`, cents: 0 };
        }

        if (numAmount > max) {
            return { valid: false, error: `Amount cannot exceed $${max.toFixed(2)}`, cents: 0 };
        }

        // Check for more than 2 decimal places
        const decimalPart = amount.toString().split('.')[1];
        if (decimalPart && decimalPart.length > 2) {
            return { valid: false, error: 'Amount can only have up to 2 decimal places', cents: 0 };
        }

        const cents = Math.round(numAmount * 100);
        return { valid: true, error: null, cents };
    },

    /**
     * Validate description/note
     * @param {string} description - Description to validate
     * @param {boolean} required - Whether description is required
     * @param {number} maxLength - Maximum length
     * @returns {object} { valid: boolean, error: string|null }
     */
    description(description, required = false, maxLength = 200) {
        if (!description || !description.trim()) {
            if (required) {
                return { valid: false, error: 'Description is required' };
            }
            return { valid: true, error: null };
        }

        const trimmedDesc = description.trim();

        if (trimmedDesc.length > maxLength) {
            return { valid: false, error: `Description must be less than ${maxLength} characters` };
        }

        return { valid: true, error: null };
    },

    /**
     * Validate display name
     * @param {string} name - Display name to validate
     * @returns {object} { valid: boolean, error: string|null }
     */
    displayName(name) {
        if (!name || !name.trim()) {
            return { valid: false, error: 'Display name is required' };
        }

        const trimmedName = name.trim();

        if (trimmedName.length < 2) {
            return { valid: false, error: 'Display name must be at least 2 characters' };
        }

        if (trimmedName.length > 50) {
            return { valid: false, error: 'Display name must be less than 50 characters' };
        }

        return { valid: true, error: null };
    },

    /**
     * Validate color hex code
     * @param {string} color - Color to validate
     * @returns {object} { valid: boolean, error: string|null }
     */
    color(color) {
        if (!color) {
            return { valid: false, error: 'Color is required' };
        }

        const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        if (!hexRegex.test(color)) {
            return { valid: false, error: 'Please enter a valid hex color (e.g., #FF5733)' };
        }

        return { valid: true, error: null };
    },

    /**
     * Validate theme name
     * @param {string} name - Theme name to validate
     * @returns {object} { valid: boolean, error: string|null }
     */
    themeName(name) {
        if (!name || !name.trim()) {
            return { valid: false, error: 'Theme name is required' };
        }

        const trimmedName = name.trim();

        if (trimmedName.length < 2) {
            return { valid: false, error: 'Theme name must be at least 2 characters' };
        }

        if (trimmedName.length > 30) {
            return { valid: false, error: 'Theme name must be less than 30 characters' };
        }

        return { valid: true, error: null };
    },

    /**
     * Validate entire form
     * @param {object} fields - Object with field names and values
     * @param {object} rules - Object with field names and validation functions
     * @returns {object} { valid: boolean, errors: object }
     */
    form(fields, rules) {
        const errors = {};
        let valid = true;

        for (const [fieldName, value] of Object.entries(fields)) {
            if (rules[fieldName]) {
                const result = rules[fieldName](value);
                if (!result.valid) {
                    valid = false;
                    errors[fieldName] = result.error;
                }
            }
        }

        return { valid, errors };
    }
};

// Make available globally
window.Validators = Validators;
