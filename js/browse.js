// Browse.js - Home Page - Item Browsing and Search
// Handles item display, search, and category filtering


const Browse = {
    searchInput: null,
    categoryFilter: null,
    itemsGrid: null,
    emptyState: null,

    /**
     * Initializes the Browse page by setting up DOM references, filters,
     * event listeners, and rendering the initial item list.
     *
     * Preconditions:
     * - The DOM contains elements with IDs: `search-input`, `category-filter`, `items-grid`, `empty-state`.
     * - `DataStore.categories` is defined and accessible.
     * - `App.getCategoryEmoji` and `App.formatDate` are available for rendering.
     *
     * Postconditions:
     * - Search and category filters are populated and event listeners are attached.
     * - The initial list of items is rendered based on current filter values.
     * - `this.searchInput`, `this.categoryFilter`, `this.itemsGrid`, and `this.emptyState` are set.
     *
     * @returns {void}
     */
    init() {
        this.searchInput = document.getElementById("search-input");
        this.categoryFilter = document.getElementById("category-filter");
        this.itemsGrid = document.getElementById("items-grid");
        this.emptyState = document.getElementById("empty-state");

        this.setupFilters();
        this.populateCategoryFilter();
        this.setupEventListeners();
        this.render();
    },

    // Populate category dropdown
    populateCategoryFilter() {
        DataStore.categories.forEach((category) => {
            const option = document.createElement("option");
            option.value = category;
            option.textContent = category;
            this.categoryFilter.appendChild(option);
        });
    },

    // Setup event listeners
    setupEventListeners() {
        this.searchInput.addEventListener("input", () => this.handleSearch());
        this.categoryFilter.addEventListener("change", () => this.handleSearch());
    },

    // Setup filters
    setupFilters() {
        // Initialize filter values from URL params if any
        const params = new URLSearchParams(window.location.search);
        if (params.get("search")) {
            this.searchInput.value = params.get("search");
        }
        if (params.get("category")) {
            this.categoryFilter.value = params.get("category");
        }
    },

    // Handle search and filter
    handleSearch() {
        const query = this.searchInput.value.trim();
        const category = this.categoryFilter.value;
        this.render(query, category);
    },

    /**
     * Renders the list of items on the Browse page based on the provided
     * search query and category filter, updating the grid and empty state.
     *
     * Preconditions:
     * - `DataStore.searchItems` is available and returns an array of item objects.
     * - `this.itemsGrid` and `this.emptyState` reference valid DOM elements.
     *
     * Postconditions:
     * - `this.itemsGrid` displays filtered items or is hidden if none match.
     * - `this.emptyState` is shown if no items match filters.
     * - Each item is rendered using `createItemCard`.
     *
     * @param {string} [searchQuery=''] - The current search query.
     * @param {string} [category=''] - The selected category filter.
     * @returns {void}
     */
    render(searchQuery = "", category = "") {
        const items = DataStore.searchItems(searchQuery, category);

        this.itemsGrid.innerHTML = "";

        if (items.length === 0) {
            this.itemsGrid.style.display = "none";
            this.emptyState.style.display = "block";
        } else {
            this.itemsGrid.style.display = "grid";
            this.emptyState.style.display = "none";
            items.forEach((item) => {
                this.itemsGrid.appendChild(this.createItemCard(item));
            });
        }
    },

    /**
     * Creates a DOM element representing a single item card, including
     * image, metadata, and a claim button with click behavior.
     *
     * Preconditions:
     * - `item` is a valid object with fields: `id`, `title`, `description`, `category`, `photoUrl`, `locationFound`, `dateFound`.
     * - `App.getCategoryEmoji` and `App.formatDate` are available.
     *
     * Postconditions:
     * - Returns a fully populated `.item-card` element.
     * - A claim button is included and wired to call `handleClaimClick` for the item.
     * - No application state is changed until the claim button is clicked.
     *
     * @param {Object} item - The item to render in the card.
     * @returns {HTMLElement} The created item card element.
     */
    createItemCard(item) {
        const card = document.createElement("div");
        card.className = "item-card";
        card.tabIndex = 0;
        card.setAttribute("role", "article");
        card.setAttribute("aria-label", item.title);

        const categoryEmoji = App.getCategoryEmoji(item.category);
        const formattedDate = App.formatDate(item.dateFound);
        const svgPin = '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>';
        const svgCal = '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';

        card.innerHTML = `
            <div class="item-image" style="background-image: url('${
            item.photoUrl
        }')">
                <span class="item-category-badge">${categoryEmoji} ${
            item.category
        }</span>
            </div>
            <div class="item-content">
                <h3 class="item-title">${this.escapeHtml(item.title)}</h3>
                <p class="item-description">${this.escapeHtml(
            item.description
        )}</p>
                <div class="item-meta">
                    <span class="meta-item">${svgPin} ${this.escapeHtml(
            item.locationFound
        )}</span>
                    <span class="meta-item">${svgCal} ${formattedDate}</span>
                </div>
                <button class="btn btn-accent btn-full claim-btn" data-item-id="${
            item.id
        }">
                    View &amp; Claim
                </button>
            </div>
        `;

        // Card click and keyboard — navigate to item detail
        card.addEventListener("click", () => this.handleClaimClick(item.id));
        card.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                this.handleClaimClick(item.id);
            }
        });

        // Claim button — stop propagation so card click doesn't double-fire
        const claimBtn = card.querySelector(".claim-btn");
        claimBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            this.handleClaimClick(item.id);
        });

        return card;
    },

    /**
     * Handles a click on an item's "Claim This Item" button by storing
     * the item ID in session storage and navigating to the claim page.
     *
     * Preconditions:
     * - `itemId` corresponds to a valid item.
     * - `App.navigate` is available for routing.
     * - `sessionStorage` is available.
     *
     * Postconditions:
     * - `sessionStorage` is updated with the key `claimItemId` set to `itemId`.
     * - The application navigates to the claim page.
     *
     * @param {string} itemId - The ID of the item being claimed.
     * @returns {void}
     */
    handleClaimClick(itemId) {
        // Store item ID for claim page
        sessionStorage.setItem("claimItemId", itemId);
        App.navigate("claim");
    },

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    },
};

// Make Browse available globally
window.Browse = Browse;

// Initialize when DOM is ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => Browse.init());
} else {
    Browse.init();
}
