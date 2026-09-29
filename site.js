/* ===== サイト共通スクリプト =====
 * index.html / work.html / design-process.html で読み込む。
 *   - 事例（works）データの一元管理: microCMS取得 + ローカルのフォールバック
 *   - TOPの WORKs カード一覧（[data-works-grid]）
 *   - 事例詳細ページ work.html の描画（[data-work-detail]）
 *   - フッターのWORKs一覧（各事例ページへリンク）
 *   - スマホのハンバーガーメニュー
 * cms-config.js が未設定・取得失敗時は、下の WORKS_FALLBACK で表示する。
 * FVのステッカー（main.js）も window.getWorks() の結果を使う。
 *
 * 注意: WORKS_FALLBACK は data/works-fallback.json と内容を同期させること
 * （事例ページを静的生成するビルドスクリプト scripts/build_works.py が参照する）。
 * fetch に置き換えないこと（file:// 直開きや取得失敗時に壁が全滅するため）。
 */

/* ==========================================================
   ▼ 事例データ
   ========================================================== */

/* CMS未設定・取得失敗時に使うローカルの事例データ。
 * title は microCMS の title と一致させること（CMSに画像が無い事例に
 * ローカル素材を紐付けるキーになる）。
 * image はサイトルート起点の相対パス（FVステッカー・カード・詳細ページで共用）。
 * 紹介文はスプレッドシート「WORKS_Webサイト 事例集」の反映待ち（仮文言）。 */
