(() => {
  let activeId = '';

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

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      pick();
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
  };
  pick();
})();
