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
(function () {
    var isRoot = location.pathname === '/' || location.pathname === '/index.html';
    var PATHS = { uk: '/ua/', en: '/en/' };

    try {
        if (/bot|crawl|spider|slurp|google|lighthouse|headless/i.test(navigator.userAgent)) return;
        if (!isRoot && document.referrer.indexOf(location.origin) === 0) return;

        var current = isRoot ? null : document.documentElement.lang === 'en' ? 'en' : 'uk';
        var wanted = null;
        try { wanted = localStorage.getItem('lang'); } catch (e) {}

        if (!PATHS[wanted]) {
            var langs = navigator.languages && navigator.languages.length
                ? navigator.languages
                : navigator.language ? [navigator.language] : [];

            if (!langs.length) {
                // Браузер не сообщил язык: на версии оставляем как есть, с главной — на украинскую
                if (!isRoot) return;
                wanted = 'uk';
            } else {
                var tz = '';
                try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
                wanted = /^Europe\/(Kyiv|Kiev|Zaporozhye|Uzhgorod|Simferopol)$/.test(tz) ? 'uk' : 'en';

                for (var i = 0; i < langs.length; i++) {
                    if (/^(uk|ru)(-|$)/i.test(langs[i])) { wanted = 'uk'; break; }
                }
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
