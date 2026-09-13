// Пчелна ферма „Три слънца“ — поведение на страницата

document.addEventListener('DOMContentLoaded', () => {

  // --- Плавното превъртане обратно (изключено е в <head> за скрола при зареждане) ---
  addEventListener('load', () => {
    setTimeout(() => { document.documentElement.style.scrollBehavior = ''; }, 0);
  }, { once: true });

  // --- Към подстраница: бележим, че тръгваме от сайта ---
  document.querySelectorAll('a[href$=".html"]').forEach(a =>
    a.addEventListener('click', () => {
      try { sessionStorage.setItem('ts-from-site', '1'); } catch (_) {}
    }));

  // --- „Обратно“ на подстраниците: назад в историята, за да заварим страницата
  //     точно както сме я оставили; иначе (дошли отвън) следваме линка ---
  let fromSite = false;
  try {
    fromSite = sessionStorage.getItem('ts-from-site') === '1';
    sessionStorage.removeItem('ts-from-site');
  } catch (_) {}

  document.querySelectorAll('a[data-back]').forEach(a =>
    a.addEventListener('click', e => {
      if (fromSite && history.length > 1) {
        e.preventDefault();
        history.back();
      }
    }));

  // --- Хедър: сянка при скрол ---
  const header = document.querySelector('.site-header');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 10);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // --- Мобилно меню ---
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.site-nav');

  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open);
  });

  nav.addEventListener('click', e => {
    if (e.target.matches('.nav-link')) {
      nav.classList.remove('is-open');
      toggle.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  // --- Активна секция в навигацията ---
  const links = [...document.querySelectorAll('.site-nav .nav-link')];
  const sections = links
    .filter(l => l.getAttribute('href').startsWith('#'))
    .map(l => document.querySelector(l.getAttribute('href')))
    .filter(Boolean);

  const navObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(l =>
        l.classList.toggle('is-active', l.getAttribute('href') === '#' + entry.target.id));
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => navObserver.observe(s));

  // --- Reveal при скрол ---
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  // При връщане назад/напред в историята страницата трябва да изглежда както сме я
  // оставили — без повторно появяване на елементите и без броячи от нула.
  const navEntry = performance.getEntriesByType('navigation')[0];
  const restored = !!navEntry && navEntry.type === 'back_forward';

  document.querySelectorAll('.reveal').forEach(el =>
    restored ? el.classList.add('is-visible') : revealObserver.observe(el));

  // --- Броячи в секция „Пчелинът“ ---
  const animateCount = el => {
    const target = +el.dataset.count;
    const dur = 1200;
    const start = performance.now();
    const step = now => {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const statsObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('[data-count]').forEach(animateCount);
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  const stats = document.querySelector('.stats');
  if (stats) {
    if (restored) stats.querySelectorAll('[data-count]').forEach(el => { el.textContent = el.dataset.count; });
    else statsObserver.observe(stats);
  }

  // --- Лайтбокс за галерията ---
  const lightbox = document.querySelector('.lightbox');
  if (!lightbox) return;

  const lbImg = lightbox.querySelector('img');
  const lbCaption = lightbox.querySelector('.lightbox-caption');

  document.querySelectorAll('.gallery-item').forEach(fig => {
    fig.addEventListener('click', () => {
      const img = fig.querySelector('img');
      lbImg.src = img.src;
      lbImg.alt = img.alt;
      lbCaption.textContent = fig.querySelector('figcaption')?.textContent ?? '';
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
    });
  });

  const closeLightbox = () => {
    lightbox.hidden = true;
    document.body.style.overflow = '';
  };

  lightbox.addEventListener('click', e => {
    if (e.target === lightbox || e.target.closest('.lightbox-close')) closeLightbox();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !lightbox.hidden) closeLightbox();
  });
});