const WORKS_FALLBACK = [
  { slug: 'smeedy', title: 'スミーディ', kind: 'キャラクターデザイン', client: '住友電気工業',
    image: './assets/works/jirei/smeedy-pose04.png',
    description: '掲載事例 No.01。紹介文はWORKSシート反映待ち（仮）。' },
  { slug: 'ai-interviewer', title: 'AI面接官', kind: '事業開発・サービスロゴ', client: '',
    image: './assets/works/jirei/ai-interviewer-logo.jpg',
    description: '掲載事例 No.07。紹介文はWORKSシート反映待ち（仮）。' },
  { slug: 'aburi-kikou', title: '炙り紀行', kind: 'グラフィック', client: '',
    image: './assets/works/jirei/aburi-kikou.png',
    description: '掲載事例 No.08。紹介文はWORKSシート反映待ち（仮）。' },
  { slug: 'kdc', title: 'K,D,C,,,', kind: 'ロゴ・場の運営', client: 'STUDIO HOLIDAY',
    image: './assets/works/jirei/kdc-logo.jpg',
    description: '掲載事例 No.16。紹介文はWORKSシート反映待ち（仮）。' },
  { slug: 'seiryu-okoshi', title: '清流おこし', kind: 'ロゴ・ブランディング', client: '',
    image: './assets/works/jirei/seiryu-okoshi-logo.png',
    description: '掲載事例 No.21。紹介文はWORKSシート反映待ち（仮）。' },
  { slug: 'holiday-cola', title: '休日COLA', kind: 'フード・ブランド開発', client: 'STUDIO HOLIDAY',
    image: './assets/works/jirei/holiday-cola-logo.png',
    description: '掲載事例 No.27。紹介文はWORKSシート反映待ち（仮）。',
    // 仮のクレジット（自社事業なのですべて社内。実データはmicroCMSの credit で管理する）
    credit: 'Client: STUDIO HOLIDAY（自社事業）\nCreative Direction: STUDIO HOLIDAY\nArt Direction / Design: STUDIO HOLIDAY\nIllustration: STUDIO HOLIDAY\nRecipe Development: STUDIO HOLIDAY' },
  { slug: 'holidaykun-hirune', title: 'ホリデイくん（ひるね）', kind: 'キャラクターデザイン', client: 'STUDIO HOLIDAY',
    image: './assets/works/jirei/holidaykun-hirune.png',
    description: '掲載事例 No.32。紹介文はWORKSシート反映待ち（仮）。' },
  { slug: 'holidaykun-tozan', title: 'ホリデイくん（とざん）', kind: 'キャラクターデザイン', client: 'STUDIO HOLIDAY',
    image: './assets/works/jirei/holidaykun-tozan.png',
    description: '掲載事例 No.32。紹介文はWORKSシート反映待ち（仮）。' },
  { slug: 'minna-gohankai', title: 'みんなでごはん会', kind: 'ロゴ・イベント', client: 'STUDIO HOLIDAY',
    image: './assets/works/jirei/minna-gohankai-logo.png',
    description: '掲載事例 No.31。紹介文はWORKSシート反映待ち（仮）。' },
  { slug: 'juzan', title: '十山ブランディング', kind: 'ブランディング', client: '',
    image: './assets/works/jirei/juzan-asset1.png',
    description: '掲載事例 No.06。紹介文はWORKSシート反映待ち（仮）。' },
  { slug: 'ebisun', title: 'エビシー', kind: 'キャラクターデザイン', client: '',
    image: './assets/stickers/works/ebisun.png',
    description: '実際の制作実績から切り抜いたキャラクタービジュアルです。' },
  { slug: 'and-coffee-maison-kayser', title: '&COFFEE MAISON KAYSER', kind: 'ロゴ・ブランディング', client: '',
    image: './assets/stickers/works/and-coffee-maison-kayser.png',
    description: '実際の制作実績から切り抜いたブランドロゴです。' },
  { slug: 'goichi', title: 'GOICHI', kind: 'キャラクター・グラフィック', client: '',
    image: './assets/stickers/works/goichi-character.png',
    description: '実際の制作実績から切り抜いたキャラクタービジュアルです。' },
  { slug: 'ichiban-no-oshigoto', title: 'いちばんのおしごと', kind: 'パッケージ・イラストレーション', client: '',
    image: './assets/stickers/works/ichiban-no-oshigoto.png',
    description: '実際の制作実績から切り抜いたパッケージビジュアルです。' },
  { slug: 'monster-illustration', title: 'モンスター・イラストレーション', kind: 'イラストレーション', client: '',
    image: './assets/stickers/works/monster-illustration.png',
    description: '実際の制作実績から切り抜いたイラストレーションです。' },
  { slug: 'itomaki-ac-adapter', title: 'itomaki AC Adapter', kind: 'プロダクトデザイン', client: '',
    image: './assets/stickers/works/itomaki-ac-adapter.png',
    description: '実際の制作実績から切り抜いたプロダクトビジュアルです。' },
  { slug: 'holiday-cola-ginger-apple', title: '休日コーラ GINGER APPLE', kind: 'フード・ブランド開発', client: 'STUDIO HOLIDAY',
    image: './assets/stickers/works/holiday-cola.png',
    description: '実際の制作実績から切り抜いた商品ビジュアルです。' },
  { slug: 'yappy', title: 'yappy', kind: 'ロゴ・世界観', client: '',
    image: './assets/stickers/yappy.png',
    description: 'スタジオホリデーの制作実績から生まれたロゴ・世界観です。' },
  { slug: 'pondelion', title: 'ポン・デ・ライオン', kind: 'キャラクターデザイン', client: '',
    image: './assets/stickers/works-pondelion.png',
    description: 'スタジオホリデーのキャラクターデザイン実績です。' },
  { slug: 'sushiro', title: 'スシロー', kind: 'ブランディング', client: '',
    image: './assets/stickers/works-sushiro.png',
    description: 'スタジオホリデーのブランディング実績です。' },
];
window.WORKS_FALLBACK = WORKS_FALLBACK;

/* 事例ページの恒久URL: ./works/<slug>/（scripts/build_works.py が静的生成する）。
 * slug が無い場合のみ microCMS のコンテンツIDで補う。
 * 旧URL work.html?id=… は work.html 側で自動リダイレクトされる。 */
