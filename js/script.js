document.addEventListener('DOMContentLoaded', () => {
    const burger = document.querySelector('#burger');
    const navMenu = document.querySelector('#navMenu');
    const body = document.body;

    // Переключение меню
    burger.addEventListener('click', () => {
        burger.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        // Блокируем скролл, когда меню открыто
        if (navMenu.classList.contains('active')) {
            body.style.overflow = 'hidden';
        } else {
            body.style.overflow = '';
        }
    });

    // Закрытие при клике на ссылки
    const menuLinks = document.querySelectorAll('.header__link, .header__actions .btn');
    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            burger.classList.remove('active');
            navMenu.classList.remove('active');
            body.style.overflow = '';
        });
    });

    // Закрытие при клике вне меню
    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !burger.contains(e.target) && navMenu.classList.contains('active')) {
            burger.classList.remove('active');
            navMenu.classList.remove('active');
            body.style.overflow = '';
        }
    });
});