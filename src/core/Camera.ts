// Kamera 2D Halus dengan Screen Shake (PRD Bagian 8.2 & 10.1)

import { CONFIG } from '../config';

export class Camera {
  public x = 0;
  public y = 0;
  public width: number = CONFIG.CANVAS_WIDTH;
  public height: number = CONFIG.CANVAS_HEIGHT;

  // Batas level
  public minX = 0;
  public maxX: number = CONFIG.CANVAS_WIDTH;
  public minY = 0;
  public maxY: number = CONFIG.CANVAS_HEIGHT;

  // Smoothing
  public smoothness = 0.12;

  // Screen Shake
  private shakeDuration = 0;
  private shakeIntensity = 0;
  private shakeOffsetX = 0;
  private shakeOffsetY = 0;

  constructor() {
    this.x = 0;
    this.y = 0;
  }

  public setBounds(minX: number, minY: number, maxX: number, maxY: number): void {
    this.minX = minX;
    this.minY = minY;
    this.maxX = maxX;
    this.maxY = maxY;
  }

  public follow(targetX: number, targetY: number, dt: number): void {
    // Pusat kamera berada pada target
    const desiredX = targetX - this.width / 2;
    const desiredY = targetY - this.height / 2;

    // Batasi (clamp) agar kamera tidak keluar batas level
    const clampedTargetX = Math.max(this.minX, Math.min(desiredX, this.maxX - this.width));
    const clampedTargetY = Math.max(this.minY, Math.min(desiredY, this.maxY - this.height));

    // Smooth Lerp
    const lerpFactor = 1 - Math.pow(this.smoothness, dt * 60);
    this.x += (clampedTargetX - this.x) * Math.min(1, Math.max(0, lerpFactor));
    this.y += (clampedTargetY - this.y) * Math.min(1, Math.max(0, lerpFactor));

    // Update screen shake
    if (this.shakeDuration > 0) {
      this.shakeDuration -= dt;
      const progress = Math.max(0, this.shakeDuration);
      const currentIntensity = this.shakeIntensity * (progress > 0 ? progress : 0);
      this.shakeOffsetX = (Math.random() * 2 - 1) * currentIntensity;
      this.shakeOffsetY = (Math.random() * 2 - 1) * currentIntensity;
    } else {
      this.shakeOffsetX = 0;
      this.shakeOffsetY = 0;
    }
  }

  public shake(duration: number, intensity: number): void {
    this.shakeDuration = duration;
    this.shakeIntensity = intensity;
  }

  public apply(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(
      -Math.round(this.x + this.shakeOffsetX),
      -Math.round(this.y + this.shakeOffsetY)
    );
  }

  public restore(ctx: CanvasRenderingContext2D): void {
    ctx.restore();
  }

  public screenToWorld(sx: number, sy: number): { x: number; y: number } {
    return {
      x: sx + this.x + this.shakeOffsetX,
      y: sy + this.y + this.shakeOffsetY
    };
  }

  public isVisible(x: number, y: number, w: number, h: number): boolean {
    return (
      x + w >= this.x &&
      x <= this.x + this.width &&
      y + h >= this.y &&
      y <= this.y + this.height
    );
  }
}