// どの階層のページから呼ばれても正しく飛べるよう、site.js の置き場所（=サイトルート）を基準に解決する
const SITE_ROOT = new URL('./', document.currentScript ? document.currentScript.src : location.href);
window.workURL = (w) => new URL(`works/${encodeURIComponent(w.slug || w.id)}/`, SITE_ROOT).href;

async function fetchCMS(endpoint) {
  const cfg = window.MICROCMS_CONFIG || {};
  if (!cfg.serviceDomain || !cfg.apiKey) return null; // 未設定なら静かにフォールバック
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 4000); // CMS障害時もページを待たせない
  try {
    const res = await fetch(
      `https://${cfg.serviceDomain}.microcms.io/api/v1/${endpoint}?limit=100`,
      { headers: { 'X-MICROCMS-API-KEY': cfg.apiKey }, signal: ctl.signal },
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()).contents;
  } catch (e) {
    console.warn(`[microCMS] ${endpoint} の取得に失敗。フォールバックで表示します:`, e);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/* CMSのコンテンツを、サイト内で使う共通の形に揃える。
 * CMSに画像が無ければ、タイトル一致でローカル素材を当てる
 * （メディアアップロードAPIが使えないプランでもテキストだけCMS管理できるようにするため）*/
function normalizeWorks(contents) {
  const localByTitle = new Map(WORKS_FALLBACK.map((w) => [w.title, w]));
  return contents.map((c) => {
    const local = localByTitle.get(c.title);
    return {
      id: c.id,
      // CMSに slug フィールドがあれば最優先。無ければローカルのタイトル一致 → コンテンツID
      slug: c.slug || (local ? local.slug : c.id),
      title: c.title || '',
      kind: c.kind || '',
      client: c.client || '',
      description: c.description || '',
      body: c.body || '', // リッチエディタ本文（詳細ページの記事本文）
      credit: c.credit || (local ? local.credit || '' : ''), // 「役割: 名前」を改行区切りで
      // imgix変換で幅を抑えつつPNG化（切り抜きの透過を保持）
      image: c.sticker && c.sticker.url ? `${c.sticker.url}?w=1000&fm=png` : (local ? local.image : ''),
    };
  });
}

const localWorks = () => WORKS_FALLBACK.map((w) => ({ ...w, id: w.slug, body: '' }));

/* works は FV・カード一覧・フッター・詳細ページで使うので、リクエストは1回だけにする */
window.getWorks = () => (window.__worksPromise ??= (async () => {
  const contents = await fetchCMS('works');
  const works = contents && contents.length ? normalizeWorks(contents) : localWorks();
  return works.length ? works : localWorks();
})());

/* ==========================================================
   ▼ WORKs カード一覧（TOPの WORKs セクション / 詳細ページの他の事例）
   ========================================================== */

const ARROW_SVG =
  '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
  '<path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z"/></svg>';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]
));

