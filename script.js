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

  var form            = document.getElementById('contact-form');
  var submitBtn       = document.getElementById('form-submit');
  var statusContainer = document.getElementById('form-status-container');

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

      /* Clear any previous status messages */
      if (statusContainer) statusContainer.innerHTML = '';

      /* Show loading state */
      if (submitBtn) {
        submitBtn.classList.add('is-loading');
        submitBtn.disabled = true;
      }

      var formData = new FormData(form);

      /*
       * Submit to Formspree.
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
          /* Hide the form and show thank you message */
          form.style.display = 'none';
          if (statusContainer) {
            statusContainer.innerHTML =
              '<div class="form-thankyou" role="status">' +
                '<h3>Thank you!</h3>' +
                '<p>Your message has been sent. I\'ll be in touch shortly.</p>' +
              '</div>';
            statusContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        } else {
          return response.json().then(function (data) {
            throw new Error(data.error || 'Server error');
          });
        }
      })
      .catch(function () {
        if (statusContainer) {
          statusContainer.innerHTML =
            '<div class="form-status form-status--error" role="alert">' +
              '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>' +
              '<div>' +
                '<strong>Something went wrong.</strong>' +
                '<p>Please try again or email directly at <a href="mailto:zacbartleywork@gmail.com">zacbartleywork@gmail.com</a>.</p>' +
              '</div>' +
            '</div>';
          statusContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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

  /* ================================================================
     8. PROCESS SECTION — NODE GRAPH ANIMATION
     Draws animated nodes with connecting lines behind the process steps.
     Uses Canvas 2D + requestAnimationFrame. Respects prefers-reduced-motion.
  ================================================================ */

  (function initProcessCanvas() {
    var canvas = document.getElementById('process-canvas');
    if (!canvas) return;

    /* Skip animation if user prefers reduced motion */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var ctx = canvas.getContext('2d');
    var animId;
    var nodes = [];
    var NODE_COUNT = 28;
    var CONNECTION_DIST = 160;  /* max px distance to draw a connection line */
    var CONNECTION_MAX_ALPHA = 0.25; /* max opacity for connection lines */
    var NODE_OPACITY = 0.55;         /* opacity for node fill circles */

    /* Resize canvas to match its CSS-rendered size */
    function resize() {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }

    /* Create a single node with random position and velocity */
    function makeNode() {
      return {
        x:   Math.random() * canvas.width,
        y:   Math.random() * canvas.height,
        vx:  (Math.random() - 0.5) * 0.3,
        vy:  (Math.random() - 0.5) * 0.3,
        r:   Math.random() * 2 + 1.5  /* radius 1.5–3.5px */
      };
    }

    /* Build the initial node list */
    function buildNodes() {
      nodes = [];
      for (var i = 0; i < NODE_COUNT; i++) {
        nodes.push(makeNode());
      }
    }

    /* Main draw loop */
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      var accent = 'rgba(79, 142, 247, ';

      /* Update positions and wrap at canvas edges */
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0) n.x = canvas.width;
        if (n.x > canvas.width)  n.x = 0;
        if (n.y < 0) n.y = canvas.height;
        if (n.y > canvas.height) n.y = 0;
      }

      /* Draw connection lines */
      for (var i = 0; i < nodes.length; i++) {
        for (var j = i + 1; j < nodes.length; j++) {
          var dx   = nodes[i].x - nodes[j].x;
          var dy   = nodes[i].y - nodes[j].y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            var alpha = (1 - dist / CONNECTION_DIST) * CONNECTION_MAX_ALPHA;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = accent + alpha + ')';
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      /* Draw nodes */
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = accent + NODE_OPACITY + ')';
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    }

    /* Start */
    resize();
    buildNodes();
    draw();

    /* Rebuild on resize */
    window.addEventListener('resize', throttle(function () {
      resize();
      buildNodes();
    }, 300));

    /* Pause animation when section is off-screen to save resources */
    if ('IntersectionObserver' in window) {
      var processObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            if (!animId) draw();
          } else {
            cancelAnimationFrame(animId);
            animId = null;
          }
        });
      }, { threshold: 0 });
      processObs.observe(canvas.closest('section') || canvas);
    }
  })();


  /* ================================================================
     9. CAPABILITIES SECTION — INTERACTIVE PREVIEW SYSTEM
     When a capability card is hovered (or tapped on mobile), the centre
     preview panel renders a unique Canvas 2D animation demonstrating
     that capability. Each animation is self-contained and cancels cleanly.
  ================================================================ */

  (function initCapabilitiesPreview() {
    var showcase   = document.getElementById('capabilities-showcase');
    if (!showcase) return;

    var previewCanvas = document.getElementById('cap-preview-canvas');
    if (!previewCanvas) return;

    var ctx           = previewCanvas.getContext('2d');
    var cards         = showcase.querySelectorAll('.cap-card');
    var hintEl        = document.getElementById('cap-preview-hint');
    var activeAnimId  = null;   /* current requestAnimationFrame handle */
    var activeIndex   = -1;
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ── Resize canvas to its CSS size ──────────────────────────── */
    function resizeCanvas() {
      previewCanvas.width  = previewCanvas.offsetWidth  || previewCanvas.parentElement.offsetWidth;
      previewCanvas.height = previewCanvas.offsetHeight || previewCanvas.parentElement.offsetHeight;
    }

    window.addEventListener('resize', throttle(resizeCanvas, 300));
    resizeCanvas();

    /* ── Cancel the running animation ──────────────────────────── */
    function stopAnim() {
      if (activeAnimId) {
        cancelAnimationFrame(activeAnimId);
        activeAnimId = null;
      }
    }

    /* ── Draw idle / default state ───────────────────────────────
       A gentle grid of dots shown when no card is hovered.          */
    function drawIdle() {
      stopAnim();
      var w = previewCanvas.width;
      var h = previewCanvas.height;
      ctx.clearRect(0, 0, w, h);

      /* Subtle dot grid */
      ctx.fillStyle = 'rgba(79, 142, 247, 0.12)';
      var step = 30;
      for (var x = step; x < w; x += step) {
        for (var y = step; y < h; y += step) {
          ctx.beginPath();
          ctx.arc(x, y, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (hintEl) hintEl.style.opacity = '1';
    }

    /* ── Utility: clear and set common styles ────────────────────── */
    function clear() {
      ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    }

    /* ── Helper: rounded rect (used across previews) ─────────────── */
    function roundRect(ctx, x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.arcTo(x + w, y, x + w, y + r, r);
      ctx.lineTo(x + w, y + h - r);
      ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
      ctx.lineTo(x + r, y + h);
      ctx.arcTo(x, y + h, x, y + h - r, r);
      ctx.lineTo(x, y + r);
      ctx.arcTo(x, y, x + r, y, r);
      ctx.closePath();
    }

    /* ================================================================
       PREVIEW 0 — JavaScript & Frontend Prototyping
       Animated UI components: buttons, toggles, and an input filling in.
    ================================================================ */
    function drawFrontendPreview() {
      stopAnim();
      var w = previewCanvas.width;
      var h = previewCanvas.height;
      var t = 0;

      /* Element definitions */
      var elements = [
        { type: 'button', x: w * 0.18, y: h * 0.3,  w: 110, h: 36, label: 'Submit', delay: 0   },
        { type: 'button', x: w * 0.18, y: h * 0.5,  w: 110, h: 36, label: 'Cancel', delay: 20  },
        { type: 'toggle', x: w * 0.55, y: h * 0.28, delay: 10, on: false },
        { type: 'toggle', x: w * 0.55, y: h * 0.48, delay: 30, on: false },
        { type: 'input',  x: w * 0.3,  y: h * 0.7,  w: w * 0.4, h: 32, delay: 15, text: '' }
      ];

      var inputStr   = 'hello@example.com';
      var inputFrame = 0;
      var TOGGLE_CYCLE_FRAMES = 120; /* frames per full toggle on/off cycle */
      var TOGGLE_FLIP_OFFSET  = 60;  /* frame within the cycle when toggle flips */

      function frame() {
        clear();
        t++;

        /* Background */
        ctx.fillStyle = 'rgba(19, 22, 31, 0.8)';
        ctx.fillRect(0, 0, w, h);

        /* Draw a mock browser chrome */
        ctx.fillStyle = 'rgba(255,255,255,0.04)';
        roundRect(ctx, w * 0.08, h * 0.1, w * 0.84, h * 0.8, 10);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 1;
        roundRect(ctx, w * 0.08, h * 0.1, w * 0.84, h * 0.8, 10);
        ctx.stroke();

        /* Small URL bar */
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        roundRect(ctx, w * 0.18, h * 0.14, w * 0.64, 18, 4);
        ctx.fill();

        elements.forEach(function (el) {
          if (t < el.delay) return;
          var progress = Math.min(1, (t - el.delay) / 18);

          if (el.type === 'button') {
            var isHover = (t % 80 > 40 && el.label === 'Submit');
            ctx.globalAlpha = progress;
            ctx.fillStyle = isHover ? '#4f8ef7' : 'rgba(79,142,247,0.18)';
            roundRect(ctx, el.x, el.y, el.w, el.h, 6);
            ctx.fill();
            ctx.strokeStyle = 'rgba(79,142,247,0.5)';
            ctx.lineWidth = 1;
            roundRect(ctx, el.x, el.y, el.w, el.h, 6);
            ctx.stroke();
            ctx.fillStyle = isHover ? '#fff' : '#7aabff';
            ctx.font = '600 12px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(el.label, el.x + el.w / 2, el.y + el.h / 2);
            ctx.globalAlpha = 1;
          }

          if (el.type === 'toggle') {
            /* Toggle switches on a cycle defined by TOGGLE_CYCLE_FRAMES */
            if (t % TOGGLE_CYCLE_FRAMES === el.delay % TOGGLE_CYCLE_FRAMES + TOGGLE_FLIP_OFFSET) el.on = !el.on;
            var bx = el.x, by = el.y;
            var bw = 48, bh = 24, br = 12;
            ctx.globalAlpha = progress;
            ctx.fillStyle = el.on ? '#4f8ef7' : 'rgba(255,255,255,0.12)';
            roundRect(ctx, bx, by, bw, bh, br);
            ctx.fill();
            /* Knob */
            var knobX = el.on ? bx + bw - br : bx + br;
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(knobX, by + br, br - 3, 0, Math.PI * 2);
            ctx.fill();
            /* Label */
            ctx.fillStyle = 'rgba(136,146,164,0.8)';
            ctx.font = '11px Inter, sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(el.on ? 'Enabled' : 'Disabled', bx + bw + 10, by + br);
            ctx.globalAlpha = 1;
          }

          if (el.type === 'input') {
            ctx.globalAlpha = progress;
            /* Input box */
            ctx.fillStyle = 'rgba(255,255,255,0.05)';
            roundRect(ctx, el.x, el.y, el.w, el.h, 6);
            ctx.fill();
            ctx.strokeStyle = t > 50 ? 'rgba(79,142,247,0.6)' : 'rgba(255,255,255,0.12)';
            ctx.lineWidth = 1;
            roundRect(ctx, el.x, el.y, el.w, el.h, 6);
            ctx.stroke();
            /* Typing text */
            if (t > 50 && inputFrame < inputStr.length) {
              if (t % 4 === 0) inputFrame++;
              el.text = inputStr.slice(0, inputFrame);
            }
            ctx.fillStyle = '#e8eaf0';
            ctx.font = '12px Inter, sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(el.text, el.x + 10, el.y + el.h / 2);
            /* Cursor */
            if (inputFrame < inputStr.length) {
              var tw = ctx.measureText(el.text).width;
              ctx.fillStyle = '#4f8ef7';
              ctx.fillRect(el.x + 10 + tw + 1, el.y + 7, 1.5, el.h - 14);
            }
            ctx.globalAlpha = 1;
          }
        });

        activeAnimId = requestAnimationFrame(frame);
      }

      activeAnimId = requestAnimationFrame(frame);
    }

    /* ================================================================
       PREVIEW 1 — Python & Automation Engineering
       Scrolling code lines + a simple data-processing loop visual.
    ================================================================ */
    function drawPythonPreview() {
      stopAnim();
      var w = previewCanvas.width;
      var h = previewCanvas.height;
      var t = 0;
      var scrollY = 0;

      var codeLines = [
        { indent: 0, col: '#7aabff', text: 'import pandas as pd' },
        { indent: 0, col: '#7aabff', text: 'from pathlib import Path' },
        { indent: 0, col: '#a5b4fc', text: '' },
        { indent: 0, col: '#3ddc84', text: 'def process_records(source_path):' },
        { indent: 1, col: '#8892a4', text: '"""Load, clean and export records."""' },
        { indent: 1, col: '#e8eaf0', text: 'df = pd.read_csv(source_path)' },
        { indent: 1, col: '#e8eaf0', text: "df.dropna(subset=['email'], inplace=True)" },
        { indent: 1, col: '#e8eaf0', text: 'df.columns = df.columns.str.lower()' },
        { indent: 1, col: '#a5b4fc', text: '' },
        { indent: 1, col: '#e8eaf0', text: 'results = []' },
        { indent: 1, col: '#3ddc84', text: 'for _, row in df.iterrows():' },
        { indent: 2, col: '#e8eaf0', text: 'record = transform(row)' },
        { indent: 2, col: '#e8eaf0', text: 'results.append(record)' },
        { indent: 1, col: '#a5b4fc', text: '' },
        { indent: 1, col: '#7aabff', text: "out = Path('output.json')" },
        { indent: 1, col: '#e8eaf0', text: 'out.write_text(json.dumps(results))' },
        { indent: 1, col: '#3ddc84', text: "print(f'Done: {len(results)} records')" },
        { indent: 0, col: '#a5b4fc', text: '' },
      ];

      var lineH = 18;
      var visibleLines = Math.floor((h * 0.7) / lineH) + 2;
      var totalScroll  = codeLines.length * lineH;
      var SCROLL_INTERVAL_FRAMES = 3; /* advance scroll by 1px every N frames */

      function frame() {
        clear();
        t++;

        /* Dark terminal bg */
        ctx.fillStyle = 'rgba(10, 11, 14, 0.92)';
        ctx.fillRect(0, 0, w, h);

        /* Terminal title bar */
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        ctx.fillRect(0, 0, w, 28);
        ctx.fillStyle = '#f87171'; ctx.beginPath(); ctx.arc(16, 14, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.arc(30, 14, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#3ddc84'; ctx.beginPath(); ctx.arc(44, 14, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#8892a4';
        ctx.font = '11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('automation.py', w / 2, 19);

        /* Scroll code slowly — advance 1px every SCROLL_INTERVAL_FRAMES frames */
        if (t % SCROLL_INTERVAL_FRAMES === 0) scrollY = (scrollY + 1) % totalScroll;

        ctx.save();
        ctx.rect(0, 28, w, h - 60);
        ctx.clip();

        for (var i = 0; i < codeLines.length + visibleLines; i++) {
          var lineIndex = i % codeLines.length;
          var line = codeLines[lineIndex];
          var y = 28 + i * lineH - scrollY;
          if (y > h - 60 + lineH) continue;
          if (y < 28 - lineH) continue;

          /* Line number */
          ctx.fillStyle = 'rgba(136,146,164,0.3)';
          ctx.font = '11px monospace';
          ctx.textAlign = 'right';
          ctx.fillText(String(lineIndex + 1), 30, y + lineH - 5);

          ctx.fillStyle = line.col;
          ctx.textAlign = 'left';
          ctx.fillText('  '.repeat(line.indent) + line.text, 38, y + lineH - 5);
        }

        ctx.restore();

        /* Animated progress bar at the bottom */
        var progress = (t % 200) / 200;
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        ctx.fillRect(0, h - 28, w, 28);
        ctx.fillStyle = 'rgba(79,142,247,0.7)';
        ctx.fillRect(0, h - 28, w * progress, 28);
        ctx.fillStyle = '#e8eaf0';
        ctx.font = '11px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('Processing records... ' + Math.round(progress * 100) + '%', 12, h - 10);

        activeAnimId = requestAnimationFrame(frame);
      }

      activeAnimId = requestAnimationFrame(frame);
    }

    /* ================================================================
       PREVIEW 2 — Dashboard & Business Tool Interfaces
       Mini dashboard: bar chart, counter, and a line graph updating.
    ================================================================ */
    function drawDashboardPreview() {
      stopAnim();
      var w = previewCanvas.width;
      var h = previewCanvas.height;
      var t = 0;

      /* Simulated KPI counters */
      var kpis = [
        { label: 'Revenue', target: 84320, current: 0, prefix: '£', color: '#4f8ef7' },
        { label: 'Orders',  target: 1247,  current: 0, prefix: '',  color: '#3ddc84' },
        { label: 'Users',   target: 3891,  current: 0, prefix: '',  color: '#a78bfa' }
      ];

      /* Bar chart data */
      var bars = [42, 67, 55, 78, 90, 63, 85, 71, 95, 60, 82, 88];

      /* Line chart data — will evolve over time */
      var lineData = bars.map(function (v) { return v / 100; });

      function frame() {
        clear();
        t++;

        /* BG */
        ctx.fillStyle = 'rgba(15, 17, 23, 0.95)';
        ctx.fillRect(0, 0, w, h);

        /* Top nav bar simulation */
        ctx.fillStyle = 'rgba(255,255,255,0.04)';
        ctx.fillRect(0, 0, w, 32);
        ctx.fillStyle = '#4f8ef7';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('GlazierOS', 12, 21);

        /* KPI cards */
        var cardW = (w - 40) / 3;
        kpis.forEach(function (kpi, i) {
          var cx = 12 + i * (cardW + 8);
          var cy = 40;
          kpi.current = Math.min(kpi.target, kpi.current + Math.ceil(kpi.target / 80));

          ctx.fillStyle = 'rgba(255,255,255,0.04)';
          roundRect(ctx, cx, cy, cardW, 48, 6);
          ctx.fill();
          ctx.strokeStyle = 'rgba(255,255,255,0.06)';
          ctx.lineWidth = 1;
          roundRect(ctx, cx, cy, cardW, 48, 6);
          ctx.stroke();

          ctx.fillStyle = '#8892a4';
          ctx.font = '10px Inter, sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(kpi.label, cx + 10, cy + 16);

          ctx.fillStyle = kpi.color;
          ctx.font = 'bold 16px Inter, sans-serif';
          ctx.fillText(kpi.prefix + kpi.current.toLocaleString(), cx + 10, cy + 36);
        });

        /* Bar chart */
        var chartLeft = 12, chartTop = h * 0.38, chartW = w * 0.52, chartH = h * 0.42;
        ctx.fillStyle = 'rgba(255,255,255,0.03)';
        roundRect(ctx, chartLeft, chartTop, chartW, chartH, 6);
        ctx.fill();

        var barW  = (chartW - 20) / bars.length - 3;
        var maxH  = chartH - 30;
        bars.forEach(function (val, i) {
          var animated = Math.min(val, val * Math.min(1, t / 60));
          var bh   = (animated / 100) * maxH;
          var bx   = chartLeft + 10 + i * (barW + 3);
          var by   = chartTop + chartH - 15 - bh;

          /* Subtle glow effect for tallest bar */
          if (val === 95) {
            ctx.fillStyle = 'rgba(79,142,247,0.15)';
            ctx.fillRect(bx - 2, by - 2, barW + 4, bh + 4);
          }

          ctx.fillStyle = i === bars.length - 2 ? '#4f8ef7' : 'rgba(79,142,247,0.45)';
          ctx.fillRect(bx, by, barW, bh);
        });

        /* Line chart (right side) */
        var lcLeft = chartLeft + chartW + 10, lcTop = chartTop, lcW = w - lcLeft - 12, lcH = chartH;
        ctx.fillStyle = 'rgba(255,255,255,0.03)';
        roundRect(ctx, lcLeft, lcTop, lcW, lcH, 6);
        ctx.fill();

        /* Animate line data */
        if (t % 40 === 0) {
          lineData.push(0.3 + Math.random() * 0.6);
          if (lineData.length > 20) lineData.shift();
        }

        if (lineData.length > 1) {
          var step = (lcW - 16) / (lineData.length - 1);
          ctx.beginPath();
          lineData.forEach(function (v, i) {
            var px = lcLeft + 8 + i * step;
            var py = lcTop + lcH - 15 - v * (lcH - 25);
            i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
          });
          ctx.strokeStyle = '#3ddc84';
          ctx.lineWidth = 2;
          ctx.lineJoin = 'round';
          ctx.stroke();

          /* Fill under line */
          var lastPx = lcLeft + 8 + (lineData.length - 1) * step;
          ctx.lineTo(lastPx, lcTop + lcH - 15);
          ctx.lineTo(lcLeft + 8, lcTop + lcH - 15);
          ctx.closePath();
          ctx.fillStyle = 'rgba(61,220,132,0.08)';
          ctx.fill();
        }

        activeAnimId = requestAnimationFrame(frame);
      }

      activeAnimId = requestAnimationFrame(frame);
    }

    /* ================================================================
       PREVIEW 3 — Browser-Based Interactive Systems
       Particle field that moves based on a simulated "mouse" cursor.
    ================================================================ */
    function drawBrowserPreview() {
      stopAnim();
      var w = previewCanvas.width;
      var h = previewCanvas.height;
      var t = 0;
      var particles = [];
      var PCOUNT = 60;

      /* Simulated cursor that moves on a lissajous path */
      var cursor = { x: w / 2, y: h / 2 };

      for (var i = 0; i < PCOUNT; i++) {
        particles.push({
          x: Math.random() * w, y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5,
          r: Math.random() * 2.5 + 1,
          hue: 200 + Math.random() * 60
        });
      }

      function frame() {
        ctx.fillStyle = 'rgba(10, 11, 14, 0.18)';
        ctx.fillRect(0, 0, w, h);
        t++;

        /* Move simulated cursor on a lissajous path */
        cursor.x = w / 2 + Math.sin(t * 0.015) * (w * 0.3);
        cursor.y = h / 2 + Math.cos(t * 0.011) * (h * 0.3);

        /* Draw cursor glow */
        var grad = ctx.createRadialGradient(cursor.x, cursor.y, 0, cursor.x, cursor.y, 60);
        grad.addColorStop(0, 'rgba(79,142,247,0.12)');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cursor.x, cursor.y, 60, 0, Math.PI * 2);
        ctx.fill();

        /* Update and draw particles */
        particles.forEach(function (p) {
          /* Attract towards cursor slightly */
          var dx = cursor.x - p.x;
          var dy = cursor.y - p.y;
          var dist = Math.sqrt(dx * dx + dy * dy) || 1;
          var force = Math.min(60 / dist, 0.8);
          p.vx += dx / dist * force * 0.015;
          p.vy += dy / dist * force * 0.015;

          /* Dampen */
          p.vx *= 0.97;
          p.vy *= 0.97;

          p.x += p.vx;
          p.y += p.vy;

          /* Wrap */
          if (p.x < 0) p.x = w;
          if (p.x > w) p.x = 0;
          if (p.y < 0) p.y = h;
          if (p.y > h) p.y = 0;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = 'hsla(' + p.hue + ', 80%, 70%, 0.75)';
          ctx.fill();
        });

        /* Draw connections near cursor */
        ctx.strokeStyle = 'rgba(79,142,247,0.2)';
        ctx.lineWidth = 0.8;
        particles.forEach(function (p) {
          var dx = p.x - cursor.x;
          var dy = p.y - cursor.y;
          if (Math.sqrt(dx * dx + dy * dy) < 80) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(cursor.x, cursor.y);
            ctx.stroke();
          }
        });

        activeAnimId = requestAnimationFrame(frame);
      }

      /* Initial clear */
      clear();
      ctx.fillStyle = 'rgba(10, 11, 14, 1)';
      ctx.fillRect(0, 0, w, h);
      activeAnimId = requestAnimationFrame(frame);
    }

    /* ================================================================
       PREVIEW 4 — API Integration & Data-Driven UI
       Nodes sending data packets between each other.
    ================================================================ */
    function drawAPIPreview() {
      stopAnim();
      var w = previewCanvas.width;
      var h = previewCanvas.height;
      var t = 0;

      /* Define API nodes */
      var nodeList = [
        { label: 'Client',   x: w * 0.15, y: h * 0.5,  color: '#4f8ef7' },
        { label: 'Gateway',  x: w * 0.38, y: h * 0.3,  color: '#a78bfa' },
        { label: 'Auth',     x: w * 0.38, y: h * 0.7,  color: '#f87171' },
        { label: 'API',      x: w * 0.62, y: h * 0.5,  color: '#3ddc84' },
        { label: 'Database', x: w * 0.85, y: h * 0.35, color: '#fbbf24' },
        { label: 'Cache',    x: w * 0.85, y: h * 0.65, color: '#4f8ef7' }
      ];

      /* Connections (pairs of indices) */
      var edges = [[0,1],[0,2],[1,3],[2,3],[3,4],[3,5]];

      /* Active packets */
      var packets = [];

      function spawnPacket() {
        var edgeIdx = Math.floor(Math.random() * edges.length);
        var edge    = edges[edgeIdx];
        var reverse = Math.random() > 0.7;
        packets.push({
          from:  reverse ? edge[1] : edge[0],
          to:    reverse ? edge[0] : edge[1],
          t:     0,
          speed: 0.012 + Math.random() * 0.008,
          color: nodeList[reverse ? edge[1] : edge[0]].color
        });
      }

      function frame() {
        clear();
        t++;

        /* BG */
        ctx.fillStyle = 'rgba(10, 11, 14, 0.95)';
        ctx.fillRect(0, 0, w, h);

        /* Spawn packets */
        if (t % 18 === 0) spawnPacket();

        /* Draw edges */
        edges.forEach(function (edge) {
          var a = nodeList[edge[0]], b = nodeList[edge[1]];
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = 'rgba(255,255,255,0.08)';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        });

        /* Update and draw packets */
        packets = packets.filter(function (p) { return p.t <= 1; });
        packets.forEach(function (p) {
          p.t += p.speed;
          var a   = nodeList[p.from];
          var b   = nodeList[p.to];
          var px  = a.x + (b.x - a.x) * p.t;
          var py  = a.y + (b.y - a.y) * p.t;

          /* Trail */
          ctx.beginPath();
          ctx.arc(px, py, 4, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = 0.9;
          ctx.fill();
          ctx.globalAlpha = 1;

          /* Glow */
          ctx.beginPath();
          ctx.arc(px, py, 10, 0, Math.PI * 2);
          ctx.fillStyle = p.color + '33';
          ctx.fill();
        });

        /* Draw nodes */
        nodeList.forEach(function (node) {
          /* Node circle */
          ctx.beginPath();
          ctx.arc(node.x, node.y, 22, 0, Math.PI * 2);
          ctx.fillStyle = node.color + '22';
          ctx.fill();
          ctx.beginPath();
          ctx.arc(node.x, node.y, 22, 0, Math.PI * 2);
          ctx.strokeStyle = node.color;
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.fillStyle = '#e8eaf0';
          ctx.font = 'bold 9px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(node.label, node.x, node.y);
        });

        activeAnimId = requestAnimationFrame(frame);
      }

      activeAnimId = requestAnimationFrame(frame);
    }

    /* ================================================================
       PREVIEW 5 — Rapid Iteration Workflows
       Pipeline blocks appearing in sequence, building a system.
    ================================================================ */
    function drawIterationPreview() {
      stopAnim();
      var w = previewCanvas.width;
      var h = previewCanvas.height;
      var t = 0;

      var stages = [
        { label: 'Scope',    color: '#4f8ef7', icon: '⬡' },
        { label: 'Prototype', color: '#a78bfa', icon: '▶' },
        { label: 'Test',     color: '#fbbf24', icon: '✓' },
        { label: 'Iterate',  color: '#3ddc84', icon: '↺' },
        { label: 'Ship',     color: '#f87171', icon: '⚡' }
      ];

      var blockW = Math.min(80, (w - 60) / stages.length - 8);
      var spacing = (w - 40 - blockW * stages.length) / (stages.length - 1);
      var centerY = h * 0.45;

      function frame() {
        clear();
        t++;

        /* BG */
        ctx.fillStyle = 'rgba(10, 11, 14, 0.95)';
        ctx.fillRect(0, 0, w, h);

        /* Title */
        ctx.fillStyle = '#8892a4';
        ctx.font = '11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Build Pipeline', w / 2, h * 0.2);

        /* Cycle: every 200 frames restart */
        var cycle = t % 220;

        stages.forEach(function (stage, i) {
          var stageReveal = i * 35;
          if (cycle < stageReveal) return;

          var progress = Math.min(1, (cycle - stageReveal) / 20);
          var bx = 20 + i * (blockW + spacing);
          var by = centerY - 28 * progress;
          var alpha = progress;

          ctx.globalAlpha = alpha;

          /* Block */
          ctx.fillStyle = stage.color + '22';
          roundRect(ctx, bx, by - 20, blockW, 56, 8);
          ctx.fill();
          ctx.strokeStyle = stage.color;
          ctx.lineWidth = 1.5;
          roundRect(ctx, bx, by - 20, blockW, 56, 8);
          ctx.stroke();

          /* Icon */
          ctx.fillStyle = stage.color;
          ctx.font = 'bold 16px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(stage.icon, bx + blockW / 2, by + 4);

          /* Label */
          ctx.fillStyle = '#e8eaf0';
          ctx.font = '10px Inter, sans-serif';
          ctx.fillText(stage.label, bx + blockW / 2, by + 22);

          ctx.globalAlpha = 1;

          /* Arrow to next */
          if (i < stages.length - 1) {
            var nextReveal = (i + 1) * 35;
            if (cycle >= nextReveal) {
              var ax = bx + blockW + 2;
              var ay = centerY + 8;
              ctx.strokeStyle = 'rgba(255,255,255,0.2)';
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(ax, ay);
              ctx.lineTo(ax + spacing - 4, ay);
              ctx.stroke();
              /* Arrowhead */
              ctx.fillStyle = 'rgba(255,255,255,0.2)';
              ctx.beginPath();
              ctx.moveTo(ax + spacing - 2, ay - 4);
              ctx.lineTo(ax + spacing + 5, ay);
              ctx.lineTo(ax + spacing - 2, ay + 4);
              ctx.fill();
            }
          }
        });

        /* "Iterating..." pulse at bottom */
        if (cycle > 180) {
          var pulseAlpha = Math.sin((cycle - 180) * 0.1) * 0.5 + 0.5;
          ctx.globalAlpha = pulseAlpha;
          ctx.fillStyle = '#3ddc84';
          ctx.font = '11px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('Iterating...', w / 2, h * 0.78);
          ctx.globalAlpha = 1;
        }

        activeAnimId = requestAnimationFrame(frame);
      }

      activeAnimId = requestAnimationFrame(frame);
    }

    /* ================================================================
       PREVIEW 6 — Proof-of-Concept System Design
       Interface wireframes building themselves on screen.
    ================================================================ */
    function drawPoCPreview() {
      stopAnim();
      var w = previewCanvas.width;
      var h = previewCanvas.height;
      var t = 0;

      /* Wireframe elements that draw progressively */
      var elements = [
        /* Nav bar */
        { t: 0,  draw: function (p) {
          ctx.strokeStyle = 'rgba(79,142,247,' + p + ')';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(w * 0.08, h * 0.08, w * 0.84, 28);
          /* Logo placeholder */
          ctx.fillStyle = 'rgba(79,142,247,' + (p * 0.5) + ')';
          ctx.fillRect(w * 0.1, h * 0.08 + 6, 40, 16);
          /* Nav items */
          for (var i = 0; i < 4; i++) {
            ctx.fillRect(w * 0.55 + i * 48, h * 0.08 + 8, 36, 12);
          }
        }},
        /* Hero area */
        { t: 15, draw: function (p) {
          ctx.strokeStyle = 'rgba(136,146,164,' + (p * 0.4) + ')';
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          ctx.strokeRect(w * 0.08, h * 0.2, w * 0.84, h * 0.28);
          ctx.setLineDash([]);
          /* Headline placeholder */
          ctx.fillStyle = 'rgba(255,255,255,' + (p * 0.25) + ')';
          ctx.fillRect(w * 0.18, h * 0.26, w * 0.48, 14);
          ctx.fillRect(w * 0.22, h * 0.32, w * 0.36, 10);
          /* CTA button */
          ctx.strokeStyle = 'rgba(79,142,247,' + p + ')';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([]);
          roundRect(ctx, w * 0.28, h * 0.4, 90, 28, 5);
          ctx.stroke();
        }},
        /* Cards row */
        { t: 30, draw: function (p) {
          for (var i = 0; i < 3; i++) {
            var cx = w * 0.1 + i * (w * 0.27 + 8);
            ctx.strokeStyle = 'rgba(136,146,164,' + (p * 0.5) + ')';
            ctx.lineWidth = 1;
            roundRect(ctx, cx, h * 0.55, w * 0.26, h * 0.25, 6);
            ctx.stroke();
            ctx.fillStyle = 'rgba(255,255,255,' + (p * 0.12) + ')';
            ctx.fillRect(cx + 10, h * 0.58, w * 0.12, 8);
            ctx.fillRect(cx + 10, h * 0.6 + 12, w * 0.18, 5);
            ctx.fillRect(cx + 10, h * 0.6 + 21, w * 0.16, 5);
          }
        }},
        /* Annotation lines */
        { t: 50, draw: function (p) {
          ctx.strokeStyle = 'rgba(167,139,250,' + (p * 0.5) + ')';
          ctx.lineWidth = 0.8;
          ctx.setLineDash([3, 3]);
          ctx.beginPath(); ctx.moveTo(w * 0.08, h * 0.08); ctx.lineTo(w * 0.04, h * 0.04); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(w * 0.92, h * 0.2);  ctx.lineTo(w * 0.96, h * 0.16); ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = 'rgba(167,139,250,' + (p * 0.7) + ')';
          ctx.font = '9px monospace';
          ctx.textAlign = 'left';
          ctx.fillText('nav', w * 0.015, h * 0.04);
          ctx.fillText('hero', w * 0.955, h * 0.16);
        }}
      ];

      function frame() {
        clear();
        t++;

        /* BG */
        ctx.fillStyle = 'rgba(10, 11, 14, 0.95)';
        ctx.fillRect(0, 0, w, h);

        /* Draw each element with fade-in */
        var cycle = t % 240;
        elements.forEach(function (el) {
          if (cycle < el.t) return;
          var p = Math.min(1, (cycle - el.t) / 20);
          el.draw(p);
        });

        activeAnimId = requestAnimationFrame(frame);
      }

      activeAnimId = requestAnimationFrame(frame);
    }

    /* ================================================================
       PREVIEW 7 — Scraping & Data Collection Tools
       Table rows filling with data + map-style markers appearing.
    ================================================================ */
    function drawScrapingPreview() {
      stopAnim();
      var w = previewCanvas.width;
      var h = previewCanvas.height;
      var t = 0;

      var tableRows = [
        ['Acme Corp',        'London',    '020 7946 0123', '★★★★'],
        ['Bright Solutions', 'Manchester', '0161 496 0101', '★★★☆'],
        ['Delta Systems',    'Bristol',   '0117 946 0200', '★★★★'],
        ['Echo Services',    'Leeds',     '0113 496 0300', '★★★★★'],
        ['Foxtrot Digital',  'Edinburgh', '0131 496 0400', '★★★☆'],
      ];

      var markers = [
        { x: w * 0.62, y: h * 0.28 },
        { x: w * 0.58, y: h * 0.5  },
        { x: w * 0.6,  y: h * 0.65 },
        { x: w * 0.52, y: h * 0.42 },
        { x: w * 0.55, y: h * 0.75 },
      ];

      function frame() {
        clear();
        t++;

        /* BG */
        ctx.fillStyle = 'rgba(10, 11, 14, 0.95)';
        ctx.fillRect(0, 0, w, h);

        /* Left: table */
        var tableW = w * 0.48;
        var colHeaders = ['Name', 'City', 'Phone', 'Rating'];
        var colWidths  = [0.38, 0.25, 0.24, 0.13];

        /* Header */
        ctx.fillStyle = 'rgba(79,142,247,0.15)';
        ctx.fillRect(8, 8, tableW - 16, 22);
        var colX = 12;
        colHeaders.forEach(function (hdr, i) {
          ctx.fillStyle = '#7aabff';
          ctx.font = 'bold 10px Inter, sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(hdr, colX, 23);
          colX += colWidths[i] * (tableW - 20);
        });

        /* Rows appear progressively */
        var visibleRows = Math.min(tableRows.length, Math.floor(t / 22));
        tableRows.slice(0, visibleRows).forEach(function (row, ri) {
          var rowY = 32 + ri * 22;
          ctx.fillStyle = ri % 2 === 0 ? 'rgba(255,255,255,0.025)' : 'transparent';
          ctx.fillRect(8, rowY, tableW - 16, 22);

          var cx2 = 12;
          row.forEach(function (cell, ci) {
            /* Animate the last added row in */
            var alpha = ri === visibleRows - 1 ? Math.min(1, (t % 22) / 10) : 1;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = ci === 3 ? '#fbbf24' : '#e8eaf0';
            ctx.font = '10px Inter, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(cell, cx2, rowY + 15);
            cx2 += colWidths[ci] * (tableW - 20);
            ctx.globalAlpha = 1;
          });

          /* Row border */
          ctx.strokeStyle = 'rgba(255,255,255,0.05)';
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(8, rowY + 22);
          ctx.lineTo(tableW - 8, rowY + 22);
          ctx.stroke();
        });

        /* Right: stylised map */
        var mapX = w * 0.52, mapW = w * 0.46, mapH = h - 16;
        ctx.fillStyle = 'rgba(255,255,255,0.03)';
        roundRect(ctx, mapX, 8, mapW, mapH, 8);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 1;
        roundRect(ctx, mapX, 8, mapW, mapH, 8);
        ctx.stroke();

        /* Map grid lines */
        ctx.strokeStyle = 'rgba(79,142,247,0.06)';
        ctx.lineWidth = 0.5;
        for (var gx = mapX + 20; gx < mapX + mapW; gx += 20) {
          ctx.beginPath(); ctx.moveTo(gx, 8); ctx.lineTo(gx, 8 + mapH); ctx.stroke();
        }
        for (var gy = 28; gy < 8 + mapH; gy += 20) {
          ctx.beginPath(); ctx.moveTo(mapX, gy); ctx.lineTo(mapX + mapW, gy); ctx.stroke();
        }

        /* Markers appear with rows */
        markers.slice(0, visibleRows).forEach(function (m, mi) {
          var pulse = Math.abs(Math.sin(t * 0.05 + mi));
          ctx.beginPath();
          ctx.arc(m.x, m.y, 5 + pulse * 4, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(79,142,247,0.15)';
          ctx.fill();
          ctx.beginPath();
          ctx.arc(m.x, m.y, 5, 0, Math.PI * 2);
          ctx.fillStyle = '#4f8ef7';
          ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 7px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(mi + 1), m.x, m.y);
        });

        activeAnimId = requestAnimationFrame(frame);
      }

      activeAnimId = requestAnimationFrame(frame);
    }

    /* ── Array of preview functions in order (matching data-cap) ── */
    var previews = [
      drawFrontendPreview,   /* 0 */
      drawPythonPreview,     /* 1 */
      drawDashboardPreview,  /* 2 */
      drawBrowserPreview,    /* 3 */
      drawAPIPreview,        /* 4 */
      drawIterationPreview,  /* 5 */
      drawPoCPreview,        /* 6 */
      drawScrapingPreview    /* 7 */
    ];

    /* ── Activate a card ──────────────────────────────────────────── */
    function activateCard(index) {
      if (index === activeIndex) return;
      activeIndex = index;

      /* Mark active card */
      cards.forEach(function (c) { c.classList.remove('is-active'); });
      if (cards[index]) cards[index].classList.add('is-active');

      /* Mark showcase as having an active card (hides hint via CSS) */
      showcase.classList.add('has-active');

      /* Clear inline opacity set by drawIdle so the CSS rule takes effect */
      if (hintEl) hintEl.style.opacity = '';

      /* Skip canvas animation if user prefers reduced motion */
      if (reducedMotion) return;

      /* Run the preview */
      resizeCanvas();
      previews[index]();
    }

    /* ── Deactivate ───────────────────────────────────────────────── */
    function deactivate() {
      activeIndex = -1;
      cards.forEach(function (c) { c.classList.remove('is-active'); });
      showcase.classList.remove('has-active');
      stopAnim();
      drawIdle();
    }

    /* ── Bind events ──────────────────────────────────────────────── */
    cards.forEach(function (card) {
      var idx = parseInt(card.getAttribute('data-cap'), 10);

      /* Desktop: hover */
      card.addEventListener('mouseenter', function () { activateCard(idx); });
      card.addEventListener('mouseleave', deactivate);

      /* Keyboard: focus / blur */
      card.addEventListener('focus',  function () { activateCard(idx); });
      card.addEventListener('blur',   deactivate);

      /* Mobile / touch: tap to toggle */
      card.addEventListener('click', function () {
        if (activeIndex === idx) {
          deactivate();
        } else {
          activateCard(idx);
        }
      });
    });

    /* Initial idle state */
    resizeCanvas();
    drawIdle();

  })(); /* end initCapabilitiesPreview */

})();
