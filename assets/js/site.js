/* NeonOrbital — small, dependency-free interactions. */
(() => {
  const d = document, root = d.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.NO_JS_OK = 1; // tells the head failsafe that this script ran
  d.addEventListener('touchstart', () => {}, { passive: true }); // lets iOS Safari show :active press states

  /* Header: solid after scroll, hides on scroll down, returns on scroll up */
  const hdr = d.querySelector('.hdr');
  let lastY = scrollY, ticking = false;
  const onScroll = () => {
    const y = scrollY;
    hdr.classList.toggle('scrolled', y > 8);
    if (!d.body.classList.contains('menu-open') && !hdr.contains(d.activeElement)) hdr.classList.toggle('hide', y > 220 && y > lastY + 4);
    if (y < lastY - 4) hdr.classList.remove('hide');
    lastY = y; ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* Phone menu (Phase 5): focus moves in on open, Tab is trapped between the close button and the menu,
     Esc or a link closes it and focus goes back to the button; the rest of the page is inert while open */
  const mb = d.querySelector('.menu-btn'), mnav = d.querySelector('.mnav');
  const behind = [d.querySelector('main'), d.querySelector('.ftr'), d.querySelector('.skip'), d.querySelector('.hdr .brand'), d.querySelector('.hdr .nav')].filter(Boolean);
  const isOpen = () => d.body.classList.contains('menu-open');
  const setMenu = (open, back) => {
    d.body.classList.toggle('menu-open', open);
    mb.setAttribute('aria-expanded', open);
    mb.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    mnav.toggleAttribute('inert', !open);
    behind.forEach(el => el.toggleAttribute('inert', open));
    if (open) { hdr.classList.remove('hide'); const first = mnav.querySelector('a[aria-current=page]') || mnav.querySelector('a'); setTimeout(() => first && first.focus({ preventScroll: true }), reduce ? 0 : 60); }
    else if (back) mb.focus({ preventScroll: true });
  };
  if (mb) {
    mnav.setAttribute('inert', '');
    mb.addEventListener('click', () => setMenu(!isOpen(), true));
    addEventListener('keydown', e => {
      if (!isOpen()) return;
      if (e.key === 'Escape') { e.preventDefault(); setMenu(false, true); return; }
      if (e.key !== 'Tab') return;
      const f = [mb, ...mnav.querySelectorAll('a')]; const i = f.indexOf(d.activeElement);
      if (e.shiftKey && (i <= 0)) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && (i === f.length - 1 || i === -1)) { e.preventDefault(); f[0].focus(); }
    });
    mnav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
    matchMedia('(min-width:901px)').addEventListener('change', e => { if (e.matches && isOpen()) setMenu(false); });
  }

  /* Split headings into line masks */
  d.querySelectorAll('[data-split]').forEach(el => {
    const lines = el.innerHTML.split(/<br\s*\/?>/i);
    el.innerHTML = lines.map((l, i) => `<span class="line-mask"><span style="--i:${i}">${l}</span></span>`).join('');
    el.classList.add('split');
  });

  /* Scroll reveals */
  let els = [...d.querySelectorAll('.rv, .rv-img, .split, .rv-fade')];
  if (reduce || !('IntersectionObserver' in window)) els.forEach(e => e.classList.add('in'));
  else {
    /* Below the fold, hand reveals to CSS scroll-driven animations where supported (decided from the observer's first report, no forced layout) */
    const sda = !!(window.CSS && CSS.supports('animation-timeline: view()'));
    const seen = new WeakSet();
    const io = new IntersectionObserver(es => es.forEach(e => {
      const t = e.target, first = !seen.has(t); seen.add(t);
      if (e.isIntersecting) { t.classList.add('in'); io.unobserve(t); }
      else if (first && sda && !t.classList.contains('split') && e.boundingClientRect.top > innerHeight) { t.classList.add('sd', 'in'); io.unobserve(t); }
    }), { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    els.forEach(e => io.observe(e));
  }

  /* Hero gallery wall: each panel crossfades through its own artworks, staggered */
  const wall = d.querySelector('.wall');
  if (wall) {
    const panels = [...wall.querySelectorAll('.panel')];
    const counterNum = d.querySelector('.counter .n'), bar = d.querySelector('.counter .bar i');
    const DUR = 6500; let step = 0, timer = null, paused = false;
    const total = Math.max(...panels.map(p => p.querySelectorAll('figure').length));
    const show = s => {
      panels.forEach((p, pi) => {
        const figs = p.querySelectorAll('figure');
        const k = s % figs.length;
        setTimeout(() => {
          figs.forEach((f, i) => f.classList.toggle('on', i === k));
          const link = p.querySelector('a.cover'), on = figs[k];
          if (link && on) { link.href = on.dataset.href; link.setAttribute('aria-label', on.dataset.label); }
        }, reduce ? 0 : pi * 450);
      });
      if (counterNum) counterNum.textContent = String((s % total) + 1).padStart(2, '0');
      if (bar && !reduce) { bar.classList.remove('run'); void bar.offsetWidth; bar.style.setProperty('--dur', DUR + 'ms'); bar.classList.add('run'); }
    };
    const loadFig = fig => {
      fig.querySelectorAll('source[data-srcset]').forEach(s => { s.srcset = s.dataset.srcset; s.removeAttribute('data-srcset'); });
      fig.querySelectorAll('img[data-src]').forEach(i => {
        if (i.dataset.srcset) { i.srcset = i.dataset.srcset; i.removeAttribute('data-srcset'); }
        i.src = i.dataset.src; i.removeAttribute('data-src');
      });
    };
    const preloadStep = s => panels.forEach(panel => {
      const figs = panel.querySelectorAll('figure');
      loadFig(figs[s % figs.length]);
    });
    const loop = () => { clearTimeout(timer); if (paused || reduce) return; timer = setTimeout(() => { step++; show(step); preloadStep(step + 1); loop(); }, DUR); };
    // After first paint: first frame of each panel (desktop row + phone peek) and the next frame for the crossfade. Later frames wait their turn.
    const later = () => { setTimeout(() => preloadStep(0), 600); setTimeout(() => preloadStep(1), 2000); };
    if (d.readyState === 'complete') later(); else addEventListener('load', later);
    wall.addEventListener('scroll', () => preloadStep(0), { passive: true, once: true });
    show(0); loop();
    d.addEventListener('visibilitychange', () => { paused = d.hidden; loop(); });
    wall.addEventListener('mouseenter', () => { paused = true; clearTimeout(timer); });
    wall.addEventListener('mouseleave', () => { paused = false; loop(); });
  }

  /* Rails: arrows, drag-to-scroll on mouse, progress track. Touch uses native swipe + snap. */
  d.querySelectorAll('.rail-wrap').forEach(w => {
    const rail = w.querySelector('.rail'), prev = w.querySelector('.prev'), next = w.querySelector('.next'), thumb = w.querySelector('.track i');
    const upd = () => {
      const max = rail.scrollWidth - rail.clientWidth;
      if (prev) prev.disabled = rail.scrollLeft < 4;
      if (next) next.disabled = rail.scrollLeft > max - 4;
      if (thumb) { const r = rail.clientWidth / rail.scrollWidth; thumb.style.width = Math.max(r * 100, 8) + '%'; thumb.style.transform = `translateX(${max > 0 ? (rail.scrollLeft / max) * ((1 / Math.max(r, .08)) - 1) * 100 : 0}%)`; }
    };
    const by = dir => { const c = rail.querySelector('.card:not([hidden])'); const step = c ? c.getBoundingClientRect().width + 20 : 300; rail.scrollBy({ left: dir * step * (innerWidth > 900 ? 2 : 1), behavior: reduce ? 'auto' : 'smooth' }); };
    prev && prev.addEventListener('click', () => by(-1));
    next && next.addEventListener('click', () => by(1));
    rail.addEventListener('scroll', () => requestAnimationFrame(upd), { passive: true });
    addEventListener('resize', upd); upd();
    let down = false, sx = 0, sl = 0, moved = false;
    rail.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = rail.scrollLeft; });
    addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - sx; if (Math.abs(dx) > 5) { moved = true; rail.classList.add('dragging'); } rail.scrollLeft = sl - dx; });
    addEventListener('pointerup', () => { if (!down) return; down = false; setTimeout(() => rail.classList.remove('dragging'), 0); });
    rail.addEventListener('click', e => { if (moved) { e.preventDefault(); moved = false; } }, true);
    rail.addEventListener('dragstart', e => e.preventDefault());
    w._upd = upd;
  });

  /* Filters (shop grid and home rail) */
  d.querySelectorAll('[data-filter-group]').forEach(group => {
    const target = d.getElementById(group.dataset.filterGroup);
    const chips = group.querySelectorAll('.chip');
    chips.forEach(ch => ch.addEventListener('click', () => {
      const f = ch.dataset.filter;
      const apply = () => {
        chips.forEach(c => c.setAttribute('aria-pressed', c === ch));
        target.querySelectorAll('.card').forEach(c => { c.hidden = !(f === 'all' || c.dataset.cat === f); });
        target.scrollLeft = 0;
        const w = target.closest('.rail-wrap'); if (w && w._upd) w._upd();
        const live = d.getElementById(group.dataset.live); if (live) live.textContent = `${target.querySelectorAll('.card:not([hidden])').length} items shown`;
      };
      if (d.startViewTransition && !reduce) d.startViewTransition(apply); else apply();
    }));
  });

  /* Click-to-load music player (no third-party requests until asked) */
  d.querySelectorAll('[data-embed]').forEach(btn => btn.addEventListener('click', () => {
    const box = btn.closest('.player');
    const f = d.createElement('iframe');
    f.src = btn.dataset.embed; f.title = btn.dataset.title || 'Music player';
    f.loading = 'lazy'; f.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
    box.innerHTML = ''; box.appendChild(f);
  }));

  /* Studio stage: the 3D logo is a looping animated WebP (no video, so iPhone Safari always animates it).
     The still shows first; the animation is swapped in when the stage nears the screen, so it never competes with the first paint.
     Reduced motion keeps the still (its <source> matches first). */
  const orbit = d.querySelector('img.orbit-anim');
  if (orbit) {
    const swap = () => {
      if (orbit.dataset.on) return; orbit.dataset.on = 1;
      orbit.parentNode.querySelectorAll('[data-anim]').forEach(el => { if (el.tagName === 'SOURCE') el.srcset = el.dataset.anim; else el.src = el.dataset.anim; });
    };
    // Start watching only after the page has loaded, so the large animation never competes with the first paint
    const watch = () => {
      if ('IntersectionObserver' in window) {
        const oio = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { oio.disconnect(); swap(); } }, { rootMargin: '80px 0px' });
        oio.observe(orbit.closest('.stage-media') || orbit);
      } else swap();
    };
    const later2 = () => setTimeout(watch, 600);
    if (d.readyState === 'complete') later2(); else addEventListener('load', later2);
  }

  /* Shop: show wall art in a room (useful on touch screens, where there is no hover) */
  d.querySelectorAll('[data-rooms]').forEach(b => b.addEventListener('click', () => {
    const g = d.getElementById(b.dataset.rooms), on = b.getAttribute('aria-pressed') !== 'true';
    const apply = () => { b.setAttribute('aria-pressed', on); g.classList.toggle('rooms', on); };
    if (d.startViewTransition && !reduce) d.startViewTransition(apply); else apply();
  }));

  /* Year */
  d.querySelectorAll('[data-year]').forEach(e => e.textContent = new Date().getFullYear());
})();

