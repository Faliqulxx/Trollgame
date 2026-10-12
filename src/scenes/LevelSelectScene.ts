// Layar Pilih Level (Grid 20 Level & Gembok Level 11-20)

import { CONFIG } from '../config';
import { Storage } from '../core/Storage';
import { AudioManager } from '../core/Audio';

export interface LevelCard {
  levelId: number;
  x: number;
  y: number;
  w: number;
  h: number;
  isUnlocked: boolean;
  isCompleted: boolean;
}

export class LevelSelectScene {
  public cards: LevelCard[] = [];
  public backButton = { x: 28, y: 22, w: 110, h: 40, label: '⬅ KEMBALI' };

  // Total 20 Level ditampilkan dalam 1 halaman grid (4 baris x 5 kolom)
  public currentPage = 0;
  public readonly totalPages = 1;
  public readonly levelsPerPage = 20;

  public prevButton = { x: 260, y: 485, w: 120, h: 38, label: '◀ SEBELUMNYA' };
  public nextButton = { x: 580, y: 485, w: 120, h: 38, label: 'SELANJUTNYA ▶' };

  // Modal notifikasi bayar dev jika mengklik level terkunci (Level 11 - 20 atau belum terbuka)
  public lockedNoticeLevel: number | null = null;
  private audio?: AudioManager;

  constructor(audio?: AudioManager) {
    this.audio = audio || AudioManager.getInstance();
    this.refreshCards();
  }

  public refreshCards(): void {
    this.cards = [];
    const unlockedLevel = Storage.getUnlockedLevel();
    const save = Storage.getData();

    const startX = 78;
    const startY = 82;
    const cardW = 140;
    const cardH = 82;
    const gapX = 26;
    const gapY = 16;

    const startLevel = 1;
    const endLevel = 20;

    let indexOnPage = 0;
    for (let lvlId = startLevel; lvlId <= endLevel; lvlId++) {
      const col = indexOnPage % 5;
      const row = Math.floor(indexOnPage / 5);

      const x = startX + col * (cardW + gapX);
      const y = startY + row * (cardH + gapY);

      // Level 1-10 terbuka sesuai progres pemain (Level 7-10 sudah dibuka!)
      // Level 11-20 WAJIB TERKUNCI (gembok bayar dev)
      const isUnlocked = lvlId <= 10 && lvlId <= unlockedLevel;
      const record = save.levels[lvlId];

      this.cards.push({
        levelId: lvlId,
        x,
        y,
        w: cardW,
        h: cardH,
        isUnlocked,
        isCompleted: isUnlocked && !!record?.completed
      });

      indexOnPage++;
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // 1. Latar Belakang Kertas
    ctx.fillStyle = CONFIG.COLORS.BG_PAPER;
    ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

    // 2. Tombol Kembali
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = CONFIG.COLORS.STICKMAN;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(this.backButton.x, this.backButton.y, this.backButton.w, this.backButton.h, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = CONFIG.COLORS.TEXT_DARK;
    ctx.font = 'bold 15px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.backButton.label, this.backButton.x + this.backButton.w / 2, this.backButton.y + this.backButton.h / 2 + 1);

    // 3. Judul Halaman
    ctx.fillStyle = CONFIG.COLORS.STICKMAN;
    ctx.font = '900 30px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PILIH LEVEL (1 - 20)', CONFIG.CANVAS_WIDTH / 2, 42);

    // 4. Kartu Level (Tanpa Teks Keterangan, Hanya Nomor & Gembok)
    for (const c of this.cards) {
      ctx.save();
      ctx.translate(c.x, c.y);

      // Kotak Kartu
      if (c.isUnlocked) {
        ctx.fillStyle = c.isCompleted ? '#f0f9f5' : '#ffffff';
        ctx.strokeStyle = c.isCompleted ? CONFIG.COLORS.EXIT_GREEN : CONFIG.COLORS.STICKMAN;
        ctx.lineWidth = 2.5;
      } else {
        ctx.fillStyle = '#e5e2d8';
        ctx.strokeStyle = '#a09c90';
        ctx.lineWidth = 2;
      }

      ctx.beginPath();
      ctx.roundRect(0, 0, c.w, c.h, 10);
      ctx.fill();
      ctx.stroke();

      if (c.isUnlocked) {
        // HANYA NOMOR LEVEL BESAR (Tanpa teks keterangan/nama/status apapun)
        ctx.fillStyle = c.isCompleted ? CONFIG.COLORS.EXIT_GREEN : CONFIG.COLORS.STICKMAN;
        ctx.font = '900 36px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${c.levelId}`, c.w / 2, c.h / 2);
      } else {
        // LEVEL TERKUNCI: Gembok & Nomor Level (Tanpa teks keterangan/nama/status apapun)
        ctx.fillStyle = '#666';
        ctx.font = '24px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🔒', c.w / 2, c.h / 2 - 12);

        ctx.fillStyle = '#777785';
        ctx.font = 'bold 16px Outfit, sans-serif';
        ctx.fillText(`${c.levelId}`, c.w / 2, c.h / 2 + 18);
      }

      ctx.restore();
    }

    // Catatan Info Bawah
    ctx.fillStyle = '#777785';
    ctx.font = 'bold 13px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Level 1 - 10 Tersedia Gratis  •  Level 11 - 20 Terkunci (Hubungi Dev)', CONFIG.CANVAS_WIDTH / 2, 495);

