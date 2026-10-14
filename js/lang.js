// === АВТОВЫБОР ЯЗЫКА САЙТА ===
// Подключается в <head> всех страниц ДО стилей — чтобы сработать раньше, чем страница покажется.
//
// Порядок выбора:
//   1. язык, выбранный кнопкой UA/EN (сохраняется в script.js, раздел 1.3)
//   2. язык браузера: uk / ru → украинская версия
//   3. часовой пояс Украины → украинская (украинцы с телефоном на английском)
//   4. иначе → английская
//
// Главная "/" — страница выбора языка: людей всегда отправляет на /ua/ или /en/.
// На /ua/ и /en/ срабатывает только при заходе извне (переходы внутри сайта не трогаем).
// Поисковых роботов не трогает нигде — они видят все версии.
(() => {
    const isRoot = location.pathname === '/' || location.pathname === '/index.html';
    const PATHS = { uk: '/ua/', en: '/en/' };

    try {
        if (/bot|crawl|spider|slurp|google|lighthouse|headless/i.test(navigator.userAgent)) return;
        if (!isRoot && document.referrer.startsWith(location.origin)) return;

        const current = isRoot ? null : document.documentElement.lang === 'en' ? 'en' : 'uk';
        let wanted = null;
        try { wanted = localStorage.getItem('lang'); } catch (e) {}

        if (!PATHS[wanted]) {
            const langs = navigator.languages?.length
                ? navigator.languages
                : navigator.language ? [navigator.language] : [];

            if (!langs.length) {
                // Браузер не сообщил язык: на версии оставляем как есть, с главной — на украинскую
                if (!isRoot) return;
                wanted = 'uk';
            } else {
                let tz = '';
                try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
                const isUkraineTz = /^Europe\/(Kyiv|Kiev|Zaporozhye|Uzhgorod|Simferopol)$/.test(tz);
                const isUkOrRu = langs.some(l => /^(uk|ru)(-|$)/i.test(l));
                wanted = isUkOrRu || isUkraineTz ? 'uk' : 'en';
            }
        }

        if (wanted !== current) {
            location.replace(PATHS[wanted] + location.search + location.hash);
        }
    } catch (e) {
        // Что-то пошло не так — с главной всё равно уводим на украинскую версию
        if (isRoot) location.replace(PATHS.uk);
    }
})();
