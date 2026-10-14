// === АНАЛИТИКА: Google Analytics 4 + Microsoft Clarity ===
// Загружаются ТОЛЬКО после согласия посетителя на cookies (требование ЕС / GDPR).
// Отказ → ничего не грузится и не отслеживается. Выбор хранится в браузере,
// изменить его можно ссылкой «Налаштування cookies / Cookie settings» в подвале.
//
// Пока ID не вписаны — модуль ничего не делает и баннер не показывается.
(() => {
    const GA_ID = 'G-4BQ4K2ZT7H';     // Google Analytics 4: идентификатор потока, вид G-XXXXXXXXXX
    const CLARITY_ID = 'yw4ga1uu4s';  // Microsoft Clarity: ID проекта, 10 символов

    if (!GA_ID && !CLARITY_ID) return;

    const KEY = 'cookie-consent'; // 'granted' | 'denied'
    const isEn = document.documentElement.lang === 'en';
    const TEXT = isEn
        ? {
            text: 'We use cookies for anonymous visit statistics (Google Analytics, Microsoft Clarity) to make the site better. You can change your choice anytime via “Cookie settings” at the bottom of the page.',
            accept: 'Accept',
            decline: 'Decline',
            label: 'Cookie consent',
            more: 'Privacy Policy',
            moreUrl: '/en/privacy/',
        }
        : {
            text: 'Ми використовуємо cookies для анонімної статистики відвідувань (Google Analytics, Microsoft Clarity), щоб робити сайт кращим. Змінити вибір можна будь-коли - «Налаштування cookies» внизу сторінки.',
            accept: 'Прийняти',
            decline: 'Відхилити',
            label: 'Згода на cookies',
            more: 'Політика конфіденційності',
            moreUrl: '/ua/privacy/',
        };

    const readConsent = () => {
        try { return localStorage.getItem(KEY); } catch (e) { return null; }
    };
    const saveConsent = (value) => {
        try { localStorage.setItem(KEY, value); } catch (e) {}
    };

    // --- Загрузка счётчиков (один раз) ---
    let loaded = false;
    const loadAnalytics = () => {
        if (loaded) return;
        loaded = true;

        if (GA_ID) {
            const s = document.createElement('script');
            s.async = true;
            s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
            document.head.appendChild(s);
            window.dataLayer = window.dataLayer || [];
            // Только обычная function: Google ждёт в dataLayer именно объект arguments,
            // а у стрелочной функции его нет — статистика молча перестанет работать
            window.gtag = function () { window.dataLayer.push(arguments); };
            window.gtag('js', new Date());
            window.gtag('config', GA_ID);
        }

        if (CLARITY_ID) {
            // Официальный код установки Clarity (оставлен как есть)
            (function (c, l, a, r, i, t, y) {
                c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
                t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
                y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
            })(window, document, 'clarity', 'script', CLARITY_ID);
        }
    };

    // --- Отправка событий (только если человек согласился) ---
    const track = (name, params = {}) => {
        if (!loaded) return;
        window.gtag?.('event', name, params);
        window.clarity?.('event', name);
    };

    // Из какого блока страницы нажали: hero, prices, footer...
    const placeOf = (el) => {
        const block = el.closest('section, header, footer');
        if (!block) return 'other';
        return block.id || block.classList[0] || block.tagName.toLowerCase();
    };

    // --- Какие действия считаем ---
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href]');
        if (link) {
            const href = link.getAttribute('href');
            const place = placeOf(link);

            if (href.includes('t.me/')) {
                // Главное действие сайта — переход в Telegram для записи
                track('generate_lead', { method: 'telegram', location: place });
            } else if (href.startsWith('tel:')) {
                track('contact_click', { method: 'phone', location: place });
            } else if (href.startsWith('mailto:')) {
                track('contact_click', { method: 'email', location: place });
            } else if (href.includes('instagram.com')) {
                track('contact_click', { method: 'instagram', location: place });
            } else if (href.includes('facebook.com')) {
                track('contact_click', { method: 'facebook', location: place });
            } else if (href.includes('public-offer')) {
                track('offer_open', { location: place });
            }
            return;
        }

        const currencyBtn = e.target.closest('.currency-switch__btn');
        if (currencyBtn) {
            track('currency_change', { currency: currencyBtn.dataset.currency });
        }
    });

    // --- Баннер согласия ---
    let banner = null;

    const closeBanner = () => {
        banner?.remove();
        banner = null;
    };

    const showBanner = () => {
        if (banner) return;
        banner = document.createElement('div');
        banner.className = 'cookie-banner';
        banner.setAttribute('role', 'dialog');
        banner.setAttribute('aria-label', TEXT.label);
        banner.innerHTML = `
            <p class="cookie-banner__text"></p>
            <div class="cookie-banner__actions">
                <button type="button" class="btn btn--outline cookie-banner__btn" data-consent="denied"></button>
                <button type="button" class="btn btn--filled cookie-banner__btn" data-consent="granted"></button>
            </div>`;
        const text = banner.querySelector('.cookie-banner__text');
        text.textContent = `${TEXT.text} `;
        const more = document.createElement('a');
        more.href = TEXT.moreUrl;
        more.textContent = TEXT.more;
        text.appendChild(more);
        banner.querySelector('[data-consent="denied"]').textContent = TEXT.decline;
        banner.querySelector('[data-consent="granted"]').textContent = TEXT.accept;

        banner.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-consent]');
            if (!btn) return;
            const value = btn.dataset.consent;
            const wasGranted = readConsent() === 'granted';
            saveConsent(value);
            closeBanner();

            if (value === 'granted') {
                loadAnalytics();
            } else if (wasGranted) {
                // Отозвал согласие: счётчики уже на странице — перезагрузка их выгрузит
                location.reload();
            }
        });

        document.body.appendChild(banner);
    };

    // Ссылка в подвале — снова показать баннер
    document.querySelectorAll('[data-cookie-settings]').forEach(btn => {
        btn.hidden = false;
        btn.addEventListener('click', showBanner);
    });

    const consent = readConsent();
    if (consent === 'granted') {
        loadAnalytics();
    } else if (consent !== 'denied') {
        showBanner();
    }
})();
