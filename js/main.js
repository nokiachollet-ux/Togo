/* =========================================================
   Les Mains de l'Espérance Internationale — animations
   (GSAP + ScrollTrigger, reprises du site « test 1 »)
   Script commun à toutes les pages : chaque bloc vérifie
   que ses éléments existent avant de s'exécuter.
   ========================================================= */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var isTouch = window.matchMedia('(hover: none)').matches;
  var loader = $('.loader');

  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Menu mobile ---------- */
  var gnav = $('.gnav');
  var burger = $('.gnav__burger');
  function closeMenu() {
    gnav.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Ouvrir le menu');
    document.documentElement.classList.remove('menu-open');
  }
  if (burger) {
    burger.addEventListener('click', function () {
      var open = gnav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open);
      burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
      document.documentElement.classList.toggle('menu-open', open);
    });
    $$('.gnav__mobile a').forEach(function (a) { a.addEventListener('click', closeMenu); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && gnav.classList.contains('is-open')) closeMenu(); });
    window.addEventListener('resize', function () { if (window.innerWidth > 833 && gnav.classList.contains('is-open')) closeMenu(); });
  }

  /* Bouton menu de la barre collante : remonte en haut de page puis ouvre le menu */
  $$('.lnav__burger').forEach(function (b) {
    b.addEventListener('click', function () {
      window.scrollTo(0, 0);
      if (burger && !gnav.classList.contains('is-open')) burger.click();
      if (burger) burger.focus();
    });
  });

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
      num.dataset.count = days;
      label.innerHTML = '<strong>jour' + (days > 1 ? 's' : '') + '</strong>avant le départ';
    } else if (now <= end) {
      num.textContent = 'J';
      label.innerHTML = '<strong>Mission en cours</strong>au Togo';
    } else {
      num.textContent = '✓';
      label.innerHTML = '<strong>Mission réalisée</strong>merci à tous';
    }
  });

  /* ---------- Formes de particules ---------- */
  var orb = { spread: 1, scale: 1, rotSpeed: 1, alpha: 1 };
  var canvas = $('.hero__canvas');
  if (canvas && canvas.getContext) initOrb(canvas, canvas.dataset.shape || 'sphere');

  function buildShape(shape, N) {
    var pts = [], i, golden = Math.PI * (3 - Math.sqrt(5));
    function push(x, y, z, extra) {
      var p = {
        x: x, y: y, z: z,
        sx: (Math.random() - 0.5) * 6, sy: (Math.random() - 0.5) * 6, sz: (Math.random() - 0.5) * 6,
        s: Math.random(), blue: Math.random() < 0.38
      };
      if (extra) for (var k in extra) p[k] = extra[k];
      pts.push(p);
    }
    if (shape === 'heart') {
      /* Cœur « gonflé » : la courbe classique, répartie sur plusieurs épaisseurs */
      for (i = 0; i < N; i++) {
        var t = Math.random() * Math.PI * 2;
        var zz = Math.random() * 2 - 1, kk = Math.sqrt(1 - zz * zz) * (0.9 + Math.random() * 0.1);
        var hx = 16 * Math.pow(Math.sin(t), 3) / 17;
        var hy = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 17;
        push(hx * kk, -(hy * kk) - 0.15, zz * 0.42);
      }
    } else if (shape === 'ring') {
      for (i = 0; i < N; i++) {
        var u = Math.random() * Math.PI * 2, v = Math.random() * Math.PI * 2;
        var rr = 0.78 + 0.26 * Math.cos(v);
        push(rr * Math.cos(u), 0.26 * Math.sin(v), rr * Math.sin(u));
      }
    } else if (shape === 'wave') {
      var cols = Math.round(Math.sqrt(N * 1.8)), rows = Math.round(N / cols);
      for (i = 0; i < cols; i++) for (var j = 0; j < rows; j++) {
        var gx = (i / (cols - 1)) * 2.6 - 1.3, gz = (j / (rows - 1)) * 1.8 - 0.9;
        push(gx, 0, gz, { wave: true });
      }
    } else {
      for (i = 0; i < N; i++) {
        var y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = golden * i;
        push(Math.cos(th) * r, y, Math.sin(th) * r);
      }
    }
    return pts;
  }

  function initOrb(cv, shape) {
    var ctx = cv.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, R = 0, small = false;
    var N = window.innerWidth < 700 ? 800 : 1500;
    var pts = buildShape(shape, N);
    var rotY = 0, rotX = shape === 'wave' ? 0.55 : (shape === 'heart' ? 0 : 0.35);
    var tX = 0, tY = 0, mX = 0, mY = 0, time = 0, visible = true;
    var yPos = parseFloat(cv.dataset.y || '0.36');

    function resize() {
      var rect = cv.getBoundingClientRect();
      W = rect.width; H = rect.height;
      small = W < 700;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      R = Math.min(W * (small ? 0.4 : 0.34), H * (H < 700 ? 0.19 : 0.25), 300);
    }
    resize();
    var rTimer;
    window.addEventListener('resize', function () { clearTimeout(rTimer); rTimer = setTimeout(resize, 120); });

    if (!isTouch) {
      window.addEventListener('pointermove', function (e) {
        tX = (e.clientX / window.innerWidth - 0.5);
        tY = (e.clientY / window.innerHeight - 0.5);
      });
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(cv);
    }

    function frame() {
      requestAnimationFrame(frame);
      if (!visible) return;
      time += reduceMotion ? 0 : 0.016;
      mX += (tX - mX) * 0.05; mY += (tY - mY) * 0.05;
      rotY += (reduceMotion ? 0 : (shape === 'wave' ? 0.0008 : 0.0022)) * orb.rotSpeed;
      /* Le cœur oscille doucement au lieu de tourner sur lui-même */
      var ry = shape === 'heart' ? Math.sin(rotY * 1.4) * 0.6 + mX * 0.6 : rotY + mX * 0.6;
      var rx = rotX + mY * 0.4;
      var beat = shape === 'heart' && !reduceMotion ? 1 + 0.035 * Math.pow(Math.max(0, Math.sin(time * 2.6)), 8) : 1;
      var cy = Math.cos(ry), sy = Math.sin(ry), cx = Math.cos(rx), sx = Math.sin(rx);
      var cxp = W / 2, cyp = H * (H < 700 ? yPos - 0.1 : (small ? yPos - 0.03 : yPos));
      var rad = R * orb.scale * beat, k = orb.spread;

      ctx.clearRect(0, 0, W, H);
      if (orb.alpha <= 0.01) return;

      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        var py0 = p.wave ? 0.16 * Math.sin(p.x * 3 + time * 1.2) * Math.cos(p.z * 2.4 + time * 0.8) : p.y;
        var x = p.x + (p.sx - p.x) * k, y = py0 + (p.sy - py0) * k, z = p.z + (p.sz - p.z) * k;
        var x1 = x * cy - z * sy, z1 = x * sy + z * cy;
        var y1 = y * cx - z1 * sx, z2 = y * sx + z1 * cx;
        var persp = 2.6 / (2.6 + z2);
        var px = cxp + x1 * rad * persp, py = cyp + y1 * rad * persp;
        var depth = Math.max(0, Math.min(1, (1 - z2) / 2));
        var a = (0.08 + depth * 0.85) * orb.alpha;
        var size = (0.5 + depth * 1.3 + p.s * 0.4) * persp;
        var rC, gC, bC;
        if (p.blue) { /* bleu des mains tendues */
          rC = Math.round(40 + 90 * depth); gC = Math.round(110 + 80 * depth); bC = 255;
        } else {      /* or de l'espérance */
          rC = Math.round(200 + 55 * depth); gC = Math.round(150 + 75 * depth); bC = Math.round(60 + 100 * depth);
        }
        ctx.fillStyle = 'rgba(' + rC + ',' + gC + ',' + bC + ',' + a.toFixed(3) + ')';
        ctx.fillRect(px, py, size, size);
      }
    }
    requestAnimationFrame(frame);
  }

  /* ---------- Accordéon FAQ (fonctionne sans GSAP) ---------- */
  $$('.faq__item').forEach(function (item) {
    var btn = $('.faq__q', item), panel = $('.faq__a', item);
    if (!btn || !panel) return;
    btn.addEventListener('click', function () {
      var open = item.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open);
      if (hasGsap && !reduceMotion) {
        gsap.to(panel, { height: open ? 'auto' : 0, duration: 0.6, ease: 'expo.out' });
      } else {
        panel.style.height = open ? 'auto' : '0px';
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

  /* ---------- Repli sans GSAP ou mouvement réduit ---------- */
  if (!hasGsap || reduceMotion) {
    orb.spread = 0;
    if (loader) loader.classList.add('is-done');
    document.body.classList.remove('is-loading');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  gsap.config({ nullTargetWarn: false });
  if (loader) document.body.classList.add('is-loading');

  /* ---------- Découpe des textes en mots ---------- */
  $$('[data-split]').forEach(function (el) {
    var words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map(function (w) { return '<span class="w">' + w + '</span>'; }).join(' ');
  });

  /* ---------- Introduction ---------- */
  var hero = $('.hero');
  if (hero) {
    var intro = gsap.timeline({ defaults: { ease: 'expo.out' } });
    gsap.set('.hero__content .mask > span', { yPercent: 115 });
    gsap.set('.hero__cta > *', { y: 24, opacity: 0 });
    gsap.set('.hero__halo', { scale: 0.4, opacity: 0 });
    gsap.set('.hero__scroll', { opacity: 0 });

    if (loader) {
      gsap.set('.lnav, .strip, .gnav__inner', { opacity: 0 });
      intro
        .from('.loader__logo', { scale: 0.6, opacity: 0, rotate: -20, duration: 1.1 })
        .from('.loader__word span', { yPercent: 110, duration: 0.9, stagger: 0.04 }, '-=0.8')
        .to('.loader__bar i', { scaleX: 1, duration: 0.9, ease: 'power2.inOut' }, '-=0.6')
        .to('.loader__word span', { yPercent: -110, duration: 0.6, stagger: 0.025, ease: 'expo.in' }, '+=0.1')
        .to('.loader__logo', { scale: 0.8, opacity: 0, duration: 0.6, ease: 'expo.in' }, '<')
        .to('.loader__bar', { opacity: 0, duration: 0.3 }, '<')
        .to('.loader', { opacity: 0, duration: 0.5, ease: 'power2.out', onComplete: function () {
            loader.classList.add('is-done'); document.body.classList.remove('is-loading');
          } })
        .addLabel('stage', '-=0.3')
        .to('.gnav__inner, .strip, .lnav', { opacity: 1, duration: 1, stagger: 0.1 }, 'stage+=1.6');
      setTimeout(function () { if (!loader.classList.contains('is-done')) intro.progress(1); }, 7000);
    } else {
      intro.addLabel('stage', -0.6);
    }

    intro
      .to(orb, { spread: 0, duration: 2.6, ease: 'expo.inOut' }, 'stage-=0.6')
      .fromTo(orb, { rotSpeed: 12 }, { rotSpeed: 1, duration: 3, ease: 'power3.out' }, 'stage-=0.6')
      .to('.hero__halo', { scale: 1, opacity: 1, duration: 2.4 }, 'stage+=0.6')
      .to('.hero__label .mask > span', { yPercent: 0, duration: 1.2 }, 'stage+=1.0')
      .to('.hero__title .mask > span', { yPercent: 0, duration: 1.4, stagger: 0.12 }, 'stage+=1.1')
      .to('.hero__sub .mask > span', { yPercent: 0, duration: 1.2 }, 'stage+=1.4')
      .to('.hero__cta > *', { y: 0, opacity: 1, duration: 1, stagger: 0.1 }, 'stage+=1.6')
      .to('.hero__scroll', { opacity: 1, duration: 1 }, 'stage+=2.2');

    gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } })
      .to(orb, { scale: 2.1, alpha: 0.15, ease: 'none' }, 0)
      .to('.hero__content', { yPercent: -30, opacity: 0, ease: 'none' }, 0)
      .to('.hero__halo', { scale: 1.8, opacity: 0, ease: 'none' }, 0)
      .to('.hero__scroll', { opacity: 0, duration: 0.15 }, 0);
  }

  /* ---------- Textes révélés mot à mot ---------- */
  $$('[data-split]').forEach(function (el) {
    gsap.to($$('.w', el), {
      opacity: 1, stagger: 0.08, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true }
    });
  });
  $$('.manifesto').forEach(function (m) {
    gsap.from($$('.eyebrow, .link, .manifesto__more > *, cite', m), {
      y: 24, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.1,
      scrollTrigger: { trigger: m, start: 'top 75%' }
    });
  });

  /* ---------- Révélations génériques ---------- */
  $$('.reveal').forEach(function (el) {
    gsap.from(el.children, {
      y: 48, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: 0.1,
      scrollTrigger: { trigger: el, start: 'top 85%' }
    });
  });
  $$('.reveal-up').forEach(function (el) {
    gsap.from(el, { y: 60, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
  });
  $$('.reveal-stagger').forEach(function (el) {
    gsap.from(el.children, {
      y: 60, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08,
      scrollTrigger: { trigger: el, start: 'top 85%' }
    });
  });

  $$('.reveal-frame').forEach(function (el, i) {
    var delay = window.innerWidth < 834 ? 0 : (i % 2) * 0.12;
    gsap.from(el, {
      clipPath: 'inset(18% 8% 0% 8% round 28px)', y: 80, duration: 1.6, ease: 'expo.out', delay: delay,
      scrollTrigger: { trigger: el, start: 'top 88%' }
    });
    gsap.from($$('.frame__copy > *', el), {
      y: 30, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.08, delay: 0.3 + delay,
      scrollTrigger: { trigger: el, start: 'top 75%' }
    });
  });

  /* Photos : ouverture en volet puis léger zoom */
  $$('.reveal-photo').forEach(function (el) {
    gsap.from(el, {
      clipPath: 'inset(12% 10% 12% 10% round 28px)', duration: 1.6, ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 88%' }
    });
    var img = $('img', el);
    if (img) gsap.from(img, { scale: 1.25, duration: 2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
  });

  $$('.parallax').forEach(function (el) {
    var speed = parseFloat(el.dataset.speed) || -0.1;
    gsap.fromTo(el, { yPercent: -speed * 100 }, {
      yPercent: speed * 100, ease: 'none',
      scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true }
    });
  });

  /* Emblème du projet Togo : il se rapproche pendant le défilement */
  $$('.togo__visual img').forEach(function (img) {
    gsap.fromTo(img, { scale: 1.45 }, {
      scale: 1.12, ease: 'none',
      scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'center center', scrub: true }
    });
  });

  /* ---------- Défilement horizontal épinglé ---------- */
  $$('.program').forEach(function (section) {
    var track = $('.program__track', section);
    var bar = $('.program__progress i', section);
    if (!track) return;
    function dist() { return Math.max(0, track.scrollWidth - window.innerWidth + 32); }
    var hScroll = gsap.to(track, {
      x: function () { return -dist(); },
      ease: 'none',
      scrollTrigger: {
        trigger: section, pin: $('.program__pin', section), start: 'top top',
        end: function () { return '+=' + dist(); },
        scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1,
        onUpdate: function (self) { if (bar) gsap.set(bar, { scaleX: self.progress }); }
      }
    });
    $$('.course', section).forEach(function (c) {
      gsap.from(c, {
        opacity: 0.25, scale: 0.92, ease: 'none',
        scrollTrigger: { trigger: c, containerAnimation: hScroll, start: 'left 100%', end: 'left 65%', scrub: true }
      });
    });
    gsap.from($$('.program__head > *', section), {
      y: 48, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: 0.1,
      scrollTrigger: { trigger: section, start: 'top 75%' }
    });
  });

  /* ---------- Panneaux et tuiles ---------- */
  $$('.panel').forEach(function (p) {
    gsap.from(p, {
      scale: 0.94, borderRadius: 56, ease: 'none',
      scrollTrigger: { trigger: p, start: 'top bottom', end: 'top 35%', scrub: true }
    });
  });
  $$('.tiles').forEach(function (grid) {
    gsap.from($$('.tile', grid), {
      y: 60, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08,
      scrollTrigger: { trigger: grid, start: 'top 85%' }
    });
    gsap.from($$('.tile__icon', grid), {
      scale: 0.4, rotate: -45, opacity: 0, duration: 1.2, ease: 'back.out(1.6)', stagger: 0.08,
      scrollTrigger: { trigger: grid, start: 'top 78%' }
    });
  });
  if (!isTouch) {
    $$('.tile').forEach(function (t) {
      t.addEventListener('pointermove', function (e) {
        var r = t.getBoundingClientRect();
        t.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        t.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* ---------- Étapes (méthode) ---------- */
  $$('.method').forEach(function (m) {
    gsap.to($$('.method__line i', m), {
      scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: $('.method__steps', m), start: 'top 60%', end: 'bottom 60%', scrub: true }
    });
    gsap.from($$('.method__sticky > *', m), {
      y: 48, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: 0.1,
      scrollTrigger: { trigger: m, start: 'top 70%' }
    });
  });
  $$('.step').forEach(function (s) {
    gsap.from(s, { y: 60, opacity: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: s, start: 'top 88%' } });
    ScrollTrigger.create({
      trigger: s, start: 'top 60%', end: 'bottom 40%',
      onToggle: function (self) {
        gsap.to(s, { boxShadow: self.isActive ? 'rgb(242,193,78) 0 0 0 1px' : 'rgb(40,40,40) 0 0 0 1px', duration: 0.5 });
        gsap.to($('.step__num', s), { color: self.isActive ? '#f2c14e' : '#86868b', duration: 0.5 });
      }
    });
  });

  /* ---------- Surface claire ---------- */
  $$('.audience').forEach(function (a) {
    gsap.from(a, {
      clipPath: 'inset(6% 4% 0% 4% round 28px)', ease: 'none',
      scrollTrigger: { trigger: a, start: 'top bottom', end: 'top 30%', scrub: true }
    });
  });
  $$('.audience__grid').forEach(function (g) {
    $$('.reveal-card', g).forEach(function (c, i) {
      gsap.from(c, {
        y: 100, rotate: i % 2 ? 2 : -2, opacity: 0, duration: 1.4, ease: 'expo.out', delay: i * 0.12,
        scrollTrigger: { trigger: c, start: 'top 90%' }
      });
    });
  });

  /* ---------- Compteurs ---------- */
  $$('[data-count]').forEach(function (el) {
    var end = parseFloat(el.dataset.count), obj = { v: 0 };
    el.textContent = '0';
    gsap.to(obj, {
      v: end, duration: 2, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%' },
      onUpdate: function () { el.textContent = Math.round(obj.v); }
    });
  });
  $$('.stats__grid').forEach(function (g) {
    gsap.from($$('.stat', g), {
      y: 60, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08,
      scrollTrigger: { trigger: g, start: 'top 85%' }
    });
  });

  /* ---------- CTA ---------- */
  $$('[data-fill]').forEach(function (t) {
    gsap.to(t, {
      backgroundPosition: '0% 0', ease: 'none',
      scrollTrigger: { trigger: t, start: 'top 85%', end: 'top 35%', scrub: true }
    });
  });
  $$('.cta').forEach(function (c) {
    gsap.from($('.cta__glow', c), {
      scale: 0.3, opacity: 0, ease: 'none',
      scrollTrigger: { trigger: c, start: 'top bottom', end: 'center center', scrub: true }
    });
    gsap.from($$('.cta__sub, .cta__actions, .contact-grid > div', c), {
      y: 40, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08,
      scrollTrigger: { trigger: c, start: 'top 70%' }
    });
  });

  /* ---------- Navigation locale : lien actif ---------- */
  $$('.lnav__link[href^="#"]').forEach(function (link) {
    var target = $(link.getAttribute('href'));
    if (!target) return;
    ScrollTrigger.create({
      trigger: target, start: 'top 50%', end: 'bottom 50%',
      onToggle: function (self) { link.classList.toggle('is-active', self.isActive); }
    });
  });

  /* ---------- Boutons magnétiques ---------- */
  if (!isTouch) {
    $$('.magnetic').forEach(function (btn) {
      var xTo = gsap.quickTo(btn, 'x', { duration: 0.5, ease: 'power3.out' });
      var yTo = gsap.quickTo(btn, 'y', { duration: 0.5, ease: 'power3.out' });
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.3);
        yTo((e.clientY - r.top - r.height / 2) * 0.4);
      });
      btn.addEventListener('pointerleave', function () { xTo(0); yTo(0); });
    });
  }

  /* ---------- Ancres : défilement doux ---------- */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2 && id !== '#') return;
      var el = id === '#top' || id === '#' ? document.body : $(id);
      if (!el) return;
      e.preventDefault();
      var y = el === document.body ? 0 : el.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });

  /* Arrivée sur une ancre depuis une autre page : recalage après épinglage */
  if (window.location.hash && window.location.hash.length > 1) {
    window.addEventListener('load', function () {
      var target = document.getElementById(window.location.hash.slice(1));
      if (!target) return;
      setTimeout(function () {
        ScrollTrigger.refresh();
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 70 });
      }, 120);
    });
  }

  /* Recalcul quand les polices et images sont prêtes */
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
})();
