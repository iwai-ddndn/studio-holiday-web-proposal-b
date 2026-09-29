/* ===== STUDIO HOLIDAY — explorable sticker-wall first view =====
 * 0721修正: ファーストビューをビューポートより広い「壁」（ワールド）にし、
 * ドラッグ/ホイールで上下左右に回遊できるようにした。
 *
 * イントロの流れ:
 *   1. 中央に「Design & Deploy Partner」（カメラは引きで、壁全体が見える）
 *   2. ステッカー・写真が順番に（ランダムな順で）貼られていく
 *   3. カメラが中央へズームイン（100%）
 *   4. 文字の上に STUDIO HOLIDAY のロゴが貼られる
 *   5. 自由に回遊できるようになる
 *   ※ クリックでスキップ可 / prefers-reduced-motion では即・完成状態
 *
 * クリック挙動:
 *   ステッカー → ポップアップ（アウトプット概要 + ストーリーへのリンク）
 *   写真       → 実際のK,D,C,,,記事
 *   ロゴ       → #about へ
 *
 * ステッカー画像は assets/stickers/works/*.png で管理する。
 * 実際のWorks画像から切り抜いた透過PNGに、白フチと落ち影をCanvasで焼き込む。
 */

const STICKER_DIR = './assets/stickers/';

/* ステッカーの元データ（事例）は site.js の window.getWorks() が一元管理する。
 * ここでは works → ステッカーの形（画像 + ドロワーに出す情報 + 詳細ページのURL）に変換して使う。
 * CMS未設定・取得失敗時は site.js の WORKS_FALLBACK が返ってくる。 */
const stickerOfWork = (w) => ({
  src: w.image,
  alt: w.title,
  client: w.client || '',
  // slug / body はドロワーで記事本文を出すために持ち回る（事例ページと同じ内容）
  work: { kind: w.kind || '', title: w.title, desc: w.description || '', slug: w.slug, body: w.body || '' },
});

let STICKERS = [];


/* 社名ロゴ: イントロの最後に「Design & Deploy Partner」の上へ貼られる特別なステッカー。
 * 常に最前面・クリックで About へ */
const LOGO = { file: 'sh-logo.png', alt: 'STUDIO HOLIDAY', href: '#about' };

/* 実際のK,D,C,,,記事。画像もローカルに保持し、クリックで元記事を開く。 */
const PHOTOS = [
  { cap: '【イベント】台湾料理ワークショップ', img: './assets/articles/taiwan-workshop.jpg', emoji: '📷', href: 'https://kdc-foodlab.com/post/j-Dju3A8', external: true, bg: '#eefafa' },
  { cap: '【イベント】きくがわ応援大使交流会in　K,D,C,,,', img: './assets/articles/kikugawa-event.png', emoji: '📷', href: 'https://kdc-foodlab.com/post/UzQU7SgF', external: true, bg: '#eefafa' },
  { cap: '【会員情報】CACAO HUNTERS　特別イベント', img: './assets/articles/cacao-hunters.png', emoji: '📷', href: 'https://kdc-foodlab.com/post/COdVcAEz', external: true, bg: '#eefafa' },
  { cap: '【インタビュー】日本製を世界へ――地方から未来をつなぐルフィ株式会社の挑戦', img: './assets/articles/luffy-interview.jpg', emoji: '📷', href: 'https://kdc-foodlab.com/post/X1Kh8nm8', external: true, bg: '#eefafa' },
  { cap: 'ポン・デ・ライオン', img: './assets/works_pondelion01.jpg', emoji: '📷', href: './works.html', bg: '#eefafa' },
  { cap: 'スシロー', img: './assets/works_sushiro.png', emoji: '📷', href: './works.html', bg: '#eefafa' },
  { cap: 'エビシー', img: './assets/works/source/ebisun-osaka.png', emoji: '📷', href: './works.html', bg: '#eefafa' },
  { cap: 'いちばんのおしごと', img: './assets/works/source/ichiban-no-oshigoto.png', emoji: '📷', href: './works.html', bg: '#eefafa' },
  { cap: 'itomaki AC Adapter', img: './assets/works/source/itomaki-ac-adapter.png', emoji: '📷', href: './works.html', bg: '#eefafa' },
  { cap: '休日コーラ GINGER APPLE', img: './assets/works/source/holiday-cola.png', emoji: '📷', href: './works.html', bg: '#eefafa' },
  /* ▼ Drive「Webサイト:事例集」掲載事例（紹介文はWORKSシート反映待ち） */
  { cap: 'うねり 企業ブランディング', img: './assets/works/jirei/uneri-ogp.png', emoji: '📷', href: './works.html', bg: '#eefafa' },
  { cap: '十山ブランディング', img: './assets/works/jirei/juzan-photo1.jpg', emoji: '📷', href: './works.html', bg: '#eefafa' },
  { cap: '採用ブランディング支援', img: './assets/works/jirei/recruit-branding-pc.jpg', emoji: '📷', href: './works.html', bg: '#eefafa' },
  { cap: '「みんなで知りたい」シリーズ', img: './assets/works/jirei/minna-shiritai-1.jpg', emoji: '📷', href: './works.html', bg: '#eefafa' },
  { cap: 'yappy', img: './assets/works/jirei/yappy-a2-layout.png', emoji: '📷', href: './works.html', bg: '#eefafa' },
  { cap: 'K,D,C,,,', img: './assets/works/jirei/kdc-top-visual.png', emoji: '📷', href: './works.html', bg: '#eefafa' },
  { cap: 'K,D,C,,,meet クラフトシードル', img: './assets/works/jirei/craft-cidre.jpg', emoji: '📷', href: './works.html', bg: '#eefafa' },
  { cap: '休日COLA', img: './assets/works/jirei/holiday-cola-top.png', emoji: '📷', href: './works.html', bg: '#eefafa' },
  { cap: '休日COLA de お知らせ（2026夏）', img: './assets/works/jirei/holiday-cola-card.jpg', emoji: '📷', href: './works.html', bg: '#eefafa' },
  { cap: '学際型メッシュネットワーク', img: './assets/works/jirei/mesh-network.jpg', emoji: '📷', href: './works.html', bg: '#eefafa' },
];

const genericWork = (alt) => ({
  kind: 'グラフィック（仮）',
  title: `${alt}（仮）`,
  desc: 'ここにアウトプットの概要が入ります。どんな依頼で、なにを考えてつくったか。実データが入るまでのダミーテキストです。（仮）',
});

const hero = document.getElementById('hero');
const world = document.getElementById('world');

const rand = (min, max) => min + Math.random() * (max - min);
const shuffle = (arr) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/* --- スプライト生成: 白フチ + 落ち影を一度だけ焼き込む --- */

const loadImage = (src) => new Promise((resolve, reject) => {
  const img = new Image();
  if (/^https?:/.test(src)) img.crossOrigin = 'anonymous'; // CMS画像はCanvasで加工するためCORS付きで読む
  img.onload = () => resolve(img);
  img.onerror = reject;
  img.src = src;
});

async function loadArt(item) {
  try {
    const img = await loadImage(item.src); // CMSの絶対URL or ローカル素材のパス
    return trimTransparent(trimWhiteBackground(img));
  } catch {
    return null;
  }
}

/* 透過の余白をトリムして、絵柄ぴったりのcanvasにする。 */
function trimTransparent(art) {
  const w = art.naturalWidth || art.width;
  const h = art.naturalHeight || art.height;
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(art, 0, 0);
  const d = ctx.getImageData(0, 0, w, h).data;

  let minX = w, minY = h, maxX = -1, maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (d[(y * w + x) * 4 + 3] > 8) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return art; // 全透過（ありえないが保険）

  const cw = maxX - minX + 1, ch = maxY - minY + 1;
  if (minX === 0 && minY === 0 && cw === w && ch === h) return c; // 余白なし
  const out = document.createElement('canvas');
  out.width = cw; out.height = ch;
  out.getContext('2d').drawImage(c, minX, minY, cw, ch, 0, 0, cw, ch);
  return out;
}

