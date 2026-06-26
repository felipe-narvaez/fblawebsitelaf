// Admin.js - Admin Dashboard
// Handles item approval workflow, claims management, and admin actions


const Admin = {
    currentTab: "pending",
    isLoggedIn: false,
    _pages: { pending: 1, approved: 1, claims: 1, claimed: 1, 'lost-reports': 1 },
    PAGE_SIZE: 10,

    // Admin credentials
    USERNAME: "admin",
    PASSWORD: "admin123",

    init() {
        this.checkLoginStatus();
        this.setupLoginForm();
        this.setupTabs();

        // Only initialize dashboard if logged in
        if (this.isLoggedIn) {
            this.updateCounts();
            this.renderCurrentTab();
        }
    },

    // Check if already logged in
    checkLoginStatus() {
        this.isLoggedIn = sessionStorage.getItem("adminLoggedIn") === "true";

        if (this.isLoggedIn) {
            this.showDashboard();
        } else {
            this.showLogin();
        }
    },

    // Setup login form
    setupLoginForm() {
        const loginForm = document.getElementById("admin-login-form");
        if (loginForm) {
            loginForm.addEventListener("submit", (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }
    },

    // Handle login
    handleLogin() {
        const username = document.getElementById("admin-username").value;
        const password = document.getElementById("admin-password").value;
        const errorElement = document.getElementById("login-error");

        if (username === this.USERNAME && password === this.PASSWORD) {
            // Successful login
            sessionStorage.setItem("adminLoggedIn", "true");
            this.isLoggedIn = true;
            errorElement.textContent = "";

            App.showToast("Welcome, Admin!");
            this.showDashboard();
            this.updateCounts();
            this.renderCurrentTab();
        } else {
            // Failed login
            errorElement.textContent = "Invalid username or password";
            App.showToast("Login failed");
            document.getElementById("admin-username").focus();
        }
    },

    // Logout
    logout() {
        sessionStorage.removeItem("adminLoggedIn");
        this.isLoggedIn = false;
        this.showLogin();
        App.showToast("Logged out successfully");
    },

    _confirmInline(triggerEl, label, onConfirm) {
        const actionsEl = triggerEl.closest('.admin-actions') || triggerEl.closest('.claim-actions') || triggerEl.parentElement;
        actionsEl.innerHTML =
            '<span class="confirm-prompt">' + label + '?</span>' +
            '<button class="btn btn-danger btn-sm adm-yes">Yes</button>' +
            '<button class="btn btn-secondary btn-sm adm-no">Cancel</button>';
        actionsEl.querySelector('.adm-yes').addEventListener('click', onConfirm);
        actionsEl.querySelector('.adm-no').addEventListener('click', () => this.renderCurrentTab());
    },

    // Show login screen
    showLogin() {
        document.getElementById("admin-login").style.display = "flex";
        document.getElementById("admin-dashboard").style.display = "none";

        // Clear form
        const loginForm = document.getElementById("admin-login-form");
        if (loginForm) loginForm.reset();
        document.getElementById("login-error").textContent = "";
    },

    // Show dashboard
    showDashboard() {
        document.getElementById("admin-login").style.display = "none";
        document.getElementById("admin-dashboard").style.display = "block";
    },

    // Setup tab switching with keyboard navigation
    setupTabs() {
        const tabButtons = document.querySelectorAll(".tab-button");
        const tabList = ["pending", "approved", "claims", "claimed", "lost-reports"];

        tabButtons.forEach((button) => {
            // Click handler
            button.addEventListener("click", (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.switchTab(tab);
            });

            // Keyboard navigation (arrow keys)
            button.addEventListener("keydown", (e) => {
                const currentTab = e.currentTarget.dataset.tab;
                const currentIndex = tabList.indexOf(currentTab);
                let newIndex;

                switch (e.key) {
                    case "ArrowRight":
                    case "ArrowDown":
                        e.preventDefault();
                        newIndex = (currentIndex + 1) % tabList.length;
                        this.focusTab(tabList[newIndex]);
                        break;
                    case "ArrowLeft":
                    case "ArrowUp":
                        e.preventDefault();
                        newIndex = (currentIndex - 1 + tabList.length) % tabList.length;
                        this.focusTab(tabList[newIndex]);
                        break;
                    case "Home":
                        e.preventDefault();
                        this.focusTab(tabList[0]);
                        break;
                    case "End":
                        e.preventDefault();
                        this.focusTab(tabList[tabList.length - 1]);
                        break;
                    case "Enter":
                    case " ":
                        e.preventDefault();
                        this.switchTab(currentTab);
                        break;
                }
            });
        });
    },

    // Focus a tab button
    focusTab(tabName) {
        const tabButton = document.querySelector(`[data-tab="${tabName}"]`);
        if (tabButton) {
            tabButton.focus();
        }
    },

    // Switch to a tab
    switchTab(tabName) {
        // Update button active state and ARIA attributes
        document.querySelectorAll(".tab-button").forEach((btn) => {
            btn.classList.remove("active");
            btn.setAttribute("aria-selected", "false");
            btn.setAttribute("tabindex", "-1");
        });
        const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
        activeBtn.classList.add("active");
        activeBtn.setAttribute("aria-selected", "true");
        activeBtn.setAttribute("tabindex", "0");

        // Update tab panes and hidden attribute for accessibility
        document.querySelectorAll(".tab-pane").forEach((pane) => {
            pane.classList.remove("active");
            pane.setAttribute("hidden", "");
        });
        const activePane = document.getElementById(`${tabName}-tab`);
        activePane.classList.add("active");
        activePane.removeAttribute("hidden");

        this.currentTab = tabName;
        this._pages[tabName] = 1;
        this.renderCurrentTab();
    },

    // Update badge counts
    updateCounts() {
        const stats = DataStore.getStats();
        document.getElementById("pending-count").textContent = stats.pending;
        document.getElementById("approved-count").textContent = stats.approved;
        document.getElementById("claims-count").textContent = stats.totalClaims;
        document.getElementById("claimed-count").textContent = stats.claimed;
        document.getElementById("lost-reports-count").textContent = stats.lostReports;
    },

    // Render current tab
    renderCurrentTab() {
        switch (this.currentTab) {
            case "pending":
                this.renderPendingItems();
                break;
            case "approved":
                this.renderApprovedItems();
                break;
            case "claims":
                this.renderClaims();
                break;
            case "claimed":
                this.renderClaimedItems();
                break;
            case "lost-reports":
                this.renderLostReports();
                break;
        }
    },

    // Render pending items
    renderPendingItems() {
        const items = DataStore.getItemsByStatus("pending");
        this.clampPage('pending', items.length);
        const current = this._pages.pending;
        const sliced = items.slice((current - 1) * this.PAGE_SIZE, current * this.PAGE_SIZE);
        const container = document.getElementById("pending-items");
        const empty = document.getElementById("pending-empty");
        container.innerHTML = "";
        if (items.length === 0) {
            container.style.display = "none";
            empty.style.display = "block";
        } else {
            container.style.display = "grid";
            empty.style.display = "none";
            sliced.forEach((item) => {
                container.appendChild(this.createAdminItemCard(item, "pending"));
            });
        }
        this.renderPagination('pending', items.length);
    },

    // Render approved items
    renderApprovedItems() {
        const items = DataStore.getItemsByStatus("approved");
        this.clampPage('approved', items.length);
        const current = this._pages.approved;
        const sliced = items.slice((current - 1) * this.PAGE_SIZE, current * this.PAGE_SIZE);
        const container = document.getElementById("approved-items");
        const empty = document.getElementById("approved-empty");
        container.innerHTML = "";
        if (items.length === 0) {
            container.style.display = "none";
            empty.style.display = "block";
        } else {
            container.style.display = "grid";
            empty.style.display = "none";
            sliced.forEach((item) => {
                container.appendChild(this.createAdminItemCard(item, "approved"));
            });
        }
        this.renderPagination('approved', items.length);
    },

    // Render claimed items
    renderClaimedItems() {
        const items = DataStore.getItemsByStatus("claimed");
        this.clampPage('claimed', items.length);
        const current = this._pages.claimed;
        const sliced = items.slice((current - 1) * this.PAGE_SIZE, current * this.PAGE_SIZE);
        const container = document.getElementById("claimed-items");
        const empty = document.getElementById("claimed-empty");
        container.innerHTML = "";
        if (items.length === 0) {
            container.style.display = "none";
            empty.style.display = "block";
        } else {
            container.style.display = "grid";
            empty.style.display = "none";
            sliced.forEach((item) => {
                container.appendChild(this.createAdminItemCard(item, "claimed"));
            });
        }
        this.renderPagination('claimed', items.length);
    },

    // Render claims
    renderClaims() {
        const claims = DataStore.getAllClaims();
        this.clampPage('claims', claims.length);
        const current = this._pages.claims;
        const sliced = claims.slice((current - 1) * this.PAGE_SIZE, current * this.PAGE_SIZE);
        const container = document.getElementById("claims-items");
        const empty = document.getElementById("claims-empty");
        container.innerHTML = "";
        if (claims.length === 0) {
            container.style.display = "none";
            empty.style.display = "block";
        } else {
            container.style.display = "block";
            empty.style.display = "none";
            sliced.forEach((claim) => {
                container.appendChild(this.createClaimCard(claim));
            });
        }
        this.renderPagination('claims', claims.length);
    },

    // Create admin item card
    createAdminItemCard(item, status) {
        const card = document.createElement("div");
        card.className = "admin-item-card";

        const categoryEmoji = App.getCategoryEmoji(item.category);
        const formattedDate = App.formatDate(item.dateFound);

        let actions = "";
        if (status === "pending") {
            actions = `
                <div class="admin-actions">
                    <button class="btn btn-success btn-sm" onclick="Admin.approveItem('${item.id}', this)">
                        ✓ Approve
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="Admin.deleteItem('${item.id}', this)">
                        ✕ Reject
                    </button>
                </div>
            `;
        } else if (status === "approved") {
            actions = `
                <div class="admin-actions">
                    <button class="btn btn-secondary btn-sm" onclick="Admin.unpublishItem('${item.id}', this)">
                        Unpublish
                    </button>
                </div>
            `;
        }

        card.innerHTML = `
            <div class="admin-item-image" style="background-image: url('${
            item.photoUrl
        }')">
                <span class="item-category-badge">${categoryEmoji} ${
            item.category
        }</span>
            </div>
            <div class="admin-item-content">
                <h3 class="admin-item-title">${this.escapeHtml(item.title)}</h3>
                <p class="admin-item-description">${this.escapeHtml(
            item.description
        )}</p>
                <div class="admin-item-meta">
                    <span><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> ${this.escapeHtml(item.locationFound)}</span>
                    <span><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> ${formattedDate}</span>
                </div>
                ${
            item.finderName
                ? `<p class="admin-finder">Found by: ${this.escapeHtml(
                    item.finderName
                )}</p>`
                : ""
        }
                ${actions}
            </div>
        `;

        return card;
    },

    // Create claim card
    createClaimCard(claim) {
        const card = document.createElement("div");
        card.className = "claim-card";

        const item = DataStore.getItemById(claim.itemId);
        const itemTitle = item ? item.title : "Unknown Item";
        const submittedDate = new Date(claim.submittedAt).toLocaleDateString();

        const statusBadge =
            claim.status === "pending"
                ? '<span class="status-badge status-pending">Pending</span>'
                : '<span class="status-badge status-approved">Approved</span>';

        card.innerHTML = `
            <div class="claim-header">
                <div>
                    <h4 class="claim-title">Claim for: ${this.escapeHtml(
            itemTitle
        )}</h4>
                    <p class="claim-date">Submitted: ${submittedDate}</p>
                </div>
                ${statusBadge}
            </div>
            <div class="claim-body">
                <p><strong>Claimant:</strong> ${this.escapeHtml(
            claim.claimantName
        )}</p>
                <p><strong>Contact:</strong> ${this.escapeHtml(
            claim.claimantContact
        )}</p>
                <p><strong>Reason:</strong> ${this.escapeHtml(
            claim.description
        )}</p>
            </div>
            ${
            claim.status === "pending"
                ? `
                <div class="claim-actions">
                    <button class="btn btn-success btn-sm" onclick="Admin.approveClaim('${claim.id}', this)">
                        Approve & Mark as Claimed
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="Admin.rejectClaim('${claim.id}', this)">
                        Reject
                    </button>
                </div>
            `
                : ""
        }
        `;

        return card;
    },

    // Approve item
    approveItem(itemId, triggerEl) {
        this._confirmInline(triggerEl, 'Approve this item', () => {
            DataStore.updateItemStatus(itemId, "approved");
            App.showToast("Item approved successfully");
            this.updateCounts();
            this.renderCurrentTab();
        });
    },

    // Unpublish item
    unpublishItem(itemId, triggerEl) {
        this._confirmInline(triggerEl, 'Unpublish this item', () => {
            DataStore.updateItemStatus(itemId, "pending");
            App.showToast("Item unpublished");
            this.updateCounts();
            this.renderCurrentTab();
        });
    },

    // Delete item
    deleteItem(itemId, triggerEl) {
        this._confirmInline(triggerEl, 'Delete this item permanently', () => {
            DataStore.deleteItem(itemId);
            App.showToast("Item deleted");
            this.updateCounts();
            this.renderCurrentTab();
        });
    },

    // Approve claim
    approveClaim(claimId, triggerEl) {
        this._confirmInline(triggerEl, 'Approve this claim', () => {
            DataStore.updateClaimStatus(claimId, "approved");
            App.showToast("Claim approved! Item marked as claimed.");
            this.updateCounts();
            this.renderCurrentTab();
        });
    },

    // Reject claim
    rejectClaim(claimId, triggerEl) {
        this._confirmInline(triggerEl, 'Reject this claim', () => {
            const claims = DataStore.getAllClaims();
            const filtered = claims.filter((c) => c.id !== claimId);
            localStorage.setItem(DataStore.CLAIMS_KEY, JSON.stringify(filtered));
            App.showToast("Claim rejected");
            this.updateCounts();
            this.renderCurrentTab();
        });
    },

    // Render lost item reports
    renderLostReports() {
        const reports = DataStore.getLostReports().slice().reverse();
        this.clampPage('lost-reports', reports.length);
        const current = this._pages['lost-reports'];
        const sliced = reports.slice((current - 1) * this.PAGE_SIZE, current * this.PAGE_SIZE);
        const container = document.getElementById("lost-reports-list");
        const empty = document.getElementById("lost-reports-empty");
        container.innerHTML = "";
        if (reports.length === 0) {
            container.style.display = "none";
            empty.style.display = "block";
        } else {
            container.style.display = "block";
            empty.style.display = "none";
            sliced.forEach((report) => {
                container.appendChild(this.createLostReportCard(report));
            });
        }
        this.renderPagination('lost-reports', reports.length);
    },

    // Create lost report card
    createLostReportCard(report) {
        const card = document.createElement("div");
        card.className = "claim-card";

        const submittedDate = new Date(report.submittedAt).toLocaleDateString();
        const emoji = App.getCategoryEmoji(report.category);
        const locationPart = report.locationLost ? " at " + this.escapeHtml(report.locationLost) : "";
        const datePart = report.dateLost ? App.formatDate(report.dateLost) + locationPart : null;

        card.innerHTML = `
            <div class="claim-header">
                <div>
                    <h4 class="claim-title">${emoji} ${this.escapeHtml(report.category)}</h4>
                    <p class="claim-date">Reported: ${submittedDate}</p>
                </div>
            </div>
            <div class="claim-body">
                <p><strong>Student:</strong> ${this.escapeHtml(report.name)}</p>
                <p><strong>Contact:</strong> ${this.escapeHtml(report.contact)}</p>
                <p><strong>Description:</strong> ${this.escapeHtml(report.description)}</p>
                ${datePart ? `<p><strong>Last seen:</strong> ${datePart}</p>` : ""}
            </div>
            <div class="claim-actions">
                <button class="btn btn-danger btn-sm" onclick="Admin.deleteLostReport('${report.id}', this)">Delete</button>
            </div>
        `;

        return card;
    },

    clampPage(tab, total) {
        const totalPages = Math.max(1, Math.ceil(total / this.PAGE_SIZE));
        if (this._pages[tab] > totalPages) this._pages[tab] = totalPages;
    },

    renderPagination(tab, total) {
        const container = document.getElementById(tab + '-pagination');
        if (!container) return;
        const current = this._pages[tab];
        const totalPages = Math.max(1, Math.ceil(total / this.PAGE_SIZE));
        if (totalPages <= 1) { container.innerHTML = ''; return; }
        container.innerHTML = `
            <div class="pagination">
                <span class="pagination-info">Page ${current} of ${totalPages}</span>
                <div class="pagination-controls">
                    <button class="page-btn" ${current <= 1 ? 'disabled' : ''} onclick="Admin.goPage('${tab}', ${current - 1})" aria-label="Previous page">← Prev</button>
                    <button class="page-btn" ${current >= totalPages ? 'disabled' : ''} onclick="Admin.goPage('${tab}', ${current + 1})" aria-label="Next page">Next →</button>
                </div>
            </div>
        `;
    },

    goPage(tab, page) {
        this._pages[tab] = page;
        this.renderCurrentTab();
    },

    deleteLostReport(reportId, triggerEl) {
        this._confirmInline(triggerEl, 'Delete this report', () => {
            DataStore.deleteLostReport(reportId);
            App.showToast('Report deleted');
            this.updateCounts();
            this.renderCurrentTab();
        });
    },

    // Escape HTML
    escapeHtml(text) {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    },
};

// Make Admin available globally
window.Admin = Admin;
