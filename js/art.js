/* art.js — วาดภาพพิกเซลทั้งหมดด้วยโค้ด (ไม่ต้องใช้ไฟล์รูป) */
(function (g) {
'use strict';
const DK = '#2b1d22', KR = '#c98a4b', KL = '#e8b872';
const COL = { E: '#2f6fe0', R: '#e8384f', N: '#f2c61f' }, COLD = { E: '#1f4fb0', R: '#b5233b', N: '#b88a00' }, LIT = { E: '#6ea0ff', R: '#ff8a98', N: '#ffe680' }, ACC = { E: '#ff9a2e', R: '#e8384f', N: '#f2c61f' };   /* ACC = สีส้มของ EMS */
const CAPC = ['#ffd23f', '#4aa3df', '#5cc26f', '#ff8fb3'], PSK = ['#ffd9b3', '#f2b48c', '#c98a63', '#ffe3c9'], PHR = ['#3b2a2f', '#7a4b2a', '#222', '#d9a066'];
const CUS = [
  { s: '#ffd9b3', h: '#3b2a2f', u: '#6db3f2', a: 'glasses' }, { s: '#f2b48c', h: '#7a4b2a', u: '#f2c94c', a: 'cap' },
  { s: '#c98a63', h: '#222', u: '#b78be8', a: 'bow' }, { s: '#8a5a3b', h: '#3b2a2f', u: '#78c98a', a: '' },
  { s: '#ffe3c9', h: '#d9a066', u: '#f29bb8', a: 'hat' }, { s: '#f2b48c', h: '#666', u: '#ff9f5a', a: 'glasses' }];
const F = { M: [5, 7, 7, 5, 5], S: [7, 4, 7, 1, 7], E: [7, 4, 6, 4, 7], R: [6, 5, 6, 5, 5], N: [5, 7, 7, 5, 5], 0: [7, 5, 5, 5, 7], 1: [2, 6, 2, 2, 7], 2: [7, 1, 7, 4, 7], 3: [7, 1, 7, 1, 7], 4: [5, 5, 7, 1, 1], 5: [7, 4, 7, 1, 7], 6: [7, 4, 7, 5, 7], 7: [7, 1, 1, 1, 1], 8: [7, 5, 7, 5, 7], 9: [7, 5, 7, 1, 7] };
const HEART = ['.XX.XX.', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...'], ANG = ['X.....X', '.X...X.', '..X.X..', '...X...', '..X.X..', '.X...X.', 'X.....X'];
const ARR = ['XXXXXXX', '.XXXXX.', '..XXX..', '...X...'];
let cx, bg;
const R = (x, y, w, h, c) => { cx.fillStyle = c; cx.fillRect(Math.round(x), Math.round(y), w, h); };
let OLC = DK;   /* สีเส้นขอบ (ตัวเงาใช้สีอื่น) */
const OL = (x, y, w, h, c, l) => { R(x - 1, y - 1, w + 2, h + 2, l || OLC); R(x, y, w, h, c); };
const glyph = (ch, x, y, c) => F[ch].forEach((r, j) => { for (let b = 0; b < 3; b++) if ((r >> (2 - b)) & 1) R(x + b, y + j, 1, 1, c); });
const bmp = (rows, x, y, c) => rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) if (r[i] === 'X') R(x + i, y + j, 1, 1, c); });
const SH = 'rgba(0,0,0,.15)';

/* ---------- ไอเทม ---------- */
function item(x, y, t) {
  x = Math.round(x); y = Math.round(y);
  if (t === 'B') {
    OL(x - 8, y - 6, 6, 3, KL); OL(x + 2, y - 6, 6, 3, KL); OL(x - 6, y - 3, 12, 9, KR); R(x - 5, y - 2, 10, 2, KL);
    R(x - 3, y, 1, 2, DK); R(x + 2, y, 1, 2, DK); R(x - 1, y + 3, 2, 1, '#b5233b'); R(x - 5, y + 2, 2, 1, '#ff9aa8'); R(x + 3, y + 2, 2, 1, '#ff9aa8');
  } else if (t === 'E' || t === 'R' || t === 'N') {
    if (t === 'E') {   /* กล่อง EMS: กล่องกว้างขึ้นนิด เขียนคำว่า EMS ตรง ๆ */
      OL(x - 8, y - 4, 16, 10, COL.E); R(x - 8, y - 4, 16, 3, ACC.E); R(x - 8, y + 4, 16, 2, COLD.E); R(x - 8, y - 2, 16, 6, '#fff');
      const E5 = ['XXX', 'X..', 'XX.', 'X..', 'XXX'], M5 = ['X...X', 'XX.XX', 'X.X.X', 'X...X', 'X...X'], S5 = ['XXX', 'X..', 'XXX', '..X', 'XXX'];
      bmp(E5.map((r, j) => r + '.' + M5[j] + '.' + S5[j]), x - 6, y - 1, COL.E);
      R(x - 8, y - 4, 1, 10, ACC.E); R(x + 7, y - 4, 1, 10, ACC.E);
    } else {
      OL(x - 6, y - 4, 12, 10, COL[t]); R(x - 6, y - 4, 12, 3, LIT[t]); R(x - 6, y + 3, 12, 3, COLD[t]); R(x - 4, y - 2, 8, 7, '#fff');
      if (t === 'N') bmp(['X...X', 'XX..X', 'X.X.X', 'X..XX', 'X...X'], x - 3, y - 1, COLD.N); else glyph(t, x - 1, y - 1, COL[t]);
    }
  } else {
    const T = t.toUpperCase();
    OL(x - 3, y - 8, 6, 4, ACC[T]); OL(x - 6, y - 4, 12, 10, COL[T]); R(x - 6, y + 3, 12, 3, T === 'E' ? ACC.E : COLD[T]); R(x - 3, y - 2, 6, 6, '#fff'); glyph(T, x - 1, y - 1, T === 'N' ? COLD.N : COL[T]);
  }
}
/* ---------- คน ---------- */
/* ทรงผม (ไม่มีหมวกแล้ว): b = ผมด้านหลัง (วาดก่อนหน้า) · f = ผมด้านหน้า (วาดทับหน้า) · แต่ละก้อน [dx, dy, กว้าง, สูง] นับจากกึ่งกลางตัวและฐานหัว (หน้าอยู่ที่ x −6..5, y −22..−13)
   ขอบดำวาดรอบรูปร่างรวมของผมทั้งก้อน · h = จุดไฮไลต์ [dx, dy] (สีอ่อน) · ยอดผมสูงสุด y −28 ให้คนตัวสูงดูสูงเท่ากัน */
