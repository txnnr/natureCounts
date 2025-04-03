document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-item').forEach(link => {
        const linkPage = link.getAttribute('href').split('/').pop();
        if (currentPage.includes(linkPage)) {
            link.classList.add('active');
        }
    });
});