/* 透過を持たない画像（JPG・白背景PNG）は、外周から繋がる白背景を
 * 透明化して輪郭を作る。透過を持つ画像はそのまま返す。 */
function trimWhiteBackground(img) {
  const w = img.naturalWidth, h = img.naturalHeight;
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0);
  const id = ctx.getImageData(0, 0, w, h);
  const d = id.data;

  // 透過ピクセルが1つでもあれば、切り抜き済みとみなして何もしない
  for (let i = 3; i < d.length; i += 64) {
    if (d[i] < 250) return img;
  }

  const TH = 235; // これよりr,g,bすべて明るければ「背景の白」候補
  const isWhite = (p) => d[p] >= TH && d[p + 1] >= TH && d[p + 2] >= TH;
  const visited = new Uint8Array(w * h);
  const queue = [];
  // 外周の白ピクセルから流し込む（絵柄内部の白は残る）
  for (let x = 0; x < w; x++) { queue.push(x, (h - 1) * w + x); }
  for (let y = 0; y < h; y++) { queue.push(y * w, y * w + w - 1); }
  while (queue.length) {
    const px = queue.pop();
    if (visited[px]) continue;
    visited[px] = 1;
    if (!isWhite(px * 4)) continue;
    d[px * 4 + 3] = 0;
    const x = px % w, y = (px / w) | 0;
    if (x > 0) queue.push(px - 1);
    if (x < w - 1) queue.push(px + 1);
    if (y > 0) queue.push(px - w);
    if (y < h - 1) queue.push(px + w);
  }
  ctx.putImageData(id, 0, 0);
  return c;
}

function makeDiecutSprite(art, artSize) {
  const ART = artSize || 520;       // 絵柄の描画サイズ（長辺）。ロゴ等の大判は高解像度で焼く
  const OUTLINE = ART * 0.045;      // 白フチの太さ
  const PAD = OUTLINE + ART * 0.07; // 白フチ+影のための余白

  const aw = art.naturalWidth || art.width;
  const ah = art.naturalHeight || art.height;
  const ratio = aw / ah;
  const dw = ratio >= 1 ? ART : ART * ratio;
  const dh = ratio >= 1 ? ART / ratio : ART;
  const SW = Math.round(dw + PAD * 2);
  const SH = Math.round(dh + PAD * 2);

  // 1) 絵柄のシルエットを全方向にずらして重ね、白で塗る → 輪郭に沿った白フチ台紙
  const silhouette = document.createElement('canvas');
  silhouette.width = SW; silhouette.height = SH;
  const sctx = silhouette.getContext('2d');
  for (const r of [OUTLINE, OUTLINE * 0.55]) {
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      sctx.drawImage(art, PAD + Math.cos(a) * r, PAD + Math.sin(a) * r, dw, dh);
    }
  }
  sctx.globalCompositeOperation = 'source-in';
  sctx.fillStyle = '#ffffff';
  sctx.fillRect(0, 0, SW, SH);

  // 2) 影付きで台紙を敷き、その上に絵柄を重ねる
  const out = document.createElement('canvas');
  out.width = SW; out.height = SH;
  const ctx = out.getContext('2d');
  // Figmaのeffect style「sticker-ds」準拠: X0 / Y4 / Blur6 / Spread0 / #000 8%
  // （Figma上のステッカー幅324pxを基準に、描画サイズへスケール）
  const FIG = ART / 324;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 4 * FIG;
  ctx.shadowBlur = 6 * FIG;
  ctx.drawImage(silhouette, 0, 0);
  ctx.shadowColor = 'transparent';
  ctx.drawImage(art, PAD, PAD, dw, dh);
  // タグ表示用に、白フチ台紙（silhouette）の外周輪郭もパス化して持たせる
  const outline = traceOutline(silhouette, SW, SH);
  return { url: out.toDataURL('image/png'), w: SW, h: SH, pathD: outline && outlineToPathD(outline) };
}

/* --- 輪郭抽出: タグをステッカーの外周に沿わせるためのパスを作る ---
 * 白フチ台紙のアルファを縮小してMoore境界追跡（radial sweep）し、
 * 平滑化してから法線方向に少し外へオフセットする。人型のような
 * 凹凸のある形でも輪郭をなぞれる */
const TAG_OUTSET = 28; // 輪郭からの外側オフセット（スプライトpx）

function traceOutline(mask, sw, sh) {
  const MAXD = 120;
  const sc = Math.min(1, MAXD / Math.max(sw, sh));
  const w = Math.max(8, Math.round(sw * sc));
  const h = Math.max(8, Math.round(sh * sc));
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const x2 = c.getContext('2d', { willReadFrequently: true });
  x2.drawImage(mask, 0, 0, w, h);
  const a = x2.getImageData(0, 0, w, h).data;
  const solid = (x, y) => x >= 0 && y >= 0 && x < w && y < h && a[(y * w + x) * 4 + 3] > 40;

  let sx = -1, sy = -1;
  outer: for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (solid(x, y)) { sx = x; sy = y; break outer; }
  }
  if (sx < 0) return null;

  // 8近傍（時計回り・左始まり）。直前の空白セルの方向から走査を始める
  const N = [[-1, 0], [-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1]];
  const dirIndex = (dx, dy) => N.findIndex(([x, y]) => x === dx && y === dy);
  let cx = sx, cy = sy;
  let prevX = sx - 1, prevY = sy; // スキャン順の都合で左は必ず空白
  const pts = [];
  for (let step = 0; step < w * h * 3; step++) {
    pts.push([cx, cy]);
    const start = dirIndex(prevX - cx, prevY - cy);
    let moved = false;
    for (let k = 1; k <= 8; k++) {
      const di = (start + k) % 8;
      const nx = cx + N[di][0], ny = cy + N[di][1];
      if (solid(nx, ny)) {
        const pe = (start + k - 1 + 8) % 8; // 直前に調べた空白近傍
        prevX = cx + N[pe][0]; prevY = cy + N[pe][1];
        cx = nx; cy = ny;
        moved = true;
        break;
      }
    }
    if (!moved) break; // 孤立ピクセル
    if (cx === sx && cy === sy && pts.length > 8) break;
  }
  if (pts.length < 12) return null;

  // 間引き → スプライト座標へ → 移動平均で強めに平滑化
  // （急カーブでは textPath の文字が折り重なって読めなくなるため、
  //   細かい凹凸を落として曲率をなだらかにする）
  const smooth = (arr, passes) => {
    let q = arr;
    for (let pass = 0; pass < passes; pass++) {
      q = q.map((_, i) => {
        const a1 = q[(i - 1 + q.length) % q.length];
        const b1 = q[i];
        const c1 = q[(i + 1) % q.length];
        return [(a1[0] + b1[0] + c1[0]) / 3, (a1[1] + b1[1] + c1[1]) / 3];
      });
    }
    return q;
  };
  let p = smooth(pts.filter((_, i) => i % 3 === 0).map(([x, y]) => [x / sc, y / sc]), 4);

  // 時計回りに統一（y下向き座標では符号付き面積が正 = 時計回り）
  let area = 0;
  for (let i = 0; i < p.length; i++) {
    const [x1, y1] = p[i], [x2b, y2b] = p[(i + 1) % p.length];
    area += x1 * y2b - x2b * y1;
  }
  if (area < 0) p.reverse();

  // 上端の点を先頭に（タグが上から読めるように）
  let topI = 0;
  p.forEach(([, y], i) => { if (y < p[topI][1]) topI = i; });
  p = p.slice(topI).concat(p.slice(0, topI));

  // 接線から外向き法線を出してオフセット（時計回りなら (ty, -tx) が外側）
  const off = p.map((pt, i) => {
    const [ax, ay] = p[(i - 1 + p.length) % p.length];
    const [bx, by] = p[(i + 1) % p.length];
    const tx = bx - ax, ty = by - ay;
    const len = Math.hypot(tx, ty) || 1;
    return [pt[0] + (ty / len) * TAG_OUTSET, pt[1] - (tx / len) * TAG_OUTSET];
  });
  return smooth(off, 2); // オフセットで生まれる折れも均す
}

