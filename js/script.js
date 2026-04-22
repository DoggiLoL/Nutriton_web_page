document.addEventListener('DOMContentLoaded', () => {
    // === 1. МОБИЛЬНОЕ МЕНЮ (Бургер) ===
    const burger = document.querySelector('#burger');
    const navMenu = document.querySelector('#navMenu');
    const body = document.body;
    const menuLinks = document.querySelectorAll('.header__link, .header__actions .btn');

    burger.addEventListener('click', () => {
        burger.classList.toggle('active');
        navMenu.classList.toggle('active');
        body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });

    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            burger.classList.remove('active');
            navMenu.classList.remove('active');
            body.style.overflow = '';
        });
    });

    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !burger.contains(e.target) && navMenu.classList.contains('active')) {
            burger.classList.remove('active');
            navMenu.classList.remove('active');
            body.style.overflow = '';
        }
    });


    // === 2. ДИНАМИЧЕСКАЯ ШАПКА ===
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('header--scrolled');
        } else {
            header.classList.remove('header--scrolled');
        }
    });


    // === 3. АНИМАЦИЯ ПОЯВЛЕНИЯ ПРИ СКРОЛЛЕ (Scroll Reveal) ===
    // Находим все элементы, которые хотим анимировать
    const animElements = document.querySelectorAll(`
        .about__title, .about__description, .stat-item, 
        .pillar-card, .about__quote, .programs__title, 
        .program-card, .programs__banner, .checklist__item,
        .prices__title, .price-category__header, .price-card, .price-notes
    `);

    // Сразу добавляем им класс скрытия
    animElements.forEach(el => el.classList.add('reveal-hidden'));

    // Настраиваем наблюдатель (Intersection Observer)
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // Элемент начнет появляться, когда 15% его высоты покажется на экране
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-visible');
                // Прекращаем наблюдение после появления, чтобы анимация сработала один раз
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animElements.forEach(el => revealObserver.observe(el));


    // === 4. ПОДСВЕТКА АКТИВНОГО ПУНКТА МЕНЮ ПРИ СКРОЛЛЕ ===
    const sections = document.querySelectorAll('section[id]');
    // Только ссылки меню, без кнопки CTA
    const navLinks = document.querySelectorAll('.header__link');
    
    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (pageYOffset >= (sectionTop - 150)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current) && current !== '') {
                link.classList.add('active');
            }
        });
    });
});