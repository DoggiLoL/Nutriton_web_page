// === АНАЛИТИКА: Google Analytics 4 + Microsoft Clarity ===
// Загружаются ТОЛЬКО после согласия посетителя на cookies (требование ЕС / GDPR).
// Отказ → ничего не грузится и не отслеживается. Выбор хранится в браузере,
// изменить его можно ссылкой «Налаштування cookies / Cookie settings» в подвале.
//
// Пока ID не вписаны — модуль ничего не делает и баннер не показывается.
(function () {
    var GA_ID = 'G-4BQ4K2ZT7H';     // Google Analytics 4: идентификатор потока, вид G-XXXXXXXXXX
    var CLARITY_ID = 'yw4ga1uu4s';  // Microsoft Clarity: ID проекта, 10 символов

    if (!GA_ID && !CLARITY_ID) return;

    var KEY = 'cookie-consent'; // 'granted' | 'denied'
    var isEn = document.documentElement.lang === 'en';
    var TEXT = isEn
        ? {
            text: 'We use cookies for anonymous visit statistics (Google Analytics, Microsoft Clarity) to make the site better. You can change your choice anytime via “Cookie settings” at the bottom of the page.',
            accept: 'Accept',
            decline: 'Decline',
            label: 'Cookie consent',
        }
        : {
            text: 'Ми використовуємо cookies для анонімної статистики відвідувань (Google Analytics, Microsoft Clarity), щоб робити сайт кращим. Змінити вибір можна будь-коли — «Налаштування cookies» внизу сторінки.',
            accept: 'Прийняти',
            decline: 'Відхилити',
            label: 'Згода на cookies',
        };

    var readConsent = function () {
        try { return localStorage.getItem(KEY); } catch (e) { return null; }
    };
    var saveConsent = function (value) {
        try { localStorage.setItem(KEY, value); } catch (e) {}
    };

    // --- Загрузка счётчиков (один раз) ---
    var loaded = false;
    var loadAnalytics = function () {
        if (loaded) return;
        loaded = true;

        if (GA_ID) {
            var s = document.createElement('script');
            s.async = true;
            s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
            document.head.appendChild(s);
            window.dataLayer = window.dataLayer || [];
            window.gtag = function () { window.dataLayer.push(arguments); };
            window.gtag('js', new Date());
            window.gtag('config', GA_ID);
        }

        if (CLARITY_ID) {
            // Официальный код установки Clarity
            (function (c, l, a, r, i, t, y) {
                c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
                t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
                y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
            })(window, document, 'clarity', 'script', CLARITY_ID);
        }
    };

    // --- Отправка событий (только если человек согласился) ---
    var track = function (name, params) {
        if (!loaded) return;
        if (window.gtag) window.gtag('event', name, params || {});
        if (window.clarity) window.clarity('event', name);
    };

    // Из какого блока страницы нажали: hero, prices, footer...
    var placeOf = function (el) {
        var block = el.closest('section, header, footer');
        if (!block) return 'other';
        if (block.id) return block.id;
        return block.classList[0] || block.tagName.toLowerCase();
    };

    // --- Какие действия считаем ---
    document.addEventListener('click', function (e) {
        var link = e.target.closest('a[href]');
        if (link) {
            var href = link.getAttribute('href');
            var place = placeOf(link);

            if (href.indexOf('t.me/') !== -1) {
                // Главное действие сайта — переход в Telegram для записи
                track('generate_lead', { method: 'telegram', location: place });
            } else if (href.indexOf('tel:') === 0) {
                track('contact_click', { method: 'phone', location: place });
            } else if (href.indexOf('mailto:') === 0) {
                track('contact_click', { method: 'email', location: place });
            } else if (href.indexOf('instagram.com') !== -1) {
                track('contact_click', { method: 'instagram', location: place });
            } else if (href.indexOf('facebook.com') !== -1) {
                track('contact_click', { method: 'facebook', location: place });
            } else if (href.indexOf('public-offer') !== -1) {
                track('offer_open', { location: place });
            }
            return;
        }

        var currencyBtn = e.target.closest('.currency-switch__btn');
        if (currencyBtn) {
            track('currency_change', { currency: currencyBtn.dataset.currency });
        }
    });

    // --- Баннер согласия ---
    var banner = null;

    var closeBanner = function () {
        if (banner) {
            banner.remove();
            banner = null;
        }
    };

    var showBanner = function () {
        if (banner) return;
        banner = document.createElement('div');
        banner.className = 'cookie-banner';
        banner.setAttribute('role', 'dialog');
        banner.setAttribute('aria-label', TEXT.label);
        banner.innerHTML =
            '<p class="cookie-banner__text"></p>' +
            '<div class="cookie-banner__actions">' +
            '<button type="button" class="btn btn--outline cookie-banner__btn" data-consent="denied"></button>' +
            '<button type="button" class="btn btn--filled cookie-banner__btn" data-consent="granted"></button>' +
            '</div>';
        banner.querySelector('.cookie-banner__text').textContent = TEXT.text;
        banner.querySelector('[data-consent="denied"]').textContent = TEXT.decline;
        banner.querySelector('[data-consent="granted"]').textContent = TEXT.accept;

        banner.addEventListener('click', function (e) {
            var btn = e.target.closest('[data-consent]');
            if (!btn) return;
            var value = btn.dataset.consent;
            var wasGranted = readConsent() === 'granted';
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
    var settings = document.querySelectorAll('[data-cookie-settings]');
    settings.forEach(function (btn) {
        btn.hidden = false;
        btn.addEventListener('click', showBanner);
    });

    var consent = readConsent();
    if (consent === 'granted') {
        loadAnalytics();
    } else if (consent !== 'denied') {
        showBanner();
    }
})();
