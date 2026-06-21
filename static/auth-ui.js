import authService from './firebase-auth.js';

// Authentication UI Manager
class AuthUIManager {
    constructor() {
        this.init();
    }

    init() {
        this.updateAuthUI();
        this.setupLogoutHandlers();
    }

    // Update UI based on authentication state
    updateAuthUI() {
        const user = authService.getCurrentUser();
        
        // Update username displays
        const usernameElements = document.querySelectorAll('.username-display');
        usernameElements.forEach(element => {
            element.textContent = user ? (user.displayName || user.email) : 'Guest';
        });

        // Update login/logout buttons
        const loginBtns = document.querySelectorAll('.login-btn');
        const logoutBtns = document.querySelectorAll('.logout-btn');

    
        
        if (user) {
            loginBtns.forEach(btn => btn.classList.add('hidden'));
            logoutBtns.forEach(btn => btn.classList.remove('hidden'));
        } else {
            loginBtns.forEach(btn => btn.classList.remove('hidden'));
            logoutBtns.forEach(btn => btn.classList.add('hidden'));
        }
    }

    // Setup logout handlers
    setupLogoutHandlers() {
        const logoutBtns = document.querySelectorAll('.logout-btn');
        logoutBtns.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                await this.handleLogout();
            });
        });
    }

    // Handle logout
    async handleLogout() {
        try {
            const result = await authService.signOut();
            if (result.success) {
                this.showToast('Logged out successfully', 'success');
                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 1000);
            } else {
                this.showToast('Logout failed', 'error');
            }
        } catch (error) {
            this.showToast('An error occurred during logout', 'error');
        }
    }

    // Show toast notification
    showToast(message, type = 'info') {
        const toast = document.getElementById('toast') || this.createToast();
        const bgColor = type === 'success' ? 'bg-green-600' : 
                       type === 'error' ? 'bg-red-600' : 
                       type === 'warning' ? 'bg-yellow-600' : 'bg-blue-600';
        
        toast.className = `fixed top-5 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg text-white font-medium ${bgColor} toast`;
        toast.textContent = message;
        toast.classList.remove('hidden');
        
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    }

    // Create toast element if it doesn't exist
    createToast() {
        const toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'fixed top-5 left-1/2 transform -translate-x-1/2 z-50 hidden';
        document.body.appendChild(toast);
        return toast;
    }
}

// Initialize auth UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AuthUIManager();
});

export default AuthUIManager;
