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
        .prices__title, .price-category__header, .price-card, .price-notes,
        .programs__photo, .prices__strip, .reviews__header,
        .faq__header, .faq__photo
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
        const isEn = document.documentElement.lang === 'en';
        const dotLabel = i => isEn ? `Review ${i}` : `Відгук ${i}`;

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
                dot.setAttribute('aria-label', dotLabel(i + 1));
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



    // === 6. АККОРДЕОН FAQ ===
    document.querySelectorAll('.faq__question').forEach(btn => {
        btn.addEventListener('click', () => {
            const item   = btn.closest('.faq__item');
            const answer = item.querySelector('.faq__answer');
            const isOpen = item.classList.contains('is-open');

            // Закрываем все открытые
            document.querySelectorAll('.faq__item.is-open').forEach(el => {
                el.classList.remove('is-open');
                el.querySelector('.faq__answer').classList.remove('is-open');
                el.querySelector('.faq__question').setAttribute('aria-expanded', 'false');
            });

            // Открываем кликнутый (если он не был открыт)
            if (!isOpen) {
                item.classList.add('is-open');
                answer.classList.add('is-open');
                btn.setAttribute('aria-expanded', 'true');
            }
        });
    });


    // Если в системе отключены анимации — счётчик не запускаем
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


    // === 7. СЧЁТЧИК ЦИФР (15+) ===
    // Анимируются только числовые значения, "PSY" / "КПТ" не трогаем
    const counters = Array.from(document.querySelectorAll('.stat-item__num'))
        .filter(el => /^\d+/.test(el.textContent.trim()));

    if (!reduceMotion && counters.length) {
        const DURATION = 1500; // мс

        const runCounter = (el) => {
            const [, num, suffix] = el.textContent.trim().match(/^(\d+)(.*)$/);
            const target = parseInt(num, 10);
            const start = performance.now();

            const tick = (now) => {
                const progress = Math.min((now - start) / DURATION, 1);
                const eased = 1 - Math.pow(1 - progress, 3); // замедление к концу
                el.textContent = Math.round(target * eased) + suffix;
                if (progress < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        };

        const counterObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    runCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.6 });

        counters.forEach(el => counterObserver.observe(el));
    }


    // === 8. ПАДАЮЩИЕ ЛИСТИКИ НА ПЕРВОМ ЭКРАНЕ ===
    // Прозрачный холст на фоне hero — за текстом и фото
    const hero = document.querySelector('.hero');

    if (!reduceMotion && hero) {
        const canvas = document.createElement('canvas');
        canvas.className = 'leaves';
        canvas.setAttribute('aria-hidden', 'true');
        hero.prepend(canvas);

        const ctx = canvas.getContext('2d');
        const COLORS = ['#00723c', '#2e8b57', '#6aa84f', '#9bc26b'];
        let width = 0;
        let height = 0;
        let leaves = [];

        const random = (min, max) => min + Math.random() * (max - min);

        const createLeaf = (startAnywhere) => ({
            x: random(0, width),
            y: startAnywhere ? random(-height * 0.1, height) : random(-60, -20),
            size: random(8, 15),             // половина длины листа, px
            speed: random(0.35, 0.8),        // скорость падения, px за кадр
            sway: random(0.4, 1.2),          // размах покачивания вбок
            swayPhase: random(0, Math.PI * 2),
            swaySpeed: random(0.008, 0.018),
            rotation: random(0, Math.PI * 2),
            spin: random(-0.012, 0.012),
            flip: random(0, Math.PI * 2),    // переворот листа "в 3D"
            flipSpeed: random(0.015, 0.035),
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            alpha: random(0.3, 0.55),
        });

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            width = hero.clientWidth;
            height = hero.clientHeight;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            // На телефоне листиков меньше — чтобы не мешали тексту
            const count = width <= 768 ? 9 : 16;
            while (leaves.length < count) leaves.push(createLeaf(true));
            leaves.length = count;
        };

        const drawLeaf = (leaf) => {
            const s = leaf.size;
            ctx.save();
            ctx.translate(leaf.x, leaf.y);
            ctx.rotate(leaf.rotation);
            // Сужение = лист поворачивается ребром; не даём стать совсем плоским "чёрточкой"
            const f = Math.cos(leaf.flip);
            ctx.scale(f >= 0 ? Math.max(f, 0.3) : Math.min(f, -0.3), 1);
            ctx.globalAlpha = leaf.alpha;

            // Форма листа: две дуги от кончика к черешку
            ctx.fillStyle = leaf.color;
            ctx.beginPath();
            ctx.moveTo(0, -s);
            ctx.quadraticCurveTo(s * 0.85, -s * 0.15, 0, s);
            ctx.quadraticCurveTo(-s * 0.85, -s * 0.15, 0, -s);
            ctx.fill();

            // Прожилка по центру
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(0, -s * 0.8);
            ctx.lineTo(0, s * 1.15);
            ctx.stroke();

            ctx.restore();
        };

        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            leaves.forEach((leaf, i) => {
                leaf.swayPhase += leaf.swaySpeed;
                leaf.y += leaf.speed;
                leaf.x += Math.sin(leaf.swayPhase) * leaf.sway;
                leaf.rotation += leaf.spin;
                leaf.flip += leaf.flipSpeed;

                // Улетел за нижний край или вбок — начинаем сверху заново
                if (leaf.y > height + 30 || leaf.x < -40 || leaf.x > width + 40) {
                    leaves[i] = createLeaf(false);
                }
                drawLeaf(leaf);
            });

            if (heroVisible) requestAnimationFrame(animate);
        };

        // Когда первый экран прокручен — останавливаем анимацию, вернулись — запускаем
        let heroVisible = false;
        new IntersectionObserver(([entry]) => {
            const wasVisible = heroVisible;
            heroVisible = entry.isIntersecting;
            if (heroVisible && !wasVisible) requestAnimationFrame(animate);
        }).observe(hero);

        // Высота hero может меняться (шрифты, поворот телефона) — подгоняем холст
        new ResizeObserver(resize).observe(hero);
        resize();
    }


});