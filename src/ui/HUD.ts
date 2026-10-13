// Komponen HUD, Overlay Kematian, Jeda & Selesai Level (PRD Bagian 8.1)

import { CONFIG } from '../config';
import { Storage } from '../core/Storage';

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
    isMuted: boolean,
    volumePercent = 80
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
      if (btn.id === 'audio') {
        if (isMuted || volumePercent <= 0) {
          label = '🔇';
        } else if (volumePercent <= 33) {
          label = '🔈';
        } else if (volumePercent <= 66) {
          label = '🔉';
        } else {
          label = '🔊';
        }
      }
      ctx.fillText(label, btn.x + btn.w / 2, btn.y + btn.h / 2 + 1);
    }

    // 4. Layar Level Selesai (Pop-up dialog)
    if (this.isLevelClear) {
      this.renderLevelClearModal(ctx);
    }

    // 5. Layar Jeda (Pause)
    if (this.isPaused && !this.isLevelClear) {
      this.renderPauseModal(ctx, volumePercent, isMuted);
    }

    ctx.restore();
  }

  private renderLevelClearModal(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.fillStyle = 'rgba(18, 18, 22, 0.7)';
    ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

    if (this.currentLevelId >= 10) {
      // MODAL SPESIAL LEVEL 10: NOTIFIKASI BAYAR DEV RP 10.000 UNTUK LANJUT KE LEVEL 11-20
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
      ctx.fillText('🎉 LEVEL 10 SELESAI!', CONFIG.CANVAS_WIDTH / 2, my + 40);

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
      ctx.fillText('🔒 LEVEL 11 - 20 TERKUNCI!', CONFIG.CANVAS_WIDTH / 2, nbY + 28);

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
      // Modal Normal (Level 1 - 9)
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

  private renderPauseModal(ctx: CanvasRenderingContext2D, volumePercent: number, isMuted: boolean): void {
    ctx.save();
    ctx.fillStyle = 'rgba(18, 18, 22, 0.7)';
    ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

    const mw = 380;
    const mh = 360;
    const mx = (CONFIG.CANVAS_WIDTH - mw) / 2;
    const my = (CONFIG.CANVAS_HEIGHT - mh) / 2;

    ctx.fillStyle = '#fbf9f4';
    ctx.strokeStyle = CONFIG.COLORS.STICKMAN;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(mx, my, mw, mh, 12);
    ctx.fill();
    ctx.stroke();

    // Judul
    ctx.fillStyle = CONFIG.COLORS.TEXT_DARK;
    ctx.font = '900 24px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GAME DIJEDA', CONFIG.CANVAS_WIDTH / 2, my + 34);

    // KONTROL VOLUME (TOMBOL MINUS, SLIDER TRACK, TOMBOL PLUS)
    const effectiveVol = isMuted ? 0 : volumePercent;
    ctx.font = 'bold 13px Outfit, sans-serif';
    ctx.fillStyle = '#495057';
    ctx.fillText(`🔊 Volume Suara: ${isMuted || effectiveVol === 0 ? 'Bisu (0%)' : effectiveVol + '%'}`, CONFIG.CANVAS_WIDTH / 2, my + 60);

    // Tombol Minus [-]
    const minusX = mx + 30;
    const minusY = my + 70;
    const minusW = 38;
    const minusH = 30;

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = CONFIG.COLORS.STICKMAN;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(minusX, minusY, minusW, minusH, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = CONFIG.COLORS.TEXT_DARK;
    ctx.font = '900 18px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('➖', minusX + minusW / 2, minusY + minusH / 2);

    // Slider Bar
    const trackX = mx + 76;
    const trackY = my + 73;
    const trackW = mw - 152;
    const trackH = 24;

    ctx.fillStyle = '#e9ecef';
    ctx.strokeStyle = '#ced4da';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(trackX, trackY, trackW, trackH, 12);
    ctx.fill();
    ctx.stroke();

    // Fill Bar
    const fillW = Math.max(0, Math.min(trackW, (trackW * effectiveVol) / 100));
    if (fillW > 0) {
      ctx.fillStyle = '#2563eb';
      ctx.beginPath();
      ctx.roundRect(trackX, trackY, fillW, trackH, 12);
      ctx.fill();
    }

    // Slider Knob
    const knobX = trackX + fillW;
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = CONFIG.COLORS.STICKMAN;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(knobX, trackY + trackH / 2, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Tombol Plus [+]
    const plusX = mx + mw - 68;
    const plusY = my + 70;
    const plusW = 38;
    const plusH = 30;

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = CONFIG.COLORS.STICKMAN;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(plusX, plusY, plusW, plusH, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = CONFIG.COLORS.TEXT_DARK;
    ctx.font = '900 18px Outfit, sans-serif';
    ctx.fillText('➕', plusX + plusW / 2, plusY + plusH / 2);

    // PENGATURAN DIALOG KARAKTER (ON/OFF & FREKUENSI)
    const diagEnabled = Storage.getDialogueEnabled();
    const diagFreq = Storage.getDialogueFrequency();
    const diagBtnY = my + 114;

    // Tombol 1: Toggle Dialog On/Off
    const diagToggleX = mx + 30;
    const diagToggleW = 155;
    const diagToggleH = 32;

    ctx.fillStyle = diagEnabled ? '#e8f5e9' : '#ffebee';
    ctx.strokeStyle = diagEnabled ? '#2e7d32' : '#c62828';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.roundRect(diagToggleX, diagBtnY, diagToggleW, diagToggleH, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = diagEnabled ? '#1b5e20' : '#b71c1c';
    ctx.font = 'bold 12px Outfit, sans-serif';
    ctx.fillText(diagEnabled ? '💬 Dialog: Aktif' : '💬 Dialog: Mati', diagToggleX + diagToggleW / 2, diagBtnY + diagToggleH / 2 + 1);

    // Tombol 2: Frekuensi Dialog
    const freqBtnX = mx + 195;
    const freqBtnW = 155;
    const freqBtnH = 32;

    ctx.fillStyle = '#f8f9fa';
    ctx.strokeStyle = CONFIG.COLORS.STICKMAN;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.roundRect(freqBtnX, diagBtnY, freqBtnW, freqBtnH, 6);
    ctx.fill();
    ctx.stroke();

    let freqLabel = 'Frekuensi: Normal';
    if (diagFreq === 'rare') freqLabel = 'Frekuensi: Jarang';
    if (diagFreq === 'often') freqLabel = 'Frekuensi: Sering';

    ctx.fillStyle = CONFIG.COLORS.TEXT_DARK;
    ctx.font = 'bold 12px Outfit, sans-serif';
    ctx.fillText(freqLabel, freqBtnX + freqBtnW / 2, diagBtnY + freqBtnH / 2 + 1);

    // Tombol-Tombol Aksi
    const pauseButtons = [
      { y: my + 162, label: '▶ Lanjutkan Permainan', id: 'resume' },
      { y: my + 210, label: '↻ Ulangi Level (R)', id: 'restart_modal' },
      { y: my + 258, label: '📜 Pilih Level / Menu', id: 'menu' }
    ];

    for (const b of pauseButtons) {
      const bx = mx + 40;
      const bw = mw - 80;
      const bh = 36;
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
      if (this.currentLevelId >= 10) {
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
      const mw = 380;
      const mh = 360;
      const mx = (CONFIG.CANVAS_WIDTH - mw) / 2;
      const my = (CONFIG.CANVAS_HEIGHT - mh) / 2;

      // Cek tombol minus [-]
      const minusX = mx + 30;
      const minusY = my + 70;
      if (px >= minusX && px <= minusX + 38 && py >= minusY && py <= minusY + 30) {
        return 'volume_down';
      }

      // Cek tombol plus [+]
      const plusX = mx + mw - 68;
      const plusY = my + 70;
      if (px >= plusX && px <= plusX + 38 && py >= plusY && py <= plusY + 30) {
        return 'volume_up';
      }

      // Cek track slider volume
      const trackX = mx + 76;
      const trackY = my + 70;
      const trackW = mw - 152;
      if (px >= trackX && px <= trackX + trackW && py >= trackY && py <= trackY + 30) {
        const ratio = Math.max(0, Math.min(1, (px - trackX) / trackW));
        return `volume_set:${ratio.toFixed(2)}`;
      }

      // Cek tombol dialog toggle
      const diagToggleX = mx + 30;
      const diagBtnY = my + 114;
      if (px >= diagToggleX && px <= diagToggleX + 155 && py >= diagBtnY && py <= diagBtnY + 32) {
        return 'toggle_dialogue';
      }

      // Cek tombol frekuensi dialog
      const freqBtnX = mx + 195;
      if (px >= freqBtnX && px <= freqBtnX + 155 && py >= diagBtnY && py <= diagBtnY + 32) {
        return 'cycle_dialogue_freq';
      }

      const bx = mx + 40;
      const bw = mw - 80;

      if (px >= bx && px <= bx + bw) {
        if (py >= my + 162 && py <= my + 162 + 36) return 'resume';
        if (py >= my + 210 && py <= my + 210 + 36) return 'restart';
        if (py >= my + 258 && py <= my + 258 + 36) return 'menu';
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