function outlineToPathD(pts) {
  return pts
    .map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join('') + 'Z';
}

const spriteOf = async (item) => {
  const art = await loadArt(item);
  return art && { alt: item.alt, work: item.work, client: item.client, ...makeDiecutSprite(art) };
};

let spritesPromise = null;
function getSprites() {
  spritesPromise ??= Promise.all(STICKERS.map(spriteOf)).then(async (list) => {
    const okList = list.filter(Boolean);
    if (okList.length) return okList;
    // CMS画像が1枚も読めなかった（CORS・リンク切れ等）→ ローカル素材で作り直す
    STICKERS = window.WORKS_FALLBACK.map((w) => stickerOfWork({ ...w, id: w.slug }));
    return (await Promise.all(STICKERS.map(spriteOf))).filter(Boolean);
  });
  return spritesPromise;
}

/* ロゴは Canvas 焼き込みではなく、白い台紙のDOM要素として貼る。
 * （Canvas 系はブラウザ差・画像ロード失敗で丸ごと消えるリスクがあるため。
 *   DOM なら画像が読めなくても白い台紙は必ず中央に出る） */

/* --- 配置: グリッド撒き → 反発シミュレーション ---
 * 壁の全セルにアイテムを撒く（絵柄の重複はOK）。
 * unit ≒ 100%ズーム時のステッカーの標準サイズ。グリッド間隔は
 * unit × PARAMS.gap で決まり、サイズと間隔を独立に調整できる。
 * 反発の停止距離 GAP=0.88 は「隣とわずかに隙間」の下限保証。
 * excl: 中央の「Design & Deploy Partner」の文字を空けておく楕円。
 */
function layoutStickers(W, H, unit, excl) {
  const cell = unit * PARAMS.gap; // グリッド間隔（＝ステッカー間の距離感）
  const cols = Math.max(3, Math.round(W / cell));
  const rows = Math.max(3, Math.round(H / cell));
  const cellW = W / cols;
  const cellH = H / rows;

  // 小さすぎるステッカーは作らず、中〜大の2段階だけにする
  const sizeFactor = () => {
    if (Math.random() < 0.25) return rand(1.3, 1.55); // 大（主役）
    return rand(1.0, 1.24);                            // 中
  };

  // 1) 全セルに撒く（壁の全面カバー）。ジッターで整列感は消す
  const items = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const size = unit * sizeFactor(); // サイズは間隔（gap）と独立
      items.push({
        x: c * cellW + cellW / 2 + rand(-cellW, cellW) * 0.28,
        y: r * cellH + cellH / 2 + rand(-cellH, cellH) * 0.28,
        size,
        minSize: size * 0.92,
      });
    }
  }

  // 2) 反発で押し広げる。均衡点＝隣とわずかに隙間が開いた状態
  const GAP = 0.88;
  for (let it = 0; it < 90; it++) {
    let moved = false;
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const a = items[i], b = items[j];
        const dx = b.x - a.x, dy = b.y - a.y;
        const d = Math.hypot(dx, dy) || 0.01;
        const minD = ((a.size + b.size) / 2) * GAP;
        if (d < minD) {
          const push = (minD - d) / 2;
          a.x -= (dx / d) * push; a.y -= (dy / d) * push;
          b.x += (dx / d) * push; b.y += (dy / d) * push;
          // 3) 押し合いが収束しない密集地帯はサイズを縮めて逃がす
          if (it > 55) {
            a.size = Math.max(a.minSize, a.size * 0.99);
            b.size = Math.max(b.minSize, b.size * 0.99);
          }
          moved = true;
        }
      }
    }
    for (const p of items) {
      // 中央の文字エリア（楕円）から押し出す
      const rx = excl.rx + p.size * 0.45, ry = excl.ry + p.size * 0.45;
      const ex = (p.x - excl.cx) / rx, ey = (p.y - excl.cy) / ry;
      const d = Math.hypot(ex, ey);
      if (d < 1) {
        const f = 1 / (d || 0.001);
        p.x = excl.cx + ex * f * rx;
        p.y = excl.cy + ey * f * ry;
      }
      // 壁の内側にクランプ（端は少しだけ見切れてよい）
      const inset = p.size * 0.42;
      p.x = Math.min(W - inset, Math.max(inset, p.x));
      p.y = Math.min(H - inset, Math.max(inset, p.y));
    }
    if (!moved) break;
  }
  return items;
}

/* 各絵柄を必ず2枚、約半数だけ3枚にして、同一絵柄の出現を2〜3枚に制限する */
function artSequence(sprites) {
  const seq = sprites.flatMap((sprite) => {
    const copies = Math.random() < 0.5 ? 2 : 3;
    return Array.from({ length: copies }, () => sprite);
  });
  return shuffle(seq);
}

/* 表示枚数が少ないほど中央寄りの狭い候補だけを残し、寂しい散らばりを防ぐ。
 * 枚数が増えれば候補数も増えるため、自然に外側へ広がる。 */
function centralSpotPool(candidates, count, focus) {
  const extraSpots = Math.max(6, Math.ceil(Math.sqrt(count) * 1.5));
  const poolSize = Math.min(candidates.length, count + extraSpots);
  return candidates
    .map((p) => ({
      p,
      score: Math.hypot(
        (p.x - focus.cx) / focus.rx,
        (p.y - focus.cy) / focus.ry,
      ) + rand(0, 0.04),
    }))
    .sort((a, b) => a.score - b.score)
    .slice(0, poolSize)
    .map(({ p }) => p);
}

/* 候補の中から、写真と他ステッカーからできるだけ離れた配置点を順に選ぶ */
function selectDistributedSpots(candidates, count, avoid = []) {
  const pool = shuffle(candidates);
  const anchors = avoid.slice();
  const selected = [];

  while (pool.length && selected.length < count) {
    let bestIndex = 0;
    let bestDistance = -1;
    for (let i = 0; i < pool.length; i++) {
      const p = pool[i];
      const nearest = anchors.length
        ? Math.min(...anchors.map((q) => Math.hypot(p.x - q.x, p.y - q.y)))
        : 0;
      if (nearest > bestDistance) {
        bestDistance = nearest;
        bestIndex = i;
      }
    }
    const [picked] = pool.splice(bestIndex, 1);
    selected.push(picked);
    anchors.push(picked);
  }
  return selected;
}

/* 同じ絵柄のコピー同士ができるだけ離れるように、絵柄→スポットを割り当てる。
 * 各絵柄の1枚目はランダムなスポット、2枚目以降は「同じ絵柄の既配置」から
 * 最も遠い残りスポットを選ぶ（他の絵柄との距離は問わない）。 */
function assignArtsToSpots(arts, spots) {
  const remaining = spots.slice();
  const placedByArt = new Map();
  const assignments = [];
  for (const sprite of arts) {
    if (!remaining.length) break;
    const placed = placedByArt.get(sprite) || [];
    let bestI = 0;
    let bestD = -1;
    for (let i = 0; i < remaining.length; i++) {
      const p = remaining[i];
      const d = placed.length
        ? Math.min(...placed.map((q) => Math.hypot(p.x - q.x, p.y - q.y)))
        : rand(0, 1); // 1枚目はランダム選択
      if (d > bestD) { bestD = d; bestI = i; }
    }
    const [spot] = remaining.splice(bestI, 1);
    assignments.push({ sprite, spot });
    placed.push(spot);
    placedByArt.set(sprite, placed);
  }
  return assignments;
}

/* opts.size は長辺のサイズ。スプライトの縦横比に合わせて要素の幅高を決める */
function stickerDims(sprite, size) {
  return sprite.w >= sprite.h
    ? { w: size, h: size * (sprite.h / sprite.w) }
    : { w: size * (sprite.w / sprite.h), h: size };
}

