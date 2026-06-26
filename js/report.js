// Report.js - Report Found Item Form
// Handles form submission, validation, and success screen


const Report = {
  form: null,
  successScreen: null,
  isSubmitting: false,
  COOLDOWN_KEY: 'spam-cooldown-report',
  COOLDOWN_MS: 5 * 60 * 1000,
  _cooldownTimer: null,

  /**
   * Initializes the report form module.
   *
   * Preconditions:
   * - DOM contains elements with IDs `report-form` and `success-screen`.
   * - DOM contains category select element with ID `item-category`.
   * - DOM contains date input element with ID `item-date`.
   *
   * Postconditions:
   * - Form is ready for user input.
   * - Success screen is hidden.
   * - Category dropdown is populated.
   * - Default date is set to today.
   *
   * @returns {void}
   */
  init() {
    this.form = document.getElementById("report-form");
    this.successScreen = document.getElementById("success-screen");

    this.setupForm();
    this.populateCategoryDropdown();
    this.setDefaultDate();
    this.hideSuccessScreen();
    this.checkCooldown();
  },

  /**
   * Populates the category dropdown with categories from DataStore.
   *
   * Preconditions:
   * - DOM contains a select element with ID `item-category`.
   * - DataStore.categories is defined and an array of strings.
   *
   * Postconditions:
   * - Category dropdown contains an option for each DataStore category.
   *
   * @returns {void}
   */
  populateCategoryDropdown() {
    const categorySelect = document.getElementById("item-category");

    categorySelect.innerHTML = '<option value="">Select a category</option>';

    DataStore.categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      categorySelect.appendChild(option);
    });
  },

  /**
   * Sets the default value of the date input to today's date.
   *
   * Preconditions:
   * - DOM contains input element with ID `item-date`.
   *
   * Postconditions:
   * - Date input value is set to today.
   * - Future dates are disabled (max attribute set to today).
   *
   * @returns {void}
   */
  setDefaultDate() {
    const dateInput = document.getElementById("item-date");
    const today = new Date().toISOString().split("T")[0];
    dateInput.value = today;
    dateInput.max = today; // Can't select future dates
  },

  /**
   * Sets up form input event listeners and form submission handling.
   *
   * Preconditions:
   * - DOM contains form with ID `report-form`.
   * - DOM contains description input `item-description` and counter `description-count`.
   * - Submit button exists with ID `submit-btn`.
   *
   * Postconditions:
   * - Description input updates character count dynamically.
   * - Form submission triggers handleSubmit().
   *
   * @returns {void}
   */
  setupForm() {
    // Character counter for description
    const descriptionInput = document.getElementById("item-description");
    const charCount = document.getElementById("description-count");

    descriptionInput.addEventListener("input", (e) => {
      charCount.textContent = `${e.target.value.length} characters`;
    });

    // Photo preview
    const photoInput = document.getElementById("item-photo");
    const previewWrap = document.getElementById("photo-preview-wrap");
    photoInput.addEventListener("change", () => {
      const file = photoInput.files[0];
      if (!file || !file.type.startsWith("image/")) {
        previewWrap.innerHTML = "";
        return;
      }
      const img = document.createElement("img");
      img.className = "photo-preview visible";
      img.alt = "Selected photo preview";
      const reader = new FileReader();
      reader.onload = (e) => { img.src = e.target.result; };
      reader.readAsDataURL(file);
      previewWrap.innerHTML = "";
      previewWrap.appendChild(img);
    });

    // Form submission
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleSubmit();
    });
  },

  /**
   * Validates the report form fields.
   *
   * Preconditions:
   * - DOM elements for title, description, category, location, and date exist.
   *
   * Postconditions:
   * - Returns an object mapping invalid field names to error messages.
   * - Does not modify the DOM.
   *
   * @returns {Object} errors - Field names mapped to error messages.
   */
  validateForm() {
    const errors = {};

    const title = document.getElementById("item-title").value;
    const description = document.getElementById("item-description").value;
    const category = document.getElementById("item-category").value;
    const location = document.getElementById("item-location").value;
    const date = document.getElementById("item-date").value;

    // Title validation
    const titleError = App.validateField(title, {
      required: true,
      minLength: 3,
    });
    if (titleError) errors.title = titleError;

    // Description validation
    const descError = App.validateField(description, {
      required: true,
      minLength: 10,
    });
    if (descError) errors.description = descError;

    // Category validation
    if (!category) errors.category = "Please select a category";

    // Location validation
    const locError = App.validateField(location, { required: true });
    if (locError) errors.location = locError;

    // Date validation
    if (!date) errors.date = "Please select a date";

    // Photo file validation (optional)
    // File uploads are always valid if selected, no URL validation needed

    return errors;
  },

  /**
   * Displays validation errors on the form.
   *
   * Preconditions:
   * - `errors` is an object mapping field names to error strings.
   * - DOM contains error message elements with IDs matching `{field}-error`.
   *
   * Postconditions:
   * - Error messages are displayed in the DOM.
   * - Input fields with errors receive the 'error' CSS class.
   *
   * @param {Object} errors - Object mapping field names to error messages.
   * @returns {void}
   */
  displayErrors(errors) {
    // Clear all previous errors
    document
      .querySelectorAll(".error-message")
      .forEach((el) => (el.textContent = ""));
    document
      .querySelectorAll(".form-input, .form-textarea, .form-select")
      .forEach((el) => {
        el.classList.remove("error");
      });

    // Display new errors
    Object.keys(errors).forEach((field) => {
      const errorElement = document.getElementById(`${field}-error`);
      if (errorElement) {
        errorElement.textContent = errors[field];
      }

      const inputElement = document.getElementById(`item-${field}`);
      if (inputElement) {
        inputElement.classList.add("error");
      }
    });
  },

  /**
   * Handles form submission.
   *
   * Preconditions:
   * - Form inputs are filled by the user.
   * - validateForm() can be called to check inputs.
   *
   * Postconditions:
   * - If invalid, errors are displayed and submission stops.
   * - If valid, form data is prepared for submission (calls submitFormData).
   * - Submit button is disabled and shows "Submitting...".
   *
   * @returns {void}
   */
  handleSubmit() {
    if (this.isSubmitting) return;

    // Validate
    const errors = this.validateForm();
    if (Object.keys(errors).length > 0) {
      this.displayErrors(errors);
      return;
    }

    // Clear errors
    this.displayErrors({});

    // Submit
    this.isSubmitting = true;
    const submitBtn = document.getElementById("submit-btn");
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";

    // Check if there's a photo file to upload
    const photoInput = document.getElementById("item-photo");
    const photoFile = photoInput.files[0];

    if (photoFile) {
      // Read the file and convert to base64
      const reader = new FileReader();
      reader.onload = (e) => {
        this.submitFormData(e.target.result, submitBtn);
      };
      reader.readAsDataURL(photoFile);
    } else {
      // No photo uploaded, use default
      this.submitFormData(
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
        submitBtn
      );
    }
  },

  /**
   * Submits the form data to DataStore.
   *
   * Preconditions:
   * - `photoUrl` is a string (URL or base64).
   * - `submitBtn` is a valid HTML button element.
   * - DOM elements exist for all form fields.
   *
   * Postconditions:
   * - Adds a new item to DataStore.
   * - Shows success screen.
   * - Resets the form fields and default date.
   * - Re-enables the submit button.
   * - Redirects to home page after 3 seconds.
   *
   * @param {string} photoUrl - URL or base64 string for the item photo.
   * @param {HTMLButtonElement} submitBtn - Button element for toggling disabled state.
   * @returns {void}
   */
  submitFormData(photoUrl, submitBtn) {
    const formData = {
      title: document.getElementById("item-title").value,
      description: document.getElementById("item-description").value,
      category: document.getElementById("item-category").value,
      locationFound: document.getElementById("item-location").value,
      dateFound: document.getElementById("item-date").value,
      photoUrl: photoUrl,
      finderName: document.getElementById("finder-name").value || null,
      finderContact: document.getElementById("finder-contact").value || null,
    };

    // Simulate async operation
    setTimeout(() => {
      // Add to data store
      DataStore.addItem(formData);
      sessionStorage.setItem(this.COOLDOWN_KEY, String(Date.now() + this.COOLDOWN_MS));

      // Show success screen
      this.showSuccessScreen();

      // Reset form
      this.form.reset();
      this.setDefaultDate();

      // Reset button
      submitBtn.disabled = false;
      submitBtn.innerHTML =
        '<span>Submit Found Item</span><span class="btn-icon">→</span>';
      this.isSubmitting = false;
    }, 500);
  },

  showSuccessScreen() {
    const refEl = document.getElementById("report-ref-id");
    if (refEl) {
      const id = "RPT-" + Date.now().toString(36).toUpperCase().slice(-6);
      refEl.textContent = "Reference: " + id;
    }
    // Clear photo preview on success
    const previewWrap = document.getElementById("photo-preview-wrap");
    if (previewWrap) previewWrap.innerHTML = "";
    this.form.parentElement.style.display = "none";
    this.successScreen.style.display = "flex";
  },

  checkCooldown() {
    if (this._cooldownTimer) { clearTimeout(this._cooldownTimer); this._cooldownTimer = null; }
    const until = parseInt(sessionStorage.getItem(this.COOLDOWN_KEY) || '0', 10);
    if (Date.now() < until) this._startCooldownTimer(until);
  },

  _startCooldownTimer(until) {
    const submitBtn = document.getElementById('submit-btn');
    const banner = document.getElementById('report-cooldown');
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

  // Hide success screen
  hideSuccessScreen() {
    this.form.parentElement.style.display = "block";
    this.successScreen.style.display = "none";
  },
};

// Make Report available globally
window.Report = Report;