function workCard(w) {
  const el = document.createElement('a');
  el.className = 'work-card';
  el.href = window.workURL(w);
  el.innerHTML =
    `<span class="work-card-visual">${
      w.image ? `<img src="${esc(w.image)}" alt="" loading="lazy" />` : '<span class="work-card-noimg" aria-hidden="true">STUDIO HOLIDAY</span>'
    }</span>` +
    '<span class="work-card-body">' +
      (w.kind ? `<span class="work-card-kind">${esc(w.kind)}</span>` : '') +
      `<span class="work-card-title">${esc(w.title)}</span>` +
      (w.client ? `<span class="work-card-client">${esc(w.client)}</span>` : '') +
      // TOPのカード（Figma workcard）は「#クライアント #ジャンル」のタグで見せる
      ((w.client || w.kind) ? `<span class="work-card-tags">${[w.client, w.kind].filter(Boolean).map((t) => `<span>#${esc(t)}</span>`).join('')}</span>` : '') +
      `<span class="work-card-arrow" aria-hidden="true">${ARROW_SVG}</span>` +
    '</span>';
  return el;
}

/* クレジット: microCMSの credit（テキストエリア）に「役割: 名前」を1行ずつ書く。
 * 「:」が無い行はそのまま1行として出す。 */
function workCreditHTML(w) {
  const rows = (w.credit || '').split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
  if (!rows.length) return '';
  const items = rows.map((line) => {
    const m = line.match(/^(.+?)\s*[:：]\s*(.+)$/);
    return m
      ? `<div><dt>${esc(m[1])}</dt><dd>${esc(m[2])}</dd></div>`
      : `<div><dt></dt><dd>${esc(line)}</dd></div>`;
  });
  return `<aside class="work-credit"><h2>CREDIT</h2><dl>${items.join('')}</dl></aside>`;
}

/* 関連事例: 同じジャンル > 同じクライアント > それ以外 の順に n 件 */
window.relatedWorks = (work, all, n = 3) => all
  .filter((w) => w.id !== work.id)
  .map((w, i) => ({ w, i, score: (w.kind && w.kind === work.kind ? 2 : 0) + (w.client && w.client === work.client ? 1 : 0) }))
  .sort((a, b) => b.score - a.score || a.i - b.i)
  .slice(0, n)
  .map((o) => o.w);

/* ドロワー（main.js）から使う。作品詳細ページと同じく、本文の下に置くクレジットと
 * 「Related Works」のカード（TOP・一覧と同じ Figma workcard）を返す */
window.workDrawerExtras = async (work) => {
  if (!work || !work.slug) return { credit: '', cards: [] };
  const all = await window.getWorks();
  const self = all.find((w) => w.slug === work.slug) || work;
  return { credit: workCreditHTML(self), cards: window.relatedWorks(self, all, 3).map(workCard) };
};

/* grid の data属性:
 *   data-works-limit    … 表示件数の上限（未指定なら全件）
 *   data-works-more     … 先頭 data-works-initial 件のあとに置く「全て見る」リンク（TOP用・WORKS一覧へ）
 *   data-works-exclude  … 除外する事例のid（詳細ページで自分自身を出さない） */
function renderWorksGrid(grid, works) {
  const exclude = grid.dataset.worksExclude || '';
  let list = works.filter((w) => w.id !== exclude && w.slug !== exclude);
  if (grid.dataset.worksKind !== undefined) {
    // 事例ページの「関連する事例」: 同ジャンル・同クライアントを先頭へ（それ以外は元の順のまま）
    const ref = { kind: grid.dataset.worksKind, client: grid.dataset.worksClient };
    list = window.relatedWorks(ref, list, list.length);
  }
  const limit = Number(grid.dataset.worksLimit) || 0;
  if (limit) list = list.slice(0, limit);

  // TOP: 先頭 initial 件だけ並べ、続きは WORKS一覧ページ（works/）への「全て見る」タイルで案内する
  const more = grid.dataset.worksMore ? document.querySelector(grid.dataset.worksMore) : null;
  const initial = Number(grid.dataset.worksInitial) || 8;

  if (more && more.parentNode === grid) grid.after(more); // 再描画で消さないよう一旦グリッドの外へ戻す
  grid.innerHTML = '';
  (more ? list.slice(0, initial) : list).forEach((w) => grid.appendChild(workCard(w)));

  if (!more) return;
  more.hidden = list.length <= initial;
  if (!more.hidden) grid.appendChild(more); // カードと同じ並びの最後のタイルとして置く
}

async function initWorksGrids() {
  const grids = [...document.querySelectorAll('[data-works-grid]')];
  if (!grids.length) return;
  // CMS取得を待つ間に空欄が出ないよう、まずローカルデータで描いてから差し替える
  grids.forEach((g) => renderWorksGrid(g, localWorks()));
  const works = await window.getWorks();
  grids.forEach((g) => renderWorksGrid(g, works));
}

/* ==========================================================
   ▼ 事例詳細ページ（work.html）
   ========================================================== */

/* microCMSの body 入稿までの間だけ表示する仮原稿。
 * slug → 記事HTMLのパス。CMSに body が入ったら自動的にそちらが優先される。
 * （入稿時は data/works-sample/*.html の中身をリッチエディタに貼り、
 *   画像だけCMS側にアップし直せばよい） */
const SAMPLE_BODIES = {
  'holiday-cola': './data/works-sample/holiday-cola.html',
};

async function fetchSampleBody(slug) {
  const path = SAMPLE_BODIES[slug];
  if (!path) return '';
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } catch (e) {
    console.warn('[works] 仮原稿の読み込みに失敗:', e);
    return '';
  }
}

