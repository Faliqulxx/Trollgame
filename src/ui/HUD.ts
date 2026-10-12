// Komponen HUD, Overlay Kematian, Jeda & Selesai Level (PRD Bagian 8.1)

import { CONFIG } from '../config';

export interface ButtonRect {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
}

export class HUD {
  // Tombol HUD interaktif
  public buttons: ButtonRect[] = [];

  // Death Message Toast
  public deathMessage: string | null = null;
  public deathMessageTimer = 0;

  // Level Clear Banner
  public isLevelClear = false;
  public levelClearTimer = 0;
  public clearStats = { time: 0, deaths: 0 };

  // Status Jeda
  public isPaused = false;
  public currentLevelId = 1;

  constructor() {
    this.setupHUDButtons();
  }

  private setupHUDButtons(): void {
    // Tombol di pojok kanan atas HUD (posisi rapi di bawah baris atap)
    this.buttons = [
      { id: 'restart', x: CONFIG.CANVAS_WIDTH - 146, y: 44, w: 38, h: 38, label: '↻' },
      { id: 'pause', x: CONFIG.CANVAS_WIDTH - 98, y: 44, w: 38, h: 38, label: '⏸' },
      { id: 'audio', x: CONFIG.CANVAS_WIDTH - 50, y: 44, w: 38, h: 38, label: '🔊' }
    ];
  }

  public showDeathMessage(_msg: string): void {
    // Teks kematian dinonaktifkan sesuai permintaan pengguna (hanya LV, jumlah mati, waktu)
    this.deathMessage = null;
  }

  public update(dt: number): void {
    if (this.isLevelClear) {
      this.levelClearTimer += dt;
    }
  }

