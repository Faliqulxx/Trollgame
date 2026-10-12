// Layar Menu Utama (PRD Bagian 8.1)

import { CONFIG } from '../config';
import { Storage } from '../core/Storage';
import { AudioManager } from '../core/Audio';

export class MenuScene {
  private animTimer = 0;
  private audio: AudioManager;

  // Status Modal Input Nama
  private showUsernameModal = false;
  private inputName = '';
  private pendingPlay = false;
  private cursorBlinkTimer = 0;

  // Status Modal Leaderboard
  private showLeaderboardModal = false;

  // Nama acak lucu/troll
  private randomNames = [
    'KorbanTroll',
    'DutaJebakan',
    'MentalBaja',
    'SiPalingSabar',
    'StickmanPro',
    'CalonMati',
    'AntiEmosi',
    'PemainHoki',
    'MasterJatuh',
    'GamerSultan'
  ];

  public buttons = [
    { id: 'play', x: 0, y: 0, w: 260, h: 48, label: '▶ MAIN' },
    { id: 'select', x: 0, y: 0, w: 260, h: 44, label: '📜 PILIH LEVEL' },
    { id: 'leaderboard', x: 0, y: 0, w: 260, h: 44, label: '🏆 PAPAN PERINGKAT' },
    { id: 'audio_down', x: 0, y: 0, w: 46, h: 42, label: '➖' },
    { id: 'audio', x: 0, y: 0, w: 156, h: 42, label: '🔊 SUARA: 80%' },
    { id: 'audio_up', x: 0, y: 0, w: 46, h: 42, label: '➕' },
    { id: 'reset', x: 0, y: 0, w: 260, h: 38, label: '↺ RESET PROGRES' }
  ];

  constructor(audio: AudioManager) {
    this.audio = audio;
    this.layoutButtons();
    this.inputName = Storage.getUsername();
  }

  private layoutButtons(): void {
    const startY = 245;
    const spacing = 48;
    const cx = (CONFIG.CANVAS_WIDTH - 260) / 2;

    this.buttons[0].x = cx;
    this.buttons[0].y = startY;

    this.buttons[1].x = cx;
    this.buttons[1].y = startY + spacing;

    this.buttons[2].x = cx;
    this.buttons[2].y = startY + spacing * 2;

    // Baris Kontrol Volume: [-] [ 🔊 SUARA: 80% ] [+]
    const audioY = startY + spacing * 3;
    this.buttons[3].x = cx;
    this.buttons[3].y = audioY;

    this.buttons[4].x = cx + 52;
    this.buttons[4].y = audioY;

    this.buttons[5].x = cx + 52 + 162;
    this.buttons[5].y = audioY;

    // Reset Progres
    this.buttons[6].x = cx;
    this.buttons[6].y = startY + spacing * 4;
  }

  public isUsernameModalOpen(): boolean {
    return this.showUsernameModal;
  }

  public update(dt: number, typedKey: string | null = null): void {
    this.animTimer += dt;
    this.cursorBlinkTimer += dt;

    const vol = this.audio.getVolumePercent();
    const muted = this.audio.getMuted() || vol <= 0;
    this.buttons[4].label = muted ? '🔇 SUARA: 0%' : `🔊 SUARA: ${vol}%`;

    // Handle pengetikan keyboard jika modal username aktif
    if (this.showUsernameModal && typedKey) {
      if (typedKey === 'Backspace') {
        this.inputName = this.inputName.slice(0, -1);
      } else if (typedKey === 'Enter') {
        this.confirmUsername();
      } else if (typedKey.length === 1 && this.inputName.length < 14) {
        // Izinkan huruf, angka, spasi, tanda hubung/underscore
        if (/^[a-zA-Z0-9 _-]$/.test(typedKey)) {
          this.inputName += typedKey;
        }
      }
    }
  }

  private confirmUsername(): boolean {
    const clean = this.inputName.trim();
    if (clean.length === 0) {
      this.inputName = this.getRandomName();
    }
    Storage.setUsername(this.inputName.trim());
    this.showUsernameModal = false;
    return true;
  }