/* Release (Nov 15, 2026): signature orbit. The moon follows the pointer, can be dragged, and orbits once on first view. */
(() => {
  const sig = document.querySelector('.sig'); if (!sig) return;
  const moon = sig.querySelector('.sig-moon'), REST = -60; if (!moon) return; // Nov 15: footer now shows the full logo, which has no movable moon
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let a = REST, dragging = false;
  const set = v => { a = v; moon.style.setProperty('--a', v + 'deg'); };
  const angleAt = e => { const r = sig.getBoundingClientRect(); return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180 / Math.PI; };
  const toward = t => { let d = ((t - a) % 360 + 540) % 360 - 180; set(a + d); }; // shortest way round, no backwards jumps
  // one slow orbit the first time the footer comes into view
  if (!reduce && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => { if (es.some(x => x.isIntersecting)) { io.disconnect(); sig.classList.add('spin'); set(a + 360); setTimeout(() => sig.classList.remove('spin'), 1900); } }, { threshold: .6 });
    io.observe(sig);
  }
  // fine pointers: the moon turns toward the pointer anywhere in the footer, and goes home when it leaves
  const ftr = sig.closest('footer');
  if (!reduce && matchMedia('(hover: hover) and (pointer: fine)').matches && ftr) {
    ftr.addEventListener('pointermove', e => { if (dragging || sig.classList.contains('spin')) return; sig.classList.add('follow'); toward(angleAt(e)); }, { passive: true });
    ftr.addEventListener('pointerleave', () => { sig.classList.remove('follow'); toward(REST); });
  }
  // touch and mouse: drag the moon round the ring; it stays where you leave it
  sig.addEventListener('pointerdown', e => { dragging = true; sig.classList.add('drag'); sig.setPointerCapture(e.pointerId); toward(angleAt(e)); });
  sig.addEventListener('pointermove', e => { if (dragging) toward(angleAt(e)); });
  const end = () => { dragging = false; sig.classList.remove('drag'); };
  sig.addEventListener('pointerup', end); sig.addEventListener('pointercancel', end);
})();
