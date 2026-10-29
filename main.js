(() => {
  const WA = '5511940032547';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof gsap !== 'undefined';
  const wa = text => `https://wa.me/${WA}?text=${encodeURIComponent(text)}`;
  const brDate = iso => iso ? iso.split('-').reverse().join('/') : '';

  /* ---------- horário de São Paulo ---------- */
  const spNow = () => new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
  // minutos desde 00h do dia; fechamento depois da meia-noite passa de 1440
  const HOURS = { 0: null, 1: [690, 1410], 2: [690, 1500], 3: [690, 1500], 4: [690, 1620], 5: [690, 1620], 6: [780, 1560] };
  const fmt = m => { m %= 1440; const h = Math.floor(m / 60), mm = m % 60; return `${String(h).padStart(2, '0')}h${mm ? String(mm).padStart(2, '0') : ''}`; };

  function openState() {
    const now = spNow(), d = now.getDay(), min = now.getHours() * 60 + now.getMinutes();
    const today = HOURS[d], prev = HOURS[(d + 6) % 7];
    if (prev && min + 1440 < prev[1]) return { open: true, until: prev[1] };
    if (today && min >= today[0] && min < today[1]) return { open: true, until: today[1] };
    for (let i = 0; i < 7; i++) {
      const nd = (d + i) % 7, h = HOURS[nd];
      if (!h) continue;
      if (i === 0 && min >= h[0]) continue;
      const label = i === 0 ? 'hoje' : i === 1 ? 'amanhã' : ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'][nd];
      return { open: false, next: `${label} às ${fmt(h[0])}` };
    }
  }

  /* ---------- a semana ---------- */
  const WEEK = {
    1: { name: 'Santa Segunda', hours: '15h às 23h30', theme: 'yellow', desc: 'Happy hour com som ambiente pra começar a semana do jeito certo. Promoção do Santinha das 15h às 20h e balde liberado a noite toda.' },
    2: { name: 'Sua noite 100% Sertaneja', hours: '15h à 01h', theme: 'light', desc: 'Duas bandas de sertanejo ao vivo e DJ nos intervalos. E toda terça tem Heineken 600ml no compre 3, leve 4.' },
    3: { name: 'Resenha Original', hours: '15h à 01h', theme: 'dark', desc: 'Sertanejo ao vivo, aquele som bom pra conversar e também dançar de mansinho. DJ Valtinho fecha a noite.' },
    4: { name: 'Quinta Pode!', hours: '15h às 03h', theme: 'yellow', desc: 'Duas bandas de sertanejo e uma de samba ao vivo, e DJ tocando as melhores da atualidade. Música ao vivo até as 2h.' },
    5: { name: 'Santa Sexta', hours: '15h às 03h', theme: 'light', desc: 'Sertanejo e pagode ao vivo até as 2h da manhã, DJ nos intervalos. A sexta mais disputada da Vila Olímpia.' },
    6: { name: 'Feijoada do Santinha', hours: '13h às 02h', theme: 'dark', desc: 'São 4 bandas ao vivo com samba, pagode e sertanejo, DJ nos intervalos e a feijoada mais tradicional da Vila Olímpia. Open chopp das 13h às 17h.' }
  };
  // line-up publicado no Instagram (@barsantajuliaoficial, agenda da semana)
  const LINEUP = {
    '2026-10-27': [['19h', 'Bruno e Marcio', 'Sertanejo'], ['22h', 'Acústico do PH', 'Sertanejo'], ['00h', 'DJ Valtinho', 'DJ']],
    '2026-10-28': [['19h', 'Roger Bonna', 'Sertanejo'], ['23h', 'Nando e Ricky', 'Sertanejo'], ['01h', 'DJ Valtinho', 'DJ']],
    '2026-10-29': [['19h', 'Marianne Belotto', 'Sertanejo'], ['21h30', 'Felipe Ossani', 'Sertanejo'], ['00h', "Grupo D'ferença", 'Pagode'], ['02h', 'DJ Valtinho', 'DJ']],
    '2026-10-30': [['19h', 'Renata Tardony', 'Sertanejo'], ['22h', 'Felipe Grani', 'Sertanejo'], ['00h30', 'Fabinho FB', 'Pagode'], ['03h', 'DJ Valtinho', 'DJ']],
    '2026-10-31': [['14h45', 'Kauê Mello', 'Samba'], ['17h30', 'Renan Moraes', 'Pagode'], ['20h30', 'Jeffinho', 'Pagode'], ['23h', 'Nick Maia', 'Sertanejo'], ['01h', 'DJ Valtinho', 'DJ']]
  };
  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  function dateFor(day) { // dia `day` da semana corrente (domingo mostra a semana que começa amanhã)
    const now = spNow(); now.setHours(12, 0, 0, 0);
    const d = now.getDay();
    const monday = new Date(now); monday.setDate(now.getDate() - (d === 0 ? -1 : d - 1));
    const out = new Date(monday); out.setDate(monday.getDate() + day - 1);
    return out;
  }
  const lineupHTML = list => list.map(([t, a, g]) => `<li><span class="t">${t}</span><span class="a">${a}<span class="g">${g}</span></span></li>`).join('');

  const week = $('[data-week]');
  function showDay(day, animate = true) {
    const info = WEEK[day], date = dateFor(day), key = iso(date), list = LINEUP[key];
    $$('.week-tabs button').forEach(b => b.setAttribute('aria-selected', String(+b.dataset.day === day)));
    const apply = () => {
      week.dataset.theme = info.theme;
      $('[data-w-date]').textContent = `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}`;
      $('[data-w-name]').textContent = info.name;
      $('[data-w-hours]').textContent = info.hours;
      $('[data-w-desc]').textContent = info.desc;
      $('[data-w-ltitle]').textContent = list ? 'Line-up desta semana' : 'Line-up';
      $('[data-w-lineup]').innerHTML = list ? lineupHTML(list)
        : `<li class="lineup-empty" style="display:block">O line-up da semana sai toda segunda no <a href="https://instagram.com/barsantajuliaoficial" target="_blank" rel="noopener">@barsantajuliaoficial</a>.</li>`;
      const cta = $('[data-w-cta]');
      cta.href = wa(`Oi! Quero reservar uma mesa pra ${info.name} (${brDate(key)}).`);
      cta.target = '_blank';
    };
    if (!animate || !hasGsap || reduce) return apply();
    const targets = ['.week-date', '.week-name', '.week-hours', '.week-desc', '.week-poster .btn', '.week-lineup'];
    gsap.to(targets, { y: -20, opacity: 0, duration: .22, stagger: .03, ease: 'power2.in', onComplete: () => {
      apply();
      gsap.fromTo(targets, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: .6, stagger: .05, ease: 'expo.out' });
      gsap.fromTo('.lineup li', { x: 30, opacity: 0 }, { x: 0, opacity: 1, duration: .6, stagger: .06, delay: .15, ease: 'expo.out' });
    } });
  }
  const todayDow = spNow().getDay();
  $$('.week-tabs button').forEach(b => {
    if (+b.dataset.day === todayDow) b.classList.add('today');
    b.addEventListener('click', () => showDay(+b.dataset.day));
  });
  showDay(todayDow === 0 ? 1 : todayDow, false);

  /* ---------- status ao vivo ---------- */
  function paintStatus() {
    const s = openState();
    document.body.classList.toggle('is-open', s.open);
    $('[data-status]').textContent = s.open ? `Aberto agora · até ${fmt(s.until)}` : `Fechado agora · abre ${s.next}`;
    $('[data-status-title]').textContent = s.open ? 'Aberto agora' : 'Fechado agora';
    $('[data-status-sub]').textContent = s.open ? `Hoje até ${fmt(s.until)}. Bora?` : `Abre ${s.next}.`;
    $$('.hours tr').forEach(tr => tr.classList.toggle('today', +tr.dataset.rowDay === spNow().getDay()));
  }
  paintStatus(); setInterval(paintStatus, 60000);

  // card "hoje no Santinha" no hero
  if (WEEK[todayDow]) {
    const list = LINEUP[iso(spNow())];
    const box = $('[data-tonight]');
    $('[data-tonight-name]').textContent = WEEK[todayDow].name;
    $('[data-tonight-list]').innerHTML = list
      ? list.map(([t, a]) => `<li><b>${t}</b>${a}</li>`).join('')
      : `<li><b>${WEEK[todayDow].hours.split(' ')[0]}</b>${WEEK[todayDow].hours}</li>`;
    box.hidden = false;
  }

  /* ---------- nav e menu ---------- */
  const nav = $('.nav');
  let lastY = 0;
  const onScroll = y => {
    nav.classList.toggle('scrolled', y > 40);
    nav.classList.toggle('hide', y > lastY && y > 600 && !document.body.classList.contains('menu-open'));
    lastY = y;
  };
  const burger = $('.nav-burger');
  const toggleMenu = open => {
    document.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    $('.menu').setAttribute('aria-hidden', String(!open));
  };
  burger.addEventListener('click', () => toggleMenu(!document.body.classList.contains('menu-open')));
  $$('.menu a').forEach(a => a.addEventListener('click', () => toggleMenu(false)));

  /* ---------- formulários → WhatsApp ---------- */
  $('[data-reserve]').addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(e.target);
    window.open(wa(`Oi! Sou ${f.get('nome')} e quero fazer uma reserva.\nData: ${brDate(f.get('data'))}\nPessoas: ${f.get('pessoas')}\nOcasião: ${f.get('ocasiao')}`), '_blank');
  });
  $('[data-corp]').addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(e.target);
    window.open(wa(`Oi! Sou ${f.get('nome')}, da ${f.get('empresa')}, e quero um orçamento de evento corporativo no mezanino.\nTipo: ${f.get('tipo')}\nData: ${brDate(f.get('data')) || 'a definir'}\nPessoas: ${f.get('pessoas') || 'a definir'}`), '_blank');
  });
  $$('[data-occasion]').forEach(a => a.addEventListener('click', () => {
    const r = $(`.chips input[value="${a.dataset.occasion}"]`); if (r) r.checked = true;
  }));

  /* ---------- aniversário ---------- */
  const guests = $('[data-guests]'), bdayDate = $('[data-bday-date]');
  const PRIZES = [[30, 'uma garrafa de whisky Chivas 12 anos'], [20, 'uma garrafa de Licor Don Luiz'], [10, 'uma garrafa de Gin ou Vodka Santa Julia']];
  function paintBday() {
    const n = +guests.value, prize = PRIZES.find(([min]) => n >= min);
    guests.style.setProperty('--fill', `${(n - 1) / 39 * 100}%`);
    $('[data-guests-out]').textContent = n;
    $$('.tiers li').forEach(li => {
      li.classList.toggle('on', n >= +li.dataset.tier);
      li.classList.toggle('best', !!prize && +li.dataset.tier === prize[0]);
    });
    const next = [10, 20, 30].find(t => t > n);
    $('[data-prize]').textContent = prize
      ? `Com ${n} convidados você ganha ${prize[1]}.${next ? ` Mais ${next - n} e sobe de nível.` : ' É o topo, Santinha.'}`
      : `Faltam ${10 - n} convidados pra ganhar a primeira garrafa.`;
    $('[data-bday-cta]').href = wa(`Oi! Quero reservar meu aniversário no Santa Julia.\nData: ${brDate(bdayDate.value) || 'a definir'}\nConvidados: ${n}${prize ? `\nQuero garantir ${prize[1]}!` : ''}`);
  }
  guests.addEventListener('input', paintBday); bdayDate.addEventListener('change', paintBday); paintBday();
  const todayIso = iso(spNow());
  $$('input[type="date"]').forEach(i => i.min = todayIso);

  /* ---------- tour ---------- */
  const tour = $('[data-tour]'), chapters = $$('[data-chapters] li'), sound = $('[data-sound]');
  const times = chapters.map(li => +li.dataset.t);
  tour.addEventListener('timeupdate', () => {
    const t = tour.currentTime, dur = tour.duration || 66;
    $('[data-progress]').style.width = `${t / dur * 100}%`;
    let idx = 0; times.forEach((s, i) => { if (t >= s) idx = i; });
    chapters.forEach((li, i) => {
      li.classList.toggle('on', i === idx);
      const end = times[i + 1] ?? dur;
      li.style.setProperty('--p', i === idx ? `${(t - times[i]) / (end - times[i]) * 100}%` : '0%');
    });
  });
  chapters.forEach(li => li.addEventListener('click', () => { tour.currentTime = +li.dataset.t; tour.play().catch(() => {}); }));
  sound.addEventListener('click', () => {
    tour.muted = !tour.muted; sound.classList.toggle('on', !tour.muted);
    sound.setAttribute('aria-label', tour.muted ? 'Ligar o som' : 'Desligar o som');
    tour.play().catch(() => {});
  });
  const vio = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) e.target.play().catch(() => {}); else e.target.pause();
  }), { threshold: .35 });
  vio.observe(tour);
  $$('.panel video, .portal video').forEach(v => vio.observe(v));

  $('[data-year]').textContent = spNow().getFullYear();

  /* ---------- história: palavras acendendo ---------- */
  const lead = $('[data-words]');
  const GOLD = /^(2010|completo|madrugada,?|Vila|Olímpia\.?)$/;
  lead.innerHTML = lead.textContent.trim().split(/\s+/).map(w => `<span class="w${GOLD.test(w) ? ' gold' : ''}">${w}</span>`).join(' ');
  const words = $$('.w', lead);

  const hero = $('[data-hero]');

  /* ---------- sem GSAP: tudo visível ---------- */
  const loader = $('.loader');
  if (!hasGsap || reduce) {
    words.forEach(w => w.classList.add('on'));
    loader.remove(); hero.classList.add('intro-done');
    addEventListener('scroll', () => onScroll(scrollY), { passive: true });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  let lenis;
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: .1 });
    lenis.on('scroll', ScrollTrigger.update);
    lenis.on('scroll', ({ scroll }) => onScroll(scroll));
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const id = a.getAttribute('href'); if (id.length < 2) return;
      const el = $(id); if (!el) return;
      e.preventDefault(); lenis.scrollTo(el, { offset: id === '#topo' ? 0 : -20 });
    }));
  } else addEventListener('scroll', () => onScroll(scrollY), { passive: true });

  /* ---------- preloader + entrada ---------- */
  document.body.classList.add('is-loading');
  lenis && lenis.stop();
  const heroVid = $('.hero-col video');
  const bar = $('.loader-bar span');
  const ready = Promise.all([
    heroVid.readyState >= 3 ? Promise.resolve() : new Promise(r => { heroVid.addEventListener('canplay', r, { once: true }); heroVid.addEventListener('error', r, { once: true }); }),
    document.fonts ? document.fonts.ready : Promise.resolve(),
    new Promise(r => setTimeout(r, 900))
  ]);
  gsap.to(bar, { width: '80%', duration: 1.2, ease: 'power2.out' });
  const timeout = new Promise(r => setTimeout(r, 4000));
  Promise.race([ready, timeout]).then(() => {
    const tl = gsap.timeline({ onComplete: () => { loader.remove(); hero.classList.add('intro-done'); document.body.classList.remove('is-loading'); lenis && lenis.start(); } });
    tl.to(bar, { width: '100%', duration: .3 })
      .to('.loader-in', { scale: .9, opacity: 0, duration: .5, ease: 'power3.in' })
      .to(loader, { clipPath: 'inset(0 0 100% 0)', duration: .9, ease: 'expo.inOut' }, '-=.1')
      .from('.hero-col', { clipPath: 'inset(50% 0 50% 0)', duration: 1.3, stagger: .12, ease: 'expo.inOut' }, '-=.6')
      .from('.hero-col video', { scale: 1.4, duration: 2, stagger: .12, ease: 'expo.out' }, '<')
      .from('.hero-title .line > span', { yPercent: 110, duration: 1.2, stagger: .12, ease: 'expo.out' }, '-=1.9')
      .from('.sticker', { scale: 0, rotate: -120, duration: 1.2, ease: 'back.out(1.6)' }, '-=1.1')
      .from(['.hero-eyebrow', '.hero-sub', '.hero-ctas', '.hero-tonight', '.hero-foot'], { y: 30, opacity: 0, duration: 1, stagger: .08, ease: 'expo.out' }, '-=1.4')
      .from('.nav', { yPercent: -100, opacity: 0, duration: .8, ease: 'expo.out' }, '-=1');
  });

  // colunas do hero sobem em velocidades diferentes
  $$('.hero-col').forEach((c, i) => gsap.to(c, { yPercent: [-14, 8, -22][i], ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } }));
  gsap.to('.hero-content', { yPercent: -30, opacity: 0, ease: 'none', scrollTrigger: { trigger: hero, start: '35% top', end: 'bottom top', scrub: true } });
  gsap.to('.sticker', { rotate: 200, yPercent: 80, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });

  // fitas balançam com a velocidade da rolagem
  const tapes = $$('.tape');
  ScrollTrigger.create({ trigger: '.tapes', start: 'top bottom', end: 'bottom top', onUpdate: s => {
    const v = gsap.utils.clamp(-6, 6, s.getVelocity() / -400);
    gsap.to(tapes[0], { rotate: -4 + v, duration: .5, overwrite: true });
    gsap.to(tapes[1], { rotate: 3.5 - v, duration: .5, overwrite: true });
  } });

  // portal: a câmera atravessa o D de "Desde"
  const mask = $('.portal-mask'), first = $('.portal-mask span');
  const origin = () => {
    const r = document.createRange(); r.setStart(first.firstChild, 0); r.setEnd(first.firstChild, 1);
    const g = r.getBoundingClientRect(), m = mask.getBoundingClientRect();
    return `${g.left - m.left + g.width * .2}px ${g.top - m.top + g.height * .5}px`;
  };
  gsap.timeline({ scrollTrigger: { trigger: '.portal', start: 'top top', end: 'bottom bottom', scrub: .6, invalidateOnRefresh: true } })
    .fromTo(mask, { scale: 1, transformOrigin: origin }, { scale: 70, ease: 'power3.in', duration: 1 })
    .to(mask, { opacity: 0, duration: .15 }, '>-.05');

  // títulos
  $$('.h2').forEach(h => gsap.from(h, { y: 60, opacity: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: h, start: 'top 88%' } }));

  // fotos que abrem de baixo pra cima, com parallax interno
  $$('.reveal-clip').forEach(el => {
    gsap.fromTo(el, { clipPath: 'inset(100% 0% 0% 0% round 24px)' }, { clipPath: 'inset(0% 0% 0% 0% round 24px)', duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger: el, start: 'top 82%' } });
    gsap.fromTo($('img', el), { yPercent: -12 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  // palavras da história
  ScrollTrigger.create({
    trigger: lead, start: 'top 80%', end: 'bottom 45%', scrub: true,
    onUpdate: s => { const n = Math.round(s.progress * words.length); words.forEach((w, i) => w.classList.toggle('on', i < n)); }
  });

  // contadores
  $$('[data-count]').forEach(el => {
    const end = +el.dataset.count, suf = el.dataset.suffix || '', from = el.hasAttribute('data-plain') ? 1990 : 0;
    const o = { v: from };
    gsap.to(o, { v: end, duration: 2, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' }, onUpdate: () => { el.textContent = Math.round(o.v) + suf; } });
  });
  gsap.from('.stats li', { y: 40, opacity: 0, stagger: .1, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.stats', start: 'top 88%' } });

  // semana entra
  gsap.from('.week-tabs button', { y: 30, opacity: 0, stagger: .05, duration: .8, ease: 'expo.out', scrollTrigger: { trigger: '.week-tabs', start: 'top 90%' } });

  // painéis empilhados: o de baixo recua quando o próximo cobre
  const panels = $$('.panel');
  panels.forEach((p, i) => {
    gsap.fromTo($('.panel-bg img', p), { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: p, start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.from([$('.panel-title', p), $('.panel-text', p)], { y: 80, opacity: 0, stagger: .1, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: p, start: 'top 60%' } });
    gsap.from($('.panel-inset', p), { y: 140, rotate: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: p, start: 'top 60%' } });
    const next = panels[i + 1];
    if (next) gsap.to($('.panel-in', p), { scale: .9, opacity: .25, ease: 'none', scrollTrigger: { trigger: next, start: 'top bottom', end: 'top top', scrub: true } });
  });
  gsap.from('.xp-big span', { yPercent: 60, opacity: 0, stagger: .12, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.xp-big', start: 'top 85%' } });

  // galeria: fileiras andam em sentidos opostos
  $$('.g-row').forEach(row => {
    const dir = +row.dataset.row;
    gsap.fromTo(row, { x: () => dir > 0 ? 0 : -(row.scrollWidth - innerWidth) }, {
      x: () => dir > 0 ? -(row.scrollWidth - innerWidth) : 0, ease: 'none',
      scrollTrigger: { trigger: '.gallery', start: 'top bottom', end: 'bottom top', scrub: .6, invalidateOnRefresh: true }
    });
  });

  // eventos
  gsap.from('.corp-gallery img', { y: 80, opacity: 0, stagger: .12, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.corp-gallery', start: 'top 85%' } });
  gsap.from('.corp-feats li', { x: -30, opacity: 0, stagger: .08, duration: .9, ease: 'expo.out', scrollTrigger: { trigger: '.corp-feats', start: 'top 85%' } });

  // quadro de promoções acende item a item
  gsap.from('.board li', { opacity: 0, x: -20, stagger: .07, duration: .7, ease: 'power3.out', scrollTrigger: { trigger: '.board', start: 'top 82%' } });
  gsap.fromTo('.promo-bg img', { yPercent: -15 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '.promo', start: 'top bottom', end: 'bottom top', scrub: true } });

  // rodapé
  gsap.from('.foot-big', { yPercent: 40, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.foot', start: 'top 85%' } });

  addEventListener('load', () => ScrollTrigger.refresh());
})();
