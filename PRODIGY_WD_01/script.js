const header = document.querySelector('.site-header');
const navLinks = [...document.querySelectorAll('.nav-link')];
const sections = [...document.querySelectorAll('main section[id]')];
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-links');

function updateHeader() {
  header.classList.toggle('scrolled', window.scrollY > 24);
}

function updateActiveLink() {
  const currentSection = sections.reduce((active, section) => {
    const distance = Math.abs(section.getBoundingClientRect().top - 120);
    return distance < active.distance ? { id: section.id, distance } : active;
  }, { id: 'home', distance: Infinity });

  navLinks.forEach((link) => {
    link.classList.toggle('active', link.getAttribute('href') === `#${currentSection.id}`);
  });
}

navLinks.forEach((link) => {
  link.addEventListener('mouseenter', () => link.classList.add('is-hovered'));
  link.addEventListener('mouseleave', () => link.classList.remove('is-hovered'));
  link.addEventListener('click', () => {
    navMenu.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  });
});

menuToggle.addEventListener('click', () => {
  const isOpen = navMenu.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});

window.addEventListener('scroll', () => {
  updateHeader();
  updateActiveLink();
}, { passive: true });

updateHeader();
updateActiveLink();
