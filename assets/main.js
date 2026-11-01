(function () {
  // Paste the form's web-app address here once it is connected.
  // While it is empty the form offers an email instead of claiming the message was sent.
  var FORM_ENDPOINT = '';
  var BUSINESS_EMAIL = 'ss0583251357@gmail.com';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  /* Mobile menu */
  var menuBtn = $('.menu-btn');
  var nav = $('.nav');
  if (menuBtn) {
    var setMenu = function (open) {
      nav.classList.toggle('open', open);
      menuBtn.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    };
    menuBtn.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
    $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  }

  /* Accessibility statement */
  var dlg = $('#a11y');
  $$('[data-a11y]').forEach(function (b) { b.addEventListener('click', function () { dlg.showModal(); }); });
  if (dlg) $('button', dlg).addEventListener('click', function () { dlg.close(); });

  /* Reveal what starts below the fold */
  if (!reduced && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('revealed'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    $$('[data-reveal]').forEach(function (el) {
      if (el.getBoundingClientRect().top > window.innerHeight) { el.classList.add('will-reveal'); io.observe(el); }
    });
  }

  /* Count up */
  var counters = $$('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        cio.unobserve(e.target);
        if (reduced) return;
        var end = +e.target.dataset.count, suffix = e.target.dataset.suffix || '', t0 = performance.now();
        (function tick(t) {
          var p = clamp((t - t0) / 1500, 0, 1), eased = 1 - Math.pow(1 - p, 3);
          e.target.textContent = Math.round(end * eased) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        })(t0);
      });
    }, { threshold: .4 });
    counters.forEach(function (c) { cio.observe(c); });
  }

  /* Words light up while scrolling */
  var oneText = $('.one-text');
  var words = [];
  if (oneText) {
    var src = oneText.textContent.trim();
    oneText.setAttribute('aria-label', src);
    oneText.innerHTML = src.split(/\s+/).map(function (w) { return '<span aria-hidden="true">' + w + '</span>'; }).join(' ');
    words = $$('span', oneText);
    if (reduced) words.forEach(function (w) { w.classList.add('on'); });
  }

  /* Services: the row nearest the middle (or under the pointer) drives the ring image */
  var rows = $$('.svc-row');
  var photos = $$('.orb-photos[data-swap] img');
  var hoverLock = false;
  function activate(i) {
    rows.forEach(function (r, n) { r.classList.toggle('on', n === i); });
    photos.forEach(function (p, n) { p.classList.toggle('on', n === i); });
  }
  rows.forEach(function (r, i) {
    r.addEventListener('mouseenter', function () { hoverLock = true; activate(i); });
    r.addEventListener('mouseleave', function () { hoverLock = false; });
    r.addEventListener('focusin', function () { activate(i); });
  });

  /* Scroll-driven scenes */
  var hero = $('.hero');
  var stick = $('.hero-stick');
  var steps = $('.steps');
  var stepItems = steps ? $$('.step', steps) : [];
  var parallax = $$('[data-parallax]');
  var head = $('.site-head');
  var bar = $('.call-bar');
  var ticking = false;

  function heroScene(vw, vh) {
    var narrow = vw <= 960;
    var R0 = narrow ? Math.min(vw * .28, vh * .16) : Math.min(vw * .18, vh * .28);
    var x0 = narrow ? vw * .5 : vw * .26;
    var y0 = narrow ? vh * .76 : vh * .54;
    var span = hero.offsetHeight - vh;
    var p = reduced ? 0 : clamp(window.scrollY / Math.max(1, span), 0, 1);
    var open = p * p * (3 - 2 * p);
    var maxR = Math.hypot(vw, vh);
    var r = R0 + (maxR - R0) * open;
    var x = x0 + (vw / 2 - x0) * open;
    var y = y0 + (vh / 2 - y0) * open;
    var s = stick.style;
    s.setProperty('--r', r + 'px');
    s.setProperty('--x', x + 'px');
    s.setProperty('--y', y + 'px');
    var z0 = narrow ? (R0 * 2 * 1.45) / vh : 1.18;
    // On phones the photo reaches full size early and stays anchored to the bottom, so the opening circle never shows its edge
    var zoom = narrow ? z0 + (1 - z0) * Math.min(1, open / .3) : z0 + (1 - z0) * open;
    s.setProperty('--zoom', zoom);
        s.setProperty('--hy', (narrow ? vh * (1 - zoom) / 2 : 0) + 'px');
    s.setProperty('--shade', clamp((p - .45) * 2.2, 0, 1));
    s.setProperty('--lift', 1 + .2 * open);
    // The ring's inner edge sits on the gold circle (342/562 of its radius)
    s.setProperty('--ring', (R0 / (342 / 562)) * 2 + 'px');
    s.setProperty('--rx', x + 'px');
    s.setProperty('--ry', y + 'px');
    s.setProperty('--rs', r / R0);
    s.setProperty('--ro', clamp(1 - p * 2.4, 0, 1));
    s.setProperty('--co', clamp(1 - p * 3.2, 0, 1));
    s.setProperty('--cy', (-p * 90) + 'px');
    s.setProperty('--ao', clamp((p - .62) * 3.5, 0, 1));
    s.setProperty('--ay', (1 - clamp((p - .62) * 3.5, 0, 1)) * 30 + 'px');
  }

  function onScroll() {
    ticking = false;
    var vw = document.documentElement.clientWidth, vh = window.innerHeight;
    if (hero) heroScene(vw, vh);
    if (head) head.classList.toggle('is-stuck', window.scrollY > 30);
    if (bar) bar.classList.toggle('show', window.scrollY > vh * .6);

    if (words.length && !reduced) {
      var b = oneText.getBoundingClientRect();
      var prog = clamp((vh * .85 - b.top) / (b.height + vh * .35), 0, 1);
      var lit = Math.round(prog * words.length);
      words.forEach(function (w, i) { w.classList.toggle('on', i < lit); });
    }

    if (rows.length && !hoverLock) {
      var best = 0, dist = Infinity;
      rows.forEach(function (r, i) {
        var q = r.getBoundingClientRect(), d = Math.abs(q.top + q.height / 2 - vh * (vw <= 960 ? .66 : .5));
        if (d < dist) { dist = d; best = i; }
      });
      activate(best);
    }

    if (steps) {
      var sb = steps.getBoundingClientRect();
      var sp = reduced ? 1 : clamp((vh * .8 - sb.top) / (vh * .55 + sb.height * .4), 0, 1);
      steps.style.setProperty('--p', sp);
      stepItems.forEach(function (it, i) { it.classList.toggle('on', sp >= i / stepItems.length - .001 && sp > 0); });
    }

    if (!reduced) {
      parallax.forEach(function (el) {
        var q = el.parentElement.getBoundingClientRect();
        if (q.bottom < 0 || q.top > vh) return;
        var t = (q.top + q.height / 2 - vh / 2) / vh;
        el.style.setProperty('--py', (-8 + t * -8) + '%');
      });
    }
  }
  /* The silver highlight follows the pointer */
  var silver = $$('.silver');
  if (!reduced && window.matchMedia('(hover: hover)').matches) {
    silver.forEach(function (el) {
      var pending = null;
      el.addEventListener('pointermove', function (e) {
        var q = el.getBoundingClientRect();
        var first = pending === null;
        pending = [e.clientX - q.left, e.clientY - q.top];
        if (first) requestAnimationFrame(function () {
          el.style.setProperty('--mx', pending[0] + 'px');
          el.style.setProperty('--my', pending[1] + 'px');
          pending = null;
        });
      });
    });
  }

  function requestTick() { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }
  window.addEventListener('scroll', requestTick, { passive: true });
  window.addEventListener('resize', requestTick);
  onScroll();

  /* Contact form */
  var form = $('#contact-form');
  if (form) {
    var messages = { name: 'נשמח לדעת איך לפנות אליכם', phone: 'כדי שנוכל לחזור אליכם, נא למלא מספר טלפון תקין' };
    var check = function (input) {
      var err = $('.err', input.closest('.field'));
      var bad = input.required && !input.value.trim();
      if (input.name === 'phone' && input.value.replace(/\D/g, '').length < 9) bad = true;
      if (err) err.textContent = bad ? messages[input.name] : '';
      input.setAttribute('aria-invalid', String(bad));
      return !bad;
    };
    var required = $$('[required]', form);
    required.forEach(function (i) { i.addEventListener('blur', function () { check(i); }); });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = required.map(check).every(Boolean);
      if (!ok) { $('[aria-invalid="true"]', form).focus(); return; }

      var d = new FormData(form);
      var box = $('#form-result');
      if (FORM_ENDPOINT) {
        var btn = $('button[type=submit]', form);
        btn.disabled = true;
        d.append('page', location.href);
        fetch(FORM_ENDPOINT, { method: 'POST', mode: 'no-cors', body: new URLSearchParams(d) })
          .then(function () {
            form.hidden = true;
            box.hidden = false;
            $('h3', box).textContent = 'קיבלנו, תודה.';
            $('p', box).textContent = 'נחזור אליכם בהקדם לתיאום שיחה.';
            $('a', box).hidden = true;
          })
          .catch(function () {
            btn.disabled = false;
            box.hidden = false;
            $('h3', box).textContent = 'הפנייה לא נשלחה';
            $('p', box).textContent = 'משהו השתבש בחיבור. אפשר לנסות שוב או להתקשר אלינו: 058-3251357.';
            $('a', box).hidden = true;
          });
        return;
      }
      var body = 'שם: ' + d.get('name') + '\nטלפון: ' + d.get('phone') + '\nדוא"ל: ' + (d.get('email') || '-') + '\nסוג השירות: ' + (d.get('service') || '-') + '\n\n' + (d.get('message') || '');
      $('a', box).href = 'mailto:' + BUSINESS_EMAIL + '?subject=' + encodeURIComponent('פנייה מהאתר: ' + d.get('name')) + '&body=' + encodeURIComponent(body);
      box.hidden = false;
      box.scrollIntoView({ block: 'nearest', behavior: reduced ? 'auto' : 'smooth' });
    });
  }
})();
