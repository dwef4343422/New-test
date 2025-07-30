// Authentication module for Pharmacovigilance Iraq Platform

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.init();
    }

    /**
     * Initializes the authentication manager by checking the current
     * session status and setting up UI event listeners.
     */
    async init() {
        await this.checkAuthStatus();
        this.setupAuthUI();
    }

    /**
     * Checks the user's current authentication status with the backend.
     * This uses the cleaner fetch logic from the "fix" file.
     */
    async checkAuthStatus() {
        try {
            const res = await fetch('/auth/me', { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                this.currentUser = data.user;
                this.isAuthenticated = true;
            } else {
                this.currentUser = null;
                this.isAuthenticated = false;
            }
        } catch (err) {
            console.warn("Session check failed, user is not authenticated.", err);
            this.currentUser = null;
            this.isAuthenticated = false;
        } finally {
            this.updateAuthUI();
        }
    }

    /**
     * Attempts to log in a user with the provided credentials.
     * @param {string} username - The user's username.
     * @param {string} password - The user's password.
     * @param {boolean} remember - Whether to create a persistent session.
     * @returns {Promise<object>} An object with success status and a message.
     */
    async login(username, password, remember = false) {
        try {
            const res = await fetch('/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ username, password, remember })
            });

            const data = await res.json();
            if (res.ok) {
                this.currentUser = data.user;
                this.isAuthenticated = true;
                this.updateAuthUI();
                return { success: true, message: data.message };
            } else {
                return { success: false, message: data.message || 'فشل تسجيل الدخول' };
            }
        } catch (err) {
            console.error('Login error:', err);
            return { success: false, message: 'فشل الاتصال بالخادم' };
        }
    }

    /**
     * Logs the current user out.
     * @returns {Promise<object>} An object with success status and a message.
     */
    async logout() {
        try {
            const res = await fetch('/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });

            const data = await res.json();
            if (res.ok) {
                this.currentUser = null;
                this.isAuthenticated = false;
                this.updateAuthUI();
                return { success: true, message: data.message };
            } else {
                return { success: false, message: data.message || 'فشل تسجيل الخروج' };
            }
        } catch (err) {
            console.error('Logout error:', err);
            return { success: false, message: 'فشل الاتصال بالخادم' };
        }
    }

    /**
     * Changes the current user's password.
     * @param {string} currentPassword - The user's current password.
     * @param {string} newPassword - The desired new password.
     * @returns {Promise<object>} An object with success status and a message.
     */
    async changePassword(currentPassword, newPassword) {
        try {
            const response = await fetch('/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    current_password: currentPassword,
                    new_password: newPassword
                })
            });

            const result = await response.json();
            return {
                success: response.ok,
                message: result.message
            };
        } catch (error) {
            console.error('Change password error:', error);
            return { success: false, message: 'حدث خطأ في الاتصال' };
        }
    }

    /**
     * Checks if the current user has at least a specific role.
     * @param {string} role - The role to check for ('viewer', 'reviewer', 'admin').
     * @returns {boolean} True if the user has the required role or higher.
     */
    hasRole(role) {
        if (!this.isAuthenticated || !this.currentUser) {
            return false;
        }
        const roles = { 'viewer': 1, 'reviewer': 2, 'admin': 3 };
        const userLevel = roles[this.currentUser.role] || 0;
        const requiredLevel = roles[role] || 0;
        return userLevel >= requiredLevel;
    }

    /**
     * Redirects to the login page if the user is not authenticated.
     */
    requireAuth() {
        if (!this.isAuthenticated) {
            window.location.href = '/login';
            return false;
        }
        return true;
    }

    /**
     * Checks for a specific role and shows an error if permissions are insufficient.
     */
    requireRole(role) {
        if (!this.requireAuth()) return false;
        if (!this.hasRole(role)) {
            this.showError('ليس لديك صلاحية للوصول إلى هذه الصفحة');
            return false;
        }
        return true;
    }

    /**
     * Sets up event listeners for UI elements like logout buttons.
     */
    setupAuthUI() {
        document.querySelectorAll('.logout-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                const result = await this.logout();
                if (result.success) {
                    // Redirect to home page or login page after logout
                    window.location.href = '/';
                } else {
                    this.showError(result.message);
                }
            });
        });
    }

    /**
     * Main function to update all authentication-related UI elements.
     */
    updateAuthUI() {
        // Update user info displays
        const userNameElements = document.querySelectorAll('.user-name');
        const userRoleElements = document.querySelectorAll('.user-role');
        
        userNameElements.forEach(el => {
            el.textContent = this.currentUser ? this.currentUser.full_name || this.currentUser.username : '';
        });

        userRoleElements.forEach(el => {
            el.textContent = this.currentUser ? this.getRoleDisplayName(this.currentUser.role) : '';
        });

        this.updateNavigation();
        this.updateRoleBasedUI();
    }

    /**
     * Shows or hides navigation links based on authentication status.
     */
    updateNavigation() {
        document.querySelectorAll('.auth-required').forEach(el => {
            el.style.display = this.isAuthenticated ? 'block' : 'none';
        });

        document.querySelectorAll('.guest-only').forEach(el => {
            el.style.display = this.isAuthenticated ? 'none' : 'block';
        });
    }

    /**
     * Shows or hides elements based on the required role specified
     * in the `data-role` attribute.
     */
    updateRoleBasedUI() {
        document.querySelectorAll('[data-role]').forEach(element => {
            const requiredRole = element.getAttribute('data-role');
            if (this.hasRole(requiredRole)) {
                element.style.display = '';
                element.classList.remove('hidden');
            } else {
                element.style.display = 'none';
                element.classList.add('hidden');
            }
        });
    }

    /**
     * Gets the display name for a given role key.
     * @param {string} role - The role key (e.g., 'admin').
     * @returns {string} The display name (e.g., 'مدير').
     */
    getRoleDisplayName(role) {
        const roleNames = { 'admin': 'مدير', 'reviewer': 'مراجع', 'viewer': 'مشاهد' };
        return roleNames[role] || role;
    }

    /**
     * Displays a styled error message on the screen.
     * @param {string} message - The error message to display.
     */
    showError(message) {
        this.showAlert(message, 'error');
    }

    /**
     * Displays a styled success message on the screen.
     * @param {string} message - The success message to display.
     */
    showSuccess(message) {
        this.showAlert(message, 'success');
    }

    /**
     * Helper function to create and show styled alerts.
     * @param {string} message - The message to display.
     * @param {string} type - 'success' or 'error'.
     */
    showAlert(message, type = 'error') {
        let alertContainer = document.getElementById('auth-alert-container');
        if (!alertContainer) {
            alertContainer = document.createElement('div');
            alertContainer.id = 'auth-alert-container';
            alertContainer.style.cssText = `position: fixed; top: 20px; right: 20px; z-index: 10000; max-width: 400px;`;
            document.body.appendChild(alertContainer);
        }

        const alert = document.createElement('div');
        const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle';
        const alertClass = type === 'success' ? 'alert-success' : 'alert-error';
        
        alert.className = `alert ${alertClass}`;
        alert.innerHTML = `<i class="fas ${icon}"></i> ${message}`;

        alertContainer.appendChild(alert);

        setTimeout(() => {
            alert.style.opacity = '0';
            setTimeout(() => alert.remove(), 300);
        }, 5000);
    }
}

// Create a global instance of the AuthManager for easy access across the application.
const authManager = new AuthManager();
window.authManager = authManager;

