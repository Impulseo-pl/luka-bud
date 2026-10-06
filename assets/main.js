// LUKA-BUD - interakcje układu ze strony-wzoru (06.10.2026): menu w pigułce, nagłówek
// chowany przy przewijaniu, karuzele ze strzałkami, opinie po jednej, filtr realizacji.
// Każdy blok w try/catch: awaria jednego efektu nie zatrzymuje reszty strony.
document.documentElement.classList.add('js');

(function () {
  try {
    var top = document.querySelector('.top');
    if (!top) return;
    var last = window.scrollY || 0, tick = false;
    function stan() {
      var y = window.scrollY || 0;
      top.classList.toggle('is-scrolled', y > 30);
      if (!document.documentElement.classList.contains('menu-open')) {
        top.classList.toggle('is-hidden', y > 260 && y > last + 4);
        if (y < last - 4 || y < 260) top.classList.remove('is-hidden');
      }
      last = y; tick = false;
    }
    window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(stan); } }, { passive: true });
    stan();
  } catch (e) {}
})();

(function () {
  try {
    var btn = document.querySelector('.menu-pill');
    var menu = document.getElementById('menu');
    if (!btn || !menu) return;
    var html = document.documentElement;
    function ustaw(otwarte) {
      html.classList.toggle('menu-open', otwarte);
      btn.setAttribute('aria-expanded', otwarte ? 'true' : 'false');
      btn.setAttribute('aria-label', otwarte ? 'Zamknij menu' : 'Otwórz menu');
      menu.setAttribute('aria-hidden', otwarte ? 'false' : 'true');
    }
    btn.addEventListener('click', function () { ustaw(!html.classList.contains('menu-open')); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') ustaw(false); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) ustaw(false); });
  } catch (e) {}
})();

// odsłanianie przy przewijaniu: odsłania wszystko, co jest w oknie LUB już nad nim
// (skok na dół strony, kotwica, zrzut całej strony) + bezpiecznik po 2,5 s
(function () {
  try {
    var els = Array.prototype.slice.call(document.querySelectorAll('.rv'));
    if (!els.length) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.documentElement.classList.add('rv-on');
    function sprawdz() {
      var granica = window.innerHeight * 0.94;
      els = els.filter(function (el) {
        if (el.getBoundingClientRect().top < granica) { el.classList.add('in'); return false; }
        return true;
      });
      if (!els.length) window.removeEventListener('scroll', naScroll);
    }
    // bez requestAnimationFrame: w karcie w tle klatki stoją, a odsłonić trzeba i tak
    function naScroll() { sprawdz(); }
    window.addEventListener('scroll', naScroll, { passive: true });
    window.addEventListener('resize', naScroll);
    window.addEventListener('load', sprawdz);
    sprawdz();
    setTimeout(sprawdz, 2500);
  } catch (e) { document.documentElement.classList.remove('rv-on'); }
})();

// pas z nieruchomym zdjęciem: warstwa `fixed` włączana dopiero w pobliżu sekcji
// (oszczędza malowanie i nie leży niewidocznie nad pierwszym ekranem)
(function () {
  try {
    var pasy = document.querySelectorAll('.stopklatka');
    if (!pasy.length) return;
    function stan() {
      var h = window.innerHeight;
      pasy.forEach(function (p) {
        var r = p.getBoundingClientRect();
        p.classList.toggle('vis', r.top < h * 1.6 && r.bottom > -h * 0.6);
      });
    }
    window.addEventListener('scroll', stan, { passive: true });
    window.addEventListener('resize', stan);
    stan();
  } catch (e) {
    document.querySelectorAll('.stopklatka').forEach(function (p) { p.classList.add('vis'); });
  }
})();

// karuzele: strzałki przewijają o jedną kartę, pasek pokazuje, gdzie jesteś
(function () {
  try {
    document.querySelectorAll('[data-car]').forEach(function (car) {
      var track = car.querySelector('[data-track]');
      if (!track) return;
      var prev = car.querySelector('[data-prev]'), next = car.querySelector('[data-next]');
      var bar = car.querySelector('.car-bar i');
      function krok() {
        var k = track.children[0];
        if (!k) return track.clientWidth;
        var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
        return k.getBoundingClientRect().width + gap;
      }
      function odswiez() {
        var max = track.scrollWidth - track.clientWidth;
        var x = track.scrollLeft;
        if (prev) prev.disabled = x <= 2;
        if (next) next.disabled = x >= max - 2;
        if (bar) {
          var udzial = max > 0 ? track.clientWidth / track.scrollWidth : 1;
          bar.style.width = (udzial * 100) + '%';
          var pos = max > 0 ? x / max : 0;
          bar.style.transform = 'translateX(' + (pos * (1 / udzial - 1) * 100) + '%)';
        }
      }
      if (prev) prev.addEventListener('click', function () { track.scrollBy({ left: -krok(), behavior: 'smooth' }); });
      if (next) next.addEventListener('click', function () { track.scrollBy({ left: krok(), behavior: 'smooth' }); });
      track.addEventListener('scroll', function () { requestAnimationFrame(odswiez); }, { passive: true });
      window.addEventListener('resize', odswiez);
      odswiez();
    });
  } catch (e) {}
})();

// opinie: jedna na raz, strzałki przełączają
(function () {
  try {
    var box = document.querySelector('[data-opinie]');
    if (!box) return;
    var karty = box.querySelectorAll('.op-card');
    if (karty.length < 2) { if (karty[0]) karty[0].classList.add('is-on'); return; }
    var i = 0;
    function pokaz(n) {
      i = (n + karty.length) % karty.length;
      karty.forEach(function (k, j) { k.classList.toggle('is-on', j === i); });
    }
    var root = box.closest('section') || document;
    var p = root.querySelector('[data-op-prev]'), n = root.querySelector('[data-op-next]');
    if (p) p.addEventListener('click', function () { pokaz(i - 1); });
    if (n) n.addEventListener('click', function () { pokaz(i + 1); });
    pokaz(0);
  } catch (e) {
    document.querySelectorAll('.op-card').forEach(function (k) { k.classList.add('is-on'); });
  }
})();

// realizacje: filtr po rodzaju wnętrza
(function () {
  try {
    var chips = document.querySelectorAll('.chip[data-f]');
    if (!chips.length) return;
    var el = document.querySelectorAll('[data-kat]');
    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        var f = c.getAttribute('data-f');
        chips.forEach(function (x) { x.classList.toggle('is-on', x === c); x.setAttribute('aria-pressed', x === c ? 'true' : 'false'); });
        el.forEach(function (it) {
          var ok = f === 'all' || (' ' + it.getAttribute('data-kat') + ' ').indexOf(' ' + f + ' ') > -1;
          it.classList.toggle('is-hid', !ok);
        });
      });
    });
  } catch (e) {}
})();

