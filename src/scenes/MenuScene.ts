// Layar Menu Utama (PRD Bagian 8.1)

import { CONFIG } from '../config';
import { Storage } from '../core/Storage';
import { AudioManager } from '../core/Audio';
import { HeadImageManager } from '../core/HeadImageManager';

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
    { id: 'select', x: 0, y: 0, w: 260, h: 42, label: '📜 PILIH LEVEL' },
    { id: 'leaderboard', x: 0, y: 0, w: 260, h: 42, label: '🏆 PAPAN PERINGKAT' },
    { id: 'audio_down', x: 0, y: 0, w: 46, h: 40, label: '➖' },
    { id: 'audio', x: 0, y: 0, w: 156, h: 40, label: '🔊 SUARA: 80%' },
    { id: 'audio_up', x: 0, y: 0, w: 46, h: 40, label: '➕' },
    { id: 'dialogue', x: 0, y: 0, w: 260, h: 38, label: '💬 DIALOG: AKTIF' },
    { id: 'reset', x: 0, y: 0, w: 260, h: 36, label: '↺ RESET PROGRES' }
  ];

  constructor(audio: AudioManager) {
    this.audio = audio;
    this.layoutButtons();
    this.inputName = Storage.getUsername();
  }

  private layoutButtons(): void {
    const startY = 226;
    const spacing = 43;
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

    // Tombol Toggle Dialog Karakter
    this.buttons[6].x = cx;
    this.buttons[6].y = startY + spacing * 4;

    // Reset Progres
    this.buttons[7].x = cx;
    this.buttons[7].y = startY + spacing * 5;
  }

  public leaderboardPage = 0;
  public readonly leaderboardPerPage = 6;

  public isUsernameModalOpen(): boolean {
    return this.showUsernameModal;
  }

  public update(dt: number, typedKey: string | null = null, wheelDeltaY = 0): void {
    this.animTimer += dt;
    this.cursorBlinkTimer += dt;

    const vol = this.audio.getVolumePercent();
    const muted = this.audio.getMuted() || vol <= 0;
    this.buttons[4].label = muted ? '🔇 SUARA: 0%' : `🔊 SUARA: ${vol}%`;

    const diagOn = Storage.getDialogueEnabled();
    const freq = Storage.getDialogueFrequency();
    const freqStr = freq === 'rare' ? 'Jarang' : freq === 'often' ? 'Sering' : 'Normal';
    this.buttons[6].label = diagOn ? `💬 DIALOG: AKTIF (${freqStr})` : '💬 DIALOG: NONAKTIF';

    // Handle scroll wheel di modal leaderboard
    if (this.showLeaderboardModal && wheelDeltaY !== 0) {
      const totalPages = Math.ceil(Storage.getLeaderboard().length / this.leaderboardPerPage);
      if (wheelDeltaY > 0) {
        this.leaderboardPage = Math.min(totalPages - 1, this.leaderboardPage + 1);
      } else if (wheelDeltaY < 0) {
        this.leaderboardPage = Math.max(0, this.leaderboardPage - 1);
      }
    }

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
    const currentName = Storage.getUsername() || '(Klik untuk atur profil & foto)';
    const hasPhoto = HeadImageManager.getInstance().hasCustomHead();
    const photoIcon = hasPhoto ? '📸 ' : '';
    const text = `👤 ${photoIcon}Pemain: ${currentName}  ✏️`;

    ctx.font = 'bold 13px Outfit, sans-serif';
    const textW = ctx.measureText(text).width;
    const badgeW = Math.max(220, textW + 28);
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
    const customHead = HeadImageManager.getInstance().getImage();

    if (customHead) {
      // Kepala foto kustom di animasi menu
      const headR = 9;
      ctx.save();
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.beginPath();
      ctx.arc(cx, stickY - 12, headR, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(customHead, cx - headR, stickY - 12 - headR, headR * 2, headR * 2);
      ctx.restore();

      ctx.beginPath();
      ctx.arc(cx, stickY - 12, headR, 0, Math.PI * 2);
      ctx.lineWidth = 2;
      ctx.strokeStyle = CONFIG.COLORS.STICKMAN;
      ctx.stroke();
    } else {
      // Kepala stickman doodle default
      ctx.beginPath();
      ctx.arc(cx, stickY - 12, 6, 0, Math.PI * 2);
      ctx.stroke();
      // Mata panik
      ctx.fillStyle = '#000';
      ctx.fillRect(cx - 2, stickY - 14, 2, 2);
      ctx.fillRect(cx + 2, stickY - 14, 2, 2);
    }

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
    ctx.fillStyle = 'rgba(15, 15, 20, 0.78)';
    ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

    const mw = 480;
    const mh = 380;
    const mx = (CONFIG.CANVAS_WIDTH - mw) / 2;
    const my = (CONFIG.CANVAS_HEIGHT - mh) / 2;

    // Card Box
    ctx.fillStyle = '#fbf9f4';
    ctx.strokeStyle = CONFIG.COLORS.STICKMAN;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(mx, my, mw, mh, 16);
    ctx.fill();
    ctx.stroke();

    // Header Judul
    ctx.fillStyle = CONFIG.COLORS.STICKMAN;
    ctx.font = '900 22px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('PROFIL & KEPALA STICKMAN', CONFIG.CANVAS_WIDTH / 2, my + 34);

    ctx.fillStyle = '#6b7280';
    ctx.font = '500 13px Outfit, sans-serif';
    ctx.fillText('Atur nama & foto wajah untuk menggantikan kepala stickman!', CONFIG.CANVAS_WIDTH / 2, my + 54);

    // Area Avatar & Upload Foto Wajah
    const avatarBoxX = mx + 36;
    const avatarBoxY = my + 68;
    const avatarBoxW = 74;
    const avatarBoxH = 74;

    // Background kotak avatar
    ctx.fillStyle = '#f3f4f6';
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(avatarBoxX, avatarBoxY, avatarBoxW, avatarBoxH, 12);
    ctx.fill();
    ctx.stroke();

    const customHead = HeadImageManager.getInstance().getImage();
    const avCenterX = avatarBoxX + avatarBoxW / 2;
    const avCenterY = avatarBoxY + avatarBoxH / 2;
    const avRadius = 28;

    if (customHead) {
      // Foto kustom lingkaran HD
      ctx.save();
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.beginPath();
      ctx.arc(avCenterX, avCenterY, avRadius, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(customHead, avCenterX - avRadius, avCenterY - avRadius, avRadius * 2, avRadius * 2);
      ctx.restore();

      ctx.strokeStyle = '#4f46e5';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(avCenterX, avCenterY, avRadius, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      // Stickman standar
      ctx.strokeStyle = CONFIG.COLORS.STICKMAN;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(avCenterX, avCenterY, avRadius - 4, 0, Math.PI * 2);
      ctx.stroke();

      // Mata & senyum doodle
      ctx.fillStyle = CONFIG.COLORS.STICKMAN;
      ctx.beginPath();
      ctx.arc(avCenterX - 8, avCenterY - 4, 2.5, 0, Math.PI * 2);
      ctx.arc(avCenterX + 8, avCenterY - 4, 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(avCenterX, avCenterY + 4, 10, 0.2 * Math.PI, 0.8 * Math.PI);
      ctx.stroke();
    }

    // Panel tombol samping avatar
    const btnStartX = mx + 122;
    const hasPhoto = customHead !== null;

    // Status label
    ctx.textAlign = 'left';
    ctx.fillStyle = hasPhoto ? '#059669' : '#4b5563';
    ctx.font = 'bold 12.5px Outfit, sans-serif';
    ctx.fillText(hasPhoto ? '✅ Foto Wajah Aktif' : '⚪ Kepala Stickman Default', btnStartX, my + 84);

    const btnY = my + 94;
    const btnH = 32;

    if (hasPhoto) {
      // 1. Tombol Foto Kamera (Compact)
      const camBtnW = 100;
      ctx.fillStyle = '#e11d48';
      ctx.strokeStyle = '#be123c';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(btnStartX, btnY, camBtnW, btnH, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12.5px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('📸 Kamera', btnStartX + camBtnW / 2, btnY + btnH / 2);

      // 2. Tombol Upload File (Compact)
      const fileBtnX = btnStartX + camBtnW + 8;
      const fileBtnW = 100;
      ctx.fillStyle = '#2563eb';
      ctx.strokeStyle = '#1d4ed8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(fileBtnX, btnY, fileBtnW, btnH, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.fillText('📁 Upload', fileBtnX + fileBtnW / 2, btnY + btnH / 2);

      // 3. Tombol Hapus
      const delBtnX = fileBtnX + fileBtnW + 8;
      const delBtnW = 85;
      ctx.fillStyle = '#fee2e2';
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(delBtnX, btnY, delBtnW, btnH, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#b91c1c';
      ctx.fillText('🗑️ Hapus', delBtnX + delBtnW / 2, btnY + btnH / 2);
    } else {
      // Belum ada foto: 2 tombol besar sejajar
      const camBtnW = 145;
      ctx.fillStyle = '#e11d48';
      ctx.strokeStyle = '#be123c';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(btnStartX, btnY, camBtnW, btnH, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12.5px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('📸 Foto Kamera', btnStartX + camBtnW / 2, btnY + btnH / 2);

      const fileBtnX = btnStartX + camBtnW + 10;
      const fileBtnW = 145;
      ctx.fillStyle = '#2563eb';
      ctx.strokeStyle = '#1d4ed8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(fileBtnX, btnY, fileBtnW, btnH, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.fillText('📁 Upload File', fileBtnX + fileBtnW / 2, btnY + btnH / 2);
    }

    // Teks keterangan kecil di bawah tombol
    ctx.textAlign = 'left';
    ctx.fillStyle = '#6b7280';
    ctx.font = '500 11px Outfit, sans-serif';
    ctx.fillText('Langsung foto kamera atau upload file • Crop Wajah HD 512×512', btnStartX, my + 140);

    // Garis pemisah tipis
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(mx + 36, my + 152);
    ctx.lineTo(mx + mw - 36, my + 152);
    ctx.stroke();

    // Field Input Nama Pemain
    const inputX = mx + 36;
    const inputY = my + 178;
    const inputW = mw - 72;
    const inputH = 42;

    ctx.fillStyle = '#374151';
    ctx.font = 'bold 13px Outfit, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('Nama Pemain:', inputX, my + 172);

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(inputX, inputY, inputW, inputH, 8);
    ctx.fill();
    ctx.stroke();

    // Teks Nama + Kursor
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const showCursor = Math.floor(this.cursorBlinkTimer * 2) % 2 === 0;
    const displayText = this.inputName || '';

    if (displayText.length === 0) {
      ctx.fillStyle = '#9ca3af';
      ctx.font = 'italic 15px Outfit, sans-serif';
      ctx.fillText('Ketik namamu di sini...' + (showCursor ? '|' : ''), inputX + 14, inputY + inputH / 2);
    } else {
      ctx.fillStyle = CONFIG.COLORS.STICKMAN;
      ctx.font = 'bold 17px Outfit, sans-serif';
      ctx.fillText(displayText + (showCursor ? '|' : ''), inputX + 14, inputY + inputH / 2);
    }

    // Tombol Acak Nama
    const randomBtnX = mx + 36;
    const randomBtnY = my + 230;
    const randomBtnW = mw - 72;
    const randomBtnH = 32;

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

    // Tombol Simpan & Lanjut Main
    const submitBtnX = mx + 36;
    const submitBtnY = my + 274;
    const submitBtnW = mw - 72;
    const submitBtnH = 46;

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
      const closeX = mx + mw - 32;
      const closeY = my + 14;
      ctx.fillStyle = '#6b7280';
      ctx.font = 'bold 18px Outfit, sans-serif';
      ctx.fillText('✕', closeX, closeY + 12);
    }

    ctx.restore();
  }

  private renderLeaderboardModal(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.fillStyle = 'rgba(15, 15, 20, 0.75)';
    ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

    const mw = 580;
    const mh = 450;
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
    ctx.fillText('🏆 PAPAN PERINGKAT TROLL', CONFIG.CANVAS_WIDTH / 2, my + 34);

    ctx.fillStyle = '#555';
    ctx.font = '600 13px Outfit, sans-serif';
    ctx.fillText('Peringkat berdasarkan Level Tertinggi & Pejuang Kematian Terbanyak', CONFIG.CANVAS_WIDTH / 2, my + 56);

    // Table Header
    const tableX = mx + 20;
    const tableY = my + 74;
    const tableW = mw - 40;

    ctx.fillStyle = '#2b2b36';
    ctx.beginPath();
    ctx.roundRect(tableX, tableY, tableW, 30, 6);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px Outfit, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('POS', tableX + 14, tableY + 15);
    ctx.fillText('NAMA PEMAIN', tableX + 75, tableY + 15);
    ctx.textAlign = 'center';
    ctx.fillText('LEVEL', tableX + 340, tableY + 15);
    ctx.fillText('TOTAL MATI', tableX + 460, tableY + 15);

    // Leaderboard Data dengan Paginasi 300 Entri
    const allList = Storage.getLeaderboard();
    const totalPages = Math.max(1, Math.ceil(allList.length / this.leaderboardPerPage));
    this.leaderboardPage = Math.max(0, Math.min(totalPages - 1, this.leaderboardPage));

    const startIdx = this.leaderboardPage * this.leaderboardPerPage;
    const pageItems = allList.slice(startIdx, startIdx + this.leaderboardPerPage);
    const currentUser = Storage.getUsername();
    const rowH = 34;

    for (let i = 0; i < pageItems.length; i++) {
      const entry = pageItems[i];
      const rank = startIdx + i + 1;
      const ry = tableY + 34 + i * (rowH + 4);
      const isMe = currentUser && entry.username.toLowerCase() === currentUser.toLowerCase();

      ctx.fillStyle = isMe ? '#eef2ff' : (i % 2 === 0 ? '#f8f9fa' : '#ffffff');
      ctx.strokeStyle = isMe ? '#4f46e5' : '#e9ecef';
      ctx.lineWidth = isMe ? 2 : 1;
      ctx.beginPath();
      ctx.roundRect(tableX, ry, tableW, rowH, 6);
      ctx.fill();
      ctx.stroke();

      // Medal / Rank Number
      let medal = `#${rank}`;
      if (rank === 1) medal = '🥇 1';
      else if (rank === 2) medal = '🥈 2';
      else if (rank === 3) medal = '🥉 3';

      ctx.fillStyle = rank === 1 ? '#d97706' : (rank <= 3 ? '#2563eb' : '#374151');
      ctx.font = 'bold 13px Outfit, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(medal, tableX + 12, ry + rowH / 2);

      // Nama Pemain
      ctx.fillStyle = isMe ? '#3730a3' : '#1f2937';
      ctx.font = isMe ? 'bold 14px Outfit, sans-serif' : '600 14px Outfit, sans-serif';
      ctx.fillText(entry.username + (isMe ? ' (Kamu)' : ''), tableX + 75, ry + rowH / 2);

      // Max Level
      ctx.fillStyle = '#059669';
      ctx.font = 'bold 14px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`LV ${entry.maxLevel}`, tableX + 340, ry + rowH / 2);

      // Total Deaths
      ctx.fillStyle = CONFIG.COLORS.HAZARD_RED;
      ctx.font = 'bold 14px Outfit, sans-serif';
      ctx.fillText(`${entry.totalDeaths}x ☠`, tableX + 460, ry + rowH / 2);
    }

    // Navigasi Paginasi (Prev / Next / Posisi Saya)
    const navY = my + 346;

    // Tombol Prev
    const prevBtnX = mx + 25;
    const prevBtnW = 80;
    const prevBtnH = 30;
    const canPrev = this.leaderboardPage > 0;
    ctx.fillStyle = canPrev ? '#ffffff' : '#f3f4f6';
    ctx.strokeStyle = canPrev ? CONFIG.COLORS.STICKMAN : '#d1d5db';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(prevBtnX, navY, prevBtnW, prevBtnH, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = canPrev ? CONFIG.COLORS.TEXT_DARK : '#9ca3af';
    ctx.font = 'bold 12px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('◀ PREV', prevBtnX + prevBtnW / 2, navY + prevBtnH / 2 + 1);

    // Tombol Posisi Saya
    const meBtnX = mx + (mw - 140) / 2;
    const meBtnW = 140;
    const meBtnH = 30;
    ctx.fillStyle = '#eef2ff';
    ctx.strokeStyle = '#4f46e5';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(meBtnX, navY, meBtnW, meBtnH, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#3730a3';
    ctx.font = 'bold 12px Outfit, sans-serif';
    ctx.fillText('👤 POSISI SAYA', meBtnX + meBtnW / 2, navY + meBtnH / 2 + 1);

    // Tombol Next
    const nextBtnX = mx + mw - 105;
    const nextBtnW = 80;
    const nextBtnH = 30;
    const canNext = this.leaderboardPage < totalPages - 1;
    ctx.fillStyle = canNext ? '#ffffff' : '#f3f4f6';
    ctx.strokeStyle = canNext ? CONFIG.COLORS.STICKMAN : '#d1d5db';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(nextBtnX, navY, nextBtnW, nextBtnH, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = canNext ? CONFIG.COLORS.TEXT_DARK : '#9ca3af';
    ctx.font = 'bold 12px Outfit, sans-serif';
    ctx.fillText('NEXT ▶', nextBtnX + nextBtnW / 2, navY + nextBtnH / 2 + 1);

    // Keterangan Halaman
    ctx.fillStyle = '#6b7280';
    ctx.font = '500 12px Outfit, sans-serif';
    ctx.textAlign = 'center';
    const endRank = Math.min(allList.length, startIdx + pageItems.length);
    ctx.fillText(
      `Halaman ${this.leaderboardPage + 1} / ${totalPages}  (#${startIdx + 1} - #${endRank} dari ${allList.length} Pemain)`,
      CONFIG.CANVAS_WIDTH / 2,
      navY + 44
    );

    // Tombol Tutup Modal
    const closeBtnX = mx + (mw - 150) / 2;
    const closeBtnY = my + mh - 44;
    const closeBtnW = 150;
    const closeBtnH = 34;

    ctx.fillStyle = CONFIG.COLORS.STICKMAN;
    ctx.beginPath();
    ctx.roundRect(closeBtnX, closeBtnY, closeBtnW, closeBtnH, 8);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TUTUP ✖', CONFIG.CANVAS_WIDTH / 2, closeBtnY + closeBtnH / 2 + 1);

    ctx.restore();
  }

  public handleClick(px: number, py: number): string | null {
    // 1. Jika Modal Input Nama & Profil Aktif
    if (this.showUsernameModal) {
      const mw = 480;
      const mh = 380;
      const mx = (CONFIG.CANVAS_WIDTH - mw) / 2;
      const my = (CONFIG.CANVAS_HEIGHT - mh) / 2;

      const hasPhoto = HeadImageManager.getInstance().hasCustomHead();
      const btnStartX = mx + 122;
      const btnY = my + 94;
      const btnH = 32;

      if (hasPhoto) {
        // 1. Tombol Kamera (Compact)
        const camBtnW = 100;
        if (px >= btnStartX && px <= btnStartX + camBtnW && py >= btnY && py <= btnY + btnH) {
          HeadImageManager.getInstance().triggerCameraCapture();
          return null;
        }

        // 2. Tombol Upload File (Compact)
        const fileBtnX = btnStartX + camBtnW + 8;
        const fileBtnW = 100;
        if (px >= fileBtnX && px <= fileBtnX + fileBtnW && py >= btnY && py <= btnY + btnH) {
          HeadImageManager.getInstance().triggerFileInput();
          return null;
        }

        // 3. Tombol Hapus
        const delBtnX = fileBtnX + fileBtnW + 8;
        const delBtnW = 85;
        if (px >= delBtnX && px <= delBtnX + delBtnW && py >= btnY && py <= btnY + btnH) {
          HeadImageManager.getInstance().removeCustomHead();
          return null;
        }
      } else {
        // Belum ada foto: 2 tombol besar
        const camBtnW = 145;
        if (px >= btnStartX && px <= btnStartX + camBtnW && py >= btnY && py <= btnY + btnH) {
          HeadImageManager.getInstance().triggerCameraCapture();
          return null;
        }

        const fileBtnX = btnStartX + camBtnW + 10;
        const fileBtnW = 145;
        if (px >= fileBtnX && px <= fileBtnX + fileBtnW && py >= btnY && py <= btnY + btnH) {
          HeadImageManager.getInstance().triggerFileInput();
          return null;
        }
      }

      // Tombol Acak Nama
      const randomBtnX = mx + 36;
      const randomBtnY = my + 230;
      const randomBtnW = mw - 72;
      const randomBtnH = 32;
      if (px >= randomBtnX && px <= randomBtnX + randomBtnW && py >= randomBtnY && py <= randomBtnY + randomBtnH) {
        this.inputName = this.getRandomName();
        return null;
      }

      // Tombol Simpan & Lanjut
      const submitBtnX = mx + 36;
      const submitBtnY = my + 274;
      const submitBtnW = mw - 72;
      const submitBtnH = 46;
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
        const closeX = mx + mw - 32;
        const closeY = my + 14;
        if (px >= closeX - 12 && px <= closeX + 18 && py >= closeY - 8 && py <= closeY + 24) {
          this.showUsernameModal = false;
          this.pendingPlay = false;
          return null;
        }
      }

      return null;
    }

    // 2. Jika Modal Leaderboard Aktif
    if (this.showLeaderboardModal) {
      const mw = 580;
      const mh = 450;
      const mx = (CONFIG.CANVAS_WIDTH - mw) / 2;
      const my = (CONFIG.CANVAS_HEIGHT - mh) / 2;
      const navY = my + 346;

      const allList = Storage.getLeaderboard();
      const totalPages = Math.max(1, Math.ceil(allList.length / this.leaderboardPerPage));

      // Tombol Prev
      const prevBtnX = mx + 25;
      const prevBtnW = 80;
      const prevBtnH = 30;
      if (px >= prevBtnX && px <= prevBtnX + prevBtnW && py >= navY && py <= navY + prevBtnH) {
        if (this.leaderboardPage > 0) {
          this.leaderboardPage--;
        }
        return null;
      }

      // Tombol Posisi Saya
      const meBtnX = mx + (mw - 140) / 2;
      const meBtnW = 140;
      const meBtnH = 30;
      if (px >= meBtnX && px <= meBtnX + meBtnW && py >= navY && py <= navY + meBtnH) {
        const currentUser = Storage.getUsername().toLowerCase();
        const userIdx = allList.findIndex(e => e.username.toLowerCase() === currentUser);
        if (userIdx !== -1) {
          this.leaderboardPage = Math.floor(userIdx / this.leaderboardPerPage);
        }
        return null;
      }

      // Tombol Next
      const nextBtnX = mx + mw - 105;
      const nextBtnW = 80;
      const nextBtnH = 30;
      if (px >= nextBtnX && px <= nextBtnX + nextBtnW && py >= navY && py <= navY + nextBtnH) {
        if (this.leaderboardPage < totalPages - 1) {
          this.leaderboardPage++;
        }
        return null;
      }

      // Tombol Tutup Modal
      const closeBtnX = mx + (mw - 150) / 2;
      const closeBtnY = my + mh - 44;
      const closeBtnW = 150;
      const closeBtnH = 34;

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
      const badgeW = 280;
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
