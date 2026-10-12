// Layar Kemenangan / Ending Game (PRD Bagian 8.1 & 7.2)

import { CONFIG } from '../config';
import { Storage } from '../core/Storage';
import { ParticleSystem } from '../core/Particles';

export class EndScene {
  private particles: ParticleSystem;
  private animTimer = 0;
  public replayButton = {
    x: (CONFIG.CANVAS_WIDTH - 240) / 2,
    y: 430,
    w: 240,
    h: 52,
    label: '↺ MAIN LAGI DARI AWAL'
  };

  constructor(particles: ParticleSystem) {
    this.particles = particles;
    this.particles.emitConfetti(CONFIG.CANVAS_WIDTH / 2, 180);
  }

  public update(dt: number): void {
    this.animTimer += dt;
    if (Math.random() < 0.08) {
      this.particles.emitConfetti(
        CONFIG.CANVAS_WIDTH * (0.2 + Math.random() * 0.6),
        CONFIG.CANVAS_HEIGHT * (0.1 + Math.random() * 0.3)
      );
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // 1. Latar Belakang Kertas
    ctx.fillStyle = CONFIG.COLORS.BG_PAPER;
    ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

    // 2. Judul Kemenangan Besar
    ctx.fillStyle = CONFIG.COLORS.EXIT_GREEN;
    ctx.font = '900 44px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('KAMU BERHASIL SELAMAT!', CONFIG.CANVAS_WIDTH / 2, 85);

    // 3. Pesan Sarkastik Khas Troll Platformer (PRD 8.1)
    ctx.fillStyle = CONFIG.COLORS.TEXT_DARK;
    ctx.font = 'bold 20px "Architects Daughter", Outfit, sans-serif';
    ctx.fillText('Setelah dikhianati lantai, duri, pintu, dan bahkan bendera...', CONFIG.CANVAS_WIDTH / 2, 130);
    ctx.fillText('Kamu resmi menjadi Manusia Berkepala Dingin Teruji.', CONFIG.CANVAS_WIDTH / 2, 160);

    // 4. Gambar Piala / Trofi Doodle Emas
    const cx = CONFIG.CANVAS_WIDTH / 2;
    const cy = 250;
    ctx.fillStyle = '#ffb703';
    ctx.strokeStyle = CONFIG.COLORS.STICKMAN;
    ctx.lineWidth = 3;

    // Cangkir piala
    ctx.beginPath();
    ctx.arc(cx, cy, 32, 0, Math.PI);
    ctx.lineTo(cx - 32, cy - 20);
    ctx.lineTo(cx + 32, cy - 20);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Gagang piala
    ctx.beginPath();
    ctx.arc(cx - 36, cy - 8, 12, Math.PI * 0.5, Math.PI * 1.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + 36, cy - 8, 12, -Math.PI * 0.5, Math.PI * 0.5);
    ctx.stroke();

    // Kaki & dasar piala
    ctx.fillRect(cx - 8, cy + 32, 16, 20);
    ctx.strokeRect(cx - 8, cy + 32, 16, 20);
    ctx.fillRect(cx - 30, cy + 52, 60, 14);
    ctx.strokeRect(cx - 30, cy + 52, 60, 14);

    // 5. Total Statistik
    const totalDeaths = Storage.getTotalDeaths();
    ctx.fillStyle = CONFIG.COLORS.HAZARD_RED;
    ctx.font = '900 22px Outfit, sans-serif';
    ctx.fillText(`Total Kematian Terhormat: ${totalDeaths} Kali ☠`, CONFIG.CANVAS_WIDTH / 2, 380);

    // 6. Tombol Main Lagi
    const btn = this.replayButton;
    ctx.fillStyle = CONFIG.COLORS.EXIT_GREEN;
    ctx.strokeStyle = CONFIG.COLORS.STICKMAN;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(btn.x, btn.y, btn.w, btn.h, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px Outfit, sans-serif';
    ctx.fillText(btn.label, btn.x + btn.w / 2, btn.y + btn.h / 2 + 1);

    ctx.restore();
  }

  public handleClick(px: number, py: number): boolean {
    const btn = this.replayButton;
    return (
      px >= btn.x &&
      px <= btn.x + btn.w &&
      py >= btn.y &&
      py <= btn.y + btn.h
    );
  }
}
