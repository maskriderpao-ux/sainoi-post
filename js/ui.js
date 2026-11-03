/* ui.js — หน้าจอเมนู/ล็อบบี้/ร้านอัปเกรด, HUD, ป้ายชื่อและตัวเลขลอย (ตามกล้อง) */
(function (g) {
'use strict';
const $ = id => document.getElementById(id), S = g.Sim;
const LS = g.LS = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
const U = { s: 2, cam: 0, vw: S.W, L: [], pops: [], first: !LS.get('sainoi_seen') };
const CAPC = ['#ffd23f', '#4aa3df', '#5cc26f', '#ff8fb3'];

/* กล้อง: เห็นสูง 144px โลก (พอดีจอ) กว้าง vw — เลื่อนตามผู้เล่นทั้งแนวตั้ง/แนวนอน */
U.camY = 0; U.vh = 144;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
U.fit = function () {
  const sw = innerWidth, sh = innerHeight, d = devicePixelRatio || 1, cv = $('cv');
  let s = sh / U.vh, k = s * d; k = k >= 2 ? Math.floor(k) : k; s = k / d;
  const vw = Math.max(160, Math.min(S.W, Math.ceil(sw / s)));
  U.s = s; U.vw = vw;
  if (cv.width !== vw || cv.height !== U.vh || !U.built) { U.built = 1; cv.width = vw; cv.height = U.vh; g.Art.init(S); }
  const st = $('stage'); st.style.width = vw * s + 'px'; st.style.height = U.vh * s + 'px';
  const fs = Math.max(9, 4 * s);
  U.L.forEach(l => { l.e.style.fontSize = (l.d.c === 'sign' ? Math.max(11, 5.6 * s) : l.d.n ? Math.max(10, 3.9 * s) : fs) + 'px'; l.px = l.py = null; });
  U.place(); if ($('pk')) pickLayout();
};
U.labels = function () {
  const L = $('lab'); L.innerHTML = ''; U.L = [];
  g.Art.LABELS.forEach(d => {
    const e = document.createElement('div'); e.className = 'lb' + (d.c === 'sign' ? ' sign' : d.n ? ' nm' : '');
    if (d.c === 'sign') e.style.color = d.col; else e.style.background = d.c;
    L.appendChild(e); U.L.push({ d, e, t: null, px: null, py: null, v: true });
  });
  U.fit();
};
U.place = function () {
  const cam = Math.round(U.cam), camY = Math.round(U.camY), s = U.s, W = U.vw * s, Hh = U.vh * s, G = S.G;
  U.L.forEach(l => {
    const d = l.d, lk = !!d.u && S.lv(d.u) < d.i, off = (d.w === 'ac' && !(G && G.ev && G.ev.ac)) || (d.h && lk), t = lk ? d.lt : d.t, sx = d.su && S.lv(d.su) >= d.si ? d.sx : 0;
    if (l.t !== t) { l.t = t; l.e.textContent = t; l.e.classList.toggle('lk', lk); }
    if (d.n) { const mm = !!d.me; if (l.me !== mm) { l.me = mm; l.e.classList.toggle('me', mm); } }
    if (d.n) { const sp = !!d.sp; if (l.sp !== sp) { l.sp = sp; l.e.classList.toggle('sp', sp); } }
    const x = Math.round((d.x + sx - cam) * s), y = Math.round((d.y - camY) * s);
    if (l.px !== x) { l.px = x; l.e.style.left = x + 'px'; }
    if (l.py !== y) { l.py = y; l.e.style.top = y + 'px'; }
    const v = !off && x > -90 && x < W + 90 && y > -20 && y < Hh + 20;
    if (l.v !== v) { l.v = v; l.e.style.display = v ? '' : 'none'; }
  });
  U.pops.forEach(o => { o.e.style.left = clamp((o.x - cam) * s, 16, W - 16) + 'px'; o.e.style.top = (o.y - camY) * s + 'px'; });
};
U.pop = function (x, y, t, c) {
  if (x < U.cam - 10 || x > U.cam + U.vw + 10 || y < U.camY - 10 || y > U.camY + U.vh + 40) return;
  const P = $('pops'); while (U.pops.length > 14) U.pops.shift().e.remove();
  const e = document.createElement('div'); e.className = 'pop ' + (c || 'y'); e.textContent = t; e.style.fontSize = Math.max(11, 4.6 * U.s) + 'px';
  const o = { e, x, y }; U.pops.push(o); P.appendChild(e); U.place();
  setTimeout(() => { e.remove(); const i = U.pops.indexOf(o); if (i >= 0) U.pops.splice(i, 1); }, 1300);
};
let toastT = 0;
U.toast = function (t, c) {
  const e = $('toast'); e.textContent = t; e.className = c === 'r' ? 'r' : ''; e.style.display = 'block'; e.style.animation = 'none'; void e.offsetWidth; e.style.animation = '';
  clearTimeout(toastT); toastT = setTimeout(() => { e.style.display = 'none'; }, 4600);
};
/* เต็มจอ: เบราว์เซอร์บังคับให้ต้องมีการแตะก่อน จึงเรียกตอนผู้เล่นแตะครั้งแรก */
const FSE = document.documentElement;
U.fs = {
  can: !!(FSE.requestFullscreen || FSE.webkitRequestFullscreen),
  is() { return !!(document.fullscreenElement || document.webkitFullscreenElement); },
  standalone() { return (matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches || navigator.standalone === true); },
  enter() {
    try {
      const r = (FSE.requestFullscreen || FSE.webkitRequestFullscreen).call(FSE);
      Promise.resolve(r).then(() => screen.orientation && screen.orientation.lock && screen.orientation.lock('landscape')).catch(() => {});
    } catch (e) {}
  },
  exit() { try { (document.exitFullscreen || document.webkitExitFullscreen).call(document); } catch (e) {} }
};
U.show = function (ids, on) { ids.forEach(i => { const e = $(i); e.style.display = on ? (i === 'hud' || i === 'tools' ? 'flex' : (i === 'ab' || i === 'jh' ? 'flex' : 'block')) : 'none'; }); };
U.playUI = function (on) {
  U.show(['hud', 'tools', 'jz', 'ab', 'jh'], on); if (!on) { $('hint').style.display = 'none'; $('jb').style.display = 'none'; U.dropBtn(false); }
  U.voiceUI();
  if (on && g.Net && g.Net.role && !U._vtip && g.Voice && !g.Voice.ready) { U._vtip = 1; setTimeout(() => { if (g.Net.role && !g.Voice.ready) U.toast('🎤 อยากคุยกับเพื่อน? กดปุ่มไมค์มุมขวาบน'); }, 2500); }
};
/* ปุ่มไมค์ (มุมขวาบนตอนเล่น + ในล็อบบี้) และไฟเขียวคนที่กำลังพูด */
U.voiceUI = function () {
  const V = g.Voice; if (!V) return;
  const online = !!(g.Net && g.Net.role), me = online ? g.Net.me | 0 : -1;
  document.body.classList.toggle('vc', online);
  const b = $('bv'); if (b) { b.classList.toggle('off', !V.on); b.classList.toggle('on', V.on); b.classList.toggle('busy', V.busy); b.classList.toggle('sp', !!V.spk[me]); const t = V.on ? '🎙️' : '🎤'; if (b.textContent !== t) b.textContent = t; }
  const l = $('lvb'); if (l) { l.classList.toggle('on', V.on); const t = V.busy ? '⏳ กำลังขอใช้ไมค์…' : V.on ? '🎙️ ไมค์เปิดอยู่ (กดเพื่อปิด)' : '🎤 เปิดไมค์คุยกับเพื่อน'; if (l.textContent !== t) l.textContent = t; }
  document.querySelectorAll('.sl .ch[data-i]').forEach(e => e.classList.toggle('sp', !!V.spk[+e.dataset.i]));
};
if (g.Voice) g.Voice.onchange = U.voiceUI;
/* ปุ่มทิ้งของลงพื้น: โผล่เฉพาะตอนถือของ · hl = กะพริบเมื่อติดอยู่ (ถือของแต่ถุงเต็ม) */
let dropIc = '';
U.dropBtn = function (show, hl, cart) {
  const b = $('db'), ik = cart ? 'c' : 'b'; if (dropIc !== ik) { dropIc = ik; g.Art.dropIcon($('di').getContext('2d'), !!cart); b.setAttribute('aria-label', cart ? 'จอดรถเข็น' : 'ทิ้งของลงพื้น (เสียค่าปรับ)'); }
  const d = show ? 'flex' : 'none'; if (b.style.display !== d) b.style.display = d;
  b.classList.toggle('hl', !!(show && hl));
};
U.hud = function (G) {
  const tut = G.tut;
  $('sc').style.display = tut ? 'none' : ''; $('sc').textContent = '฿ ' + G.sc; $('sc').className = 'pl' + (G.sc < 0 ? ' bad' : '');
  const left = G.cu.filter(c => c.k !== 'L').length;
  $('tm').textContent = tut ? '🎓 ด่านฝึก' : G.cl ? '📅 วัน ' + G.day + ' · 🧹 ลูกค้าค้าง ' + left + ' คน' : '📅 วัน ' + G.day + ' ⏱ ' + Math.ceil(G.tm) + (G.tm <= S.DAY_T / 3 ? ' 🔥' : '');
  const m = $('ms'), v = Math.round(G.sat); m.style.display = tut ? 'none' : '';
  m.textContent = (v >= 85 ? '😊 ' : v >= 70 ? '🙂 ' : v >= 55 ? '😠 ' : '🤬 ') + v + '%'; m.className = 'pl ' + (v >= 70 ? '' : v >= 55 ? 'soon' : 'bad');
  const T = { st: G.tr.st, t: Math.ceil(G.tr.t) }, e = $('tkp'); let t = '', c = '';
  if (tut) t = '🚚 รถรออยู่';
  else if (T.st === 'away') { t = '🚚 รถมาใน ' + T.t + ' วิ'; c = T.t <= 8 ? 'soon' : ''; }
  else if (T.st === 'in') { t = '🚚 รถมาแล้ว!'; c = 'wait'; }
  else if (T.st === 'wait') { t = '🚚 รถรอ ' + T.t + ' วิ'; c = T.t <= 10 ? 'soon' : 'wait'; }
  else t = '🚚 รถออกไปแล้ว';
  e.textContent = t; e.className = 'pl ' + c;
};
U.hint = function (t, sub) {
  const e = $('hint'); if (!t) { e.style.display = 'none'; return; }
  const h = '👉 ' + t + (sub ? '<small>' + sub + '</small>' : '');
  if (e.innerHTML !== h) e.innerHTML = h; e.style.display = 'block';
};
U.act = function (key, on, hold) { const a = $('ab'); if (U._ak !== key) { U._ak = key; g.Art.icon($('ai').getContext('2d'), key); } a.classList.toggle('on', !!on); a.classList.toggle('hold', !!(on && hold)); };
U.msg = t => { const e = $('msg'); if (e) e.textContent = t || ''; };
U.ov = html => { const o = $('ov'); o.classList.remove('title'); o.style.display = html ? 'flex' : 'none'; if (html) o.innerHTML = '<div class=cd>' + html + '<div class=msg id=msg></div></div>'; };

U.menu = function (code) {
  const fsBtn = U.fs.can ? '<button class=fsq onclick="Main.full()" title="เต็มจอ" aria-label="เต็มจอ"><svg viewBox="0 0 24 24" width=22 height=22><path d="M3 9V3h6M15 3h6v6M21 15v6h-6M9 21H3v-6" fill=none stroke=currentColor stroke-width=3 stroke-linecap=square /></svg></button>' : '';
  U.ov(`<div class=ttl>${fsBtn}
<div class=tl><div class=logo><div class=lg1>📮 POSTAL RUSH CO-OP</div><div class=lth>ไปรษณีย์ไทรน้อย</div><div class=len><i></i><span>SAI NOI POST OFFICE</span><i></i></div></div>
<p class=sub>ตะลุยที่ทำการไปรษณีย์ไปกับ ต้า เท่ แค๊บ ยอด และ [???]</p><div class=crew id=crew></div></div>
<div class=tr><button class="mb gr" onclick="Main.tutorial()">🎓 ด่านฝึกหัด${U.first ? '<span class=tag>เริ่มที่นี่</span>' : ''}</button>
<button class="mb rd" onclick="Main.mk()">🏠 สร้างห้อง ชวนเพื่อน</button>
<div class=jr><input id=cd maxlength=4 placeholder=รหัสห้อง value="${code || ''}"><button class="mb bl" onclick="Main.jn()">เข้าห้อง</button></div>
<button class=mb onclick="Main.solo()">🎮 เล่นคนเดียว</button><button class=mb onclick="UI.board('menu')">🏆 อันดับ</button>
${!U.fs.can && !U.fs.standalone() ? '<p class=ios>📱 iPhone: กดปุ่มแชร์ → "เพิ่มลงในหน้าจอโฮม" แล้วเปิดจากไอคอน จะเต็มจอ</p>' : ''}</div></div>`);
  $('ov').classList.add('title'); crewStart();
};
/* ตัวละครยืนเรียงที่หน้าแรก (ขยับตัวเบา ๆ) */
let crewT = 0;
function crewStart() {
  const el = $('crew'); if (!el) return;
  const ids = [0, 1, 2, 3, 4];
  el.innerHTML = ids.map(i => `<canvas width=32 height=36 data-i=${i}></canvas>`).join('');
  const paint = () => {
    if (!$('crew')) { clearInterval(crewT); crewT = 0; return; }
    const T = performance.now() / 1000;
    el.querySelectorAll('canvas').forEach(cv => { const i = +cv.dataset.i; g.Art.portrait(cv.getContext('2d'), i, { sil: i === 4, wk: i < 4 && Math.floor(T * 1.6 + i * .7) % 4 === 0, T: T * 0.35 }); });
  };
  clearInterval(crewT); crewT = setInterval(paint, 120); paint();
}

U.lobby = function (G, me, host, code, force) {
  U._lob = { G, me, host, code };
  if (!force && U.pickBusy()) return pickRender();
  U.ov(`<p>รหัสห้อง</p><div class=code>${code}</div><p>ให้เพื่อนกด "เข้าห้อง" แล้วใส่รหัสนี้ (หรือกดชวนเพื่อนส่งลิงก์)</p>
<div class=sl>${G.pl.map((p, i) => `<span class=ch data-i=${i} style="background:${CAPC[i]}">ผู้เล่น ${i + 1}${i === me ? ' (คุณ)' : ''}<br>${p.c ? '✅ ' + (S.CHARS[p.ch | 0] || S.CHARS[0]).name : '⏳ ว่าง'}</span>`).join('')}</div>` +
    '<button class=b onclick="UI.pick(\'lobby\')">🎭 เปลี่ยนตัวละคร</button>' +
    '<button class="b vb" id=lvb onclick="Main.mic()">🎤 เปิดไมค์คุยกับเพื่อน</button>' +
    (host ? '<button class="k big" onclick="Main.start()">▶ เริ่มเกม</button><button class=b onclick="Main.share()">🔗 ชวนเพื่อน</button>' : '<p><b>รอเจ้าของห้องกดเริ่มเกม…</b></p>') + '<button class=g onclick="Main.menu()">ออก</button>');
  U.voiceUI();
};
/* ---------- เลือกตัวละคร ---------- */
const CH_KEY = 'sainoi_char', PAO_KEY = 'sainoi_pao', SECRET = '8888';
const PIPL = ['เดิน', 'ถือของ', 'ห่อของ', 'รับฝาก'], PICK_GO = { solo: '▶ เริ่มเล่น', mk: '🏠 สร้างห้อง', lobby: '✔ ตกลง' };
/* รหัสปลดล็อกเปาไม่ถูกจำถาวรแล้ว: ปลดได้เฉพาะหน้าเลือกตัวที่เปิดอยู่ตอนนั้น (เปิดหน้าเลือกใหม่ทุกครั้ง = ล็อกใหม่ ต้องกดรหัสอีก) */
const PK = { sel: 0, next: '', arg: null, fresh: false, tm: 0, warn: '', pao: false };
LS.set(PAO_KEY, '');   /* ล้างค่าปลดล็อกที่เคยจำไว้จากเวอร์ชันก่อน */
U.paoOn = () => PK.pao;
U.myChar = () => { const c = +(LS.get(CH_KEY) || 0); return c >= 0 && c < S.CHARS.length && !(S.CHARS[c].secret && !U.paoOn()) ? c : 0; };
/* ในห้องออนไลน์: ตัวที่ผู้เล่นคนอื่นเลือกไปแล้ว เลือกซ้ำไม่ได้ (คืนเลขผู้เล่นที่ถือตัวนั้นอยู่ · −1 = ว่าง) */
const pkTaken = j => PK.next === 'lobby' && U._lob ? S.chTaken(j, U._lob.me) : -1;
const pkFree = from => { for (let k = 0; k < S.CHARS.length; k++) { const j = (from + k) % S.CHARS.length; if (!(S.CHARS[j].secret && !U.paoOn()) && pkTaken(j) < 0) return j; } return from; };
/* next = 'solo' | 'mk' | 'lobby' (เลือก/เปลี่ยนตัวในห้อง) · ในห้อง: ถ้าตัวที่เคยเลือกไว้ว่างก็เริ่มที่ตัวนั้น ไม่งั้นเริ่มที่ตัวที่ถืออยู่ */
U.pick = function (next, arg) {
  PK.next = next; PK.arg = arg; PK.fresh = false;
  /* เปิดหน้าเลือกตัวใหม่ = ล็อกเปาใหม่ · ยกเว้นเปิดจากในห้องตอนที่ตัวเองเป็นเปาอยู่แล้ว (ใส่รหัสมาแล้ว) จะได้ไม่ถูกเด้งไปเป็นต้า */
  PK.pao = !!(next === 'lobby' && U._lob && S.CHARS[S.G.pl[U._lob.me].ch | 0] && S.CHARS[S.G.pl[U._lob.me].ch | 0].secret);
  if (next === 'lobby' && U._lob) { const mine = S.G.pl[U._lob.me].ch | 0, pref = U.myChar(); PK.sel = pkTaken(pref) < 0 ? pref : mine; } else PK.sel = U.myChar();
  pickRender();
};
function pickPaint(T) {
  const lock = !U.paoOn();
  document.querySelectorAll('#pk canvas[data-c]').forEach(cv => {
    const i = +cv.dataset.c, isSel = cv.parentNode.classList.contains('sel'), sil = S.CHARS[i].secret && lock;
    g.Art.portrait(cv.getContext('2d'), i, { sil, wk: isSel && !sil, T });
  });
}
/* ขยายตัวละครให้ใหญ่ที่สุดเท่าที่ยังพอดีจอ (ไม่ให้ต้องเลื่อนทั้งแนวตั้ง/แนวนอน) */
function pickLayout() {
  const e = $('pk'), cd = e && e.parentNode; if (!e) return;
  const w = Math.min(innerWidth * 0.94 - 44, 1100), cw = (w - 40) / 5;
  let k = Math.max(1, Math.min(4, Math.floor((cw - 14) / 32)));
  for (; k >= 1; k--) { e.style.setProperty('--k', k); if (cd.scrollHeight <= cd.clientHeight + 1 && cd.scrollWidth <= cd.clientWidth + 1) break; }
  if (k < 1) e.style.setProperty('--k', 1);
}
function pickRender() {
  const lockPao = !U.paoOn();
  if (pkTaken(PK.sel) >= 0) { PK.sel = pkFree(PK.sel); PK.warn = PK.warn || 'มีคนเลือกตัวที่คุณเลือกไปก่อนแล้ว'; }
  const cards = S.CHARS.map((c, i) => {
    const lk = c.secret && lockPao, tk = lk ? -1 : pkTaken(i);
    return `<div class="pc${i === PK.sel ? ' sel' : ''}${lk ? ' lk' : ''}${tk >= 0 ? ' tk' : ''}${c.secret && PK.fresh ? ' nw' : ''}" onclick="UI.pk(${i})"><canvas width=32 height=34 data-c=${i}></canvas><b>${lk ? '???' : c.name}</b>` +
      (lk ? '<div class=lkm>🔒 ใส่รหัส</div>' : tk >= 0 ? `<div class=tkm style="background:${CAPC[tk]}">ผู้เล่น ${tk + 1}<br>เลือกแล้ว</div>` : '<div class=ps>' + PIPL.map((l, j) => `<span>${l}</span><em>${Array.from({ length: S.LVMAX }, (_, k) => '<i' + (k < c.lv[j] ? ' class=on' : '') + '></i>').join('')}</em>`).join('') + '</div>') + '</div>';
  }).join('');
  U.ov(`<div id=pk><h2>🎭 เลือกตัวละคร</h2><div class=pcs>${cards}</div>
<div class=pb>${PK.next === 'lobby' ? '<button class=g onclick="UI.pback()">← กลับ</button>' : '<button class=g onclick="Main.menu()">← กลับ</button>'}<button class="k big" onclick="UI.pgo()">${PICK_GO[PK.next] || '▶ เริ่ม'}</button></div></div>`);
  pickLayout(); pickPaint(0);
  if (PK.warn) { U.msg(PK.warn); PK.warn = ''; }
  if (!PK.tm) PK.tm = setInterval(() => { if (!$('pk')) { clearInterval(PK.tm); PK.tm = 0; return; } pickPaint(performance.now() / 1000); }, 90);
}
U.pk = function (i) {
  const c = S.CHARS[i]; g.Sfx.unlock();
  if (c.secret && !U.paoOn()) { g.Sfx.play('sel'); U.padOpen(); return; }
  const tk = pkTaken(i);
  if (tk >= 0) { g.Sfx.play('deny'); U.msg('ตัวนี้ผู้เล่น ' + (tk + 1) + ' เลือกไปแล้ว เลือกซ้ำไม่ได้'); return; }
  if (PK.sel === i) return;
  PK.sel = i; g.Sfx.play('sel'); U.msg('');
  document.querySelectorAll('#pk .pc').forEach((e, j) => e.classList.toggle('sel', j === i));
  pickPaint(performance.now() / 1000);
};
U.pgo = function () {
  if (!$('pk')) return;
  const c = S.CHARS[PK.sel]; if (c.secret && !U.paoOn()) return U.padOpen();
  if (pkTaken(PK.sel) >= 0) { g.Sfx.play('deny'); PK.sel = pkFree(PK.sel); return pickRender(); }
  LS.set(CH_KEY, String(PK.sel)); g.Main.go(PK.next, PK.sel, PK.arg);
};
U.pback = function () { const l = U._lob; if (l) U.lobby(S.G, l.me, l.host, l.code, true); };
/* ห้องเปลี่ยนสถานะระหว่างอยู่หน้าเลือกตัว (มีคนเลือกตัวอื่น/เข้า/ออก) → วาดหน้าเลือกใหม่ให้ตัวที่ไม่ว่างเทาลง */
U.pickBusy = () => !!$('pk') && PK.next === 'lobby';
U.pickWarn = t => { PK.warn = t; };

/* ---------- แป้นกดรหัสแบบโทรศัพท์ (พิกเซล · ไม่เรียกคีย์บอร์ดของระบบ) ---------- */
const BMP = {
  back: ['..X....', '.XX....', 'XXXXXXX', '.XX....', '..X....'],
  ok: ['......X', '.....XX', 'X...XX.', 'XX.XX..', '.XXX...', '..X....']
};
function bmpCanvas(rows, k, col) {
  const c = document.createElement('canvas'); c.width = rows[0].length * k; c.height = rows.length * k; const p = c.getContext('2d'); p.fillStyle = col;
  rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) if (r[x] === 'X') p.fillRect(x * k, y * k, k, k); });
  return c;
}
const PAD = { code: '', busy: false, el: null };
U.padOn = false;
function padBuild() {
  const e = document.createElement('div'); e.id = 'pad';
  e.innerHTML = '<div id=phn><button id=px aria-label="ปิด">✕</button><div class=spk></div><div id=lcdw><div id=lcd></div><div id=lmsg></div></div><div id=keys></div><div class=ptx>เบอร์โทรลับ…</div></div>';
  document.body.appendChild(e);
  const keys = e.querySelector('#keys'), K = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'back', '0', 'ok'];
  K.forEach(k => {
    const b = document.createElement('button'); b.className = 'pkey' + (k === 'ok' ? ' okk' : k === 'back' ? ' bk' : ''); b.dataset.k = k; b.setAttribute('aria-label', k);
    b.appendChild(BMP[k] ? bmpCanvas(BMP[k], 4, '#2b1d22') : g.Art.glyphCanvas(k, 4, '#2b1d22'));
    b.onpointerdown = ev => { ev.preventDefault(); g.Sfx.unlock(); U.padKey(k); };
    keys.appendChild(b);
  });
  e.querySelector('#px').onclick = () => U.padClose();
  e.addEventListener('pointerdown', ev => { if (ev.target === e) U.padClose(); });
  PAD.el = e; return e;
}
function padLcd(msg, cls) {
  const l = $('lcd'); l.textContent = '';
  for (let i = 0; i < 4; i++) {
    const d = PAD.code[i];
    if (d !== undefined) l.appendChild(g.Art.glyphCanvas(d, 5, '#24331a'));
    else { const u = document.createElement('i'); l.appendChild(u); }
  }
  $('lcdw').className = cls || ''; $('lmsg').textContent = msg == null ? 'ใส่รหัส 4 หลัก' : msg;
}
U.padOpen = function () {
  const e = PAD.el || padBuild(); PAD.code = ''; PAD.busy = false; U.padOn = true; e.style.display = 'flex'; e.classList.remove('shk'); padLcd();
};
U.padClose = function () { if (PAD.el) PAD.el.style.display = 'none'; U.padOn = false; PAD.busy = false; };
U.padKey = function (k) {
  if (!U.padOn || PAD.busy) return;
  if (k === 'back') { if (PAD.code) { PAD.code = PAD.code.slice(0, -1); g.Sfx.play('key'); padLcd(); } return; }
  if (k === 'ok') { if (PAD.code.length < 4) { padBad('ใส่ให้ครบ 4 หลักก่อนนะ'); return; } return padCheck(); }
  if (PAD.code.length >= 4) return;
  PAD.code += k; g.Sfx.play('key'); padLcd();
  if (PAD.code.length === 4) { PAD.busy = true; setTimeout(() => { PAD.busy = false; if (U.padOn) padCheck(); }, 260); }
};
U.padKeyEv = function (e) {   /* คีย์บอร์ดจริง (คอม): เลข / Backspace / Enter / Esc */
  if (e.key >= '0' && e.key <= '9' && e.key.length === 1) { U.padKey(e.key); return true; }
  if (e.key === 'Backspace') { U.padKey('back'); return true; }
  if (e.key === 'Enter') { U.padKey('ok'); return true; }
  if (e.key === 'Escape') { U.padClose(); return true; }
  return false;
};
function padBad(m) {
  PAD.busy = true; g.Sfx.play('deny'); const e = PAD.el; e.classList.remove('shk'); void e.offsetWidth; e.classList.add('shk'); padLcd(m, 'bad');
  setTimeout(() => { if (!U.padOn) return; PAD.code = ''; PAD.busy = false; padLcd(); }, 650);
}
function padCheck() {
  if (PAD.code !== SECRET) return padBad('รหัสไม่ถูกต้อง');
  PAD.busy = true; g.Sfx.play('unlock'); padLcd('ปลดล็อกแล้ว!', 'ok'); PK.pao = true;
  setTimeout(() => {
    U.padClose(); if (!$('pk')) return;
    PK.sel = S.CHARS.length - 1; PK.fresh = true; pickRender(); U.msg('🎉 ปลดล็อกตัวละครลับ “เปา” แล้ว!'); const m = $('msg'); if (m) m.style.color = '#2f9d57';
  }, 800);
}

