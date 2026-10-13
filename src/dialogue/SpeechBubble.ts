// Komponen Balon Percakapan Kartun (Speech Bubble Component)
// Menampilkan balon percakapan sketsa kartun dengan ekor mengarah ke kepala stickman,
// efek typing teks, animasi pop-up bounce, melayang halus, dan fade-out.

import { CONFIG } from '../config';

export class SpeechBubble {
  public text: string = '';
  public fullText: string = '';
  public isActive = false;

  // Durasi & Waktu
  private duration = 3.0; // detik
  private timer = 0;
  private enterTime = 0.18; // durasi animasi pop-in
  private exitTime = 0.25;  // durasi animasi fade-out

  // Efek Mengetik
  private typingSpeed = 42; // karakter per detik
  private typedChars = 0;

  // Ukuran & Layout Balon
  private bubbleW = 140;
  private bubbleH = 50;
  private readonly paddingX = 14;
  private readonly paddingY = 10;
  private readonly maxTextWidth = 210;

  // Posisi target (kepala stickman di koordinat layar)
  private targetScreenX = 0;
  private targetScreenY = 0;

  public show(text: string, duration?: number): void {
    this.fullText = text.trim();
    this.text = '';
    this.typedChars = 0;
    this.isActive = true;

    // Hitung durasi dinamis jika tidak ditentukan: 2.2s - 4.0s berdasarkan panjang kalimat
    if (duration !== undefined) {
      this.duration = duration;
    } else {
      this.duration = Math.max(2.4, Math.min(4.2, 1.8 + this.fullText.length * 0.05));
    }
    this.timer = 0;
  }

  public hide(): void {
    this.isActive = false;
    this.text = '';
    this.timer = 0;
  }

  public update(dt: number, screenX: number, screenY: number): void {
    if (!this.isActive) return;

    this.targetScreenX = screenX;
    this.targetScreenY = screenY;
    this.timer += dt;

    // 1. Update efek mengetik cepat
    if (this.typedChars < this.fullText.length) {
      this.typedChars += this.typingSpeed * dt;
      const curLength = Math.min(this.fullText.length, Math.floor(this.typedChars));
      this.text = this.fullText.slice(0, curLength);
    } else {
      this.text = this.fullText;
    }

    // 2. Cek selesai durasi
    if (this.timer >= this.duration) {
      this.hide();
    }
  }

