document.addEventListener('DOMContentLoaded', () => {
    // === 1. МОБИЛЬНОЕ МЕНЮ (Бургер) ===
    const burger = document.querySelector('#burger');
    const navMenu = document.querySelector('#navMenu');
    const body = document.body;
    const menuLinks = document.querySelectorAll('.header__link, .header__actions .btn');
// == 1.1 Выводит меню с экрана
    burger.addEventListener('click', () => {
        burger.classList.toggle('active');
        navMenu.classList.toggle('active');
        body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });
// === 1.2 Убирает меню с экрана
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


    // === 5. КАРУСЕЛЬ ВІДГУКІВ + АВТОСКРОЛЛ ===
    const track    = document.getElementById('reviewsTrack');
    const prevBtn  = document.getElementById('reviewsPrev');
    const nextBtn  = document.getElementById('reviewsNext');
    const dotsWrap = document.getElementById('reviewsDots');
    const carousel = document.querySelector('.reviews__carousel');

    if (track && prevBtn && nextBtn) {
        const cards   = Array.from(track.children);
        const total   = cards.length;
        let current   = 0;
        let autoTimer = null;
        const INTERVAL = 3500; // пауза между слайдами, мс

        const getVisible = () => {
            if (window.innerWidth <= 580) return 1;
            if (window.innerWidth <= 900) return 2;
            return 3;
        };

        const buildDots = () => {
            dotsWrap.innerHTML = '';
            const max = total - getVisible();
            for (let i = 0; i <= max; i++) {
                const dot = document.createElement('button');
                dot.className = 'reviews__dot' + (i === current ? ' reviews__dot--active' : '');
                dot.setAttribute('aria-label', `Відгук ${i + 1}`);
                dot.addEventListener('click', () => { goTo(i); resetAuto(); });
                dotsWrap.appendChild(dot);
            }
        };

        const updateDots = () => {
            dotsWrap.querySelectorAll('.reviews__dot')
                .forEach((d, i) => d.classList.toggle('reviews__dot--active', i === current));
        };

        const goTo = (index) => {
            const visible  = getVisible();
            const maxIndex = total - visible;
            current = Math.max(0, Math.min(index, maxIndex));
            const cardWidth = cards[0].getBoundingClientRect().width;
            track.style.transform = `translateX(-${current * (cardWidth + 24)}px)`;
            prevBtn.disabled = current === 0;
            nextBtn.disabled = current >= maxIndex;
            updateDots();
        };

        // Автоскролл: дошёл до конца — возвращается в начало
        const startAuto = () => {
            autoTimer = setInterval(() => {
                const maxIndex = total - getVisible();
                goTo(current >= maxIndex ? 0 : current + 1);
            }, INTERVAL);
        };

        const stopAuto  = () => clearInterval(autoTimer);
        const resetAuto = () => { stopAuto(); startAuto(); };

        // Стрелки — сбрасывают таймер чтобы не прыгало сразу после клика
        prevBtn.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
        nextBtn.addEventListener('click', () => { goTo(current + 1); resetAuto(); });

        // Пауза при наведении мыши
        carousel.addEventListener('mouseenter', stopAuto);
        carousel.addEventListener('mouseleave', startAuto);

        // Свайп на тачскринах
        let touchStartX = 0;
        track.addEventListener('touchstart', e => {
            touchStartX = e.touches[0].clientX;
            stopAuto();
        }, { passive: true });
        track.addEventListener('touchend', e => {
            const diff = touchStartX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 50) goTo(current + (diff > 0 ? 1 : -1));
            startAuto();
        });

        window.addEventListener('resize', () => { buildDots(); goTo(0); });

        // Запуск
        buildDots();
        goTo(0);
        startAuto();
    }

});