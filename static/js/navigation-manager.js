// Navigation Manager - Centralized navigation handling
class NavigationManager {
    constructor() {
        this.isInitialized = false;
        this.mobileMenuActive = false;
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        this.setupMobileNavigation();
        this.setupEventListeners();
        this.isInitialized = true;
    }

    setupMobileNavigation() {
        const navToggle = document.getElementById('nav-toggle');
        const mobileMenu = document.getElementById('mobile-menu');

        if (!navToggle || !mobileMenu) return;

        // Remove any existing event listeners to prevent conflicts
        const newNavToggle = navToggle.cloneNode(true);
        navToggle.parentNode.replaceChild(newNavToggle, navToggle);

        // Add single event listener
        newNavToggle.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleMobileMenu();
        });

        // Setup mobile menu links
        this.setupMobileMenuLinks(mobileMenu);
        
        // Setup outside click handler
        this.setupOutsideClickHandler(newNavToggle, mobileMenu);
    }

    toggleMobileMenu() {
        const navToggle = document.getElementById('nav-toggle');
        const mobileMenu = document.getElementById('mobile-menu');

        if (!navToggle || !mobileMenu) return;

        this.mobileMenuActive = !this.mobileMenuActive;
        
        navToggle.classList.toggle('active', this.mobileMenuActive);
        mobileMenu.classList.toggle('active', this.mobileMenuActive);
        
        // Prevent body scroll when menu is open
        document.body.style.overflow = this.mobileMenuActive ? 'hidden' : '';
    }

    closeMobileMenu() {
        const navToggle = document.getElementById('nav-toggle');
        const mobileMenu = document.getElementById('mobile-menu');

        if (!navToggle || !mobileMenu) return;

        this.mobileMenuActive = false;
        navToggle.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
    }

    setupMobileMenuLinks(mobileMenu) {
        const mobileLinks = mobileMenu.querySelectorAll('.nav-link, a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        });
    }

    setupOutsideClickHandler(navToggle, mobileMenu) {
        document.addEventListener('click', (e) => {
            if (this.mobileMenuActive && 
                !navToggle.contains(e.target) && 
                !mobileMenu.contains(e.target)) {
                this.closeMobileMenu();
            }
        });
    }

    setupEventListeners() {
        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > AppConfig.MOBILE_BREAKPOINT) {
                this.closeMobileMenu();
            }
        });

        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.mobileMenuActive) {
                this.closeMobileMenu();
            }
        });
    }

    // Public method to check if mobile menu is active
    isMobileMenuActive() {
        return this.mobileMenuActive;
    }
}

// Create singleton instance
const navigationManager = new NavigationManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavigationManager;
} else {
    window.NavigationManager = NavigationManager;
    window.navigationManager = navigationManager;
}

