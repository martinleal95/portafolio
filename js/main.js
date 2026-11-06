/* Martín Leal · Norte Sistemas — interacciones (sin dependencias) */
(() => {
  'use strict';

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = window.matchMedia('(hover: hover)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------- Año y reloj (hora de Argentina) ---------- */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  const clock = $('#clock');
  if (clock) {
    const fmt = new Intl.DateTimeFormat('es-AR', {
      hour: '2-digit', minute: '2-digit', hour12: false,
      timeZone: 'America/Argentina/Buenos_Aires'
    });
    const tick = () => { clock.textContent = 'ART ' + fmt.format(new Date()); };
    tick();
    setInterval(tick, 20000);
  }

  /* ---------- Scroll reveal ---------- */
  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('is-in');
        revealIO.unobserve(e.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });
  $$('.reveal, .title, .hero__name, .contact__big').forEach((el) => revealIO.observe(el));

  /* ---------- Transición entre secciones (papel ↔ tinta) + menú activo ---------- */
  const links = new Map($$('.nav a').map((a) => [a.getAttribute('href').slice(1), a]));
  const modeIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      document.body.dataset.mode = e.target.dataset.mode || 'paper';
      links.forEach((a, id) => a.classList.toggle('is-active', id === e.target.id));
    });
  }, { rootMargin: '-49% 0px -49% 0px' });
  $$('section[data-mode]').forEach((s) => modeIO.observe(s));

  /* ---------- Barra de progreso ---------- */
  const bar = $('.progress i');
  let ticking = false;
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
    if (bar) bar.style.transform = `scaleX(${p})`;
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(updateProgress); }
  }, { passive: true });
  updateProgress();

  /* ---------- Terminal del hero: la consulta se escribe sola ---------- */
  const sql = $('#sql');
  const result = $('#sql-result');
  if (sql && result && !reduce) {
    const full = sql.dataset.text || sql.textContent;
    const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const highlight = (text) => esc(text).replace(
      /('[^']*'?)|\b(SELECT|FROM|WHERE)\b/g,
      (m, str) => (str ? `<span class="str">${m}</span>` : `<span class="kw">${m}</span>`)
    );
    const caret = '<span class="terminal__caret" aria-hidden="true"></span>';
    sql.innerHTML = caret;
    result.classList.remove('is-in');

    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      let i = 0;
      const step = () => {
        i += 1;
        sql.innerHTML = highlight(full.slice(0, i)) + caret;
        if (i < full.length) {
          setTimeout(step, 26 + Math.random() * 26);
        } else {
          setTimeout(() => result.classList.add('is-in'), 350);
        }
      };
      setTimeout(step, 700);
    };
    new IntersectionObserver((entries, obs) => {
      if (entries[0].isIntersecting) { start(); obs.disconnect(); }
    }, { threshold: 0.3 }).observe($('.terminal'));
  }

  /* ---------- Proyectos: parallax del mouse + círculo de revelación ---------- */
  if (canHover && !reduce) {
    $$('[data-tilt]').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        el.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
        el.style.setProperty('--my', (y * 100).toFixed(1) + '%');
        el.style.setProperty('--px', ((0.5 - x) * 24).toFixed(1) + 'px');
        el.style.setProperty('--py', ((0.5 - y) * 24).toFixed(1) + 'px');
      });
      el.addEventListener('pointerleave', () => {
        el.style.setProperty('--px', '0px');
        el.style.setProperty('--py', '0px');
      });
    });
  }

  /* ---------- Botones magnéticos ---------- */
  if (canHover && !reduce) {
    const mags = $$('[data-magnetic]');
    let raf = 0;
    document.addEventListener('pointermove', (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        mags.forEach((b) => {
          const r = b.getBoundingClientRect();
          const cx = r.left + r.width / 2;
          const cy = r.top + r.height / 2;
          const dx = e.clientX - cx;
          const dy = e.clientY - cy;
          const reach = Math.max(r.width, r.height) * 0.8;
          if (Math.hypot(dx, dy) < reach) {
            b.style.transform = `translate(${(dx * 0.22).toFixed(1)}px, ${(dy * 0.28).toFixed(1)}px)`;
          } else if (b.style.transform) {
            b.style.transform = '';
          }
        });
      });
    }, { passive: true });
  }

  /* ---------- Copiar email ---------- */
  const copyBtn = $('#copy');
  const status = $('#copy-status');
  const mail = 'martinlealsf95@gmail.com';
  if (copyBtn && status) {
    const say = (msg) => {
      status.textContent = msg;
      setTimeout(() => { status.textContent = ''; }, 2600);
    };
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(mail);
        say('Copiado ✓');
      } catch (_) {
        const t = document.createElement('textarea');
        t.value = mail;
        t.setAttribute('readonly', '');
        t.style.position = 'fixed';
        t.style.opacity = '0';
        document.body.appendChild(t);
        t.select();
        let ok = false;
        try { ok = document.execCommand('copy'); } catch (__) { /* sin soporte */ }
        t.remove();
        say(ok ? 'Copiado ✓' : 'No se pudo copiar: ' + mail);
      }
    });
  }
})();