/* 記事本文を解決する。CMSの body があればそれ、無ければ仮原稿、どちらも無ければ空。
 * 事例ページ（work.html）とFVのドロワー（main.js）で同じ内容を出すために共用する。
 * 仮原稿のときは isDraft=true（注記を出す側の判断材料） */
window.workDraftNote = (isDraft) => (isDraft
  ? '<p class="work-draft-note">※ レイアウト確認用の仮原稿です。microCMSの「本文」に入稿すると差し替わります。（仮）</p>'
  : '');

window.workBody = async (w) => {
  if (!w) return { html: '', isDraft: false };
  if (w.body) return { html: w.body, isDraft: false };
  return { html: await fetchSampleBody(w.slug), isDraft: true };
};

async function initWorkDetail() {
  const root = document.querySelector('[data-work-detail]');
  if (!root) return;
  const id = new URLSearchParams(location.search).get('id') || '';
  const works = await window.getWorks();
  const work = works.find((w) => w.id === id || w.slug === id);

  if (!work) {
    root.innerHTML =
      '<p class="work-missing">お探しの事例は見つかりませんでした。</p>' +
      `<a class="btn-lime" href="./index.html#works"><span>WORKs一覧へ</span>${ARROW_SVG}</a>`;
    return;
  }

  // 恒久ページ（works/<slug>/）が生成済みならそちらへ。CMSのコンテンツIDで来た
  // 旧URLもここで解決される。未生成の新規事例だけこのページでJS描画する
  try {
    const url = window.workURL(work);
    if ((await fetch(url, { method: 'HEAD' })).ok) {
      location.replace(url);
      return;
    }
  } catch { /* file:// 直開き等はそのままJS描画 */ }

  document.title = `${work.title} — WORKs | STUDIO HOLIDAY`;
  const tags = [work.client, work.kind].filter(Boolean);
  const { html: bodyHTML, isDraft } = await window.workBody(work);
  root.innerHTML =
    '<a class="work-back" href="./index.html#works">← WORKs一覧</a>' +
    '<div class="work-hero">' +
      `<div class="work-hero-visual">${work.image ? `<img src="${esc(work.image)}" alt="${esc(work.title)}" />` : ''}</div>` +
      '<div class="work-hero-body">' +
        (work.kind ? `<span class="work-kind">${esc(work.kind)}</span>` : '') +
        `<h1>${esc(work.title)}</h1>` +
        (tags.length ? `<ul class="work-tags">${tags.map((t) => `<li>#${esc(t)}</li>`).join('')}</ul>` : '') +
        (work.description ? `<p class="work-lead">${esc(work.description)}</p>` : '') +
      '</div>' +
    '</div>' +
    // microCMSのリッチエディタ本文（自社CMSの入稿HTMLをそのまま流し込む）。
    // 未入稿で仮原稿がある事例は、レイアウト確認用にそれを表示する
    (bodyHTML
      ? `<div class="work-body">${window.workDraftNote(isDraft)}${bodyHTML}</div>`
      : '<p class="work-note">※ 詳細記事の本文はmicroCMSの「本文」入稿待ちです。ここに事例記事がそのまま入ります。（仮）</p>') +
    workCreditHTML(work);

  // 下の一覧は自分自身を外し、同じジャンルの事例を先頭に寄せる
  document.querySelectorAll('[data-works-grid]').forEach((g) => {
    g.dataset.worksExclude = work.id;
    g.dataset.worksKind = work.kind || '';
    g.dataset.worksClient = work.client || '';
  });
}

/* ==========================================================
   ▼ フッターのWORKs一覧
   ========================================================== */

async function initFooterWorks() {
  const box = document.querySelector('[data-footer-works]');
  if (!box) return;
  const works = await window.getWorks();
  if (!works.length) return; // 取得できなければHTMLの仮リストのまま
  box.innerHTML = '';
  works.slice(0, 5).forEach((w) => {
    const a = document.createElement('a');
    a.href = window.workURL(w);
    a.textContent = w.title;
    box.appendChild(a);
  });
}

/* ==========================================================
   ▼ スマホのハンバーガーメニュー
   ========================================================== */

function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.site-nav');
  if (!toggle || !nav) return;

  const setOpen = (open) => {
    nav.classList.toggle('is-open', open);
    toggle.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
  };

  toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
  // メニュー内のリンクを踏んだら閉じる（同一ページ内アンカーでも閉じたい）
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.site-header')) setOpen(false); // 外側タップで閉じる
  });
}

