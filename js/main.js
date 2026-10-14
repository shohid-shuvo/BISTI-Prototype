/* ==========================================================================
   BISTI — main.js
   Handles: preloader, sticky header, mobile nav, scrollspy, scroll-reveal,
            counters, progress bars, testimonial slider, accordion, forms,
            ripple, tilt, back-to-top, image fallbacks.
   ========================================================================== */
(function () {
  'use strict';

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------- preloader */
  window.addEventListener('load', () => {
    const pre = $('#preloader');
    if (!pre) return;
    setTimeout(() => pre.classList.add('is-hidden'), 350);
    setTimeout(() => pre.remove(), 1200);
  });

  /* --------------------------------------------------- sticky header state */
  const header = $('#header');
  const toTop  = $('#toTop');

  const onScroll = () => {
    const y = window.scrollY;
    if (header) header.classList.toggle('is-stuck', y > 40);
    if (toTop)  toTop.classList.toggle('is-visible', y > 500);
    spy(y);
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ------------------------------------------------------------ mobile nav */
  const nav       = $('#nav');
  const hamburger = $('#hamburger');
  const overlay   = $('#navOverlay');
  const navClose  = $('#navClose');

  const setNav = (open) => {
    if (!nav) return;
    nav.classList.toggle('is-open', open);
    overlay && overlay.classList.toggle('is-open', open);
    hamburger && hamburger.classList.toggle('is-open', open);
    hamburger && hamburger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  };

  hamburger && hamburger.addEventListener('click', () => setNav(!nav.classList.contains('is-open')));
  navClose  && navClose.addEventListener('click', () => setNav(false));
  overlay   && overlay.addEventListener('click', () => setNav(false));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setNav(false); });

  /* expand submenu on tap (mobile) */
  $$('.nav__item--has-sub > .nav__link').forEach((link) => {
    link.addEventListener('click', (e) => {
      if (window.innerWidth <= 1180) {
        e.preventDefault();
        link.parentElement.classList.toggle('is-expanded');
      }
    });
  });

  /* --------------------------------------------------- smooth scroll + offset */
  const headerOffset = () => (header ? header.offsetHeight + 8 : 0);

  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#' || id.length < 2) return;
      const target = document.getElementById(id.slice(1));
      if (!target) return;

      e.preventDefault();
      setNav(false);

      const top = target.getBoundingClientRect().top + window.scrollY - headerOffset();
      window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
      history.replaceState(null, '', id);
    });
  });

  /* ------------------------------------------------------------- scrollspy */
  const navLinks = $$('.nav__link[href^="#"]');
  const sections = navLinks
    .map((l) => document.getElementById(l.getAttribute('href').slice(1)))
    .filter(Boolean);

  function spy(y) {
    if (!sections.length) return;
    const pos = y + headerOffset() + 40;
    let current = sections[0];
    sections.forEach((s) => { if (s.offsetTop <= pos) current = s; });
    navLinks.forEach((l) => {
      l.classList.toggle('is-active', l.getAttribute('href') === '#' + current.id);
    });
  }

  /* --------------------------------------------------------- scroll reveal */
  const revealables = $$('[data-reveal]');

  revealables.forEach((el) => {
    const step = parseInt(el.dataset.delay || '0', 10);
    if (step) el.style.transitionDelay = (step * 0.12) + 's';
  });

  if ('IntersectionObserver' in window && !reduced) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    revealables.forEach((el) => io.observe(el));
  } else {
    revealables.forEach((el) => el.classList.add('is-visible'));
  }

  /* ------------------------------------------------------------- count-up */
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  function runCounter(el) {
    const target = parseFloat(el.dataset.count || '0');
    const suffix = el.dataset.suffix || '';
    const dur    = 1900;
    const start  = performance.now();

    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const val = Math.round(target * easeOut(p));
      el.textContent = val.toLocaleString('en-US') + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* -------------------------------------------------------- progress bars */
  function runBar(el) {
    const pct = el.dataset.bar || '0';
    requestAnimationFrame(() => { el.style.width = pct + '%'; });
  }

  /* observe counters + bars together */
  const countEls = $$('.count');
  const barEls   = $$('[data-bar]');

  if ('IntersectionObserver' in window) {
    const io2 = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const t = entry.target;
        if (t.classList.contains('count')) runCounter(t);
        else runBar(t);
        io2.unobserve(t);
      });
    }, { threshold: 0.4 });

    countEls.forEach((el) => io2.observe(el));
    barEls.forEach((el) => io2.observe(el));
  } else {
    countEls.forEach(runCounter);
    barEls.forEach(runBar);
  }

  /* ----------------------------------------------------- testimonial slider */
  const track = $('#tsliderTrack');
  const dots  = $('#tDots');

  if (track) {
    const slides = $$('.tslide', track);
    let index = 0;
    let timer = null;

    slides.forEach((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      b.addEventListener('click', () => go(i));
      dots && dots.appendChild(b);
    });

    const dotEls = dots ? $$('button', dots) : [];

    function go(i) {
      index = (i + slides.length) % slides.length;
      track.style.transform = 'translateX(-' + (index * 100) + '%)';
      dotEls.forEach((d, n) => d.classList.toggle('is-active', n === index));
      restart();
    }

    const next = () => go(index + 1);
    const prev = () => go(index - 1);

    function restart() {
      if (reduced) return;
      clearInterval(timer);
      timer = setInterval(next, 6000);
    }

    $('#tNext') && $('#tNext').addEventListener('click', next);
    $('#tPrev') && $('#tPrev').addEventListener('click', prev);

    /* touch swipe */
    let startX = 0;
    track.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; clearInterval(timer); }, { passive: true });
    track.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 45) (dx < 0 ? next() : prev());
      else restart();
    });

    go(0);
  }

  /* ----------------------------------------------------------- accordion */
  const accs = $$('.acc');

  accs.forEach((acc) => {
    const q = $('.acc__q', acc);
    const a = $('.acc__a', acc);

    /* set initial open state */
    if (acc.classList.contains('is-open') && a) a.style.maxHeight = a.scrollHeight + 'px';

    q && q.addEventListener('click', () => {
      const isOpen = acc.classList.contains('is-open');

      accs.forEach((other) => {
        other.classList.remove('is-open');
        const oa = $('.acc__a', other);
        if (oa) oa.style.maxHeight = null;
      });

      if (!isOpen) {
        acc.classList.add('is-open');
        if (a) a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });

  /* --------------------------------------------------------------- forms */
  function handleForm(formId, noteId, okMessage) {
    const form = document.getElementById(formId);
    const note = document.getElementById(noteId);
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;

      $$('[required]', form).forEach((field) => {
        const bad = !field.value.trim() ||
                    (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim()));
        field.classList.toggle('is-error', bad);
        if (bad) valid = false;
      });

      if (!note) return;

      if (!valid) {
        note.textContent = 'অনুগ্রহ করে সব প্রয়োজনীয় ঘর সঠিকভাবে পূরণ করুন।';
        note.className = 'form__note is-bad';
        return;
      }

      const btn = $('button[type="submit"]', form);
      const original = btn ? btn.innerHTML : '';
      if (btn) { btn.disabled = true; btn.innerHTML = 'Sending…'; }

      /* front-end prototype: no backend yet */
      setTimeout(() => {
        note.textContent = okMessage;
        note.className = 'form__note is-ok';
        form.reset();
        if (btn) { btn.disabled = false; btn.innerHTML = original; }
      }, 900);
    });

    /* clear error styling as the user types */
    $$('input, textarea, select', form).forEach((f) => {
      f.addEventListener('input', () => f.classList.remove('is-error'));
    });
  }

  handleForm('admissionForm', 'formNote',  'ধন্যবাদ! আপনার আবেদন গ্রহণ করা হয়েছে — আমাদের অ্যাডমিশন অফিসার শীঘ্রই যোগাযোগ করবেন।');
  handleForm('contactForm',   'contactNote', 'ধন্যবাদ! আপনার বার্তা পাঠানো হয়েছে। আমরা দ্রুত উত্তর দেব।');
  handleForm('subscribeForm', 'subNote',    'Subscribed successfully. Thank you!');

  /* -------------------------------------------------------------- ripple */
  $$('.btn, .tslider__btn').forEach((btn) => {
    btn.addEventListener('click', function (e) {
      const r = this.getBoundingClientRect();
      const size = Math.max(r.width, r.height);
      const span = document.createElement('span');
      span.className = 'ripple';
      span.style.width = span.style.height = size + 'px';
      span.style.left = (e.clientX - r.left - size / 2) + 'px';
      span.style.top  = (e.clientY - r.top  - size / 2) + 'px';
      this.appendChild(span);
      setTimeout(() => span.remove(), 700);
    });
  });

  /* ---------------------------------------------------------------- tilt */
  if (!reduced && window.matchMedia('(hover: hover)').matches) {
    $$('.program, .member, .post, .ccard').forEach((card) => {
      card.classList.add('tilt');
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width  - 0.5;
        const py = (e.clientY - r.top)  / r.height - 0.5;
        card.style.transform =
          'perspective(900px) rotateY(' + (px * 5).toFixed(2) + 'deg) rotateX(' +
          (-py * 5).toFixed(2) + 'deg) translateY(-10px)';
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  /* ----------------------------------------------------------- back to top */
  toTop && toTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  });

  /* --------------------------------------------------- image fallback net */
  window.addEventListener('error', (e) => {
    const el = e.target;
    if (el && el.tagName === 'IMG' && !el.dataset.failed) {
      el.dataset.failed = '1';
      el.style.background = 'linear-gradient(135deg,#0e2f7d,#3d8bd4)';
      el.style.objectFit = 'cover';
      el.removeAttribute('src');
    }
  }, true);

  /* ---------------------------------------------------------------- misc */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  onScroll();
})();
