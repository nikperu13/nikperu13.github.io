(function () {
  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  const brand = document.querySelector('.brand');
  const progress = document.querySelector('.scroll-progress span');
  const header = document.querySelector('.site-header');

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      const isOpen = nav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  const sectionLinks = Array.from(document.querySelectorAll('.nav a[data-section]'));
  const sections = sectionLinks
    .map(function (link) {
      const id = link.getAttribute('data-section');
      return id ? document.getElementById(id) : null;
    })
    .filter(Boolean);

  function setActiveLink() {
    const headerHeight = header ? header.offsetHeight : 0;
    const marker = Math.max(headerHeight + 24, Math.round(window.innerHeight * 0.36));
    let activeId = '';

    sections.forEach(function (section) {
      const rect = section.getBoundingClientRect();
      if (rect.top <= marker && rect.bottom > marker) {
        activeId = section.id;
      }
    });

    if (!activeId && sections.length > 0) {
      activeId = sections[sections.length - 1].id;
      for (let i = 0; i < sections.length; i += 1) {
        if (sections[i].getBoundingClientRect().top > marker) {
          activeId = i === 0 ? sections[0].id : sections[i - 1].id;
          break;
        }
      }
    }

    sectionLinks.forEach(function (link) {
      const isActive = link.getAttribute('data-section') === activeId;
      link.classList.toggle('active', isActive);
    });
  }

  function updateProgress() {
    if (!progress) return;
    const doc = document.documentElement;
    const scrollable = Math.max(doc.scrollHeight - window.innerHeight, 1);
    const ratio = Math.min(window.scrollY / scrollable, 1);
    progress.style.transform = 'scaleX(' + ratio.toFixed(3) + ')';
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      setActiveLink();
      updateProgress();
      ticking = false;
    });
  }

  setActiveLink();
  updateProgress();
  window.addEventListener('scroll', onScroll, { passive: true });

  if (brand) {
    brand.addEventListener('click', function () {
      brand.classList.remove('is-bouncing');
      window.requestAnimationFrame(function () {
        brand.classList.add('is-bouncing');
      });
    });
  }

  const revealTargets = document.querySelectorAll('.card, .panel, .project-card, .role-card, .contact-card, .section-head');

  if ('IntersectionObserver' in window && revealTargets.length > 0) {
    const observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        entry.target.classList.remove('reveal-pending');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

    revealTargets.forEach(function (el, idx) {
      el.classList.add('reveal');
      el.classList.add('reveal-pending');
      el.style.setProperty('--reveal-delay', (idx % 6) * 50 + 'ms');
      observer.observe(el);
    });

    window.setTimeout(function () {
      revealTargets.forEach(function (el) {
        if (el.classList.contains('reveal-pending')) {
          el.classList.remove('reveal-pending');
        }
      });
    }, 1400);
  }
})();