/* ร้านอัปเกรด: สรุปวัน + ซ่อม + ซื้อของ */
const CAR = S.CART;
function upInfo(u, l) {
  const n = u.cost.length;
  if (u.id === 'wt' || u.id === 'ct') return [(l + 1) + ' ช่อง', (l + 2) + ' ช่อง'];
  if (u.id === 'cart') return ['ทีละ ' + CAR[l], CAR[l + 1] + ' ถุง'];
  if (u.id === 'belt') return [l + ' สาย', (l + 1) + ' สาย'];
  if (u.id === 'bags') return ['1 ถุง', '2 ถุง'];
  return ['Lv ' + l + '/' + n, 'Lv ' + (l + 1) + '/' + n];
}
U.shopKey = G => [G.ph, G.day, G.sc, Math.round(G.sat), G.ev.ac, G.ev.lk.map(l => l.id).join(), G.up.ws, G.up.cs, G.up.wt, G.up.ct, G.up.belt, G.up.bags, G.up.cart].join('|');
U.shop = function (G, host) {
  const st = G.stats, nb = S.nextBill(), v = Math.round(G.sat), old = $('ov').firstChild, top = old ? old.scrollTop : 0;
  const li = (a, b) => `<li>${a} <b style="color:${String(b)[0] === '−' ? '#c92a3b' : String(b)[0] === '+' ? '#2f9d57' : 'var(--r)'}">${b}</b></li>`, vc = v >= 70 ? '#4cd07d' : v >= 55 ? '#ffd23f' : '#ff4d5e';
  const btns = '<div class=bt>' + (host ? `<button class="k big" onclick="Main.next()">▶ เริ่มวันที่ ${G.day + 1}</button>` : '<p><b>เลือกซื้อได้เลย<br>รอเจ้าของห้องเริ่มวันใหม่…</b></p>') + '<button class=g onclick="Main.menu()">ออก</button></div>';
  const sum = `<div class=sum><div class="money${G.sc < 0 ? ' neg' : ''}">฿ ${G.sc}</div><small>เงินที่ใช้ได้${G.sc < 0 ? ' (ติดลบ!)' : ''}</small>
<div style="margin-top:3px">😊 ความพอใจ ${v}%<div class=sat><i style="width:${v}%;background:${vc}"></i></div></div>${v < 70 ? '<small style="color:#c92a3b">⚠️ ต่ำกว่า 70% โดนปรับ · ต่ำกว่า 50% สาขาถูกยุบ</small>' : ''}
<ul>${li('รายได้วันนี้', '+฿' + st.inc)}${st.tip ? li('💰 ทิป', '+฿' + st.tip) : ''}${li('รับฝากสำเร็จ', st.sv + ' คน')}${li('ลูกค้าหนี', st.ms + ' คน')}${st.fine ? li('ถูกปรับ', '−฿' + st.fine) : ''}${st.drop ? li('🗑️ ทิ้งของ', '−฿' + st.drop) : ''}${st.rep ? li('ค่าซ่อม', '−฿' + st.rep) : ''}${st.bill ? li('⚡ จ่ายบิลค่าไฟ', '−฿' + st.bill) : ''}</ul>
<small>⚡ บิลค่าไฟรอบหน้า: อีก ${nb.inDays} วัน ≈ ฿${nb.amt}</small>${btns}</div>`;
  const fx = [];
  if (G.ev.ac) fx.push(['ac', '🥵 ซ่อมแอร์', S.FIX.ac]);
  G.ev.lk.forEach(l => fx.push([l.id, '🌧️ ซ่อมหลังคารั่ว', S.FIX.lk]));
  const rep = fx.length ? '<div class=fx>' + fx.map(f => `<button class="${G.sc >= f[2] ? 'k' : 'g'}" ${G.sc >= f[2] ? '' : 'disabled'} onclick="Main.buy('${f[0]}')">${f[1]} ฿${f[2]}</button>`).join('') + '</div>' : '';
  const cards = S.UPG.map(u => {
    const l = G.up[u.id], mx = l >= u.cost.length, cost = mx ? 0 : u.cost[l], can = !mx && G.sc >= cost, inf = upInfo(u, l);
    return `<div class="uc${mx ? ' mx' : can ? ' can' : ''}"><div class=un><span>${u.ic}</span> ${u.name}</div><div class=uv>${mx ? inf[0] + ' ✅' : inf[0] + ' → <b>' + inf[1] + '</b>'}</div><small>${u.desc}</small>` +
      (mx ? '<div class=uz>เต็มแล้ว</div>' : `<button class="${can ? 'k' : 'g'}" ${can ? '' : 'disabled'} onclick="Main.buy('${u.id}',${l})">ซื้อ ฿${cost}</button>`) + '</div>';
  }).join('');
  U.ov(`<h2>📅 จบวันที่ ${G.day}</h2><div class=row style="align-items:flex-start;margin:4px 0 0">${sum}<div>${rep}<div class=ug>${cards}</div></div></div>`);
  const nw = $('ov').firstChild; if (nw && top) nw.scrollTop = top;
};
/* จบเกม: บันทึกคะแนนลงเครื่องทันที (ชื่อเดิมที่เคยใช้) · กรอกชื่อ + กดบันทึก = แก้ชื่อและส่งขึ้นอันดับออนไลน์ (เฉพาะเจ้าของห้อง/เล่นคนเดียว) */
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
U.gameover = function (G, host) {
  const best = +(LS.get('sainoi_best') || 0), rec = G.day > best; if (rec) LS.set('sainoi_best', String(G.day));
  const e = g.Board.entry(G.day, G.tot, G.pl.filter(p => p.c).length || 1);
  g.Board.save(e);
  U._go = { e, host, rec, best, saved: false, busy: false };
  U.goView();
};
U.goView = function () {
  const o = U._go, e = o.e, team = e.n > 1;
  const nm = o.saved
    ? `<p>✅ บันทึกคะแนนของ <b>${esc(e.name)}</b> แล้ว</p>`
    : `<div class=nmr><input id=nm maxlength=12 placeholder="${team ? 'ชื่อทีม' : 'ชื่อของคุณ'}" value="${esc(g.Board.name)}"><button class=b onclick="Main.save()">🏆 บันทึกคะแนน</button></div>`;
  U.ov(`<h2>🏚️ สาขาถูกยุบ!</h2><p>ความพอใจลูกค้าต่ำกว่า 50% สำนักงานใหญ่สั่งปิดสาขา</p><div class=row style="margin:6px 0"><div><p>อยู่ถึงวันที่</p><div class=code>${e.day}</div></div><div><p>รายได้รวม</p><div class=code>฿${e.tot}</div></div></div>
<p>${o.rec ? '🏆 สถิติใหม่!' : 'สถิติสูงสุด: วันที่ ' + o.best}</p>${nm}` +
    (o.saved ? '<button class=b onclick="UI.board(\'over\',\'' + e.id + '\')">🏆 ดูอันดับ</button>' : '') +
    (o.host ? '<button class="k big" onclick="Main.again()">🔁 เปิดสาขาใหม่</button>' : '<p><b>รอเจ้าของห้องเริ่มรอบใหม่…</b></p>') + '<button class=g onclick="Main.menu()">กลับเมนู</button>');
};

