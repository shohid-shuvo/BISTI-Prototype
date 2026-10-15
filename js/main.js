/* ==========================================================================
   BISTI — main.js
   Preloader · sticky header · mobile drawer · scrollspy · scroll-reveal
   counters · progress bars · hero slider · testimonial slider · accordion
   result / certificate demo checker · forms · ripple · tilt · image fallbacks
   ========================================================================== */
(function () {
  'use strict';

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Language / theme preferences live in i18n.js, which has already resolved
     the stored choice by the time this file runs. `t` picks a string, `bn`
     keeps its old call sites but now returns the numerals of the active
     language, and `bnDate` formats a date the same way. */
  const I18N = window.BISTI_I18N;
  const t  = (bnText, enText) => (I18N ? I18N.t(bnText, enText) : bnText);
  const bn = (v) => (I18N ? I18N.num(v) : String(v));
  const bnDate = (d) => (I18N ? I18N.date(d) : d.toDateString());

  /* ------------------------------------------------------------- preloader */
  const hidePreloader = () => {
    const pre = $('#preloader');
    if (!pre || pre.dataset.done) return;
    pre.dataset.done = '1';
    setTimeout(() => pre.classList.add('is-hidden'), 300);
    setTimeout(() => pre.remove(), 1100);
  };
  if (document.readyState === 'complete') hidePreloader();
  else window.addEventListener('load', hidePreloader);
  /* safety net — never leave the visitor staring at a spinner */
  setTimeout(hidePreloader, 4000);

  /* --------------------------------------------------- sticky header state */
  const header = $('#header');
  const toTop  = $('#toTop');
  let headerH  = header ? header.offsetHeight : 68;

  const onScroll = () => {
    const y = window.scrollY;
    if (header) {
      header.classList.toggle('is-stuck', y > 80);
      const h = header.offsetHeight;
      if (h !== headerH) {
        headerH = h;
        document.documentElement.style.setProperty('--header-h', h + 'px');
      }
    }
    if (toTop) toTop.classList.toggle('is-visible', y > 480);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => {
    headerH = header ? header.offsetHeight : 68;
    document.documentElement.style.setProperty('--header-h', headerH + 'px');
  });
  document.documentElement.style.setProperty('--header-h', headerH + 'px');

  /* ------------------------------------------------------------ mobile nav */
  const nav       = $('#nav');
  const hamburger = $('#hamburger');
  const overlay   = $('#navOverlay');
  const navClose  = $('#navClose');

  const setNav = (open) => {
    if (!nav) return;
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('is-locked', open);
    if (overlay)   overlay.classList.toggle('is-open', open);
    if (hamburger) {
      hamburger.classList.toggle('is-open', open);
      hamburger.setAttribute('aria-expanded', String(open));
    }
    if (!open) $$('.nav__item.is-expanded').forEach((i) => i.classList.remove('is-expanded'));
  };

  if (hamburger) hamburger.addEventListener('click', () => setNav(!nav.classList.contains('is-open')));
  if (navClose)  navClose.addEventListener('click', () => setNav(false));
  if (overlay)   overlay.addEventListener('click', () => setNav(false));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setNav(false); });

  /* accordion submenus — only inside the mobile drawer */
  const subToggles = $$('.nav__item--has-sub > .nav__link');
  subToggles.forEach((link) => {
    link.addEventListener('click', (e) => {
      if (window.innerWidth > 1180) return;
      e.preventDefault();
      e.stopPropagation();
      const item = link.parentElement;
      const wasOpen = item.classList.contains('is-expanded');
      $$('.nav__item.is-expanded').forEach((i) => { if (i !== item) i.classList.remove('is-expanded'); });
      item.classList.toggle('is-expanded', !wasOpen);
    });
  });

  /* -------------------------------------------------- smooth scroll + offset */
  const offset = () => (header ? header.offsetHeight + 10 : 0);

  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      /* drawer submenu parents already handled above */
      if (window.innerWidth <= 1180 && a.matches('.nav__item--has-sub > .nav__link')) return;

      const href = a.getAttribute('href');
      if (!href || href === '#' || href.length < 2) return;
      const target = document.getElementById(href.slice(1));
      if (!target) return;

      e.preventDefault();
      setNav(false);

      const top = target.getBoundingClientRect().top + window.scrollY - offset();
      window.scrollTo({ top: top < 0 ? 0 : top, behavior: reduced ? 'auto' : 'smooth' });
      history.replaceState(null, '', href);
    });
  });

  /* The loop above deliberately ignores a bare `href="#"` — so a click on one
     fell through to the browser default and threw the visitor back to the top
     of the page. Every gallery tile, notice download button and social icon is
     still a `#` placeholder, and that jump reads as a broken site; they now do
     nothing until they have real destinations. Links that own a handler (the
     result-card downloads) call preventDefault themselves, so this only ever
     catches the ones with nothing behind them. */
  $$('a[href="#"]').forEach((a) => {
    a.addEventListener('click', (e) => e.preventDefault());
  });

  /* -------------------------------------------------------------- scrollspy */
  const spyLinks = $$('.nav__link[href^="#"]');
  const spySections = spyLinks
    .map((l) => document.getElementById(l.getAttribute('href').slice(1)))
    .filter(Boolean);

  function spy() {
    if (!spySections.length) return;
    const pos = window.scrollY + offset() + 60;
    let current = spySections[0];
    spySections.forEach((s) => { if (s.offsetTop <= pos) current = s; });
    spyLinks.forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === '#' + current.id));
  }
  window.addEventListener('scroll', spy, { passive: true });

  /* ----------------------------------------------------------- scroll reveal */
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

  /* ---------------------------------------------------------------- count-up */
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  function runCounter(el) {
    const target = parseFloat(el.dataset.count || '0');
    const suffix = el.dataset.suffix || '';
    const dur = 1900;
    const start = performance.now();

    el.dataset.counted = '1';

    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = bn(Math.round(target * easeOut(p)).toLocaleString('en-US')) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* a language switch has to reprint the finished numbers in the new numerals */
  function refreshCounters() {
    countEls.forEach((el) => {
      if (el.dataset.counted !== '1') return;
      const target = parseFloat(el.dataset.count || '0');
      el.textContent = bn(Math.round(target).toLocaleString('en-US')) + (el.dataset.suffix || '');
    });
  }

  function runBar(el) {
    requestAnimationFrame(() => { el.style.width = (el.dataset.bar || '0') + '%'; });
  }

  const countEls = $$('.count');
  const barEls   = $$('[data-bar]');

  if ('IntersectionObserver' in window) {
    const io2 = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const t = entry.target;
        if (t.classList.contains('count')) runCounter(t); else runBar(t);
        io2.unobserve(t);
      });
    }, { threshold: 0.4 });
    countEls.forEach((el) => io2.observe(el));
    barEls.forEach((el) => io2.observe(el));
  } else {
    countEls.forEach(runCounter);
    barEls.forEach(runBar);
  }

  /* ------------------------------------------------------------ hero slider */
  let heroRelabel = null;      /* set by the slider so a language switch can relabel it */

  (function heroSlider() {
    const slider = $('#heroSlider');
    if (!slider) return;

    const items = $$('.hslide__item', slider);
    if (items.length < 2) return;

    const dotsWrap = $('#hDots');
    const pauseBtn = $('#hPause');
    const AUTOPLAY = 7000;
    let index = 0, timer = null, playing = !reduced;

    /* dots */
    const dots = items.map((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', t('স্লাইড ', 'Slide ') + bn(i + 1));
      b.addEventListener('click', () => go(i));
      dotsWrap && dotsWrap.appendChild(b);
      return b;
    });

    const labelDots = () => dots.forEach((d, i) => {
      d.setAttribute('aria-label', t('স্লাইড ', 'Slide ') + bn(i + 1));
    });

    function go(i) {
      index = (i + items.length) % items.length;
      items.forEach((it, n) => it.classList.toggle('is-active', n === index));
      dots.forEach((d, n) => d.classList.toggle('is-active', n === index));
      if (playing) restart();
    }

    const next = () => go(index + 1);
    const prev = () => go(index - 1);

    function restart() {
      clearInterval(timer);
      if (playing) timer = setInterval(next, AUTOPLAY);
    }

    function setPlaying(state) {
      playing = state;
      if (!pauseBtn) return;
      pauseBtn.innerHTML = state
        ? '<svg class="ic ic--xs"><use href="#i-pause"/></svg><span>' + t('থামান', 'Pause') + '</span>'
        : '<svg class="ic ic--xs"><use href="#i-play"/></svg><span>' + t('চালান', 'Play') + '</span>';
      pauseBtn.setAttribute('aria-label', state ? t('স্লাইড থামান', 'Pause slideshow')
                                                : t('স্লাইড চালান', 'Play slideshow'));
      restart();
    }

    heroRelabel = () => { labelDots(); if (pauseBtn) setPlaying(playing); };

    $('#hNext') && $('#hNext').addEventListener('click', next);
    $('#hPrev') && $('#hPrev').addEventListener('click', prev);
    pauseBtn && pauseBtn.addEventListener('click', () => setPlaying(!playing));

    /* pause while the pointer rests on the slider */
    slider.addEventListener('mouseenter', () => clearInterval(timer));
    slider.addEventListener('mouseleave', restart);

    /* swipe */
    let startX = 0, startY = 0, tracking = false;
    slider.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      tracking = true;
      clearInterval(timer);
    }, { passive: true });
    slider.addEventListener('touchend', (e) => {
      if (!tracking) return;
      tracking = false;
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) (dx < 0 ? next() : prev());
      else restart();
    }, { passive: true });

    /* don't animate in a background tab */
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) clearInterval(timer);
      else restart();
    });

    setPlaying(playing);
    go(0);
  })();

  /* --------------------------------------------------- testimonial slider */
  const tTrack = $('#tsliderTrack');
  let tRelabel = null;

  if (tTrack) {
    const slides = $$('.tslide', tTrack);
    const dotsWrap = $('#tDots');
    let index = 0, timer = null;

    const dots = slides.map((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', t('স্টেটমেন্ট ', 'Testimonial ') + bn(i + 1));
      b.addEventListener('click', () => go(i));
      dotsWrap && dotsWrap.appendChild(b);
      return b;
    });

    tRelabel = () => dots.forEach((d, i) => {
      d.setAttribute('aria-label', t('স্টেটমেন্ট ', 'Testimonial ') + bn(i + 1));
    });

    function go(i) {
      index = (i + slides.length) % slides.length;
      tTrack.style.transform = 'translateX(-' + (index * 100) + '%)';
      dots.forEach((d, n) => d.classList.toggle('is-active', n === index));
      restart();
    }

    const next = () => go(index + 1);
    const prev = () => go(index - 1);

    function restart() {
      clearInterval(timer);
      if (!reduced) timer = setInterval(next, 6500);
    }

    $('#tNext') && $('#tNext').addEventListener('click', next);
    $('#tPrev') && $('#tPrev').addEventListener('click', prev);

    let startX = 0;
    tTrack.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; clearInterval(timer); }, { passive: true });
    tTrack.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 45) (dx < 0 ? next() : prev()); else restart();
    }, { passive: true });

    go(0);
  }

  /* -------------------------------------------------------------- accordion */
  const accs = $$('.acc');

  accs.forEach((acc) => {
    const q = $('.acc__q', acc);
    const a = $('.acc__a', acc);

    if (acc.classList.contains('is-open') && a) a.style.maxHeight = a.scrollHeight + 'px';

    if (!q) return;
    q.addEventListener('click', () => {
      const wasOpen = acc.classList.contains('is-open');

      accs.forEach((other) => {
        other.classList.remove('is-open');
        const oa = $('.acc__a', other);
        if (oa) oa.style.maxHeight = null;
      });

      if (!wasOpen) {
        acc.classList.add('is-open');
        if (a) a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });

  /* ==========================================================================
     RESULT / CERTIFICATE — front-end demo only.
     No database yet: a record is derived deterministically from the input so
     the same roll number always shows the same sample result.
     ========================================================================== */
  (function resultChecker() {
    const form = $('#resultForm');
    if (!form) return;

    const rollIn   = $('#rRoll');
    const tradeIn  = $('#rTrade');
    const sessionIn = $('#rSession');
    const out      = $('#resultOut');
    const btnText  = $('#resultBtnText');
    const hint     = $('.result__hint', form);
    const rollLabel = $('label[for="rRoll"]', form);

    const el = {
      badge: $('#rBadge'), title: $('#rTitle'), name: $('#rName'), roll: $('#rRollNo'),
      trade: $('#rTradeVal'), session: $('#rSessionVal'), date: $('#rDate'),
      grade: $('#rGrade'), score: $('#rScore'), bar: $('#rScoreBar')
    };

    const NAMES = [
      ['মোঃ রফিকুল ইসলাম', 'Md. Rafiqul Islam'],
      ['সাদিয়া আক্তার', 'Sadia Akter'],
      ['মোঃ জাহিদ হাসান', 'Md. Zahid Hasan'],
      ['নুসরাত জাহান', 'Nusrat Jahan'],
      ['আব্দুল করিম', 'Abdul Karim'],
      ['তানভীর আহমেদ', 'Tanvir Ahmed'],
      ['ফারজানা ইয়াসমিন', 'Farzana Yasmin'],
      ['মোঃ শাহীন আলম', 'Md. Shahin Alam'],
      ['রুবেল মিয়া', 'Rubel Mia'],
      ['সুমাইয়া ইসলাম', 'Sumaiya Islam'],
      ['মেহেদী হাসান', 'Mehedi Hasan'],
      ['জান্নাতুল ফেরদৌস', 'Jannatul Ferdous']
    ];

    let mode = 'result';
    let last = null;              /* enough state to re-render on a language switch */
    let quietRender = false;      /* true while the switcher re-prints the card */

    const hintFor = {
      result: ['ডেমো সাইট — যেকোনো নম্বর দিলেই একটি নমুনা ফলাফল দেখা যাবে। (নম্বরে ৯৯৯ থাকলে "রেকর্ড পাওয়া যায়নি" দেখাবে)',
               'Demo site — any number returns a sample result. (A number containing 999 shows "record not found".)'],
      verify: ['ডেমো সাইট — সার্টিফিকেট নম্বর দিয়ে সত্যতা যাচাইয়ের নমুনা ফলাফল দেখা যাবে।',
               'Demo site — a certificate number returns a sample verification report.']
    };

    /* deterministic hash so a given roll always yields the same record */
    function hash(str) {
      let h = 0;
      for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
      return h;
    }

    function gradeFor(score) {
      if (score >= 80) return { text: t('A+ — উত্তীর্ণ', 'A+ — Passed'), ok: true };
      if (score >= 70) return { text: t('A — উত্তীর্ণ', 'A — Passed'), ok: true };
      if (score >= 60) return { text: t('A- — উত্তীর্ণ', 'A- — Passed'), ok: true };
      if (score >= 50) return { text: t('B — উত্তীর্ণ', 'B — Passed'), ok: true };
      return { text: t('অকৃতকার্য', 'Failed'), ok: false };
    }

    /* every label on the form depends on both the tab and the language */
    function syncMode() {
      const verify = mode === 'verify';
      if (rollLabel) rollLabel.textContent = verify ? t('সার্টিফিকেট নম্বর', 'Certificate Number')
                                                    : t('রোল / রেজিস্ট্রেশন নম্বর', 'Roll / Registration Number');
      if (rollIn) rollIn.placeholder = verify ? t('যেমন: CERT-2025-0142', 'e.g. CERT-2025-0142')
                                              : t('যেমন: BISTI-2025-0142', 'e.g. BISTI-2025-0142');
      if (btnText) btnText.textContent = verify ? t('সার্টিফিকেট যাচাই করুন', 'Verify Certificate')
                                                : t('ফলাফল দেখুন', 'View Result');
      if (hint) hint.textContent = t(hintFor[mode][0], hintFor[mode][1]);
    }

    /* tab switching */
    $$('.result__tab', form).forEach((tab) => {
      tab.addEventListener('click', () => {
        mode = tab.dataset.mode || 'result';
        $$('.result__tab', form).forEach((t2) => {
          const on = t2 === tab;
          t2.classList.toggle('is-active', on);
          t2.setAttribute('aria-selected', String(on));
        });

        syncMode();
        if (out) out.hidden = true;
        last = null;
      });
    });

    /* search */
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const roll = (rollIn.value || '').trim();
      rollIn.classList.remove('is-error');

      if (roll.length < 4) {
        rollIn.classList.add('is-error');
        if (out) out.hidden = true;
        if (hint) {
          hint.textContent = t('অনুগ্রহ করে কমপক্ষে ৪ অক্ষরের একটি সঠিক নম্বর লিখুন।',
                               'Please enter a valid number of at least 4 characters.');
          hint.style.color = 'var(--maroon-600)';
        }
        rollIn.focus();
        return;
      }
      if (hint) { hint.textContent = t(hintFor[mode][0], hintFor[mode][1]); hint.style.color = ''; }

      const verify = mode === 'verify';

      /* real submit button state (prototype — resolves instantly) */
      const submitBtn = $('button[type="submit"]', form);
      submitBtn && submitBtn.classList.add('is-busy');

      setTimeout(() => {
        submitBtn && submitBtn.classList.remove('is-busy');

        if (/999/.test(roll)) {
          renderNotFound(roll, verify);
          return;
        }
        renderFound(roll, verify);
      }, 550);
    });

    function renderNotFound(roll, verify) {
      last = { roll: roll, verify: verify, found: false };

      el.badge.textContent = verify ? t('যাচাই করা যায়নি', 'Not verifiable') : t('পাওয়া যায়নি', 'Not found');
      el.badge.classList.add('is-fail');
      el.title.textContent = verify ? t('সার্টিফিকেট যাচাই রিপোর্ট', 'Certificate Verification Report')
                                    : t('ফলাফল অনুসন্ধান', 'Result Search');
      el.name.textContent = '—';
      el.roll.textContent = roll;
      el.trade.textContent = '—';
      el.session.textContent = '—';
      el.date.textContent = bnDate(new Date());
      el.grade.textContent = t('কোনো রেকর্ড পাওয়া যায়নি', 'No record found');
      el.grade.classList.remove('rcard__grade');
      el.score.textContent = '—';
      if (el.bar) el.bar.style.width = '0%';
      show();
    }

    function renderFound(roll, verify) {
      last = { roll: roll, verify: verify, found: true };

      const h = hash(roll + '|' + (tradeIn.value || '') + '|' + (sessionIn.value || ''));
      const score = 58 + (h % 41);                    /* 58 – 98 */
      const g = gradeFor(score);
      const trade = tradeIn.value || ['Electrical', 'Welding', 'Plumbing', 'Computer / IT'][h % 4];
      const session = sessionIn.value || t('২০২৫ — ব্যাচ ', '2025 — Batch ') + bn(1 + (h % 3));

      /* a stable, plausible assessment date */
      const d = new Date();
      d.setMonth(d.getMonth() - (h % 7));
      d.setDate(3 + (h % 24));

      el.badge.textContent = verify ? t('যাচাইকৃত', 'Verified')
                                    : (g.ok ? t('উত্তীর্ণ', 'Passed') : t('অকৃতকার্য', 'Failed'));
      el.badge.classList.toggle('is-fail', !g.ok);
      el.title.textContent = verify ? t('সার্টিফিকেট যাচাই রিপোর্ট', 'Certificate Verification Report')
                                    : t('ফলাফল / সার্টিফিকেট রেকর্ড', 'Result / Certificate Record');

      el.name.textContent = t(NAMES[h % NAMES.length][0], NAMES[h % NAMES.length][1]);
      el.roll.textContent = roll;
      el.trade.textContent = trade;
      el.session.textContent = session;
      el.date.textContent = bnDate(d);
      el.grade.textContent = g.text;
      el.grade.classList.toggle('rcard__grade', g.ok);
      el.score.textContent = bn(score) + ' / ' + bn(100);

      show();

      /* animate the score bar from zero every time */
      if (el.bar) {
        el.bar.style.width = '0%';
        setTimeout(() => { el.bar.style.width = score + '%'; }, 120);
      }
    }

    /* called by the language switcher — re-prints whatever is on screen */
    function relabel() {
      syncMode();
      if (!last || !out || out.hidden) return;
      quietRender = true;
      try {
        if (last.found) renderFound(last.roll, last.verify);
        else renderNotFound(last.roll, last.verify);
      } finally {
        quietRender = false;
      }
    }

    function show() {
      if (!out) return;
      out.hidden = false;

      /* a language switch only re-prints the card — it must not re-animate it
         or yank the page down to it again */
      if (quietRender) return;

      out.style.animation = 'none';
      void out.offsetWidth;          /* restart the entrance animation */
      out.style.animation = '';

      if (window.innerWidth < 993) {
        setTimeout(() => {
          window.scrollTo({
            top: out.getBoundingClientRect().top + window.scrollY - offset() - 12,
            behavior: reduced ? 'auto' : 'smooth'
          });
        }, 180);
      }
    }

    /* the download links are placeholders in this prototype */
    $$('.rcard__actions a', out || document).forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const note = $('.rcard__note');
        if (!note || note.dataset.busy) return;
        note.dataset.busy = '1';
        const original = note.innerHTML;
        note.innerHTML = '<svg class="ic ic--xs"><use href="#i-file"/></svg> ' +
          t('ডেমো প্রোটোটাইপ — ডাউনলোড লাইভ সাইটে চালু হবে।',
            'Demo prototype — downloads work on the live site.');
        setTimeout(() => { note.innerHTML = original; delete note.dataset.busy; }, 2600);
      });
    });

    /* let the language switcher reach back in */
    syncMode();
    document.addEventListener('bisti:lang', relabel);
  })();

  /* ---------------------------------------------------------------- forms */
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
        note.textContent = t('অনুগ্রহ করে সব প্রয়োজনীয় ঘর সঠিকভাবে পূরণ করুন।',
                             'Please fill in all the required fields correctly.');
        note.classList.remove('is-ok');
        note.classList.add('is-bad');
        return;
      }

      const btn = $('button[type="submit"]', form);
      const original = btn ? btn.innerHTML : '';
      if (btn) { btn.disabled = true; btn.innerHTML = t('পাঠানো হচ্ছে…', 'Sending…'); }

      /* front-end prototype: no backend yet */
      setTimeout(() => {
        note.textContent = t(okMessage[0], okMessage[1]);
        note.classList.remove('is-bad');
        note.classList.add('is-ok');
        form.reset();
        if (btn) { btn.disabled = false; btn.innerHTML = original; }
      }, 900);
    });

    $$('input, textarea, select', form).forEach((f) => {
      f.addEventListener('input', () => f.classList.remove('is-error'));
    });
  }

  handleForm('admissionForm', 'formNote', [
    'ধন্যবাদ! আপনার আবেদন গ্রহণ করা হয়েছে — আমাদের অ্যাডমিশন অফিসার শীঘ্রই যোগাযোগ করবেন।',
    'Thank you! Your application has been received — our admission officer will contact you shortly.'
  ]);
  handleForm('contactForm', 'contactNote', [
    'ধন্যবাদ! আপনার বার্তা পাঠানো হয়েছে। আমরা দ্রুত উত্তর দেব।',
    'Thank you! Your message has been sent. We will reply soon.'
  ]);
  handleForm('subscribeForm', 'subNote', [
    'সাবস্ক্রাইব সফল হয়েছে। ধন্যবাদ!',
    'Subscribed successfully. Thank you!'
  ]);

  /* --------------------------------------------------------------- ripple */
  $$('.btn, .tslider__btn, .hslide__pause').forEach((btn) => {
    btn.addEventListener('click', function (e) {
      if (reduced) return;
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

  /* ----------------------------------------------------------------- tilt */
  if (!reduced && window.matchMedia('(hover: hover)').matches) {
    $$('.program, .member, .post, .ccard').forEach((card) => {
      card.classList.add('tilt');
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform =
          'perspective(900px) rotateY(' + (px * 5).toFixed(2) + 'deg) rotateX(' +
          (-py * 5).toFixed(2) + 'deg) translateY(-10px)';
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  /* ---------------------------------------------------------- back to top */
  if (toTop) {
    toTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    });
  }

  /* ---------------------------------------------------- image fallback net */
  window.addEventListener('error', (e) => {
    const el = e.target;
    if (el && el.tagName === 'IMG' && !el.dataset.failed) {
      el.dataset.failed = '1';
      el.style.background = 'linear-gradient(135deg,#0e2f7d,#3d8bd4)';
      el.style.objectFit = 'cover';
      el.removeAttribute('src');
    }
  }, true);

  /* ------------------------------------------------------------------ misc */
  const year = $('#year');
  const setYear = () => { if (year) year.textContent = bn(new Date().getFullYear()); };
  setYear();

  /* Anything JavaScript owns has to be reprinted when the language changes —
     i18n.js skips these nodes on purpose so it cannot clobber them. */
  document.addEventListener('bisti:lang', () => {
    setYear();
    refreshCounters();
    if (heroRelabel) heroRelabel();
    if (tRelabel) tRelabel();
  });

  onScroll();
  spy();
})();
