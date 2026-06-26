// Lost.js - Report Lost Item Form
// Handles lost item report submissions

const Lost = {
    form: null,
    successScreen: null,
    COOLDOWN_KEY: 'spam-cooldown-lost',
    COOLDOWN_MS: 5 * 60 * 1000,
    _cooldownTimer: null,

    init() {
        this.form = document.getElementById("lost-form");
        this.successScreen = document.getElementById("lost-success-screen");
        this.displayErrors({});
        this.hideSuccessScreen();
        this.populateCategoryDropdown();
        this.setDefaultDate();
        this.setupForm();
        this.checkCooldown();
    },

    populateCategoryDropdown() {
        const select = document.getElementById("lost-category");
        if (!select) return;
        select.innerHTML = '<option value="">Select a category</option>';
        DataStore.categories.forEach(function (cat) {
            const opt = document.createElement("option");
            opt.value = cat;
            opt.textContent = cat;
            select.appendChild(opt);
        });
    },

    setDefaultDate() {
        const dateInput = document.getElementById("lost-date");
        if (!dateInput) return;
        const today = new Date().toISOString().split("T")[0];
        dateInput.value = today;
        dateInput.max = today;
    },

    validateForm() {
        const errors = {};
        const name = document.getElementById("lost-name").value;
        const contact = document.getElementById("lost-contact").value;
        const category = document.getElementById("lost-category").value;
        const description = document.getElementById("lost-description").value;

        if (!name.trim()) errors.name = "Your name is required";
        const contactTrimmed = contact.trim();
        if (!contactTrimmed) {
            errors.contact = "Contact info is required";
        } else if (!contactTrimmed.includes('@') && contactTrimmed.replace(/\D/g, '').length < 7) {
            errors.contact = "Enter an email address or phone number so we can reach you.";
        }
        if (!category) errors.category = "Please select a category";
        const descError = App.validateField(description, { required: true, minLength: 10 });
        if (descError) errors.description = descError;

        return errors;
    },

    displayErrors(errors) {
        const fieldMap = {
            name:        { errorId: "lost-name-error",     inputId: "lost-name" },
            contact:     { errorId: "lost-contact-error",  inputId: "lost-contact" },
            category:    { errorId: "lost-category-error", inputId: "lost-category" },
            description: { errorId: "lost-desc-error",     inputId: "lost-description" },
        };

        Object.values(fieldMap).forEach(function ({ errorId, inputId }) {
            const errorEl = document.getElementById(errorId);
            const inputEl = document.getElementById(inputId);
            if (errorEl) errorEl.textContent = "";
            if (inputEl) { inputEl.classList.remove("error"); inputEl.removeAttribute("aria-invalid"); }
        });

        Object.keys(errors).forEach(function (field) {
            const map = fieldMap[field];
            if (!map) return;
            const errorEl = document.getElementById(map.errorId);
            const inputEl = document.getElementById(map.inputId);
            if (errorEl) errorEl.textContent = errors[field];
            if (inputEl) { inputEl.classList.add("error"); inputEl.setAttribute("aria-invalid", "true"); }
        });
    },

    restoreDraft() {
        ["lost-name", "lost-contact", "lost-description", "lost-date", "lost-location"].forEach(function (id) {
            var saved = sessionStorage.getItem("draft-" + id);
            if (saved) {
                var el = document.getElementById(id);
                if (el) el.value = saved;
            }
        });
    },

    saveDraft() {
        ["lost-name", "lost-contact", "lost-description", "lost-date", "lost-location"].forEach(function (id) {
            var el = document.getElementById(id);
            if (el) sessionStorage.setItem("draft-" + id, el.value);
        });
    },

    clearDraft() {
        ["lost-name", "lost-contact", "lost-description", "lost-date", "lost-location"].forEach(function (id) {
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
    },

    handleSubmit() {
        const errors = this.validateForm();
        if (Object.keys(errors).length > 0) {
            this.displayErrors(errors);
            const firstField = Object.keys(errors)[0];
            const fieldIdMap = {
                name: "lost-name",
                contact: "lost-contact",
                category: "lost-category",
                description: "lost-description",
            };
            const firstEl = document.getElementById(fieldIdMap[firstField]);
            if (firstEl) firstEl.focus();
            return;
        }

        this.displayErrors({});

        const report = {
            name: document.getElementById("lost-name").value.trim(),
            contact: document.getElementById("lost-contact").value.trim(),
            category: document.getElementById("lost-category").value,
            description: document.getElementById("lost-description").value.trim(),
            dateLost: document.getElementById("lost-date").value || null,
            locationLost: document.getElementById("lost-location").value.trim() || null,
        };

        DataStore.addLostReport(report);
        this.clearDraft();
        sessionStorage.setItem(this.COOLDOWN_KEY, String(Date.now() + this.COOLDOWN_MS));
        this.showSuccessScreen();
    },

    checkCooldown() {
        if (this._cooldownTimer) { clearTimeout(this._cooldownTimer); this._cooldownTimer = null; }
        const until = parseInt(sessionStorage.getItem(this.COOLDOWN_KEY) || '0', 10);
        if (Date.now() < until) this._startCooldownTimer(until);
    },

    _startCooldownTimer(until) {
        const submitBtn = this.form ? this.form.querySelector('[type="submit"]') : null;
        const banner = document.getElementById('lost-cooldown');
        if (submitBtn) submitBtn.disabled = true;
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

    showSuccessScreen() {
        const contact = document.getElementById("lost-contact").value.trim();
        const echoEl = document.getElementById("lost-contact-echo");
        if (echoEl && contact) {
            const safe = contact.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
            echoEl.innerHTML = "We'll reach out to you at <strong>" + safe + "</strong> if a match is found.";
        }
        const refEl = document.getElementById("lost-ref-id");
        if (refEl) {
            const id = "LST-" + Date.now().toString(36).toUpperCase().slice(-6);
            refEl.textContent = "Reference: " + id;
        }
        this.form.closest(".form-card").style.display = "none";
        if (this.successScreen) this.successScreen.style.display = "flex";
    },

    hideSuccessScreen() {
        this.form.closest(".form-card").style.display = "block";
        if (this.successScreen) this.successScreen.style.display = "none";
    },
};

window.Lost = Lost;
