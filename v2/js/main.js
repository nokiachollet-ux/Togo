/* =========================================================
   Les Mains de l'Espérance Internationale — script commun
   Volontairement sobre : menu, compte à rebours, questions
   fréquentes, formulaire et apparition douce des blocs.
   Aucune bibliothèque externe.
   ========================================================= */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- En-tête : ombre au défilement ---------- */
  var gnav = $('.gnav');
  if (gnav) {
    var onScroll = function () { gnav.classList.toggle('is-scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Menu mobile ---------- */
  var burger = $('.gnav__burger');
  function closeMenu() {
    gnav.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Ouvrir le menu');
    document.documentElement.classList.remove('menu-open');
  }
  if (burger && gnav) {
    /* Le panneau du menu se place juste sous l'en-tête, là où il est à l'écran */
    var placeMenu = function () { gnav.style.setProperty('--menu-top', Math.max(0, gnav.getBoundingClientRect().bottom) + 'px'); };
    burger.addEventListener('click', function () {
      placeMenu();
      var open = gnav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open);
      burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
      document.documentElement.classList.toggle('menu-open', open);
    });
    $$('.gnav__mobile a').forEach(function (a) { a.addEventListener('click', closeMenu); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && gnav.classList.contains('is-open')) closeMenu(); });
    window.addEventListener('resize', function () {
      if (!gnav.classList.contains('is-open')) return;
      if (window.innerWidth > 1100) closeMenu(); else placeMenu();
    });
  }

  /* ---------- Compte à rebours : mission au Togo ---------- */
  $$('[data-countdown]').forEach(function (box) {
    var start = new Date(box.dataset.countdown + 'T00:00:00');
    var end = new Date((box.dataset.end || box.dataset.countdown) + 'T23:59:59');
    var now = new Date();
    var num = $('.countdown__num', box), label = $('.countdown__label', box);
    if (!num || isNaN(start)) return;
    var days = Math.ceil((start - now) / 86400000);
    if (days > 0) {
      num.textContent = days;
      label.innerHTML = '<strong>jour' + (days > 1 ? 's' : '') + '</strong>avant le départ';
    } else if (now <= end) {
      num.textContent = 'J';
      label.innerHTML = '<strong>Mission en cours</strong>au Togo';
    } else {
      num.textContent = '✓';
      label.innerHTML = '<strong>Mission réalisée</strong>merci à tous';
    }
  });

  /* ---------- Arrivée sur une ancre depuis une autre page ----------
     Le navigateur se place sur la section avant le chargement des polices,
     qui décale ensuite la page : on se recale une fois tout chargé. */
  if (window.location.hash.length > 1) {
    var anchor = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
    if (anchor) {
      var realign = function () { anchor.scrollIntoView({ block: 'start', behavior: 'instant' }); };
      var userMoved = false;
      ['wheel', 'touchmove', 'keydown'].forEach(function (ev) { window.addEventListener(ev, function () { userMoved = true; }, { once: true, passive: true }); });
      var settle = function () { if (!userMoved) realign(); };
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(settle);
      window.addEventListener('load', function () { settle(); setTimeout(settle, 300); });
    }
  }

  /* ---------- Questions fréquentes ---------- */
  $$('.faq__item').forEach(function (item) {
    var btn = $('.faq__q', item), panel = $('.faq__a', item);
    if (!btn || !panel) return;
    btn.addEventListener('click', function () {
      var open = item.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open);
      if (open) {
        panel.style.height = panel.scrollHeight + 'px';
        var done = function () { if (item.classList.contains('is-open')) panel.style.height = 'auto'; panel.removeEventListener('transitionend', done); };
        panel.addEventListener('transitionend', done);
        if (reduceMotion) panel.style.height = 'auto';
      } else {
        panel.style.height = panel.scrollHeight + 'px';
        panel.offsetHeight; /* force le recalcul avant de refermer */
        panel.style.height = '0px';
      }
    });
  });

  /* ---------- Formulaire de contact ---------- */
  var form = $('.contact-form');
  if (form) {
    var status = $('.form-status', form);
    /* Sujet présélectionné depuis un lien : contact.html?sujet=don */
    var sujetParam = new URLSearchParams(window.location.search).get('sujet');
    var sujetSelect = $('#sujet', form);
    if (sujetParam && sujetSelect) {
      $$('option', sujetSelect).forEach(function (o) { if (o.dataset.key === sujetParam) sujetSelect.value = o.value; });
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var fields = $$('[required]', form), firstBad = null;
      fields.forEach(function (f) {
        var bad = !f.checkValidity();
        f.closest('.field').classList.toggle('is-invalid', bad);
        f.setAttribute('aria-invalid', bad);
        if (bad && !firstBad) firstBad = f;
      });
      if (firstBad) {
        status.textContent = 'Merci de compléter les champs indiqués.';
        status.className = 'form-status is-error';
        firstBad.focus();
        return;
      }
      var d = new FormData(form);
      var body = 'Nom : ' + d.get('nom') + '\nEmail : ' + d.get('email') + '\nTéléphone : ' + (d.get('telephone') || '-') +
                 '\nVous êtes : ' + d.get('profil') + '\nSujet : ' + d.get('sujet') + '\n\n' + d.get('message');
      var to = form.dataset.to || '';
      window.location.href = 'mailto:' + to + '?subject=' + encodeURIComponent('Les Mains de l\'Espérance — ' + d.get('sujet')) + '&body=' + encodeURIComponent(body);
      status.textContent = 'Merci ! Votre logiciel de messagerie va s\'ouvrir avec votre message prêt à envoyer.';
      status.className = 'form-status is-ok';
    });
    $$('input, select, textarea', form).forEach(function (f) {
      f.addEventListener('input', function () {
        if (f.checkValidity()) { f.closest('.field').classList.remove('is-invalid'); f.removeAttribute('aria-invalid'); }
      });
    });
  }

  /* ---------- Apparition douce des blocs ----------
     Seuls les blocs situés sous le premier écran sont concernés :
     rien ne clignote au chargement, et tout reste visible sans JavaScript. */
  if (reduceMotion || !('IntersectionObserver' in window)) return;

  var targets = [];
  $$('.reveal, .reveal-stagger, .tiles, .program__track, .stats__grid, .audience__grid, .pillars__grid, .method__steps').forEach(function (el) {
    $$(':scope > *', el).forEach(function (child, i) { child.dataset.delay = Math.min(i, 5) * 80; targets.push(child); });
  });
  $$('.reveal-up, .reveal-photo, .split__text, .photo, .panel__head, .section-head, .cta__inner, .faq__grid > header').forEach(function (el) {
    if (targets.indexOf(el) === -1) targets.push(el);
  });

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      el.style.transitionDelay = (el.dataset.delay || 0) + 'ms';
      el.classList.add('is-shown');
      el.classList.remove('is-hidden');
      io.unobserve(el);
      /* une fois apparu, le bloc retrouve ses propres transitions (survol) */
      setTimeout(function () { el.classList.remove('is-shown'); el.style.transitionDelay = ''; }, 1400);
    });
  }, { rootMargin: '0px 0px -8% 0px' });

  targets.forEach(function (el) {
    if (el.getBoundingClientRect().top > window.innerHeight) {
      el.classList.add('is-hidden');
      io.observe(el);
    }
  });
})();