// dolny pasek na telefonie chowa się, gdy na ekranie jest stopka albo pas z telefonem
(function () {
  try {
    var pasek = document.querySelector('.sticky-call');
    if (!pasek || !('IntersectionObserver' in window)) return;
    var cele = document.querySelectorAll('footer, .cta');
    if (!cele.length) return;
    var widoczne = 0;
    var io = new IntersectionObserver(function (wpisy) {
      wpisy.forEach(function (w) { widoczne += w.isIntersecting ? 1 : -1; });
      if (widoczne < 0) widoczne = 0;
      pasek.classList.toggle('schowany', widoczne > 0);
    }, { threshold: 0.01 });
    cele.forEach(function (el) { io.observe(el); });
  } catch (e) {}
})();

// LICZNIK WAŻNOŚCI DEMA (K. 09.08: pełne odliczanie dni/godzin/minut/sekund).
// Element wstrzykuje multipage TYLKO w dema. Nie wita klienta przy wejściu - wjeżdża
// po zejściu z pierwszego ekranu i chowa się po powrocie na górę.
(function () {
  var el = document.querySelector('.demo-wazne');
  if (!el || !el.getAttribute('data-do')) return;
  var koniec = new Date(el.getAttribute('data-do') + 'T23:59:59');
  if (isNaN(koniec)) return;
  var txt = el.querySelector('.dw-txt') || el;
  var dwa = function (n) { return (n < 10 ? '0' : '') + n; };

  var cykl = parseInt(el.getAttribute('data-cykl') || '0', 10);   // dni; 0 = brak wznowienia
  function tyka() {
    var teraz = new Date(), ms = koniec - teraz;
    // po wygaśnięciu licznik rusza od nowa (K. 10.08) - dema i tak zostają, a odliczanie
    // ma dawać klientowi realne poczucie, że sprawa ma termin.
    while (ms <= 0 && cykl > 0) {
      koniec = new Date(koniec.getTime() + cykl * 86400000);
      ms = koniec - teraz;
    }
    if (ms <= 0) { txt.innerHTML = 'Wersja pokazowa wygasła'; el.classList.add('is-koniec'); return false; }
    var s = Math.floor(ms / 1000), d = Math.floor(s / 86400);
    var g = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), sek = s % 60;
    var zegar = dwa(g) + ':' + dwa(m) + ':' + dwa(sek);
    txt.innerHTML = d > 0
      ? 'Wersja pokazowa · <b>' + d + ' dni</b> <span class="dw-zeg">' + zegar + '</span>'
      : 'Wersja pokazowa · <b class="dw-pilne">' + zegar + '</b>';
    el.classList.toggle('is-pilne', d === 0);
    return true;
  }
  if (tyka() !== false) setInterval(tyka, 1000);
  el.hidden = false;

  var tick = false;
  function stan() {
    el.classList.toggle('is-on', (window.scrollY || 0) > window.innerHeight * 0.55);
    tick = false;
  }
  window.addEventListener('scroll', function () {
    if (tick) return; tick = true; requestAnimationFrame(stan);
  }, { passive: true });
  stan();
})();


/* === licznik otwarć demo (buy-signal) v3 — geo po stronie serwera === */
(function(){try{if(String(location.protocol).indexOf('http')!==0)return;try{if(/[?&#]team=1/.test(location.search+location.hash)){localStorage.setItem('nb_team','1');}}catch(e){}try{if(localStorage.getItem('nb_team')==='1')return;}catch(e){}if(/crm-newbeginning|crm\.impulseo\.pl/.test(document.referrer||''))return;try{if(navigator.webdriver)return;}catch(e){}try{if(/^https?:\/\/(kris20032|impulseo-pl)\.github\.io\/?$/i.test(document.referrer||''))return;}catch(e){}if(sessionStorage.getItem('_dv'))return;sessionStorage.setItem('_dv','1');var seg=(location.pathname.split('/').filter(Boolean)[0])||'';var base=location.origin+(seg?('/'+seg):'');var ua='';try{ua=(navigator.userAgent||'').slice(0,300);}catch(e){}var EP='https://zngfubfinbojfgaxdrbf.supabase.co/functions/v1/demo-view';try{fetch(EP,{method:'POST',keepalive:true,headers:{'Content-Type':'text/plain'},body:JSON.stringify({demo_url:base,page:location.pathname,referrer:(document.referrer||null),user_agent:(ua||null)})}).catch(function(){});}catch(e){}}catch(e){}})();
