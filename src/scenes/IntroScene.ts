// Layar Intro Peringatan Game: "Siap Menderita"

import { CONFIG } from '../config';
import { AudioManager } from '../core/Audio';

export class IntroScene {
  private img: HTMLImageElement;
  private isLoaded = false;
  private audio: AudioManager;
  private alpha = 0;
  private timer = 0;

  // Tombol troll "KELUAR SEBELUM TERLAMBAT"
  private escapeX = 518;
  private escapeY = 404;
  private escapeTargetX = 518;
  private escapeTargetY = 404;
  private trollDodges = 0;
  private showTrollMessage = false;
  private trollMessageTimer = 0;

  constructor(audio: AudioManager) {
    this.audio = audio;
    this.img = new Image();
    this.img.src = encodeURI('/Peringatan Game_ Siap Menderita!.png');
    this.img.onload = () => {
      this.isLoaded = true;
    };
    this.img.onerror = () => {
      this.img.src = '/intro.png';
    };
  }

  public update(dt: number, pointerX: number, pointerY: number): void {
    this.timer += dt;
    if (this.alpha < 1) {
      this.alpha = Math.min(1, this.alpha + dt * 3.0);
    }

    if (this.trollMessageTimer > 0) {
      this.trollMessageTimer -= dt;
      if (this.trollMessageTimer <= 0) {
        this.showTrollMessage = false;
      }
    }

    // Efek troll: tombol "KELUAR SEBELUM TERLAMBAT" kabur saat kursor mendekat (< 75px)
    const escapeCenterX = this.escapeX + 98;
    const escapeCenterY = this.escapeY + 32;
    const dist = Math.hypot(pointerX - escapeCenterX, pointerY - escapeCenterY);

    if (dist < 75) {
      const angles = [Math.PI * 0.25, Math.PI * 0.75, -Math.PI * 0.25, -Math.PI * 0.75, 0, Math.PI];
      const randomAngle = angles[Math.floor(Math.random() * angles.length)];
      const jumpDist = 90 + Math.random() * 60;

      let nextX = this.escapeX + Math.cos(randomAngle) * jumpDist;
      let nextY = this.escapeY + Math.sin(randomAngle) * jumpDist;

      nextX = Math.max(480, Math.min(CONFIG.CANVAS_WIDTH - 210, nextX));
      nextY = Math.max(340, Math.min(CONFIG.CANVAS_HEIGHT - 80, nextY));

      this.escapeTargetX = nextX;
      this.escapeTargetY = nextY;
      this.trollDodges++;
      this.showTrollMessage = true;
      this.trollMessageTimer = 1.3;
      this.audio.playStinger();
    }

    // Lerp animasi gerak tombol kabur
    this.escapeX += (this.escapeTargetX - this.escapeX) * Math.min(1, dt * 16);
    this.escapeY += (this.escapeTargetY - this.escapeY) * Math.min(1, dt * 16);
  }

  public render(ctx: CanvasRenderingContext2D, pointerX: number, pointerY: number): void {
    ctx.save();
    ctx.globalAlpha = this.alpha;

    if (this.isLoaded) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(this.img, 0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
    } else {
      ctx.fillStyle = CONFIG.COLORS.BG_PAPER;
      ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
      ctx.fillStyle = CONFIG.COLORS.TEXT_DARK;
      ctx.font = 'bold 24px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('MEMUAT PERINGATAN...', CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2);
    }

    // Highlight denyut halus di sekitar tombol "SAYA SIAP MENDERITA"
    const btnReadyX = 254;
    const btnReadyY = 390;
    const btnReadyW = 236;
    const btnReadyH = 80;

    const isHoverReady = this.isHoveringReadyButton(pointerX, pointerY);
    const pulse = (Math.sin(this.timer * 4.5) + 1) * 0.5;

    ctx.save();
    ctx.strokeStyle = isHoverReady ? 'rgba(42, 157, 143, 0.95)' : `rgba(255, 255, 255, ${0.35 + pulse * 0.5})`;
    ctx.lineWidth = isHoverReady ? 3.5 : 2;
    ctx.beginPath();
    ctx.roundRect(btnReadyX - 2, btnReadyY - 2, btnReadyW + 4, btnReadyH + 4, 20);
    ctx.stroke();
    ctx.restore();

    // Jika tombol kabur sudah berpindah posisi, tutupi posisi awal dan gambar tombol di posisi baru
    if (this.trollDodges > 0) {
      // Tutup posisi asal
      ctx.fillStyle = '#f6f3eb';
      ctx.beginPath();
      ctx.roundRect(518, 404, 196, 64, 16);
      ctx.fill();

      // Gambar tombol yang kabur di koordinat baru
      ctx.save();
      ctx.fillStyle = '#dcd8ce';
      ctx.strokeStyle = '#888';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(this.escapeX, this.escapeY, 196, 64, 16);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#333';
      ctx.font = 'bold 12px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('KELUAR SEBELUM', this.escapeX + 98, this.escapeY + 26);
      ctx.fillText('TERLAMBAT', this.escapeX + 98, this.escapeY + 44);
      ctx.restore();
    }

    // Balon teks troll saat tombol kabur berusaha disentuh
    if (this.showTrollMessage) {
      ctx.save();
      ctx.fillStyle = 'rgba(230, 57, 70, 0.95)';
      ctx.strokeStyle = '#18181c';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(this.escapeX + 23, this.escapeY - 32, 150, 26, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Eits, gak bisa kabur! 😜', this.escapeX + 98, this.escapeY - 18);
      ctx.restore();
    }

    ctx.restore();
  }

  public isHoveringReadyButton(px: number, py: number): boolean {
    const btnReadyX = 254;
    const btnReadyY = 390;
    const btnReadyW = 236;
    const btnReadyH = 80;
    return px >= btnReadyX && px <= btnReadyX + btnReadyW &&
           py >= btnReadyY && py <= btnReadyY + btnReadyH;
  }

  public handleClick(px: number, py: number): 'play' | null {
    // HANYA lanjut jika menekan tepat di tombol hijau "SAYA SIAP MENDERITA"
    if (this.isHoveringReadyButton(px, py)) {
      this.audio.playCheckpoint();
      return 'play';
    }

    // Klik di area lain manapun tidak akan melanjutkan
    return null;
  }
}
