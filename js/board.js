/* board.js — ตารางอันดับ: เก็บในเครื่อง (localStorage) เสมอ + ส่งขึ้นออนไลน์ถ้าตั้ง SAINOI.board ไว้
   คะแนน = อยู่ถึงวันที่ (มากกว่าดีกว่า) ตามด้วยรายได้รวม · แยกอันดับ "เล่นคนเดียว" กับ "ทีม (2–4 คน)"
   สัญญา API ออนไลน์ (ใช้ได้กับ backend/apps-script.gs และ backend/cloudflare-worker.js):
     GET  {board}?a=top  → { ok:1, solo:[Row], team:[Row] }    Row = { name, day, tot, n, ts }
     POST {board} (Content-Type: text/plain, body = JSON { id, name, day, tot, n, ver }) → { ok:1, rank, cat } */
(function (g) {
'use strict';
const KEY = 'sainoi_board', NAME = 'sainoi_name', MAX = 30, VER = 1;
const LS = () => g.LS;
const cfg = () => (g.SAINOI && typeof g.SAINOI.board === 'string' ? g.SAINOI.board.trim() : '');
const cat = n => (n > 1 ? 'team' : 'solo');
const key = r => r.day * 100000 + Math.min(r.tot, 99999);
const cmp = (a, b) => key(b) - key(a) || (a.ts || 0) - (b.ts || 0);
const clean = s => String(s == null ? '' : s).replace(/[\u0000-\u001f<>&"'`\\]/g, '').replace(/\s+/g, ' ').trim().slice(0, 12);
const rid = () => Array.from({ length: 12 }, () => 'abcdefghijkmnpqrstuvwxyz23456789'[Math.random() * 32 | 0]).join('');

function load() { try { const a = JSON.parse(LS().get(KEY) || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; } }
function store(a) {
  const out = [];
  ['solo', 'team'].forEach(c => a.filter(r => cat(r.n) === c).sort(cmp).slice(0, MAX).forEach(r => out.push(r)));
  LS().set(KEY, JSON.stringify(out));
}

async function http(url, opt, ms) {
  const c = typeof AbortController === 'function' ? new AbortController() : null, t = setTimeout(() => c && c.abort(), ms || 9000);
  try {
    const r = await fetch(url, Object.assign({ redirect: 'follow' }, opt || {}, c ? { signal: c.signal } : {}));
    return await r.json();
  } finally { clearTimeout(t); }
}

const Board = g.Board = {
  VER, clean,
  get online() { return !!cfg(); },
  get name() { return LS().get(NAME) || ''; },
  set name(v) { LS().set(NAME, clean(v)); },
  /* สร้างรายการคะแนนของรอบนี้ (ยังไม่บันทึก) */
  entry(day, tot, n, name) { return { id: rid(), name: clean(name) || clean(Board.name) || 'ผู้เล่น', day: day | 0, tot: Math.max(0, tot | 0), n: Math.max(1, n | 0), ts: Date.now(), ver: VER }; },
  /* บันทึกในเครื่อง (ใส่ซ้ำ id เดิม = แก้ชื่อ) */
  save(e) { const a = load().filter(r => r.id !== e.id); a.push(e); store(a); },
  local(c) { return load().filter(r => cat(r.n) === c).sort(cmp); },
  /* ดึงอันดับออนไลน์ → { solo:[], team:[] } หรือโยน error */
  async top() {
    const u = cfg(); if (!u) throw new Error('no board');
    const d = await http(u + (u.indexOf('?') < 0 ? '?' : '&') + 'a=top&_=' + (Date.now() % 1e7));
    if (!d || !d.ok) throw new Error('bad');
    return { solo: d.solo || [], team: d.team || [] };
  },
  /* ส่งคะแนนขึ้นออนไลน์ → { rank, cat } */
  async submit(e) {
    const u = cfg(); if (!u) throw new Error('no board');
    const d = await http(u, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ id: e.id, name: e.name, day: e.day, tot: e.tot, n: e.n, ver: VER }) }, 12000);
    if (!d || !d.ok) throw new Error((d && d.err) || 'bad');
    return d;
  }
};
})(window);
