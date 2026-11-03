/* audio.js — เสียงเอฟเฟกต์ 8-bit + เพลง BGM เบา ๆ สร้างจากโค้ด (ไม่ต้องมีไฟล์เสียง) */
(function (g) {
'use strict';
let ac = null, on = true, mOn = true;
const S = {
  pick: [[660, .05, 'square']], put: [[440, .05, 'square']], drop: [[330, .05, 'square'], [196, .1, 'triangle']], ok: [[660, .06, 'square'], [880, .08, 'square']],
  coin: [[988, .06, 'square'], [1319, .12, 'square']], bad: [[160, .12, 'sawtooth']], full: [[523, .06, 'triangle'], [659, .06, 'triangle'], [784, .1, 'triangle']],
  key: [[880, .035, 'square']], sel: [[523, .04, 'square'], [784, .06, 'square']], deny: [[220, .1, 'sawtooth'], [165, .16, 'sawtooth']], unlock: [[523, .08, 'square'], [659, .08, 'square'], [784, .08, 'square'], [1047, .22, 'square']],
  horn: [[196, .18, 'sawtooth'], [196, .18, 'sawtooth']], end: [[784, .12, 'square'], [659, .12, 'square'], [523, .25, 'square']]
};

/* ================= BGM: เพลงร้านไปรษณีย์สบาย ๆ (C เมเจอร์ 2 ท่อน ท่อนละ 8 ห้อง วนซ้ำ) =================
   ปรับได้ที่นี่: BPM = ความเร็วปกติ · RUSH = ตัวคูณความเร็วตอนช่วงเร่งด่วน · VOL = ความดังเพลง (เสียงเอฟเฟกต์ ≈ 0.07) */
const BGM = { BPM: 100, RUSH: 1.32, VOL: 0.34 };
const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const midi = n => { const m = /^([A-G])(\d)$/.exec(n); return 12 * (+m[2] + 1) + NOTE[m[1]]; };
const hz = m => 440 * Math.pow(2, (m - 69) / 12);
/* คอร์ด: [เบส, สามเสียงกลาง] */
const CH = { C: [48, [60, 64, 67]], G: [43, [55, 59, 62]], Am: [45, [57, 60, 64]], F: [41, [57, 60, 65]], Em: [40, [55, 59, 64]], Dm: [50, [57, 62, 65]] };
const PROG = ['C', 'G', 'Am', 'F', 'C', 'G', 'F', 'G', 'F', 'G', 'Em', 'Am', 'Dm', 'G', 'C', 'C'];
/* ทำนองหลัก: 1 ห้อง = 8 ช่อง (โน้ตเขบ็ตหนึ่งชั้น) · '-' = ลากเสียงต่อ · '.' = เว้น */
const MEL = [
  'E5 - E5 G5 - E5 D5 C5', 'D5 - D5 G5 - F5 E5 D5', 'C5 - E5 - A5 - G5 E5', 'F5 - A5 - G5 - F5 E5',
  'E5 - G5 - C6 - B5 G5', 'A5 - G5 - F5 - E5 D5', 'C5 - F5 - A5 - G5 F5', 'D5 - - - G5 - - .',
  'A5 - A5 G5 - F5 G5 A5', 'B5 - A5 - G5 - D5 -', 'G5 - G5 E5 - G5 - E5', 'C6 - B5 A5 - E5 - A5',
  'D5 - F5 - A5 - F5 D5', 'G5 - F5 E5 - D5 - B4', 'C5 - E5 - G5 - E5 C5', 'C5 - - - . . . .'
];
const STEPS = PROG.length * 8;
const MELEV = {};   /* ช่องที่เริ่มโน้ตทำนอง → [midi, ความยาว(ช่อง)] */
MEL.forEach((bar, b) => {
  let cur = -1;
  bar.split(' ').forEach((x, i) => {
    if (x === '-') { if (cur >= 0) MELEV[cur][1]++; }
    else if (x === '.') cur = -1;
    else { cur = b * 8 + i; MELEV[cur] = [midi(x), 1]; }
  });
});


/* ================= เพลงหน้าแรก (ทำนองต้นฉบับของเกมนี้เอง): แดนซ์ตื้อ ๆ สไตล์ลูกทุ่งอีเลคโทรนิก A ไมเนอร์ 132 BPM ================= */
const TBPM = 132, TPROG = ['Am', 'Am', 'C', 'Am', 'F', 'G', 'Am', 'Am'];
const TMEL = [
  'E5 . . E5 . G5 . A5 . . G5 . E5 . D5 .', 'C5 . . D5 . E5 . - . . D5 . C5 . A4 .', 'E5 . . E5 . G5 . A5 . . C6 . A5 . G5 .', 'E5 . . G5 . E5 . D5 - - . . . . . .',
  'A5 . . A5 . G5 . E5 . . G5 . A5 . C6 .', 'D6 - . C6 . A5 . G5 . . E5 . G5 . A5 -', 'G5 . . E5 . D5 . C5 . . D5 . E5 . G5 .', 'A5 - - - . . . . A4 . C5 . D5 . E5 .'
];
const TSTEPS = TPROG.length * 16, TEV = {};
TMEL.forEach((bar, b) => { let cur = -1; bar.split(' ').forEach((x, i) => { if (x === '-') { if (cur >= 0) TEV[cur][1]++; } else if (x === '.') cur = -1; else { cur = b * 16 + i; TEV[cur] = [midi(x), 1]; } }); });
function kick(c, out, t, vol) {
  const o = c.createOscillator(), v = c.createGain();
  o.type = 'sine'; o.frequency.setValueAtTime(160, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
  v.gain.setValueAtTime(vol, t); v.gain.exponentialRampToValueAtTime(0.001, t + 0.2); o.connect(v); v.connect(out); o.start(t); o.stop(t + 0.22);
}
function clap(c, out, buf, t, vol) {
  const s = c.createBufferSource(), f = c.createBiquadFilter(), v = c.createGain();
  s.buffer = buf; f.type = 'bandpass'; f.frequency.value = 1700; f.Q.value = 0.8;
  v.gain.setValueAtTime(vol, t); v.gain.exponentialRampToValueAtTime(0.0001, t + 0.09); s.connect(f); f.connect(v); v.connect(out); s.start(t); s.stop(t + 0.1);
}
function playTitle(R, step, t, sl) {
  const c = R.c, k = step % TSTEPS, bar = (k / 16) | 0, i = k % 16, ch = CH[TPROG[bar]], m = TEV[k];
  if (i % 4 === 0) kick(c, R.dry, t, 0.55);                                         /* ตื้อ ตื้อ ตื้อ ตื้อ */
  if (i === 4 || i === 12) clap(c, R.dry, R.noise, t, 0.14);
  if (i % 4 === 2) { shaker(c, R.dry, R.noise, t, 0.03); pluck(c, R.dry, hz(ch[0] + 12), t, sl * 3, 'sawtooth', 0.07); }   /* เบสเด้งหลังจังหวะ */
  else if (i % 2) shaker(c, R.dry, R.noise, t, 0.012);
  if (i === 0) pluck(c, R.dry, hz(ch[0]), t, sl * 3, 'triangle', 0.16);
  if (i === 6 || i === 14) ch[1].forEach(n => pluck(c, R.dry, hz(n + 12), t, sl * 2.2, 'square', 0.025));
  if (m) { const d = m[1] * sl * 0.92; tone(c, R.dry, hz(m[0]), t, d, 'square', 0.055, 0.01, 0.06, m[1] >= 4); tone(c, R.send, hz(m[0] + 12), t, d, 'sine', 0.03, 0.02, 0.08, false); }
}

/* โน้ตยาว: osc → gain (attack, ลดลงเล็กน้อย, release) → out · vib = สั่นเสียงเบา ๆ */
function tone(c, out, f, t, dur, type, vol, atk, rel, vib) {
  const o = c.createOscillator(), v = c.createGain(), e = t + Math.max(atk + 0.05, dur);
  o.type = type; o.frequency.setValueAtTime(f, t);
  v.gain.setValueAtTime(0.0001, t); v.gain.linearRampToValueAtTime(vol, t + atk); v.gain.setTargetAtTime(vol * 0.7, t + atk, 0.18);
  v.gain.setTargetAtTime(0.0001, e, rel);
  o.connect(v); v.connect(out);
  if (vib) { const l = c.createOscillator(), lg = c.createGain(); l.frequency.value = 5.2; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(f * 0.0035, t + 0.35); l.connect(lg); lg.connect(o.frequency); l.start(t); l.stop(e + rel * 6); }
  o.start(t); o.stop(e + rel * 6 + 0.05);
}
function pluck(c, out, f, t, dur, type, vol) {
  const o = c.createOscillator(), v = c.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t);
  v.gain.setValueAtTime(0.0001, t); v.gain.linearRampToValueAtTime(vol, t + 0.006); v.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(v); v.connect(out); o.start(t); o.stop(t + dur + 0.03);
}
function shaker(c, out, buf, t, vol) {
  const s = c.createBufferSource(), f = c.createBiquadFilter(), v = c.createGain();
  s.buffer = buf; f.type = 'bandpass'; f.frequency.value = 7200; f.Q.value = 0.9;
  v.gain.setValueAtTime(vol, t); v.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
  s.connect(f); f.connect(v); v.connect(out); s.start(t); s.stop(t + 0.06);
}
/* หนึ่งช่อง (เขบ็ตหนึ่งชั้น) ของเพลง ณ เวลา t · sl = ความยาวหนึ่งช่องเป็นวินาที */
function playStep(R, step, t, sl) {
  const c = R.c, k = step % STEPS, bar = (k / 8) | 0, i = k % 8, ch = CH[PROG[bar]], m = MELEV[k];
  if (m) { const d = m[1] * sl * 0.96; tone(c, R.dry, hz(m[0]), t, d, 'triangle', 0.10, 0.025, 0.12, m[1] >= 3); tone(c, R.send, hz(m[0]), t, d, 'sine', 0.07, 0.03, 0.1, false); }
  if (i === 0) tone(c, R.dry, hz(ch[0]), t, sl * 3.4, 'triangle', 0.15, 0.02, 0.09, false);
  if (i === 4) tone(c, R.dry, hz(ch[0] + 7), t, sl * 2.6, 'triangle', 0.11, 0.02, 0.09, false);
  if (i === 2 || i === 6) ch[1].forEach(n => pluck(c, R.dry, hz(n), t, sl * 1.6, 'triangle', 0.034));
  if (i % 2 === 1) pluck(c, R.send, hz(ch[1][((i - 1) / 2) % 3] + 12), t, sl * 3, 'sine', 0.05);
  shaker(c, R.dry, R.noise, t, i % 2 ? 0.010 : 0.016);
}
/* วงจรเสียง: dry/send → bus (ควบคุมความดัง) · send มีเสียงสะท้อนนุ่ม ๆ */
function mkRig(c, dest) {
  const bus = c.createGain(), dry = c.createGain(), send = c.createGain(), dly = c.createDelay(1), fb = c.createGain(), lp = c.createBiquadFilter(), wet = c.createGain();
  bus.gain.value = 0; dry.connect(bus); send.connect(bus);
  send.connect(dly); dly.delayTime.value = 0.3; fb.gain.value = 0.3; lp.type = 'lowpass'; lp.frequency.value = 2400; wet.gain.value = 0.5;
  dly.connect(lp); lp.connect(fb); fb.connect(dly); lp.connect(wet); wet.connect(bus); bus.connect(dest);
  const n = c.createBuffer(1, Math.floor(c.sampleRate * 0.08), c.sampleRate), d = n.getChannelData(0); for (let j = 0; j < d.length; j++) d[j] = Math.random() * 2 - 1;
  return { c, bus, dry, send, dly, noise: n };
}
let track = 'game', rig = null, timer = 0, step = 0, nextT = 0, tempo = 1, rushT = 1, tgt = 0, running = false, offAt = 0;
function sched() {
  if (!ac || !rig || !running) return;
  const now = ac.currentTime;
  if (nextT < now - 0.1) nextT = now + 0.06;
  while (nextT < now + 0.32) {
    const T = track === 'title', sl = T ? 15 / TBPM : 30 / (BGM.BPM * tempo);
    if (T) playTitle(rig, step, nextT, sl); else playStep(rig, step, nextT, sl);
    rig.dly.delayTime.setTargetAtTime(sl * 3, nextT, 0.5);
    nextT += sl; step++; tempo += (rushT - tempo) * 0.07;
  }
  if (tgt === 0 && now > offAt) running = false;
}
/* เรียกทุกเฟรม: want = ควรมีเพลงไหม · rush = ช่วงเร่งด่วน (เร่งจังหวะ) · soft = เบาลง (หน้าร้านค้า) */
/* เพลงหน้าแรกจากไฟล์ audio/title.mp3 (ถ้ามีไฟล์) · ไม่มีไฟล์/โหลดไม่ได้ = ใช้เพลงสังเคราะห์ในโค้ดแทน */
let tEl = null, tOK = null;
function titleEl() {
  if (!tEl) { try { tEl = new Audio('audio/title.mp3'); tEl.loop = true; tEl.preload = 'auto'; tEl.volume = 0.7; tEl.addEventListener('error', () => { tOK = false; }); tEl.addEventListener('canplay', () => { tOK = true; }); } catch (e) { tOK = false; } }
  return tEl;
}
function music(want, rush, soft, title) {
  if (!ac) return;
  const f = title && mOn && tOK !== false ? titleEl() : tEl;
  if (f) { if (title && mOn && tOK !== false) { if (f.paused) { const p = f.play(); if (p && p.catch) p.catch(() => {}); } } else if (!f.paused) f.pause(); }
  if (title && tOK === true) want = false;   /* มีไฟล์เพลงเล่นอยู่ → ปิดเพลงสังเคราะห์ */
  const tk = title ? 'title' : 'game'; if (tk !== track) { track = tk; step = 0; nextT = ac.currentTime + 0.1; }
  want = want && mOn; rushT = rush ? BGM.RUSH : 1;
  if (!rig) rig = mkRig(ac, ac.destination);
  const v = want ? BGM.VOL * (soft ? 0.55 : 1) : 0;
  if (v !== tgt) { tgt = v; rig.bus.gain.setTargetAtTime(v, ac.currentTime, want ? 0.6 : 0.35); if (!v) offAt = ac.currentTime + 2; }
  if (want && !running) { running = true; nextT = ac.currentTime + 0.1; step = 0; tempo = rushT; }
  if (!timer) timer = setInterval(sched, 80);
}
document.addEventListener('visibilitychange', () => { if (!ac) return; try { if (document.hidden) ac.suspend(); else ac.resume(); } catch (e) {} });
['pointerdown', 'touchend', 'keydown'].forEach(ev => document.addEventListener(ev, () => g.Sfx && g.Sfx.unlock(), { passive: true, capture: true }));
g.Sfx = {
  unlock() { try { if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); } catch (e) {} },
  toggle() { on = !on; return on; },
  get on() { return on; },
  toggleMusic() { mOn = !mOn; return mOn; },
  set musicOn(v) { mOn = !!v; },
  get musicOn() { return mOn; },
  music, BGM, _t: { mkRig, playStep, STEPS, MELEV }, get _s() { return { running, step, tempo: +tempo.toFixed(3), tgt, st: ac && ac.state }; },
  play(n) {
    if (!on || !ac || !S[n]) return;
    let t = ac.currentTime;
    S[n].forEach(([f, d, w]) => {
      const o = ac.createOscillator(), v = ac.createGain();
      o.type = w; o.frequency.value = f; v.gain.setValueAtTime(.07, t); v.gain.exponentialRampToValueAtTime(.001, t + d);
      o.connect(v); v.connect(ac.destination); o.start(t); o.stop(t + d + .02); t += d * .9;
    });
  }
};
})(window);