function buildSticker(sprite, opts) {
  const el = document.createElement(opts.href ? 'a' : 'div');
  if (opts.href) el.href = opts.href;
  el.className = 'sticker' + (opts.cls ? ' ' + opts.cls : '');
  el.style.setProperty('--tf', `rotate(${opts.rot}deg)`);
  const { w, h } = stickerDims(sprite, opts.size);
  el.style.width = w + 'px';
  el.style.height = h + 'px';
  el.style.left = opts.x + 'px';
  el.style.top = opts.y + 'px';
  el.style.zIndex = opts.z;

  const img = document.createElement('img');
  img.alt = sprite.alt;
  img.draggable = false;
  img.src = sprite.url;
  el.appendChild(img);

  if (opts.onOpen) {
    el.setAttribute('role', 'button');
    el.tabIndex = 0;
    el.addEventListener('click', opts.onOpen);
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); opts.onOpen(); }
    });
  }

  if (opts.pop) {
    el.style.animationDelay = opts.delay + 's';
    el.classList.add('is-popping');
    el.addEventListener('animationend', () => el.classList.remove('is-popping'), { once: true });
  }

  // 輪郭タグ: hover対応環境ではポインタで個別表示（スマホはランダム表示のみ）
  el._sprite = sprite;
  if (canHoverTags && sprite.pathD) {
    el.addEventListener('pointerenter', () => {
      if (mode !== 'explore') return;
      tagHoverLock = el;
      showTagsFor(el);
    });
    el.addEventListener('pointerleave', () => {
      tagHoverLock = null;
      hideActiveTag();
    });
  }
  return el;
}

function buildPhoto(data, opts) {
  const el = document.createElement('a');
  el.className = 'photo-card';
  el.href = data.href;
  if (data.external) { el.target = '_blank'; el.rel = 'noopener'; }
  el.style.setProperty('--tf', `rotate(${opts.rot}deg)`);
  el.style.width = opts.w + 'px';
  el.style.left = opts.x + 'px';
  el.style.top = opts.y + 'px';
  el.style.zIndex = opts.z;
  el.innerHTML =
    `<span class="photo-img" style="background:${data.bg}"><span class="photo-emoji">${data.emoji}</span></span>` +
    `<span class="photo-cap">${data.cap}${data.external ? ' ↗' : ''}</span>`;
  if (data.img) {
    const img = document.createElement('img');
    img.alt = '';
    img.loading = 'lazy';
    img.draggable = false;
    img.src = data.img;
    img.onerror = () => img.remove(); // 読めなければ絵文字+グラデのまま
    el.querySelector('.photo-img').appendChild(img);
  }
  if (opts.pop) {
    el.style.animationDelay = opts.delay + 's';
    el.classList.add('is-popping');
    el.addEventListener('animationend', () => el.classList.remove('is-popping'), { once: true });
  }
  return el;
}

/* ==========================================================
   ▼ 輪郭タグ: ステッカーの実績情報（クライアント/ジャンル/アウトプット名）を
   「#タグ」として外周に沿ってタイプライター表示する。
   hover時はそのステッカー、非hover時は画面内からランダムに選んで表示。
   hover概念のない環境（スマホ）はランダム表示のみ。
   ========================================================== */

const TAG_FONT_PX = 12;    // 画面上の文字サイズ
const TAG_TYPE_MS = 55;    // タイプライターの1文字間隔
const TAG_HOLD_MS = 3400;  // ランダム表示の維持時間
const TAG_CYCLE_MS = 4800; // ランダム表示の選び直し間隔
const canHoverTags = matchMedia('(hover: hover) and (pointer: fine)').matches;
const tagsReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

let tagSeq = 0;
let activeTag = null;     // { svg, timer }
let tagHoverLock = null;  // hover中のステッカー（ランダム表示を止める）
let lastAmbientEl = null; // 直前にランダム表示したステッカー（連続選択を避ける）
let ambientHoldTimer = 0;

function tagTextOf(sprite) {
  const w = sprite.work || {};
  return [sprite.client, w.kind, w.title].filter(Boolean).map((t) => `#${t}`).join('　');
}

function showTagsFor(el) {
  hideActiveTag();
  const sprite = el._sprite;
  if (!sprite || !sprite.pathD || !el.isConnected) return;

  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('class', 'tag-svg');
  svg.setAttribute('viewBox', `0 0 ${sprite.w} ${sprite.h}`);
  const id = `tag-path-${++tagSeq}`;
  const path = document.createElementNS(ns, 'path');
  path.setAttribute('id', id);
  path.setAttribute('d', sprite.pathD);
  path.setAttribute('fill', 'none');
  // viewBox座標系で描かれるため、表示サイズ比でスケールして画面上12pxに揃える
  const k = sprite.w / (el.offsetWidth || sprite.w);
  // 文字の下に敷くライムの帯。タイプに合わせてダッシュを伸ばす
  path.setAttribute('stroke-width', ((TAG_FONT_PX + 10) * k).toFixed(1));
  const text = document.createElementNS(ns, 'text');
  text.setAttribute('font-size', (TAG_FONT_PX * k).toFixed(1));
  text.setAttribute('dominant-baseline', 'central');
  const tp = document.createElementNS(ns, 'textPath');
  tp.setAttribute('href', `#${id}`);
  tp.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', `#${id}`);
  const pad = 10 * k; // 帯の前後の余白
  text.appendChild(tp);
  svg.appendChild(path);
  svg.appendChild(text);
  el.appendChild(svg);

  const total = path.getTotalLength();
  const full = tagTextOf(sprite);

  // 開始位置をステッカーごとにランダムにする。全文がパス末尾で
  // 見切れない範囲（全文長+前後余白ぶんの残りがある位置）に限定する
  tp.textContent = full;
  const fullLen = text.getComputedTextLength();
  tp.textContent = '';
  const maxStart = total - fullLen - pad * 2;
  const bandStart = maxStart > 0 ? Math.random() * maxStart : 0;
  tp.setAttribute('startOffset', (bandStart + pad).toFixed(1));
  path.setAttribute('stroke-dashoffset', (-bandStart).toFixed(1));

  path.setAttribute('stroke-dasharray', `0 ${total}`);
  const fitBand = () => {
    const len = Math.min(total, text.getComputedTextLength() + pad * 2);
    path.setAttribute('stroke-dasharray', `${len.toFixed(1)} ${total.toFixed(1)}`);
  };
  activeTag = { svg, timer: 0 };
  if (tagsReducedMotion) { tp.textContent = full; fitBand(); return; }
  let i = 0;
  activeTag.timer = setInterval(() => {
    i++;
    tp.textContent = full.slice(0, i);
    fitBand();
    if (i >= full.length) clearInterval(activeTag.timer);
  }, TAG_TYPE_MS);
}

function hideActiveTag() {
  if (!activeTag) return;
  clearInterval(activeTag.timer);
  const { svg } = activeTag;
  svg.classList.add('is-hiding');
  setTimeout(() => svg.remove(), 380);
  activeTag = null;
}

/* 画面（=FVビューポート）に収まって見えているステッカーから1枚選んで表示 */
function ambientTagTick() {
  if (mode !== 'explore' || document.hidden || tagHoverLock) return;
  const hr = hero.getBoundingClientRect();
  if (hr.bottom < 60 || hr.top > innerHeight - 60) return; // FVがほぼ画面外
  // FVビューポート内に6割以上見えているステッカーを候補にする
  // （中央は文字エリアで空くため、端で見切れ気味のステッカーも拾う）
  const vx1 = Math.max(hr.left, 0), vy1 = Math.max(hr.top, 0);
  const vx2 = Math.min(hr.right, innerWidth), vy2 = Math.min(hr.bottom, innerHeight);
  const candidates = [...world.querySelectorAll('.sticker')].filter((s) => {
    if (!s._sprite || !s._sprite.pathD || s === lastAmbientEl) return false;
    const r = s.getBoundingClientRect();
    if (!r.width || !r.height) return false;
    const ix = Math.max(0, Math.min(r.right, vx2) - Math.max(r.left, vx1));
    const iy = Math.max(0, Math.min(r.bottom, vy2) - Math.max(r.top, vy1));
    return (ix * iy) / (r.width * r.height) >= 0.6;
  });
  if (!candidates.length) return;
  const pick = candidates[(Math.random() * candidates.length) | 0];
  lastAmbientEl = pick;
  showTagsFor(pick);
  clearTimeout(ambientHoldTimer);
  ambientHoldTimer = setTimeout(() => { if (!tagHoverLock) hideActiveTag(); }, TAG_HOLD_MS);
}
setInterval(ambientTagTick, TAG_CYCLE_MS);

