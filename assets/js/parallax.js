/* KJ 2026 — Page background parallax engine.
   Fixed background bubbles drift at different speeds on scroll,
   plus a subtle mouse parallax on fine pointers.
   Disabled automatically when the user prefers reduced motion. */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var orbs = Array.prototype.slice.call(document.querySelectorAll('[data-bg-parallax]'));
  if (!orbs.length) return;

  var ticking = false;
  var mx = 0, my = 0;

  function update() {
    ticking = false;
    var y = window.scrollY || window.pageYOffset || 0;
    var fade = Math.min(y / 400, 1);
    for (var i = 0; i < orbs.length; i++) {
      var el = orbs[i];
      var speed = parseFloat(el.getAttribute('data-bg-parallax')) || 0.12;
      var x = mx * speed * 160;
      var yy = y * speed + my * speed * 160;
      el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + yy.toFixed(1) + 'px,0)';
      el.style.opacity = fade.toFixed(2);
    }
  }

  function request() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request);

  if (window.matchMedia('(pointer: fine)').matches) {
    document.addEventListener('mousemove', function (e) {
      mx = e.clientX / window.innerWidth - 0.5;
      my = e.clientY / window.innerHeight - 0.5;
      request();
    }, { passive: true });
  }

  update();
})();
