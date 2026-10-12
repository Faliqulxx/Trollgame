// Layar Menu Utama (PRD Bagian 8.1)

import { CONFIG } from '../config';
import { Storage } from '../core/Storage';
import { AudioManager } from '../core/Audio';

export class MenuScene {
  private animTimer = 0;
  private audio: AudioManager;

  public buttons = [
    { id: 'play', x: 0, y: 0, w: 260, h: 50, label: '▶ MAIN' },
    { id: 'select', x: 0, y: 0, w: 260, h: 46, label: '📜 PILIH LEVEL' },
    { id: 'audio', x: 0, y: 0, w: 260, h: 46, label: '🔊 SUARA: AKTIF' },
    { id: 'reset', x: 0, y: 0, w: 260, h: 42, label: '↺ RESET PROGRES' }
  ];

  constructor(audio: AudioManager) {
    this.audio = audio;
    this.layoutButtons();
  }

  private layoutButtons(): void {
    const startY = 270;
    const spacing = 58;
    const cx = (CONFIG.CANVAS_WIDTH - 260) / 2;

    this.buttons[0].x = cx;
    this.buttons[0].y = startY;

    this.buttons[1].x = cx;
    this.buttons[1].y = startY + spacing;

    this.buttons[2].x = cx;
    this.buttons[2].y = startY + spacing * 2;

    this.buttons[3].x = cx;
    this.buttons[3].y = startY + spacing * 3;
  }

  public update(dt: number): void {
    this.animTimer += dt;
    this.buttons[2].label = this.audio.getMuted() ? '🔇 SUARA: MATI' : '🔊 SUARA: AKTIF';
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
    ctx.font = '900 48px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('STICKMAN: THE TRAP DOOR', CONFIG.CANVAS_WIDTH / 2, 85);

    // Subtitle sketsa
    ctx.fillStyle = CONFIG.COLORS.HAZARD_RED;
    ctx.font = 'bold 20px "Architects Daughter", Outfit, sans-serif';
    ctx.fillText('Jangan Percaya Pada Siapapun. Termasuk Pintunya.', CONFIG.CANVAS_WIDTH / 2, 130);

    // 3. Ilustrasi Stickman di Atas Jebakan Pintu Lipat (Trap Door)
    this.renderTrapDoorIllustration(ctx);

    // 4. Tombol Menu
    for (let i = 0; i < this.buttons.length; i++) {
      const btn = this.buttons[i];
      const isPlay = btn.id === 'play';

      ctx.fillStyle = isPlay ? CONFIG.COLORS.EXIT_GREEN : '#ffffff';
      ctx.strokeStyle = CONFIG.COLORS.STICKMAN;
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      ctx.roundRect(btn.x, btn.y, btn.w, btn.h, 10);
      ctx.fill();
      ctx.stroke();

      // Shadow sketsa doodle
      ctx.fillStyle = isPlay ? '#ffffff' : CONFIG.COLORS.TEXT_DARK;
      ctx.font = isPlay ? 'bold 20px Outfit, sans-serif' : 'bold 16px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(btn.label, btn.x + btn.w / 2, btn.y + btn.h / 2 + 1);
    }

    // 5. Total Kematian di Pojok Bawah
    const totalDeaths = Storage.getTotalDeaths();
    ctx.fillStyle = CONFIG.COLORS.TEXT_DARK;
    ctx.font = 'bold 15px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`☠ Total Kematian Sepanjang Masa: ${totalDeaths}`, CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT - 18);

    ctx.restore();
  }

  private renderTrapDoorIllustration(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    const cx = CONFIG.CANVAS_WIDTH / 2;
    const cy = 205;

    // Lubang Jebakan (Trap Door)
    const doorW = 90;
    const doorH = 10;
    ctx.fillStyle = '#111';
    ctx.fillRect(cx - doorW / 2, cy, doorW, doorH);

    // Pintu perangkap yang sedikit terbuka berayun
    const swing = Math.sin(this.animTimer * 3) * 0.35;
    ctx.strokeStyle = '#5a5248';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - doorW / 2, cy);
    ctx.lineTo(cx - doorW / 2 + Math.cos(swing) * (doorW / 2), cy + Math.sin(swing) * 20);
    ctx.stroke();

    // Stickman yang panik jatuh ke dalam lubang
    ctx.strokeStyle = CONFIG.COLORS.STICKMAN;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';

    const stickY = cy - 20 + Math.sin(this.animTimer * 3) * 4;
    // Kepala
    ctx.beginPath();
    ctx.arc(cx, stickY - 14, 7, 0, Math.PI * 2);
    ctx.stroke();
    // Mata panik
    ctx.fillStyle = '#000';
    ctx.fillRect(cx - 2, stickY - 16, 2, 2);
    ctx.fillRect(cx + 2, stickY - 16, 2, 2);

    // Torso
    ctx.beginPath();
    ctx.moveTo(cx, stickY - 7);
    ctx.lineTo(cx, stickY + 8);
    // Tangan melambai ke atas panik
    ctx.moveTo(cx, stickY - 3);
    ctx.lineTo(cx - 12, stickY - 14);
    ctx.moveTo(cx, stickY - 3);
    ctx.lineTo(cx + 12, stickY - 14);
    // Kaki menggelepar
    ctx.moveTo(cx, stickY + 8);
    ctx.lineTo(cx - 8, stickY + 18);
    ctx.moveTo(cx, stickY + 8);
    ctx.lineTo(cx + 8, stickY + 18);
    ctx.stroke();

    ctx.restore();
  }

  public handleClick(px: number, py: number): string | null {
    for (const btn of this.buttons) {
      if (px >= btn.x && px <= btn.x + btn.w && py >= btn.y && py <= btn.y + btn.h) {
        return btn.id;
      }
    }
    return null;
  }
}
