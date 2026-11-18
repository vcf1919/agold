/*
 * AGOLD · Nails & Beauty — interacción y movimiento
 * Diseño y desarrollo: rgdev.studio
 */
(function () {
  'use strict';

  var SCRIPT_URL = document.currentScript ? document.currentScript.src : location.href;

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    var env = window.AGOLD_ENV || { reduced: false, finePointer: false, mode: 'svg', introSeen: true };
    var data = window.AGOLD || { site: {}, hours: { week: {} }, lookbook: [], detail: { notes: [] }, reviews: [] };
    var html = document.documentElement;
    var hasGSAP = !!(window.gsap && window.ScrollTrigger);
    if (!hasGSAP) html.classList.add('no-gsap');
    var motion = !env.reduced && hasGSAP;
    var desktopMQ = window.matchMedia('(min-width: 900px)');

    var $ = function (s, r) { return (r || document).querySelector(s); };
    var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
    var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
    var smooth = function (a, b, v) { var t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

    if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

    /* ───────────────────────── Scroll suave (Lenis + ScrollTrigger) ───────────────────────── */
    var lenis = null;
    if (motion && window.Lenis) {
      lenis = new window.Lenis({ lerp: 0.11, smoothWheel: true, wheelMultiplier: 0.95 });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    }
    function scrollToTarget(target) {
      if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.6 });
      else if (target && target.scrollIntoView) target.scrollIntoView({ behavior: env.reduced ? 'auto' : 'smooth' });
    }
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var target = document.getElementById(id.slice(1));
      if (!target) return;
      e.preventDefault();
      if (html.classList.contains('menu-open')) closeMenu(false);
      scrollToTarget(target);
      if (target.tabIndex < 0 && !/^(A|BUTTON|INPUT)$/.test(target.tagName)) target.setAttribute('tabindex', '-1');
      setTimeout(function () { target.focus({ preventScroll: true }); }, lenis ? 900 : 0);
    });

    /* ───────────────────────── Enlaces de contacto ───────────────────────── */
    var site = data.site || {};
    $$('[data-wa]').forEach(function (a) {
      var msg = (site.messages || {})[a.getAttribute('data-wa')] || '';
      if (site.whatsapp) a.href = 'https://wa.me/' + site.whatsapp + '?text=' + encodeURIComponent(msg);
      else a.title = 'WhatsApp pendiente: de momento te llevo a Instagram';
    });
    $$('[data-phone]').forEach(function (el) {
      if (site.whatsapp && site.phoneLabel && site.phoneLabel.indexOf('[') !== 0) { el.textContent = site.phoneLabel; el.classList.remove('ph'); }
    });
    $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

    /* ───────────────────────── Navegación ───────────────────────── */
    var nav = $('[data-nav]');
    var navMark = $('.nav__mark');
    var lastY = window.scrollY;
    function onScrollNav() {
      var y = window.scrollY;
      if (!html.classList.contains('menu-open')) {
        if (y > lastY + 4 && y > 240) nav.classList.add('is-hidden');
        else if (y < lastY - 4 || y < 120) nav.classList.remove('is-hidden');
      }
      nav.classList.toggle('is-solid', y > 60);
      lastY = y;
    }
    window.addEventListener('scroll', onScrollNav, { passive: true });
    onScrollNav();

    // Menú a pantalla completa
    var menu = $('[data-menu]');
    var toggle = $('[data-menu-toggle]');
    var menuCloseTimer;
    function focusables(root) {
      return $$('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])', root).filter(function (el) { return el.offsetParent !== null || el === document.activeElement; });
    }
    function openMenu() {
      clearTimeout(menuCloseTimer);
      menu.hidden = false;
      requestAnimationFrame(function () { menu.classList.add('is-open'); });
      html.classList.add('menu-open');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.querySelector('.nav__menu-label').textContent = 'Cerrar';
      toggle.setAttribute('aria-label', 'Cerrar menú');
      if (lenis) lenis.stop();
      setTimeout(function () { var f = $('a', menu); if (f) f.focus(); }, 60);
    }
    function closeMenu(returnFocus) {
      menu.classList.remove('is-open');
      html.classList.remove('menu-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.querySelector('.nav__menu-label').textContent = 'Menú';
      toggle.setAttribute('aria-label', 'Abrir menú');
      if (lenis) lenis.start();
      menuCloseTimer = setTimeout(function () { menu.hidden = true; }, env.reduced ? 0 : 800);
      if (returnFocus !== false) toggle.focus();
    }
    toggle.addEventListener('click', function () {
      if (html.classList.contains('menu-open')) closeMenu(); else openMenu();
    });
    document.addEventListener('keydown', function (e) {
      if (!html.classList.contains('menu-open')) return;
      if (e.key === 'Escape') { e.preventDefault(); closeMenu(); return; }
      if (e.key === 'Tab') {
        var items = [toggle].concat(focusables(menu));
        var i = items.indexOf(document.activeElement);
        if (e.shiftKey && (i <= 0)) { e.preventDefault(); items[items.length - 1].focus(); }
        else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0].focus(); }
      }
    });

    function flashNav() {
      if (!navMark) return;
      navMark.classList.remove('is-flash');
      void navMark.getBoundingClientRect();
      navMark.classList.add('is-flash');
    }

    /* ───────────────────────── HERO · Metamorfosis ───────────────────────── */
    var heroEl = $('[data-hero]');
    var stage = $('[data-hero-stage]');
    var svgWrap = $('[data-hero-svg]');
    var webglEl = $('[data-hero-webgl]');
    var skipBtn = $('[data-intro-skip]');
    var photosEl = $('[data-hero-photos]');
    var leafFrames = $$('[data-leaf-frame]');
    var hero3d = null;
    var heroState = { explode: 0, fall: 0, framed: false, heroVisible: true };
    document.body.appendChild(webglEl); // capa fija independiente del pin

    function sheen() {
      var grad = document.getElementById('sheen');
      if (!grad || !hasGSAP || env.reduced) return;
      gsap.fromTo(grad, { attr: { x1: -150, x2: -70 } }, { attr: { x1: 90, x2: 170 }, duration: 1.8, ease: 'power2.inOut', delay: 1.5 });
      setTimeout(function () { svgWrap.classList.add('is-shine'); }, 1700);
    }

    function webglAvailable() {
      try {
        var c = document.createElement('canvas');
        var gl = window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'));
        if (!gl) return false;
        // Renderizado por software (sin GPU): la mariposa iría a saltos → versión SVG
        if (!/[?&]hero=3d/.test(location.search)) {
          var dbg = gl.getExtension('WEBGL_debug_renderer_info');
          var name = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : '';
          if (/swiftshader|llvmpipe|software|basic render/i.test(name)) return false;
        }
        var lose = gl.getExtension('WEBGL_lose_context');
        if (lose) lose.loseContext();
        return true;
      } catch (e) { return false; }
    }

    function useSvgHero(reason) {
      html.classList.remove('svg-temp');
      if (env.mode === '3d') html.classList.add('webgl-failed');
      if (hero3d) { hero3d.destroy(); hero3d = null; }
      webglEl.style.display = 'none';
      leafFrames.forEach(function (f) { f.classList.add('is-framed'); });
      if (skipBtn) skipBtn.hidden = true;
      sheen();
      if (reason && window.console) console.info('[AGOLD] Mariposa en versión SVG:', reason);
    }

    function leafRects() {
      return leafFrames.map(function (f) { return f.getBoundingClientRect(); });
    }

    function syncHero() {
      if (!hero3d) return;
      hero3d.setExplode(heroState.explode);
      hero3d.setFall(heroState.fall, heroState.fall > 0 ? leafRects() : null);
      var f = heroState.fall;
      webglEl.style.opacity = String(1 - smooth(0.84, 1, f));
      var shouldRun = (heroState.heroVisible || f < 1) && f < 1 && !document.hidden;
      if (shouldRun) hero3d.start(); else hero3d.stop();
    }

    function setFramed(on) {
      if (on === heroState.framed) return;
      heroState.framed = on;
      leafFrames.forEach(function (f) { f.classList.toggle('is-framed', on); });
      if (on) flashNav();
    }

    function load3D() {
      var waitTimer = setTimeout(function () {
        // La red va lenta: mientras tanto, la mariposa SVG se dibuja
        if (!hero3d) { html.classList.add('svg-temp'); sheen(); }
      }, 2200);
      var url = new URL('hero3d.js', SCRIPT_URL).href;
      import(url).then(function (mod) {
        clearTimeout(waitTimer);
        var mobile = !desktopMQ.matches;
        var modest = mobile && (navigator.hardwareConcurrency || 8) <= 6 && !env.apple;
        hero3d = mod.createHero({
          container: webglEl,
          mobile: mobile,
          lowPower: modest,
          onSlow: function () { useSvgHero('rendimiento insuficiente'); },
        });
        var playIntro = !env.introSeen && !html.classList.contains('svg-temp') && window.scrollY < 40;
        if (playIntro) {
          hero3d.playIntro();
          try { sessionStorage.setItem('agold-intro', '1'); } catch (e) {}
          if (skipBtn) {
            skipBtn.hidden = false;
            setTimeout(function () { skipBtn.hidden = true; }, 2000);
          }
        }
        html.classList.remove('svg-temp');
        webglEl.classList.add('is-ready');
        syncHero();
        window.addEventListener('resize', function () { if (hero3d) hero3d.resize(); });
      }).catch(function (err) {
        clearTimeout(waitTimer);
        useSvgHero(err && err.message);
      });
    }

    if (skipBtn) {
      skipBtn.addEventListener('click', function () { if (hero3d) hero3d.skipIntro(); skipBtn.hidden = true; });
    }
    window.addEventListener('wheel', function () { if (hero3d) hero3d.skipIntro(); }, { passive: true, once: true });
    window.addEventListener('touchmove', function () { if (hero3d) hero3d.skipIntro(); }, { passive: true, once: true });

    // Puntero: cursor en escritorio, giroscopio en móvil (si hay permiso)
    window.addEventListener('mousemove', function (e) {
      if (!hero3d) return;
      hero3d.setPointer((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
    }, { passive: true });
    function onOrient(e) {
      if (!hero3d || e.gamma == null) return;
      hero3d.setPointer(clamp(e.gamma / 28, -1, 1), clamp((e.beta - 50) / 28, -1, 1));
    }
    if (!env.finePointer && 'DeviceOrientationEvent' in window) {
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        stage.addEventListener('touchend', function ask() {
          DeviceOrientationEvent.requestPermission().then(function (s) {
            if (s === 'granted') window.addEventListener('deviceorientation', onOrient, { passive: true });
          }).catch(function () {});
        }, { once: true });
      } else {
        window.addEventListener('deviceorientation', onOrient, { passive: true });
      }
    }
    document.addEventListener('visibilitychange', syncHero);

    // Elegir modo
    if (env.mode === '3d' && webglAvailable()) {
      var go = function () {
        var idle = window.requestIdleCallback || function (cb) { return setTimeout(cb, 1); };
        idle(load3D, { timeout: 900 });
      };
      if (document.readyState === 'complete') go(); else window.addEventListener('load', go, { once: true });
    } else {
      if (env.mode === '3d') html.classList.replace('hero-3d', 'hero-svg');
      useSvgHero(env.mode === '3d' ? 'sin WebGL' : null);
    }

    // Secuencia ligada al scroll
    if (motion) {
      var heroTl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: heroEl,
          start: 'top top',
          end: '+=150%',
          pin: stage,
          scrub: true,
          onUpdate: function (self) {
            heroState.explode = self.progress;
            if (hero3d && self.progress > 0.01) hero3d.skipIntro();
            syncHero();
          },
        },
      });
      heroTl
        .to('[data-hero-kicker], [data-hero-cue]', { opacity: 0, y: -12, duration: 0.12 }, 0)
        .to('.hero__shadow', { opacity: 0, duration: 0.2 }, 0)
        .to('.hero__title .line > span', { y: 0, yPercent: 0, duration: 0.22, ease: 'power3.out', stagger: 0.045 }, 0.16)
        .to('[data-hero-fade]', { opacity: 1, duration: 0.14, stagger: 0.05 }, 0.44)
        .to({}, { duration: 0.35 });
      if (html.classList.contains('hero-svg')) heroTl.to(svgWrap, { scale: 0.72, opacity: 0.12, duration: 0.35 }, 0.02);
      gsap.set('.hero__title .line > span', { yPercent: 140, y: 0 });
      html.classList.add('gsap-ready');

      // Caída de las láminas sobre las primeras fotos
      ScrollTrigger.create({
        trigger: photosEl,
        start: 'top bottom',
        end: desktopMQ.matches ? 'top 12%' : 'top 2%',
        onUpdate: function (self) {
          heroState.fall = self.progress;
          setFramed(self.progress > 0.97 || (!hero3d && self.progress > 0.5));
          syncHero();
        },
        onLeave: function () { heroState.fall = 1; setFramed(true); syncHero(); },
        onLeaveBack: function () { heroState.fall = 0; setFramed(false); syncHero(); },
      });
      // Pausa el render cuando el hero ya no se ve
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          heroState.heroVisible = entries.some(function (e) { return e.isIntersecting; });
          syncHero();
        }).observe(stage);
      }
    } else {
      leafFrames.forEach(function (f) { f.classList.add('is-framed'); });
    }

    /* ───────────────────────── Reveals ───────────────────────── */
    if (motion) {
      $$('[data-lines]').forEach(function (el) {
        var spans = $$('.line > span', el);
        gsap.set(spans, { yPercent: 140 });
        ScrollTrigger.create({
          trigger: el, start: 'top 88%', once: true,
          onEnter: function () { gsap.to(spans, { yPercent: 0, duration: 1.3, ease: 'expo.out', stagger: 0.09 }); },
        });
      });
      // Parallax suave
      $$('[data-parallax]').forEach(function (el) {
        var v = parseFloat(el.getAttribute('data-parallax')) || 0;
        gsap.fromTo(el, { yPercent: -v / 2 }, { yPercent: v / 2, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
      });
      $$('[data-parallax-img]').forEach(function (img) {
        gsap.fromTo(img, { yPercent: -8 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: img.closest('section'), start: 'top bottom', end: 'bottom top', scrub: true } });
      });
      // Manifiesto: palabras que se iluminan
      var mt = $('[data-words]');
      if (mt) {
        var words = mt.textContent.trim().split(/\s+/);
        mt.innerHTML = words.map(function (w) { return '<span class="w">' + w + '</span>'; }).join(' ');
        mt.setAttribute('aria-label', words.join(' '));
        gsap.to($$('.w', mt), { opacity: 1, ease: 'none', stagger: 0.12, scrollTrigger: { trigger: mt, start: 'top 78%', end: 'bottom 42%', scrub: true } });
      }
    }
    var revealIO = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.__reveal.classList.add('is-in'); revealIO.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -15% 0px' }) : null;
    // Se observa el contenedor: con el clip-path cerrado el propio elemento no «intersecta»
    $$('[data-reveal-img]').forEach(function (el) {
      if (!revealIO) { el.classList.add('is-in'); return; }
      el.parentElement.__reveal = el;
      revealIO.observe(el.parentElement);
    });

    /* ───────────────────────── Pincelada + top coat ───────────────────────── */
    function sectionBg(el) {
      var n = el.parentElement;
      while (n && n !== document.documentElement) {
        var c = getComputedStyle(n).backgroundColor;
        if (c && c !== 'transparent' && !/rgba\(.*,\s*0\)$/.test(c)) return c;
        n = n.parentElement;
      }
      return '#F8F4EE';
    }
    function makeBrushTip(w, h) {
      // Pincel plano: cerdas con densidad irregular y bordes deshilachados
      var c = document.createElement('canvas');
      c.width = Math.max(4, Math.round(w)); c.height = Math.max(3, Math.round(h));
      var x = c.getContext('2d');
      for (var i = 0; i < c.width; i++) {
        var u = i / c.width;
        var edge = Math.min(u, 1 - u);
        var a = edge < 0.08 ? (Math.random() < edge / 0.08 ? 0.35 + Math.random() * 0.5 : 0) : 0.55 + Math.random() * 0.45;
        if (Math.random() < 0.04) a *= 0.2; // cerdas abiertas → vetas
        x.globalAlpha = a;
        x.fillRect(i, 0, 1, c.height * (0.6 + Math.random() * 0.4));
      }
      return c;
    }
    function brushReveal(host) {
      if (host.__brush) return;
      host.__brush = true;
      var canvas = document.createElement('canvas');
      canvas.className = 'brush-canvas';
      canvas.setAttribute('aria-hidden', 'true');
      var coat = document.createElement('span');
      coat.className = 'topcoat';
      coat.setAttribute('aria-hidden', 'true');
      host.appendChild(canvas);
      host.appendChild(coat);
      var ctx = canvas.getContext('2d');
      var W, H;
      function paintCover() {
        var r = host.getBoundingClientRect();
        W = canvas.width = Math.max(2, Math.round(r.width));
        H = canvas.height = Math.max(2, Math.round(r.height));
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = sectionBg(host);
        ctx.fillRect(0, 0, W, H);
      }
      paintCover();
      var done = false;
      function run() {
        if (done) return; done = true;
        paintCover();
        var sw = W * 0.64;
        var tip = makeBrushTip(sw, Math.max(6, sw * 0.05));
        // Dos pasadas, como el esmalte: centro-izquierda y derecha, ligeramente curvas
        var strokes = [
          { x0: W * 0.3, x1: W * 0.34, bend: W * 0.04, start: 0, dur: 520 },
          { x0: W * 0.72, x1: W * 0.68, bend: -W * 0.035, start: 360, dur: 520 },
        ];
        var t0 = performance.now();
        var last = strokes.map(function () { return -0.08; });
        ctx.globalCompositeOperation = 'destination-out';
        function point(s, p) {
          var y = -H * 0.08 + p * H * 1.16;
          var x = s.x0 + (s.x1 - s.x0) * p + Math.sin(p * Math.PI) * s.bend;
          return [x, y];
        }
        function step(now) {
          var el = now - t0;
          var active = false;
          strokes.forEach(function (s, k) {
            var p = clamp((el - s.start) / s.dur, 0, 1);
            p = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
            if (p < 1) active = true;
            var from = last[k];
            var stepLen = 2 / (H * 1.16);
            for (var q = Math.max(0, from); q <= p; q += stepLen) {
              var pt = point(s, q);
              ctx.save();
              ctx.translate(pt[0], pt[1]);
              ctx.rotate(Math.sin(q * 3) * 0.04);
              ctx.drawImage(tip, -sw / 2, -tip.height / 2, sw, tip.height);
              ctx.restore();
            }
            last[k] = p;
          });
          if (active) requestAnimationFrame(step);
          else {
            canvas.style.transition = 'opacity .45s ease';
            canvas.style.opacity = '0';
            setTimeout(function () { coat.classList.add('is-on'); }, 120);
            setTimeout(function () { canvas.remove(); }, 600);
          }
        }
        requestAnimationFrame(step);
      }
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting && e.intersectionRatio > 0.35) { io.disconnect(); run(); }
        });
      }, { threshold: [0, 0.35, 0.6] });
      io.observe(host);
      window.addEventListener('resize', function () { if (!done) paintCover(); });
    }
    function initBrushes(root) {
      if (!motion || !('IntersectionObserver' in window)) return;
      $$('[data-brush]', root).forEach(brushReveal);
    }

    /* ───────────────────────── Imágenes responsive ───────────────────────── */
    function picture(src, widths, sizes, alt, opts) {
      opts = opts || {};
      var base = 'assets/img/' + src;
      var set = function (ext) { return widths.map(function (w) { return base + '-' + w + '.' + ext + ' ' + w + 'w'; }).join(', '); };
      var mid = widths.filter(function (w) { return w <= 800; }).pop() || widths[0];
      var maxW = widths[widths.length - 1];
      var ratio = opts.ratio || 1;
      return '<picture><source type="image/avif" srcset="' + set('avif') + '" sizes="' + sizes + '">' +
        '<img src="' + base + '-' + mid + '.webp" srcset="' + set('webp') + '" sizes="' + sizes + '" alt="' + (alt || '').replace(/"/g, '&quot;') + '"' +
        ' width="' + maxW + '" height="' + Math.round(maxW / ratio) + '"' +
        (opts.eager ? ' fetchpriority="high"' : ' loading="lazy"') + ' decoding="async"' +
        (opts.pos ? ' style="object-position:' + opts.pos + '"' : '') + '></picture>';
    }

    /* ───────────────────────── Lookbook ───────────────────────── */
    var works = $('[data-works]');
    var track = $('[data-works-track]');
    var items = (data.lookbook || []).map(function (it, i) {
      var n = ('0' + (i + 1)).slice(-2);
      return { data: it, n: n, el: null };
    });
    track.innerHTML = items.map(function (it, i) {
      var d = it.data;
      return '<li class="card" data-crop="' + d.crop + '" data-cat="' + d.cat.join(' ') + '" data-index="' + i + '">' +
        '<button class="card__btn" type="button" data-cursor="view" aria-label="Ampliar Nº ' + it.n + ': ' + d.title + '">' +
        '<div class="card__media"' + (i < 3 ? ' data-brush' : '') + '>' +
        picture(d.src, d.w, '(min-width: 900px) 34vw, 74vw', d.alt, { pos: d.pos }) +
        '</div></button>' +
        '<p class="card__cap"><b>Nº ' + it.n + '</b><span>' + d.title + ' · ' + d.shape + '</span></p></li>';
    }).join('');
    items.forEach(function (it, i) { it.el = track.children[i]; });
    var countEl = $('[data-works-count]');
    function visibleItems() { return items.filter(function (it) { return !it.el.hidden; }); }
    function updateCount() {
      var n = visibleItems().length;
      countEl.textContent = n + (n === 1 ? ' diseño' : ' diseños');
    }
    updateCount();

    var worksTween = null;
    if (motion) {
      var mm = gsap.matchMedia();
      mm.add('(min-width: 900px)', function () {
        works.classList.add('is-pinned');
        var viewport = $('[data-works-viewport]');
        var dist = function () { return Math.max(0, track.scrollWidth - viewport.clientWidth); };
        worksTween = gsap.to(track, {
          x: function () { return -dist(); },
          ease: 'none',
          scrollTrigger: {
            trigger: works, start: 'top top', end: function () { return '+=' + dist(); },
            pin: $('[data-works-pin]'), scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1,
          },
        });
        $$('.card__media picture', track).forEach(function (pic) {
          gsap.fromTo(pic, { xPercent: -5, scale: 1.12 }, {
            xPercent: 5, scale: 1.12, ease: 'none',
            scrollTrigger: { trigger: pic.closest('.card'), containerAnimation: worksTween, start: 'left right', end: 'right left', scrub: true },
          });
        });
        return function () { works.classList.remove('is-pinned'); worksTween = null; gsap.set(track, { clearProps: 'x' }); };
      });
    }
    initBrushes(track);

    // Arrastre con ratón en el carrusel (cuando no hay pin)
    (function () {
      var down = false, sx = 0, sl = 0, moved = false;
      track.addEventListener('pointerdown', function (e) {
        if (e.pointerType !== 'mouse' || works.classList.contains('is-pinned')) return;
        down = true; moved = false; sx = e.clientX; sl = track.scrollLeft;
      });
      window.addEventListener('pointermove', function (e) {
        if (!down) return;
        var dx = e.clientX - sx;
        if (Math.abs(dx) > 5) { moved = true; track.classList.add('is-dragging'); }
        track.scrollLeft = sl - dx;
      });
      window.addEventListener('pointerup', function () {
        if (!down) return; down = false;
        track.classList.remove('is-dragging');
      });
      track.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    })();

    // Filtros
    $$('[data-filter]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var f = btn.getAttribute('data-filter');
        $$('[data-filter]').forEach(function (b) {
          var on = b === btn;
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        items.forEach(function (it) { it.el.hidden = !(f === 'all' || it.data.cat.indexOf(f) > -1); });
        updateCount();
        if (worksTween) {
          ScrollTrigger.refresh();
          var st = worksTween.scrollTrigger;
          if (st && window.scrollY > st.start) scrollToTarget(st.start + 1);
        } else {
          track.scrollTo({ left: 0, behavior: env.reduced ? 'auto' : 'smooth' });
        }
        if (motion) gsap.fromTo(visibleItems().map(function (it) { return it.el; }), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out', stagger: 0.04 });
      });
    });

    /* ───────────────────────── Visor ───────────────────────── */
    var viewer = $('[data-viewer]');
    var vStage = $('[data-viewer-stage]');
    var vCap = $('[data-viewer-caption]');
    var vCount = $('[data-viewer-count]');
    var vList = [], vIndex = 0, vReturn = null;
    function vRender() {
      var it = vList[vIndex];
      var d = it.data;
      vStage.innerHTML = picture(d.src, d.w, '92vw', d.alt, { eager: true });
      vCap.innerHTML = '<b>Nº ' + it.n + '</b><span>' + d.title + ' · ' + d.shape + '</span>';
      vCount.textContent = ('0' + (vIndex + 1)).slice(-2) + ' / ' + ('0' + vList.length).slice(-2);
      if (motion) gsap.fromTo($('img', vStage), { opacity: 0, scale: 1.03 }, { opacity: 1, scale: 1, duration: 0.6, ease: 'expo.out' });
    }
    function vOpen(index) {
      vList = visibleItems();
      vIndex = Math.max(0, vList.indexOf(items[index]));
      vReturn = document.activeElement;
      viewer.hidden = false;
      html.classList.add('viewer-open');
      if (lenis) lenis.stop();
      document.body.style.overflow = 'hidden';
      vRender();
      $('[data-viewer-close]').focus();
    }
    function vClose() {
      viewer.hidden = true;
      html.classList.remove('viewer-open');
      document.body.style.overflow = '';
      if (lenis) lenis.start();
      if (vReturn) vReturn.focus();
    }
    function vGo(d) { vIndex = (vIndex + d + vList.length) % vList.length; vRender(); }
    track.addEventListener('click', function (e) {
      var b = e.target.closest('.card__btn');
      if (b) vOpen(parseInt(b.parentElement.getAttribute('data-index'), 10));
    });
    $('[data-viewer-close]').addEventListener('click', vClose);
    $('[data-viewer-prev]').addEventListener('click', function () { vGo(-1); });
    $('[data-viewer-next]').addEventListener('click', function () { vGo(1); });
    viewer.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); vClose(); }
      else if (e.key === 'ArrowLeft') vGo(-1);
      else if (e.key === 'ArrowRight') vGo(1);
      else if (e.key === 'Tab') {
        var f = $$('button', viewer);
        var i = f.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
      }
    });
    (function () { // gestos
      var x0 = null, y0 = 0;
      viewer.addEventListener('pointerdown', function (e) { x0 = e.clientX; y0 = e.clientY; });
      viewer.addEventListener('pointerup', function (e) {
        if (x0 === null) return;
        var dx = e.clientX - x0, dy = e.clientY - y0;
        x0 = null;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) vGo(dx < 0 ? 1 : -1);
        else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) vClose();
      });
      vStage.addEventListener('click', function (e) { if (e.target === vStage) vClose(); });
    })();

    /* ───────────────────────── El detalle ───────────────────────── */
    (function () {
      var host = $('[data-detail]');
      var list = $('[data-detail-list]');
      var d = data.detail;
      if (!host || !d) return;
      var html_ = '<div class="detail__img" data-brush>' + picture(d.src, d.w, '(min-width: 900px) 56vw, 92vw', d.alt, { ratio: d.ratio }) + '</div>';
      host.innerHTML = html_;
      var box = $('.detail__img', host);
      var spots = [], notes = [], rows = [];
      d.notes.forEach(function (n, i) {
        var num = ('0' + (i + 1)).slice(-2);
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'hs';
        b.style.left = n.x + '%'; b.style.top = n.y + '%';
        b.setAttribute('aria-expanded', 'false');
        b.setAttribute('aria-controls', 'note-' + i);
        b.setAttribute('aria-label', num + ' · ' + n.title);
        box.appendChild(b);
        var note = document.createElement('div');
        note.className = 'note'; note.id = 'note-' + i; note.setAttribute('role', 'note');
        note.innerHTML = '<span class="n">' + num + '</span><h3>' + n.title + '</h3><p>' + n.text + '</p>';
        box.appendChild(note);
        var li = document.createElement('li');
        li.innerHTML = '<button type="button" aria-expanded="false" aria-controls="note-' + i + '"><span class="n">' + num + '</span><strong>' + n.title + '</strong><span class="t">' + n.text + '</span></button>';
        list.appendChild(li);
        spots.push(b); notes.push(note); rows.push($('button', li));
      });
      var open = -1;
      function place(i) {
        var n = d.notes[i], note = notes[i];
        var W = box.clientWidth, H = box.clientHeight, nw = note.offsetWidth, nh = note.offsetHeight;
        var x = n.x / 100 * W, y = n.y / 100 * H;
        var left = clamp(x - nw / 2, 6, W - nw - 6);
        var top = y + 30;
        if (top + nh > H - 6) top = y - nh - 30;
        note.style.left = left + 'px'; note.style.top = Math.max(6, top) + 'px';
      }
      function set(i) {
        open = (open === i) ? -1 : i;
        spots.forEach(function (s, k) { s.setAttribute('aria-expanded', k === open ? 'true' : 'false'); });
        rows.forEach(function (r, k) { r.setAttribute('aria-expanded', k === open ? 'true' : 'false'); });
        notes.forEach(function (nt, k) { if (k === open) place(k); nt.classList.toggle('is-open', k === open); });
      }
      spots.forEach(function (s, i) { s.addEventListener('click', function (e) { e.stopPropagation(); set(i); }); });
      rows.forEach(function (r, i) {
        r.addEventListener('click', function () { set(i); });
        r.addEventListener('mouseenter', function () { spots[i].classList.add('is-hint'); });
      });
      document.addEventListener('click', function (e) { if (open > -1 && !box.contains(e.target) && !list.contains(e.target)) set(open); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && open > -1) { var s = spots[open]; set(open); s.focus(); } });
      window.addEventListener('resize', function () { if (open > -1) place(open); });
      initBrushes(host);
    })();

    /* ───────────────────────── Servicios (pestañas) ───────────────────────── */
    (function () {
      var tabs = $$('[role="tab"]');
      var photos = $$('[data-photo]');
      var current = 'unas';
      function showPhoto(key) { photos.forEach(function (p) { p.classList.toggle('is-active', p.getAttribute('data-photo') === key); }); }
      function select(tab, focus) {
        tabs.forEach(function (t) {
          var on = t === tab;
          t.setAttribute('aria-selected', on ? 'true' : 'false');
          t.tabIndex = on ? 0 : -1;
          $('#' + t.getAttribute('aria-controls')).hidden = !on;
        });
        current = tab.getAttribute('data-tab');
        showPhoto(current);
        if (focus) tab.focus();
        if (motion) {
          gsap.fromTo($$('#' + tab.getAttribute('aria-controls') + ' li'), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out', stagger: 0.035 });
          ScrollTrigger.refresh();
        }
      }
      tabs.forEach(function (t, i) {
        t.addEventListener('click', function () { select(t); });
        t.addEventListener('mouseenter', function () { showPhoto(t.getAttribute('data-tab')); });
        t.addEventListener('keydown', function (e) {
          var k = e.key, j = -1;
          if (k === 'ArrowRight') j = (i + 1) % tabs.length;
          else if (k === 'ArrowLeft') j = (i - 1 + tabs.length) % tabs.length;
          else if (k === 'Home') j = 0;
          else if (k === 'End') j = tabs.length - 1;
          if (j > -1) { e.preventDefault(); select(tabs[j], true); }
        });
      });
      var tl = $('[data-tabs]');
      if (tl) tl.addEventListener('mouseleave', function () { showPhoto(current); });
      initBrushes($('[data-service-photos]'));
    })();

    /* ───────────────────────── Contadores ───────────────────────── */
    if (motion) {
      $$('[data-count]').forEach(function (el) {
        var to = parseInt(el.getAttribute('data-count'), 10);
        var o = { v: 0 };
        el.textContent = '0';
        ScrollTrigger.create({
          trigger: el, start: 'top 90%', once: true,
          onEnter: function () { gsap.to(o, { v: to, duration: 2, ease: 'expo.out', onUpdate: function () { el.textContent = Math.round(o.v); } }); },
        });
      });
    }

    /* ───────────────────────── Opiniones ───────────────────────── */
    (function () {
      var host = $('[data-reviews]');
      var rv = data.reviews || [];
      if (!host || !rv.length) return;
      function card(r, hidden) {
        return '<li class="rcard"' + (hidden ? ' aria-hidden="true"' : '') + '>' +
          '<span class="rcard__stars" role="img" aria-label="5 de 5 estrellas">★★★★★</span>' +
          '<blockquote>«' + r.text + '»</blockquote>' +
          '<footer>Clienta en Booksy' + (r.service ? ' · ' + r.service : '') + '</footer></li>';
      }
      function row(order, rev, dur) {
        var list = order.map(function (i) { return rv[i % rv.length]; });
        var set1 = list.concat(list); // garantiza ancho suficiente
        var inner = set1.map(function (r, i) { return card(r, i >= list.length); }).join('') +
          set1.map(function (r) { return card(r, true); }).join('');
        return '<div class="rrow' + (rev ? ' rrow--rev' : '') + '" style="--dur:' + dur + 's"><ul class="rrow__track">' + inner + '</ul></div>';
      }
      var n = rv.length;
      var a = [], b = [];
      for (var i = 0; i < n; i++) { a.push(i); b.push((i + 2) % n); }
      host.innerHTML = row(a, false, 80) + row(b, true, 95);
      $$('.rrow', host).forEach(function (r) {
        var t;
        r.addEventListener('touchstart', function () { clearTimeout(t); r.classList.add('is-paused'); }, { passive: true });
        r.addEventListener('touchend', function () { t = setTimeout(function () { r.classList.remove('is-paused'); }, 1800); }, { passive: true });
      });
    })();

    /* ───────────────────────── Horario y estado ───────────────────────── */
    (function () {
      var tbody = $('[data-hours] tbody');
      if (!tbody) return;
      var week = (data.hours && data.hours.week) || {};
      var names = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      var order = [1, 2, 3, 4, 5, 6, 0];
      // Hora actual en Catarroja (Europe/Madrid)
      var now = new Date(), day = now.getDay(), mins = now.getHours() * 60 + now.getMinutes();
      try {
        var parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(now);
        var g = {}; parts.forEach(function (p) { g[p.type] = p.value; });
        day = new Date(Date.UTC(+g.year, +g.month - 1, +g.day)).getUTCDay();
        mins = (+g.hour) * 60 + (+g.minute);
      } catch (e) {}
      var toM = function (s) { var p = s.split(':'); return (+p[0]) * 60 + (+p[1]); };
      tbody.innerHTML = order.map(function (d) {
        var h = week[d];
        var txt = h === null || h === undefined ? '<span class="ph">[Por confirmar]</span>' : (h.length ? h.map(function (r) { return r[0] + '–' + r[1]; }).join(' · ') : 'Cerrado');
        return '<tr' + (d === day ? ' class="is-today" aria-current="date"' : '') + '><th scope="row">' + names[d] + '</th><td>' + txt + '</td></tr>';
      }).join('');
      var note = $('[data-hours-note]');
      if (data.hours && data.hours.provisional && note) note.textContent = 'Horario provisional, pendiente de confirmar.';
      // Estado
      var st = $('[data-status]'), stTxt = $('[data-status-text]');
      var today = week[day];
      var state = 'Cerrado', cls = 'is-closed';
      if (today === null || today === undefined) { state = 'Horario por confirmar'; cls = ''; }
      else {
        var openNow = today.filter(function (r) { return mins >= toM(r[0]) && mins < toM(r[1]); })[0];
        if (openNow) { state = 'Abierto ahora · hasta las ' + openNow[1]; cls = 'is-open'; }
        else {
          var laterToday = today.filter(function (r) { return toM(r[0]) > mins; })[0];
          if (laterToday) state = 'Cerrado · abre hoy a las ' + laterToday[0];
          else {
            for (var k = 1; k <= 7; k++) {
              var dd = (day + k) % 7, h = week[dd];
              if (h && h.length) { state = 'Cerrado · abre ' + (k === 1 ? 'mañana' : 'el ' + names[dd].toLowerCase()) + ' a las ' + h[0][0]; break; }
            }
          }
        }
      }
      stTxt.textContent = state;
      if (cls) st.classList.add(cls);
    })();

    /* ───────────────────────── Mapa (carga diferida) ───────────────────────── */
    (function () {
      var host = $('[data-map]');
      if (!host || !('IntersectionObserver' in window)) return;
      var io = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        import(new URL('map.js', SCRIPT_URL).href).then(function (m) { m.initMap(host, site); }).catch(function () {});
      }, { rootMargin: '600px 0px' });
      io.observe(host);
    })();

    /* ───────────────────────── Botón flotante (móvil) ───────────────────────── */
    (function () {
      var fab = $('[data-fab]');
      if (!fab || !('IntersectionObserver' in window)) return;
      var pastHero = false, inEnd = false;
      function upd() { fab.classList.toggle('is-visible', pastHero && !inEnd); }
      new IntersectionObserver(function (e) { pastHero = !e[0].isIntersecting && e[0].boundingClientRect.top < 0; upd(); }).observe(stage);
      var endIO = new IntersectionObserver(function (es) {
        es.forEach(function (e) { e.target.__in = e.isIntersecting; });
        inEnd = $$('.final, .footer').some(function (el) { return el.__in; });
        upd();
      });
      $$('.final, .footer').forEach(function (el) { endIO.observe(el); });
    })();

    /* ───────────────────────── Cursor y escamas de oro (escritorio) ───────────────────────── */
    if (env.finePointer && !env.reduced) {
      var cursor = $('.cursor');
      var leafCanvas = $('.leaf-cursor');
      var lc = leafCanvas.getContext('2d');
      var cx = -100, cy = -100, tx = -100, ty = -100;
      var leaves = [], leafRun = false, lastSpawn = 0, lastPos = [0, 0];
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      function sizeLeaf() { leafCanvas.width = innerWidth * dpr; leafCanvas.height = innerHeight * dpr; }
      sizeLeaf();
      window.addEventListener('resize', sizeLeaf);
      window.addEventListener('mousemove', function (e) {
        tx = e.clientX; ty = e.clientY;
        cursor.classList.add('is-visible');
        var t = e.target;
        var dark = !!(t.closest && t.closest('.training, .final, .footer, .menu, .viewer'));
        cursor.classList.toggle('is-dark', dark);
        var view = !!(t.closest && t.closest('[data-cursor="view"]'));
        cursor.classList.toggle('is-view', view);
        cursor.classList.toggle('is-hover', !view && !!(t.closest && t.closest('a, button, [role="tab"], .hs')));
        // Escamas de oro: pocas, de vez en cuando, solo en secciones claras
        var now = performance.now();
        var dist = Math.hypot(tx - lastPos[0], ty - lastPos[1]);
        if (!dark && !view && now - lastSpawn > 140 && dist > 70 && Math.random() < 0.55) {
          lastSpawn = now; lastPos = [tx, ty];
          var n = 2 + (Math.random() < 0.4 ? 1 : 0);
          for (var i = 0; i < n; i++) {
            leaves.push({
              x: tx + (Math.random() - 0.5) * 10, y: ty + (Math.random() - 0.5) * 10,
              vx: (Math.random() - 0.5) * 30, vy: 18 + Math.random() * 30,
              r: Math.random() * 6.28, vr: (Math.random() - 0.5) * 7,
              s: 3 + Math.random() * 3.5, life: 0, max: 0.6 + Math.random() * 0.3,
              tilt: Math.random() * 6.28,
            });
          }
          if (!leafRun) { leafRun = true; lastT = performance.now(); requestAnimationFrame(drawLeaves); }
        }
      }, { passive: true });
      document.addEventListener('mouseleave', function () { cursor.classList.remove('is-visible'); });
      var lastT = 0;
      function drawLeaves(now) {
        var dt = Math.min(0.05, (now - lastT) / 1000); lastT = now;
        lc.setTransform(dpr, 0, 0, dpr, 0, 0);
        lc.clearRect(0, 0, innerWidth, innerHeight);
        leaves = leaves.filter(function (p) { return (p.life += dt) < p.max; });
        leaves.forEach(function (p) {
          p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt; p.tilt += dt * 9;
          var a = 1 - p.life / p.max;
          var sy = Math.abs(Math.cos(p.tilt)); // giro de la lámina
          lc.save();
          lc.translate(p.x, p.y); lc.rotate(p.r); lc.scale(1, 0.25 + sy * 0.75);
          lc.globalAlpha = a * 0.95;
          lc.beginPath(); lc.moveTo(0, -p.s); lc.lineTo(p.s * 0.9, p.s * 0.6); lc.lineTo(-p.s * 0.8, p.s * 0.5); lc.closePath();
          lc.fillStyle = sy > 0.7 ? '#E7CC8E' : '#B8975A';
          lc.fill();
          lc.restore();
        });
        if (leaves.length) requestAnimationFrame(drawLeaves);
        else { lc.clearRect(0, 0, innerWidth, innerHeight); leafRun = false; }
      }
      (function follow() {
        cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2;
        cursor.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)';
        requestAnimationFrame(follow);
      })();
      // Botones magnéticos
      if (hasGSAP) {
        $$('[data-magnetic]').forEach(function (b) {
          var xTo = gsap.quickTo(b, 'x', { duration: 0.5, ease: 'power3.out' });
          var yTo = gsap.quickTo(b, 'y', { duration: 0.5, ease: 'power3.out' });
          b.addEventListener('mousemove', function (e) {
            var r = b.getBoundingClientRect();
            xTo((e.clientX - r.left - r.width / 2) * 0.22);
            yTo((e.clientY - r.top - r.height / 2) * 0.3);
          });
          b.addEventListener('mouseleave', function () { xTo(0); yTo(0); });
        });
      }
    }

    /* ───────────────────────── Ajustes finales ───────────────────────── */
    if (hasGSAP) {
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
      window.addEventListener('load', function () { ScrollTrigger.refresh(); });
    }
    if (!motion) leafFrames.forEach(function (f) { f.classList.add('is-framed'); });
  }
})();
