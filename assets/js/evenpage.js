/* Evenpage feature: story screen swap, hero tilt, parallax fallback. Content is visible without this file. */
(() => {
  const d = document;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Story: the sticky phone shows the screen for the step in view */
  const sticky = d.querySelector('.ep-sticky');
  const steps = [...d.querySelectorAll('.ep-step')];
  if (sticky && steps.length && 'IntersectionObserver' in window) {
    const imgs = [...sticky.querySelectorAll('.scr img')];
    const show = i => { sticky.dataset.active = i; imgs.forEach((im, k) => im.classList.toggle('on', k === i)); steps.forEach((s, k) => s.classList.toggle('cur', k === i)); };
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) show(steps.indexOf(e.target)); }), { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach(s => io.observe(s));
  }

  if (reduce) return;

  /* Hero: gentle pointer tilt on the phone trio (mouse and trackpad only) */
  if (matchMedia('(pointer: fine)').matches) d.querySelectorAll('.ep-stage').forEach(stage => {
    const trio = stage.querySelector('.ep-trio'); if (!trio) return;
    const host = stage.closest('.ep-panel') || stage; let raf = 0;
    host.addEventListener('pointermove', e => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = stage.getBoundingClientRect();
        const x = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / r.width));
        const y = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / r.height));
        trio.style.transform = `rotateY(${x * 7}deg) rotateX(${-y * 5}deg)`;
      });
    });
    host.addEventListener('pointerleave', () => { cancelAnimationFrame(raf); trio.style.transform = ''; });
  });

  /* Parallax fallback where CSS scroll timelines are not supported */
  if (window.CSS && CSS.supports('animation-timeline: view()')) return;
  const els = [...d.querySelectorAll('.ep-px')];
  if (!els.length) return;
  const amp = el => el.classList.contains('fast') ? 70 : el.classList.contains('slow') ? 18 : 36;
  let tick = false;
  const upd = () => {
    const h = innerHeight;
    els.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > h + 200) return;
      const p = Math.max(0, Math.min(1, (h - r.top) / (h + r.height)));
      el.style.setProperty('--py', ((0.5 - p) * 2 * amp(el)).toFixed(1) + 'px');
    });
    tick = false;
  };
  addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
  addEventListener('resize', upd); upd();
})();
