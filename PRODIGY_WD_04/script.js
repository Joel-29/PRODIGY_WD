const header = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');
const navLinks = [...document.querySelectorAll('.nav-link')];
const sections = [...document.querySelectorAll('main section[id]')];

function updateNavigation() {
  header.classList.toggle('scrolled', window.scrollY > 24);
  const current = sections.reduce((closest, section) => {
    const distance = Math.abs(section.getBoundingClientRect().top - 160);
    return distance < closest.distance ? { id: section.id, distance } : closest;
  }, { id: 'home', distance: Infinity });
  navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${current.id}`));
}

menuToggle.addEventListener('click', () => {
  const isOpen = navMenu.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});

navLinks.forEach((link) => link.addEventListener('click', () => {
  navMenu.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
}));

window.addEventListener('scroll', updateNavigation, { passive: true });
updateNavigation();
