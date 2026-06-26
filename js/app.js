// App.js - Navigation and Page Management
// Handles hash-based routing, page switching, and global UI interactions


const App = {
    currentPage: "home",

    /**
     * Initializes the application by setting up navigation behavior,
     * the global toast notification system, and loading the initial page.
     *
     * Preconditions:
     * - The DOM has finished loading or is safe to query.
     * - Required navigation, page sections, and toast elements exist.
     *
     * Postconditions:
     * - Navigation and toast systems are initialized.
     * - The initial page is displayed based on the URL hash.
     * - A listener is attached to handle future route changes.
     *
     * @returns {void}
     */
    init() {
        this.setupNavigation();
        this.setupToast();
        this.loadInitialPage();

        // Listen for hash changes
        window.addEventListener("hashchange", () => this.handleRouteChange());
    },

    // Setup navigation link highlighting
    setupNavigation() {
        const navLinks = document.querySelectorAll(".nav-link");
        navLinks.forEach((link) => {
            link.addEventListener("click", (e) => {
                // Update active state
                navLinks.forEach((l) => l.classList.remove("active"));
                e.target.classList.add("active");
            });
        });
    },

    // Load initial page based on hash
    loadInitialPage() {
        const raw = window.location.hash.slice(1) || "home";
        const [page, extra] = raw.split("/");
        this.showPage(page, extra);
    },

    // Handle route changes
    handleRouteChange() {
        const raw = window.location.hash.slice(1) || "home";
        const [page, extra] = raw.split("/");
        this.showPage(page, extra);
    },

    /**
     * Displays the requested page section, updates navigation state,
     * and triggers page-specific initialization logic.
     *
     * Preconditions:
     * - `pageName` corresponds to a valid page identifier.
     * - Page sections and navigation links exist in the DOM.
     *
     * Postconditions:
     * - All page sections are hidden except the target page.
     * - The active navigation link reflects the current page.
     * - `currentPage` is updated and page-specific logic is executed.
     *
     * @param {string} pageName - The name of the page to display.
     * @returns {void}
     */
    showPage(pageName, extra) {
        // Hide all pages
        const pages = document.querySelectorAll(".page-section");
        pages.forEach((page) => page.classList.remove("active"));

        // Show requested page
        const targetPage = document.getElementById(`${pageName}-page`);
        if (targetPage) {
            targetPage.classList.add("active");
            this.currentPage = pageName;

            // Move focus to the new page heading for screen reader navigation
            const heading = targetPage.querySelector("h1, h2");
            if (heading) {
                heading.setAttribute("tabindex", "-1");
                heading.focus({ preventScroll: false });
            }

            // Update nav active state
            const navLinks = document.querySelectorAll(".nav-link");
            navLinks.forEach((link) => {
                link.classList.remove("active");
                if (link.dataset.page === pageName) {
                    link.classList.add("active");
                }
            });

            // Trigger page-specific initialization
            this.onPageShow(pageName, extra);
        }
    },

    /**
     * Executes initialization logic specific to the currently active page.
     *
     * Preconditions:
     * - `pageName` is a valid page identifier.
     * - Page-specific modules are loaded and available globally if required.
     *
     * Postconditions:
     * - The corresponding page module is initialized or rendered.
     * - No action is taken if the target module is unavailable.
     *
     * @param {string} pageName - The active page name.
     * @returns {void}
     */
    onPageShow(pageName, extra) {
        switch (pageName) {
            case "home":
                if (window.Browse) Browse.render();
                break;
            case "report":
                if (window.Report) Report.init();
                break;
            case "claim":
                if (window.Claim) Claim.init();
                break;
            case "lost":
                if (window.Lost) Lost.init();
                break;
            case "admin":
                if (window.Admin) Admin.init();
                break;
        }
    },

    /**
     * Initializes the global toast notification system, including
     * animation timing, progress tracking, and pause-on-hover behavior.
     *
     * Preconditions:
     * - Toast container, message, and progress elements exist in the DOM.
     * - The browser supports `requestAnimationFrame`.
     *
     * Postconditions:
     * - A reusable toast controller is created and stored on `this.toast`.
     * - Toasts can be shown, paused, resumed, and dismissed.
     *
     * @returns {void}
     */
    setupToast() {
        this.toast = {
            element: document.getElementById("toast"),
            message: document.querySelector(".toast-message"),
            progress: document.querySelector(".toast-progress"),

            duration: 0,
            remaining: 0,
            startTime: 0,
            rafId: null,
            paused: false,

            show(message, duration = 3000) {
                this.message.textContent = message;

                this.duration = duration;
                this.remaining = duration;
                this.startTime = performance.now();
                this.paused = false;

                this.progress.style.transform = "scaleX(1)";

                cancelAnimationFrame(this.rafId);

                this.element.classList.add("show");
                this.loop();
            },

            loop() {
                this.rafId = requestAnimationFrame((now) => {
                    if (!this.paused) {
                        const elapsed = now - this.startTime;
                        this.remaining = Math.max(this.duration - elapsed, 0);

                        const progress = this.remaining / this.duration;
                        this.progress.style.transform = `scaleX(${progress})`;

                        if (this.remaining <= 0) {
                            this.hide();
                            return;
                        }
                    } else {
                        this.startTime =
                            performance.now() - (this.duration - this.remaining);
                    }

                    this.loop();
                });
            },

            hide() {
                cancelAnimationFrame(this.rafId);
                this.element.classList.remove("show");
            },
        };

        this.toast.element.addEventListener("mouseenter", () => {
            this.toast.paused = true;
        });

        this.toast.element.addEventListener("mouseleave", () => {
            this.toast.paused = false;
            this.toast.startTime =
                performance.now() - (this.toast.duration - this.toast.remaining);
        });
    },

    // Show toast notification
    showToast(message, duration) {
        this.toast.show(message, duration);
    },

    /**
     * Navigates to a new page by updating the URL hash.
     *
     * Preconditions:
     * - `page` is a valid page identifier.
     * - Hash-based routing is enabled in the application.
     *
     * Postconditions:
     * - The browser URL hash is updated.
     * - A route change event is triggered, causing the new page to render.
     *
     * @param {string} page - The page to navigate to.
     * @returns {void}
     */
    navigate(page, itemId) {
        window.location.hash = itemId ? `${page}/${itemId}` : page;
    },

    // Format date for display
    formatDate(dateString) {
        const date = new Date(dateString);
        const options = { year: "numeric", month: "long", day: "numeric" };
        return date.toLocaleDateString("en-US", options);
    },

    // Get category emoji
    getCategoryEmoji(category) {
        const emojis = {
            Electronics: "📱",
            Bags: "🎒",
            "School Supplies": "📚",
            "Clothing/Shoes": "👟",
            "Jewelry/Accessories": "💍",
            "Personal Items": "🔑",
            "ID Cards": "🪪",
            "Sports Equipment": "⚽",
            Other: "📦",
        };
        return emojis[category] || "📦";
    },

    // Validate form field
    validateField(value, rules = {}) {
        if (rules.required && !value.trim()) {
            return "This field is required";
        }
        if (rules.minLength && value.length < rules.minLength) {
            return `Minimum length is ${rules.minLength} characters`;
        }
        if (rules.maxLength && value.length > rules.maxLength) {
            return `Maximum length is ${rules.maxLength} characters`;
        }
        if (rules.url && value.trim()) {
            try {
                new URL(value);
            } catch {
                return "Please enter a valid URL";
            }
        }
        return null;
    },
};

// Make App available globally first
window.App = App;

//Creates smooth scrolling
document.addEventListener("DOMContentLoaded", () => {
    const backToTop = document.getElementById("backToTop");

    if (!backToTop) return;

    backToTop.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    });
});

// Initialize app when DOM is ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => App.init());
} else {
    App.init();
}
