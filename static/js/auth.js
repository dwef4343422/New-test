// Authentication module for Pharmacovigilance Iraq Platform

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.init();
    }

    async init() {
        await this.checkAuthStatus();
        this.setupAuthUI();
    }

    async checkAuthStatus() {
        try {
            const response = await fetch('/auth/me', {
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                this.currentUser = data.user;
                this.isAuthenticated = true;
                this.updateAuthUI();
                return true;
            } else {
                this.currentUser = null;
                this.isAuthenticated = false;
                this.updateAuthUI();
                return false;
            }
        } catch (error) {
            console.error('Auth check error:', error);
            this.currentUser = null;
            this.isAuthenticated = false;
            this.updateAuthUI();
            return false;
        }
    }

    async login(username, password, remember = false) {
        try {
            const response = await fetch('/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    username,
                    password,
                    remember
                })
            });

            const result = await response.json();

            if (response.ok) {
                this.currentUser = result.user;
                this.isAuthenticated = true;
                this.updateAuthUI();
                return { success: true, message: result.message };
            } else {
                return { success: false, message: result.message };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'حدث خطأ في الاتصال' };
        }
    }

    async logout() {
        try {
            const response = await fetch('/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });

            const result = await response.json();

            if (response.ok) {
                this.currentUser = null;
                this.isAuthenticated = false;
                this.updateAuthUI();
                return { success: true, message: result.message };
            } else {
                return { success: false, message: result.message };
            }
        } catch (error) {
            console.error('Logout error:', error);
            return { success: false, message: 'حدث خطأ في الاتصال' };
        }
    }

    async changePassword(currentPassword, newPassword) {
        try {
            const response = await fetch('/auth/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
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

    hasRole(role) {
        if (!this.isAuthenticated || !this.currentUser) {
            return false;
        }

        const roles = {
            'viewer': 1,
            'reviewer': 2,
            'admin': 3
        };

        const userLevel = roles[this.currentUser.role] || 0;
        const requiredLevel = roles[role] || 0;

        return userLevel >= requiredLevel;
    }

    requireAuth() {
        if (!this.isAuthenticated) {
            window.location.href = '/login';
            return false;
        }
        return true;
    }

    requireRole(role) {
        if (!this.requireAuth()) {
            return false;
        }

        if (!this.hasRole(role)) {
            this.showError('ليس لديك صلاحية للوصول إلى هذه الصفحة');
            return false;
        }

        return true;
    }

    setupAuthUI() {
        // Setup logout buttons
        const logoutButtons = document.querySelectorAll('.logout-btn');
        logoutButtons.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                const result = await this.logout();
                if (result.success) {
                    window.location.href = '/';
                } else {
                    this.showError(result.message);
                }
            });
        });

        // Setup role-based visibility
        this.updateRoleBasedUI();
    }

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

        // Update navigation
        this.updateNavigation();
        
        // Update role-based UI
        this.updateRoleBasedUI();
    }

    updateNavigation() {
        const authLinks = document.querySelectorAll('.auth-required');
        const guestLinks = document.querySelectorAll('.guest-only');

        authLinks.forEach(link => {
            link.style.display = this.isAuthenticated ? 'block' : 'none';
        });

        guestLinks.forEach(link => {
            link.style.display = this.isAuthenticated ? 'none' : 'block';
        });
    }

    updateRoleBasedUI() {
        const roleElements = document.querySelectorAll('[data-role]');
        
        roleElements.forEach(element => {
            const requiredRole = element.getAttribute('data-role');
            const hasPermission = this.hasRole(requiredRole);
            
            if (hasPermission) {
                element.style.display = '';
                element.classList.remove('hidden');
            } else {
                element.style.display = 'none';
                element.classList.add('hidden');
            }
        });
    }

    getRoleDisplayName(role) {
        const roleNames = {
            'admin': 'مدير',
            'reviewer': 'مراجع',
            'viewer': 'مشاهد'
        };
        return roleNames[role] || role;
    }

    showError(message) {
        // Create or update error alert
        let alertContainer = document.getElementById('auth-alert');
        if (!alertContainer) {
            alertContainer = document.createElement('div');
            alertContainer.id = 'auth-alert';
            alertContainer.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 400px;
            `;
            document.body.appendChild(alertContainer);
        }

        alertContainer.innerHTML = `
            <div class="alert alert-error" style="
                background-color: #fff5f5;
                color: #e53e3e;
                border: 1px solid #fed7d7;
                padding: 1rem;
                border-radius: 10px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            ">
                <i class="fas fa-exclamation-triangle" style="margin-left: 0.5rem;"></i>
                ${message}
            </div>
        `;

        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (alertContainer) {
                alertContainer.innerHTML = '';
            }
        }, 5000);
    }

    showSuccess(message) {
        // Create or update success alert
        let alertContainer = document.getElementById('auth-alert');
        if (!alertContainer) {
            alertContainer = document.createElement('div');
            alertContainer.id = 'auth-alert';
            alertContainer.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 400px;
            `;
            document.body.appendChild(alertContainer);
        }

        alertContainer.innerHTML = `
            <div class="alert alert-success" style="
                background-color: #f0fff4;
                color: #38a169;
                border: 1px solid #9ae6b4;
                padding: 1rem;
                border-radius: 10px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            ">
                <i class="fas fa-check-circle" style="margin-left: 0.5rem;"></i>
                ${message}
            </div>
        `;

        // Auto-hide after 3 seconds
        setTimeout(() => {
            if (alertContainer) {
                alertContainer.innerHTML = '';
            }
        }, 3000);
    }
}

// Create global auth manager instance
const authManager = new AuthManager();

// Export for use in other modules
window.authManager = authManager;