/* ==========================================================
   ▼ 詳細ドロワー（ステッカー → 記事プレビュー）
   ページ遷移せず右からスライドインし、閉じればすぐFVに戻れる
   ========================================================== */

const drawer = document.getElementById('workDrawer');
let drawerHideTimer = 0;

/* 本文の解決（CMSのbody / 仮原稿）は非同期なので、
 * 連続クリックで前の記事が遅れて差し込まれないよう世代番号で弾く */
let drawerGen = 0;

async function showDrawerBody(work) {
  const body = document.getElementById('drawerBody');
  const note = document.getElementById('drawerNote');
  const credit = document.getElementById('drawerCredit');
  const related = document.getElementById('drawerRelated');
  const grid = document.getElementById('drawerRelatedGrid');
  const gen = ++drawerGen;
  body.innerHTML = '';
  body.hidden = true;
  note.hidden = true;
  credit.innerHTML = '';
  grid.innerHTML = '';
  related.hidden = true;

  const [{ html, isDraft }, extras] = await Promise.all([
    window.workBody(work),
    window.workDrawerExtras(work), // クレジット + Related Works のカード
  ]);
  if (gen !== drawerGen) return; // すでに別の事例が開かれている
  if (html) {
    body.innerHTML = window.workDraftNote(isDraft) + html; // 自社CMSの入稿HTMLをそのまま流し込む
    body.hidden = false;
  } else {
    note.hidden = false;
  }
  credit.innerHTML = extras.credit;
  extras.cards.forEach((card) => grid.appendChild(card));
  related.hidden = false; // 事例ページへのボタンがあるので、関連が0件でも帯は出す
}

function openModal(work, imgURL, client) {
  clearTimeout(drawerHideTimer);
  document.getElementById('drawerImg').src = imgURL;
  document.getElementById('drawerImg').alt = work.title;
  document.getElementById('drawerTitle').textContent = work.title;
  const desc = document.getElementById('drawerDesc');
  desc.textContent = work.desc || '';
  desc.hidden = !work.desc;
  // 事例ページが無い仮のステッカー（genericWork）は WORKS一覧へ案内する
  const pageLink = document.getElementById('drawerPageLink');
  pageLink.href = work.slug ? window.workURL(work) : './works/';
  pageLink.querySelector('span').textContent = work.slug ? 'この事例のページを開く' : 'WORKS一覧を見る';
  showDrawerBody(work); // 記事本文（事例ページと同じ内容）
  // タグは作品詳細ページと同じ「#クライアント #ジャンル」
  const tags = document.getElementById('drawerTags');
  tags.innerHTML = '';
  [client, work.kind].filter(Boolean).forEach((t) => {
    const li = document.createElement('li');
    li.textContent = `#${t}`;
    tags.appendChild(li);
  });
  drawer.hidden = false;
  drawer.querySelector('.work-drawer-panel').scrollTop = 0; // 前に開いた記事の位置を持ち越さない
  // 作品画像はステッカーを貼るモーションで出す（事例を切り替えるたびに再生）
  const visual = drawer.querySelector('.wd-visual');
  visual.classList.remove('is-pasting');
  void visual.offsetWidth;
  visual.classList.add('is-pasting');
  // 記事を読んでいる間はページを動かさない（スクロールヒントも背面スクロールも止める）
  cancelPeek();
  document.body.classList.add('drawer-open');
  void drawer.offsetWidth; // hidden解除をこのフレームで確定させ、スライドインを効かせる
  drawer.classList.add('is-open');
}
function closeModal() {
  document.body.classList.remove('drawer-open');
  drawer.classList.remove('is-open');
  drawerHideTimer = setTimeout(() => { drawer.hidden = true; }, 420); // スライドアウトを待つ
}

drawer.addEventListener('click', (e) => {
  if (e.target.closest('[data-close]')) closeModal();
});

/* 関連する事例は、事例ページへ飛ばずにドロワーの中身を差し替える
 * （FVの壁の位置を保ったまま次の事例へ移れる）。
 * 中クリック・⌘/Ctrl+クリックは通常どおり別タブで事例ページを開かせる */
drawer.addEventListener('click', async (e) => {
  const a = e.target.closest('#drawerRelatedGrid .work-card');
  if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
  e.preventDefault();
  // 恒久URL（/works/<slug>/）から slug を取る。旧URL（?id=…）も後方互換で読む
  const url = new URL(a.href, location.href);
  const m = url.pathname.match(/\/works\/([^/]+)\/?$/);
  const id = m ? decodeURIComponent(m[1]) : url.searchParams.get('id');
  const works = await window.getWorks();
  const w = works.find((x) => x.id === id || x.slug === id);
  if (!w) { location.href = a.href; return; } // 見つからなければ素直に遷移
  // 壁に貼ってあるステッカー（白フチ入りの加工済み画像）があればそれを使う
  const sprite = (await getSprites()).find((s) => s.work && s.work.slug === w.slug);
  openModal(
    { kind: w.kind, title: w.title, desc: w.description, slug: w.slug, body: w.body },
    sprite ? sprite.url : w.image,
    w.client,
  );
});
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !drawer.hidden) closeModal();
});

/* ==========================================================
   ▼ カメラ（回遊）: world を translate+scale して壁の上を動き回る
   ========================================================== */

let vw = 0, vh = 0, worldW = 0, worldH = 0;

/* --- 配置・カメラの調整パラメータ ---
 * URLに ?tune を付けるとスライダーで live 調整できる（localStorageに保存され、
 * 以降は ?tune なしでもその値で表示。リセットボタンで初期値に戻る）。 */
const DEFAULT_PARAMS = {
  world: 3.9,     // 壁の広さ = ビューポートの何倍四方を探索できるか
  size: 1.2,      // ステッカーの大きさ倍率
  gap: 1.05,      // ステッカー間隔（1でほぼ密着・1未満で重なる）
  introView: 1.6, // 引きのカメラで見える範囲（ビューポート比）。壁全体は見せなくてよい
  fvBg: '#ececec',          // FVの背景色（本番デフォルト: ライトグレー）
  fvTexture: 'halftone',    // FVのテクスチャ（本番デフォルト: アナログハーフトーン）
  fvTexColor: '#dff5f7',    // テクスチャの色（方眼の線・ドット等。halftoneでは無効）
  fvTexSize: 24,            // テクスチャの細かさ（px。halftoneではタイル幅の倍率）
};
let PARAMS = { ...DEFAULT_PARAMS };
try { Object.assign(PARAMS, JSON.parse(localStorage.getItem('sh-tune')) || {}); } catch { /* 保存なし */ }
// 2026-08: FV中央の差し替えに合わせてステッカー密度を一段上げる。
// チューニング済みの保存値がある場合のみ、一度だけ相対的に詰める
try {
  const raw = localStorage.getItem('sh-tune');
  const stored = raw ? JSON.parse(raw) : null;
  if (stored && !stored.dense1Migrated) {
    if (stored.gap != null) stored.gap = Math.max(0.85, Math.round(stored.gap * 0.85 * 100) / 100);
    stored.dense1Migrated = 1;
    localStorage.setItem('sh-tune', JSON.stringify(stored));
    Object.assign(PARAMS, stored);
  }
} catch { /* 保存なし */ }
// 2026-08: FVデフォルトをアナログハーフトーンに変更。
// 保存済みの旧テクスチャ設定を一度だけ新デフォルトへ移行する（他のチューニング値は維持）
try {
  const stored = JSON.parse(localStorage.getItem('sh-tune')) || {};
  if (!stored.htMigrated) {
    stored.fvTexture = DEFAULT_PARAMS.fvTexture;
    stored.fvBg = DEFAULT_PARAMS.fvBg;
    stored.fvTexSize = DEFAULT_PARAMS.fvTexSize;
    stored.htMigrated = 1;
    localStorage.setItem('sh-tune', JSON.stringify(stored));
    Object.assign(PARAMS, stored);
  }
} catch { /* 保存なし */ }
PARAMS.size = Math.max(0.95, PARAMS.size);
// 旧パラメータ（fvGrid: 0/1）からの引き継ぎ
if (PARAMS.fvGrid === 1 && !('fvTexture' in (JSON.parse(localStorage.getItem('sh-tune') || '{}')))) {
  PARAMS.fvTexture = 'grid';
}
delete PARAMS.fvGrid;