    // 6. Modal Pop-up Notifikasi jika mengklik level terkunci
    if (this.lockedNoticeLevel !== null) {
      this.renderLockedModal(ctx, this.lockedNoticeLevel);
    }

    ctx.restore();
  }

  private renderLockedModal(ctx: CanvasRenderingContext2D, levelId: number): void {
    ctx.save();
    // Backdrop gelap
    ctx.fillStyle = 'rgba(18, 18, 22, 0.65)';
    ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

    // Kotak Modal Notifikasi
    const mw = 440;
    const mh = 250;
    const mx = (CONFIG.CANVAS_WIDTH - mw) / 2;
    const my = (CONFIG.CANVAS_HEIGHT - mh) / 2;

    ctx.fillStyle = '#fffdfa';
    ctx.strokeStyle = CONFIG.COLORS.STICKMAN;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(mx, my, mw, mh, 14);
    ctx.fill();
    ctx.stroke();

    // Judul
    ctx.fillStyle = CONFIG.COLORS.HAZARD_RED;
    ctx.font = '900 24px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`🔒 LEVEL ${levelId} TERKUNCI!`, CONFIG.CANVAS_WIDTH / 2, my + 44);

    // Pesan Notifikasi Developer
    ctx.fillStyle = CONFIG.COLORS.TEXT_DARK;
    ctx.font = '15px Outfit, sans-serif';
    ctx.fillText('Jika ingin melanjutkan game ke level seterusnya,', CONFIG.CANVAS_WIDTH / 2, my + 84);

    ctx.font = 'bold 16px Outfit, sans-serif';
    ctx.fillText('silakan hubungi developer (Dev FREEKS)', CONFIG.CANVAS_WIDTH / 2, my + 112);

    ctx.fillStyle = CONFIG.COLORS.HAZARD_RED;
    ctx.font = '900 18px Outfit, sans-serif';
    ctx.fillText('dengan menyiapkan uang Rp 10.000! 💸', CONFIG.CANVAS_WIDTH / 2, my + 144);

    // Tombol "OKE, SAYA MENGERTI"
    const btnW = 200;
    const btnH = 42;
    const btnX = (CONFIG.CANVAS_WIDTH - btnW) / 2;
    const btnY = my + 182;

    ctx.fillStyle = CONFIG.COLORS.STICKMAN;
    ctx.beginPath();
    ctx.roundRect(btnX, btnY, btnW, btnH, 8);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px Outfit, sans-serif';
    ctx.fillText('OKE, MENGERTI', CONFIG.CANVAS_WIDTH / 2, btnY + btnH / 2 + 1);

    ctx.restore();
  }

  public handleClick(px: number, py: number): number | 'back' | null {
    // Jika modal notifikasi sedang terbuka, klik tombol untuk menutup modal
    if (this.lockedNoticeLevel !== null) {
      const mh = 250;
      const my = (CONFIG.CANVAS_HEIGHT - mh) / 2;
      const btnW = 200;
      const btnH = 42;
      const btnX = (CONFIG.CANVAS_WIDTH - btnW) / 2;
      const btnY = my + 182;

      if (px >= btnX && px <= btnX + btnW && py >= btnY && py <= btnY + btnH) {
        this.lockedNoticeLevel = null;
      }
      return null;
    }

    // Tombol kembali
    if (
      px >= this.backButton.x &&
      px <= this.backButton.x + this.backButton.w &&
      py >= this.backButton.y &&
      py <= this.backButton.y + this.backButton.h
    ) {
      return 'back';
    }

    // Tombol Prev
    if (
      this.currentPage > 0 &&
      px >= this.prevButton.x &&
      px <= this.prevButton.x + this.prevButton.w &&
      py >= this.prevButton.y &&
      py <= this.prevButton.y + this.prevButton.h
    ) {
      this.currentPage--;
      this.refreshCards();
      return null;
    }

    // Tombol Next
    if (
      this.currentPage < this.totalPages - 1 &&
      px >= this.nextButton.x &&
      px <= this.nextButton.x + this.nextButton.w &&
      py >= this.nextButton.y &&
      py <= this.nextButton.y + this.nextButton.h
    ) {
      this.currentPage++;
      this.refreshCards();
      return null;
    }

    // Klik kartu level
    for (const c of this.cards) {
      if (px >= c.x && px <= c.x + c.w && py >= c.y && py <= c.y + c.h) {
        if (c.isUnlocked) {
          return c.levelId;
        } else {
          // Buka modal notifikasi bayar dev untuk level terkunci (Level 7 - 100)
          this.lockedNoticeLevel = c.levelId;
          this.audio?.playStinger();
          return null;
        }
      }
    }

    return null;
  }
}