  private getRandomName(): string {
    return this.randomNames[Math.floor(Math.random() * this.randomNames.length)];
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // 1. Latar Belakang Kertas Sketsa Halus
    ctx.fillStyle = CONFIG.COLORS.BG_PAPER;
    ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

    // Grid halus buku tulis
    ctx.strokeStyle = CONFIG.COLORS.GRID_LINE;
    ctx.lineWidth = 1;
    for (let x = 0; x < CONFIG.CANVAS_WIDTH; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CONFIG.CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y < CONFIG.CANVAS_HEIGHT; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CONFIG.CANVAS_WIDTH, y);
      ctx.stroke();
    }

    // 2. Judul Utama Doodle
    ctx.fillStyle = CONFIG.COLORS.STICKMAN;
    ctx.font = '900 44px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('STICKMAN: THE TRAP DOOR', CONFIG.CANVAS_WIDTH / 2, 70);

    // Subtitle sketsa
    ctx.fillStyle = CONFIG.COLORS.HAZARD_RED;
    ctx.font = 'bold 18px "Architects Daughter", Outfit, sans-serif';
    ctx.fillText('Jangan Percaya Pada Siapapun. Termasuk Pintunya.', CONFIG.CANVAS_WIDTH / 2, 110);

    // 3. Badge Pemain Aktif (Bisa diklik untuk ganti nama)
    this.renderPlayerBadge(ctx);

    // 4. Ilustrasi Stickman di Atas Jebakan Pintu Lipat
    this.renderTrapDoorIllustration(ctx);

    // 5. Tombol Menu
    for (let i = 0; i < this.buttons.length; i++) {
      const btn = this.buttons[i];
      const isPlay = btn.id === 'play';
      const isLeaderboard = btn.id === 'leaderboard';

      if (isPlay) {
        ctx.fillStyle = CONFIG.COLORS.EXIT_GREEN;
      } else if (isLeaderboard) {
        ctx.fillStyle = '#fff9db';
      } else {
        ctx.fillStyle = '#ffffff';
      }

      ctx.strokeStyle = CONFIG.COLORS.STICKMAN;
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      ctx.roundRect(btn.x, btn.y, btn.w, btn.h, 10);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isPlay ? '#ffffff' : (isLeaderboard ? '#d9480f' : CONFIG.COLORS.TEXT_DARK);
      ctx.font = isPlay ? 'bold 19px Outfit, sans-serif' : 'bold 15px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(btn.label, btn.x + btn.w / 2, btn.y + btn.h / 2 + 1);
    }

    // 6. Total Kematian di Pojok Bawah
    const totalDeaths = Storage.getTotalDeaths();
    ctx.fillStyle = CONFIG.COLORS.TEXT_DARK;
    ctx.font = 'bold 14px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`☠ Total Kematian: ${totalDeaths}`, CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT - 16);

    // 7. Render Modal Jika Aktif
    if (this.showUsernameModal) {
      this.renderUsernameModal(ctx);
    } else if (this.showLeaderboardModal) {
      this.renderLeaderboardModal(ctx);
    }

