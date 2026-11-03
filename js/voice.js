/* voice.js — คุยด้วยเสียงในห้องแบบดิสคอร์ด
   - เสียงวิ่งตรงถึงกันระหว่างเครื่อง (WebRTC peer-to-peer ผ่าน PeerJS ตัวเดิม) ไม่มีเซิร์ฟเวอร์เสียง ไม่มีค่าใช้จ่ายเพิ่ม
   - ใครกดปุ่ม 🎤 ก่อน เครื่องนั้นจะโทรหาทุกคนในห้อง คนที่ไม่ได้เปิดไมค์ก็ได้ยินคนที่พูด · ไม่มีใครเปิดไมค์ = ไม่มีการส่งเสียงเลย
   - เสียงที่ส่งออกไปผ่าน "ท่อ" เดียว (MediaStreamDestination) เปิด/ปิดไมค์ก็แค่ต่อ/ตัดสายภายใน ไม่ต้องเจรจาสายใหม่
   - มีตัวตรวจว่าใครกำลังพูด (V.spk[ช่องผู้เล่น]) ไว้ทำไฟเขียวที่ป้ายชื่อ */
(function (g) {
'use strict';
const V = { on: false, ready: false, busy: false, spk: [false, false, false, false], onchange: null };
V.supported = !!(g.navigator && navigator.mediaDevices && navigator.mediaDevices.getUserMedia && (g.AudioContext || g.webkitAudioContext) && g.RTCPeerConnection);
let ctx = null, dest = null, out = null, mic = null, micSrc = null, gain = null, micAn = null;
let R = [null, null, null, null], ME = 0, calls = {}, nodes = {}, engaged = false, tm = 0, hold = [0, 0, 0, 0], tries = {};
const buf = new Uint8Array(512), TH = 0.018, HOLD = 380;
const say = (t, c) => { try { g.UI && g.UI.toast(t, c); } catch (e) {} };
const changed = () => { try { V.onchange && V.onchange(); } catch (e) {} };

function ensureCtx() {
  if (ctx) return ctx;
  const AC = g.AudioContext || g.webkitAudioContext;
  ctx = new AC(); dest = ctx.createMediaStreamDestination(); out = dest.stream;
  return ctx;
}
/* เบราว์เซอร์ต้องการให้มีการแตะก่อนถึงจะเริ่มเล่นเสียง: ดักการแตะทุกครั้งแล้วปลุก AudioContext / เสียงเพื่อนที่ยังไม่เล่น */
V.unlock = function () {
  try { if (ctx && ctx.state !== 'running') ctx.resume(); } catch (e) {}
  for (const id in nodes) { const a = nodes[id].a; if (a && a.paused) { const p = a.play(); if (p && p.catch) p.catch(() => {}); } }
};
['pointerdown', 'touchend', 'keydown', 'click'].forEach(ev => g.addEventListener(ev, V.unlock, { passive: true, capture: true }));

const level = an => {
  an.getByteTimeDomainData(buf); let s = 0;
  for (let i = 0; i < buf.length; i++) { const v = (buf[i] - 128) / 128; s += v * v; }
  return Math.sqrt(s / buf.length);
};
function tick() {
  const now = performance.now(), cur = [false, false, false, false];
  if (V.on && micAn) { try { if (level(micAn) > TH) hold[ME] = now; } catch (e) {} cur[ME] = now - hold[ME] < HOLD; }
  for (const id in nodes) {
    const k = R.indexOf(id), n = nodes[id]; if (k < 0 || !n.an) continue;
    try { if (level(n.an) > TH) hold[k] = now; } catch (e) {}
    cur[k] = now - hold[k] < HOLD;
  }
  let ch = false; for (let i = 0; i < 4; i++) if (V.spk[i] !== cur[i]) { V.spk[i] = cur[i]; ch = true; }
  if (ch) changed();
}
const startTick = () => { if (!tm) tm = setInterval(tick, 90); };

function drop(id) {
  const c = calls[id]; delete calls[id];
  if (c) { try { c.close(); } catch (e) {} }
  const n = nodes[id]; delete nodes[id];
  if (n) { try { n.a.pause(); n.a.srcObject = null; n.a.remove(); } catch (e) {} try { n.src && n.src.disconnect(); } catch (e) {} }
  const k = R.indexOf(id); if (k >= 0 && V.spk[k]) { V.spk[k] = false; changed(); }
}
function remote(id, st) {
  const old = nodes[id]; if (old) { try { old.a.pause(); old.a.remove(); } catch (e) {} }
  const a = document.createElement('audio'); a.autoplay = true; a.setAttribute('playsinline', ''); a.srcObject = st; a.style.display = 'none'; document.body.appendChild(a);
  const p = a.play(); if (p && p.catch) p.catch(() => {});
  let an = null, src = null;
  try { ensureCtx(); src = ctx.createMediaStreamSource(st); an = ctx.createAnalyser(); an.fftSize = 512; src.connect(an); } catch (e) {}
  nodes[id] = { a, an, src }; startTick();
}
function hook(c) {
  const id = c.peer; calls[id] = c;
  c.on('stream', st => { if (calls[id] === c) { tries[id] = 0; remote(id, st); } });
  /* สายหลุดกลางทางทั้งที่อีกฝั่งยังอยู่ในห้อง → ลองต่อใหม่ไม่เกิน 3 ครั้ง */
  const gone = () => { if (calls[id] !== c) return; drop(id); if (engaged && R.indexOf(id) >= 0 && (tries[id] = (tries[id] || 0) + 1) <= 3) setTimeout(() => { if (engaged && R.indexOf(id) >= 0 && !calls[id]) dial(id); }, 1500); };
  c.on('close', gone); c.on('error', gone);
}
function dial(id) {
  const P = g.Net && g.Net.peer && g.Net.peer(); if (!P || !id || id === P.id || calls[id]) return;
  try { ensureCtx(); hook(P.call(id, out)); } catch (e) {}
}
function connectAll() { for (let i = 0; i < 4; i++) if (R[i] && i !== ME) dial(R[i]); }

/* สายเรียกเข้า: ถ้าสองฝั่งโทรหากันพร้อมกัน ให้สายของคนที่เลขผู้เล่นน้อยกว่าชนะ */
V.incoming = function (c) {
  try {
    ensureCtx(); const id = c.peer, mine = calls[id];
    if (mine) { if (ME < R.indexOf(id)) { try { c.close(); } catch (e) {} return; } drop(id); }
    c.answer(out); hook(c);
  } catch (e) { try { c.close(); } catch (e2) {} }
};
/* host ส่งรายชื่อ peer id ของทุกช่อง → ตัดสายคนที่ออกไป · ถ้าเรากำลังคุยอยู่ก็โทรหาคนที่เพิ่งเข้า */
V.roster = function (r, me) {
  R = [0, 1, 2, 3].map(i => (r && r[i]) || null); ME = me | 0;
  for (const id in calls) if (R.indexOf(id) < 0) drop(id);
  if (engaged) connectAll();
  changed();
};
V.toggle = async function () {
  if (V.busy) return;
  if (!V.supported) { say('เครื่อง/เบราว์เซอร์นี้ยังไม่รองรับการคุยด้วยเสียง', 'r'); return; }
  try { ensureCtx(); if (ctx.state !== 'running') ctx.resume(); } catch (e) {}
  if (!V.ready) {
    V.busy = true; changed();
    try {
      mic = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }, video: false });
      micSrc = ctx.createMediaStreamSource(mic); gain = ctx.createGain(); gain.gain.value = 0;
      micSrc.connect(gain); gain.connect(dest);
      micAn = ctx.createAnalyser(); micAn.fftSize = 512; micSrc.connect(micAn);
      V.ready = true; V.on = false;
    } catch (e) {
      V.busy = false; changed();
      const n = e && e.name;
      say(!g.isSecureContext ? 'ใช้ไมค์ได้เฉพาะเว็บ https (ลิงก์เกมจริงที่อัปโหลดแล้ว) — หน้า preview นี้ใช้ไมค์ไม่ได้'
        : n === 'NotFoundError' || n === 'OverconstrainedError' ? 'ไม่พบไมโครโฟนในเครื่องนี้'
        : n === 'NotReadableError' ? 'ไมค์กำลังถูกแอปอื่นใช้อยู่ ปิดแอปนั้นก่อนแล้วลองใหม่'
        : 'ไม่ได้รับอนุญาตใช้ไมค์ — กดอนุญาตไมค์ที่เบราว์เซอร์ (ไอคอนข้างช่องลิงก์) แล้วลองใหม่', 'r');
      return;
    }
    V.busy = false;
  }
  V.on = !V.on; gain.gain.value = V.on ? 1 : 0;
  if (V.on) { engaged = true; startTick(); connectAll(); }
  say(V.on ? '🎙 เปิดไมค์แล้ว — เพื่อนในห้องได้ยินคุณ (ใส่หูฟังจะไม่ตีกัน)' : '🔇 ปิดไมค์แล้ว (ยังได้ยินเพื่อนอยู่)');
  changed();
};
/* ออกจากห้อง: วางสายทั้งหมด และปล่อยไมค์คืนให้เครื่อง */
V.stop = function () {
  engaged = false;
  for (const id in calls) drop(id);
  for (const id in nodes) drop(id);
  if (mic) { try { mic.getTracks().forEach(t => t.stop()); } catch (e) {} }
  try { micSrc && micSrc.disconnect(); gain && gain.disconnect(); } catch (e) {}
  mic = micSrc = gain = micAn = null; V.on = V.ready = V.busy = false;
  R = [null, null, null, null]; hold = [0, 0, 0, 0]; tries = {};
  if (tm) { clearInterval(tm); tm = 0; }
  V.spk = [false, false, false, false]; changed();
};
V.peers = () => Object.keys(calls);   /* รายชื่อ peer id ที่ต่อเสียงอยู่ (ไว้ตรวจสอบ) */
g.Voice = V;
})(window);
