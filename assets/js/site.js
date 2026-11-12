/* NeonOrbital — small, dependency-free interactions. */
(() => {
  const d = document, root = d.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Header: solid after scroll, hides on scroll down, returns on scroll up */
  const hdr = d.querySelector('.hdr');
  let lastY = scrollY, ticking = false;
  const onScroll = () => {
    const y = scrollY;
    hdr.classList.toggle('scrolled', y > 8);
    if (!d.body.classList.contains('menu-open')) hdr.classList.toggle('hide', y > 220 && y > lastY + 4);
    if (y < lastY - 4) hdr.classList.remove('hide');
    lastY = y; ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* Mobile menu */
  const mb = d.querySelector('.menu-btn'), mnav = d.querySelector('.mnav');
  const setMenu = open => {
    d.body.classList.toggle('menu-open', open);
    mb.setAttribute('aria-expanded', open);
    mnav.toggleAttribute('inert', !open);
    if (open) hdr.classList.remove('hide');
  };
  if (mb) {
    mnav.setAttribute('inert', '');
    mb.addEventListener('click', () => setMenu(!d.body.classList.contains('menu-open')));
    addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
    mnav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  }

  /* Split headings into line masks */
  d.querySelectorAll('[data-split]').forEach(el => {
    const lines = el.innerHTML.split(/<br\s*\/?>/i);
    el.innerHTML = lines.map((l, i) => `<span class="line-mask"><span style="--i:${i}">${l}</span></span>`).join('');
    el.classList.add('split');
  });

  /* Scroll reveals */
  const els = d.querySelectorAll('.rv, .rv-img, .split');
  if (reduce || !('IntersectionObserver' in window)) els.forEach(e => e.classList.add('in'));
  else {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
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
    const loop = () => { clearTimeout(timer); if (paused || reduce) return; timer = setTimeout(() => { step++; show(step); loop(); }, DUR); };
    // Preload the next images only after first paint
    addEventListener('load', () => setTimeout(() => wall.querySelectorAll('img[data-src]').forEach(i => { i.src = i.dataset.src; if (i.dataset.srcset) i.srcset = i.dataset.srcset; }), 600));
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

  /* Year */
  d.querySelectorAll('[data-year]').forEach(e => e.textContent = new Date().getFullYear());
})();
