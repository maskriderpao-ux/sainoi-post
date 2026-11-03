/* main.js — ต่อทุกส่วนเข้าด้วยกัน: ปุ่มควบคุม, ลูปเกม, ออนไลน์, ด่านฝึก */
(function (g) {
'use strict';
const $ = id => document.getElementById(id), S = g.Sim, cv = $('cv'), cx = cv.getContext('2d');
let mode = 'menu', role = '', me = 0, T = 0, acc = 0, sendAcc = 0, snapAcc = 0, last = performance.now();
let pendPick = false, shopKey = '', camX = 0, camY = S.H - 144, camSnap = true, tap = 0, dr = 0, hold = 0, ix = 0, iy = 0, hintsOn = g.LS.get('sainoi_hint') !== '0', tutN = 0, moved = !!g.LS.get('sainoi_moved'), start0 = null, lobbyKey = '';
const K = {}, TUT_STEPS = 14;
const isHost = () => role === 'host' || role === 'solo';
const lobKey = () => S.G.pl.map(p => p.c ? 1 + (p.ch | 0) : 0).join(',');

/* ---------- ควบคุม: จอยสติ๊กลอย + ปุ่มกด + คีย์บอร์ด ---------- */
const jz = $('jz'), kb = $('kb'), jb = $('jb'), ab = $('ab');
let jid = null, jo = [0, 0];
jz.onpointerdown = e => { g.Sfx.unlock(); jid = e.pointerId; jz.setPointerCapture(jid); jo = [e.clientX, e.clientY]; jb.style.cssText = `display:block;left:${jo[0] - 48}px;top:${jo[1] - 48}px`; $('jh').style.opacity = 0; };
jz.onpointermove = e => {
  if (e.pointerId !== jid) return;
  let dx = e.clientX - jo[0], dy = e.clientY - jo[1]; const m = Math.hypot(dx, dy), r = 38;
  if (m > r) { dx *= r / m; dy *= r / m; }
  ix = dx / r; iy = dy / r; kb.style.transform = `translate(${dx}px,${dy}px)`;
};
jz.onpointerup = jz.onpointercancel = e => { if (e.pointerId !== jid) return; jid = null; ix = iy = 0; jb.style.display = 'none'; kb.style.transform = ''; $('jh').style.opacity = 1; };
ab.onpointerdown = e => { g.Sfx.unlock(); tap++; hold = 1; ab.classList.add('dn'); ab.setPointerCapture(e.pointerId); e.preventDefault(); };
ab.onpointerup = ab.onpointercancel = () => { hold = 0; ab.classList.remove('dn'); };
ab.oncontextmenu = e => e.preventDefault();
const db = $('db');
db.onpointerdown = e => { g.Sfx.unlock(); dr++; db.classList.add('dn'); e.preventDefault(); };
db.onpointerup = db.onpointercancel = db.onpointerleave = () => db.classList.remove('dn');
db.oncontextmenu = e => e.preventDefault();
const KM = { KeyA: 'l', ArrowLeft: 'l', KeyD: 'r', ArrowRight: 'r', KeyW: 'u', ArrowUp: 'u', KeyS: 'd', ArrowDown: 'd' }, KA = ['Space', 'KeyJ', 'Enter', 'KeyE'], KD = ['KeyQ', 'KeyX', 'KeyK'];
onkeydown = e => {
  if (g.UI.padOn) { if (g.UI.padKeyEv(e)) e.preventDefault(); return; }
  if (e.target.tagName === 'INPUT') { if (e.key === 'Enter') Main.jn(); return; }
  g.Sfx.unlock();
  if (KM[e.code]) { K[KM[e.code]] = 1; e.preventDefault(); }
  if (KA.includes(e.code)) { if (!hold) tap++; hold = 1; e.preventDefault(); }
  if (KD.includes(e.code) && !e.repeat) { dr++; e.preventDefault(); }
};
onkeyup = e => { if (KM[e.code]) K[KM[e.code]] = 0; if (KA.includes(e.code)) hold = 0; };
$('bh').onclick = () => { hintsOn = !hintsOn; g.LS.set('sainoi_hint', hintsOn ? '1' : '0'); $('bh').classList.toggle('off', !hintsOn); };
g.Sfx.musicOn = g.LS.get('sainoi_music') !== '0'; $('bm').classList.toggle('off', !g.Sfx.musicOn);
$('bm').onclick = () => { g.Sfx.unlock(); const on = g.Sfx.toggleMusic(); g.LS.set('sainoi_music', on ? '1' : '0'); $('bm').classList.toggle('off', !on); };
$('bv').onclick = () => { g.Sfx.unlock(); g.Voice.toggle(); };
$('bs').onclick = () => { const on = g.Sfx.toggle(); $('bs').classList.toggle('off', !on); $('bs').textContent = on ? '🔊' : '🔇'; };
let xT = 0;
$('bx').onclick = () => { if (xT) { clearTimeout(xT); xT = 0; $('bx').textContent = '✕'; Main.menu(); } else { $('bx').textContent = 'ออก?'; $('bx').style.width = '54px'; xT = setTimeout(() => { xT = 0; $('bx').textContent = '✕'; $('bx').style.width = ''; }, 2500); } };
$('bh').classList.toggle('off', !hintsOn);
let fsOff = false; const touchy = matchMedia('(pointer:coarse)').matches;
const fsChange = () => { if (!g.UI.fs.is()) fsOff = true; g.UI.fit(); };
document.addEventListener('fullscreenchange', fsChange); document.addEventListener('webkitfullscreenchange', fsChange);
document.addEventListener('pointerup', () => { if (touchy && !fsOff && g.UI.fs.can && !g.UI.fs.is() && innerWidth > innerHeight) g.UI.fs.enter(); }, true);
$('bf').onclick = () => { if (g.UI.fs.is()) { fsOff = true; g.UI.fs.exit(); } else { fsOff = false; g.UI.fs.enter(); } };
if (!g.UI.fs.can) $('bf').style.display = 'none';

/* ---------- เหตุการณ์ (เสียง/ตัวเลขลอย) ---------- */
function onEv(e) {
  if (e.k === 'pop') g.UI.pop(e.x, e.y, e.t, e.c);
  else if (e.k === 'snd') g.Sfx.play(e.n);
  else if (e.k === 'tut') tutN++;
  else if (e.k === 'toast') g.UI.toast(e.t, e.c);
}
S.emit = e => { onEv(e); if (role === 'host' && e.k !== 'tut') g.Net.toAll({ t: 'e', ev: e }); };

/* ---------- เริ่ม/หยุดเกม ---------- */
function beginPlay(tut, np) {
  S.reset(np, tut); mode = 'play'; camSnap = true; tutN = 0; tap = 0; dr = 0; hold = 0; ix = iy = 0; start0 = null;
  g.UI.ov(''); g.UI.playUI(true); $('jh').style.display = moved ? 'none' : 'flex';
  try { navigator.wakeLock && navigator.wakeLock.request('screen').catch(() => {}); } catch (e) {}
}
function startLocal(tut) {
  g.Net.leave(); role = 'solo'; me = 0; g.Sfx.unlock(); S.lobby(); S.G.pl[0].c = 1;
  if (tut) { g.LS.set('sainoi_seen', '1'); g.UI.first = false; }
  beginPlay(tut, 1);
}
function openPick() { lobbyKey = lobKey(); g.UI._lob = { G: S.G, me, host: false, code: g.Net.code }; g.UI.pick('lobby'); }
function showLobby() { lobbyKey = lobKey(); g.UI.lobby(S.G, me, isHost(), g.Net.code); }
function goMenu(msg) {
  g.Net.leave(); role = ''; mode = 'menu'; S.lobby(); g.UI.playUI(false);
  g.UI.menu((new URLSearchParams(location.search).get('r') || '').toUpperCase().slice(0, 4)); if (msg) g.UI.msg(msg);
}
const Main = g.Main = {
  menu() { goMenu(); },
  mic() { g.Sfx.unlock(); g.Voice.toggle(); },
  full() { fsOff = false; g.UI.fs.enter(); },
  tutorial() { S.setChar(0, g.UI.myChar()); startLocal(true); },
  /* เล่นคนเดียว / สร้างห้อง / เข้าห้อง: ผ่านหน้าเลือกตัวละครก่อน (UI.pgo → Main.go) */
  solo() { g.Sfx.unlock(); g.UI.pick('solo'); },
  go(next, ch, arg) {
    ch |= 0;
    if (next === 'solo') { S.setChar(0, ch); startLocal(false); }
    else if (next === 'mk') { S.setChar(0, ch); Main.host(); }
    else if (next === 'lobby') Main.setCh(ch);
  },
  /* เปลี่ยนตัวละครตอนอยู่ในล็อบบี้ (ห้ามซ้ำกับคนอื่น: เจ้าของห้องเป็นคนตัดสิน) */
  setCh(ch) {
    if (role === 'host') {
      if (S.chTaken(ch, 0) >= 0) { g.UI.pickWarn('ตัวนี้มีคนเลือกไปแล้ว เลือกใหม่นะ'); return g.UI.pick('lobby'); }
      S.setChar(0, ch);
    } else if (role === 'client') { S.G.pl[me].ch = ch; g.Net.toHost({ t: 'c', ch }); }
    lobbyKey = lobKey(); g.UI.lobby(S.G, me, isHost(), g.Net.code, true);
  },
  mk() { g.Sfx.unlock(); g.UI.pick('mk'); },
  host() {
    g.Sfx.unlock(); g.UI.msg('กำลังสร้างห้อง…'); S.lobby();
    g.Net.cb = {
      hosted() { role = 'host'; me = 0; S.G.pl[0].c = 1; mode = 'lobby'; showLobby(); },
      changed() { if (mode === 'lobby') showLobby(); },
      error(t) { goMenu(t); }
    };
    g.Net.host();
  },
  jn() {
    const v = ($('cd') ? $('cd').value : '').trim().toUpperCase();
    if (v.length !== 4) return g.UI.msg('ใส่รหัสห้อง 4 ตัวอักษร');
    Main.join(v);
  },
  /* เข้าห้องก่อน แล้วค่อยเลือกตัวละคร (จะได้เห็นว่าตัวไหนมีคนเลือกไปแล้ว) */
  join(v) {
    g.Sfx.unlock(); g.UI.msg('กำลังเชื่อมต่อ…'); S.lobby();
    g.Net.cb = {
      joined(i) {
        role = 'client'; me = i; S.G.pl[i].c = 1; mode = 'lobby'; pendPick = true; g.UI.msg('เข้าห้องแล้ว กำลังโหลด…');
        setTimeout(() => { if (pendPick && mode === 'lobby') { pendPick = false; openPick(); } }, 1500);
      },
      chbad(ch) { S.G.pl[me].ch = ch | 0; if (mode === 'lobby') { g.UI.pickWarn('ตัวนั้นมีคนเลือกไปแล้ว เลือกใหม่นะ'); g.UI.pick('lobby'); } },
      snap: onSnap, event: onEv,
      error(t) { goMenu(t); },
      closed() { goMenu('เจ้าของห้องออกจากเกมแล้ว'); }
    };
    g.Net.join(v);
  },
  start() { if (role === 'host' && mode === 'lobby') beginPlay(false, g.Net.count()); },
  again() { if (role === 'host' || role === 'solo') beginPlay(false, role === 'solo' ? 1 : g.Net.count()); },
  /* จบเกม: ตั้งชื่อ + บันทึกคะแนน (เจ้าของห้อง/เล่นคนเดียวส่งขึ้นอันดับออนไลน์ด้วยถ้าเปิดใช้) */
  save() {
    const o = g.UI._go; if (!o || o.busy || o.saved) return;
    const nm = g.Board.clean($('nm') ? $('nm').value : ''); if (!nm) return g.UI.msg('ใส่ชื่อก่อนนะ');
    g.Board.name = nm; o.e.name = nm; g.Board.save(o.e); o.saved = true;
    if (g.Board.online && isHost()) {
      o.busy = true; g.UI.msg('กำลังส่งคะแนน…');
      const show = (rk, note) => { o.busy = false; if (mode === 'over' && g.UI._go === o) g.UI.board('over', o.e.id, rk, note); };
      g.Board.submit(o.e).then(d => show(d.rank | 0), () => show(0, 'ส่งคะแนนออนไลน์ไม่สำเร็จ (บันทึกในเครื่องแล้ว)'));
    } else g.UI.board('over', o.e.id);
  },
  buy(id, l) { if (isHost()) S.buy(id, l); else g.Net.toHost({ t: 'buy', id, l }); },
  next() { if (isHost() && S.nextDay()) { mode = 'play'; camSnap = true; tap = 0; dr = 0; hold = 0; ix = iy = 0; start0 = null; g.UI.ov(''); g.UI.playUI(true); } },
  share() {
    const u = location.origin + location.pathname + '?r=' + g.Net.code;
    if (navigator.share) navigator.share({ title: 'ไปรษณีย์ไทรน้อย', text: 'มาช่วยกันทำงานที่ไปรษณีย์! รหัสห้อง ' + g.Net.code, url: u }).catch(() => {});
    else if (navigator.clipboard) navigator.clipboard.writeText(u).then(() => g.UI.msg('คัดลอกลิงก์แล้ว ส่งให้เพื่อนได้เลย'));
  }
};
function onSnap(m) {
  if (role !== 'client') return;
  S.load(m, me);
  if (m.ph === 'play' && mode !== 'play') { mode = 'play'; camSnap = true; tap = 0; dr = 0; hold = 0; tutN = 0; g.UI.ov(''); g.UI.playUI(true); $('jh').style.display = moved ? 'none' : 'flex'; }
  else if (m.ph === 'shop' && mode === 'play') { mode = 'shop'; shopKey = ''; g.UI.playUI(false); }
  else if (m.ph === 'over' && mode === 'play') { mode = 'over'; g.UI.playUI(false); S.G.tut ? g.UI.over(S.G, false) : g.UI.gameover(S.G, false); }
  else if (m.ph === 'lobby' && mode === 'lobby') {
    if (pendPick) { pendPick = false; openPick(); }
    else if (lobbyKey !== lobKey()) { lobbyKey = lobKey(); showLobby(); }
  }
}

/* ---------- ตัวช่วย: ปุ่มบอกว่ากดแล้วจะทำอะไร ---------- */
const actInfo = (G, p, s) => S.look(p, s);
function hintUI(G, p) {
  if (G.ph !== 'play') return g.UI.hint('');
  let h = S.hint(me), txt = h.t, sub = '';
  if (!moved) { if (G.tut) { txt = 'ลากนิ้วบนจอฝั่งซ้ายเพื่อเดิน'; sub = 'ถ้าเล่นบนคอม ใช้ปุ่ม WASD และกด Space'; h = { s: null }; } }
  if (G.tut) sub = sub || 'ด่านฝึก ' + Math.min(tutN, TUT_STEPS) + '/' + TUT_STEPS + ' · ปุ่มวงกลมขวามือคือปุ่มทำงาน';
  g.UI.hint(hintsOn || G.tut ? txt : '', sub);
  return h;
}

/* ---------- ลูปหลัก ---------- */
function tick(dt) {
  const G = S.G; if (G.ph !== 'play') return;
  const p = G.pl[me];
  let x = ix + (K.r ? 1 : 0) - (K.l ? 1 : 0), y = iy + (K.d ? 1 : 0) - (K.u ? 1 : 0); const m = Math.hypot(x, y); if (m > 1) { x /= m; y /= m; }
  S.steer(p, x, y, dt);
  if (!start0) start0 = [p.x, p.y];
  if (!moved && Math.hypot(p.x - start0[0], p.y - start0[1]) > 24) { moved = true; g.LS.set('sainoi_moved', '1'); $('jh').style.display = 'none'; }
  if (isHost()) { S.input(me, { x: p.x, y: p.y, f: p.f, mv: p.mv, tap, dr, hd: hold }); S.step(dt); }
}
function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000); last = now; T = now / 1000;
  const G = S.G; acc += dt; let n = 0;
  while (acc >= 1 / 60 && n++ < 6) { tick(1 / 60); acc -= 1 / 60; }
  if (acc > 1 / 60) acc = 0;
  const k = 1 - Math.exp(-dt * 16);
  G.pl.forEach((p, i) => { if (!p.c) return; if (p.dx == null || i === me) { p.dx = p.x; p.dy = p.y; } else { p.dx += (p.x - p.dx) * k; p.dy += (p.y - p.dy) * k; } });
  if (role === 'client') G.cu.forEach(c => { c.x += (c.tx - c.x) * k; c.y += (c.ty - c.y) * k; });
  const C = G.cart;   /* รถเข็น: ถ้ามีคนเข็น ตามตำแหน่งที่แสดงของคนนั้น ไม่งั้นนิ่งอยู่ที่จอด */
  if (C) {
    let tx = C.x, ty = C.y; const pp = C.by >= 0 ? G.pl[C.by] : null;
    if (pp && pp.c) { const q = S.cartTarget({ x: pp.dx != null ? pp.dx : pp.x, y: pp.dy != null ? pp.dy : pp.y, f: pp.f }); tx = q[0]; ty = q[1]; }
    if (C.dx == null || Math.hypot(tx - C.dx, ty - C.dy) > 48) { C.dx = tx; C.dy = ty; } else { C.dx += (tx - C.dx) * k; C.dy += (ty - C.dy) * k; }
  }
  if (role === 'host') { snapAcc += dt; if (snapAcc >= 0.05) { snapAcc = 0; g.Net.toAll(S.snap()); } }
  if (role === 'client' && mode === 'play') { sendAcc += dt; if (sendAcc >= 1 / 30) { sendAcc = 0; const p = G.pl[me]; g.Net.toHost({ t: 'i', x: +p.x.toFixed(1), y: +p.y.toFixed(1), f: p.f, mv: p.mv, tap, dr, hd: hold }); } }
  if (isHost() && mode === 'play' && G.ph === 'over') { mode = 'over'; g.UI.playUI(false); G.tut ? g.UI.over(G, true) : g.UI.gameover(G, true); }
  if (isHost() && mode === 'play' && G.ph === 'shop') { mode = 'shop'; shopKey = ''; g.UI.playUI(false); }
  if (mode === 'shop') { const k = g.UI.shopKey(G); if (k !== shopKey) { shopKey = k; g.UI.shop(G, isHost()); } }
  if (mode === 'play') {
    const p = G.pl[me], vw = g.UI.vw, vh = g.UI.vh, mw = S.W - vw, mh = S.H - vh, px = p.dx != null ? p.dx : p.x, py = (p.dy != null ? p.dy : p.y) - 8;
    const mx = camX + vw / 2, my = camY + vh / 2, dzx = 26, dzy = 18; let tx = camX, ty = camY;
    if (px > mx + dzx) tx = px - dzx - vw / 2; else if (px < mx - dzx) tx = px + dzx - vw / 2;
    if (py > my + dzy) ty = py - dzy - vh / 2; else if (py < my - dzy) ty = py + dzy - vh / 2;
    tx = Math.max(0, Math.min(mw, tx)); ty = Math.max(0, Math.min(mh, ty));
    if (camSnap) { camX = Math.max(0, Math.min(mw, px - vw / 2)); camY = Math.max(0, Math.min(mh, py - vh / 2)); camSnap = false; }
    else {
      const kc = 1 - Math.exp(-dt * 7);
      camX += (tx - camX) * kc; camY += (ty - camY) * kc;
      if (Math.abs(tx - camX) < 0.05) camX = tx; if (Math.abs(ty - camY) < 0.05) camY = ty;
    }
  } else if (mode !== 'shop') { camX = 0; camY = S.H - g.UI.vh; }
  /* เพลง: เล่นตอนเล่น/ร้านค้า (ร้านค้าเบาลง) · ช่วงเร่งด่วนหรือเคลียร์ลูกค้าท้ายวัน = เร่งจังหวะ */
  g.Sfx.music(mode === 'play' || mode === 'shop' || mode === 'menu', mode === 'play' && !G.tut && (G.cl || G.tm <= S.DAY_T / 3), mode === 'shop', mode === 'menu');
  g.UI.cam = camX; g.UI.camY = camY; g.UI.place();
  let hs = null, near = null;
  if (mode === 'play') {
    const p = G.pl[me]; near = S.tgt(p);
    const h = hintUI(G, p); hs = hintsOn || G.tut ? h.s : null;
    const a = actInfo(G, p, near); g.UI.act(a[0], a[1], a[2]); const pu = S.pusher(p); g.UI.dropBtn(!!p.h || pu, !!(h.dr && (hintsOn || G.tut)), pu); g.UI.hud(G);
  }
  g.Art.draw(cx, G, { cam: camX, camY, me, T, near: near && near.id, showNear: mode === 'play', hintS: hs });
  requestAnimationFrame(frame);
}

/* ---------- เริ่มต้น ---------- */
g.UI.labels(); onresize = g.UI.fit;
S.lobby(); g.UI.menu((new URLSearchParams(location.search).get('r') || '').toUpperCase().slice(0, 4));
requestAnimationFrame(frame);
})(window);