  /**
   * Memecah kalimat menjadi beberapa baris yang pas di dalam lebar maksimum balon
   */
  private wrapText(ctx: CanvasRenderingContext2D, text: string): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const w of words) {
      const testLine = currentLine ? `${currentLine} ${w}` : w;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > this.maxTextWidth && currentLine) {
        lines.push(currentLine);
        currentLine = w;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
    return lines;
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (!this.isActive || !this.fullText) return;

    ctx.save();

    // Setup Font untuk pengukuran
    ctx.font = 'bold 13px Outfit, -apple-system, sans-serif';
    ctx.textBaseline = 'top';

    // Hitung layout berdasarkan teks penuh (agar ukuran balon stabil saat mengetik)
    const fullLines = this.wrapText(ctx, this.fullText);
    const lineHeight = 18;
    let maxLineWidth = 0;
    for (const line of fullLines) {
      const w = ctx.measureText(line).width;
      if (w > maxLineWidth) maxLineWidth = w;
    }

    this.bubbleW = Math.max(70, maxLineWidth + this.paddingX * 2);
    this.bubbleH = Math.max(38, fullLines.length * lineHeight + this.paddingY * 2);

    // Animasi Scale & Fade
    let scale = 1.0;
    let alpha = 1.0;

    // Pop-in bounce
    if (this.timer < this.enterTime) {
      const p = this.timer / this.enterTime;
      // Overshoot curve
      scale = 0.1 + (1 - Math.pow(1 - p, 2)) * 0.95;
      if (p > 0.7) scale = 1.05 - (p - 0.7) * 0.16; // bounce back
    }
    // Fade-out saat mendekati akhir durasi
    const timeLeft = this.duration - this.timer;
    if (timeLeft < this.exitTime) {
      alpha = Math.max(0, timeLeft / this.exitTime);
      scale = 0.9 + 0.1 * alpha;
    }

    // Floating/Breathing halus (melayang naik turun lembut)
    const floatY = Math.sin(this.timer * 4.2) * 2.5;

    // Posisi ideal: tepat di atas kepala karakter
    const tailTipX = this.targetScreenX;
    const tailTipY = this.targetScreenY - 6;

    // Pusat balon berada di atas kepala
    let bubbleX = tailTipX - this.bubbleW / 2;
    let bubbleY = tailTipY - this.bubbleH - 14 + floatY;

    // CLAMP TO VIEWPORT: Jangan biarkan balon terpotong batas layar!
    const margin = 12;
    if (bubbleX < margin) bubbleX = margin;
    if (bubbleX + this.bubbleW > CONFIG.CANVAS_WIDTH - margin) {
      bubbleX = CONFIG.CANVAS_WIDTH - margin - this.bubbleW;
    }
    if (bubbleY < 48) {
      // Jika di atas mentok HUD/atap, posisikan sedikit di bawah atau geser
      bubbleY = Math.max(48, bubbleY);
    }

    // Titik pusat balon untuk animasi scaling
    const centerX = bubbleX + this.bubbleW / 2;
    const centerY = bubbleY + this.bubbleH / 2;

    ctx.globalAlpha = alpha;
    ctx.translate(centerX, centerY);
    ctx.scale(scale, scale);
    ctx.translate(-centerX, -centerY);

    // Gambar Bayangan Lembut Kartun
    ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 3;

    // 1. Gambar Bentuk Balon & Ekor
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = CONFIG.COLORS.STICKMAN;
    ctx.lineWidth = 2.2;
    ctx.lineJoin = 'round';

    const radius = 14;
    const rLeft = bubbleX;
    const rTop = bubbleY;
    const rRight = bubbleX + this.bubbleW;
    const rBottom = bubbleY + this.bubbleH;

    // Basis ekor (tail) di bagian bawah balon
    const tailBaseCenterX = Math.max(rLeft + 20, Math.min(rRight - 20, tailTipX));
    const tailHalfW = 7;

    ctx.beginPath();
    // Top-left corner
    ctx.moveTo(rLeft + radius, rTop);
    ctx.lineTo(rRight - radius, rTop);
    ctx.quadraticCurveTo(rRight, rTop, rRight, rTop + radius);

    // Right edge
    ctx.lineTo(rRight, rBottom - radius);
    ctx.quadraticCurveTo(rRight, rBottom, rRight - radius, rBottom);

    // Bottom edge dengan celah ekor
    ctx.lineTo(tailBaseCenterX + tailHalfW, rBottom);
    // Ekor menuju kepala karakter
    ctx.lineTo(tailTipX, tailTipY);
    ctx.lineTo(tailBaseCenterX - tailHalfW, rBottom);

    // Left bottom corner
    ctx.lineTo(rLeft + radius, rBottom);
    ctx.quadraticCurveTo(rLeft, rBottom, rLeft, rBottom - radius);

    // Left edge
    ctx.lineTo(rLeft, rTop + radius);
    ctx.quadraticCurveTo(rLeft, rTop, rLeft + radius, rTop);
    ctx.closePath();

    ctx.fill();
    ctx.shadowColor = 'transparent'; // matikan shadow sebelum stroke agar bersih
    ctx.stroke();

    // 2. Render Teks dengan Efek Mengetik
    ctx.fillStyle = '#18181c';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    const currentLines = this.wrapText(ctx, this.text);
    for (let i = 0; i < currentLines.length; i++) {
      const lineY = rTop + this.paddingY + i * lineHeight;
      ctx.fillText(currentLines[i], rLeft + this.paddingX, lineY);
    }

    ctx.restore();
  }
}
