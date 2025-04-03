document.addEventListener('DOMContentLoaded', function() {
  const navHeader = document.querySelector('.nav-header');
  const navItems = document.querySelectorAll('.nav-item');
  
  // Scroll effect
  window.addEventListener('scroll', function() {
    if (window.scrollY > 50) {
      navHeader.classList.add('scrolled');
    } else {
      navHeader.classList.remove('scrolled');
    }
  });
  
  // Active link highlighting
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  navItems.forEach(item => {
    const itemPath = item.getAttribute('href').split('/').pop();
    if (currentPath.includes(itemPath)) {
      item.classList.add('active');
    }
  });
});