    ctx.restore();
  }

  private renderPlayerBadge(ctx: CanvasRenderingContext2D): void {
    const currentName = Storage.getUsername() || '(Klik untuk isi nama)';
    const text = `👤 Pemain: ${currentName}  ✏️`;

    ctx.font = 'bold 13px Outfit, sans-serif';
    const textW = ctx.measureText(text).width;
    const badgeW = Math.max(180, textW + 28);
    const badgeH = 28;
    const badgeX = (CONFIG.CANVAS_WIDTH - badgeW) / 2;
    const badgeY = 132;

    ctx.fillStyle = Storage.getUsername() ? '#eef2ff' : '#fff3bf';
    ctx.strokeStyle = Storage.getUsername() ? '#4f46e5' : '#f59f00';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 14);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = Storage.getUsername() ? '#3730a3' : '#d9480f';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, CONFIG.CANVAS_WIDTH / 2, badgeY + badgeH / 2 + 1);
  }

  private renderTrapDoorIllustration(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    const cx = CONFIG.CANVAS_WIDTH / 2;
    const cy = 195;

    // Lubang Jebakan (Trap Door)
    const doorW = 80;
    const doorH = 8;
    ctx.fillStyle = '#111';
    ctx.fillRect(cx - doorW / 2, cy, doorW, doorH);

    // Pintu perangkap yang sedikit terbuka berayun
    const swing = Math.sin(this.animTimer * 3) * 0.35;
    ctx.strokeStyle = '#5a5248';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - doorW / 2, cy);
    ctx.lineTo(cx - doorW / 2 + Math.cos(swing) * (doorW / 2), cy + Math.sin(swing) * 18);
    ctx.stroke();

    // Stickman yang panik jatuh ke dalam lubang
    ctx.strokeStyle = CONFIG.COLORS.STICKMAN;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';

    const stickY = cy - 16 + Math.sin(this.animTimer * 3) * 4;
    // Kepala
    ctx.beginPath();
    ctx.arc(cx, stickY - 12, 6, 0, Math.PI * 2);
    ctx.stroke();
    // Mata panik
    ctx.fillStyle = '#000';
    ctx.fillRect(cx - 2, stickY - 14, 2, 2);
    ctx.fillRect(cx + 2, stickY - 14, 2, 2);

    // Torso & Anggota tubuh
    ctx.beginPath();
    ctx.moveTo(cx, stickY - 6);
    ctx.lineTo(cx, stickY + 6);
    ctx.moveTo(cx, stickY - 2);
    ctx.lineTo(cx - 10, stickY - 12);
    ctx.moveTo(cx, stickY - 2);
    ctx.lineTo(cx + 10, stickY - 12);
    ctx.moveTo(cx, stickY + 6);
    ctx.lineTo(cx - 7, stickY + 14);
    ctx.moveTo(cx, stickY + 6);
    ctx.lineTo(cx + 7, stickY + 14);
    ctx.stroke();

    ctx.restore();
  }

  private renderUsernameModal(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.fillStyle = 'rgba(15, 15, 20, 0.75)';
    ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

    const mw = 440;
    const mh = 280;
    const mx = (CONFIG.CANVAS_WIDTH - mw) / 2;
    const my = (CONFIG.CANVAS_HEIGHT - mh) / 2;

    // Card Box
    ctx.fillStyle = '#fbf9f4';
    ctx.strokeStyle = CONFIG.COLORS.STICKMAN;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(mx, my, mw, mh, 14);
    ctx.fill();
    ctx.stroke();

    // Header Judul
    ctx.fillStyle = CONFIG.COLORS.STICKMAN;
    ctx.font = '900 24px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('MASUKKAN NAMA PEMAIN', CONFIG.CANVAS_WIDTH / 2, my + 40);

    ctx.fillStyle = '#6b7280';
    ctx.font = '500 14px Outfit, sans-serif';
    ctx.fillText('Nama ini akan dicatat di Papan Peringkat Troll!', CONFIG.CANVAS_WIDTH / 2, my + 68);

    // Input Field Box
    const inputX = mx + 40;
    const inputY = my + 92;
    const inputW = mw - 80;
    const inputH = 46;

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(inputX, inputY, inputW, inputH, 8);
    ctx.fill();
    ctx.stroke();

    // Teks Input + Kursor Kedip
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const showCursor = Math.floor(this.cursorBlinkTimer * 2) % 2 === 0;
    const displayText = this.inputName || '';

    if (displayText.length === 0) {
      ctx.fillStyle = '#9ca3af';
      ctx.font = 'italic 16px Outfit, sans-serif';
      ctx.fillText('Ketik namamu di sini...' + (showCursor ? '|' : ''), inputX + 16, inputY + inputH / 2);
    } else {
      ctx.fillStyle = CONFIG.COLORS.STICKMAN;
      ctx.font = 'bold 18px Outfit, sans-serif';
      ctx.fillText(displayText + (showCursor ? '|' : ''), inputX + 16, inputY + inputH / 2);
    }

    // Tombol Acak Nama
    const randomBtnX = mx + 40;
    const randomBtnY = my + 152;
    const randomBtnW = mw - 80;
    const randomBtnH = 34;

    ctx.fillStyle = '#f3f4f6';
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(randomBtnX, randomBtnY, randomBtnW, randomBtnH, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#374151';
    ctx.font = '600 13px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🎲 Beri Saya Nama Acak / Troll', CONFIG.CANVAS_WIDTH / 2, randomBtnY + randomBtnH / 2 + 1);

    // Tombol Simpan & Main
    const submitBtnX = mx + 40;
    const submitBtnY = my + 200;
    const submitBtnW = mw - 80;
    const submitBtnH = 48;

    ctx.fillStyle = CONFIG.COLORS.EXIT_GREEN;
    ctx.strokeStyle = CONFIG.COLORS.STICKMAN;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(submitBtnX, submitBtnY, submitBtnW, submitBtnH, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 17px Outfit, sans-serif';
    ctx.fillText('SIMPAN & LANJUT MAIN ➔', CONFIG.CANVAS_WIDTH / 2, submitBtnY + submitBtnH / 2 + 1);

    // Tombol Close X jika sudah ada nama
    if (Storage.getUsername()) {
      const closeX = mx + mw - 34;
      const closeY = my + 14;
      ctx.fillStyle = '#6b7280';
      ctx.font = 'bold 18px Outfit, sans-serif';
      ctx.fillText('✕', closeX, closeY + 10);
    }

    ctx.restore();
  }

  private renderLeaderboardModal(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.fillStyle = 'rgba(15, 15, 20, 0.75)';
    ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

    const mw = 560;
    const mh = 420;
    const mx = (CONFIG.CANVAS_WIDTH - mw) / 2;
    const my = (CONFIG.CANVAS_HEIGHT - mh) / 2;

    // Card Box
    ctx.fillStyle = '#fffdfa';
    ctx.strokeStyle = CONFIG.COLORS.STICKMAN;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(mx, my, mw, mh, 14);
    ctx.fill();
    ctx.stroke();

    // Judul
    ctx.fillStyle = '#d9480f';
    ctx.font = '900 24px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🏆 PAPAN PERINGKAT TROLL', CONFIG.CANVAS_WIDTH / 2, my + 38);

    ctx.fillStyle = '#555';
    ctx.font = '600 13px Outfit, sans-serif';
    ctx.fillText('Peringkat berdasarkan Level Tertinggi & Total Kematian Tersedikit', CONFIG.CANVAS_WIDTH / 2, my + 64);

    // Table Header
    const tableX = mx + 25;
    const tableY = my + 86;
    const tableW = mw - 50;

    ctx.fillStyle = '#2b2b36';
    ctx.beginPath();
    ctx.roundRect(tableX, tableY, tableW, 32, 6);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px Outfit, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('POS', tableX + 16, tableY + 16);
    ctx.fillText('NAMA PEMAIN', tableX + 75, tableY + 16);
    ctx.textAlign = 'center';
    ctx.fillText('LEVEL', tableX + 320, tableY + 16);
    ctx.fillText('TOTAL MATI', tableX + 430, tableY + 16);

    // Leaderboard Data
    const list = Storage.getLeaderboard().slice(0, 6);
    const currentUser = Storage.getUsername();
    const rowH = 34;

    for (let i = 0; i < list.length; i++) {
      const entry = list[i];
      const ry = tableY + 38 + i * (rowH + 4);
      const isMe = currentUser && entry.username.toLowerCase() === currentUser.toLowerCase();

      ctx.fillStyle = isMe ? '#eef2ff' : (i % 2 === 0 ? '#f8f9fa' : '#ffffff');
      ctx.strokeStyle = isMe ? '#4f46e5' : '#e9ecef';
      ctx.lineWidth = isMe ? 2 : 1;
      ctx.beginPath();
      ctx.roundRect(tableX, ry, tableW, rowH, 6);
      ctx.fill();
      ctx.stroke();

      // Medal / Rank Number
      let medal = `#${i + 1}`;
      if (i === 0) medal = '🥇 1';
      else if (i === 1) medal = '🥈 2';
      else if (i === 2) medal = '🥉 3';

      ctx.fillStyle = i === 0 ? '#d97706' : '#374151';
      ctx.font = 'bold 13px Outfit, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(medal, tableX + 14, ry + rowH / 2);

      // Nama Pemain
      ctx.fillStyle = isMe ? '#3730a3' : '#1f2937';
      ctx.font = isMe ? 'bold 14px Outfit, sans-serif' : '600 14px Outfit, sans-serif';
      ctx.fillText(entry.username + (isMe ? ' (Kamu)' : ''), tableX + 75, ry + rowH / 2);

      // Max Level
      ctx.fillStyle = '#059669';
      ctx.font = 'bold 14px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`LV ${entry.maxLevel}`, tableX + 320, ry + rowH / 2);

      // Total Deaths
      ctx.fillStyle = CONFIG.COLORS.HAZARD_RED;
      ctx.font = 'bold 14px Outfit, sans-serif';
      ctx.fillText(`${entry.totalDeaths}x ☠`, tableX + 430, ry + rowH / 2);
    }

    // Tombol Tutup Modal
    const closeBtnX = mx + (mw - 160) / 2;
    const closeBtnY = my + mh - 54;
    const closeBtnW = 160;
    const closeBtnH = 38;

    ctx.fillStyle = CONFIG.COLORS.STICKMAN;
    ctx.beginPath();
    ctx.roundRect(closeBtnX, closeBtnY, closeBtnW, closeBtnH, 8);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TUTUP ✖', CONFIG.CANVAS_WIDTH / 2, closeBtnY + closeBtnH / 2 + 1);

    ctx.restore();
  }

  public handleClick(px: number, py: number): string | null {
    // 1. Jika Modal Input Nama Aktif
    if (this.showUsernameModal) {
      const mw = 440;
      const mh = 280;
      const mx = (CONFIG.CANVAS_WIDTH - mw) / 2;
      const my = (CONFIG.CANVAS_HEIGHT - mh) / 2;

      // Tombol Acak Nama
      const randomBtnX = mx + 40;
      const randomBtnY = my + 152;
      const randomBtnW = mw - 80;
      const randomBtnH = 34;
      if (px >= randomBtnX && px <= randomBtnX + randomBtnW && py >= randomBtnY && py <= randomBtnY + randomBtnH) {
        this.inputName = this.getRandomName();
        return null;
      }

      // Tombol Simpan & Lanjut
      const submitBtnX = mx + 40;
      const submitBtnY = my + 200;
      const submitBtnW = mw - 80;
      const submitBtnH = 48;
      if (px >= submitBtnX && px <= submitBtnX + submitBtnW && py >= submitBtnY && py <= submitBtnY + submitBtnH) {
        this.confirmUsername();
        if (this.pendingPlay) {
          this.pendingPlay = false;
          return 'play';
        }
        return null;
      }

      // Tombol Close X jika sudah ada nama
      if (Storage.getUsername()) {
        const closeX = mx + mw - 34;
        const closeY = my + 14;
        if (px >= closeX - 10 && px <= closeX + 20 && py >= closeY - 10 && py <= closeY + 20) {
          this.showUsernameModal = false;
          this.pendingPlay = false;
          return null;
        }
      }

      return null;
    }

    // 2. Jika Modal Leaderboard Aktif
    if (this.showLeaderboardModal) {
      const mw = 560;
      const mh = 420;
      const mx = (CONFIG.CANVAS_WIDTH - mw) / 2;
      const my = (CONFIG.CANVAS_HEIGHT - mh) / 2;

      const closeBtnX = mx + (mw - 160) / 2;
      const closeBtnY = my + mh - 54;
      const closeBtnW = 160;
      const closeBtnH = 38;

      if (px >= closeBtnX && px <= closeBtnX + closeBtnW && py >= closeBtnY && py <= closeBtnY + closeBtnH) {
        this.showLeaderboardModal = false;
        return null;
      }

      // Klik di luar box juga menutup
      if (px < mx || px > mx + mw || py < my || py > my + mh) {
        this.showLeaderboardModal = false;
        return null;
      }

      return null;
    }

    // 3. Cek Klik pada Badge Nama Pemain di Menu Utama
    const badgeY = 132;
    const badgeH = 28;
    if (py >= badgeY && py <= badgeY + badgeH) {
      const badgeW = 220;
      const badgeX = (CONFIG.CANVAS_WIDTH - badgeW) / 2;
      if (px >= badgeX && px <= badgeX + badgeW) {
        this.inputName = Storage.getUsername();
        this.showUsernameModal = true;
        this.pendingPlay = false;
        return null;
      }
    }

    // 4. Cek Tombol Menu Utama
    for (const btn of this.buttons) {
      if (px >= btn.x && px <= btn.x + btn.w && py >= btn.y && py <= btn.y + btn.h) {
        if (btn.id === 'play') {
          // Jika username belum ada, munculkan modal input nama terlebih dahulu!
          if (!Storage.getUsername()) {
            this.inputName = '';
            this.showUsernameModal = true;
            this.pendingPlay = true;
            return null;
          }
          return 'play';
        }

        if (btn.id === 'leaderboard') {
          this.showLeaderboardModal = true;
          return null;
        }

        return btn.id;
      }
    }
    return null;
  }
}