/* ==========================================================
   ▼ 横スクロール帯（MEMBERS）: マウスはドラッグで送れるようにする
   （タッチ・トラックパッドはネイティブの横スクロールのまま）
   ========================================================== */

function initHScroll() {
  document.querySelectorAll('[data-hscroll]').forEach((el) => {
    let startX = 0;
    let startLeft = 0;
    let dragging = false;
    let moved = false;
    el.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      e.preventDefault(); // リンク画像のネイティブドラッグを抑止
      dragging = true;
      moved = false;
      startX = e.clientX;
      startLeft = el.scrollLeft;
    });
    window.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 3) { moved = true; el.classList.add('is-dragging'); }
      el.scrollLeft = startLeft - dx;
    });
    // ドラッグで送った直後のクリックでメンバーページへ飛ばないようにする
    el.addEventListener('click', (e) => {
      if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
    }, true);
    window.addEventListener('pointerup', () => {
      dragging = false;
      el.classList.remove('is-dragging');
    });
  });
}

/* ==========================================================
   ▼ 登場アニメーション: スクロールでそのエリアに入った時に1回だけ
   見出しステッカー → 貼り付け / カード → 貼り付け / 文字 → タイプライター
   （見た目の定義は styles.css の「登場アニメーション」）
   ========================================================== */

const RV_STICKERS = '.sticker-head, .wd-visual';
const RV_CARDS = [
  '.biz-card', '.work-card', '.works-more', '.member', '.service-card', '.biz-link',
  '.approach-media', '.wd-tags li', '.dp-label',
].join(', ');
const RV_TEXTS = [
  '.about-hero h1', '.about-hero p', '.contact-lead',
  '.page-intro h1', '.page-intro p', '.approach-body h2', '.approach-body p',
  '.wd-main h1', '.md-name-ja', '.wd-lead', '.wd-related h2', '.works-count',
  '.company-list dt', '.company-list dd', '.company-clients dt', '.company-clients li',
].join(', ');

