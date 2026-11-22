(() => {
  let activeId = '';
  let honorObserver = null;
  let yearObserver = null;
  const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const entries = () => {
    const nav = document.querySelector('.site-nav');
    if (!nav) return [];
    return [...nav.querySelectorAll('a[href^="#"]')]
      .map((link) => {
        const id = link.getAttribute('href')?.slice(1);
        const el = id ? document.getElementById(id) : null;
        return el ? { id, el, link } : null;
      })
      .filter(Boolean);
  };

  const setActive = (id) => {
    const items = entries();
    if (!items.length) return;
    if (id === activeId && items.some(({ link }) => link.classList.contains('is-active'))) return;
    activeId = id;
    for (const { id: sectionId, link } of items) {
      const on = sectionId === id;
      link.classList.toggle('is-active', on);
      if (on) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  };

  const pick = () => {
    const items = entries();
    if (!items.length) return;
    const marker = window.scrollY + Math.min(160, window.innerHeight * 0.28);
    let current = items[0].id;
    for (const { id, el } of items) {
      const top = el.getBoundingClientRect().top + window.scrollY;
      if (top <= marker) current = id;
    }
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8) {
      current = items[items.length - 1].id;
    }
    setActive(current);
  };

  const syncTimeline = () => {
    const blocks = [...document.querySelectorAll('.project-year-block')];
    if (!blocks.length) return;
    const marker = window.scrollY + Math.min(150, window.innerHeight * 0.3);
    let activeIndex = -1;

    for (let i = 0; i < blocks.length; i++) {
      const top = blocks[i].getBoundingClientRect().top + window.scrollY;
      if (top <= marker + 8) activeIndex = i;
    }
    if (activeIndex < 0) activeIndex = 0;

    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      const top = block.getBoundingClientRect().top + window.scrollY;
      const height = Math.max(block.offsetHeight, 1);
      const passed = i < activeIndex;
      const active = i === activeIndex;
      const upcoming = i > activeIndex;

      block.classList.toggle('is-passed', passed);
      block.classList.toggle('is-active', active);
      block.classList.toggle('is-upcoming', upcoming);

      let progress = 0;
      if (passed) progress = 1;
      else if (active) {
        const span = Math.max(height - window.innerHeight * 0.22, height * 0.45);
        progress = Math.min(1, Math.max(0, (marker - top) / span));
        if (i === blocks.length - 1 && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 12) {
          progress = 1;
        }
      }
      block.style.setProperty('--rail-progress', progress.toFixed(4));
    }
  };

  const observeHonors = () => {
    honorObserver?.disconnect();
    const cards = [...document.querySelectorAll('.honor-card.featured')];
    if (!cards.length) return;
    if (reduceMotion()) {
      for (const card of cards) card.classList.add('is-visible');
      return;
    }
    honorObserver = new IntersectionObserver((entriesList) => {
      for (const entry of entriesList) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        honorObserver.unobserve(entry.target);
      }
    }, { threshold: 0.28, rootMargin: '0px 0px -8% 0px' });
    for (const card of cards) honorObserver.observe(card);
  };

  const observeYears = () => {
    yearObserver?.disconnect();
    const blocks = [...document.querySelectorAll('.project-year-block')];
    if (!blocks.length) return;
    if (reduceMotion()) {
      for (const block of blocks) block.classList.add('is-visible');
      syncTimeline();
      return;
    }
    yearObserver = new IntersectionObserver((entriesList) => {
      for (const entry of entriesList) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        yearObserver.unobserve(entry.target);
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    for (const block of blocks) yearObserver.observe(block);
    syncTimeline();
  };

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      pick();
      syncTimeline();
      ticking = false;
    });
  };

  document.addEventListener('click', (event) => {
    const link = event.target.closest('.site-nav a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute('href')?.slice(1);
    if (id) setActive(id);
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  window.__personalSiteNavRefresh = () => {
    activeId = '';
    pick();
    observeHonors();
    observeYears();
  };
  pick();
  observeHonors();
  observeYears();
})();
