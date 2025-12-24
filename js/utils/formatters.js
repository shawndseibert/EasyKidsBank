/* ========================================
   EasyKidsBank - Formatters
   ======================================== */

const Formatters = {
    /**
     * Format cents to currency string
     * @param {number} cents - Amount in cents
     * @param {boolean} showSign - Whether to show + for positive amounts
     * @returns {string} Formatted currency string
     */
    currency(cents, showSign = false) {
        const dollars = cents / 100;
        const formatted = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(Math.abs(dollars));

        if (showSign && cents > 0) {
            return '+' + formatted;
        } else if (cents < 0) {
            return '-' + formatted;
        }
        return formatted;
    },

    /**
     * Format just the dollar amount without currency symbol
     * @param {number} cents - Amount in cents
     * @returns {string} Formatted number string
     */
    amount(cents) {
        const dollars = cents / 100;
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(dollars);
    },

    /**
     * Parse currency input string to cents
     * @param {string} value - Currency string (e.g., "$10.50" or "10.50")
     * @returns {number} Amount in cents
     */
    parseCurrency(value) {
        // Remove all non-numeric characters except decimal point
        const cleaned = value.replace(/[^0-9.]/g, '');
        const dollars = parseFloat(cleaned) || 0;
        return Math.round(dollars * 100);
    },

    /**
     * Format date to relative time (e.g., "2 hours ago")
     * @param {Date|number|object} date - Date object, timestamp, or Firestore Timestamp
     * @returns {string} Relative time string
     */
    relativeTime(date) {
        // Handle Firestore Timestamp
        if (date && typeof date.toDate === 'function') {
            date = date.toDate();
        } else if (typeof date === 'number') {
            date = new Date(date);
        } else if (!(date instanceof Date)) {
            return 'Unknown';
        }

        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) {
            return 'Just now';
        }

        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) {
            return diffInMinutes === 1 ? '1 minute ago' : `${diffInMinutes} minutes ago`;
        }

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) {
            return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`;
        }

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) {
            return diffInDays === 1 ? 'Yesterday' : `${diffInDays} days ago`;
        }

        const diffInWeeks = Math.floor(diffInDays / 7);
        if (diffInWeeks < 4) {
            return diffInWeeks === 1 ? '1 week ago' : `${diffInWeeks} weeks ago`;
        }

        const diffInMonths = Math.floor(diffInDays / 30);
        if (diffInMonths < 12) {
            return diffInMonths === 1 ? '1 month ago' : `${diffInMonths} months ago`;
        }

        const diffInYears = Math.floor(diffInDays / 365);
        return diffInYears === 1 ? '1 year ago' : `${diffInYears} years ago`;
    },

    /**
     * Format date to short date string (e.g., "Dec 24")
     * @param {Date|number|object} date - Date object, timestamp, or Firestore Timestamp
     * @returns {string} Short date string
     */
    shortDate(date) {
        // Handle Firestore Timestamp
        if (date && typeof date.toDate === 'function') {
            date = date.toDate();
        } else if (typeof date === 'number') {
            date = new Date(date);
        } else if (!(date instanceof Date)) {
            return 'Unknown';
        }

        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();

        if (isToday) {
            return date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        }

        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        }

        // Same year - show month and day
        if (date.getFullYear() === now.getFullYear()) {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
        }

        // Different year - show full date
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    },

    /**
     * Format date to full date and time
     * @param {Date|number|object} date - Date object, timestamp, or Firestore Timestamp
     * @returns {string} Full date and time string
     */
    fullDateTime(date) {
        // Handle Firestore Timestamp
        if (date && typeof date.toDate === 'function') {
            date = date.toDate();
        } else if (typeof date === 'number') {
            date = new Date(date);
        } else if (!(date instanceof Date)) {
            return 'Unknown';
        }

        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    },

    /**
     * Format transaction type to display string
     * @param {string} type - Transaction type
     * @returns {string} Display string
     */
    transactionType(type) {
        const types = {
            deposit: 'Deposit',
            withdrawal: 'Withdrawal',
            penalty: 'Penalty',
            reward: 'Reward',
            request: 'Request'
        };
        return types[type] || type;
    },

    /**
     * Get transaction icon based on type
     * @param {string} type - Transaction type
     * @returns {string} Emoji icon
     */
    transactionIcon(type) {
        const icons = {
            deposit: '💰',
            withdrawal: '💸',
            penalty: '⚠️',
            reward: '⭐',
            request: '📝'
        };
        return icons[type] || '💵';
    },

    /**
     * Format kid name with possessive
     * @param {string} name - Kid's name
     * @returns {string} Possessive form
     */
    possessive(name) {
        if (!name) return '';
        return name.endsWith('s') ? `${name}'` : `${name}'s`;
    },

    /**
     * Truncate text with ellipsis
     * @param {string} text - Text to truncate
     * @param {number} maxLength - Maximum length
     * @returns {string} Truncated text
     */
    truncate(text, maxLength = 50) {
        if (!text || text.length <= maxLength) return text;
        return text.slice(0, maxLength - 3) + '...';
    },

    /**
     * Format number with commas
     * @param {number} num - Number to format
     * @returns {string} Formatted number
     */
    number(num) {
        return new Intl.NumberFormat('en-US').format(num);
    },

    /**
     * Capitalize first letter
     * @param {string} str - String to capitalize
     * @returns {string} Capitalized string
     */
    capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },

    /**
     * Format PIN display (dots for entered digits)
     * @param {number} length - Number of digits entered
     * @param {number} total - Total PIN length
     * @returns {string} Display string
     */
    pinDisplay(length, total = 4) {
        return '●'.repeat(length) + '○'.repeat(total - length);
    }
};

// Make available globally
window.Formatters = Formatters;