/* FVの背景テクスチャ: 色(c)とサイズ(s)を受け取り、
 * background-image / background-size を返す。すべてCSSグラデーション
 * （＋SVGノイズ）で生成し、画像ファイルは使わない */
const FV_TEXTURES = {
  none:  { label: 'なし', css: () => ({ image: 'none', size: 'auto' }) },
  halftone: { label: 'ハーフトーン（アナログ紙）', css: (c, s) => ({
    // 印刷の網点をスキャンしたようなノイズ画像タイル。色は画像に焼き込み済みでcは無効。
    // s(px)はタイル表示幅の係数: デフォルト24 → PC 720px / スマホ 408px で敷き詰め
    // （スマホで720pxのままだとドットが大きすぎるため画面幅に合わせて縮める）
    image: 'url("./assets/texture-halftone.png")',
    size: `${Math.round(s * (matchMedia('(max-width: 640px)').matches ? 17 : 30))}px auto` }) },
  grid:  { label: '方眼', css: (c, s) => ({
    image: `linear-gradient(${c} 1px, transparent 1px), linear-gradient(90deg, ${c} 1px, transparent 1px)`,
    size: `${s}px ${s}px` }) },
  dots:  { label: 'ドット', css: (c, s) => ({
    image: `radial-gradient(${c} 1.5px, transparent 1.6px)`,
    size: `${s}px ${s}px` }) },
  lines: { label: '横罫線（ノート）', css: (c, s) => ({
    image: `linear-gradient(${c} 1px, transparent 1px)`,
    size: `100% ${s}px` }) },
  diag:  { label: '斜めストライプ', css: (c, s) => ({
    image: `repeating-linear-gradient(45deg, ${c} 0, ${c} 1px, transparent 1px, transparent ${s}px)`,
    size: 'auto' }) },
  paper: { label: '紙（ノイズ）', css: () => ({
    image: `url("data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.06 0"/></filter><rect width="180" height="180" filter="url(#n)"/></svg>')}")`,
    size: '180px 180px' }) },
};

/* FVの背景色・テクスチャをCSS変数へ反映（再ビルド不要・即時反映） */
function applyFvParams() {
  const root = document.documentElement.style;
  root.setProperty('--fv-bg', PARAMS.fvBg);
  const tex = FV_TEXTURES[PARAMS.fvTexture] || FV_TEXTURES.none;
  const { image, size } = tex.css(PARAMS.fvTexColor, PARAMS.fvTexSize);
  root.setProperty('--fv-texture', image);
  root.setProperty('--fv-texture-size', size);
}
applyFvParams();

const cam = { cx: 0, cy: 0, s: 1 };      // (cx,cy)=ビューポート中央に映る壁上の点

