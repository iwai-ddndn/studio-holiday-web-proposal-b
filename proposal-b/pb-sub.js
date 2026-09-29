/* ===== STUDIO HOLIDAY — デザイン案B 下層ページのモーション =====
 * 共通の基盤は pb-core.js（window.PB）。ページのDOMは本番と同じなので、
 * 存在する部品を見つけて演出を付ける（無い部品は何もしない）。
 * ここで差し込む要素（散らしたステッカー・マーキー等）はすべて飾り（aria-hidden）。
 */
(() => {
  const PB = window.PB;
  if (!PB || !PB.motion) return;
  const { gsap, ScrollTrigger, $, $$ } = PB;
  const SITE_ROOT = new URL('../', document.currentScript.src);
  const asset = (p) => new URL(p, SITE_ROOT).href;
  const inFirstView = (el) => el.getBoundingClientRect().top < innerHeight * 0.85;
  const AFTER_CURTAIN = 0.55; // 入場の幕が抜けるのを待つ秒数

  /* site.js のタイプライター（1文字ずつの span 分割）を元の文に戻す。
   * 案Bでは同じ要素を別の演出で動かすため */
  const untype = (el) => {
    if (!el || !el.dataset.tw) return el;
    const visual = el.querySelector(':scope > [aria-hidden="true"]');
    if (!visual) return el;
    el.querySelector(':scope > .sr-only')?.remove();
    el.replaceChildren(...visual.childNodes);
    el.querySelectorAll('.tw-ch').forEach((s) => s.replaceWith(s.textContent));
    el.normalize();
    el.classList.remove('rv-type');
    delete el.dataset.tw;
    return el;
  };

  // 画面内にあれば幕が抜けたあとすぐ、画面外ならスクロールで
  const popTitle = (el) => el && PB.popTitle(el, inFirstView(el) ? { immediate: true, delay: AFTER_CURTAIN + 0.2 } : {});
  const paste = (el) => el && PB.paste(el, inFirstView(el) ? { immediate: true, delay: AFTER_CURTAIN } : {});

  const header = $('.site-header');
  gsap.from(header, { y: -120, duration: 1, delay: AFTER_CURTAIN, ease: 'expo.out', clearProps: 'transform' });

  /* ==========================================================
     ▼ ヒーロー（.page-hero）: ステッカー見出し + 散らしたステッカー。スクロールで奥に沈む
     ========================================================== */
  const hero = $('.page-hero');
  if (hero) {
    PB.stageSink($('.pb-hero-stage'), $('.pb-sheet'), hero, { dim: 0, scale: 0.94 });
    const head = $('.sticker-head', hero);
    paste(head);

    const POOL = [
      'assets/stickers/holiday-kun-thinking.png', 'assets/stickers/works/holiday-cola.png',
      'assets/stickers/works/monster-illustration.png', 'assets/stickers/works/ebisun.png',
      'assets/stickers/works/goichi-character.png', 'assets/stickers/works/itomaki-ac-adapter.png',
      'assets/stickers/works/ichiban-no-oshigoto.png', 'assets/stickers/yappy.png',
      'assets/stickers/works-pondelion.png',
    ];
    const SLOTS = [
      { x: 5, y: 16, w: 150, r: -10, s: -0.4 }, { x: 80, y: 12, w: 130, r: 12, s: 0.3 },
      { x: 9, y: 64, w: 120, r: 8, s: 0.5 }, { x: 82, y: 60, w: 150, r: -6, s: -0.3 },
    ];
    // ページごとに違う組み合わせ（URLから決める）
    let seed = [...location.pathname].reduce((a, c) => a + c.charCodeAt(0), 0);
    const floaters = SLOTS.map((slot) => {
      const img = document.createElement('img');
      img.className = 'pb-floater';
      img.src = asset(POOL[seed++ % POOL.length]);
      img.alt = '';
      img.setAttribute('aria-hidden', 'true');
      const w = innerWidth < 900 ? slot.w * 0.55 : slot.w;
      img.style.cssText = `--x:${slot.x}%;--y:${slot.y}%;--w:${w}px;--r:${slot.r}deg`;
      img.dataset.speed = slot.s;
      hero.appendChild(img);
      return img;
    });
    gsap.from(floaters, { scale: 0, rotation: -40, duration: 0.9, delay: AFTER_CURTAIN + 0.35, stagger: 0.08, ease: 'back.out(2)' });
    floaters.forEach((img) => {
      const sp = Number(img.dataset.speed);
      gsap.to(img, { y: sp * 220, ease: 'none', scrollTrigger: { trigger: '.pb-sheet', start: 'top bottom', end: 'top top', scrub: true } });
    });
    // PCはマウスで奥行きが出るように少しずつずらす
    if (PB.finePointer) {
      const movers = floaters.map((img) => ({
        k: Number(img.dataset.speed) * 60,
        x: gsap.quickTo(img, 'x', { duration: 0.9, ease: 'power3.out' }),
      }));
      const hx = head && gsap.quickTo(head, 'x', { duration: 1.1, ease: 'power3.out' });
      hero.addEventListener('pointermove', (e) => {
        const r = hero.getBoundingClientRect();
        const dx = (e.clientX - r.left) / r.width - 0.5;
        movers.forEach((m) => m.x(dx * m.k));
        hx?.(dx * -16);
      });
    }

    const caption = document.createElement('p');
    caption.className = 'pb-hero-caption';
    caption.setAttribute('aria-hidden', 'true');
    caption.innerHTML = `<i></i>${(head?.querySelector('img')?.alt || '').replace(/&/g, '&amp;')}`;
    const cue = document.createElement('span');
    cue.className = 'pb-hero-scroll';
    cue.setAttribute('aria-hidden', 'true');
    cue.textContent = 'SCROLL';
    hero.append(caption, cue);
    gsap.from([caption, cue], { opacity: 0, y: 20, duration: 0.8, delay: AFTER_CURTAIN + 0.6, stagger: 0.1, ease: 'expo.out' });
  }

  /* ==========================================================
     ▼ 導入（.page-intro）: 英見出しが弾み、リードにマーカー、本文は1行ずつ墨が乗る
     ========================================================== */
  const intro = $('.page-intro');
  if (intro) {
    popTitle(untype($('h1', intro)));
    const lead = untype($('.page-lead', intro));
    if (lead) {
      const mark = document.createElement('span');
      mark.className = 'pb-mark';
      while (lead.firstChild) mark.appendChild(lead.firstChild);
      lead.appendChild(mark);
      popTitle(lead);
    }
    $$('p:not(.page-lead)', intro).forEach((p) => {
      untype(p);
      if (!p.querySelector('br')) { PB.fadeUp(p); return; }
      // <br> ごとに1行の span に分ける
      const lines = [[]];
      [...p.childNodes].forEach((n) => (n.nodeName === 'BR' ? lines.push([]) : lines[lines.length - 1].push(n)));
      p.replaceChildren(...lines.filter((l) => l.some((n) => n.textContent.trim())).map((nodes) => {
        const s = document.createElement('span');
        s.className = 'pb-line';
        s.append(...nodes);
        return s;
      }));
      PB.inkLines($$('.pb-line', p));
    });
  }

  /* ==========================================================
     ▼ DESIGN PROCESS
     ========================================================== */
  $$('.dp-label').forEach((label) => {
    untype(label);
    const words = label.textContent.trim().split(/\s+/);
    const text = document.createElement('span');
    text.innerHTML = words.length > 1 ? `<span class="pb-outline">${words[0]}</span> ${words.slice(1).join(' ')}` : words[0];
    label.replaceChildren(text);
    const tl = PB.popTitle(text);
    tl.fromTo(label, { '--rule': 0 }, { '--rule': 1, duration: 1.1, ease: 'expo.inOut' }, 0.2);
  });
  $$('.approach-item').forEach((item) => {
    const media = $('.approach-media', item);
    if (media) {
      gsap.fromTo(media, { clipPath: 'inset(100% 0% 0% 0% round 28px)' }, {
        clipPath: 'inset(0% 0% 0% 0% round 28px)',
        duration: 1.4,
        ease: 'expo.out',
        scrollTrigger: { trigger: media, start: 'top 85%' },
      });
      gsap.fromTo(media, { backgroundPosition: '50% 0%' }, {
        backgroundPosition: '50% 100%',
        ease: 'none',
        scrollTrigger: { trigger: media, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    }
    const body = $('.approach-body', item);
    if (body) {
      [...body.children].forEach(untype);
      PB.fadeUp([...body.children], { trigger: body, start: 'top 85%', stagger: 0.12 });
    }
  });
  const services = $('.service-list');
  if (services) {
    const cards = $$('.service-card', services);
    cards.forEach((c) => $$('h2', c).forEach(untype));
    cards.forEach((card, i) => {
      gsap.from(card, {
        y: 140,
        rotation: i % 2 ? -6 : 6,
        opacity: 0,
        duration: 1.1,
        ease: 'expo.out',
        scrollTrigger: { trigger: card, start: 'top 94%' },
      });
      gsap.from($$('li', card), {
        x: -24, opacity: 0, duration: 0.8, stagger: 0.06, ease: 'expo.out',
        scrollTrigger: { trigger: card, start: 'top 80%' },
      });
      PB.tilt(card, 6);
    });
  }

  /* ==========================================================
     ▼ FOOD DESIGN / COMMUNITY & SPACE: 写真リンクがスクロールで横いっぱいに広がる
     ========================================================== */
  $$('.biz-link').forEach((link) => {
    gsap.fromTo(link, { clipPath: 'inset(0% 16% 0% 16% round 36px)' }, {
      clipPath: 'inset(0% 0% 0% 0% round 36px)',
      ease: 'none',
      scrollTrigger: { trigger: link, start: 'top 95%', end: 'top 30%', scrub: true },
    });
    gsap.fromTo($('img', link), { scale: 1.3 }, {
      scale: 1,
      ease: 'none',
      scrollTrigger: { trigger: link, start: 'top bottom', end: 'bottom top', scrub: true },
    });
    gsap.from($('span', link), { y: 60, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: link, start: 'top 60%' } });
  });

  /* ==========================================================
     ▼ CONTACT: 黒い面がせり上がり、背面に大きな文字が流れる
     ========================================================== */
  $$('.page-contact, .sec-contact').forEach((sec) => {
    const mq = document.createElement('div');
    mq.className = 'pb-contact-marquee';
    mq.dataset.marquee = '1';
    mq.setAttribute('aria-hidden', 'true');
    mq.innerHTML = '<div class="pb-band-track"><span>CONTACT</span><b>✦</b><span>CONTACT</span><b>✦</b></div>';
    sec.prepend(mq);
    gsap.fromTo(sec, { scale: 0.9, borderRadius: 120 }, {
      scale: 1,
      borderRadius: 40,
      ease: 'none',
      scrollTrigger: { trigger: sec, start: 'top bottom', end: 'top 35%', scrub: true },
    });
    paste($('.sticker-head', sec));
    const lead = untype($('.contact-lead', sec));
    if (lead) PB.fadeUp(lead);
    const btn = $('.btn-lime', sec);
    if (btn) {
      btn.dataset.magnet = '';
      gsap.from(btn, { scale: 0.6, opacity: 0, duration: 1, ease: 'elastic.out(1, 0.55)', scrollTrigger: { trigger: btn, start: 'top 92%' } });
    }
  });

  /* ==========================================================
     ▼ WORKS 一覧: 件数のカウントアップ・カード
     ========================================================== */
  const count = untype($('.works-count'));
  if (count) {
    const m = count.textContent.trim().match(/^(\d+)\s*(.*)$/);
    if (m) {
      count.setAttribute('aria-label', count.textContent.trim());
      count.innerHTML = `<span class="pb-count-num" aria-hidden="true">0</span><span class="pb-count-unit" aria-hidden="true">${m[2]}</span>`;
      const num = $('.pb-count-num', count);
      const n = { v: 0 };
      gsap.to(n, {
        v: Number(m[1]),
        duration: 1.6,
        ease: 'power3.out',
        onUpdate: () => { num.textContent = Math.round(n.v); },
        scrollTrigger: { trigger: count, start: 'top 90%' },
      });
    }
  }
  $$('.works-board .works-grid, .sec-works-other .works-grid').forEach((grid) => {
    PB.cardGrid(grid, { parallax: document.body.classList.contains('works-page') });
  });

  /* ==========================================================
     ▼ 詳細ページ（事例・メンバー）
     ========================================================== */
  const wd = $('.wd');
  if (wd) {
    const wdHero = $('.wd-hero', wd);
    const visual = $('.wd-visual', wd);
    const h1 = untype($('.wd-main h1', wd));
    // ヒーローの背面にタイトルを大きく流す
    if (wdHero && h1) {
      const mq = document.createElement('div');
      mq.className = 'pb-hero-title';
      mq.dataset.marquee = '1';
      mq.setAttribute('aria-hidden', 'true');
      const t = h1.textContent.trim().replace(/&/g, '&amp;').replace(/</g, '&lt;');
      mq.innerHTML = `<div class="pb-band-track"><span>${t}</span><b>✦</b></div>`;
      wdHero.prepend(mq);
    }
    if (visual) {
      paste(visual);
      gsap.to(visual, { yPercent: -14, ease: 'none', scrollTrigger: { trigger: wd, start: 'top top', end: '+=600', scrub: true } });
    }
    popTitle(h1);
    const tags = $$('.wd-tags li', wd);
    if (tags.length) {
      gsap.from(tags, {
        scale: 0, rotation: () => gsap.utils.random(-20, 20), duration: 0.7, stagger: 0.06, ease: 'back.out(2.4)',
        ...(inFirstView(tags[0]) ? { delay: AFTER_CURTAIN + 0.7 } : { scrollTrigger: { trigger: tags[0], start: 'top 90%' } }),
      });
    }
    const lead = untype($('.wd-lead', wd));
    if (lead) PB.fadeUp(lead);
    const name = untype($('.md-name-ja', wd));
    if (name) PB.fadeUp(name);

    // 本文: 見出しにライムのマーカー、画像は下から開く
    $$('.work-body h2, .work-body h3', wd).forEach((h) => {
      const hl = document.createElement('span');
      hl.className = 'pb-hl';
      while (h.firstChild) hl.appendChild(h.firstChild);
      h.appendChild(hl);
      gsap.fromTo(hl, { '--hl': '0%' }, { '--hl': '100%', duration: 0.9, ease: 'expo.inOut', scrollTrigger: { trigger: h, start: 'top 80%' } });
    });
    $$('.work-body img', wd).forEach((img) => {
      gsap.fromTo(img, { clipPath: 'inset(18% 0% 0% 0% round 20px)', scale: 1.06, opacity: 0 }, {
        clipPath: 'inset(0% 0% 0% 0% round 20px)', scale: 1, opacity: 1, duration: 1.3, ease: 'expo.out',
        scrollTrigger: { trigger: img, start: 'top 88%' },
      });
    });
    $$('.work-credit dl > div', wd).forEach((row, i) => {
      gsap.from(row, { x: -30, opacity: 0, duration: 0.8, delay: i * 0.05, ease: 'expo.out', scrollTrigger: { trigger: row, start: 'top 92%' } });
    });
  }
  $$('.wd-related > h2').forEach((h) => popTitle(untype(h)));

  /* ==========================================================
     ▼ メンバー（一覧・他のメンバー）: くるっと回って貼られる
     ========================================================== */
  const members = $$('.members-grid .member');
  if (members.length) {
    gsap.set(members, { opacity: 0, scale: 0.4, rotation: () => gsap.utils.random(-25, 25) });
    ScrollTrigger.batch(members, {
      start: 'top 92%',
      once: true,
      onEnter: (batch) => gsap.to(batch, {
        opacity: 1, scale: 1, rotation: 0, duration: 0.9, stagger: 0.08, ease: 'back.out(1.7)',
        delay: inFirstView(batch[0]) ? AFTER_CURTAIN : 0,
      }),
    });
  }

  /* ==========================================================
     ▼ 事例詳細（work.html・旧URL互換）: 中身は site.js があとから描く
     ========================================================== */
  const detail = $('[data-work-detail]');
  if (detail) new MutationObserver(() => PB.softRefresh()).observe(detail, { childList: true });

  $$('.btn-lime').forEach(PB.fillFromPointer);
  PB.finish();
})();
