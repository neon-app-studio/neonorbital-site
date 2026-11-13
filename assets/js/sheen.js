/* SHEEN page: copy address, coin reveal + pointer tilt */
(() => {
  const d = document, live = d.getElementById('copylive');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const copy = async t => {
    try { await navigator.clipboard.writeText(t); return true; }
    catch { const a = d.createElement('textarea'); a.value = t; a.setAttribute('readonly', ''); a.style.cssText = 'position:fixed;opacity:0'; d.body.appendChild(a); a.select(); let ok = false; try { ok = d.execCommand('copy'); } catch {} a.remove(); return ok; }
  };
  d.querySelectorAll('[data-copy]').forEach(b => {
    const lbl = b.querySelector('[data-copy-label]'), orig = lbl.textContent;
    b.addEventListener('click', async () => {
      const ok = await copy(b.dataset.copy);
      lbl.textContent = ok ? 'Copied' : 'Press and hold to copy';
      b.classList.toggle('done', ok);
      if (live) live.textContent = ok ? 'SHEEN address copied' : '';
      clearTimeout(b._t); b._t = setTimeout(() => { lbl.textContent = orig; b.classList.remove('done'); }, 2200);
    });
  });
  const coin = d.querySelector('.coin');
  if (!coin) return;
  requestAnimationFrame(() => setTimeout(() => coin.classList.add('in'), 150));
  if (reduce || !matchMedia('(pointer: fine)').matches) return;
  const tilt = coin.querySelector('.coin-tilt'), hero = d.querySelector('.sh-hero');
  let raf = 0;
  hero.addEventListener('pointermove', e => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const r = coin.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) / r.width, y = (e.clientY - (r.top + r.height / 2)) / r.height;
      const cx = Math.max(-1, Math.min(1, x)), cy = Math.max(-1, Math.min(1, y));
      tilt.style.transition = 'transform .5s var(--ease)';
      tilt.style.transform = `rotateY(${cx * 12}deg) rotateX(${-cy * 10}deg)`;
    });
  });
  hero.addEventListener('pointerleave', () => { tilt.style.transition = ''; tilt.style.transform = ''; });
})();
