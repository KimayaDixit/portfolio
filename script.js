/* ── Hamburger toggle ──────────────────────────────────────────── */
const ham      = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

ham.addEventListener('click', () => {
  ham.classList.toggle('open');
  navLinks.classList.toggle('open');
});

/* Close mobile menu when a nav link is tapped */
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    ham.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

/* ── Page detection ────────────────────────────────────────────── */
/*
 * Project pages carry  data-page="project"  on <body>.
 * Index page has no such attribute.
 * This lets us switch between two nav-highlight strategies:
 *   - project page  → "Projects" is always active (static)
 *   - index page    → scroll spy determines the active link
 */

const isProjectPage = document.body.dataset.page === 'project';
const navItems      = Array.from(document.querySelectorAll('.nav-links li'));

/* Helper: set one <li> as active, clear all others */
function setActive(targetLi) {
  navItems.forEach(li => li.classList.remove('active'));
  if (targetLi) targetLi.classList.add('active');
}

/* ── Project page: highlight "Projects" statically ────────────── */
if (isProjectPage) {
  const projectsLi = navItems.find(li =>
    li.querySelector('a')?.getAttribute('href')?.includes('#projects') ||
    li.querySelector('a')?.textContent.trim() === 'Projects'
  );
  setActive(projectsLi);
}

/* ── Index page: scroll spy ────────────────────────────────────── */
if (!isProjectPage) {

  const sections     = Array.from(document.querySelectorAll('section[id]'));
  const headerHeight = document.getElementById('site-header').offsetHeight;

  /* Map section id → nav <li> */
  const sectionNavMap = {};
  navItems.forEach(li => {
    const href = li.querySelector('a').getAttribute('href');
    if (href && href.startsWith('#') && href.length > 1) {
      sectionNavMap[href.slice(1)] = li;
    }
  });

  function updateActiveNav() {
    const scrollY  = window.scrollY;
    const offset   = headerHeight + 40;

    let currentId  = sections[0]?.id ?? '';

    sections.forEach(section => {
      if (section.offsetTop - offset <= scrollY) {
        currentId = section.id;
      }
    });

    setActive(sectionNavMap[currentId] ?? null);
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav(); /* run once on load */
}