  public render(
    ctx: CanvasRenderingContext2D,
    levelName: string,
    deaths: number,
    levelTime: number,
    isMuted: boolean
  ): void {
    ctx.save();

    // 1. Bar HUD Atas (Floating Capsule Modern dengan Bayangan Halus)
    const hudX = 20;
    const hudY = 44;
    const hudW = 230;
    const hudH = 38;

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 2;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.strokeStyle = CONFIG.COLORS.STICKMAN;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(hudX, hudY, hudW, hudH, 19);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Badge Level (Dark Pill di dalam HUD)
    ctx.fillStyle = CONFIG.COLORS.SOLID_BLOCK;
    ctx.beginPath();
    ctx.roundRect(hudX + 5, hudY + 4, 58, 30, 15);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${levelName}`, hudX + 34, hudY + 19);

    // Kematian (Tengkorak Merah)
    ctx.fillStyle = CONFIG.COLORS.HAZARD_RED;
    ctx.font = 'bold 15px Outfit, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('☠', hudX + 74, hudY + 19);

    ctx.fillStyle = CONFIG.COLORS.TEXT_DARK;
    ctx.font = 'bold 14px Outfit, sans-serif';
    ctx.fillText(`${deaths}`, hudX + 92, hudY + 19);

    // Garis Pemisah Halus
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(hudX + 130, hudY + 9);
    ctx.lineTo(hudX + 130, hudY + 29);
    ctx.stroke();

    // Waktu (Stopwatch Biru & Angka Detik)
    ctx.fillStyle = CONFIG.COLORS.CHECKPOINT_BLUE;
    ctx.font = '13px Outfit, sans-serif';
    ctx.fillText('⏱', hudX + 142, hudY + 19);

    ctx.fillStyle = '#444450';
    ctx.font = 'bold 13px Outfit, sans-serif';
    ctx.fillText(`${levelTime.toFixed(1)}s`, hudX + 160, hudY + 19);

    // 2. Tombol-Tombol HUD (Pojok Kanan, Circular Capsule dengan Shadow)
    for (const btn of this.buttons) {
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.10)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 2;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.strokeStyle = CONFIG.COLORS.STICKMAN;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(btn.x, btn.y, btn.w, btn.h, 19);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = CONFIG.COLORS.TEXT_DARK;
      ctx.font = 'bold 16px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      let label = btn.label;
      if (btn.id === 'audio' && isMuted) {
        label = '🔇';
      }
      ctx.fillText(label, btn.x + btn.w / 2, btn.y + btn.h / 2 + 1);
    }

    // 4. Layar Level Selesai (Pop-up dialog)
    if (this.isLevelClear) {
      this.renderLevelClearModal(ctx);
    }

    // 5. Layar Jeda (Pause)
    if (this.isPaused && !this.isLevelClear) {
      this.renderPauseModal(ctx);
    }

    ctx.restore();
  }

  private renderLevelClearModal(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.fillStyle = 'rgba(18, 18, 22, 0.7)';
    ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

    if (this.currentLevelId >= 6) {
      // MODAL SPESIAL LEVEL 6: NOTIFIKASI BAYAR DEV RP 10.000 UNTUK LANJUT KE LEVEL 7-100
      const mw = 460;
      const mh = 320;
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
      ctx.fillStyle = CONFIG.COLORS.EXIT_GREEN;
      ctx.font = '900 26px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🎉 LEVEL 6 SELESAI!', CONFIG.CANVAS_WIDTH / 2, my + 40);

      // Statistik Ringkas
      ctx.fillStyle = '#555';
      ctx.font = '600 14px Outfit, sans-serif';
      ctx.fillText(`⏱ Waktu: ${this.clearStats.time.toFixed(1)}s   |   ☠ Kematian: ${this.clearStats.deaths}x`, CONFIG.CANVAS_WIDTH / 2, my + 68);

      // Box Notifikasi Developer
      const nbX = mx + 20;
      const nbY = my + 92;
      const nbW = mw - 40;
      const nbH = 135;

      ctx.fillStyle = '#fff4e6';
      ctx.strokeStyle = '#e8590c';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(nbX, nbY, nbW, nbH, 10);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#d9480f';
      ctx.font = '900 16px Outfit, sans-serif';
      ctx.fillText('🔒 LEVEL 7 - 100 TERKUNCI!', CONFIG.CANVAS_WIDTH / 2, nbY + 28);

      ctx.fillStyle = '#2b2b36';
      ctx.font = '14px Outfit, sans-serif';
      ctx.fillText('Jika ingin melanjutkan game ke level seterusnya,', CONFIG.CANVAS_WIDTH / 2, nbY + 56);

      ctx.font = 'bold 15px Outfit, sans-serif';
      ctx.fillText('silakan hubungi developer (Dev FREEKS)', CONFIG.CANVAS_WIDTH / 2, nbY + 80);

      ctx.fillStyle = CONFIG.COLORS.HAZARD_RED;
      ctx.font = '900 17px Outfit, sans-serif';
      ctx.fillText('dengan menyiapkan uang Rp 10.000! 💸', CONFIG.CANVAS_WIDTH / 2, nbY + 110);

      // Tombol Kembali ke Menu
      const nextBtnX = mx + 50;
      const nextBtnY = my + 248;
      const nextBtnW = mw - 100;
      const nextBtnH = 46;

      ctx.fillStyle = CONFIG.COLORS.STICKMAN;
      ctx.beginPath();
      ctx.roundRect(nextBtnX, nextBtnY, nextBtnW, nextBtnH, 8);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Outfit, sans-serif';
      ctx.fillText('⬅ KEMBALI KE MENU', CONFIG.CANVAS_WIDTH / 2, nextBtnY + 26);
    } else {
      // Modal Normal (Level 1 - 5)
      const mw = 420;
      const mh = 260;
      const mx = (CONFIG.CANVAS_WIDTH - mw) / 2;
      const my = (CONFIG.CANVAS_HEIGHT - mh) / 2;

      ctx.fillStyle = '#fbf9f4';
      ctx.strokeStyle = CONFIG.COLORS.STICKMAN;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(mx, my, mw, mh, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = CONFIG.COLORS.EXIT_GREEN;
      ctx.font = '900 28px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('LEVEL SELESAI!', CONFIG.CANVAS_WIDTH / 2, my + 50);

      ctx.fillStyle = CONFIG.COLORS.TEXT_DARK;
      ctx.font = '16px "Architects Daughter", sans-serif';
      ctx.fillText('Kamu berhasil melewati semua tipuan... untuk saat ini.', CONFIG.CANVAS_WIDTH / 2, my + 82);

      ctx.font = '600 17px Outfit, sans-serif';
      ctx.fillText(`⏱ Waktu: ${this.clearStats.time.toFixed(1)} detik`, CONFIG.CANVAS_WIDTH / 2, my + 125);
      ctx.fillStyle = CONFIG.COLORS.HAZARD_RED;
      ctx.fillText(`☠ Kematian: ${this.clearStats.deaths} kali`, CONFIG.CANVAS_WIDTH / 2, my + 155);

      const nextBtnX = mx + 50;
      const nextBtnY = my + 190;
      const nextBtnW = mw - 100;
      const nextBtnH = 46;

      ctx.fillStyle = CONFIG.COLORS.EXIT_GREEN;
      ctx.strokeStyle = CONFIG.COLORS.STICKMAN;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(nextBtnX, nextBtnY, nextBtnW, nextBtnH, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px Outfit, sans-serif';
      ctx.fillText('Berikutnya ➔', CONFIG.CANVAS_WIDTH / 2, nextBtnY + 25);
    }

    ctx.restore();
  }

  private renderPauseModal(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.fillStyle = 'rgba(18, 18, 22, 0.7)';
    ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

    const mw = 360;
    const mh = 260;
    const mx = (CONFIG.CANVAS_WIDTH - mw) / 2;
    const my = (CONFIG.CANVAS_HEIGHT - mh) / 2;

    ctx.fillStyle = '#fbf9f4';
    ctx.strokeStyle = CONFIG.COLORS.STICKMAN;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(mx, my, mw, mh, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = CONFIG.COLORS.TEXT_DARK;
    ctx.font = '900 28px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GAME DIJEDA', CONFIG.CANVAS_WIDTH / 2, my + 50);

    const pauseButtons = [
      { y: my + 85, label: 'Lanjutkan Permainan', id: 'resume' },
      { y: my + 135, label: 'Ulangi Level (R)', id: 'restart_modal' },
      { y: my + 185, label: 'Pilih Level', id: 'level_select' }
    ];

    for (const b of pauseButtons) {
      const bx = mx + 40;
      const bw = mw - 80;
      const bh = 38;
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = CONFIG.COLORS.STICKMAN;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(bx, b.y, bw, bh, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = CONFIG.COLORS.TEXT_DARK;
      ctx.font = 'bold 15px Outfit, sans-serif';
      ctx.fillText(b.label, CONFIG.CANVAS_WIDTH / 2, b.y + bh / 2 + 1);
    }

    ctx.restore();
  }

  public getClickedAction(px: number, py: number): string | null {
    // 1. Cek tombol modal level selesai
    if (this.isLevelClear) {
      if (this.currentLevelId >= 6) {
        const mw = 460;
        const mh = 320;
        const mx = (CONFIG.CANVAS_WIDTH - mw) / 2;
        const my = (CONFIG.CANVAS_HEIGHT - mh) / 2;
        const nextBtnX = mx + 50;
        const nextBtnY = my + 248;
        const nextBtnW = mw - 100;
        const nextBtnH = 46;

        if (px >= nextBtnX && px <= nextBtnX + nextBtnW && py >= nextBtnY && py <= nextBtnY + nextBtnH) {
          return 'menu';
        }
        return null;
      } else {
        const mw = 420;
        const mh = 260;
        const mx = (CONFIG.CANVAS_WIDTH - mw) / 2;
        const my = (CONFIG.CANVAS_HEIGHT - mh) / 2;
        const nextBtnX = mx + 50;
        const nextBtnY = my + 190;
        const nextBtnW = mw - 100;
        const nextBtnH = 46;

        if (px >= nextBtnX && px <= nextBtnX + nextBtnW && py >= nextBtnY && py <= nextBtnY + nextBtnH) {
          return 'next_level';
        }
        return null;
      }
    }

    // 2. Cek tombol modal pause
    if (this.isPaused) {
      const mw = 360;
      const mh = 260;
      const mx = (CONFIG.CANVAS_WIDTH - mw) / 2;
      const my = (CONFIG.CANVAS_HEIGHT - mh) / 2;
      const bx = mx + 40;
      const bw = mw - 80;

      if (px >= bx && px <= bx + bw) {
        if (py >= my + 85 && py <= my + 85 + 38) return 'resume';
        if (py >= my + 135 && py <= my + 135 + 38) return 'restart';
        if (py >= my + 185 && py <= my + 185 + 38) return 'menu';
      }
      return null;
    }

    // 3. Cek tombol HUD atas
    for (const btn of this.buttons) {
      if (px >= btn.x && px <= btn.x + btn.w && py >= btn.y && py <= btn.y + btn.h) {
        return btn.id;
      }
    }

    return null;
  }
}
