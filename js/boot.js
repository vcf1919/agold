/* AGOLD · arranque: clases de entorno antes del primer pintado (sin dependencias). */
(function () {
  var d = document.documentElement;
  d.classList.remove('no-js');
  d.classList.add('js');

  var mm = function (q) { return window.matchMedia && window.matchMedia(q).matches; };
  var reduced = mm('(prefers-reduced-motion: reduce)');
  var finePointer = mm('(hover: hover) and (pointer: fine)');
  var ua = navigator.userAgent || '';
  // iOS/iPadOS: WebKit limita hardwareConcurrency por privacidad, no indica potencia real
  var apple = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  var hc = navigator.hardwareConcurrency || 8;
  var dm = navigator.deviceMemory || 8;
  var weak = dm <= 4 || (!apple && hc <= 4);
  var force = /[?&]hero=(svg|3d)/.exec(location.search);
  var mode = force ? force[1] : (reduced || weak ? 'svg' : '3d');

  var seen = false;
  try { seen = sessionStorage.getItem('agold-intro') === '1'; } catch (e) {}

  d.classList.add(reduced ? 'reduced' : 'motion');
  d.classList.add(finePointer ? 'pointer-fine' : 'pointer-touch');
  d.classList.add('hero-' + mode);
  if (seen) d.classList.add('intro-seen');

  window.AGOLD_ENV = {
    reduced: reduced,
    finePointer: finePointer,
    weak: weak,
    apple: apple,
    mode: mode,
    introSeen: seen,
    mobile: mm('(max-width: 899px)'),
  };
})();