function applyCam() {
  const tx = vw / 2 - cam.cx * cam.s;
  const ty = vh / 2 - cam.cy * cam.s;
  world.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${cam.s})`;
}
function clampCam() {
  const hw = vw / (2 * cam.s), hh = vh / (2 * cam.s);
  cam.cx = Math.min(worldW - hw, Math.max(hw, cam.cx));
  cam.cy = Math.min(worldH - hh, Math.max(hh, cam.cy));
}

/* --- パン操作（ドラッグ / ホイール） --- */

let mode = 'loading'; // 'loading' | 'intro' | 'zooming' | 'explore'
let pdown = null;
let didDrag = false;

hero.addEventListener('pointerdown', (e) => {
  if (mode === 'intro' || mode === 'zooming') { skipIntro(); return; }
  if (mode !== 'explore' || e.button !== 0) return;
  pdown = { x: e.clientX, y: e.clientY, cx: cam.cx, cy: cam.cy, id: e.pointerId };
  didDrag = false;
});
window.addEventListener('pointermove', (e) => {
  if (!pdown || e.pointerId !== pdown.id) return;
  const dx = e.clientX - pdown.x, dy = e.clientY - pdown.y;
  if (!didDrag && Math.hypot(dx, dy) > 6) {
    didDrag = true;
    hero.classList.add('is-panning');
  }
  if (didDrag) {
    cam.cx = pdown.cx - dx / cam.s;
    cam.cy = pdown.cy - dy / cam.s;
    clampCam();
    applyCam();
  }
});
const endPan = (e) => {
  if (!pdown || e.pointerId !== pdown.id) return;
  pdown = null;
  hero.classList.remove('is-panning');
};
window.addEventListener('pointerup', endPan);
// 縦スワイプをブラウザがページスクロールに引き取った時（下の is-scrolled 参照）
window.addEventListener('pointercancel', endPan);
// ドラッグ直後の click は「クリック」として扱わない（リンク遷移・ポップアップを抑止）
window.addEventListener('click', (e) => {
  if (didDrag) {
    e.preventDefault();
    e.stopPropagation();
    didDrag = false;
  }
}, true);

/* ホイール/トラックパッドはページスクロールに使う（壁のパンはドラッグ専用）。
 * 「scrollで本編に行ける」を分かりやすくするため、壁はホイールを奪わない。 */

/* ==========================================================
   ▼ イントロ → 回遊 の進行
   ========================================================== */

const timers = [];
const later = (fn, ms) => timers.push(setTimeout(fn, ms));
const clearTimers = () => { timers.forEach(clearTimeout); timers.length = 0; };

let logoPlaced = false;

function placeLogo(pop) {
  // 2026-08: 中央のロゴは world-center 内の固定表示（fv-catchcopy.png + fv-logo.svg）に
  // 置き換えたため、白台紙ステッカーは貼らない。イントロ進行からの呼び出し互換のため
  // 関数だけ残している（LOGO 定数も同様に未使用）。
  if (logoPlaced) return;
  logoPlaced = true;
}

function startZoom() {
  mode = 'zooming';
  world.classList.add('is-zooming');
  // rAF はタブ非表示時に発火しないため使わない。リフローで
  // クラス変更（transition有効化）を確定させてから transform を変える
  void world.offsetWidth;
  cam.s = 1;
  clampCam();
  applyCam();
  later(finishZoom, 1550); // CSS transition 1.45s + 余裕
}

async function finishZoom() {
  world.classList.remove('is-zooming');
  await placeLogo(true);
  later(enableExplore, 550);
}

function enableExplore() {
  mode = 'explore';
  hero.classList.remove('is-intro');
  hero.classList.add('can-pan');
  setTimeout(ambientTagTick, 1600); // 回遊が始まったら輪郭タグのランダム表示も開始
}

async function skipIntro() {
  clearTimers();
  world.classList.remove('is-zooming');
  world.style.transition = 'none';
  cam.s = 1;
  cam.cx = worldW / 2;
  cam.cy = worldH / 2;
  clampCam();
  applyCam();
  void world.offsetWidth; // transition:none をこのフレームで確定させる
  world.style.transition = '';
  await placeLogo(false);
  enableExplore();
}

async function build({ intro }) {
  world.querySelectorAll('.sticker, .photo-card').forEach((el) => el.remove());
  logoPlaced = false;
  hideActiveTag();
  tagHoverLock = null;
  lastAmbientEl = null;
  clearTimers();

  vw = hero.clientWidth || window.innerWidth;
  vh = hero.clientHeight || window.innerHeight;
  worldW = Math.round(vw * PARAMS.world);
  worldH = Math.round(vh * PARAMS.world);
  world.style.width = worldW + 'px';
  world.style.height = worldH + 'px';

  // カメラはスプライト生成（重い・数秒かかる）を待たずに先に構える。
  // 後回しにすると、ロード中に「未初期化の壁」（左上に巨大な文字）が見えてしまう
  mode = 'loading';
  cam.cx = worldW / 2;
  cam.cy = worldH / 2;
  if (intro) {
    hero.classList.add('is-intro');
    hero.classList.remove('can-pan');
    // 引きの画: 中央の introView×ビューポート分だけ見せる（壁全体は見せなくてよい）
    cam.s = Math.max(vw / worldW, 1 / PARAMS.introView);
  } else {
    cam.s = 1;
  }
  applyCam();

  const sprites = await getSprites();

  // 中央の文字エリアを空けて、壁の全面にステッカー + 写真を撒く
  const base = vw < 560 ? 150 : vw < 900 ? 190 : 235;
  const unit = base * PARAMS.size;
  const excl = { cx: worldW / 2, cy: worldH / 2, rx: vw * 0.40, ry: vh * 0.28 };
  const spots = layoutStickers(worldW, worldH, unit, excl);

  // 写真のスポットは互いに離れた場所を選ぶ（足りなければ余りから充当）
  const minPhotoDist = Math.min(worldW, worldH) / 3.5;
  const photoSpots = [];
  const shuffled = shuffle(spots);
  for (const p of shuffled) {
    if (photoSpots.length >= PHOTOS.length) break;
    if (photoSpots.every((q) => Math.hypot(p.x - q.x, p.y - q.y) >= minPhotoDist)) {
      photoSpots.push(p);
    }
  }
  for (const p of shuffled) {
    if (photoSpots.length >= PHOTOS.length) break;
    if (!photoSpots.includes(p)) photoSpots.push(p);
  }
  const availableStickerSpots = spots.filter((p) => !photoSpots.includes(p));
  const arts = artSequence(sprites);
  const centralStickerSpots = centralSpotPool(availableStickerSpots, arts.length, {
    cx: worldW / 2,
    cy: worldH / 2,
    rx: vw,
    ry: vh,
  });
  const stickerSpots = selectDistributedSpots(centralStickerSpots, arts.length, photoSpots);
  const total = stickerSpots.length + photoSpots.length;

  // 貼られる順番: 全アイテムをシャッフルして、順番に（＝ランダムな順で）ペタペタ
  const PASTE_SEC = 1.9;
  const order = shuffle([...Array(total).keys()]);
  const delayOf = (i) => (order[i] / total) * PASTE_SEC;
  const zOrder = shuffle([...Array(total).keys()]);

  // 同じ絵柄が近くに固まらないよう、絵柄→スポットを距離最大化で割り当てる
  const assignments = assignArtsToSpots(arts, stickerSpots);
  assignments.forEach(({ sprite, spot: p }, i) => {
    const { w, h } = stickerDims(sprite, p.size);
    world.appendChild(buildSticker(sprite, {
      rot: rand(-16, 16),
      size: p.size,
      x: p.x - w / 2,
      y: p.y - h / 2,
      z: zOrder[i] + 1,
      pop: intro,
      delay: delayOf(i),
      onOpen: () => openModal(sprite.work || genericWork(sprite.alt), sprite.url, sprite.client),
    }));
  });

  photoSpots.forEach((p, i) => {
    const w = p.size * 1.15;
    world.appendChild(buildPhoto(PHOTOS[i % PHOTOS.length], {
      rot: rand(-7, 7),
      w,
      x: p.x - w / 2,
      y: p.y - w * 0.62,
      z: zOrder[stickerSpots.length + i] + 1,
      pop: intro,
      delay: delayOf(stickerSpots.length + i),
    }));
  });

  if (!intro) {
    placeLogo(false);
    enableExplore();
    return;
  }

  mode = 'intro';
  later(startZoom, 300 + PASTE_SEC * 1000); // 貼り終わりを見せてからズーム
}

/* ==========================================================
   ▼ スクロールヒント: FVで回遊し続けて一定時間スクロールがない人に、
   「ニュイ〜…スポン！」とページを少し覗かせて下にコンテンツが
   あることを知らせる。ユーザーが自分でスクロールして下を見つけたら
   （半画面以上）そのセッションでは二度と出さない。
   ========================================================== */

const PEEK_IDLE_MS = 24000; // 無スクロールでヒントを出すまでの時間
const PEEK_DIST = 190;      // 覗かせる量(px)
const PEEK_MAX_PLAYS = 2;   // 1ページ表示あたりの最大再生回数
let peekTimer = 0;
let peekRaf = 0;
let peeking = false;
let peekPlays = 0;
let contentDiscovered = false;

function armPeek() {
  clearTimeout(peekTimer);
  if (contentDiscovered || peekPlays >= PEEK_MAX_PLAYS) return;
  peekTimer = setTimeout(tryPeek, PEEK_IDLE_MS);
}

function tryPeek() {
  // 回遊モードで・ページ先頭にいて・ドラッグ中でない時だけ。条件が揃わなければ待ち直す
  // （ドロワーで記事を読んでいる間は絶対に動かさない）
  if (contentDiscovered || peeking || document.hidden || mode !== 'explore' ||
      pdown || window.scrollY > 4 || !drawer.hidden ||
      matchMedia('(prefers-reduced-motion: reduce)').matches) {
    armPeek();
    return;
  }
  peeking = true;

  // ニュイ〜（ゆっくり伸びる）→ ため → スポン！（勢いよく戻って小さくバウンド）
  const D1 = 900, HOLD = 140, D2 = 260, B = 240;
  const total = D1 + HOLD + D2 + B;
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const start = performance.now();

  const frame = (now) => {
    if (!peeking) return; // ユーザー操作でキャンセル済み
    const t = now - start;
    let y;
    if (t < D1) {
      y = PEEK_DIST * easeInOut(t / D1);
    } else if (t < D1 + HOLD) {
      y = PEEK_DIST;
    } else if (t < D1 + HOLD + D2) {
      const u = (t - D1 - HOLD) / D2;
      y = PEEK_DIST * (1 - u * u); // 加速して戻る
    } else if (t < total) {
      const u = (t - D1 - HOLD - D2) / B;
      y = 14 * Math.sin(u * Math.PI) * (1 - u); // 上端で小さくバウンド
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
      peeking = false;
      peekPlays++;
      armPeek(); // まだ見つけてもらえなければ、上限回数までもう一度だけ
      return;
    }
    window.scrollTo({ top: Math.max(0, y), behavior: 'instant' });
    peekRaf = requestAnimationFrame(frame);
  };
  peekRaf = requestAnimationFrame(frame);
}

function cancelPeek() {
  if (!peeking) return;
  peeking = false;
  cancelAnimationFrame(peekRaf);
  armPeek();
}

// ユーザー操作が入ったらヒントは即中断（スクロール位置はユーザーに委ねる）
['wheel', 'touchstart', 'pointerdown', 'keydown'].forEach((ev) =>
  addEventListener(ev, cancelPeek, { passive: true, capture: true }));

// FVは指のドラッグ＝壁のパン（touch-action: none）。ただしページ先頭から離れている間は
// 縦スワイプをページスクロールに回す。本編から上に戻ってFVが画面に入った時に、
// FVに触れた指でスクロールが止まって「そこから動けない」状態になるのを防ぐ
const syncHeroTouch = () => hero.classList.toggle('is-scrolled', window.scrollY > 0);
addEventListener('scroll', syncHeroTouch, { passive: true });
syncHeroTouch();

addEventListener('scroll', () => {
  if (peeking) return; // ヒント自身のスクロールは無視
  if (window.scrollY > 100) {
    contentDiscovered = true; // 一度でもFVから下へスクロールしたら、以後は出さない
    clearTimeout(peekTimer);
  } else {
    armPeek(); // FV内の小さな揺れはアイドル計測をやり直すだけ
  }
}, { passive: true });

armPeek();

/* ==========================================================
   ▼ 調整デモ: URLに ?tune を付けるとスライダーが出る
   （値は localStorage に保存。リセットで初期値に戻る）
   ========================================================== */

function initTunePanel() {
  if (!/[?&]tune\b/.test(location.search)) return;
  const DEFS = [
    ['world', '壁の広さ（探索範囲）', 1.5, 6, 0.1],
    ['size', 'ステッカーの大きさ', 0.95, 2.5, 0.05],
    ['gap', 'ステッカーの間隔', 0.8, 2.5, 0.05],
    ['introView', '引きで見える範囲', 1.2, 6, 0.1],
  ];
  const panel = document.createElement('div');
  panel.className = 'tune-panel';
  panel.innerHTML =
    '<strong>配置の調整デモ</strong>' +
    DEFS.map(([k, label]) =>
      `<label>${label}<output id="tune-${k}"></output><input type="range" data-key="${k}" /></label>`
    ).join('') +
    '<label>FVの背景色<input type="color" data-key="fvBg" /></label>' +
    '<label>テクスチャ<select data-key="fvTexture">' +
      Object.entries(FV_TEXTURES).map(([k, t]) => `<option value="${k}">${t.label}</option>`).join('') +
    '</select></label>' +
    '<label>テクスチャの色<input type="color" data-key="fvTexColor" /></label>' +
    '<label>テクスチャの細かさ<output id="tune-fvTexSize"></output><input type="range" data-key="fvTexSize" min="8" max="64" step="1" /></label>' +
    '<div class="tune-actions">' +
    '<button type="button" data-act="intro">イントロ再生</button>' +
    '<button type="button" data-act="reset">リセット</button></div>';
  document.body.appendChild(panel);

  DEFS.forEach(([k, , min, max, step]) => {
    Object.assign(panel.querySelector(`[data-key="${k}"]`), { min, max, step });
  });
  const sync = () => {
    DEFS.forEach(([k]) => {
      panel.querySelector(`[data-key="${k}"]`).value = PARAMS[k];
      panel.querySelector(`#tune-${k}`).textContent = '×' + Number(PARAMS[k]).toFixed(2);
    });
    panel.querySelector('[data-key="fvBg"]').value = PARAMS.fvBg;
    panel.querySelector('[data-key="fvTexture"]').value = PARAMS.fvTexture;
    panel.querySelector('[data-key="fvTexColor"]').value = PARAMS.fvTexColor;
    panel.querySelector('[data-key="fvTexSize"]').value = PARAMS.fvTexSize;
    panel.querySelector('#tune-fvTexSize').textContent = PARAMS.fvTexSize + 'px';
  };
  sync();

  let debounce;
  panel.addEventListener('input', (e) => {
    const k = e.target.dataset.key;
    if (!k) return;
    if (k === 'fvBg' || k === 'fvTexture' || k === 'fvTexColor') {
      PARAMS[k] = e.target.value;
    } else {
      PARAMS[k] = +e.target.value;
    }
    localStorage.setItem('sh-tune', JSON.stringify(PARAMS));
    sync();
    if (k.startsWith('fv')) { applyFvParams(); return; } // 背景系は再ビルド不要
    clearTimeout(debounce);
    debounce = setTimeout(() => build({ intro: false }), 250);
  });
  panel.addEventListener('click', (e) => {
    const act = e.target.dataset.act;
    if (act === 'intro') build({ intro: true });
    if (act === 'reset') {
      PARAMS = { ...DEFAULT_PARAMS };
      localStorage.removeItem('sh-tune');
      sync();
      applyFvParams();
      build({ intro: false });
    }
  });
}

