/* sim.js v3 — แผนที่ 3 ชั้น (หน้าร้านล่างสุด → ห้องคัดแยก → ท่ารถ) · วัน/เงิน/ความพอใจ/เหตุการณ์สุ่ม/บิลค่าไฟ
   host รันจริง, client ใช้ load() รับสถานะ */
(function (g) {
'use strict';
const W = 360, H = 448, CAP = 2, DAY_T = 150, TRUCK_WAIT = 38, TRUCK_GAP = 14, BQ_MAX = 4, LOBBY_MAX = 14;
const FY = 296, SY = 148;               /* y ด้านบนของห้องหน้าร้าน / ห้องคัดแยก (ท่ารถเริ่มที่ 0) */
const VMAX = 80, ACC = 800, DEC = 1600;
const NAME = { E: 'EMS', R: 'ลงทะเบียน', N: 'ธรรมดา' }, FEE = { E: 60, R: 40, N: 25 };
const CART = [1, 2, 4, 6], WRAPT = [2.4, 1.9, 1.5, 1.1], SERVT = [1.5, 1.2, 0.9, 0.65];
/* ถือถุงเต็มด้วยมือได้ครั้งละ 1 ใบ · รถเข็น (ซื้อแล้ว) เป็นของกลางจอดไว้ตรงไหนก็ได้ ใส่ถุงได้ CART[ระดับ] ใบ · CART_HOME = จุดที่รถเข็นรออยู่ตอนเริ่มวัน (ห้องคัดแยก) */
const HAND = 1, CART_HOME = [150, 236];
/* ตัวละคร (ปรับค่าได้ที่นี่) · lv = ระดับ 1–7 ของ [เดิน, ถือของ, ห่อ, รับฝาก] (4 = ปานกลาง/ปกติ) · ตัวเลขนี้ตรงกับเกจในหน้าเลือกตัวละคร
   เดิน/ถือของ → ความเร็ว (คูณกับ VMAX) · ถือของ = ความเร็วเดินตอนถือของ/เข็นรถที่มีถุง · ห่อ/รับฝาก → ตัวคูณความเร็วงาน (มากกว่า 1 = ไวกว่า)
   อยากปรับสูตรความเร็วต่อระดับ แก้ที่ LVL ข้างล่าง */
const LVMAX = 10;
const LVL = { walk: l => 1 + 0.07 * (l - 4), carry: l => 0.45 + 0.095 * l, wrap: l => 1 + 0.15 * (l - 4), serve: l => 1 + 0.15 * (l - 4) };
const CHARS = [
  { id: 'ta', name: 'ต้า', lv: [6, 2, 4, 4] },
  { id: 'tet', name: 'เท่', lv: [5, 4, 6, 4] },
  { id: 'cab', name: 'แค๊บ', lv: [4, 6, 4, 4] },
  { id: 'yot', name: 'ยอด', lv: [4, 2, 4, 6] },
  { id: 'pao', name: 'เปา', lv: [10, 10, 10, 10], secret: 1 }
].map(c => Object.assign(c, { walk: LVL.walk(c.lv[0]), carry: LVL.carry(c.lv[1]), wrap: LVL.wrap(c.lv[2]), serve: LVL.serve(c.lv[3]) }));
const FIX = { ac: 150, lk: 80 }, FINE = 100, SAT_WARN = 70, SAT_OVER = 50, SAT_MISS = 6, LEAK_R = 20;
/* ทิ้งของลงพื้น: ค่าปรับ (฿) ที่ห้องคัดแยก/ท่ารถ · ต่อหน้าลูกค้า = ปรับเงินมากกว่า + ความพอใจลด · max = ของบนพื้นได้พร้อมกันกี่ชิ้น · FR = ระยะเก็บของจากพื้น */
const DROP = { room: 10, shop: 25, sat: 3, max: 8 }, FR = 14;
/* สายพานตรง: เครื่องรับฝากแต่ละตัว (y 361) → ทะลุช่องผนัง → โต๊ะปลายสายพานในห้องคัดแยก (y 284) */
const BELT = { Y0: 361, Y1: 284, SP: 42 }; BELT.L = BELT.Y0 - BELT.Y1;
const UPG = [
  { id: 'ws', ic: '🎀', name: 'อุปกรณ์ห่อ', desc: 'ห่อพัสดุเร็วขึ้น', cost: [100, 200, 350] },
  { id: 'cs', ic: '💻', name: 'คอมรับฝาก', desc: 'รับฝากเร็วขึ้น', cost: [100, 200, 350] },
  { id: 'wt', ic: '📦', name: 'โต๊ะห่อเพิ่ม', desc: 'เพิ่มช่องห่อ (สูงสุด 3)', cost: [150, 300] },
  { id: 'ct', ic: '🧾', name: 'เคาน์เตอร์เพิ่ม', desc: 'เพิ่มช่องรับฝาก (สูงสุด 3)', cost: [150, 300] },
  { id: 'belt', ic: '🛤️', name: 'สายพาน', desc: 'เครื่องรับฝากละ 1 สาย (สูงสุด 3)', cost: [250, 350, 450] },
  { id: 'bags', ic: '🛍️', name: 'ถุงคัดแยกเพิ่ม', desc: 'ถุงคัดแยกประเภทละ 2 ถุง', cost: [300] },
  { id: 'cart', ic: '🛒', name: 'รถเข็น', desc: 'รถเข็นของกลาง จอดไว้ตรงไหนก็ได้ ใครก็ใช้ได้ ใส่ถุงเต็มหลายใบแล้วเข็นไปขึ้นรถ', cost: [200, 350, 550] }
];
/* พิกัดโลก: ท่ารถ y 0–148 · ห้องคัดแยก y 148–296 · หน้าร้าน y 296–448 */
const ST = [
  { id: 'box', k: 'box', r: [8, 326, 24, 18] },
  /* โต๊ะ/เคาน์เตอร์กว้างน้อยลงนิดหน่อย (ช่องว่างระหว่างกัน 20) และเลื่อนลง 12 ทำให้ทางเดินหลังโต๊ะกว้างขึ้น */
  { id: 'w0', k: 'wrap', i: 0, r: [52, 360, 24, 16] }, { id: 'w1', k: 'wrap', i: 1, r: [96, 360, 24, 16] }, { id: 'w2', k: 'wrap', i: 2, r: [140, 360, 24, 16] },
  { id: 'c0', k: 'cnt', i: 0, r: [192, 360, 20, 16] }, { id: 'c1', k: 'cnt', i: 1, r: [232, 360, 20, 16] }, { id: 'c2', k: 'cnt', i: 2, r: [272, 360, 20, 16] },
  { id: 'ac', k: 'ac', r: [170, 324, 16, 8] },
  { id: 'bl0', k: 'belt', i: 0, r: [191, 268, 22, 28] }, { id: 'bl1', k: 'belt', i: 1, r: [231, 268, 22, 28] }, { id: 'bl2', k: 'belt', i: 2, r: [271, 268, 22, 28] },
  { id: 'bE', k: 'bag', t: 'E', j: 0, r: [104, 184, 16, 18] }, { id: 'bE2', k: 'bag', t: 'E', j: 1, r: [128, 184, 16, 18] },
  { id: 'bR', k: 'bag', t: 'R', j: 0, r: [176, 184, 16, 18] }, { id: 'bR2', k: 'bag', t: 'R', j: 1, r: [200, 184, 16, 18] },
  { id: 'bN', k: 'bag', t: 'N', j: 0, r: [248, 184, 16, 18] }, { id: 'bN2', k: 'bag', t: 'N', j: 1, r: [272, 184, 16, 18] },
  { id: 'tk', k: 'truck', r: [204, 62, 8, 32] }
];
const WALLS = [[0, 0, W, 36], [0, 148, 322, 36], [346, 148, 14, 36], [0, 296, 322, 30], [346, 296, 14, 30], [0, 442, W, 10]];
const WSLOT = [[64, 404], [108, 404], [152, 404]], CSLOT = [[202, 404], [242, 404], [282, 404]], DOOR = [24, 474];
const SPAWN = [[56, 342], [96, 342], [128, 342], [160, 342]];
const QS = []; for (const y of [424, 438]) for (let x = 48; x <= 336; x += 24) QS.push([x, y]);
QS.sort((a, b) => Math.hypot(a[0] - 180, a[1] - 404) - Math.hypot(b[0] - 180, b[1] - 404));
const r1 = v => Math.round(v * 10) / 10, rnd = n => (Math.random() * n) | 0;
const isBags = h => !!h && /^[ern]+$/.test(h), isParcel = h => !!h && h.length === 1 && 'ERN'.includes(h);
let G = null, emit = () => {};
let sel = [0, 0, 0, 0];   /* ตัวละครที่แต่ละช่องผู้เล่นเลือก (ค้างไว้ข้ามรอบ/ข้ามการเริ่มใหม่) */
function setChar(i, c) { c = c | 0; if (c < 0 || c >= CHARS.length) c = 0; sel[i] = c; if (G && G.pl && G.pl[i]) G.pl[i].ch = c; }
const chr = p => CHARS[p.ch | 0] || CHARS[0];
/* ห้ามเลือกตัวละครซ้ำกัน: ตัวที่ผู้เล่นคนอื่น (ที่ต่ออยู่) ใช้อยู่ = taken · freeChar = ตัวว่างตัวแรก (ไม่นับตัวลับ) ให้คนที่เพิ่งเข้าห้อง */
const chTaken = (ch, except) => G ? G.pl.findIndex((p, j) => j !== except && p.c && (p.ch | 0) === (ch | 0)) : -1;
const freeChar = i => { for (let c = 0; c < CHARS.length; c++) if (!CHARS[c].secret && chTaken(c, i) < 0) return c; return 0; };

const lv = id => (G && G.up ? G.up[id] : 0);
const cartCap = () => CART[lv('cart')];
/* รถเข็น: G.cart = { x, y, f, b: ถุงในรถ (ตัวพิมพ์เล็ก), by: คนที่กำลังเข็น (-1 = จอดอยู่) } · ไม่มีรถถ้ายังไม่ได้ซื้อ */
const pusher = p => !!(G && G.cart && G.cart.by >= 0 && G.pl[G.cart.by] === p);
const cartTarget = p => [p.x + (p.f < 0 ? -14 : 14), p.y];
const cartSt = () => { const c = G.cart; return c ? { id: 'rk', k: 'cart', r: [c.x - 10, c.y - 15, 20, 17] } : null; };
function cartReach(p) {
  if (!G.cart || pusher(p)) return null;
  const s = cartSt(), r = s.r, dx = Math.max(r[0] - p.x, 0, p.x - r[0] - r[2]), dy = Math.max(r[1] - p.y, 0, p.y - r[1] - r[3]);
  return Math.hypot(dx, dy) < 13 ? s : null;
}
const active = s => !G || (s.k === 'wrap' ? s.i <= lv('wt') : s.k === 'cnt' ? s.i <= lv('ct') : s.k === 'belt' ? lv('belt') > s.i : s.k === 'bag' ? (s.j ? lv('bags') > 0 : true) : s.k === 'ac' ? !!G.ev.ac : true);
const leakSt = l => l.st || (l.st = { id: l.id, k: 'leak', r: [l.x - 10, l.y - 5, 20, 10] });
const stList = () => (G && G.ev && G.ev.lk.length ? ST.concat(G.ev.lk.map(leakSt)) : ST);
const flSt = f => f.st || (f.st = { id: f.id, k: 'floor', t: f.t, r: [f.x - 8, f.y - 12, 16, 14] });   /* ของที่ทิ้งไว้บนพื้น (ทำเป็นสถานีเสมือน ไว้ใช้วาดกรอบ/ตัวช่วย) */
const stn = id => (id === 'rk' && G && G.cart ? cartSt() : null) || ST.find(s => s.id === id) || (G && G.ev ? G.ev.lk.map(leakSt).find(s => s.id === id) : null) || (G && G.fl ? (G.fl.map(flSt).find(s => s.id === id) || null) : null);
/* สายพานหลังเคาน์เตอร์เป็นสายพานแบนติดพื้น: ตัวละครเดินข้ามได้ (เดิมกั้นทางจนต้องอ้อมไปฝั่งลูกค้า) · ส่วนที่ทะลุผนังก็ยังถูกผนังกั้นตามปกติ */
const hit = (r, x, y) => x + 4 > r[0] && x - 4 < r[0] + r[2] && y + 2 > r[1] && y - 2 < r[1] + r[3];
function blocked(x, y) {
  if (x < 6 || x > W - 6) return true;
  for (const s of ST) { if (s.k === 'ac' || ((s.k === 'belt' || s.k === 'bag') && !active(s))) continue; if (hit(s.r, x, y)) return true; }
  for (const r of WALLS) if (hit(r, x, y)) return true;
  return false;
}
function near(x, y) {
  let b = null, bd = 13;
  for (const s of stList()) {
    if (!active(s)) continue;
    const r = s.r, dx = Math.max(r[0] - x, 0, x - r[0] - r[2]), dy = Math.max(r[1] - y, 0, y - r[1] - r[3]), d = Math.hypot(dx, dy);
    if (d < bd) { bd = d; b = s; }
  }
  return b;
}
/* ช่วยเลี่ยงมุม: ถ้าตัวละครเกยขอบช่องแคบอยู่ไม่เกิน 4px ให้ค่อย ๆ ไถเข้าช่องเอง จะได้ไม่ติดตามมุมโต๊ะ/ช่องระหว่างเคาน์เตอร์
   (ขยับตามแกนที่ไม่ได้ชน: ax = 'x' คือชนตอนเดินแนวตั้ง → ไถซ้าย/ขวา · ax = 'y' คือชนตอนเดินแนวนอน → ไถขึ้น/ลง) */
const NUDGE = 4;
function nudge(p, nx, ny, ax, mv, side) {
  if (Math.abs(mv) < 1e-4) return false;
  let best = 0;
  for (let k = 1; k <= NUDGE && !best; k++) {
    const a = ax === 'x' ? !blocked(nx + k, ny) && !blocked(p.x + k, p.y) : !blocked(nx, ny + k) && !blocked(p.x, p.y + k);
    const b = ax === 'x' ? !blocked(nx - k, ny) && !blocked(p.x - k, p.y) : !blocked(nx, ny - k) && !blocked(p.x, p.y - k);
    if (a && b) best = side < 0 ? -k : k; else if (a) best = k; else if (b) best = -k;
  }
  if (!best) return false;
  const st = Math.sign(best) * Math.min(Math.abs(best), Math.abs(mv) * 1.1 + 0.05);
  if (ax === 'x') p.x += st; else p.y += st;
  return true;
}
/* เดินแบบมีความเร่ง/หน่วง: หยุดเร็ว ไม่ไถล */
function steer(p, ix, iy, dt) {
  const m = Math.hypot(ix, iy);
  let tx = 0, ty = 0;
  /* ความเร็วตามตัวละคร: มือว่างใช้ walk · ถือของหรือเข็นรถที่มีถุงใช้ carry */
  const C = chr(p), vm = VMAX * (p.h || (pusher(p) && G.cart.b) ? C.carry : C.walk);
  if (m > 0.12) { const s = Math.min(1, (m - 0.12) / 0.6 + 0.25); tx = ix / m * vm * s; ty = iy / m * vm * s; }
  const ax = (v, t) => { const a = (t === 0 || Math.abs(t) < Math.abs(v) || t * v < 0) ? DEC : ACC; return v + Math.max(-a * dt, Math.min(a * dt, t - v)); };
  p.vx = ax(p.vx || 0, tx); p.vy = ax(p.vy || 0, ty);
  const nx = p.x + p.vx * dt, ny = p.y + p.vy * dt;
  if (!blocked(nx, p.y)) p.x = nx; else if (!nudge(p, nx, p.y, 'y', p.vx * dt, iy)) p.vx = 0;
  if (!blocked(p.x, ny)) p.y = ny; else if (!nudge(p, p.x, ny, 'x', p.vy * dt, ix)) p.vy = 0;
  if (m > 0.2 && Math.abs(ix) > 0.15) p.f = ix < 0 ? -1 : 1;
  p.mv = Math.hypot(p.vx, p.vy) > 8 ? 1 : 0;
}
const pop = (x, y, t, c) => emit({ k: 'pop', x, y, t, c });
const snd = n => emit({ k: 'snd', n });
const tev = n => emit({ k: 'tut', n });
const toast = (t, c) => emit({ k: 'toast', t, c });
const wc = i => G.cu.find(c => c.k === 'W' && c.ws === i && c.ar);
const cc = i => G.cu.find(c => c.k === 'C' && c.cs === i && c.ar);
const leaked = (x, y) => G.ev.lk.some(l => Math.hypot(l.x - x, l.y - y) < LEAK_R);

function reset(np, tut) {
  const old = G ? G.pl : null;
  G = { ph: 'play', np: np || 1, tut: !!tut, day: 1, sc: 0, tot: 0, sat: 100, why: '', up: { ws: 0, cs: 0, wt: 0, ct: 0, belt: 0, bags: 0, cart: 0 }, ev: { ac: 0, lk: [] }, lid: 0, fl: [], fid: 0, done: 0, nid: 0, cart: null, cm: 0, _cm: new Map(), pl: [] };
  for (let i = 0; i < 4; i++) G.pl.push({ c: old ? old[i].c : 0, ch: sel[i], x: SPAWN[i][0], y: SPAWN[i][1], vx: 0, vy: 0, h: '', f: 1, mv: 0, lt: null, ld: null, hd: 0 });
  startDay(); return G;
}
/* เหตุการณ์สุ่มของวัน: เริ่มวันที่ 2 เป็นต้นไป ยิ่งนานยิ่งบ่อย */
function genEvents() {
  const d = G.day, q = []; if (d < 2) return q;
  let n = Math.random() < Math.min(0.9, 0.25 + 0.07 * d) ? 1 : 0;
  if (d >= 6 && Math.random() < 0.45) n++; if (d >= 10 && Math.random() < 0.4) n++;
  for (let i = 0; i < n; i++) q.push({ at: 15 + Math.random() * (DAY_T - 50), k: Math.random() < 0.42 ? 'ac' : 'lk' });
  return q.sort((a, b) => a.at - b.at);
}
function fire(e) {
  if (e.k === 'ac' && !G.ev.ac) { G.ev.ac = 1; toast('🥵 แอร์พัง! คนเยอะ ๆ ลูกค้าจะร้อนแล้วเดินหนี · ไปซ่อมที่แผงควบคุมข้างผนัง', 'r'); snd('bad'); return; }
  if (G.ev.lk.length >= 2) return;
  const act = [...WSLOT.slice(0, lv('wt') + 1), ...CSLOT.slice(0, lv('ct') + 1)];
  let x, y;
  if (Math.random() < 0.7) { const s = act[rnd(act.length)]; x = s[0] + rnd(9) - 4; y = s[1] + rnd(5) - 2; } else { x = 60 + rnd(260); y = 422 + rnd(18); }
  if (G.ev.lk.some(l => Math.hypot(l.x - x, l.y - y) < 26)) return;
  G.ev.lk.push({ id: 'L' + (++G.lid), x, y });
  toast('🌧️ หลังคารั่ว! ลูกค้าจะไม่ยืนตรงรอยรั่ว · ไปซ่อม (฿' + FIX.lk + ')', 'r'); snd('bad');
}
function startDay() {
  const t = G.tut;
  Object.assign(G, { ph: 'play', tm: t ? 0 : DAY_T, cl: 0, el: 0, st: 2.5, spawned: 0, cu: [], cs: [0, 0, 0], ws: [0, 0, 0], cp: ['', '', ''], bg: { E: [0, 0], R: [0, 0], N: [0, 0] }, belt: [], bq: [[], [], []], fl: [],
    tr: { st: t ? 'wait' : 'away', t: t ? 999 : 22, ld: 0 }, evq: t ? [] : genEvents(), stats: { sv: 0, ms: 0, sh: 0, inc: 0, left: 0, tip: 0, rep: 0, fine: 0, bill: 0, late: 0, drop: 0 } });
  G.pl.forEach((p, i) => { p.x = SPAWN[i][0]; p.y = SPAWN[i][1]; p.vx = p.vy = 0; p.h = ''; p.lt = null; p.ld = null; });
  /* รถเข็น: กลับมาจอดที่จุดเดิมในห้องคัดแยกทุกวัน (ถุงในรถถูกเคลียร์เหมือนของที่ถืออยู่) */
  G.cart = lv('cart') > 0 ? { x: CART_HOME[0], y: CART_HOME[1], f: 1, b: '', by: -1 } : null;
  if (!t && lv('cart') > (G.cm | 0)) {
    const first = !(G.cm | 0); G.cm = lv('cart');
    toast(first ? '🛒 รถเข็นมาแล้ว! จอดอยู่ที่ห้องคัดแยก (ป้าย "รถเข็น") · ถือถุงเต็มแล้วกดปุ่ม = ใส่รถ · มือว่างกดปุ่ม = เข็นรถ · ปุ่ม ⬇ = จอดไว้ตรงไหนก็ได้ ใครใช้ก็ได้' : '🛒 รถเข็นใหญ่ขึ้นแล้ว! ใส่ถุงได้ ' + cartCap() + ' ใบ', '');
  }
}
function lobby() { reset(1, 0); G.ph = 'lobby'; G.pl.forEach(p => p.c = 0); return G; }
const income = v => { G.sc += v; G.tot += v; G.stats.inc += v; };
/* ความพอใจ: <70% โดนเตือน+ปรับเงิน · <50% สาขาถูกยุบ */
function addSat(v) {
  if (G.tut) return;
  const o = G.sat; G.sat = Math.max(0, Math.min(100, G.sat + v));
  if (o >= SAT_WARN && G.sat < SAT_WARN && G.sat >= SAT_OVER) { G.sc -= FINE; G.stats.fine += FINE; toast('⚠️ ความพอใจลูกค้าต่ำกว่า 70%! สำนักงานใหญ่ตักเตือนและปรับ ฿' + FINE, 'r'); snd('bad'); }
  if (G.sat < SAT_OVER && G.ph === 'play') { G.ph = 'over'; G.why = 'sat'; snd('end'); }
}
function leave(c, m, hot) {
  if (c.ws >= 0) G.ws[c.ws] = 0;
  if (c.cs >= 0) G.cs[c.cs] = 0;
  c.ws = c.cs = -1; c.qs = -1; c.q = 0; c.k = 'L'; c.m = m; c.ar = 0; c.hot = hot ? 1 : 0; c.tx = DOOR[0]; c.ty = DOOR[1];
  if (m < 0) { G.stats.ms++; pop(c.x, c.y - 30, hot ? 'ร้อนเกินไป!' : 'ลูกค้าหนี!', 'r'); snd('bad'); addSat(-SAT_MISS); }
}
function freeSlot(k) {
  const a = k === 'W' ? G.ws : G.cs, n = k === 'W' ? lv('wt') : lv('ct'), S = k === 'W' ? WSLOT : CSLOT;
  for (let i = 0; i <= n; i++) if (!a[i] && !leaked(S[i][0], S[i][1])) return i;
  return -1;
}
function spawn(force) {
  if (G.cu.filter(c => c.k !== 'L').length >= LOBBY_MAX) return false;
  const k = force ? force.k : (Math.random() < 0.55 ? 'W' : 'C'), q = Math.random(), t = force ? force.t : (q < 0.3 ? 'E' : q < 0.6 ? 'R' : 'N');
  G.cu.push({ id: ++G.nid, x: DOOR[0] + rnd(7) - 3, y: DOOR[1], k, pr: 1, pg: 0, bx: k === 'C' ? 1 : 0, w: k === 'W' ? 1 : 0, ar: 0, t, sk: rnd(6), m: 0, ws: -1, cs: -1, qs: -1, q: 0, ht: 0, hot: 0, tx: DOOR[0], ty: DOOR[1] });
  G.spawned++; return true;
}
/* จัดช่อง/คิว: ลูกค้าใหม่ไปช่องว่าง ถ้าเต็มหรือถูกรอยรั่วบังก็ไปยืนรอในล็อบบี้ */
function assign() {
  const used = new Set(); G.cu.forEach(c => { if (c.k !== 'L' && c.qs >= 0) used.add(c.qs); });
  for (const c of G.cu) {
    if (c.k === 'L' || c.ws >= 0 || c.cs >= 0) continue;
    const i = freeSlot(c.k);
    if (i >= 0) {
      if (c.qs >= 0) used.delete(c.qs); c.qs = -1; c.q = 0;
      if (c.k === 'W') { c.ws = i; G.ws[i] = c.id; c.tx = WSLOT[i][0]; c.ty = WSLOT[i][1]; } else { c.cs = i; G.cs[i] = c.id; c.tx = CSLOT[i][0]; c.ty = CSLOT[i][1]; }
    } else if (c.qs < 0 || leaked(QS[c.qs][0], QS[c.qs][1])) {
      if (c.qs >= 0) used.delete(c.qs);
      const j = QS.findIndex((p, n) => !used.has(n) && !leaked(p[0], p[1]));
      if (j >= 0) { c.qs = j; used.add(j); c.q = 1; c.tx = QS[j][0]; c.ty = QS[j][1]; }
    }
  }
}
function updC(c, dt, crowd) {
  const dx = c.tx - c.x, dy = c.ty - c.y, d = Math.hypot(dx, dy);
  if (d > 1.2) { const v = Math.min(d, 42 * dt); c.x += dx / d * v; c.y += dy / d * v; c.ar = 0; } else c.ar = 1;
  if (c.k === 'L') return;
  if (!G.tut) {
    const hot = G.ev.ac && crowd >= 3;
    c.pr -= dt / Math.max(38, 56 - G.day * 2 - G.el / 12) * (hot ? 1 + 0.08 * (crowd - 2) : 1);
    c.ht = Math.max(0, Math.min(1, c.ht + (hot ? 0.012 * (crowd - 2) : G.ev.ac ? -0.02 : -0.05) * dt));
    if (c.ht >= 1) return leave(c, -1, 1);
    if (c.pr <= 0) return leave(c, -1);
  }
  if (c.k === 'W' && c.pg >= 1) {
    const j = freeSlot('C');
    if (j >= 0) { G.ws[c.ws] = 0; G.cs[j] = c.id; c.cs = j; c.ws = -1; c.k = 'C'; c.pg = 0; c.ar = 0; c.pr = Math.min(1, c.pr + 0.25); c.tx = CSLOT[j][0]; c.ty = CSLOT[j][1]; }
  }
}
/* สายพาน: เครื่องรับฝากตัวที่ i มีสายพานของตัวเอง (i < ระดับสายพาน) พัสดุเลื่อนตรงขึ้นไปทะลุผนังถึงโต๊ะปลายสายพานตัวที่ i */
const onLane = i => G.belt.filter(b => b.l === i);
function feedBelt() {
  for (let i = 0; i < lv('belt'); i++) {
    if (!G.cp[i] || G.bq[i].length + onLane(i).length >= BQ_MAX || onLane(i).some(b => b.d < 9)) continue;
    G.belt.push({ l: i, t: G.cp[i], d: 0 }); G.cp[i] = '';
  }
}
function stepBelt(dt) {
  G.belt.forEach(b => { b.d = Math.min(BELT.L, b.d + BELT.SP * dt); });
  for (const b of G.belt.slice()) if (b.d >= BELT.L && G.bq[b.l].length < BQ_MAX) { G.bq[b.l].push(b.t); G.belt.splice(G.belt.indexOf(b), 1); }
}
const bagValue = t => CAP * Math.round(FEE[t] / 2);
/* ซ่อม: แอร์ ฿150 / หลังคารั่ว ฿80 (กดที่จุดเสียตอนเล่น หรือกดซื้อในร้านตอนจบวัน) */
function repair(id, p) {
  const isAc = id === 'ac', cost = isAc ? FIX.ac : FIX.lk;
  if (isAc ? !G.ev.ac : !G.ev.lk.some(l => l.id === id)) return false;
  if (G.sc < cost) { if (p) pop(p.x, p.y - 26, 'เงินไม่พอ ต้องใช้ ฿' + cost, 'r'); snd('bad'); return false; }
  G.sc -= cost; G.stats.rep += cost; snd('coin');
  if (isAc) G.ev.ac = 0; else G.ev.lk = G.ev.lk.filter(l => l.id !== id);
  if (p) pop(p.x, p.y - 26, 'ซ่อมแล้ว −฿' + cost, 'g');
  return true;
}
/* ปุ่มทำงานตอนนี้จะทำอะไร → [ไอคอน, ใช้ได้ไหม, กดค้างไหม] (ใช้ทั้งกับไอคอนปุ่มและตอนเลือกว่าจะเก็บของจากพื้นหรือใช้สถานี) */
function look(p, s) {
  const h = p.h, bad = h ? h[0] + '✗' : 'hand', ps = pusher(p), c = G.cart;
  if (!s) return ['hand', 0];
  if (s.k === 'cart') {
    if (!c || ps) return ['hand', 0];
    if (isBags(h)) return c.b.length < cartCap() ? ['cartin', 1] : ['cartx', 0];
    if (h === '') return c.by < 0 ? ['cart', 1] : ['hand', 0];
    return [bad, 0];
  }
  /* กำลังเข็นรถอยู่: เก็บ/ส่งถุงได้ แต่หยิบกล่อง ห่อ รับฝาก ไม่ได้ ต้องจอดรถก่อน */
  if (ps && (s.k === 'box' || s.k === 'wrap' || s.k === 'cnt' || s.k === 'belt')) return ['hand', 0];
  if (s.k === 'floor') {
    if (ps) return isBags(s.t) && c.b.length + s.t.length <= cartCap() ? [s.t[0] + '+', 1] : ['hand', 0];
    if (h === '') return [s.t[0] + '+', 1];
    return [bad, 0];
  }
  if (s.k === 'box') return h === '' ? ['B+', 1] : h === 'B' ? ['B-', 0] : [bad, 0];
  if (s.k === 'wrap') {
    const c = wc(s.i);
    if (h === 'B') return c && !c.bx ? ['B-', 1] : ['B✗', 0];
    if (h === '') return c && c.bx && c.pg < 1 ? ['tape', 1, 1] : ['hand', 0];
    return [bad, 0];
  }
  if (s.k === 'cnt') {
    if (h === '' && G.cp[s.i]) return [G.cp[s.i] + '+', 1];
    if (h === '' && cc(s.i)) return ['coin', 1, 1];
    return [bad, 0];
  }
  if (s.k === 'ac' || s.k === 'leak') return ['fix', 1];
  if (s.k === 'belt') { const q = G.bq[s.i]; return h === '' ? (q.length ? [q[0] + '+', 1] : ['hand', 0]) : [bad, 0]; }
  if (s.k === 'bag') {
    const a = G.bg[s.t].slice(0, lv('bags') + 1), room = a.some(v => v < CAP), full = a.some(v => v >= CAP);
    if (isParcel(h)) return h === s.t && room ? [h + '-', 1] : [h + '✗', 0];
    if (ps) return full && c.b.length < cartCap() ? [s.t.toLowerCase() + '+', 1] : [bad, 0];
    if (h === '') return full ? [s.t.toLowerCase() + '+', 1] : [bad, 0];
    return [bad, 0];
  }
  if (ps && c.b) return ['truck', G.tr.st === 'wait' ? 1 : 0];
  if (isBags(h)) return ['truck', G.tr.st === 'wait' ? 1 : 0];
  return [bad, 0];
}
/* ของที่ทิ้งไว้บนพื้นที่ใกล้ที่สุด */
function floorNear(x, y) {
  let b = null, bd = FR;
  for (const f of G.fl) { const d = Math.hypot(f.x - x, (f.y - y) * 1.3); if (d < bd) { bd = d; b = f; } }
  return b;
}
/* เป้าหมายของปุ่มทำงาน: สถานีที่ใกล้สุด · แต่ถ้าสถานีนั้นทำอะไรไม่ได้ และมีของบนพื้นอยู่ใกล้ ๆ ที่เก็บได้ → เก็บของจากพื้นแทน */
function tgt(p) {
  const s = near(p.x, p.y), f = G.fl && G.fl.length ? floorNear(p.x, p.y) : null, ct = G.cart ? cartReach(p) : null, sv = s && look(p, s)[1];
  if (sv) return s;
  if (f) { const fs = flSt(f); if (look(p, fs)[1]) return fs; }
  if (ct && look(p, ct)[1]) return ct;
  return s || ct;
}
/* ทิ้งของที่ถืออยู่ลงพื้น: ห้องคัดแยก/ท่ารถ = เสียเงิน · หน้าร้านต่อหน้าลูกค้า = เสียเงินมากกว่า + ความพอใจลด (ของยังอยู่บนพื้น เดินกลับมาเก็บได้) */
/* จอดรถเข็นไว้ตรงที่ยืนอยู่ (ฟรี ไม่เสียค่าปรับ) ใครมาใช้ต่อก็ได้ */
function park(p) {
  const c = G.cart; let t = cartTarget(p); if (blocked(t[0], t[1])) t = [p.x, p.y];
  c.x = r1(t[0]); c.y = r1(t[1]); c.f = p.f < 0 ? -1 : 1; c.by = -1; snd('put'); pop(p.x, p.y - 26, 'จอดรถเข็นแล้ว', 'g'); tev('park');
}
function drop(i) {
  const p = G.pl[i];
  if (!p || !p.c || G.ph !== 'play') return;
  if (pusher(p)) return park(p);
  if (!p.h) return;
  const bad = t => { pop(p.x, p.y - 26, t, 'r'); snd('bad'); };
  if (G.fl.length >= DROP.max) return bad('พื้นเต็มแล้ว เก็บของก่อน');
  const f = p.f < 0 ? -1 : 1; let x = p.x, y = p.y;
  for (const c of [[f * 11, 0], [-f * 11, 0], [0, 9], [0, -9], [f * 11, 9], [-f * 11, -9]]) {
    const cx = p.x + c[0], cy = p.y + c[1];
    if (!blocked(cx, cy) && !G.fl.some(q => Math.hypot(q.x - cx, q.y - cy) < 7)) { x = cx; y = cy; break; }
  }
  G.fl.push({ id: 'F' + (++G.fid), x: r1(x), y: r1(y), t: p.h }); p.h = ''; snd('drop');
  if (G.tut) { pop(p.x, p.y - 26, 'วางของลงพื้น', 'y'); return; }
  const seen = p.y >= FY && G.cu.some(c => c.y < 446), fine = seen ? DROP.shop : DROP.room;
  G.sc -= fine; G.stats.drop += fine;
  if (seen) { pop(p.x, p.y - 26, 'ทิ้งของต่อหน้าลูกค้า! −฿' + fine, 'r'); pop(p.x, p.y - 40, '😠 ความพอใจ −' + DROP.sat + '%', 'r'); addSat(-DROP.sat); }
  else pop(p.x, p.y - 26, 'ทิ้งของลงพื้น −฿' + fine, 'r');
}
/* กดครั้งเดียว: หยิบ/วาง/ซ่อม */
function press(i) {
  const p = G.pl[i], s = tgt(p), h = p.h, ps = pusher(p), ca = G.cart;
  const bad = t => { pop(p.x, p.y - 26, t, 'r'); snd('bad'); };
  if (!s) return;
  if (s.k === 'cart') {
    if (!ca || ps) return;
    if (isBags(h)) {
      if (ca.b.length < cartCap()) { ca.b += h; p.h = ''; snd('put'); pop(p.x, p.y - 26, 'ใส่รถ ' + ca.b.length + '/' + cartCap(), 'g'); tev('cartin'); } else bad('รถเข็นเต็มแล้ว');
    } else if (h === '') {
      if (ca.by >= 0) bad('มีคนกำลังเข็นรถอยู่'); else { ca.by = i; snd('pick'); pop(p.x, p.y - 26, 'เข็นรถ · ปุ่ม ⬇ = จอด', 'y'); tev('push'); }
    } else bad('มือไม่ว่าง');
  } else if (ps && (s.k === 'box' || s.k === 'wrap' || s.k === 'cnt' || s.k === 'belt')) bad('กำลังเข็นรถอยู่ กดปุ่ม ⬇ จอดรถก่อน');
  else if (s.k === 'floor') {
    const f = G.fl.find(q => q.id === s.id);
    if (f) {
      if (ps) {
        if (isBags(f.t) && ca.b.length + f.t.length <= cartCap()) { ca.b += f.t; G.fl = G.fl.filter(q => q !== f); snd('pick'); } else bad('ใส่รถเข็นไม่ได้');
      } else if (h === '') { p.h = f.t; G.fl = G.fl.filter(q => q !== f); snd('pick'); tev('take'); } else bad('มือไม่ว่าง');
    }
  } else if (s.k === 'box') {
    if (h === '') { p.h = 'B'; snd('pick'); tev('box'); } else if (h === 'B') { p.h = ''; snd('put'); } else bad('มือไม่ว่าง');
  } else if (s.k === 'wrap') {
    const c = wc(s.i);
    if (h === 'B') {
      if (c && !c.bx) { c.bx = 1; p.h = ''; snd('put'); tev('place'); } else if (c) bad('มีกล่องแล้ว'); else bad('ยังไม่มีลูกค้าที่โต๊ะนี้');
    } else if (h === '' && c && c.bx && c.pg < 1) pop(p.x, p.y - 26, 'กดค้างเพื่อห่อ', 'y');
    else if (h === '' && c && !c.bx) pop(p.x, p.y - 26, 'ต้องใช้กล่อง', 'y');
  } else if (s.k === 'cnt') {
    if (h === '' && G.cp[s.i]) { p.h = G.cp[s.i]; G.cp[s.i] = ''; snd('pick'); tev('take'); }
    else if (h === '' && cc(s.i)) pop(p.x, p.y - 26, 'กดค้างเพื่อรับฝาก', 'y');
    else if (h !== '') bad('วางที่เคาน์เตอร์ไม่ได้');
  } else if (s.k === 'belt') {
    const q = G.bq[s.i];
    if (h === '' && q.length) { p.h = q.shift(); snd('pick'); tev('take'); }
    else if (h === '') pop(p.x, p.y - 26, 'ยังไม่มีพัสดุมา', 'y'); else bad('มือไม่ว่าง');
  } else if (s.k === 'ac') repair('ac', p);
  else if (s.k === 'leak') repair(s.id, p);
  else if (s.k === 'bag') {
    const t = s.t, a = G.bg[t], n = lv('bags') + 1;
    if (isParcel(h)) {
      const j = s.j < n && a[s.j] < CAP ? s.j : a.slice(0, n).findIndex(v => v < CAP);
      if (h !== t) bad('ผิดถุง! ดูสีให้ตรงกัน');
      else if (j < 0) bad('ถุงเต็มแล้ว ยกไปขึ้นรถก่อน');
      else { a[j]++; p.h = ''; snd('ok'); tev('sort'); if (a[j] >= CAP) { pop(p.x, p.y - 30, 'ถุงเต็ม!', 'y'); snd('full'); } else pop(p.x, p.y - 26, a[j] + '/' + CAP, 'g'); }
    } else if (h === '' || isBags(h)) {
      const j = a[s.j] >= CAP ? s.j : a.slice(0, n).findIndex(v => v >= CAP);
      if (j >= 0) {
        /* กำลังเข็นรถ: ถุงลงรถเลย · ไม่ได้เข็น: ถือด้วยมือได้ครั้งละ 1 ใบ */
        if (ps) { if (ca.b.length < cartCap()) { a[j] = 0; ca.b += t.toLowerCase(); snd('pick'); tev('bag'); pop(p.x, p.y - 26, 'ใส่รถ ' + ca.b.length + '/' + cartCap(), 'g'); } else bad('รถเข็นเต็มแล้ว ไปขึ้นรถก่อน'); }
        else if (h.length < HAND) { a[j] = 0; p.h += t.toLowerCase(); snd('pick'); tev('bag'); }
        else bad(ca ? 'ถือถุงได้ครั้งละ 1 ใบ ใส่รถเข็นก่อน' : 'ถือถุงได้ครั้งละ 1 ใบ');
      } else pop(p.x, p.y - 26, 'ถุงนี้ ' + a[s.j] + '/' + CAP, 'y');
    } else bad('มือไม่ว่าง');
  } else if (s.k === 'truck') {
    const bags = ps ? ca.b : h;
    if (isBags(bags)) {
      if (G.tr.st === 'wait') {
        let v = 0; for (const ch of bags) v += bagValue(ch.toUpperCase());
        v = G.tut ? 40 : v; income(v); G.tr.ld += bags.length; G.stats.sh += bags.length * CAP; if (ps) ca.b = ''; else p.h = '';
        pop(p.x - 10, p.y - 26, '+' + v + '฿ ส่งแล้ว!', 'g'); snd('coin'); tev('load');
        if (G.tut) { G.done = 1; G.ph = 'over'; }
      } else bad('รถยังไม่มา รอก่อน');
    } else if (h) bad('ต้องเป็นถุงที่เต็มแล้ว'); else pop(p.x, p.y - 26, ps ? 'ยังไม่มีถุงในรถเข็น' : 'ยกถุงที่เต็มมาขึ้นรถ', 'y');
  }
}
/* กดค้าง: ห่อ / รับฝาก (ลูกค้าตอบสนองเร็ว = ได้ทิป) */
function holdAct(i, dt) {
  const p = G.pl[i], s = near(p.x, p.y), C = chr(p);
  if (!s || p.h !== '' || pusher(p)) return;
  if (s.k === 'wrap') {
    const c = wc(s.i);
    if (c && c.bx && c.pg < 1) { c.pg = Math.min(1, c.pg + dt * C.wrap / WRAPT[lv('ws')]); if (c.pg >= 1) { pop(c.x, c.y - 34, 'ห่อเสร็จ', 'g'); snd('ok'); tev('wrap'); } }
  } else if (s.k === 'cnt') {
    const c = cc(s.i);
    if (c && !G.cp[s.i]) {
      c.pg += dt * C.serve / SERVT[lv('cs')];
      if (c.pg >= 1) {
        const f = FEE[c.t] / 2, v = Math.round(f * (0.7 + 0.3 * c.pr)) + (c.w ? 10 : 0), tip = !G.tut && c.pr > 0.5 ? Math.round(f * 0.8 * (c.pr - 0.5) / 0.5) : 0;
        income(v + tip); G.stats.sv++; G.stats.tip += tip; pop(c.x, c.y - 34, '+' + v + '฿', 'g'); snd('coin'); tev('serve');
        if (tip > 0) pop(c.x, c.y - 48, '💰 ทิป +' + tip, 'y');
        addSat(c.pr > 0.5 ? 2 : 1);
        G.cp[s.i] = c.t; leave(c, 1); feedBelt();
      }
    } else if (c && G.cp[s.i] && Math.random() < dt * 2) pop(p.x, p.y - 26, 'เอาพัสดุออกก่อน', 'y');
  }
}
function input(i, d) {
  const p = G.pl[i];
  if (!p || !p.c || G.ph !== 'play') return;
  p.x = Math.max(6, Math.min(W - 6, +d.x || 0)); p.y = Math.max(36, Math.min(440, +d.y || 0));
  p.f = d.f < 0 ? -1 : 1; p.mv = d.mv ? 1 : 0; p.hd = d.hd ? 1 : 0;
  if (p.lt === null) p.lt = d.tap; else if (d.tap !== p.lt) { p.lt = d.tap; press(i); }
  const dr = d.dr | 0; if (p.ld === null) p.ld = dr; else if (dr !== p.ld) { p.ld = dr; drop(i); }
}
/* บิลค่าไฟ: ทุก 7 วัน ยิ่งสัปดาห์ผ่านไป/อัปเกรดเยอะ ยิ่งแพง */
function billAmt(d) { return 120 + 40 * Math.floor((d || G.day) / 7) + 25 * Object.values(G.up).reduce((a, b) => a + b, 0); }
function nextBill() { const d = G.day % 7 === 0 ? G.day + 7 : Math.ceil(G.day / 7) * 7; return { inDays: d - G.day, amt: billAmt(d) }; }
function endDay() {
  const S = G.stats; let left = G.cp.filter(Boolean).length + G.belt.length + G.bq.reduce((a, q) => a + q.length, 0) + G.pl.reduce((a, p) => a + (isParcel(p.h) ? 1 : 0) + (isBags(p.h) ? p.h.length * CAP : 0), 0);
  for (const t of 'ERN') left += G.bg[t][0] + G.bg[t][1];
  if (G.cart) left += G.cart.b.length * CAP;
  for (const f of G.fl) left += isParcel(f.t) ? 1 : isBags(f.t) ? f.t.length * CAP : 0;
  S.left = left; S.late = G.cu.filter(c => c.k !== 'L').length;
  if (S.ms === 0) addSat(4);
  if (G.day % 7 === 0) { S.bill = billAmt(); G.sc -= S.bill; }
  if (G.ph === 'play') { G.ph = 'shop'; snd('end'); }
}
function nextDay() { if (G.ph !== 'shop') return false; G.day++; startDay(); return true; }
function buy(id, lvl) {
  if (!G || G.ph !== 'shop') return false;
  if (id === 'ac' || /^L\d+$/.test(id)) return repair(id, null);
  const u = UPG.find(x => x.id === id); if (!u) return false;
  const l = G.up[id]; if (lvl != null && lvl !== l) return false; if (l >= u.cost.length || G.sc < u.cost[l]) return false;
  G.sc -= u.cost[l]; G.up[id]++; snd('coin'); return true;
}
const rate = () => { const x = G.el / DAY_T; return 0.45 + 2.0 * x * x; };
function step(dt) {
  if (!G || G.ph !== 'play') return;
  if (!G.tut) {
    if (!G.cl) { G.tm -= dt; if (G.tm <= 0) { G.tm = 0; G.cl = 1; toast('⏰ หมดเวลารับลูกค้าแล้ว! เคลียร์ลูกค้าที่เหลือให้หมดก่อนจบวัน (ถ้ารอนานจนเดินหนี ความพอใจก็ลดเหมือนเดิม)', ''); snd('horn'); } }
    else if (!G.cu.length) { endDay(); return; }
  }
  G.el += dt;
  if (G.tut) { if (!G.cu.length && G.spawned < 2) spawn({ k: 'W', t: 'E' }); }
  else {
    if (!G.cl) G.st -= dt;
    if (!G.cl && G.st <= 0) { spawn(); G.st = Math.max(3.6, 12 - 0.8 * (G.day - 1)) / rate() * ({ 1: 1.5, 2: 1.2, 3: 1.05, 4: 1 }[G.np] || 1); }
    while (G.evq.length && G.el >= G.evq[0].at) fire(G.evq.shift());
  }
  G.pl.forEach((p, i) => { if (p.c && p.hd) holdAct(i, dt); });
  /* รถเข็นที่มีคนเข็น: วิ่งตามหน้าคนเข็น (ถ้าคนเข็นหลุดจากเกม รถจะจอดอยู่ตรงนั้น) */
  const ca = G.cart;
  if (ca && ca.by >= 0) { const q = G.pl[ca.by]; if (!q || !q.c) ca.by = -1; else { const t = cartTarget(q); ca.x = r1(t[0]); ca.y = r1(t[1]); ca.f = q.f < 0 ? -1 : 1; } }
  const crowd = G.cu.filter(c => c.k !== 'L').length;
  assign(); G.cu.forEach(c => updC(c, dt, crowd)); G.cu = G.cu.filter(c => !(c.k === 'L' && c.ar));
  if (G.ph !== 'play') return;
  feedBelt(); stepBelt(dt);
  const T = G.tr;
  if (!G.tut) {
    T.t -= dt;
    if (T.st === 'away' && T.t <= 0) { T.st = 'in'; T.t = 1.6; snd('horn'); }
    else if (T.st === 'in' && T.t <= 0) { T.st = 'wait'; T.t = TRUCK_WAIT; T.ld = 0; }
    else if (T.st === 'wait' && T.t <= 0) { T.st = 'out'; T.t = 1.6; }
    else if (T.st === 'out' && T.t <= 0) { T.st = 'away'; T.t = TRUCK_GAP; }
  }
}
const bagId = (t, j) => 'b' + t + (j ? '2' : '');
function fullBags() { const o = [], n = lv('bags') + 1; for (const t of 'ERN') for (let j = 0; j < n; j++) if (G.bg[t][j] >= CAP) o.push({ t, j, id: bagId(t, j) }); return o; }
/* ตัวช่วยบอกขั้นตอน: คืนค่า {t: ข้อความ, s: id สถานีเป้าหมาย} */
function hint(i) {
  const p = G.pl[i], h = p.h, T = G.tr;
  const needBox = [0, 1, 2].find(j => { const c = wc(j); return c && !c.bx; });
  if (h === 'B') return needBox != null ? { t: 'วางกล่องที่โต๊ะห่อ ที่ลูกค้ายืนรอ', s: 'w' + needBox } : { t: 'ถือกล่องไว้ รอลูกค้ามาที่โต๊ะห่อ', s: null };
  if (isParcel(h)) {
    /* ไม่ชี้ว่าถุงไหน: ให้ผู้เล่นดูสีพัสดุแล้วเลือกถุงสีเดียวกันเอง */
    const a = G.bg[h].slice(0, lv('bags') + 1);
    if (a.every(v => v >= CAP)) return p.y >= FY
      ? { t: 'ถุงของพัสดุชิ้นนี้เต็มอยู่! เดินขึ้นไปห้องคัดแยก แล้วกดปุ่ม ⬇ ทิ้งพัสดุลงพื้นก่อน เพื่อยกถุงไปขึ้นรถ', s: null }
      : { t: 'ถุงสีนี้เต็มอยู่! กดปุ่ม ⬇ ทิ้งพัสดุลงพื้นก่อน (เสีย ฿' + DROP.room + ') แล้วยกถุงไปขึ้นรถ', s: null, dr: 1 };
    return { t: p.y >= FY ? 'เดินขึ้นไปห้องคัดแยกด้านหลัง ดูสีพัสดุแล้วใส่ถุงสีเดียวกัน' : 'ดูสีพัสดุ แล้วใส่ถุงสีเดียวกัน', s: null };
  }
  const ca = G.cart;
  if (ca && ca.by === i) {
    /* กำลังเข็นรถ */
    const more = ca.b.length < cartCap() && fullBags()[0];
    if (more && (T.st !== 'wait' || !ca.b)) return { t: 'เก็บถุงที่เต็มใส่รถเข็น (' + ca.b.length + '/' + cartCap() + ')', s: more.id };
    if (ca.b) return T.st === 'wait' ? { t: 'เข็นรถไปที่ท่ารถ (ห้องหลังสุด) แล้วกดปุ่ม ส่งถุงทั้งคัน!', s: 'tk' } : { t: 'เข็นรถไปรอรถที่ท่ารถ (ห้องหลังสุด)', s: 'tk' };
    return { t: 'รถเข็นว่าง · กดปุ่ม ⬇ จอดรถไว้ตรงนี้ แล้วไปทำงานอื่นได้', s: null, dr: 1 };
  }
  if (isBags(h)) {
    if (ca && ca.b.length < cartCap() && ca.by < 0 && (fullBags().length || T.st !== 'wait')) return { t: 'ใส่ถุงลงรถเข็น (' + ca.b.length + '/' + cartCap() + ') แล้วเข็นไปขึ้นรถทีเดียว', s: 'rk' };
    return T.st === 'wait' ? { t: 'ขนถุงขึ้นไปที่ท่ารถ (ห้องหลังสุด)!', s: 'tk' } : { t: 'ถือถุงขึ้นไปรอรถที่ท่ารถ', s: 'tk' };
  }
  const cand = [];
  if (ca && ca.b && ca.by < 0) cand.push({ t: 'เข็นรถเข็นที่มีถุงไปขึ้นรถ (มือว่างกดปุ่มที่รถ)', s: 'rk' });
  if (G.ev.ac && G.sc >= FIX.ac) cand.push({ t: 'แอร์พัง! ซ่อมที่แผงข้างผนัง (฿' + FIX.ac + ')', s: 'ac' });
  for (let k = 0; k < lv('belt'); k++) if (G.bq[k].length) cand.push({ t: 'หยิบพัสดุจากปลายสายพาน (ห้องคัดแยก)', s: 'bl' + k });
  [0, 1, 2].forEach(j => { if (G.cp[j] && j <= lv('ct')) cand.push({ t: 'หยิบพัสดุจากเคาน์เตอร์', s: 'c' + j }); });
  [0, 1, 2].forEach(j => { const c = cc(j); if (c && !G.cp[j]) cand.push({ t: 'รับฝากส่ง: กดปุ่มค้างไว้', s: 'c' + j }); });
  fullBags().forEach(b => cand.push({ t: 'ถุง ' + NAME[b.t] + ' เต็ม! ' + (ca ? 'ยกใส่รถเข็น' : 'ยกไปขึ้นรถ'), s: b.id }));
  G.fl.forEach(f => cand.push({ t: 'เก็บของที่ทิ้งไว้บนพื้น', s: f.id }));
  [0, 1, 2].forEach(j => { const c = wc(j); if (c && c.bx && c.pg < 1) cand.push({ t: 'ห่อพัสดุ: กดปุ่มค้างไว้', s: 'w' + j }); });
  if (needBox != null) cand.push({ t: 'หยิบกล่องที่กองกล่อง', s: 'box' });
  if (G.sc >= FIX.lk) G.ev.lk.forEach(l => cand.push({ t: 'ซ่อมรอยรั่ว (฿' + FIX.lk + ')', s: l.id }));
  if (!cand.length) return { t: 'รอลูกค้า... เตรียมตัวไว้', s: null };
  const idle = []; G.pl.forEach((q, j) => { if (q.c && q.h === '') idle.push(j); });
  return cand[Math.max(0, idle.indexOf(i)) % cand.length];
}
function snap() {
  const S = G.stats;
  return { t: 's', ph: G.ph, tm: Math.ceil(G.tm), cl: G.cl ? 1 : 0, sc: G.sc, tot: G.tot, day: G.day, sat: r1(G.sat), why: G.why, tut: G.tut ? 1 : 0, np: G.np, done: G.done ? 1 : 0,
    up: [G.up.ws, G.up.cs, G.up.wt, G.up.ct, G.up.belt, G.up.cart, G.up.bags], st: [S.sv, S.ms, S.sh, S.inc, S.left, S.tip, S.rep, S.fine, S.bill, S.late, S.drop],
    ac: G.ev.ac, lk: G.ev.lk.map(l => [l.id, r1(l.x), r1(l.y)]),
    pl: G.pl.map(p => p.c ? [r1(p.x), r1(p.y), p.h, p.f, p.mv, p.ch | 0] : 0),
    ca: G.cart ? [r1(G.cart.x), r1(G.cart.y), G.cart.f, G.cart.b, G.cart.by] : 0,
    cu: G.cu.map(c => [c.id, r1(c.x), r1(c.y), c.k, Math.round(c.pr * 100), Math.round(c.pg * 100), c.t, c.sk, c.bx, c.m, c.ws, c.cs, c.ar, Math.round(c.ht * 100), c.q ? 1 : 0, c.hot ? 1 : 0]),
    cp: G.cp, bg: [G.bg.E[0], G.bg.E[1], G.bg.R[0], G.bg.R[1], G.bg.N[0], G.bg.N[1]], tr: [G.tr.st, r1(G.tr.t), G.tr.ld], bl: G.belt.map(b => [b.l, b.t, r1(b.d)]), bq: G.bq, fl: G.fl.map(f => [f.id, f.x, f.y, f.t]) };
}
function load(m, me) {
  const prev = G.ph;
  G.ph = m.ph; G.tm = m.tm; G.cl = m.cl | 0; G.sc = m.sc; G.tot = m.tot; G.day = m.day; G.sat = m.sat; G.why = m.why; G.tut = !!m.tut; G.np = m.np; G.done = m.done;
  G.up = { ws: m.up[0], cs: m.up[1], wt: m.up[2], ct: m.up[3], belt: m.up[4], cart: m.up[5], bags: m.up[6] || 0 };
  G.stats = { sv: m.st[0], ms: m.st[1], sh: m.st[2], inc: m.st[3], left: m.st[4], tip: m.st[5], rep: m.st[6], fine: m.st[7], bill: m.st[8], late: m.st[9], drop: m.st[10] || 0 };
  G.ev = { ac: m.ac, lk: m.lk.map(a => ({ id: a[0], x: a[1], y: a[2] })) };
  m.pl.forEach((a, i) => {
    const p = G.pl[i];
    if (!a) { p.c = 0; return; }
    p.c = 1; p.h = a[2]; p.ch = a[5] | 0;
    if (i !== me || (prev !== 'play' && m.ph === 'play')) { p.x = a[0]; p.y = a[1]; p.f = a[3]; p.mv = a[4]; if (i === me) p.vx = p.vy = 0; }
  });
  const seen = new Set();
  G.cu = m.cu.map(a => {
    let c = G._cm.get(a[0]);
    if (!c) { c = { id: a[0], x: a[1], y: a[2] }; G._cm.set(a[0], c); }
    seen.add(a[0]);
    c.tx = a[1]; c.ty = a[2]; c.k = a[3]; c.pr = a[4] / 100; c.pg = a[5] / 100; c.t = a[6]; c.sk = a[7]; c.bx = a[8]; c.m = a[9]; c.ws = a[10]; c.cs = a[11]; c.ar = a[12]; c.ht = a[13] / 100; c.q = a[14]; c.hot = a[15];
    return c;
  });
  for (const id of [...G._cm.keys()]) if (!seen.has(id)) G._cm.delete(id);
  if (m.ca) { const o = G.cart || {}; o.x = m.ca[0]; o.y = m.ca[1]; o.f = m.ca[2]; o.b = m.ca[3]; o.by = m.ca[4]; G.cart = o; } else G.cart = null;
  G.cp = m.cp; G.bg = { E: [m.bg[0], m.bg[1]], R: [m.bg[2], m.bg[3]], N: [m.bg[4], m.bg[5]] }; G.tr = { st: m.tr[0], t: m.tr[1], ld: m.tr[2] };
  G.belt = m.bl.map(a => ({ l: a[0], t: a[1], d: a[2] })); G.bq = m.bq; G.fl = (m.fl || []).map(a => ({ id: a[0], x: a[1], y: a[2], t: a[3] }));
}
g.Sim = { W, H, CAP, DAY_T, FY, SY, ST, WALLS, DROP, HAND, CART_HOME, CHARS, LVMAX, chTaken, freeChar, setChar, pusher, cartTarget, look, tgt, drop, WSLOT, CSLOT, QS, DOOR, NAME, FEE, FIX, FINE, SAT_WARN, SAT_OVER, UPG, CART, VMAX, BELT, blocked, near, steer, reset, lobby, step, input, press, hint, snap, load, wc, cc, buy, nextDay, active, lv, stn, isBags, isParcel, bagValue, billAmt, nextBill,
  get G() { return G; }, set emit(f) { emit = f; } };
if (typeof module !== 'undefined') module.exports = g.Sim;
})(typeof window !== 'undefined' ? window : globalThis);