/* ตารางอันดับ */
const BS = { sc: 'solo', src: 'local', data: null, err: '', back: 'menu', hi: null, rank: null, note: '' };
function boardRows(list, mine) {
  if (!list.length) return '<tr class=em><td colspan=4>ยังไม่มีคะแนน — มาเป็นคนแรกเลย!</td></tr>';
  return list.slice(0, 10).map((r, i) => {
    const me = mine && (r.id ? r.id === mine.id : (r.name === mine.name && r.day === mine.day && r.tot === mine.tot));
    return `<tr class="${me ? 'me' : ''}"><td>${i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}</td><td class=bn>${esc(r.name)}</td><td>วัน ${r.day | 0}</td><td>฿${r.tot | 0}</td></tr>`;
  }).join('');
}
function boardRender() {
  const on = g.Board.online, online = on && BS.src === 'online', mine = BS.hi && U._go && U._go.e.id === BS.hi ? U._go.e : null;
  const list = online ? (BS.data ? BS.data[BS.sc] : null) : g.Board.local(BS.sc);
  const info = online ? (BS.err ? `<p style="color:#b5233b"><b>${BS.err}</b></p>` : !BS.data ? '<p>⏳ กำลังโหลดอันดับออนไลน์…</p>' : '') : '';
  const rk = BS.rank && mine ? `<p>🎉 คุณได้อันดับที่ <b>#${BS.rank}</b> ของ${mine.n > 1 ? 'ทีม' : 'คนเดียว'}ทั้งโลก!</p>` : '';
  const sc = (k, t) => `<button class="${BS.sc === k ? 'k' : 'g'}" onclick="UI.bt('${k}')">${t}</button>`, sr = (k, t) => `<button class="${BS.src === k ? 'k' : 'g'}" onclick="UI.bs('${k}')">${t}</button>`;
  U.ov(`<h2 id=bd>🏆 อันดับ</h2>${BS.note ? `<p style="color:#b5233b"><b>${esc(BS.note)}</b></p>` : ''}${rk}
<div class=tabs>${sc('solo', '🎮 เล่นคนเดียว')}${sc('team', '👥 ทีม 2–4 คน')}</div>${on ? `<div class=tabs>${sr('online', '🌐 ทั้งโลก')}${sr('local', '📱 เครื่องนี้')}</div>` : ''}${info}
<table class=bd>${list ? boardRows(list, mine) : ''}</table><small>เรียงตามวันที่อยู่รอด แล้วดูรายได้รวม${on ? '' : ' · เก็บในเครื่องนี้'}</small><br>` +
    (BS.back === 'over' && U._go ? '<button class=g onclick="UI.goView()">กลับ</button>' : '<button class=g onclick="Main.menu()">กลับเมนู</button>'));
}
U.board = function (back, hi, rank, note) {
  const e = hi && U._go && U._go.e.id === hi ? U._go.e : null;
  Object.assign(BS, { back: back || 'menu', hi: hi || null, rank: rank || null, note: note || '', src: g.Board.online ? 'online' : 'local', data: null, err: '' });
  BS.sc = e && e.n > 1 ? 'team' : 'solo';
  boardRender();
  if (g.Board.online) g.Board.top().then(d => { BS.data = d; if ($('bd')) boardRender(); }, () => { BS.err = 'โหลดอันดับออนไลน์ไม่สำเร็จ (ดูของเครื่องนี้แทนได้)'; if ($('bd')) boardRender(); });
};
U.bt = k => { BS.sc = k; boardRender(); };
U.bs = k => { BS.src = k; boardRender(); };
U.over = function (G, host) {
  U.ov(`<h2>🎉 ผ่านด่านฝึกแล้ว!</h2><p>ตอนนี้คุณรู้ครบทุกขั้นตอนแล้ว</p>${HOW}<button class="k big" onclick="Main.solo()">🎮 ลองเล่นจริงคนเดียว</button><button class=big onclick="Main.mk()">🏠 สร้างห้อง ชวนเพื่อน</button><button class=g onclick="Main.menu()">กลับเมนู</button>`);
};
g.UI = U;
})(window);
