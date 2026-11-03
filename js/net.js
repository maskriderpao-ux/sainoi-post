/* net.js — ออนไลน์แบบ P2P ผ่าน PeerJS (ฟรี ไม่ต้องมีเซิร์ฟเวอร์ของตัวเอง)
   host = คนสร้างห้อง รันเกมจริง / client = คนเข้าห้อง ส่งตำแหน่งตัวเองกับปุ่มที่กด */
(function (g) {
'use strict';
const PFX = 'sainoi-';
let peer = null, conns = [null, null, null, null], link = null, to = 0, vids = [null, null, null, null];   /* vids = peer id ของแต่ละช่อง (ใช้ให้เพื่อนโทรเสียงหากัน) */
/* ถ้าใส่ TURN ใน js/config.js (SAINOI.ice) จะใช้ร่วมกับ STUN เพื่อให้ต่อติดบนเน็ตมือถือที่เข้มงวด */
const peerOpt = () => {
  const x = g.SAINOI && Array.isArray(g.SAINOI.ice) ? g.SAINOI.ice : [];
  return x.length ? { config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:global.stun.twilio.com:3478' }].concat(x) } } : {};
};
const N = {
  role: '', code: '', me: 0, cb: {},
  rc() { return Array.from({ length: 4 }, () => 'ABCDEFGHJKMNPQRSTUVWXYZ'[Math.random() * 23 | 0]).join(''); },
  safe(c, m) { try { if (c && c.open) c.send(m); } catch (e) {} },
  peer() { return peer; },
  /* host บอกรายชื่อ peer id ของทุกช่องให้ทุกคน (และตัวเอง) เพื่อเชื่อมเสียง */
  roster() {
    if (N.role !== 'host' || !peer) return;
    const r = vids.map((v, i) => i === 0 ? peer.id : (conns[i] && conns[i].open ? v : null));
    N.toAll({ t: 'v', r }); g.Voice && g.Voice.roster(r, 0);
  },
  host() {
    N.leave(); N.code = N.rc(); N.role = 'host'; N.me = 0;
    const p = peer = new Peer(PFX + N.code, peerOpt());
    p.on('open', () => N.cb.hosted && N.cb.hosted(N.code));
    p.on('connection', cn => {
      const G = g.Sim.G;
      let i = -1;
      for (let j = 1; j < 4; j++) if (!conns[j]) { i = j; break; }
      if (i < 0 || G.ph === 'play' || G.ph === 'shop') {
        const why = i < 0 ? 'full' : 'busy';
        cn.on('open', () => { N.safe(cn, { t: why }); setTimeout(() => cn.close(), 500); }); return;
      }
      conns[i] = cn;
      cn.on('open', () => { G.pl[i].c = 1; vids[i] = cn.peer; g.Sim.setChar(i, g.Sim.freeChar(i)); N.safe(cn, { t: 'hi', i }); N.cb.changed && N.cb.changed(); N.roster(); });
      cn.on('data', d => { if (!d) return; if (d.t === 'i') g.Sim.input(i, d); else if (d.t === 'buy') g.Sim.buy(String(d.id), d.l); else if (d.t === 'c') {   /* ขอเปลี่ยนตัวละคร: ได้เฉพาะในล็อบบี้ และห้ามซ้ำกับคนอื่น */
          const S = g.Sim, ch = d.ch | 0;
          if (S.G.ph === 'lobby' && ch >= 0 && ch < S.CHARS.length && S.chTaken(ch, i) < 0) { S.setChar(i, ch); N.cb.changed && N.cb.changed(); } else N.safe(cn, { t: 'cx', ch: S.G.pl[i].ch | 0 });
        } });
      const gone = () => { if (conns[i] === cn) { conns[i] = null; vids[i] = null; g.Sim.G.pl[i].c = 0; g.Sim.G.pl[i].h = ''; g.Sim.setChar(i, 0); N.cb.changed && N.cb.changed(); N.roster(); } };
      cn.on('close', gone); cn.on('error', gone);
    });
    p.on('call', c => g.Voice && g.Voice.incoming(c));
    p.on('disconnected', () => { try { p.reconnect(); } catch (e) {} });
    p.on('error', e => {
      if (e.type === 'unavailable-id') N.host(); else N.cb.error && N.cb.error('สร้างห้องไม่ได้ (' + e.type + ') ลองใหม่อีกครั้ง');
    });
  },
  join(code) {
    N.leave(); N.role = 'client'; N.code = code;
    const p = peer = new Peer(undefined, peerOpt());
    let ok = false;
    to = setTimeout(() => { if (!ok) { N.leave(); N.cb.error && N.cb.error('เชื่อมต่อไม่ติด ลองใหม่ หรือสลับ Wi-Fi/4G'); } }, 14000);
    p.on('call', c => g.Voice && g.Voice.incoming(c));
    p.on('open', () => {
      const cn = link = p.connect(PFX + code, { serialization: 'json' });
      cn.on('open', () => { ok = true; clearTimeout(to); });
      cn.on('data', d => {
        if (!d) return;
        if (d.t === 'hi') { N.me = d.i; N.cb.joined && N.cb.joined(d.i); }
        else if (d.t === 's') N.cb.snap && N.cb.snap(d);
        else if (d.t === 'e') N.cb.event && N.cb.event(d.ev);
        else if (d.t === 'cx') N.cb.chbad && N.cb.chbad(d.ch);
        else if (d.t === 'v') g.Voice && g.Voice.roster(d.r, N.me);
        else if (d.t === 'full' || d.t === 'busy') { N.leave(); N.cb.error && N.cb.error(d.t === 'full' ? 'ห้องเต็มแล้ว (สูงสุด 4 คน)' : 'ห้องนี้เริ่มเกมไปแล้ว รอรอบหน้านะ'); }
      });
      cn.on('close', () => { if (N.role === 'client') { N.leave(); N.cb.closed && N.cb.closed(); } });
    });
    p.on('error', e => { clearTimeout(to); N.leave(); N.cb.error && N.cb.error(e.type === 'peer-unavailable' ? 'ไม่พบห้อง ' + code + ' (เช็กรหัสอีกครั้ง)' : 'เชื่อมต่อไม่ได้ (' + e.type + ')'); });
  },
  toHost(m) { N.safe(link, m); },
  toAll(m) { for (let i = 1; i < 4; i++) N.safe(conns[i], m); },
  count() { return 1 + conns.filter(c => c && c.open).length; },
  leave() {
    clearTimeout(to); const r = N.role; N.role = '';
    conns = [null, null, null, null]; link = null; vids = [null, null, null, null]; g.Voice && g.Voice.stop();
    if (peer) { try { peer.destroy(); } catch (e) {} peer = null; }
    return r;
  }
};
g.Net = N;
})(window);