/* 文字を1文字ずつの span に分ける。読み上げ用に元の文は .sr-only で別に持つ */
function prepareTypewriter(el) {
  if (el.dataset.tw) return;
  el.dataset.tw = '1';
  const sr = document.createElement('span');
  sr.className = 'sr-only';
  sr.textContent = el.textContent.replace(/\s+/g, ' ').trim();
  const visual = document.createElement('span');
  visual.setAttribute('aria-hidden', 'true');
  while (el.firstChild) visual.appendChild(el.firstChild);
  const walker = document.createTreeWalker(visual, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((node) => {
    const frag = document.createDocumentFragment();
    for (const ch of node.data) {
      if (/\s/.test(ch)) { frag.appendChild(document.createTextNode(ch)); continue; } // 空白は数えない
      const span = document.createElement('span');
      span.className = 'tw-ch';
      span.textContent = ch;
      frag.appendChild(span);
    }
    node.replaceWith(frag);
  });
  el.append(sr, visual);
}

/* 見出しはゆっくり、長文は全体が約1.4秒に収まる速さで打つ */
function typewrite(el, delayMs) {
  const chars = [...el.querySelectorAll('.tw-ch')];
  if (!chars.length) return;
  const heading = /^H[1-6]$/.test(el.tagName) || el.matches('dt');
  const step = heading ? Math.min(55, 1100 / chars.length) : Math.max(6, Math.min(24, 1400 / chars.length));
  let start = 0;
  let shown = 0;
  let cur = null;
  const tick = (now) => {
    if (!start) start = now;
    const n = Math.min(chars.length, Math.floor((now - start) / step) + 1);
    while (shown < n) chars[shown++].classList.add('on');
    if (cur) cur.classList.remove('tw-cur');
    cur = chars[n - 1];
    cur.classList.add('tw-cur');
    if (n < chars.length) requestAnimationFrame(tick);
    else setTimeout(() => cur.classList.remove('tw-cur'), 900); // 打ち終わりに少しだけカーソルを残す
  };
  setTimeout(() => requestAnimationFrame(tick), delayMs);
}

function initReveal() {
  if (!('IntersectionObserver' in window)) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  // FV（壁）は独自のイントロがあるので対象外
  const outsideFv = (el) => !el.closest('.hero, .work-drawer');

  const io = new IntersectionObserver((entries) => {
    // 同時に入ってきたものは画面上の並び順（上→下、左→右）に少しずつずらす
    const hits = entries.filter((e) => e.isIntersecting)
      .sort((a, b) => (a.boundingClientRect.top - b.boundingClientRect.top) || (a.boundingClientRect.left - b.boundingClientRect.left));
    hits.forEach((e, i) => {
      const el = e.target;
      io.unobserve(el);
      const delay = Math.min(i, 6) * (el.classList.contains('rv-type') ? 140 : 90);
      if (el.classList.contains('rv-type')) {
        typewrite(el, delay);
      } else {
        el.style.setProperty('--rv-delay', `${delay}ms`);
        el.classList.add('rv-in');
      }
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.15 });

  let alt = 0;
  const register = (root) => {
    root.querySelectorAll(RV_STICKERS).forEach((el) => {
      if (el.classList.contains('rv-sticker') || !outsideFv(el)) return;
      el.classList.add('rv-sticker');
      io.observe(el);
    });
    root.querySelectorAll(RV_CARDS).forEach((el) => {
      if (el.classList.contains('rv-card') || !outsideFv(el)) return;
      el.classList.add('rv-card');
      if (alt++ % 2) el.classList.add('rv-alt'); // 傾きの向きを交互に
      io.observe(el);
    });
    root.querySelectorAll(RV_TEXTS).forEach((el) => {
      if (el.classList.contains('rv-type') || !outsideFv(el)) return;
      prepareTypewriter(el);
      el.classList.add('rv-type');
      io.observe(el);
    });
  };
  register(document);

  // WORKsのカードは site.js があとから描画する（ローカル → microCMS で2回）ので、差し込まれたら登録する
  document.querySelectorAll('[data-works-grid]').forEach((grid) => {
    new MutationObserver(() => register(grid)).observe(grid, { childList: true });
  });
}

// 詳細ページは自分自身を除外してからカードを描きたいので、順番に実行する
initWorkDetail().then(initWorksGrids);
initFooterWorks();
initMobileNav();
initHScroll();
initReveal();
