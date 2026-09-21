/* KJ 2026 — Motion engine: background parallax + in-flow parallax
   objects + 3D card tilt. Disabled when reduced motion is preferred. */
(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(pointer: fine)').matches;

  function slice(sel) {
    return Array.prototype.slice.call(document.querySelectorAll(sel));
  }

  var orbs = slice('[data-bg-parallax]');
  var depthEls = slice('[data-depth]');
  var mx = 0, my = 0, ticking = false;

  /* ----- Fixed background bubbles ----- */
  function updateOrbs() {
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

  /* ----- In-flow parallax objects (timeline visuals, card media) ----- */
  function updateDepth() {
    var vh = window.innerHeight || 1;
    for (var j = 0; j < depthEls.length; j++) {
      var del = depthEls[j];
      var d = parseFloat(del.getAttribute('data-depth')) || 0.05;
      var r = del.getBoundingClientRect();
      var shift = (r.top + r.height / 2 - vh / 2) * d;
      shift = Math.max(-28, Math.min(28, shift));
      del.style.transform = 'translate3d(0,' + shift.toFixed(1) + 'px,0)';
    }
  }

  function updateAll() {
    ticking = false;
    updateOrbs();
    updateDepth();
  }

  function requestMotion() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateAll);
    }
  }

  if (!reduceMotion && (orbs.length || depthEls.length)) {
    window.addEventListener('scroll', requestMotion, { passive: true });
    window.addEventListener('resize', requestMotion);
    if (finePointer) {
      document.addEventListener('mousemove', function (e) {
        mx = e.clientX / window.innerWidth - 0.5;
        my = e.clientY / window.innerHeight - 0.5;
        requestMotion();
      }, { passive: true });
    }
    updateAll();
  }

  /* ----- Navbar: flush bar at top, detached pill once scrolled ----- */
  var navClass = 'scrolled';
  function updateNav() {
    document.body.classList.toggle(navClass, (window.scrollY || window.pageYOffset || 0) > 8);
  }
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  /* ----- 3D tilt cards (Parsec-style) ----- */
  if (!reduceMotion && finePointer) {
    slice('[data-tilt]').forEach(function (card) {
      var inner = card.querySelector('.tilt, .p3d-inner') || card;
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        inner.style.transform =
          'rotateY(' + (px * 10).toFixed(2) + 'deg) rotateX(' + (-py * 10).toFixed(2) + 'deg)';
        inner.style.setProperty('--mx', ((px + 0.5) * 100).toFixed(1) + '%');
        inner.style.setProperty('--my', ((py + 0.5) * 100).toFixed(1) + '%');
      });
      card.addEventListener('mouseleave', function () {
        inner.style.transform = '';
      });
    });
  }
  /* ----- Sliding glass nav indicator (desktop) ----- */
  (function navIndicator() {
    if (reduceMotion) return;
    var bar = document.querySelector('.menutitles');
    var active = bar ? bar.querySelector('a.active') : null;
    if (!bar || !active) return;
    if (!window.matchMedia('(min-width: 861px)').matches) return;
    var pill = document.createElement('span');
    pill.className = 'nav-indicator';
    pill.setAttribute('aria-hidden', 'true');
    bar.appendChild(pill);
    function move(el) {
      pill.style.left = el.offsetLeft + 'px';
      pill.style.top = el.offsetTop + 'px';
      pill.style.width = el.offsetWidth + 'px';
      pill.style.height = el.offsetHeight + 'px';
      pill.style.opacity = '1';
    }
    function goActive() { move(active); }
    bar.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var href = a.getAttribute('href') || '';
        if (href.charAt(0) === '#') return;
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        if (a.target === '_blank') return;
        e.preventDefault();
        document.body.classList.add('leaving');
        move(a);
        window.setTimeout(function () { window.location.href = a.href; }, 380);
      });
    });
    window.addEventListener('resize', goActive);
    window.addEventListener('load', goActive);
    if (document.fonts && document.fonts.ready) { document.fonts.ready.then(goActive); }
    goActive();
  })();
})();
