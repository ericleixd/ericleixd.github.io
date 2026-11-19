(() => {
  let activeId = '';
  let revealObserver;
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

  // 默认显示正文。只有注册观察器后才启用入场动画，避免 WebView 禁用脚本时留下空卡片。
  const observeContent = () => {
    revealObserver?.disconnect();
    const cards = document.querySelectorAll('.honor-card.featured, .project-year-block');
    if (reduceMotion() || !window.IntersectionObserver) {
      for (const card of cards) card.classList.remove('awaiting-reveal');
      return;
    }
    revealObserver = new IntersectionObserver((changes, observer) => {
      for (const change of changes) {
        if (!change.isIntersecting) continue;
        change.target.classList.remove('awaiting-reveal');
        observer.unobserve(change.target);
      }
    });
    for (const card of cards) {
      card.classList.add('awaiting-reveal');
      revealObserver.observe(card);
    }
  };

  // 语言和系统字号都可能使吸顶导航换行。用真实高度给片段导航预留空间。
  const measureHeader = () => {
    const header = document.querySelector('.site-header');
    if (header) document.documentElement.style.setProperty('--header-offset', (header.offsetHeight + 8) + 'px');
  };
  const headerObserver = window.ResizeObserver ? new ResizeObserver(measureHeader) : null;
  const refresh = () => {
    measureHeader();
    headerObserver?.disconnect();
    const header = document.querySelector('.site-header');
    if (header) headerObserver?.observe(header);
    activeId = '';
    pick();
    syncTimeline();
    observeContent();
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
  window.addEventListener('resize', measureHeader);
  window.__personalSiteNavRefresh = refresh;
  refresh();
})();
