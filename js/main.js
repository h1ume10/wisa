(function () {
  "use strict";

  function initMobileMenu() {
    var toggle = document.getElementById("mobile-menu-toggle");
    var menu = document.getElementById("mobile-menu");
    var iconOpen = document.getElementById("icon-menu-open");
    var iconClose = document.getElementById("icon-menu-close");

    if (!toggle || !menu) return;

    var closeTimer = null;

    function setOpen(isOpen) {
      toggle.setAttribute("aria-expanded", String(isOpen));
      if (iconOpen) iconOpen.hidden = isOpen;
      if (iconClose) iconClose.hidden = !isOpen;

      if (closeTimer) {
        clearTimeout(closeTimer);
        closeTimer = null;
      }

      var prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (isOpen) {
        menu.classList.remove("hidden");
        requestAnimationFrame(function () {
          menu.classList.add("mobile-menu-open");
        });
      } else {
        menu.classList.remove("mobile-menu-open");
        if (prefersReducedMotion) {
          menu.classList.add("hidden");
        } else {
          closeTimer = setTimeout(function () {
            menu.classList.add("hidden");
          }, 200);
        }
      }
    }

    toggle.addEventListener("click", function () {
      var isOpen = toggle.getAttribute("aria-expanded") === "true";
      setOpen(!isOpen);
    });

    menu.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        setOpen(false);
        toggle.focus();
      }
    });

    menu.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        setOpen(false);
      }
    });
  }

  function initRippleEffect() {
    var prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    var surfaces = document.querySelectorAll(
      ".btn-primary, .btn-secondary, .btn-on-navy, a.section-card"
    );

    surfaces.forEach(function (surface) {
      surface.addEventListener("pointerdown", function (event) {
        var rect = surface.getBoundingClientRect();
        var diameter = Math.max(rect.width, rect.height) * 2;
        var radius = diameter / 2;

        var ripple = document.createElement("span");
        ripple.className = "ripple";
        ripple.style.width = diameter + "px";
        ripple.style.height = diameter + "px";
        ripple.style.left = event.clientX - rect.left - radius + "px";
        ripple.style.top = event.clientY - rect.top - radius + "px";

        surface.appendChild(ripple);
        ripple.addEventListener("animationend", function () {
          ripple.remove();
        });
      });
    });
  }

  function initBioToggles() {
    var toggles = document.querySelectorAll("[data-bio-toggle]");

    toggles.forEach(function (button) {
      var text = document.getElementById(button.getAttribute("aria-controls"));
      if (!text) return;

      button.addEventListener("click", function () {
        var isExpanded = button.getAttribute("aria-expanded") === "true";
        var next = !isExpanded;
        text.classList.toggle("line-clamp-4", !next);
        button.setAttribute("aria-expanded", String(next));
        button.textContent = next ? "Read less" : "Read more";
      });
    });
  }

  function initSmoothScroll() {
    var prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    document.addEventListener("click", function (event) {
      var link = event.target.closest('a[href^="#"]');
      if (!link) return;

      var targetId = link.getAttribute("href").slice(1);
      if (!targetId) return;

      var target = document.getElementById(targetId);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start"
      });

      if (!target.hasAttribute("tabindex")) {
        target.setAttribute("tabindex", "-1");
      }
      target.focus({ preventScroll: true });
    });
  }

  function initContactForm() {
    var form = document.getElementById("contact-form");
    if (!form) return;

    var statusBox = document.getElementById("form-status");
    var submitButton = document.getElementById("contact-submit");
    var submitButtonDefaultText = submitButton ? submitButton.textContent : "";

    var fields = {
      name: {
        el: document.getElementById("name"),
        errorEl: document.getElementById("name-error"),
        validate: function (value) {
          return value.trim().length > 0 ? "" : "Please enter your name.";
        }
      },
      email: {
        el: document.getElementById("email"),
        errorEl: document.getElementById("email-error"),
        validate: function (value) {
          var trimmed = value.trim();
          if (!trimmed) return "Please enter your email address.";
          var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailPattern.test(trimmed)
            ? ""
            : "Please enter a valid email address, like name@example.com.";
        }
      },
      phone: {
        el: document.getElementById("phone"),
        errorEl: document.getElementById("phone-error"),
        validate: function (value) {
          var trimmed = value.trim();
          if (!trimmed) return ""; // optional field
          var phonePattern = /^[0-9+()\-\s]{7,}$/;
          return phonePattern.test(trimmed)
            ? ""
            : "Please enter a valid phone number, or leave this field blank.";
        }
      },
      message: {
        el: document.getElementById("message"),
        errorEl: document.getElementById("message-error"),
        validate: function (value) {
          return value.trim().length > 0 ? "" : "Please enter a message.";
        }
      }
    };

    function showFieldError(field, message) {
      if (!field.el || !field.errorEl) return;
      if (message) {
        field.el.setAttribute("aria-invalid", "true");
        field.errorEl.textContent = message;
        field.errorEl.hidden = false;
      } else {
        field.el.removeAttribute("aria-invalid");
        field.errorEl.textContent = "";
        field.errorEl.hidden = true;
      }
    }

    function validateField(key) {
      var field = fields[key];
      var message = field.validate(field.el.value);
      showFieldError(field, message);
      return message === "";
    }

    Object.keys(fields).forEach(function (key) {
      var field = fields[key];
      if (!field.el) return;
      field.el.addEventListener("blur", function () {
        validateField(key);
      });
    });

    function showStatus(kind, message) {
      if (!statusBox) return;
      statusBox.classList.remove("hidden");
      statusBox.textContent = message;
      statusBox.classList.remove(
        "border-red-600", "bg-red-50", "text-red-700",
        "border-green-600", "bg-green-50", "text-green-700"
      );
      if (kind === "success") {
        statusBox.classList.add("border-green-600", "bg-green-50", "text-green-700");
      } else {
        statusBox.classList.add("border-red-600", "bg-red-50", "text-red-700");
      }
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var firstInvalidField = null;
      var allValid = Object.keys(fields).every(function (key) {
        var isValid = validateField(key);
        if (!isValid && !firstInvalidField) {
          firstInvalidField = fields[key].el;
        }
        return isValid;
      });

      if (!allValid) {
        if (firstInvalidField) firstInvalidField.focus();
        showStatus("error", "Please fix the highlighted fields below and try again.");
        return;
      }

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.setAttribute("aria-busy", "true");
        submitButton.textContent = "Sending…";
      }

      fetch(form.getAttribute("action"), {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form)
      })
        .then(function (response) {
          return response
            .json()
            .catch(function () {
              return {
                success: false,
                message: "Something went wrong sending your message. Please call or email us instead."
              };
            })
            .then(function (data) {
              return { ok: response.ok, data: data };
            });
        })
        .then(function (result) {
          if (result.ok && result.data && result.data.success) {
            showStatus(
              "success",
              result.data.message || "Thank you. Your message has been sent."
            );
            form.reset();
          } else {
            showStatus(
              "error",
              (result.data && result.data.message) ||
                "Something went wrong sending your message. Please call or email us instead."
            );
          }
        })
        .catch(function () {
          showStatus(
            "error",
            "We could not reach the server. Please check your connection, or call or email us instead."
          );
        })
        .finally(function () {
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.removeAttribute("aria-busy");
            submitButton.textContent = submitButtonDefaultText;
          }
        });
    });
  }

  function initServiceEnquiryPrefill() {
    var form = document.getElementById("contact-form");
    if (!form) return;

    var params = new URLSearchParams(window.location.search);
    var service = params.get("service");
    if (!service) return;

    var SERVICES = {
      "content-development": {
        label: "Content Development",
        message:
          "I'm interested in your Content Development services and would like to discuss developing investigation-related material for our organisation."
      },
      advisory: {
        label: "Advisory",
        message:
          "I'm interested in your Advisory services and would like help preparing our organisation for a workplace investigation."
      },
      training: {
        label: "Training",
        message:
          "I'm interested in your Training programmes and would like more information about running training for our organisation."
      },
      consulting: {
        label: "Consulting",
        message:
          "I'm interested in your Consulting services and would like to discuss an on-site workplace investigation."
      }
    };

    var match = SERVICES[service];
    if (!match) return;

    var nameField = document.getElementById("name");
    var messageField = document.getElementById("message");
    var note = document.getElementById("inquiry-note");

    if (messageField && !messageField.value.trim()) {
      messageField.value = match.message;
    }

    if (note) {
      note.textContent =
        "You're enquiring about " + match.label + ". Feel free to edit the message below before sending.";
      note.classList.remove("hidden");
    }

    if (nameField) {
      var prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      window.setTimeout(function () {
        nameField.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "center"
        });
        nameField.focus({ preventScroll: true });
      }, 50);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMobileMenu();
    initRippleEffect();
    initBioToggles();
    initServiceEnquiryPrefill();
    initSmoothScroll();
    initContactForm();
  });
})();
