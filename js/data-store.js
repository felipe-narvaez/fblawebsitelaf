// Data Store - LocalStorage Management
// Handles all data persistence, CRUD operations, and mock data initialization


const DataStore = {
    // Storage keys
    ITEMS_KEY: "mater_lost_found_items",
    CLAIMS_KEY: "mater_lost_found_claims",
    LOST_REPORTS_KEY: "mater_lost_found_lost_reports",
    INITIALIZED_KEY: "mater_lost_found_initialized",

    // Categories
    categories: [
        "Electronics",
        "Bags",
        "School Supplies",
        "Clothing/Shoes",
        "Jewelry/Accessories",
        "Personal Items",
        "ID Cards",
        "Sports Equipment",
        "Other",
    ],

    // Mock data - 18 items (14 approved, 4 pending) — enough to demonstrate pagination
    mockItems: [
        {
            id: "2",
            title: "Blue Nike Backpack",
            description:
                "Royal blue Nike backpack with several textbooks inside. Found in the gym locker room after PE class. Contains math and science textbooks.",
            category: "Bags",
            locationFound: "Gym Locker Room",
            dateFound: "2025-11-16",
            photoUrl:
                "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
            status: "approved",
            finderName: "Coach Martinez",
            finderContact: "cmartinez@materacademy.com",
            claimNotes: null,
        },
        {
            id: "4",
            title: "Black and White Adidas Sneakers",
            description:
                "Size 9 Adidas sneakers, black with white stripes. Left in the girls' locker room after volleyball practice.",
            category: "Clothing/Shoes",
            locationFound: "Girls' Locker Room",
            dateFound: "2025-11-17",
            photoUrl:
                "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
            status: "pending",
            finderName: "Coach Davis",
            finderContact: "ldavis@materacademy.com",
            claimNotes: null,
        },
        {
            id: "6",
            title: "Green Hydroflask Water Bottle",
            description:
                "32oz green Hydroflask with multiple stickers including Mater Academy logo. Name 'Sarah' written in white paint marker on bottom.",
            category: "Personal Items",
            locationFound: "Library Study Area",
            dateFound: "2025-11-15",
            photoUrl:
                "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80",
            status: "approved",
            finderName: "Librarian",
            finderContact: "library@materacademy.com",
            claimNotes: null,
        },
        {
            id: "8",
            title: "Prescription Glasses in Case",
            description:
                "Black framed prescription glasses in a hard blue case. Found on bench near the main entrance.",
            category: "Personal Items",
            locationFound: "Main Entrance Bench",
            dateFound: "2025-11-17",
            photoUrl:
                "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=800&q=80",
            status: "pending",
            finderName: "Security Guard",
            finderContact: "security@materacademy.com",
            claimNotes: null,
        },
        {
            id: "9",
            title: "Leather Wallet - Brown",
            description:
                "Brown leather wallet found in the parking lot. Contains student ID and some cash. Student ID removed for security.",
            category: "Personal Items",
            locationFound: "Student Parking Lot",
            dateFound: "2025-11-16",
            photoUrl:
                "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80",
            status: "approved",
            finderName: "Mr. Garcia",
            finderContact: "rgarcia@materacademy.com",
            claimNotes: null,
        },
        {
            id: "11",
            title: "AirPods Pro with Case",
            description:
                "White AirPods Pro in charging case. Found in the art classroom after 5th period. Case has a small scratch on the lid.",
            category: "Electronics",
            locationFound: "Art Classroom - Room 205",
            dateFound: "2025-11-17",
            photoUrl:
                "https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=800&q=80",
            status: "pending",
            finderName: "Mrs. Chen",
            finderContact: "mchen@materacademy.com",
            claimNotes: null,
        },
        {
            id: "12",
            title: "Student ID Card",
            description:
                "Mater Academy student ID card found near the vending machines. Photo visible but name obscured for privacy. Please identify by describing yourself.",
            category: "ID Cards",
            locationFound: "Vending Machine Area",
            dateFound: "2025-11-15",
            photoUrl:
                "https://images.unsplash.com/photo-1671376354601-30bb062e2eb2?w=800&q=80",
            status: "approved",
            finderName: "Cafeteria Staff",
            finderContact: "cafeteria@materacademy.com",
            claimNotes: null,
        },
        {
            id: "13",
            title: "TI-84 Plus Graphing Calculator",
            description:
                "Silver TI-84 Plus graphing calculator with a black case. Student name 'J. Rivera' written in marker on the back. Found on a desk in Room 110 after math class.",
            category: "Electronics",
            locationFound: "Math Room 110",
            dateFound: "2025-11-18",
            photoUrl:
                "https://images.unsplash.com/photo-1737919144176-cb279b56ce6b?w=800&q=80",
            status: "approved",
            finderName: "Mr. Thompson",
            finderContact: "mthompson@materacademy.com",
            claimNotes: null,
        },
        {
            id: "14",
            title: "Black Jansport Backpack",
            description:
                "All-black Jansport backpack, medium size. Found in the cafeteria under a lunch table. Contains a lunchbox and several folders. No ID inside.",
            category: "Bags",
            locationFound: "Cafeteria",
            dateFound: "2025-11-18",
            photoUrl:
                "https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=800&q=80",
            status: "approved",
            finderName: "Cafeteria Staff",
            finderContact: "cafeteria@materacademy.com",
            claimNotes: null,
        },
        {
            id: "15",
            title: "Gray Zip-Up Hoodie",
            description:
                "Medium-sized gray zip-up hoodie, no logo. Found draped over a chair in the library. Soft material, appears well-cared for.",
            category: "Clothing/Shoes",
            locationFound: "Library - 2nd Floor",
            dateFound: "2025-11-14",
            photoUrl:
                "https://images.unsplash.com/photo-1655141559697-f927ed68170c?w=800&q=80",
            status: "approved",
            finderName: "Library Aide",
            finderContact: "library@materacademy.com",
            claimNotes: null,
        },
        {
            id: "16",
            title: "Gold Hoop Earrings (Pair)",
            description:
                "Small gold hoop earrings, approximately 1 inch diameter. Found on the floor of the girls' bathroom near the gym. Stored safely in an envelope.",
            category: "Jewelry/Accessories",
            locationFound: "Girls' Bathroom - Gym Hall",
            dateFound: "2025-11-19",
            photoUrl:
                "https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=800&q=80",
            status: "approved",
            finderName: "Coach Davis",
            finderContact: "ldavis@materacademy.com",
            claimNotes: null,
        },
        {
            id: "17",
            title: "Volleyball",
            description:
                "White and blue official Tachikara volleyball. Found in the equipment closet after after-school practice. Has a small scuff mark near the valve.",
            category: "Sports Equipment",
            locationFound: "Gym Equipment Room",
            dateFound: "2025-11-13",
            photoUrl:
                "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&q=80",
            status: "approved",
            finderName: "Coach Martinez",
            finderContact: "cmartinez@materacademy.com",
            claimNotes: null,
        },
        {
            id: "18",
            title: "Colored Pencils Set (Prismacolor)",
            description:
                "Set of 48 Prismacolor colored pencils in a zipper case. Several pencils are sharpened and clearly used. Found in the art room after class.",
            category: "School Supplies",
            locationFound: "Art Room 205",
            dateFound: "2025-11-19",
            photoUrl:
                "https://plus.unsplash.com/premium_photo-1663040669845-e4ff569ee5f7?w=800&q=80",
            status: "approved",
            finderName: "Mrs. Chen",
            finderContact: "mchen@materacademy.com",
            claimNotes: null,
        },
        {
            id: "19",
            title: "Car Keys with Keychain",
            description:
                "Honda car keys with a small rubber duck keychain and a lanyard attached. Found in the student parking lot on the ground near the B row.",
            category: "Personal Items",
            locationFound: "Student Parking Lot - B Row",
            dateFound: "2025-11-20",
            photoUrl:
                "https://images.unsplash.com/photo-1710006548781-eff5670376fa?w=800&q=80",
            status: "approved",
            finderName: "Security Guard",
            finderContact: "security@materacademy.com",
            claimNotes: null,
        },
        {
            id: "20",
            title: "iPad with Red Case",
            description:
                "Apple iPad (8th gen) in a bright red protective case with a built-in keyboard. Found on a bench outside the main office. Screen is locked.",
            category: "Electronics",
            locationFound: "Outside Main Office",
            dateFound: "2025-11-20",
            photoUrl:
                "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80",
            status: "approved",
            finderName: "Office Staff",
            finderContact: "office@materacademy.com",
            claimNotes: null,
        },
        {
            id: "21",
            title: "Retainer in Pink Case",
            description:
                "Orthodontic retainer in a pink clamshell case. Found on a cafeteria table during lunch cleanup. Case has a small flower sticker on the front.",
            category: "Personal Items",
            locationFound: "Cafeteria - Table 12",
            dateFound: "2025-11-18",
            photoUrl:
                "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=800&q=80",
            status: "pending",
            finderName: "Cafeteria Staff",
            finderContact: "cafeteria@materacademy.com",
            claimNotes: null,
        },
        {
            id: "22",
            title: "MacBook Charger (USB-C)",
            description:
                "Apple 61W USB-C MacBook charger with MagSafe cable. Found plugged into an outlet in the library study lounge. Cable is in good condition.",
            category: "Electronics",
            locationFound: "Library Study Lounge",
            dateFound: "2025-11-21",
            photoUrl:
                "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=80",
            status: "approved",
            finderName: "Librarian",
            finderContact: "library@materacademy.com",
            claimNotes: null,
        },
        {
            id: "23",
            title: "Navy Blue Baseball Cap",
            description:
                "Plain navy blue baseball cap, one-size-fits-all adjustable strap. No logos or markings. Found in the hallway near the science wing after school.",
            category: "Clothing/Shoes",
            locationFound: "Science Wing Hallway",
            dateFound: "2025-11-21",
            photoUrl:
                "https://images.unsplash.com/photo-1663280419473-f650ee0fd0b9?w=800&q=80",
            status: "approved",
            finderName: "Mr. Garcia",
            finderContact: "rgarcia@materacademy.com",
            claimNotes: null,
        },
    ],

    /**
     * Initializes the localStorage data for the app with mock items and claims.
     * Only runs if not already initialized.
     *
     * Preconditions:
     * - `localStorage` is available.
     * - `mockItems` array is defined.
     *
     * Postconditions:
     * - `ITEMS_KEY` and `CLAIMS_KEY` are set in localStorage if not already.
     * - `INITIALIZED_KEY` is set to 'true'.
     *
     * @returns {void}
     */
    initialize() {
        const version = localStorage.getItem(this.INITIALIZED_KEY);
        if (version !== "v6") {
            localStorage.setItem(this.ITEMS_KEY, JSON.stringify(this.mockItems));
            localStorage.setItem(this.CLAIMS_KEY, JSON.stringify([]));
            localStorage.setItem(this.INITIALIZED_KEY, "v6");
        }
    },

    /**
     * Retrieves all items from localStorage.
     *
     * Preconditions:
     * - `localStorage` contains `ITEMS_KEY` or it may be empty.
     *
     * Postconditions:
     * - Returns an array of item objects (empty if no items exist).
     *
     * @returns {Array<Object>} All items.
     */
    getAllItems() {
        const items = localStorage.getItem(this.ITEMS_KEY);
        return items ? JSON.parse(items) : [];
    },

    /**
     * Returns all items filtered by their status.
     *
     * Preconditions:
     * - `status` is a string representing item status: 'pending', 'approved', or 'claimed'.
     *
     * Postconditions:
     * - Returns an array of items matching the given status.
     *
     * @param {string} status - The status to filter by.
     * @returns {Array<Object>} Items with the specified status.
     */
    getItemsByStatus(status) {
        const items = this.getAllItems();
        return items.filter((item) => item.status === status);
    },

    // Get approved items (visible on home page)
    getApprovedItems() {
        return this.getItemsByStatus("approved");
    },

    /**
     * Finds and returns a single item by its ID.
     *
     * Preconditions:
     * - `id` is a string representing the item ID.
     *
     * Postconditions:
     * - Returns the item object if found, otherwise undefined.
     *
     * @param {string} id - The ID of the item.
     * @returns {Object|undefined} The matching item.
     */
    getItemById(id) {
        const items = this.getAllItems();
        return items.find((item) => item.id === id);
    },

    /**
     * Adds a new item to the localStorage with status 'pending'.
     *
     * Preconditions:
     * - `itemData` is an object containing at least title, description, category, locationFound, dateFound, and photoUrl.
     *
     * Postconditions:
     * - Item is saved in localStorage.
     * - Returns the newly created item object including generated ID and default status.
     *
     * @param {Object} itemData - The data for the new item.
     * @returns {Object} The newly created item.
     */
    addItem(itemData) {
        const items = this.getAllItems();
        const newItem = {
            id: Date.now().toString(),
            ...itemData,
            status: "pending", // All new items start as pending
            claimNotes: null,
        };
        items.push(newItem);
        localStorage.setItem(this.ITEMS_KEY, JSON.stringify(items));
        return newItem;
    },

    // Update item
    updateItem(id, updates) {
        const items = this.getAllItems();
        const index = items.findIndex((item) => item.id === id);
        if (index !== -1) {
            items[index] = { ...items[index], ...updates };
            localStorage.setItem(this.ITEMS_KEY, JSON.stringify(items));
            return items[index];
        }
        return null;
    },

    // Update item status (for admin workflow)
    updateItemStatus(id, status) {
        return this.updateItem(id, { status });
    },

    /**
     * Deletes an item from localStorage by ID.
     *
     * Preconditions:
     * - `id` corresponds to an existing item.
     *
     * Postconditions:
     * - Item is removed from localStorage.
     *
     * @param {string} id - The ID of the item to delete.
     * @returns {void}
     */
    deleteItem(id) {
        const items = this.getAllItems();
        const filtered = items.filter((item) => item.id !== id);
        localStorage.setItem(this.ITEMS_KEY, JSON.stringify(filtered));
    },

    // === CLAIMS MANAGEMENT ===

    /**
     * Retrieves all claims from localStorage.
     *
     * Preconditions:
     * - `CLAIMS_KEY` exists in localStorage or may be empty.
     *
     * Postconditions:
     * - Returns an array of claim objects (empty if none exist).
     *
     * @returns {Array<Object>} All claims.
     */
    getAllClaims() {
        const claims = localStorage.getItem(this.CLAIMS_KEY);
        return claims ? JSON.parse(claims) : [];
    },

    // Get claims by item ID
    getClaimsByItemId(itemId) {
        const claims = this.getAllClaims();
        return claims.filter((claim) => claim.itemId === itemId);
    },

    /**
     * Adds a new claim to localStorage with status 'pending' and current timestamp.
     *
     * Preconditions:
     * - `claimData` contains at least itemId, itemTitle, claimantName, claimantContact, and description.
     *
     * Postconditions:
     * - Claim is saved in localStorage.
     * - Returns the newly created claim object including generated ID and submittedAt timestamp.
     *
     * @param {Object} claimData - Data for the new claim.
     * @returns {Object} Newly created claim object.
     */
    addClaim(claimData) {
        const claims = this.getAllClaims();
        const newClaim = {
            id: Date.now().toString(),
            ...claimData,
            status: "pending",
            submittedAt: new Date().toISOString(),
        };
        claims.push(newClaim);
        localStorage.setItem(this.CLAIMS_KEY, JSON.stringify(claims));
        return newClaim;
    },

    /**
     * Updates the status of a claim and marks the item as 'claimed' if approved.
     *
     * Preconditions:
     * - `id` corresponds to an existing claim.
     * - `status` is a valid string: 'pending' or 'approved'.
     *
     * Postconditions:
     * - Claim status is updated in localStorage.
     * - If approved, the related item status is set to 'claimed'.
     * - Returns updated claim object or null if not found.
     *
     * @param {string} id - Claim ID.
     * @param {string} status - New status for the claim.
     * @returns {Object|null} Updated claim or null if not found.
     */
    updateClaimStatus(id, status) {
        const claims = this.getAllClaims();
        const index = claims.findIndex((claim) => claim.id === id);
        if (index !== -1) {
            claims[index].status = status;
            localStorage.setItem(this.CLAIMS_KEY, JSON.stringify(claims));

            // If claim is approved, mark item as claimed
            if (status === "approved") {
                const claim = claims[index];
                this.updateItemStatus(claim.itemId, "claimed");
            }

            return claims[index];
        }
        return null;
    },

    /**
     * Returns approved items filtered by search query and optional category.
     *
     * Preconditions:
     * - `query` is a string.
     * - `category` is a string (optional).
     *
     * Postconditions:
     * - Returns array of approved items that match the query and category.
     *
     * @param {string} query - Search text to filter by.
     * @param {string} [category=''] - Category to filter by.
     * @returns {Array<Object>} Filtered list of items.
     */
    searchItems(query, category = "") {
        let items = this.getApprovedItems();

        // Filter by category
        if (category) {
            items = items.filter((item) => item.category === category);
        }

        // Filter by search query
        if (query) {
            const lowerQuery = query.toLowerCase();
            items = items.filter(
                (item) =>
                    item.title.toLowerCase().includes(lowerQuery) ||
                    item.description.toLowerCase().includes(lowerQuery) ||
                    item.category.toLowerCase().includes(lowerQuery) ||
                    item.locationFound.toLowerCase().includes(lowerQuery)
            );
        }

        return items;
    },

    /**
     * Resets the data store to its initial mock data.
     *
     * Preconditions:
     * - `localStorage` is available.
     *
     * Postconditions:
     * - All items and claims are reset to mock data.
     * - `INITIALIZED_KEY` is cleared and re-initialized.
     *
     * @returns {void}
     */
    getLostReports() {
        const stored = localStorage.getItem(this.LOST_REPORTS_KEY);
        return stored ? JSON.parse(stored) : [];
    },

    addLostReport(reportData) {
        const reports = this.getLostReports();
        const newReport = {
            id: Date.now().toString(),
            ...reportData,
            submittedAt: new Date().toISOString(),
        };
        reports.push(newReport);
        localStorage.setItem(this.LOST_REPORTS_KEY, JSON.stringify(reports));
        return newReport;
    },

    deleteLostReport(reportId) {
        const reports = this.getLostReports().filter((r) => r.id !== reportId);
        localStorage.setItem(this.LOST_REPORTS_KEY, JSON.stringify(reports));
    },

    reset() {
        localStorage.removeItem(this.INITIALIZED_KEY);
        localStorage.removeItem(this.LOST_REPORTS_KEY);
        this.initialize();
    },

    /**
     * Returns statistics for the admin dashboard including item counts and claim counts.
     *
     * Preconditions:
     * - `getAllItems` and `getAllClaims` return valid arrays.
     *
     * Postconditions:
     * - Returns an object containing counts: pending, approved, claimed, totalClaims, pendingClaims.
     *
     * @returns {Object} Admin dashboard statistics.
     */
    getStats() {
        const items = this.getAllItems();
        const claims = this.getAllClaims();

        return {
            pending: items.filter((i) => i.status === "pending").length,
            approved: items.filter((i) => i.status === "approved").length,
            claimed: items.filter((i) => i.status === "claimed").length,
            totalClaims: claims.length,
            pendingClaims: claims.filter((c) => c.status === "pending").length,
            lostReports: this.getLostReports().length,
        };
    },
};

// Initialize on load
DataStore.initialize();
