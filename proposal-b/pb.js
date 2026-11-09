/* ===== STUDIO HOLIDAY — デザイン案B TOPページのモーション =====
 * 共通の基盤（スムーススクロール・カーソル・マーキー等）は pb-core.js（window.PB）。
 * main.js（FVの壁・ドロワー）と site.js（事例カード・フッター・スマホナビ）はそのまま動かし、
 * ここでは TOP 固有の演出だけを組む。
 */
(() => {
  const PB = window.PB;
  if (!PB || !PB.motion) return;
  const { gsap, ScrollTrigger, $, $$ } = PB;

  /* ==========================================================
     ▼ オープニング → ヘッダー登場
     ========================================================== */
  const loader = $('.pb-loader');
  const header = $('.site-header');
  const intro = gsap.timeline({ onComplete: () => loader?.remove() });
  if (loader) {
    const count = $('.pb-loader-count', loader);
    const n = { v: 0 };
    intro
      .from('.pb-loader-catch', { y: 40, opacity: 0, rotation: -4, duration: 0.7, ease: 'back.out(1.8)' })
      .to(n, { v: 100, duration: 1.05, ease: 'power2.inOut', onUpdate: () => { count.textContent = Math.round(n.v); } }, 0)
      .to('.pb-loader-bar i', { scaleX: 1, duration: 1.05, ease: 'power2.inOut' }, 0)
      .to('.pb-loader-ink', { yPercent: -100, duration: 0.95, ease: 'expo.inOut' }, '+=0.1')
      .to('.pb-loader-lime', { yPercent: -100, duration: 0.95, ease: 'expo.inOut' }, '-=0.8')
      .from('.pb-hero-stage', { scale: 1.12, duration: 1.8, ease: 'expo.out', clearProps: 'transform' }, '-=0.75');
  }
  intro.from(header, { y: -120, duration: 1, ease: 'expo.out', clearProps: 'transform' }, loader ? '-=1.5' : 0);

  /* ==========================================================
     ▼ FV: 本編が上に重なってくる間、壁は奥に沈む
     ========================================================== */
  PB.stageSink($('.pb-hero-stage'), $('.pb-sheet'), '#hero');
  PB.bands = $$('.pb-band');

  /* ==========================================================
     ▼ 取引先の一覧からマーキー用の2段を組む（上下で逆向き・ずらした順番）
     ========================================================== */
  const clients = $$('.pb-clients-list li').map((li) => li.textContent.trim());
  const rows = $$('.pb-clients-row .pb-band-track');
  if (clients.length && rows.length === 2) {
    const half = Math.ceil(clients.length / 2);
    const orders = [clients, clients.slice(half).concat(clients.slice(0, half))];
    rows.forEach((row, i) => {
      row.innerHTML = orders[i].map((c) => `<span>${c}</span>`).join('');
    });
    $('.pb-company').classList.add('pb-clients-ready');
  }

  $$('[data-paste]').forEach((el) => PB.paste(el));

  /* ==========================================================
     ▼ ABOUT: 1文字ずつ弾む見出し・マーカー・墨が乗る本文・漂うステッカー
     ========================================================== */
  $$('[data-split]').forEach((el) => PB.popTitle(el));
  PB.inkLines($$('[data-lines] > span'));

  // ABOUTの漂うステッカーは、壁と同じ加工済みの事例ステッカー（microCMS準拠）を当てる。
  // 毎回ランダムに選び、同じ絵柄は重ねない。取得できなければ非表示のまま
  const cmsFloaters = $$('.pb-floater[data-cms-sticker]');
  if (cmsFloaters.length && window.stickerSpritesReady) {
    window.stickerSpritesReady.then((sprites) => {
      const pool = [...(sprites || [])].sort(() => Math.random() - 0.5);
      cmsFloaters.forEach((img, i) => {
        const s = pool[i % (pool.length || 1)];
        if (!s) return;
        img.src = s.url;
        img.classList.add('is-ready');
      });
    });
  }

  $$('.pb-floater').forEach((img) => {
    const sp = Number(img.dataset.speed) || 0.3;
    gsap.fromTo(img, { y: -sp * 260, rotation: -sp * 20 }, {
      y: sp * 260,
      rotation: sp * 20,
      ease: 'none',
      scrollTrigger: { trigger: img.closest('section'), start: 'top bottom', end: 'bottom top', scrub: true },
    });
    gsap.from(img, { scale: 0, duration: 0.9, ease: 'back.out(2)', scrollTrigger: { trigger: img, start: 'top 95%' } });
  });

  /* ==========================================================
     ▼ BUSINESS: カードが積み重なり、奥のカードは沈む。タグはスクロールで揺れる
     ========================================================== */
  const cards = $$('.pb-biz-card');
  const now = $('.pb-biz-now');
  const setCount = (i) => {
    const txt = String(i + 1).padStart(2, '0');
    if (now.textContent === txt) return;
    gsap.timeline()
      .to(now, { yPercent: -60, opacity: 0, duration: 0.18, ease: 'power2.in' })
      .add(() => { now.textContent = txt; })
      .fromTo(now, { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.4, ease: 'back.out(2)' });
  };
  cards.forEach((card, i) => {
    gsap.from(card, {
      y: 160,
      rotation: i % 2 ? -5 : 5,
      opacity: 0,
      duration: 1.1,
      ease: 'expo.out',
      scrollTrigger: { trigger: card, start: 'top 96%' },
    });
    gsap.fromTo($('.pb-biz-visual img', card), { yPercent: -6 }, {
      yPercent: 6,
      ease: 'none',
      scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true },
    });
    const next = cards[i + 1];
    if (next) {
      gsap.to(card, {
        scale: 0.92,
        '--dim': 0.35,
        ease: 'none',
        scrollTrigger: {
          trigger: next,
          start: 'top bottom',
          end: () => `top ${parseFloat(getComputedStyle(next).top) || 120}px`,
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
    }
    if (now) {
      ScrollTrigger.create({
        trigger: card,
        start: 'top 60%',
        onEnter: () => setCount(i),
        onLeaveBack: () => setCount(Math.max(0, i - 1)),
      });
    }
  });

  // ぶら下がりタグ: スクロール速度を力として受け取るバネ
  const tag = $('[data-swing]');
  if (tag) {
    let ang = 0;
    let angV = 0;
    gsap.ticker.add(() => {
      angV += (-ang * 0.06) - angV * 0.08 + PB.velocity * 0.06;
      ang = gsap.utils.clamp(-22, 22, ang + angV);
      tag.style.transform = `rotate(${ang.toFixed(2)}deg)`;
    });
  }

  /* ==========================================================
     ▼ CONTACT: 黒い面がせり上がって広がる
     ========================================================== */
  gsap.fromTo('.pb-contact', { scale: 0.9, borderRadius: 120 }, {
    scale: 1,
    borderRadius: 40,
    ease: 'none',
    scrollTrigger: { trigger: '.pb-contact', start: 'top bottom', end: 'top 35%', scrub: true },
  });
  $$('[data-fade]').forEach((el) => PB.fadeUp(el));
  gsap.from('.pb-btn', { scale: 0.6, opacity: 0, duration: 1, ease: 'elastic.out(1, 0.55)', scrollTrigger: { trigger: '.pb-btn', start: 'top 92%' } });

  /* ==========================================================
     ▼ WORKS: カードは site.js が（ローカル → microCMS の順で）描画する
     ========================================================== */
  PB.cardGrid($('.pb-works-grid'));

  /* ==========================================================
     ▼ MEMBERS: PCは縦スクロールで横へ流す（ピン留め）
     ========================================================== */
  const mm = gsap.matchMedia();
  const track = $('.pb-members-track');
  const meter = $('.pb-members-meter i');
  mm.add('(min-width: 901px)', () => {
    const pin = $('.pb-members-pin');
    const dist = () => Math.max(0, track.scrollWidth - pin.clientWidth);
    const tween = gsap.to(track, {
      x: () => -dist(),
      ease: 'none',
      scrollTrigger: {
        trigger: pin,
        start: 'top top',
        end: () => `+=${dist()}`,
        pin: true,
        scrub: 0.8,
        invalidateOnRefresh: true,
        onUpdate: (self) => { meter.style.transform = `scaleX(${self.progress})`; },
      },
    });
    $$('.pb-member', track).forEach((m, i) => {
      gsap.from($('.pb-member-photo', m), {
        rotation: i % 2 ? 25 : -25,
        scale: 0.55,
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: m, containerAnimation: tween, start: 'left 100%', end: 'left 65%', scrub: true },
      });
      gsap.from($('.pb-member-name', m), {
        y: 40,
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: m, containerAnimation: tween, start: 'left 90%', end: 'left 60%', scrub: true },
      });
    });
    gsap.from('.pb-sticker--members', {
      scale: 1.8, rotation: -30, opacity: 0, duration: 0.9, ease: 'back.out(2.2)',
      scrollTrigger: { trigger: pin, start: 'top 70%' },
    });
  });
  mm.add('(max-width: 900px)', () => {
    const sync = () => {
      const max = track.scrollWidth - track.clientWidth;
      meter.style.transform = `scaleX(${max > 0 ? track.scrollLeft / max : 0})`;
    };
    track.addEventListener('scroll', sync, { passive: true });
    sync();
    return () => track.removeEventListener('scroll', sync);
  });

  /* ==========================================================
     ▼ COMPANY: 罫線が引かれ、項目が順に入る
     ========================================================== */
  $$('[data-rule]').forEach((row, i) => {
    ScrollTrigger.create({
      trigger: row,
      start: 'top 90%',
      once: true,
      onEnter: () => setTimeout(() => row.classList.add('is-in'), (i % 3) * 90),
    });
    gsap.from(row.children, {
      x: -30,
      opacity: 0,
      duration: 0.9,
      stagger: 0.08,
      ease: 'expo.out',
      scrollTrigger: { trigger: row, start: 'top 90%' },
    });
  });
  gsap.from('.pb-clients-row', {
    xPercent: (i) => (i ? 20 : -20),
    opacity: 0,
    duration: 1.2,
    ease: 'expo.out',
    scrollTrigger: { trigger: '.pb-clients-marquee', start: 'top 92%' },
  });

  PB.finish();
})();