/* แปลงตารางตัวอักษร (# = เส้นผม) เป็นลิสต์สี่เหลี่ยม [dx,dy,w,h] เพื่อวาดทรงผมซับซ้อนได้ง่าย */
function gridRects(rows, y0, x0) {
  x0 = x0 === undefined ? -10 : x0; const r = [];
  rows.forEach((s, j) => { let i = 0; while (i < s.length) { if (s[i] === '#') { let k = i; while (k < s.length && s[k] === '#') k++; r.push([x0 + i, y0 + j, k - i, 1]); i = k; } else i++; } });
  return r;
}
const HAIR = {
  /* ต้า: ผมรากไทรตั้งชี้ฟูแบบซุปเปอร์ไซย่า มีปอยห้อยลงหน้าผาก */
  saiyan: { b: [], f: gridRects([
    '...###.#####.###....',   /* -27 ยอดผมสั้น ไม่แหลม (สูงเท่าตัวอื่น) */
    '.##################.',   /* -26 */
    '.##################.',
    '.##################.',
    '..################..',   /* -23 */
    '..################..',   /* -22 */
    '..#####..##..#####..',   /* -21 */
    '..##.##..##..##.##..',   /* -20 ปอยห้อยหน้าผาก */
    '..##.....##.....##..',   /* -19 */
    '..##............##..'    /* -18 จอนผม */
  ], -27), h: [[-7, -26], [6, -26], [-3, -25], [2, -25], [-5, -21], [3, -21]] },
  /* เท่: ผมรองทรงธรรมดา ด้านข้างสั้นเรียบ ด้านบนยาวกว่าเล็กน้อย มีแสกข้าง */
  rong: { b: [], f: [[-6, -26, 12, 5], [-6, -21, 12, 1], [-6, -20, 4, 1], [-6, -21, 1, 5], [5, -21, 1, 5]], h: [[-2, -26], [-2, -25], [-2, -24], [-4, -25], [1, -25], [3, -24], [-5, -23], [4, -23]] },
  /* แค๊บ: ผมหยิกเป็นก้อนกลม ๆ */
  curly: { b: [], f: [[-6, -26, 12, 4], [-7, -24, 3, 3], [-5, -27, 3, 3], [-2, -27, 4, 2], [2, -27, 3, 3], [5, -24, 3, 3], [-6, -22, 3, 2], [-1, -22, 3, 2], [3, -22, 3, 2], [-8, -21, 2, 3], [6, -21, 2, 3]], h: [[-4, -26], [-1, -27], [3, -26], [-6, -23], [6, -23], [-3, -23], [1, -24], [-7, -20], [7, -20]] },
  /* ยอด: ผมสั้นเกรียน */
  short: { b: [], f: [[-5, -24, 10, 2], [-6, -22, 12, 1], [-6, -21, 1, 3], [5, -21, 1, 3]], h: [[-3, -24], [0, -24], [3, -23], [-5, -22], [4, -22]] },
  /* ลูกค้าพิเศษ: ผมยาวสลวย / บ๊อบ / แกะแกะสองข้าง / หางม้าข้าง */
  long: { b: [[-7, -23, 3, 17], [4, -23, 3, 17], [-8, -12, 2, 4], [6, -9, 2, 3]], f: [[-6, -25, 12, 4], [-7, -23, 2, 6], [5, -23, 2, 6], [-6, -21, 5, 1]], h: [[-3, -25], [2, -24], [-6, -16], [5, -15]] },
  bob: { b: [[-7, -22, 2, 11], [5, -22, 2, 11]], f: [[-6, -25, 12, 4], [-7, -23, 2, 5], [5, -23, 2, 5], [-6, -21, 4, 2], [2, -21, 4, 1]], h: [[-3, -25], [3, -24], [-6, -14], [5, -14]] },
  twin: { b: [[-10, -22, 4, 3], [-9, -19, 3, 8], [6, -22, 4, 3], [6, -19, 3, 8]], f: [[-6, -25, 12, 4], [-7, -23, 2, 3], [5, -23, 2, 3], [-6, -21, 12, 1]], h: [[-3, -25], [3, -24], [-9, -17], [7, -17]] },
  pony: { b: [[5, -24, 4, 4], [6, -20, 3, 10], [7, -11, 2, 3]], f: [[-6, -25, 12, 4], [-7, -23, 2, 4], [5, -23, 2, 4], [-6, -21, 6, 1]], h: [[-3, -25], [3, -24], [7, -16]] },
  /* เปา: ผมทรงเปลวไฟ */
  flame: { b: [[-8, -24, 3, 11], [5, -24, 3, 11]], f: [[-6, -25, 12, 4], [-6, -27, 3, 3], [-3, -27, 3, 3], [0, -27, 3, 3], [3, -27, 3, 3], [6, -26, 2, 2], [-6, -21, 4, 2], [2, -21, 4, 2]], h: [[-2, -27], [4, -27], [-5, -27], [1, -27], [-7, -14], [-7, -17], [6, -14], [6, -17], [-5, -23], [4, -23]] }
};
function hairDraw(x, yh, st, col, hl, rects) {
  if (!rects.length) return;
  rects.forEach(r => R(x + r[0] - 1, yh + r[1] - 1, r[2] + 2, r[3] + 2, OLC));
  rects.forEach(r => R(x + r[0], yh + r[1], r[2], r[3], col));
}
/* o.sz = [ขาสั้นลง, ลำตัวสั้นลง] (พิกเซล · ติดลบ = สูงขึ้น) · o.st = ทรงผม · o.sty = แบบเสื้อ: tee/zip/vest/polo/hoodie (ไม่ใส่ = เสื้อพนักงานแบบเดิม ใช้กับลูกค้า)
   o.sh2 = สีรอง (ลายเสื้อ/ปก/เนคไท) · o.arm = สีแขน · o.sl = แขนสั้น (กี่พิกเซลแรกที่ยังเป็นสีเสื้อ) · o.shorts = ขาสั้น · o.shoe = สีรองเท้า · o.bolt/o.spark = ตัวพิเศษ · o.sil = ตัวเงาสีดำ */
