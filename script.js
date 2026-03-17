/**
 * Hydron Applications — script.js
 * Smooth scroll, sticky nav, mobile menu, scroll-reveal,
 * form validation & Formspree submission handling.
 */

(function () {
  'use strict';

  /* ================================================================
     1. UTILITY HELPERS
  ================================================================ */

  /**
   * Throttle a function call to at most once per `delay` ms.
   * @param {Function} fn
   * @param {number} delay
   * @returns {Function}
   */
  function throttle(fn, delay) {
    var last = 0;
    return function () {
      var now = Date.now();
      if (now - last >= delay) {
        last = now;
        fn.apply(this, arguments);
      }
    };
  }

  /* ================================================================
     2. STICKY NAVIGATION & ACTIVE LINK HIGHLIGHTING
  ================================================================ */

  var header     = document.getElementById('site-header');
  var navLinks   = document.querySelectorAll('.nav-link:not(.nav-cta)');
  var sections   = document.querySelectorAll('main section[id]');

  /** Add / remove scrolled class on the header */
  function handleNavScroll() {
    if (!header) return;
    if (window.scrollY > 20) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  /** Highlight the nav link corresponding to the visible section */
  function updateActiveNavLink() {
    if (!sections.length || !navLinks.length) return;

    var scrollPos = window.scrollY + window.innerHeight * 0.35;
    var activeId  = '';

    sections.forEach(function (section) {
      if (section.offsetTop <= scrollPos) {
        activeId = section.getAttribute('id');
      }
    });

    navLinks.forEach(function (link) {
      var href = link.getAttribute('href');
      if (href && href === '#' + activeId) {
        link.classList.add('is-active');
      } else {
        link.classList.remove('is-active');
      }
    });
  }

  /* Run on scroll — throttled for performance */
  window.addEventListener('scroll', throttle(function () {
    handleNavScroll();
    updateActiveNavLink();
  }, 80), { passive: true });

  /* Run once on load */
  handleNavScroll();
  updateActiveNavLink();

  /* ================================================================
     3. MOBILE HAMBURGER MENU
  ================================================================ */

  var hamburger  = document.getElementById('hamburger');
  var navLinksList = document.getElementById('nav-links');

  if (hamburger && navLinksList) {

    hamburger.addEventListener('click', function () {
      var isOpen = navLinksList.classList.toggle('is-open');
      hamburger.classList.toggle('is-open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      /* Prevent body scroll when menu is open */
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    /* Close menu when any nav link is clicked */
    navLinksList.addEventListener('click', function (e) {
      if (e.target.matches('.nav-link')) {
        navLinksList.classList.remove('is-open');
        hamburger.classList.remove('is-open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });

    /* Close menu on Escape key */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navLinksList.classList.contains('is-open')) {
        navLinksList.classList.remove('is-open');
        hamburger.classList.remove('is-open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        hamburger.focus();
      }
    });

    /* Close menu if window is resized to desktop width */
    window.addEventListener('resize', throttle(function () {
      if (window.innerWidth > 768 && navLinksList.classList.contains('is-open')) {
        navLinksList.classList.remove('is-open');
        hamburger.classList.remove('is-open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    }, 200));
  }

  /* ================================================================
     4. SMOOTH SCROLL (for browsers that don't support CSS scroll-behavior)
  ================================================================ */

  document.addEventListener('click', function (e) {
    var anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;

    var targetId = anchor.getAttribute('href');
    if (targetId === '#') return;

    var target = document.querySelector(targetId);
    if (!target) return;

    e.preventDefault();

    var navHeight = header ? header.offsetHeight : 0;
    var targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight;

    window.scrollTo({ top: targetTop, behavior: 'smooth' });
  });

  /* ================================================================
     5. SCROLL-REVEAL ANIMATIONS (IntersectionObserver)
  ================================================================ */

  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -40px 0px'
    });

    document.querySelectorAll('.reveal-up').forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    /* Fallback: make all reveal elements immediately visible */
    document.querySelectorAll('.reveal-up').forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  /* ================================================================
     6. HERO PARTICLE ANIMATION
  ================================================================ */

  var particleContainer = document.getElementById('hero-particles');

  if (particleContainer) {
    var PARTICLE_COUNT = 18;

    function createParticle() {
      var p = document.createElement('span');
      p.className = 'particle';

      /* Random properties */
      var size     = Math.random() * 3 + 1.5;       /* 1.5–4.5px */
      var duration = Math.random() * 12 + 10;        /* 10–22s */
      var delay    = Math.random() * 15;              /* 0–15s start delay */
      var leftPct  = Math.random() * 100;             /* 0–100% horizontal */
      var opacity  = Math.random() * 0.4 + 0.15;     /* 0.15–0.55 max opacity */

      p.style.cssText = [
        'width:'    + size + 'px',
        'height:'   + size + 'px',
        'left:'     + leftPct + '%',
        'bottom: -10px',
        'opacity: 0',
        'animation-duration:'        + duration + 's',
        'animation-delay:'           + delay    + 's',
        'filter: blur(' + (size * 0.3) + 'px)',
        '--max-opacity:' + opacity
      ].join(';');

      particleContainer.appendChild(p);
    }

    /* Respect prefers-reduced-motion */
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion) {
      for (var i = 0; i < PARTICLE_COUNT; i++) {
        createParticle();
      }
    }
  }

  /* ================================================================
     7. CONTACT FORM — VALIDATION & FORMSPREE SUBMISSION
  ================================================================ */

  var form        = document.getElementById('contact-form');
  var submitBtn   = document.getElementById('form-submit');
  var successMsg  = document.getElementById('form-success');
  var errorMsg    = document.getElementById('form-error');

  if (form) {

    /* ── 7a. Field validation helpers ──────────────────────────── */

    var validators = {
      'form-name': function (val) {
        if (!val.trim()) return 'Please enter your name.';
        if (val.trim().length < 2) return 'Name must be at least 2 characters.';
        return '';
      },
      'form-email': function (val) {
        if (!val.trim()) return 'Please enter your email address.';
        /* Basic RFC-ish email regex */
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val.trim())) {
          return 'Please enter a valid email address.';
        }
        return '';
      },
      'form-project-type': function (val) {
        if (!val) return 'Please select a project type.';
        return '';
      },
      'form-message': function (val) {
        if (!val.trim()) return 'Please tell me a little about your project.';
        if (val.trim().length < 20) return 'Please add a bit more detail (at least 20 characters).';
        return '';
      }
    };

    /**
     * Validate a single field and display / clear its error message.
     * @param {HTMLElement} field
     * @returns {boolean} isValid
     */
    function validateField(field) {
      var id        = field.id;
      var errorEl   = document.getElementById('error-' + id.replace('form-', ''));
      var validator = validators[id];
      if (!validator || !errorEl) return true;

      var message = validator(field.value);
      errorEl.textContent = message;
      field.classList.toggle('is-invalid', message !== '');
      return message === '';
    }

    /**
     * Validate all required fields.
     * @returns {boolean}
     */
    function validateAll() {
      var isValid = true;
      Object.keys(validators).forEach(function (id) {
        var field = document.getElementById(id);
        if (field && !validateField(field)) {
          isValid = false;
        }
      });
      return isValid;
    }

    /* ── 7b. Live validation on blur ───────────────────────────── */

    Object.keys(validators).forEach(function (id) {
      var field = document.getElementById(id);
      if (field) {
        field.addEventListener('blur', function () {
          validateField(field);
        });

        /* Clear error on input once the user starts correcting */
        field.addEventListener('input', function () {
          var errorEl = document.getElementById('error-' + id.replace('form-', ''));
          if (field.classList.contains('is-invalid')) {
            validateField(field);
          }
          if (errorEl && !field.classList.contains('is-invalid')) {
            errorEl.textContent = '';
          }
        });
      }
    });

    /* ── 7c. Form submission ───────────────────────────────────── */

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      /* Run validation */
      if (!validateAll()) {
        /* Focus the first invalid field */
        var firstInvalid = form.querySelector('.is-invalid');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      /* Hide any previous status messages */
      if (successMsg) successMsg.hidden = true;
      if (errorMsg)   errorMsg.hidden   = true;

      /* Show loading state */
      if (submitBtn) {
        submitBtn.classList.add('is-loading');
        submitBtn.disabled = true;
      }

      var formData = new FormData(form);

      /*
       * Submit to Formspree.
       * Replace "YOUR_FORM_ID" in the form action attribute (index.html) with
       * your actual Formspree form ID before deploying.
       */
      fetch(form.action, {
        method:  'POST',
        body:    formData,
        headers: { 'Accept': 'application/json' }
      })
      .then(function (response) {
        if (response.ok) {
          /* Success */
          form.reset();
          /* Clear all invalid states */
          form.querySelectorAll('.is-invalid').forEach(function (el) {
            el.classList.remove('is-invalid');
          });
          form.querySelectorAll('.field-error').forEach(function (el) {
            el.textContent = '';
          });
          if (successMsg) successMsg.hidden = false;
          /* Scroll the success message into view */
          if (successMsg) {
            successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        } else {
          return response.json().then(function (data) {
            throw new Error(data.error || 'Server error');
          });
        }
      })
      .catch(function () {
        if (errorMsg) errorMsg.hidden = false;
        if (errorMsg) {
          errorMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      })
      .finally(function () {
        if (submitBtn) {
          submitBtn.classList.remove('is-loading');
          submitBtn.disabled = false;
        }
      });
    });
  }

})();
