/* ===== デザイン案B: ページ間リンクを案Bの中で閉じる =====
 * site.js はサイトルート（本番＝案A）の works/<slug>/ へのリンクを組み立てる（事例カード・フッター・ドロワー）。
 * 案Bのページではそれを b/ 配下の案Bページへ付け替える。site.js の直後に読み込む。
 *   data-broot … このページから b/ までの相対パス
 */
(() => {
  const me = document.currentScript;
  const SITE_ROOT = new URL('../', me.src);                           // proposal-b/ の1つ上＝サイトルート
  const B_ROOT = new URL(me.dataset.broot || './b/', location.href);
  const TOP_B = new URL('index-b.html', SITE_ROOT).href;

  window.workURL = (w) => new URL(`works/${encodeURIComponent(w.slug || w.id)}/`, B_ROOT).href;

  // 本番（案A）のページを指すリンクなら、案Bの同じページのURLを返す
  const toB = (href) => {
    let u;
    try { u = new URL(href, location.href); } catch { return null; }
    if (u.origin !== SITE_ROOT.origin || !u.href.startsWith(SITE_ROOT.href)) return null;
    const path = u.pathname.slice(SITE_ROOT.pathname.length);
    if (path.startsWith('b/') || path === 'index-b.html' || path.startsWith('proposal-b/')) return null;
    const base = path.split('/').pop();
    const isPage = path === '' || path.endsWith('/') || base.endsWith('.html') || !base.includes('.');
    if (!isPage || path.startsWith('assets/') || path.startsWith('data/')) return null;
    const target = (path === '' || path === 'index.html') ? TOP_B : new URL(path, B_ROOT).href;
    return target + u.search + u.hash;
  };

  const fixOne = (a) => {
    const raw = a.getAttribute('href');
    if (!raw || raw.startsWith('#') || /^(mailto|tel|javascript):/i.test(raw)) return;
    const b = toB(raw);
    if (b && b !== raw) a.setAttribute('href', b);
  };
  const fix = (root) => {
    if (root.matches && root.matches('a[href]')) fixOne(root);
    if (root.querySelectorAll) root.querySelectorAll('a[href]').forEach(fixOne);
  };

  fix(document);
  new MutationObserver((list) => list.forEach((m) => m.addedNodes.forEach((n) => {
    if (n.nodeType === 1) fix(n);
  }))).observe(document.documentElement, { childList: true, subtree: true });
  // ドロワーの「この事例のページを開く」など、href を後から書き換えるリンク
  new MutationObserver((list) => list.forEach((m) => {
    const a = m.target;
    const raw = a.getAttribute('href');
    if (!raw || raw.startsWith('#')) return;
    const b = toB(raw);
    if (b && b !== raw) a.setAttribute('href', b);
  })).observe(document.documentElement, { attributes: true, attributeFilter: ['href'], subtree: true });
})();