function person(x, y, o) {
  x = Math.round(x); y = Math.round(y);
  const f = o.wk ? Math.floor(o.T * 11) % 2 : 0, by = o.wk && f ? 1 : 0, yy = y - by, m = o.m || 0;
  const sa = o.sz ? o.sz[0] : 0, sb = o.sz ? o.sz[1] : 0, yh = yy + sa + sb, sil = !!o.sil, K = '#17121c';
  const skin = sil ? K : o.skin, hair = sil ? K : o.hair, shirt = sil ? K : o.shirt, pants = sil ? K : o.pants, cap = sil ? K : o.cap;
  const sh2 = sil ? K : (o.sh2 || '#fff'), arm = sil ? K : (o.arm || shirt), shoe = sil ? K : (o.shoe || pants), sty = sil ? '' : (o.sty || '');
  if (sil) OLC = K;   /* ตัวเงา: ดำล้วน ไม่มีขอบ */
  R(x - 7, y - 1, 14, 3, 'rgba(0,0,0,.22)');
  const lh = 5 - sa, ll = lh - (o.wk && f ? 1 : 0), rl = lh - (o.wk && !f ? 1 : 0);
  OL(x - 3, y - lh, 2, ll, pants); OL(x + 1, y - lh, 2, rl, pants);
  if (o.shorts && !sil) { R(x - 3, y - lh + 2, 2, Math.max(0, ll - 2), skin); R(x + 1, y - lh + 2, 2, Math.max(0, rl - 2), skin); }
  if (o.shoe && !sil) { R(x - 3, y - lh + ll - 1, 2, 1, shoe); R(x + 1, y - lh + rl - 1, 2, 1, shoe); }
  const sw = o.wk ? (f ? 1 : -1) : 0, ah = 6 - sb, lA = yh - 11 + (o.hold ? 0 : sw), rA = yh - 11 + (o.hold ? 0 : -sw);
  OL(x - 6, lA, 2, ah - 1, arm); OL(x + 4, rA, 2, ah - 1, arm);
  if (o.sl && !sil) { R(x - 6, lA + o.sl, 2, ah - 1 - o.sl, skin); R(x + 4, rA + o.sl, 2, ah - 1 - o.sl, skin); }
  OL(x - 6, yh - 6 - sb + (o.hold ? 0 : sw), 2, 2, skin); OL(x + 4, yh - 6 - sb + (o.hold ? 0 : -sw), 2, 2, skin);   /* มือมีขอบ ต่อจากแขนเสื้อ */
  const th = 8 - sb, tt = yh - 12;
  OL(x - 4, tt, 8, th, shirt);
  if (!sil) {
    if (!sty) { R(x + 2, tt, 2, th, SH); R(x - 2, tt, 4, 2, '#fff'); if (o.staff) R(x + 1, yh - 8, 2, 2, '#ffd23f'); else R(x - 4, yh - 6, 8, 1, SH); }
    else if (sty === 'tee') { R(x + 2, tt, 2, th, SH); R(x - 2, tt, 4, 1, skin); R(x - 4, tt + 3, 8, 1, sh2); if (th > 5) R(x - 4, tt + 5, 8, 1, sh2); }
    else if (sty === 'zip') { R(x + 2, tt, 2, th, SH); R(x - 3, tt, 6, 1, '#4a5b88'); R(x - 1, tt + 1, 2, 2, sh2); R(x, tt + 3, 1, th - 3, '#9fb0d0'); R(x - 3, tt + th - 3, 2, 1, '#1d2740'); R(x + 1, tt + th - 3, 2, 1, '#1d2740'); }
    else if (sty === 'vest') { R(x - 1, tt, 2, th, '#fff'); R(x - 1, tt, 2, 1, sh2); R(x - 1, tt + 1, 2, th - 2, sh2); R(x - 4, tt + th - 1, 8, 1, '#7a2a38'); R(x + 3, tt, 1, th, SH); }
    else if (sty === 'polo') { R(x + 2, tt, 2, th, SH); R(x - 3, tt, 2, 2, sh2); R(x + 1, tt, 2, 2, sh2); R(x, tt + 2, 1, 1, sh2); R(x, tt + 4, 1, 1, sh2); }
    else if (sty === 'hoodie') { R(x + 2, tt, 2, th, SH); R(x - 4, tt, 8, 2, '#5a36b0'); R(x - 2, tt + 2, 1, 3, sh2); R(x + 1, tt + 2, 1, 3, sh2); R(x - 3, tt + th - 2, 6, 2, '#5a36b0'); }
  }
  if (o.bolt && !sil) { R(x - 2, yh - 10, 2, 1, '#ffd23f'); R(x - 3, yh - 9, 3, 1, '#ffd23f'); R(x - 1, yh - 8, 3, 1, '#ffd23f'); R(x, yh - 7, 2, 1, '#ffd23f'); }
  const HS = o.st && HAIR[o.st];
  if (HS) hairDraw(x, yh, o.st, hair, o.hl, HS.b);
  OL(x - 6, yh - 22, 12, 10, skin);
  if (HS) { hairDraw(x, yh, o.st, hair, o.hl, HS.f); if (o.hl && !sil) HS.h.forEach(q => R(x + q[0], yh + q[1], 1, 1, o.hl)); }
  else {   /* ลูกค้า: ผมเรียบ + หมวก/อุปกรณ์เสริมแบบเดิม */
    OL(x - 6, yh - 24, 12, 5, hair); R(x - 6, yh - 19, 2, 3, hair); R(x + 4, yh - 19, 2, 3, hair);
    if (o.cap) { OL(x - 7, yh - 25, 14, 5, cap); OL(x - 8, yh - 21, 16, 2, cap); if (!sil) { R(x - 8, yh - 20, 16, 1, SH); R(x - 1, yh - 24, 2, 2, '#fff'); } }
    if (o.fr) R(x - 5, yh - 19, 10, 1, hair);
  }
  if (o.acc === 'bow') { OL(x + 3, yh - 26, 5, 3, '#ff6f91'); R(x + 5, yh - 25, 1, 1, '#fff'); }
  if (o.acc === 'hat') { OL(x - 9, yh - 23, 18, 3, '#e8c36a'); OL(x - 5, yh - 28, 10, 6, '#f0d27a'); R(x - 5, yh - 24, 10, 1, '#c0392b'); }
  if (o.acc === 'glasses') { R(x - 5, yh - 19, 4, 4, '#3a3a3a'); R(x + 1, yh - 19, 4, 4, '#3a3a3a'); R(x - 4, yh - 18, 2, 2, '#d8f1ff'); R(x + 2, yh - 18, 2, 2, '#d8f1ff'); }
  if (!sil) {
    if (m > 0) { R(x - 4, yh - 17, 3, 1, DK); R(x + 1, yh - 17, 3, 1, DK); R(x - 2, yh - 14, 4, 1, '#b5233b'); R(x - 1, yh - 13, 2, 1, '#ff6f91'); }
    else {
      R(x - 4, yh - 18, 2, 3, DK); R(x + 2, yh - 18, 2, 3, DK); R(x - 4, yh - 18, 1, 1, '#fff'); R(x + 2, yh - 18, 1, 1, '#fff');
      if (m < 0) { R(x - 5, yh - 20, 3, 1, DK); R(x + 2, yh - 20, 3, 1, DK); R(x - 2, yh - 13, 4, 1, '#b5233b'); } else R(x - 1, yh - 14, 2, 1, '#b5233b');
    }
    R(x - 5, yh - 15, 2, 1, m < 0 ? '#ff4d5e' : '#ff9aa8'); R(x + 3, yh - 15, 2, 1, m < 0 ? '#ff4d5e' : '#ff9aa8');
  }
  if (o.gl && !sil) {   /* แว่นตากรอบสีฟ้า (ตัวละครเปา): กรอบฟ้า มีแถบฟ้าอ่อนที่คิ้วแว่น + สะพานจมูก */
    const W2 = o.gl2 || '#ffffff';
    [-5, 1].forEach(dx => { R(x + dx, yh - 19, 4, 1, o.gl); R(x + dx, yh - 15, 4, 1, o.gl); R(x + dx, yh - 18, 1, 3, o.gl); R(x + dx + 3, yh - 18, 1, 3, o.gl); R(x + dx + 1, yh - 19, 2, 1, W2); R(x + dx + 1, yh - 15, 2, 1, W2); });
    R(x - 1, yh - 18, 2, 1, W2); R(x - 6, yh - 18, 1, 1, o.gl); R(x + 5, yh - 18, 1, 1, o.gl);
  }
  if (o.hot) { const d = Math.floor(o.T * 6) % 3; R(x - 6, yh - 16, 12, 2, 'rgba(255,60,40,.38)'); R(x + 7, yh - 21 + d, 2, 3, '#7fd0ff'); R(x - 9, yh - 18 + (d + 1) % 3, 2, 3, '#7fd0ff'); }
  if (o.spark && !sil) {   /* เปา: ประกายระยิบรอบตัว */
    const k = Math.floor((o.T || 0) * 6) % 4;
    [[-12, -27], [11, -22], [-11, -11], [10, -6]].forEach((q, j) => { if ((j + k) % 4 < 2) { R(x + q[0], yh + q[1], 1, 3, '#ffd6ec'); R(x + q[0] - 1, yh + q[1] + 1, 3, 1, '#ffd6ec'); } });
  }
  if (sil) bmp(['.XXX.', 'X...X', '....X', '..XX.', '..X..', '.....', '..X..'], x - 2, yh - 21, '#ffffff');   /* เครื่องหมาย ? สีขาว */
  OLC = DK;
}
/* รูปร่างหน้าตา/ชุดของตัวละคร (ลำดับตรงกับ Sim.CHARS) · sz = [ขา, ลำตัว] สั้นลง: ต้า 1+2 · เท่ 2+2 (เล็กสุด) · แค๊บ/ยอด/เปา ขายาวขึ้น 1 (สูงเท่ากัน) · ไม่มีหมวก ทุกคนแต่งตัวไม่เหมือนกัน */
const LOOK = [
  { skin: '#f3d2b0', hair: '#3da5ff', hl: '#b5e4ff', sz: [1, 2], st: 'saiyan', tg: 0, sty: 'tee', shirt: '#26262e', sh2: '#454556', pants: '#c9a66b', shorts: 1, shoe: '#f4f4f4', sl: 2 },
  { skin: '#ffe6cf', hair: '#2a2640', hl: '#8a78c0', sz: [2, 2], st: 'rong', sty: 'zip', shirt: '#2d3a5c', sh2: '#ffffff', pants: '#3a3a48', shoe: '#f4f4f4' },
  { skin: '#fff3e8', hair: '#6a3f26', hl: '#b07a45', sz: [-1, 0], st: 'curly', sty: 'vest', shirt: '#a63a4a', sh2: '#2b5fb8', arm: '#ffffff', pants: '#4a4452', shoe: '#5a3a22' },
  { skin: '#e8b98a', hair: '#1c1b2b', hl: '#6a68a0', sz: [-1, 0], st: 'short', sty: 'polo', shirt: '#2f7de1', sh2: '#ffffff', pants: '#6b7a4a', shoe: '#222222', sl: 3 },
  { skin: '#fff8f0', hair: '#b32a8f', hl: '#f5a0dc', sz: [-1, 0], st: 'flame', sty: 'hoodie', shirt: '#6a35c8', sh2: '#ffffff', pants: '#2a2438', shoe: '#ffd23f', bolt: 1, spark: 1 }
];
/* ลูกค้าพิเศษ (ผู้หญิงทั้งหมด): กุ๊กกิ๊กตัวเล็ก · เมนี่สวย ผมยาว · เจ๊หยกสาวฝรั่ง ผมบลอนด์ แว่นกันแดด */
const SPL = {
  gik: { skin: '#ffe2c8', hair: '#ff6fb0', hl: '#ffc2e0', sz: [3, 2], st: 'twin', sty: 'zip', shirt: '#ff4f9a', sh2: '#ffd1e8', pants: '#7a5cff', shoe: '#ffffff', hot: 0 },
  yok: { skin: '#fff1e6', hair: '#f0c75a', hl: '#fff0b0', sz: [-1, 0], st: 'long', sty: 'tee', shirt: '#d11f3a', sh2: '#ffd23f', pants: '#2b2b3a', shorts: 1, shoe: '#ffd23f', sl: 2, gl: '#1b1b1b', gl2: '#9fd6ff' },
  meni: { skin: '#f6cdb0', hair: '#5a2b1e', hl: '#a85b3a', sz: [-1, 0], st: 'long', sty: 'tee', shirt: '#f7a8c8', sh2: '#ffffff', pants: '#3a2a4a', shorts: 1, shoe: '#e8384f', sl: 2 },
  t1: { skin: '#f5d0b5', hair: '#1a1a24', hl: '#6a6a90', sz: [0, 0], st: 'long', sty: 'tee', shirt: '#7b3fe4', sh2: '#d9c4ff', pants: '#2a2438', shorts: 1, shoe: '#222222', sl: 2 },
  t2: { skin: '#ffe3cd', hair: '#2bb3a3', hl: '#9ff0e4', sz: [1, 0], st: 'bob', sty: 'tee', shirt: '#ffb347', sh2: '#fff0c8', pants: '#3a5aa8', shoe: '#ffffff', sl: 2 },
  t3: { skin: '#e8b98a', hair: '#ff8a3d', hl: '#ffd0a0', sz: [0, 1], st: 'pony', sty: 'tee', shirt: '#3dd2b2', sh2: '#ffffff', pants: '#3a3a52', shorts: 1, shoe: '#f4f4f4', sl: 2 }
};
const SPNAME = { gik: 'กุ๊กกิ๊ก', yok: '👑 เจ๊หยก', meni: 'เมนี่', t1: 'เมียน้อยต้า', t2: 'ชู้รักต้า', t3: 'กิ๊กต้า' };
const SPCOL = { gik: '#ff4f9a', yok: '#d99a00', meni: '#c0407a', t1: '#7b3fe4', t2: '#e08a2a', t3: '#16a085' };
const heightShift = ch => { const L = LOOK[ch | 0] || LOOK[0]; return L.sz[0] + L.sz[1]; };
const lookOpt = (ch, o) => { const L = LOOK[ch | 0] || LOOK[0]; return Object.assign({ m: 0 }, L, o); };
/* วาดตัวละครลงแคนวาสเล็ก (หน้าเลือกตัวละคร) · o.sil = ตัวเงา · o.wk = ท่าเดิน · o.T = เวลา */
function portrait(c2d, ch, o) {
  o = o || {}; const prev = cx; cx = c2d; const cv = c2d.canvas;
  c2d.clearRect(0, 0, cv.width, cv.height);
  person(cv.width / 2, cv.height - 3, lookOpt(ch, { T: o.T || 0, wk: o.wk ? 1 : 0, hold: false, sil: o.sil }));
  cx = prev;
}
/* ตัวเลข/ตัวอักษรพิกเซล 3×5 (ใช้ทำแผงปุ่มรหัส) → แคนวาส */
function glyphCanvas(chars, k, col) {
  const n = chars.length, c = document.createElement('canvas'); c.width = n * 4 * k - k; c.height = 5 * k;
  const p = c.getContext('2d'); p.fillStyle = col;
  for (let i = 0; i < n; i++) { const r = F[chars[i]]; if (!r) continue; r.forEach((row, j) => { for (let b = 0; b < 3; b++) if ((row >> (2 - b)) & 1) p.fillRect((i * 4 + b) * k, j * k, k, k); }); }
  return c;
}
function plant(x, y) { OL(x, y + 8, 8, 6, '#c0623c'); OL(x - 2, y, 4, 9, '#4cd07d'); OL(x + 3, y - 3, 4, 11, '#3da86a'); OL(x + 7, y + 1, 4, 8, '#4cd07d'); }
function box3(x, y, w, h) { OL(x, y, w, h, KR); R(x, y, w, 3, KL); R(x + w / 2 - 1, y, 2, h, '#f3e2b0'); R(x + 2, y + h - 4, 1, 2, DK); R(x + w - 3, y + h - 4, 1, 2, DK); }
const LOCK = ['..XXX..', '.X...X.', '.X...X.', 'XXXXXXX', 'XXXXXXX', 'XXX.XXX', 'XXXXXXX'];
const EXC = ['.XX.', '.XX.', '.XX.', '.XX.', '....', '.XX.'], TRI = ['...X...', '..XXX..', '..XXX..', '.XXXXX.', '.XXXXX.', 'XXXXXXX'];
function tiles(x0, y0, x1, y1, c1, c2, hl) {
  for (let y = y0, j = 0; y < y1; y += 16, j++) for (let x = x0, i = 0; x < x1; x += 16, i++) {
    const w = Math.min(16, x1 - x), h = Math.min(16, y1 - y); R(x, y, w, h, (i + j) & 1 ? c1 : c2); if (hl) R(x, y, w, 1, 'rgba(255,255,255,.35)');
  }
}
function chev(x0, x1, y, col, left) { const b = left ? ['..X', '.X.', 'X..', '.X.', '..X'] : ['X..', '.X.', '..X', '.X.', 'X..']; for (let x = x0; x < x1; x += 10) bmp(b, x, y, col); }
function chevU(x, y0, y1, col) { for (let y = y0; y < y1; y += 12) bmp(['..X..', '.X.X.', 'X...X'], x, y, col); }
/* ผนังด้านหลังของห้อง (สูง 28) + ช่องประตูพนักงานที่ x 322–346 ทะลุไปห้องถัดไปด้านบน */
function wallBand(y0, W, face, stripe, dark) {
  R(0, y0, W, 28, face); for (let i = 0; i < W; i += 16) R(i + 15, y0, 1, 22, 'rgba(0,0,0,.05)');
  R(0, y0, W, 2, '#fff7ee'); R(0, y0 + 23, W, 5, stripe); R(0, y0 + 22, W, 1, '#fff'); R(0, y0 + 28, W, 2, dark);
  R(322, y0, 24, 36, '#cfd6dc'); 
  for (let y = y0 + 2; y < y0 + 34; y += 6) R(322, y, 24, 1, 'rgba(0,0,0,.08)');
  R(320, y0, 3, 34, '#a8896a'); R(345, y0, 3, 34, '#a8896a'); R(320, y0, 28, 5, '#a8896a'); R(320, y0 + 5, 28, 1, '#e8384f'); R(320, y0 + 32, 3, 2, '#e8384f'); R(345, y0 + 32, 3, 2, '#e8384f');
}
function buildBG(S) {
  const c = document.createElement('canvas'); c.width = S.W; c.height = S.H; cx = c.getContext('2d'); const W = S.W;
  /* ================= ท่ารถ (บนสุด y 0–148) ================= */
  tiles(0, 28, W, 148, '#59606b', '#535a65', 0);
  R(0, 0, W, 28, '#bfe6f7'); R(0, 14, W, 14, '#8a5a3b'); for (let x = 2; x < W; x += 6) R(x, 14, 1, 14, 'rgba(0,0,0,.25)'); R(0, 14, W, 2, '#a86f3c'); R(0, 28, W, 2, DK);
  [[30, 3], [110, 6], [270, 2], [318, 7]].forEach(p => { R(p[0], p[1], 14, 4, '#fff'); R(p[0] + 3, p[1] - 2, 8, 3, '#fff'); });
  OL(150, 3, 54, 16, '#fff7e6'); R(151, 4, 52, 2, '#a86f3c'); R(151, 16, 52, 2, '#a86f3c');
  box3(14, 16, 12, 12); box3(28, 18, 12, 10); box3(21, 8, 12, 9); box3(250, 17, 12, 11); box3(264, 17, 12, 11);
  R(208, 58, 72, 42, '#4a4f58'); R(208, 58, 72, 1, '#e8e8e8'); R(208, 99, 72, 1, '#e8e8e8');
  for (let y = 56; y < 100; y += 6) { R(198, y, 4, 3, '#ffd23f'); R(198, y + 3, 4, 3, DK); }
  for (let y = 38; y < 146; y += 14) R(60, y, 2, 7, 'rgba(255,255,255,.22)');
  /* ================= ห้องคัดแยก (กลาง y 148–284) ================= */
  tiles(0, 176, W, 284, '#dfe9ef', '#d2e0e9', 1);
  wallBand(148, W, '#e6edf3', '#5b7fa6', '#3b4a6b');
  OL(30, 152, 26, 16, '#bfe6f7'); R(42, 152, 2, 16, DK); R(30, 159, 26, 1, '#fff');   /* หน้าต่าง */
  OL(250, 152, 26, 16, '#bfe6f7'); R(262, 152, 2, 16, DK); R(250, 159, 26, 1, '#fff');
  S.ST.filter(s => s.k === 'bag').forEach(s => { const [x, y, w, h] = s.r; R(x - 2, y + h + 2, w + 4, 3, COL[s.t]); if (s.t === 'E') R(x - 2, y + h + 4, w + 4, 1, ACC.E); R(x - 2, y + h + 5, w + 4, 1, 'rgba(0,0,0,.18)'); });
  /* ================= หน้าร้าน (ล่างสุด y 284–448) · ตกแต่งผนังเหลือแค่ป้ายชื่อร้านกับหน้าต่าง · ไม่มีลูกศรบนพื้น ================= */
  tiles(0, 312, W, 442, '#fbeed3', '#f6e2c0', 1);
  wallBand(284, W, '#ffe8d1', '#e8384f', '#9b2236');
  OL(24, 286, 26, 15, '#bfe6f7'); R(36, 286, 2, 15, DK); R(24, 293, 26, 1, '#fff'); R(27, 288, 4, 1, '#fff');   /* หน้าต่าง */
  OL(296, 286, 22, 15, '#bfe6f7'); R(306, 286, 2, 15, DK); R(296, 293, 22, 1, '#fff'); R(299, 288, 4, 1, '#fff');
  OL(214, 286, 26, 15, '#bfe6f7'); R(226, 286, 2, 15, DK); R(214, 293, 26, 1, '#fff');
  OL(84, 287, 70, 17, '#fff7e6'); R(85, 288, 68, 2, '#e8384f'); R(85, 301, 68, 2, '#e8384f');   /* ป้ายร้าน */
  R(0, 390, W, 22, '#f4b6bd'); R(0, 390, W, 2, '#fff'); R(0, 410, W, 2, '#fff');
  R(10, 412, 28, 30, '#f4b6bd'); R(10, 412, 2, 30, '#fff'); R(36, 412, 2, 30, '#fff'); R(10, 430, 28, 10, '#b5233b'); R(12, 432, 24, 1, '#ff9aa8');
  R(0, 442, W, 6, '#4a3236'); R(10, 442, 28, 6, '#8a5a3b'); R(12, 443, 24, 2, '#bfe6f7');
  OL(164, 289, 28, 16, '#f4f6f8'); R(166, 291, 24, 3, '#c9d3da'); for (let i = 0; i < 5; i++) R(167 + i * 4, 297, 3, 4, '#aab8c2'); R(184, 301, 4, 2, '#4cd07d');   /* แผงแอร์ (ใช้งานจริง: พังแล้วต้องซ่อม) */
  R(34, 328, 286, 30, 'rgba(255,210,63,.12)'); R(34, 328, 286, 1, 'rgba(255,210,63,.35)'); R(34, 357, 286, 1, 'rgba(255,210,63,.35)');
  box3(8, 334, 12, 10); box3(20, 334, 12, 10); box3(13, 326, 12, 9);
  [[11, 339], [23, 339], [16, 331]].forEach(p => { R(p[0], p[1], 1, 2, DK); R(p[0] + 5, p[1], 1, 2, DK); R(p[0] + 2, p[1] + 3, 2, 1, '#b5233b'); });
  S.ST.filter(s => s.k === 'wrap').forEach(s => {
    const [x, y, w, h] = s.r; OL(x, y, w, h, '#a86f3c'); R(x, y, w, 10, '#f6c27a'); R(x, y, w, 1, '#ffe2b0'); R(x + 2, y + h - 3, 3, 3, DK); R(x + w - 5, y + h - 3, 3, 3, DK);
    OL(x + 3, y + 2, 7, 5, '#e8384f'); R(x + 4, y + 3, 5, 1, '#ff9aa8'); OL(x + w - 11, y + 2, 8, 6, '#fff'); R(x + w - 9, y + 3, 4, 4, KR);
  });
  S.ST.filter(s => s.k === 'cnt').forEach(s => {
    const [x, y, w, h] = s.r; OL(x, y, w, h, '#e8384f'); R(x, y, w, 9, '#fff7e6'); R(x, y + 9, w, 1, '#9b2236'); R(x + 2, y + 11, w - 4, 1, '#ff9aa8');
    OL(x + 2, y + 1, 9, 6, '#9aa5ad'); R(x + 3, y + 2, 7, 2, '#d8f1ff'); R(x + 4, y + 5, 5, 1, DK); OL(x + w - 8, y + 3, 6, 4, '#ffd23f');
  });
  return c;
}
/* ---------- ส่วนที่เคลื่อนไหว ---------- */
const TW = 38;
const RA = ['X...', 'XX..', 'XXX.', 'XXXX', 'XXX.', 'XX..', 'X...'], LA = RA.map(r => r.split('').reverse().join(''));
const UA = ['...X...', '..XXX..', '.XXXXX.', 'XXXXXXX', '..XXX..', '..XXX..'], DA = UA.slice().reverse();
function outl(rows, x, y, col) { [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(o => bmp(rows, x + o[0], y + o[1], DK)); bmp(rows, x, y, col); }
function miniP(x, y, t) { R(x, y, 6, 6, DK); R(x + 1, y + 1, 4, 4, COL[t]); R(x + 2, y + 2, 2, 2, t === 'E' ? ACC.E : '#fff'); }
function lockIcon(x, y) { outl(LOCK, Math.round(x - 3), Math.round(y - 3), '#ffd23f'); }
function badge(x, y, n) { const s = String(n); R(x - 1, y - 1, s.length * 4 + 1, 7, DK); for (let i = 0; i < s.length; i++) glyph(s[i], x + i * 4, y, '#fff'); }
function station(S, id) { return S.stn(id); }

/* รถบรรทุก (มองจากด้านบน ท้ายรถเปิดหันไปทางซ้ายให้ยกถุงใส่) วิ่งเข้ามาจากขวา */
function truck(tr, T) {
  const t = tr[1]; let ox = 0;
  if (tr[0] === 'away') return;
  if (tr[0] === 'in') ox = 170 * (t / 1.6); else if (tr[0] === 'out') ox = 170 * (1 - t / 1.6);
  const x = 212 + Math.round(ox), y = 62;
  R(x + 4, y + 31, 60, 3, 'rgba(0,0,0,.25)');
  OL(x, y, 46, 30, '#f4f4f4'); R(x, y + 3, 43, 24, '#6b5560'); R(x, y + 3, 43, 3, '#4a3a40'); R(x, y, 46, 2, '#e8384f'); R(x, y + 28, 46, 2, '#e8384f');
  const n = Math.min(12, tr[2]); for (let i = 0; i < n; i++) { const tp = 'ERN'[i % 3], bx = x + 2 + (i % 6) * 7, by = y + 8 + Math.floor(i / 6) * 9; R(bx, by, 6, 8, DK); R(bx + 1, by + 1, 4, 6, COL[tp]); R(bx + 2, by + 2, 2, 2, tp === 'E' ? ACC.E : '#fff'); }
  OL(x + 46, y + 4, 16, 22, '#e8384f'); R(x + 47, y + 6, 8, 18, '#ff6a7a'); R(x + 57, y + 8, 3, 14, '#9fd8ff');
  [[6, -2], [36, -2], [6, 29], [36, 29], [50, 2], [50, 25]].forEach(w => R(x + w[0], y + w[1], w[0] === 50 ? 8 : 9, 3, DK));
  if (tr[0] === 'wait' && tr[1] < 60) { const w = Math.min(46, Math.round(46 * tr[1] / TW)); R(x - 1, y - 8, 48, 4, DK); R(x, y - 7, w, 2, tr[1] > 12 ? '#4cd07d' : (Math.floor(T * 4) % 2 ? '#ff4d5e' : '#ffd23f')); }
}
function bagStands(G, T, S) {
  S.ST.forEach(s => {
    if (s.k !== 'bag' || !S.active(s)) return;
    const n = G.bg[s.t][s.j], t = s.t, x = s.r[0], y = s.r[1];
    R(x, y + 17, 16, 3, COL[t]); if (t === 'E') R(x, y + 19, 16, 1, ACC.E); OL(x + 1, y + 14, 14, 4, '#8a8f96');
    if (n >= S.CAP) { const j = Math.sin(T * 8) > 0 ? 1 : 0; item(x + 8, y + 9 - j, t.toLowerCase()); }
    else { OL(x + 2, y + 3, 12, 12, '#fff7e6', COL[t]); R(x + 3, y + 4, 10, 2, ACC[t]); for (let i = 0; i < 2; i++) R(x + 4 + i * 5, y + 9, 4, 4, i < n ? COL[t] : '#e8e0d0'); }
  });
}
/* สายพานตรงจากเครื่องรับฝากแต่ละตัว: ขึ้นไปทะลุช่องผนัง (คนเดินผ่านไม่ได้) → โต๊ะปลายสายพานในห้องคัดแยก */
function belts(G, T, S) {
  const B = S.BELT, n = S.lv('belt'), off = Math.floor(T * B.SP) % 8, xs = [];
  for (let i = 0; i < n; i++) {
    const c = station(S, 'c' + i).r, x = Math.round(c[0] + c[2] / 2); xs.push(x);
    R(x - 9, 281, 18, 41, '#8a6a4f'); R(x - 9, 281, 18, 2, '#c9a77f'); R(x - 7, 283, 14, 37, DK);          /* กรอบช่องผนัง */
    R(x - 6, B.Y1, 12, B.Y0 - B.Y1, DK); R(x - 5, B.Y1, 10, B.Y0 - B.Y1, '#5a616c');                         /* ตัวสายพาน */
    for (let y = B.Y0 - 2 - off; y > B.Y1; y -= 8) R(x - 5, y, 10, 2, '#7b8491');
    R(x - 6, B.Y0 - 1, 12, 2, '#ffd23f');                                                                    /* ปากสายพานที่เครื่อง */
  }
  G.belt.forEach(b => item(xs[b.l], B.Y0 - b.d, b.t));
  for (let i = 0; i < n; i++) {
    const t = station(S, 'bl' + i).r;
    OL(t[0], t[1], t[2], 24, '#7d8590'); R(t[0], t[1], t[2], 3, '#aab3bd'); R(t[0] + 1, t[1] + 21, t[2] - 2, 1, 'rgba(0,0,0,.2)');
    G.bq[i].forEach((p, k) => miniP(t[0] + 3 + (k % 2) * 9, t[1] + 5 + Math.floor(k / 2) * 8, p));
  }
}
function locks(S) {
  S.ST.forEach(s => { if ((s.k === 'wrap' || s.k === 'cnt' || s.k === 'bag') && !S.active(s)) { const r = s.r; R(r[0], r[1], r[2], r[3], 'rgba(43,29,34,.64)'); lockIcon(r[0] + r[2] / 2, r[1] + r[3] / 2); } });
}
/* แอร์พัง: ควันลอย ไฟกะพริบ และบรรยากาศอบอ้าวทั้งหน้าร้าน */
function acFx(G, T) {
  if (!G.ev.ac) return;
  R(0, 312, 360, 130, 'rgba(255,110,40,' + (0.06 + 0.03 * Math.sin(T * 2.2)).toFixed(3) + ')');
  R(184, 301, 4, 2, Math.floor(T * 4) % 2 ? '#ff4d5e' : '#7a1f2a');
  for (let k = 0; k < 3; k++) { const py = 287 - ((T * 14 + k * 8) % 22), px = 172 + k * 8 + Math.sin(T * 3 + k) * 2; R(px, py, 3, 3, 'rgba(90,90,90,.6)'); R(px + 1, py - 1, 2, 2, 'rgba(140,140,140,.4)'); }
  bmp(['X...X', '.X.X.', '..X..', '.X.X.', 'X...X'], 174, 294, '#ff4d5e');
}
/* หลังคารั่ว: น้ำหยด แอ่งน้ำ ป้ายเตือน และวงที่ลูกค้าเลี่ยง */
function leaks(G, T) {
  G.ev.lk.forEach(l => {
    const x = Math.round(l.x), y = Math.round(l.y), rp = (T * 8) % 6;
    for (let a = 0; a < 24; a++) { const t = a / 24 * 6.2832; R(x + Math.cos(t) * 20, y + Math.sin(t) * 9, 1, 1, 'rgba(60,150,255,' + (0.35 + 0.25 * Math.sin(T * 3 + a)).toFixed(2) + ')'); }
    R(x - 8, y - 1, 16, 4, '#6fb8ff'); R(x - 5, y - 3, 10, 2, '#6fb8ff'); R(x - 5, y + 3, 10, 2, '#6fb8ff'); R(x - 5, y - 1, 5, 1, '#cfeaff');
    for (let a = 0; a < 6; a++) R(x + Math.cos(a * 1.047) * (3 + rp) * 1.6, y + 1 + Math.sin(a * 1.047) * (3 + rp) * 0.6, 1, 1, '#fff');
    const dy = (T * 38 + l.x * 3) % 26; R(x - 1, y - 30 + dy, 2, 3, '#4aa3ff'); R(x - 1, y - 30 + dy, 1, 1, '#cfeaff');
    outl(TRI, x + 12, y - 9, '#ffd23f'); R(x + 15, y - 7, 1, 3, DK); R(x + 15, y - 3, 1, 1, DK);
  });
}
/* ของที่ทิ้งไว้บนพื้น: เงาแบน ๆ ใต้ไอเทม (ถ้าเป็นถุงหลายใบวางเรียงข้างกัน) */
function floorItem(f) {
  const n = f.t.length, x = Math.round(f.x), y = Math.round(f.y), sp = n > 3 ? 5 : 7;
  R(x - 7 - (n - 1) * sp / 2, y - 1, 14 + (n - 1) * sp, 3, 'rgba(0,0,0,.24)');
  for (let i = 0; i < n; i++) item(x + (i - (n - 1) / 2) * sp, y - 5, f.t[i]);
}
/* รถเข็น (ของกลาง จอดตรงไหนก็ได้): c = กึ่งกลางรถ, y = พื้น, f = ด้านที่มือจับอยู่ · มีช่องแสดงความจุ ใส่ถุงเต็มแล้วช่องจะเป็นสีของถุง */
function cart(c, y, f, h, cap) {
  const n = h.length, rows = cap > 5 ? 2 : 1, by = Math.round(y) + 1, bh = rows * 5 + 1, top = by - 5 - bh; f = f < 0 ? -1 : 1;
  R(c - 10, by - 1, 20, 3, 'rgba(0,0,0,.22)');
  OL(c - 9, top, 18, bh, '#7d8590'); R(c - 9, top, 18, 1, '#c9d3da'); OL(c - 9, by - 5, 18, 3, '#e8384f'); R(c - 7, by - 2, 3, 3, DK); R(c + 4, by - 2, 3, 3, DK);
  R(c - f * 11, top - 3, 2, bh + 4, DK); R(c - f * 11 - (f > 0 ? 0 : 0), top - 4, 2, 2, '#ffd23f'); R(c - f * 11 + (f > 0 ? 2 : -3), top - 4, 3, 2, '#ffd23f');
  for (let i = 0; i < cap; i++) {
    const bx = c - 8 + (i % 5) * 3, by0 = top + 1 + (rows - 1 - Math.floor(i / 5)) * 5;
    if (i < n) { const T2 = h[i].toUpperCase(); R(bx, by0, 3, 4, COL[T2]); R(bx, by0 + 3, 3, 1, T2 === 'E' ? ACC.E : COLD[T2]); R(bx + 1, by0 + 1, 1, 1, '#fff'); }
    else { R(bx, by0, 3, 4, '#5d6670'); R(bx, by0, 3, 1, '#4a525b'); }
  }
  if (n > 1) badge(c - (n > 9 ? 4 : 2), top - 8, n);
}
let tutFlag = false;
function bubble(c, T, hotAc) {
  const x = Math.round(c.x), y = Math.round(c.y);
  if (c.k === 'S') return;
  if (c.k === 'L' && c.sp && !c.m) return;
  if (c.k === 'L') { if (c.hot) bmp(ANG, x - 3, y - 36, '#ff8a3d'); else bmp(c.m > 0 ? HEART : ANG, x - 3, y - 36, c.m > 0 ? '#ff6f91' : '#ff4d5e'); return; }
  const pc = c.pr > 0.5 ? '#4cd07d' : c.pr > 0.25 ? '#ffd23f' : '#ff4d5e';
  if (hotAc && c.ht > 0.35) { const k = Math.floor(T * 5) % 2; R(x + 8, y - 30 + k, 2, 3, '#7fd0ff'); R(x - 10, y - 28 + (1 - k), 2, 3, '#7fd0ff'); R(x - 9, y - 40, 18, 2, DK); R(x - 8, y - 40, Math.round(16 * c.ht), 2, '#ff6a3d'); }
  if ((c.k === 'W' && c.bx) || c.q) { R(x - 9, y - 33, 18, 3, DK); R(x - 8, y - 32, Math.max(0, Math.round(16 * c.pr)), 1, pc); return; }
  const sx = c.pr < 0.3 && !tutFlag ? Math.round(Math.sin(T * 30)) : 0, bx = x - 10 + sx, by = y - 43;
  OL(bx, by, 20, 16, '#fff'); R(x - 2 + sx, by + 16, 4, 2, DK); R(x - 1 + sx, by + 16, 2, 1, '#fff');
  if (c.k === 'W') item(x + sx, by + 8, 'B'); else item(x + sx, by + 7, c.t);
  if (c.k === 'C' && c.ar && c.pg > 0 && c.pg < 1) { R(bx, by + 19, 20, 3, DK); R(bx + 1, by + 20, Math.round(18 * c.pg), 1, '#3da5f5'); }
  R(bx, by - 4, 20, 3, DK); R(bx + 1, by - 3, Math.max(0, Math.round(18 * c.pr)), 1, pc);
}
function frameR(r, col, w) { R(r[0] - 1 - w, r[1] - 1 - w, r[2] + 2 + 2 * w, w, col); R(r[0] - 1 - w, r[1] + r[3] + 1, r[2] + 2 + 2 * w, w, col); R(r[0] - 1 - w, r[1] - 1, w, r[3] + 2, col); R(r[0] + r[2] + 1, r[1] - 1, w, r[3] + 2, col); }
/* เปา: เวลาเดินมีรุ้งทอดยาวตามทางที่เดิน · เก็บจุดเท้าย้อนหลังไว้ ~1.4 วิ แล้วค่อย ๆ จางหาย (เก็บฝั่งผู้เล่นแต่ละเครื่องเอง ไม่ต้องส่งผ่านเน็ต) */
const RAINBOW = ['#ff3b3b', '#ff9a2e', '#ffe13b', '#4cd07d', '#3da5f5', '#9b5cff'], TRAIL_LIFE = 1.4, trail = [[], [], [], []];
function trailUpdate(G, T) {
  G.pl.forEach((p, i) => {
    const tr = trail[i];
    if (!p.c || (p.ch | 0) !== 4) { tr.length = 0; return; }
    const px = p.dx != null ? p.dx : p.x, py = p.dy != null ? p.dy : p.y;
    while (tr.length && (T - tr[0].t > TRAIL_LIFE || tr[0].t > T)) tr.shift();
    const l = tr[tr.length - 1];
    if (p.mv && (!l || Math.hypot(px - l.x, py - l.y) >= 3)) {
      tr.push({ x: px, y: py, t: T, br: !l || Math.hypot(px - l.x, py - l.y) > 40 });
      if (tr.length > 80) tr.shift();
    }
  });
}
function trailDraw(T, vis) {
  trail.forEach(tr => {
    for (let k = 1; k < tr.length; k++) {
      const a = tr[k - 1], b = tr[k]; if (b.br || !vis(b.x, b.y)) continue;
      const age = (T - b.t) / TRAIL_LIFE, wv = Math.sin(b.t * 14) > 0 ? 1 : 0, hz = Math.abs(b.x - a.x) >= Math.abs(b.y - a.y);
      cx.globalAlpha = Math.max(0.12, 0.95 - age * 0.85);
      const n = Math.max(Math.abs(b.x - a.x), Math.abs(b.y - a.y), 1);
      RAINBOW.forEach((col, c) => {
        const o = (c - 3) * 2, ox = hz ? 0 : o, oy = hz ? o + wv : 0;   /* แต่ละแถบหนา 2 พิกเซล รวมกว้าง 12 */
        for (let u = 0; u < n; u++) R(a.x + (b.x - a.x) * u / n + ox, a.y + (b.y - a.y) * u / n + oy - 2, hz ? 1 : 2, hz ? 2 : 1, col);
      });
    }
  });
  cx.globalAlpha = 1;
}
function draw(c2d, G, o) {
  cx = c2d; tutFlag = !!G.tut;
  curMe = o.me;
  const S = g.Sim, T = o.T, VW = Math.min(c2d.canvas.width, S.W), VH = c2d.canvas.height, cam = Math.round(o.cam || 0), camY = Math.round(o.camY || 0);
  const vis = (x, y) => x > cam - 26 && x < cam + VW + 26 && y > camY - 8 && y < camY + VH + 62;
  cx.drawImage(bg, cam, camY, VW, VH, 0, 0, VW, VH); cx.save(); cx.translate(-cam, -camY);
  truck([G.tr.st, G.tr.t, G.tr.ld], T); bagStands(G, T, S); belts(G, T, S); acFx(G, T); locks(S); leaks(G, T);
  trailUpdate(G, T); trailDraw(T, vis);
  if (o.near && o.showNear) { const ns = station(S, o.near); if (ns) frameR(ns.r, Math.floor(T * 5) % 2 ? '#fff' : '#ffd23f', 1); }
  const E = [], hotAc = !!G.ev.ac;
  G.pl.forEach((p, i) => {
    if (!p.c) return;
    const px = p.dx != null ? p.dx : p.x, py = p.dy != null ? p.dy : p.y; if (!vis(px, py)) return;
    E.push([py, () => {
      if (i === o.me) { R(px - 8, py, 16, 3, '#fff'); R(px - 7, py + 1, 14, 1, CAPC[i]); } else R(px - 7, py + 1, 14, 1, CAPC[i]);
      const L = LOOK[p.ch | 0] || LOOK[0];
      person(px, py, lookOpt(p.ch, { T, wk: p.mv, hold: !!p.h || S.pusher(p) }));
      if (p.h) item(px, py - 8 + Math.round((L.sz[0] + L.sz[1]) * 0.6) - (p.mv && Math.floor(T * 11) % 2 ? 1 : 0), p.h);
    }]);
  });
  /* รถเข็น (วัตถุกลางในโลก): ตอนมีคนเข็นจะวาดทับหน้าคนเข็นเล็กน้อย */
  const ct = G.cart;
  if (ct) {
    const cxp = ct.dx != null ? ct.dx : ct.x, cyp = ct.dy != null ? ct.dy : ct.y;
    if (vis(cxp, cyp)) E.push([cyp + (ct.by >= 0 ? 0.6 : 0), () => cart(cxp, cyp, ct.f, ct.b, S.CART[S.lv('cart')])]);
  }
  G.cu.forEach(c => {
    if (!vis(c.x, c.y)) return;
    const u = CUS[c.sk % CUS.length], wk = !c.ar, hot = c.hot || (hotAc && c.ht > 0.35), L = c.sp && SPL[c.sp];
    if (L) {
      E.push([c.y, () => {
        person(c.x, c.y, Object.assign({ T, wk, hot, m: c.k === 'L' ? c.m : 0, hold: false }, L));
        const hx = Math.round(c.x), hy = Math.round(c.y) + L.sz[0] + L.sz[1];
        if (c.af) {
          if (c.sp === 'meni') { R(hx + 8, hy - 30, 6, 9, DK); R(hx + 9, hy - 29, 4, 7, '#bfe9ff'); if (Math.floor(T * 5) % 3 === 0) { R(hx + 6, hy - 33, 2, 2, '#fff'); R(hx + 14, hy - 33, 2, 2, '#fff'); R(hx + 10, hy - 35, 2, 2, '#fff'); } }
          else { R(hx + 6, hy - 22, 3, 6, DK); R(hx + 7, hy - 21, 1, 4, '#9fe8ff'); const k = Math.floor(T * 6) % 3; if (k) bmp(['.X', 'X.', '.X'], hx + 10, hy - 22, '#ffd23f'); if (k > 1) bmp(['.X', 'X.', '.X'], hx + 13, hy - 22, '#ffd23f'); }
        }
      }]);
      return;
    }
    E.push([c.y, () => person(c.x, c.y, { T, wk, hot, m: c.k === 'L' ? c.m : 0, skin: u.s, hair: u.h, shirt: u.u, pants: '#556', cap: u.a === 'cap' ? '#6db3f2' : null, acc: u.a, hold: false })]);
  });
  (G.fl || []).forEach(f => { if (vis(f.x, f.y)) E.push([f.y - 0.3, () => floorItem(f)]); });
  E.sort((a, b) => a[0] - b[0]).forEach(e => e[1]());
  G.cu.forEach(c => { if (vis(c.x, c.y)) bubble(c, T, hotAc); });
  [0, 1, 2].forEach(i => {
    const w = station(S, 'w' + i), k = station(S, 'c' + i);
    if (!S.active(w)) return;
    const c = S.wc(i), wr = w.r, kr = k.r;
    if (c && c.bx) {
      item(wr[0] + wr[2] / 2, wr[1] + 5, c.pg >= 1 ? c.t : 'B');
      if (c.pg > 0 && c.pg < 1) { R(wr[0] + 3, wr[1] - 6, wr[2] - 6, 4, DK); R(wr[0] + 4, wr[1] - 5, Math.round((wr[2] - 8) * c.pg), 2, '#3da5f5'); }
    }
    if (G.cp[i]) item(kr[0] + kr[2] / 2 + 3, kr[1] + 5, G.cp[i]);
  });
  if (o.hintS) {
    const hs = station(S, o.hintS);
    if (hs) {
      const r = hs.r, col = Math.floor(T * 4) % 2 ? '#ffd23f' : '#fff3a0', P = G.pl[o.me];
      frameR(r, DK, 3); frameR(r, col, 2);
      if (P) {
        const tx = r[0] + r[2] / 2, ty = r[1] + r[3] / 2, bob = Math.round(Math.sin(T * 8) * 1.5), ax = Math.max(cam + 6, Math.min(cam + VW - 14, tx - 3));
        if (ty < camY + 4) outl(UA, ax, camY + 12 + bob, '#ffd23f'); else if (ty > camY + VH - 4) outl(DA, ax, camY + VH - 20 - bob, '#ffd23f');
        else if (tx > cam + VW - 4) outl(RA, cam + VW - 9 + bob, ty - 3, '#ffd23f'); else if (tx < cam + 4) outl(LA, cam + 4 - bob, ty - 3, '#ffd23f');
      }
    }
  }
  cx.restore();
}

/* ---------- ไอคอนปุ่มทำงาน: เส้นสีขาวล้วน ไม่ลงสี (พิกเซล 40×40 แสดงขยาย 2 เท่า) ---------- */
const BAHT = ['..X..', 'XXXX.', 'X...X', 'X...X', 'XXXX.', 'X...X', 'X...X', 'XXXX.', '..X..'];
const GLY = { E: ['XXXXX', 'X....', 'X....', 'XXXX.', 'X....', 'X....', 'XXXXX'], R: ['XXXX.', 'X...X', 'X...X', 'XXXX.', 'X.X..', 'X..X.', 'X...X'], N: ['X...X', 'XX..X', 'XX..X', 'X.X.X', 'X..XX', 'X..XX', 'X...X'] };
/* รูปร่างทึบ (หน้ากาก 40×40) → เส้นขอบหนา 2 พิกเซล: ใช้กับมือ/ถุง/ประแจ */
const rrect = (x, y, w, h, r) => (u, v) => { if (u < x || u > x + w || v < y || v > y + h) return false; const a = Math.max(x + r, Math.min(u, x + w - r)), b = Math.max(y + r, Math.min(v, y + h - r)); return Math.hypot(u - a, v - b) <= r; };
const capsule = (x0, y0, x1, y1, r) => (u, v) => { const dx = x1 - x0, dy = y1 - y0, t = Math.max(0, Math.min(1, ((u - x0) * dx + (v - y0) * dy) / (dx * dx + dy * dy))); return Math.hypot(u - x0 - t * dx, v - y0 - t * dy) <= r; };
function outlinePx(ops) {
  let M = new Uint8Array(1600); const M0 = M;
  ops.forEach(o => { for (let y = 0; y < 40; y++) for (let x = 0; x < 40; x++) if (o[1](x + 0.5, y + 0.5)) M[y * 40 + x] = o[0] === '+' ? 1 : 0; });
  for (let k = 0; k < 2; k++) {
    const E = new Uint8Array(1600);
    for (let y = 0; y < 40; y++) for (let x = 0; x < 40; x++) { let all = M[y * 40 + x]; for (let dy = -1; dy <= 1 && all; dy++) for (let dx = -1; dx <= 1; dx++) { const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx > 39 || yy > 39 || !M[yy * 40 + xx]) { all = 0; break; } } E[y * 40 + x] = all; }
    M = E;
  }
  const out = []; for (let i = 0; i < 1600; i++) if (M0[i] && !M[i]) out.push([i % 40, (i / 40) | 0]); return out;
}
const HAND_OPS = [['+', rrect(9, 8, 6, 17, 3)], ['+', rrect(16, 4, 6, 21, 3)], ['+', rrect(23, 7, 6, 18, 3)], ['+', rrect(30, 12, 6, 13, 3)], ['+', rrect(9, 18, 27, 17, 6)], ['+', capsule(11, 27, 4, 19, 3.3)], ['+', rrect(13, 30, 19, 7, 1)]];
const SACK_OPS = [['+', rrect(7, 3, 15, 5, 1)], ['+', rrect(10, 6, 9, 9, 1)], ['+', rrect(3, 12, 23, 23, 6)]];
const WRENCH_OPS = [['+', capsule(26, 14, 8, 32, 3.6)], ['+', (u, v) => Math.hypot(u - 27, v - 13) <= 9.5], ['-', capsule(27, 12, 40, -1, 3.8)]];
const MEGA_OPS = [['+', rrect(5, 17, 10, 13, 2)], ['+', (u, v) => u >= 13 && u <= 33 && Math.abs(v - 23.5) <= 3.5 + (u - 13) * 0.42], ['+', rrect(8, 28, 5, 8, 1.5)]];
let HP = null, SP = null, WP = null, MP = null;
function icon(c2d, key) {
  cx = c2d; cx.clearRect(0, 0, 40, 40);
  const ty = key[0], d = key[1], isBag = ty >= 'a' && ty <= 'z' && ty !== 'f';
  const paint = col => {
    cx.fillStyle = col;
    const P = (x, y, w, h) => cx.fillRect(x, y, w || 1, h || 1);
    const B = (x, y, w, h, t) => { t = t || 2; P(x, y, w, t); P(x, y + h - t, w, t); P(x, y, t, h); P(x + w - t, y, t, h); };
    const L = (x0, y0, x1, y1, t) => { t = t || 2; const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let e = dx + dy; for (;;) { P(x0, y0, t, t); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } } };
    const O = (x, y, r, t) => { for (let j = -r - 1; j <= r; j++) for (let i = -r - 1; i <= r; i++) { const q = Math.hypot(i + 0.5, j + 0.5); if (q <= r + 0.5 && q > r + 0.5 - t) P(x + i, y + j); } };
    const GL = (rows, x, y, k) => rows.forEach((r, j) => { for (let b = 0; b < r.length; b++) if (r[b] === 'X') P(x + b * k, y + j * k, k, k); });
    const arrow = up => { if (up) { for (let r = 0; r < 5; r++) P(32 - r, 3 + r, 2 + 2 * r, 1); P(31, 8, 4, 11); } else { P(31, 3, 4, 11); for (let r = 0; r < 5; r++) P(28 + r, 14 + r, 10 - 2 * r, 1); } };
    const cross = () => { L(28, 4, 36, 12, 3); L(36, 4, 28, 12, 3); };
    const tag = () => { if (d === '+') arrow(1); else if (d === '-') arrow(0); else if (d === '✗') cross(); };
    if (key === 'hand') { (HP = HP || outlinePx(HAND_OPS)).forEach(q => P(q[0], q[1])); P(11, 21, 2, 2); }
    else if (key === 'coin') { O(20, 20, 15, 2); O(20, 20, 11, 1); GL(BAHT, 15, 11, 2); }
    else if (key === 'tape') { B(5, 16, 30, 19, 2); P(18, 16, 4, 19); P(5, 24, 30, 3); O(14, 11, 5, 2); O(26, 11, 5, 2); P(18, 9, 4, 5); }   /* ห่อของขวัญ: กล่อง+ริบบิ้น+โบว์ */
    else if (key === 'truck') { B(2, 8, 21, 20, 2); P(2, 17, 21, 2); B(23, 14, 14, 14, 2); P(29, 16, 6, 6); O(11, 31, 4, 4); O(30, 31, 4, 4); }
    else if (key === 'fix') (WP = WP || outlinePx(WRENCH_OPS)).forEach(q => P(q[0], q[1]));
    else if (key === 'shoo') { (MP = MP || outlinePx(MEGA_OPS)).forEach(q => P(q[0], q[1])); P(34, 11, 3, 2); P(36, 22, 4, 2); P(34, 33, 3, 2); }   /* โทรโข่ง: ไล่ลูกค้าพิเศษ */
    else if (key === 'cart' || key === 'cartin' || key === 'cartx') {   /* รถเข็น: จับเข็น / ใส่ถุงลงรถ (ลูกศรลง) / ใส่ไม่ได้ (กากบาท) */
      const y0 = key === 'cart' ? 14 : 20, w = O;
      B(9, y0, 25, 11, 2); P(17, y0, 2, 11); P(25, y0, 2, 11); P(9, y0 + 5, 25, 2); P(7, y0 + 13, 29, 2);
      w(14, y0 + 20, 3, 2); w(29, y0 + 20, 3, 2);
      L(9, y0, 4, y0 - 8, 2); P(1, y0 - 9, 7, 2);
      if (key === 'cartin') arrow(0); else if (key === 'cartx') cross();
    }
    else if (ty === 'B') { B(2, 13, 24, 21, 2); P(2, 19, 24, 2); P(12, 13, 4, 21); P(18, 24, 5, 1); P(18, 27, 5, 1); P(18, 30, 3, 1); tag(); }
    else if (isBag) { (SP = SP || outlinePx(SACK_OPS)).forEach(q => P(q[0], q[1])); P(10, 11, 9, 2); GL(GLY[ty.toUpperCase()], 9, 18, 2); tag(); }
    else { B(2, 13, 24, 21, 2); GL(GLY[ty], 9, 17, 2); tag(); }
  };
  cx.save(); cx.translate(1, 1); paint('rgba(30,12,18,.55)'); cx.restore(); paint('#fff');
}
/* ไอคอนปุ่มทิ้งของ: กล่องหล่นลงพื้น (เส้นสีขาวล้วน 24×24 แสดงขยาย 2 เท่า) */
function dropIcon(c2d, cartMode) {
  c2d.clearRect(0, 0, 24, 24);
  const paint = col => {
    c2d.fillStyle = col; const P = (x, y, w, h) => c2d.fillRect(x, y, w || 1, h || 1);
    if (cartMode) { P(6, 3, 15, 2); P(6, 9, 15, 2); P(6, 3, 2, 8); P(19, 3, 2, 8); P(12, 3, 2, 8); P(7, 12, 3, 2); P(17, 12, 3, 2); P(2, 1, 4, 2); P(3, 3, 2, 7); }   /* รถเข็น: ตะกร้า ล้อ มือจับ */
    else { P(5, 1, 14, 2); P(5, 11, 14, 2); P(5, 1, 2, 12); P(17, 1, 2, 12); P(5, 5, 14, 2); P(11, 1, 2, 4); P(8, 9, 5, 1); }   /* กล่องพัสดุ มีฝาและริบบิ้น */
    P(11, 14, 2, 3);                                                                      /* ก้านลูกศร */
    P(8, 17, 8, 1); P(9, 18, 6, 1); P(10, 19, 4, 1); P(11, 20, 2, 1);                      /* หัวลูกศรชี้ลง */
    P(3, 22, 18, 2);                                                                      /* พื้น */
  };
  c2d.save(); c2d.translate(1, 1); paint('rgba(30,12,18,.55)'); c2d.restore(); paint('#fff');
}
/* ป้ายชื่อ (DOM) ตำแหน่งตามโลก · u/i = ต้องอัปเกรด u ถึงระดับ i (lt = ข้อความตอนล็อก) · w:'ac' = แสดงเฉพาะตอนแอร์พัง */
/* ป้ายชื่อเหนือหัวตัวละครทุกคนที่อยู่ในเกม (ตามตำแหน่งที่แสดง) · n = ป้ายชื่อ · me = ของเรา (ตัวหนา/ขอบขาว) */
let curMe = -1;
const plAt = i => { const S = g.Sim, G = S && S.G, p = G && G.pl[i]; return p && p.c && G.ph === 'play' ? p : null; };
const NAMETAG = [0, 1, 2, 3].map(i => ({
  get x() { const p = plAt(i); return p ? (p.dx != null ? p.dx : p.x) : -999; },
  get y() { const p = plAt(i); return p ? (p.dy != null ? p.dy : p.y) - 37 + heightShift(p.ch) - ((LOOK[p.ch | 0] || LOOK[0]).tg || 0) : -999; },
  get t() { const p = plAt(i); return p ? g.Sim.CHARS[p.ch | 0].name : ''; },
  get me() { return curMe === i; }, get sp() { return !!(g.Voice && g.Voice.spk[i]); }, c: CAPC[i], n: 1
}));
const spAt = sp => { const G = g.Sim && g.Sim.G; return G && G.ph === 'play' ? G.cu.find(c => c.sp === sp) : null; };
const SPTAG = Object.keys(SPL).map(sp => ({
  get x() { const c = spAt(sp); return c ? (c.dx != null ? c.dx : c.x) : -999; },
  get y() { const c = spAt(sp), L = SPL[sp]; return c ? (c.dy != null ? c.dy : c.y) - 37 + L.sz[0] + L.sz[1] : -999; },
  t: SPNAME[sp], c: SPCOL[sp]
}));
const cartAt = () => { const G = g.Sim && g.Sim.G, c = G && G.cart; return c && c.by < 0 ? [c.dx != null ? c.dx : c.x, c.dy != null ? c.dy : c.y] : null; };
const LABELS = [
  { x: 20, y: 349, t: 'กล่อง', c: '#c98a4b' },
  { x: 64, y: 322, t: 'โต๊ะห่อ', c: '#a86f3c' }, { x: 108, y: 322, t: 'โต๊ะห่อ', lt: '🔒 โต๊ะห่อ', u: 'wt', i: 1, c: '#a86f3c' }, { x: 152, y: 322, t: 'โต๊ะห่อ', lt: '🔒 โต๊ะห่อ', u: 'wt', i: 2, c: '#a86f3c' },
  /* ป้ายเคาน์เตอร์ขยับไปทางขวาเมื่อมีสายพาน (su/si/sx) เพื่อไม่ให้บังช่องสายพานที่ทะลุผนัง */
  { x: 202, y: 322, t: 'รับฝาก', c: '#e8384f', su: 'belt', si: 1, sx: 21 }, { x: 242, y: 322, t: 'รับฝาก', lt: '🔒 รับฝาก', u: 'ct', i: 1, c: '#e8384f', su: 'belt', si: 1, sx: 21 }, { x: 282, y: 322, t: 'รับฝาก', lt: '🔒 รับฝาก', u: 'ct', i: 2, c: '#e8384f', su: 'belt', si: 1, sx: 21 },
  { x: 178, y: 310, t: '🥵 แอร์พัง!', c: '#c92a3b', w: 'ac' },
  { x: 334, y: 294, t: 'คัดแยก ▲', c: '#5b7fa6' }, { x: 334, y: 160, t: 'ท่ารถ ▲', c: '#8a5a3b' },
  { x: 202, y: 250, t: 'สายพาน', lt: '', u: 'belt', i: 1, h: 1, c: '#5b7fa6' }, { x: 242, y: 250, t: 'สายพาน', lt: '', u: 'belt', i: 2, h: 1, c: '#5b7fa6' }, { x: 282, y: 250, t: 'สายพาน', lt: '', u: 'belt', i: 3, h: 1, c: '#5b7fa6' },
  { x: 124, y: 180, t: 'EMS', c: '#2f6fe0' }, { x: 196, y: 180, t: 'ลงทะเบียน', c: '#e8384f' }, { x: 268, y: 180, t: 'ธรรมดา', c: '#c79a00' },
  { x: 208, y: 54, t: 'ขึ้นรถ ▶', c: '#4a4f58' },
  { x: 119, y: 296, t: 'ไปรษณีย์ไทรน้อย', c: 'sign', col: '#e8384f' },
  /* ป้ายรถเข็น: ลอยตามรถที่จอดอยู่ (ซ่อนตอนมีคนเข็นหรือยังไม่ได้ซื้อ) */
  { get x() { const c = cartAt(); return c ? c[0] : -999; }, get y() { const c = cartAt(); return c ? c[1] - 27 : -999; }, t: '🛒 รถเข็น', c: '#6b7480', u: 'cart', i: 1, h: 1, lt: '' }
].concat(NAMETAG, SPTAG);
g.Art = { init(S) { if (!bg) bg = buildBG(S); }, draw, lookOpt, item, person, portrait, glyphCanvas, LOOK, heightShift, icon, dropIcon, LABELS, CAPC, COL };
})(window);
