// Claim.js - Claim Item Form
// Handles item claim submissions


const Claim = {
    form: null,
    itemPreview: null,
    successScreen: null,
    currentItem: null,
    isSubmitting: false,
    COOLDOWN_KEY: 'spam-cooldown-claim',
    COOLDOWN_MS: 5 * 60 * 1000,
    _cooldownTimer: null,

    /**
     * Initializes the Claim page by referencing DOM elements, loading
     * the selected item, and setting up form event listeners.
     *
     * Preconditions:
     * - DOM contains elements with IDs: `claim-form` and `claim-item-preview`.
     * - `sessionStorage` may contain a `claimItemId`.
     * - `DataStore.getItemById`, `App.navigate`, and `App.showToast` are available.
     *
     * Postconditions:
     * - `this.form` and `this.itemPreview` are set.
     * - The selected item is loaded and displayed if available.
     * - Form submit and cancel events are attached.
     *
     * @returns {void}
     */
    init() {
        this.form = document.getElementById("claim-form");
        this.itemPreview = document.getElementById("claim-item-preview");
        this.successScreen = document.getElementById("claim-success-screen");

        this.displayErrors({});
        this.hideSuccessScreen();
        this.loadItem();
        this.setupForm();
        this.checkCooldown();
    },

    /**
     * Loads the item to be claimed from session storage and validates it.
     * Displays an error and hides the form if no valid item is selected.
     *
     * Preconditions:
     * - `sessionStorage` may contain `claimItemId`.
     * - `DataStore.getItemById` is available to fetch item details.
     *
     * Postconditions:
     * - `this.currentItem` is set if a valid item is found.
     * - The form is hidden and an error message is displayed if no item is found.
     * - Calls `renderItemPreview()` if the item is valid.
     *
     * @returns {void}
     */
    loadItem() {
        const itemId = sessionStorage.getItem("claimItemId");

        if (!itemId) {
            // No item selected, redirect to home
            this.itemPreview.innerHTML = `
                <div class="claim-error">
                    <p>No item selected. Please select an item from the browse page.</p>
                    <button class="btn btn-primary" onclick="App.navigate('home')">Go to Browse</button>
                </div>
            `;
            this.form.style.display = "none";
            return;
        }

        this.currentItem = DataStore.getItemById(itemId);

        if (!this.currentItem) {
            this.itemPreview.innerHTML = `
                <div class="claim-error">
                    <p>Item not found.</p>
                    <button class="btn btn-primary" onclick="App.navigate('home')">Go to Browse</button>
                </div>
            `;
            this.form.style.display = "none";
            return;
        }

        this.renderItemPreview();
    },

    /**
     * Renders a preview of the currently selected item in the Claim page.
     *
     * Preconditions:
     * - `this.currentItem` contains a valid item object.
     * - `this.itemPreview` references a valid DOM element.
     * - `App.getCategoryEmoji` and `App.formatDate` are available.
     *
     * Postconditions:
     * - The DOM inside `this.itemPreview` displays item details,
     *   including title, category, location, and date found.
     *
     * @returns {void}
     */
    renderItemPreview() {
        const item = this.currentItem;
        const categoryEmoji = App.getCategoryEmoji(item.category);
        const formattedDate = App.formatDate(item.dateFound);

        this.itemPreview.innerHTML = `
            <div class="claim-item">
                <div class="claim-item-image" style="background-image: url('${
            item.photoUrl
        }')"></div>
                <div class="claim-item-info">
                    <h3>${this.escapeHtml(item.title)}</h3>
                    <p class="claim-item-category">${categoryEmoji} ${
            item.category
        }</p>
                    <p class="claim-item-desc">${this.escapeHtml(item.description)}</p>
                    <p class="claim-item-meta">Found: ${formattedDate} at ${this.escapeHtml(
            item.locationFound
        )}</p>
                </div>
            </div>
        `;
    },

    /**
     * Attaches event listeners to the claim form for submission and
     * to the cancel button to navigate back to the Browse page.
     *
     * Preconditions:
     * - The form is not already initialized
     * - `this.form` references a valid form element.
     * - `cancelBtn` element exists with ID `cancel-claim`.
     * - `App.navigate` is available for page routing.
     *
     * Postconditions:
     * - The form submit event triggers `handleSubmit`.
     * - The cancel button navigates to the home page when clicked.
     *
     * @returns {void}
     */
    restoreDraft() {
        ["claimant-name", "claimant-contact", "claim-description"].forEach((id) => {
            const saved = sessionStorage.getItem("draft-" + id);
            if (saved) {
                const el = document.getElementById(id);
                if (el) el.value = saved;
            }
        });
    },

    saveDraft() {
        ["claimant-name", "claimant-contact", "claim-description"].forEach((id) => {
            const el = document.getElementById(id);
            if (el) sessionStorage.setItem("draft-" + id, el.value);
        });
    },

    clearDraft() {
        ["claimant-name", "claimant-contact", "claim-description"].forEach((id) => {
            sessionStorage.removeItem("draft-" + id);
        });
    },

    setupForm() {
        if (this.form.dataset.bound === "true") return;
        this.form.dataset.bound = "true";

        this.restoreDraft();

        this.form.addEventListener("input", () => this.saveDraft());

        this.form.addEventListener("submit", (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // Cancel button
        const cancelBtn = document.getElementById("cancel-claim");
        cancelBtn.addEventListener("click", () => {
            const id = sessionStorage.getItem("claimItemId");
            if (id) {
                App.navigate("item", id);
            } else {
                App.navigate("home");
            }
        });
    },

    /**
     * Handles form submission for claiming an item, including validation,
     * storing the claim in `DataStore`, clearing session storage, and
     * redirecting the user after a success message.
     *
     * Preconditions:
     * - `this.currentItem` is a valid item object.
     * - Form fields with IDs `claimant-name`, `claimant-contact`, and `claim-description` exist.
     * - `DataStore.addClaim` and `App.showToast` are available.
     *
     * Postconditions:
     * - Valid claims are saved to `DataStore`.
     * - `claimItemId` is removed from session storage.
     * - A success toast is displayed.
     * - The user is redirected to the home page after a short delay.
     *
     * @returns {void}
     */
    validateForm() {
        const errors = {};
        const name = document.getElementById("claimant-name").value;
        const contact = document.getElementById("claimant-contact").value;
        const description = document.getElementById("claim-description").value;

        if (!name.trim()) errors.name = "Your name is required";
        const contactTrimmed = contact.trim();
        if (!contactTrimmed) {
            errors.contact = "Contact info is required";
        } else if (!contactTrimmed.includes('@') && contactTrimmed.replace(/\D/g, '').length < 7) {
            errors.contact = "Enter an email address or phone number so we can reach you.";
        }
        const descError = App.validateField(description, { required: true, minLength: 10 });
        if (descError) errors.description = descError;

        return errors;
    },

    displayErrors(errors) {
        const fieldMap = {
            name:        { errorId: "name-error",      inputId: "claimant-name" },
            contact:     { errorId: "contact-error",   inputId: "claimant-contact" },
            description: { errorId: "claim-desc-error", inputId: "claim-description" },
        };

        Object.values(fieldMap).forEach(({ errorId, inputId }) => {
            const errorEl = document.getElementById(errorId);
            const inputEl = document.getElementById(inputId);
            if (errorEl) errorEl.textContent = "";
            if (inputEl) { inputEl.classList.remove("error"); inputEl.removeAttribute("aria-invalid"); }
        });

        Object.keys(errors).forEach((field) => {
            const map = fieldMap[field];
            if (!map) return;
            const errorEl = document.getElementById(map.errorId);
            const inputEl = document.getElementById(map.inputId);
            if (errorEl) errorEl.textContent = errors[field];
            if (inputEl) { inputEl.classList.add("error"); inputEl.setAttribute("aria-invalid", "true"); }
        });
    },

    handleSubmit() {
        if (this.isSubmitting) return;

        const errors = this.validateForm();
        if (Object.keys(errors).length > 0) {
            this.displayErrors(errors);
            const firstErrorId = Object.keys(errors)[0];
            const fieldMap = { name: "claimant-name", contact: "claimant-contact", description: "claim-description" };
            const firstEl = document.getElementById(fieldMap[firstErrorId]);
            if (firstEl) firstEl.focus();
            return;
        }

        this.displayErrors({});
        this.isSubmitting = true;

        const submitBtn = this.form.querySelector('[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.classList.add("btn--loading");
            submitBtn.textContent = "Submitting…";
        }

        const claim = {
            itemId: this.currentItem.id,
            itemTitle: this.currentItem.title,
            claimantName: document.getElementById("claimant-name").value.trim(),
            claimantContact: document.getElementById("claimant-contact").value.trim(),
            description: document.getElementById("claim-description").value.trim(),
        };

        DataStore.addClaim(claim);
        sessionStorage.removeItem("claimItemId");
        this.clearDraft();
        sessionStorage.setItem(this.COOLDOWN_KEY, String(Date.now() + this.COOLDOWN_MS));

        this.showSuccessScreen();
    },

    showSuccessScreen() {
        const itemEchoEl = document.getElementById("claim-item-echo");
        if (itemEchoEl && this.currentItem) {
            itemEchoEl.innerHTML = "For: <strong>" + this.escapeHtml(this.currentItem.title) + "</strong>";
        }
        const contact = document.getElementById("claimant-contact").value.trim();
        const echoEl = document.getElementById("claim-contact-echo");
        if (echoEl && contact) {
            echoEl.innerHTML = "We'll reach out to you at <strong>" + this.escapeHtml(contact) + "</strong>.";
        }
        const refEl = document.getElementById("claim-ref-id");
        if (refEl) {
            const id = "CLM-" + Date.now().toString(36).toUpperCase().slice(-6);
            refEl.textContent = "Reference: " + id;
        }
        this.form.closest(".form-card").style.display = "none";
        if (this.successScreen) this.successScreen.style.display = "flex";
    },

    hideSuccessScreen() {
        this.form.closest(".form-card").style.display = "block";
        if (this.successScreen) this.successScreen.style.display = "none";
    },

    checkCooldown() {
        if (this._cooldownTimer) { clearTimeout(this._cooldownTimer); this._cooldownTimer = null; }
        const until = parseInt(sessionStorage.getItem(this.COOLDOWN_KEY) || '0', 10);
        if (Date.now() < until) this._startCooldownTimer(until);
    },

    _startCooldownTimer(until) {
        const submitBtn = this.form ? this.form.querySelector('[type="submit"]') : null;
        const banner = document.getElementById('claim-cooldown');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.classList.remove("btn--loading");
            submitBtn.textContent = "Submit Claim";
        }
        if (banner) banner.hidden = false;
        const tick = () => {
            const remaining = until - Date.now();
            if (remaining <= 0) {
                if (submitBtn && !this.isSubmitting) submitBtn.disabled = false;
                if (banner) banner.hidden = true;
                this._cooldownTimer = null;
                return;
            }
            const m = Math.floor(remaining / 60000);
            const s = String(Math.floor((remaining % 60000) / 1000)).padStart(2, '0');
            if (banner) banner.textContent = `You've already submitted recently. Try again in ${m}:${s}.`;
            this._cooldownTimer = setTimeout(tick, 1000);
        };
        tick();
    },

    // Escape HTML
    escapeHtml(text) {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    },
};

// Make Claim available globally
window.Claim = Claim;
