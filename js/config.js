/* config.js — ตั้งค่าที่คนทำเว็บแก้เองได้ (ไม่ต้องแตะโค้ดเกม)
   board : ที่อยู่ API ของตารางอันดับออนไลน์ (ปล่อยว่าง = เก็บอันดับในเครื่องอย่างเดียว) — ดูวิธีตั้งใน DEPLOY-TH.md
   ice   : (ไม่บังคับ) รายชื่อเซิร์ฟเวอร์ TURN สำหรับคนที่ต่อ P2P ไม่ติดบนเน็ตมือถือบางเจ้า เช่น
           ice: [{ urls: 'turn:...', username: '...', credential: '...' }] */
window.SAINOI = {
  board: 'https://script.google.com/macros/s/AKfycbwnTpnzt9EcF97Yg5plI7i2nuz1QoMERkKAY_JTAM3UWrQtgcK-siu9qR0LmyqU2etQ/exec',
  ice: []
};
