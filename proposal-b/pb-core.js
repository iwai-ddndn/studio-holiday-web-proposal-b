/* ===== デザイン案B: 全ページ共通のモーション基盤 =====
 * スムーススクロール（Lenis）・スクロール速度・ページ遷移の幕・ヘッダーの出し入れ・進捗バー・
 * カーソル・マグネット・マーキー・ステッカーの貼り付け・文字分割 などをまとめ、window.PB として公開する。
 * ページ固有の演出は pb.js（TOP）/ pb-sub.js（下層）が PB を使って組む。
 * GSAP が読めない時・prefers-reduced-motion の時は PB.motion = false で何もしない（素の表示で完結する）。
 */
(() => {
  const html = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  if (!window.gsap || !window.ScrollTrigger || reduce) {
    $('.pb-loader')?.remove();
    $('.pb-curtain')?.remove();
    window.PB = { motion: false, $, $$ };
    return;
  }

  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);
  html.classList.add('pb-motion');

  const PB = { motion: true, gsap, ScrollTrigger, finePointer, $, $$, velocity: 0, scrollDir: 1, lenis: null };
  window.PB = PB;

  /* ---------- スムーススクロールとスクロール速度 ---------- */
  if (window.Lenis) {
    PB.lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true });
    PB.lenis.on('scroll', (e) => {
      PB.velocity = e.velocity;
      if (e.direction) PB.scrollDir = e.direction;
      ScrollTrigger.update();
    });
    gsap.ticker.add((t) => PB.lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    let lastY = scrollY;
    gsap.ticker.add(() => {
      const d = scrollY - lastY;
      lastY = scrollY;
      PB.velocity += (d - PB.velocity) * 0.2;
      if (d) PB.scrollDir = Math.sign(d);
    });
  }

  /* ---------- リンク: ページ内は滑らかに、別ページへは幕を下ろしてから ---------- */
  const curtain = $('.pb-curtain');
  let leaving = false;
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const raw = a.getAttribute('href');
    if (raw.startsWith('#')) {
      if (!PB.lenis) return;
      const target = raw === '#' ? 0 : document.querySelector(raw);
      if (target === null) return;
      e.preventDefault();
      PB.lenis.scrollTo(target, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) });
      return;
    }
    if (!curtain || leaving || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
    const u = new URL(a.href, location.href);
    if (u.origin !== location.origin) return;
    if (u.pathname === location.pathname && u.search === location.search) return; // 同じページ内
    e.preventDefault();
    leaving = true;
    curtain.classList.remove('is-done');
    gsap.fromTo(curtain, { yPercent: 100 }, {
      yPercent: 0,
      duration: 0.6,
      ease: 'expo.inOut',
      onComplete: () => { location.href = u.href; },
    });
  });
  // 入ってきた時: 幕が上に抜ける
  if (curtain && curtain.classList.contains('is-cover')) {
    gsap.fromTo(curtain, { yPercent: 0 }, {
      yPercent: -100,
      duration: 0.95,
      delay: 0.1,
      ease: 'expo.inOut',
      onComplete: () => curtain.classList.add('is-done'),
    });
    curtain.classList.remove('is-cover');
  }
  // 戻るボタン（bfcache）で幕が下りたまま戻ってきた時
  addEventListener('pageshow', (e) => {
    if (!e.persisted || !curtain) return;
    leaving = false;
    gsap.set(curtain, { yPercent: 100 });
    curtain.classList.add('is-done');
  });

  // ドロワーを開いている間は背面のページを止める
  const drawer = $('#workDrawer');
  if (drawer && PB.lenis) {
    new MutationObserver(() => (drawer.hidden ? PB.lenis.start() : PB.lenis.stop()))
      .observe(drawer, { attributes: true, attributeFilter: ['hidden'] });
  }

  /* ---------- ヘッダーの出し入れ・進捗バー ---------- */
  const header = $('.site-header');
  const nav = $('.site-nav');
  const bar = $('.pb-progress i');
  let lastY = scrollY;
  const onScroll = () => {
    const y = scrollY;
    const max = html.scrollHeight - innerHeight;
    if (bar) bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    if (header && !nav?.classList.contains('is-open') && Math.abs(y - lastY) > 4) {
      header.classList.toggle('is-away', y > lastY && y > innerHeight * 0.9);
      lastY = y;
    }
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- ヒーロー: 本文が上に重なってくる間、奥に沈む ---------- */
  // opts.dim … 沈みきった時の暗さ（0で暗くしない） / opts.scale … 沈みきった時の縮尺
  PB.stageSink = (stage, sheet, target = stage.firstElementChild, opts = {}) => {
    if (!stage || !sheet) return;
    const { dim = 0.6, scale = 0.88 } = opts;
    // 開始は「本文シートが最初に見えている位置」から。ヒーローが画面より低いページでも、
    // 読み込み直後（スクロール0）は必ず沈む前の明るい状態から始まる
    const start = () => `top ${Math.min(innerHeight, sheet.getBoundingClientRect().top + scrollY)}px`;
    const tl = gsap.timeline({ scrollTrigger: { trigger: sheet, start, end: 'top top', scrub: true, invalidateOnRefresh: true } })
      .to(target, { scale, borderRadius: 48, ease: 'none' }, 0);
    if (dim) tl.fromTo(stage, { '--dim': 0 }, { '--dim': dim, ease: 'none' }, 0);
    ScrollTrigger.create({
      trigger: sheet,
      start: 'top top-=2',
      onEnter: () => stage.classList.add('is-covered'),
      onLeaveBack: () => stage.classList.remove('is-covered'),
    });
  };

  /* ---------- マーキー: スクロールの向きと速さで流れが変わる ---------- */
  const marquees = [];
  PB.marquee = (box) => {
    const track = $('.pb-band-track', box);
    if (!track || box.dataset.marqueeReady) return;
    box.dataset.marqueeReady = '1';
    const gap = getComputedStyle(track).columnGap;
    const set = document.createElement('span');
    set.className = 'pb-set';
    set.style.gap = gap;
    set.style.paddingRight = gap;
    while (track.firstChild) set.appendChild(track.firstChild);
    track.style.gap = '0';
    track.style.paddingRight = '0';
    track.appendChild(set);
    // 1セットが枠より広くなるまで中身を足し、2セット並べて継ぎ目なくループさせる
    const unit = set.innerHTML;
    let guard = 0;
    while (set.offsetWidth < box.offsetWidth + 200 && guard++ < 12) set.insertAdjacentHTML('beforeend', unit);
    const clone = set.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
    marquees.push({ track, set, dir: Number(box.dataset.marquee) || 1, x: 0, w: set.offsetWidth });
  };
  addEventListener('resize', () => marquees.forEach((m) => { m.w = m.set.offsetWidth; }));
  PB.bands = [];
  let skew = 0;
  gsap.ticker.add((_, dt) => {
    const f = Math.min(dt, 50) / 16.67;
    const boost = Math.min(Math.abs(PB.velocity) * 0.35, 18);
    marquees.forEach((m) => {
      m.x -= (1.1 + boost) * m.dir * PB.scrollDir * f;
      if (m.w) m.x = ((m.x % m.w) - m.w) % m.w;
      m.track.style.transform = `translate3d(${m.x}px,0,0)`;
    });
    skew += (gsap.utils.clamp(-10, 10, -PB.velocity * 0.4) - skew) * 0.12;
    PB.bands.forEach((b) => { b.style.transform = `skewX(${skew.toFixed(2)}deg)`; });
  });

  /* ---------- 見出しステッカー: 上から叩きつけるように貼られる ---------- */
  PB.paste = (el, opts = {}) => gsap.from(el, {
    scale: 1.9,
    rotation: gsap.utils.random(-28, 28),
    y: -60,
    opacity: 0,
    duration: 0.85,
    ease: 'back.out(2.2)',
    ...(opts.immediate ? { delay: opts.delay || 0 } : { scrollTrigger: { trigger: el, start: 'top 86%' } }),
  });

  /* ---------- 文字を1文字ずつの span に（読み上げは aria-label で元の文） ---------- */
  PB.splitChars = (el) => {
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          const charSpan = (ch) => {
            const s = document.createElement('span');
            s.className = 'pb-ch';
            s.setAttribute('aria-hidden', 'true');
            s.textContent = ch;
            return s;
          };
          // 英単語は1語ずつ改行しない塊にする（文字単位の inline-block だと単語の途中で折り返すため）。
          // 和文は1文字ずつのまま（どこでも折り返せる）
          for (const tok of n.data.match(/[A-Za-z0-9&'’.,:;!?()\-]+|\s+|[^]/gu) || []) {
            if (/^\s+$/.test(tok)) { frag.append(tok); continue; }
            if (tok.length > 1) {
              const w = document.createElement('span');
              w.className = 'pb-word';
              for (const ch of tok) w.append(charSpan(ch));
              frag.append(w);
            } else {
              frag.append(charSpan(tok));
            }
          }
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') {
          walk(n);
        }
      });
    };
    walk(el);
    return $$('.pb-ch', el);
  };

  // 1文字ずつ弾んで入る見出し（マーカー付きなら最後に線を引く）
  PB.popTitle = (el, opts = {}) => {
    const chars = PB.splitChars(el);
    const mark = $('.pb-mark', el);
    const tl = gsap.timeline(opts.immediate ? { delay: opts.delay || 0 } : { scrollTrigger: { trigger: el, start: 'top 82%' } });
    tl.from(chars, {
      yPercent: 130,
      rotation: () => gsap.utils.random(-30, 30),
      scale: 0.4,
      opacity: 0,
      duration: 0.9,
      ease: 'back.out(1.9)',
      stagger: Math.min(0.035, 0.9 / Math.max(chars.length, 1)),
    });
    if (mark) tl.fromTo(mark, { '--mark': 0 }, { '--mark': 1, duration: 0.7, ease: 'expo.inOut' }, '-=0.35');
    return tl;
  };

  // 1行ずつ墨が乗っていく本文（行は span で区切っておく）
  PB.inkLines = (lines) => lines.forEach((line) => {
    gsap.fromTo(line, { '--fill': '0%' }, {
      '--fill': '100%',
      ease: 'none',
      scrollTrigger: { trigger: line, start: 'top 88%', end: 'top 58%', scrub: true },
    });
  });

  PB.fadeUp = (els, opts = {}) => gsap.from(els, {
    y: 40,
    opacity: 0,
    duration: 1,
    ease: 'expo.out',
    stagger: opts.stagger ?? 0.08,
    scrollTrigger: { trigger: opts.trigger || (Array.isArray(els) ? els[0] : els), start: opts.start || 'top 88%' },
  });

  /* ---------- カード: 下から傾いて入り、PCではマウスで3Dに傾く ---------- */
  const tilted = new WeakSet();
  PB.tilt = (card, max = 14) => {
    if (!finePointer || tilted.has(card)) return;
    tilted.add(card);
    const rx = gsap.quickTo(card, 'rotationX', { duration: 0.6, ease: 'power3.out' });
    const ry = gsap.quickTo(card, 'rotationY', { duration: 0.6, ease: 'power3.out' });
    gsap.set(card, { transformPerspective: 900 });
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      ry(((e.clientX - r.left) / r.width - 0.5) * max);
      rx(-((e.clientY - r.top) / r.height - 0.5) * max);
    });
    card.addEventListener('pointerleave', () => { rx(0); ry(0); });
  };

  // グリッドのカード: 列ごとにスクロール速度を変える（site.js があとから描画しても登録し直す）
  PB.cardGrid = (grid, opts = {}) => {
    if (!grid) return;
    const seen = new WeakSet();
    const bind = () => {
      const items = [...grid.children].filter((c) => c.nodeType === 1);
      const cols = getComputedStyle(grid).gridTemplateColumns.split(' ').length || 1;
      items.forEach((card, i) => {
        if (seen.has(card)) return;
        seen.add(card);
        gsap.from(card, {
          y: 140,
          rotation: gsap.utils.random(-7, 7),
          opacity: 0,
          duration: 1.1,
          delay: (i % cols) * 0.08,
          ease: 'expo.out',
          scrollTrigger: { trigger: card, start: 'top 94%' },
        });
        const col = i % cols;
        const amt = opts.parallax === false || cols === 1 ? 0 : col === 1 ? -14 : col === 2 ? -6 : 0;
        if (amt) {
          gsap.fromTo(card, { yPercent: 0 }, {
            yPercent: amt,
            ease: 'none',
            scrollTrigger: { trigger: grid, start: 'top bottom', end: 'bottom top', scrub: true },
          });
        }
        if (card.classList.contains('work-card')) PB.tilt(card);
      });
      PB.softRefresh();
    };
    new MutationObserver(bind).observe(grid, { childList: true });
    bind();
  };

  let refreshTimer = 0;
  PB.softRefresh = () => {
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 200);
  };

  /* ---------- PCだけ: カーソル・マグネット ---------- */
  PB.magnet = () => {};
  if (finePointer) {
    const cursor = $('.pb-cursor');
    if (cursor) {
      const label = $('.pb-cursor-label', cursor);
      const cx = gsap.quickTo(cursor, 'x', { duration: 0.35, ease: 'power3.out' });
      const cy = gsap.quickTo(cursor, 'y', { duration: 0.35, ease: 'power3.out' });
      const hero = $('#hero');
      addEventListener('pointermove', (e) => { cx(e.clientX); cy(e.clientY); }, { passive: true });
      document.addEventListener('pointerleave', () => cursor.classList.add('is-hidden'));
      document.addEventListener('pointerenter', () => cursor.classList.remove('is-hidden'));
      const setState = (cls, text = '') => {
        cursor.className = `pb-cursor ${cls}`.trim();
        label.textContent = text;
      };
      document.addEventListener('pointerover', (e) => {
        const t = e.target;
        if (t.closest('.work-drawer')) return setState(t.closest('a, button') ? 'is-link' : '');
        if (t.closest('.work-card, .pb-biz-card, .pb-member-link, .member-link, .biz-link, .sticker, .photo-card')) return setState('is-big is-view', 'VIEW');
        if (t.closest('a, button')) return setState('is-link');
        if (t.closest('.pb-members-track')) return setState('is-big', 'SCROLL');
        if (hero && t.closest('#hero') && hero.classList.contains('can-pan')) return setState('is-big', 'DRAG');
        setState('');
      });
    }

    PB.magnet = (el, power = 0.3) => {
      if (el.dataset.magnetReady) return;
      el.dataset.magnetReady = '1';
      const mx = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' });
      const my = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        mx((e.clientX - (r.left + r.width / 2)) * power);
        my((e.clientY - (r.top + r.height / 2)) * power);
      });
      el.addEventListener('pointerleave', () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.4)', overwrite: true });
      });
    };
  }

  // ボタンの塗りをカーソルが入った位置から広げる
  PB.fillFromPointer = (btn) => btn.addEventListener('pointerenter', (e) => {
    const r = btn.getBoundingClientRect();
    btn.style.setProperty('--mx', `${e.clientX - r.left}px`);
    btn.style.setProperty('--my', `${e.clientY - r.top}px`);
  });

  /* ---------- フッター: 巨大ロゴがせり上がる ---------- */
  PB.footer = () => {
    const footer = $('.pb-footer');
    if (!footer) return;
    gsap.fromTo($('.pb-footer-mark', footer), { yPercent: 60, scaleY: 0.3, opacity: 0 }, {
      yPercent: 0,
      scaleY: 1,
      opacity: 1,
      ease: 'none',
      scrollTrigger: { trigger: footer, start: 'top 85%', end: 'bottom bottom', scrub: true },
    });
    gsap.from($$('.fnav-col, .pb-footer-left', footer), {
      y: 50,
      opacity: 0,
      duration: 1,
      stagger: 0.07,
      ease: 'expo.out',
      scrollTrigger: { trigger: footer, start: 'top 85%' },
    });
  };

  // 各ページのスクリプトが組み終わったあとに呼ぶ共通の仕上げ
  PB.finish = () => {
    $$('[data-marquee]').forEach(PB.marquee);
    $$('[data-magnet]').forEach((el) => PB.magnet(el));
    $$('.pb-btn').forEach(PB.fillFromPointer);
    PB.footer();
    addEventListener('load', () => ScrollTrigger.refresh());
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
  };
})();