initTunePanel();

/* ==========================================================
   ▼ microCMS連携: 事例（works）をFVステッカーに反映。
   取得は site.js の window.getWorks()（カード一覧・フッターと共用・1回だけ）。
   未設定・取得失敗時はフォールバックデータのまま動く。
   APIスキーマと設定手順は CMS-SETUP.md を参照。
   ========================================================== */

async function loadCMSContent() {
  // works → FVステッカー（タグ・ドロワーの中身・詳細ページへのリンクもここから）。
  // 画像の当てが無い事例（CMSに画像が無く、ローカル素材とも紐付かない）は
  // ステッカーにできないので壁には出さない（カード一覧には出る）
  const works = await window.getWorks();
  STICKERS = works.filter((w) => w.image).map(stickerOfWork);

  // 壁の写真のうち自社事例のもの（href: './works.html'）は、
  // キャプションと同名の事例ページへ送る。該当が無ければWORKs一覧へ
  const byTitle = new Map(works.map((w) => [w.title, w]));
  PHOTOS.forEach((p) => {
    if (p.href !== './works.html') return;
    const w = byTitle.get(p.cap);
    p.href = w ? window.workURL(w) : './index.html#works';
  });
}

/* ==========================================================
   ▼ ニュースレター: Substack のRSSから自動取得して電光掲示板を更新。
   手動更新は不要。タイトルクリックで該当記事へ飛ぶ。
   SubstackはCORS未対応のため、直接fetchが弾かれたら読み取り専用
   プロキシ(allorigins)経由で再試行。全滅時はHTMLの仮タイトルのまま。
   ========================================================== */

const SUBSTACK_URL = 'https://substack.studioholiday.jp/';

async function fetchSubstackPosts() {
  const get = async (url) => {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 6000);
    try {
      const res = await fetch(url, { signal: ctl.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res;
    } finally {
      clearTimeout(timer);
    }
  };

  // 1) GitHub Actionsが日次生成する data/newsletter.json（同一オリジンなので最も確実）
  try {
    const posts = (await (await get('./data/newsletter.json')).json()).posts;
    if (posts && posts.length) return posts.slice(0, 10);
  } catch { /* 次の手段へ */ }

  // 2) フィードを直接取得（SubstackがCORSを許可した場合に将来有効になる保険）
  try {
    const xml = await (await get(`${SUBSTACK_URL}feed`)).text();
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    const posts = [...doc.querySelectorAll('item')]
      .map((item) => ({
        title: item.querySelector('title')?.textContent.trim() || '',
        url: item.querySelector('link')?.textContent.trim() || SUBSTACK_URL,
      }))
      .filter((p) => p.title);
    if (posts.length) return posts.slice(0, 10);
  } catch (e) {
    console.warn('[substack] フィード取得に失敗。仮タイトルのまま表示します:', e);
  }
  return null;
}

async function applySubstackTicker() {
  const posts = await fetchSubstackPosts();
  if (!posts) return;
  document.querySelectorAll('.ticker-set').forEach((set, i) => {
    set.innerHTML = '';
    posts.forEach((p) => {
      const a = document.createElement('a');
      a.href = p.url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = p.title;
      if (i > 0) a.tabIndex = -1; // 2セット目はループ用の複製なのでフォーカス対象外
      set.appendChild(a);
    });
  });
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
loadCMSContent().finally(() => {
  build({ intro: !reducedMotion }).then(() => {
    if (reducedMotion) skipIntro();
  });
});
applySubstackTicker(); // 壁の構築とは独立に、取得でき次第差し替える

// 壁の作り直しは「FVの実寸が変わった時」だけ（回転・ウィンドウ幅の変更など）。
// スマホはスクロールでアドレスバーが伸縮するたびに resize が飛ぶが、FVは 100svh で
// 高さが変わらないので作り直さない（毎回作り直すと、本編をスクロール中に70枚の
// ステッカーを消して貼り直す重い処理が走り、スクロールが引っかかっていた）
let builtSize = `${hero.clientWidth}x${hero.clientHeight}`;
window.addEventListener('resize', () => {
  clearTimeout(window.__rz);
  window.__rz = setTimeout(() => {
    const size = `${hero.clientWidth}x${hero.clientHeight}`;
    if (size === builtSize) return;
    builtSize = size;
    applyFvParams(); // モバイル/PCでハーフトーンのタイル幅が変わるため再適用
    build({ intro: false });
  }, 200);
});
