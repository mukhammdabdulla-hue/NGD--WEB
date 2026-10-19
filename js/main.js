(function () {
  // Header shadow on scroll
  var header = document.getElementById('header');
  function onScroll() { header.classList.toggle('scrolled', window.scrollY > 10); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  function closeMenu() {
    burger.classList.remove('open');
    nav.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  burger.addEventListener('click', function () {
    var open = !nav.classList.contains('open');
    burger.classList.toggle('open', open);
    nav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });
  nav.querySelectorAll('a[href^="#"]').forEach(function (a) { a.addEventListener('click', closeMenu); });

  // Active menu item while scrolling
  var links = nav.querySelectorAll('a[href^="#"]:not(.active)');
  var sections = Array.prototype.map.call(links, function (a) { return document.querySelector(a.getAttribute('href')); });

  // Reveal on scroll + section tracking
  if ('IntersectionObserver' in window) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(function (el) { revealObs.observe(el); });

    var navObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { if (s) navObs.observe(s); });

    // Count-up stats
    var countObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, end = +el.dataset.count, suffix = el.dataset.suffix || '';
        var start = end > 1000 ? end - 30 : 0, t0 = null;
        function step(t) {
          if (!t0) t0 = t;
          var p = Math.min((t - t0) / 1200, 1);
          el.textContent = Math.round(start + (end - start) * (1 - Math.pow(1 - p, 3))) + suffix;
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        countObs.unobserve(el);
      });
    }, { threshold: 0.6 });
    document.querySelectorAll('[data-count]').forEach(function (el) { countObs.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('visible'); });
  }

  // Portfolio filter
  var filters = document.querySelectorAll('.filter');
  var projects = document.querySelectorAll('.project');
  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filters.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var f = btn.dataset.filter;
      projects.forEach(function (p) { p.classList.toggle('hidden', f !== 'all' && p.dataset.cat !== f); });
    });
  });

  // Contact form: validate, then open the mail client with the request
  var form = document.getElementById('form');
  var note = document.getElementById('formNote');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = true;
    form.querySelectorAll('[required]').forEach(function (inp) {
      var bad = !inp.value.trim();
      inp.classList.toggle('invalid', bad);
      if (bad) ok = false;
    });
    if (!ok) {
      note.className = 'form__note err';
      note.textContent = "Iltimos, ism va telefon raqamingizni kiriting.";
      return;
    }
    var d = new FormData(form);
    var body = 'Ism: ' + d.get('name') + '\nTelefon: ' + d.get('phone') + '\nKompaniya: ' + d.get('company') +
      '\nXizmat: ' + d.get('service') + '\n\n' + d.get('message');
    window.location.href = 'mailto:info@ngd.uz?subject=' + encodeURIComponent('Saytdan ariza: ' + d.get('service')) +
      '&body=' + encodeURIComponent(body);
    note.className = 'form__note ok';
    note.textContent = "Rahmat! Arizangiz pochta dasturida ochildi, yuborishni tasdiqlang.";
    form.reset();
  });

  // Process line fills as the steps scroll into view
  var steps = document.getElementById('steps');
  function fillSteps() {
    if (!steps) return;
    var r = steps.getBoundingClientRect(), vh = window.innerHeight;
    var p = Math.min(Math.max((vh * 0.85 - r.top) / (r.height + vh * 0.35), 0), 1);
    steps.style.setProperty('--progress', p.toFixed(3));
  }
  window.addEventListener('scroll', fillSteps, { passive: true });
  window.addEventListener('resize', fillSteps);
  fillSteps();

  // Xaosdan tizimga: plitkalar scroll bilan tartibga tushadi
  var order = document.getElementById('order');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (order && !reduce) {
    var tiles = order.querySelectorAll('.tile');
    function scatter() {
      var s = Math.min(window.innerWidth / 1200, 1);
      tiles.forEach(function (t, i) {
        var a = i * 2.4 + 0.7;
        t.style.setProperty('--dx', (Math.cos(a) * 90 + (i % 3 - 1) * 40) * s);
        t.style.setProperty('--dy', (Math.sin(a * 1.3) * 110 + (i % 2 ? 40 : -30)) * s);
        t.style.setProperty('--r', ((i * 37) % 50) - 25);
      });
    }
    function sortTiles() {
      var r = order.getBoundingClientRect();
      var total = order.offsetHeight - window.innerHeight;
      var p = Math.min(Math.max(-r.top / (total * 0.8), 0), 1);
      p = 1 - Math.pow(1 - p, 2);
      order.style.setProperty('--p', p.toFixed(3));
      order.classList.toggle('is-done', p > 0.92);
    }
    scatter();
    sortTiles();
    window.addEventListener('scroll', sortTiles, { passive: true });
    window.addEventListener('resize', function () { scatter(); sortTiles(); });
  }

  document.getElementById('year').textContent = new Date().getFullYear();
})();
