// Sistem Partikel Prosedural & Efek Kematian Ragdoll Stickman (PRD Bagian 7.2 & 8.3)

import { CONFIG } from '../config';

export interface Particle {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  gravity: number;
  friction: number;
  rotation: number;
  vRot: number;
  size: number;
  life: number;
  maxLife: number;
  color: string;
  type: 'dot' | 'line' | 'circle' | 'square';
  length?: number; // untuk segmen garis patahan tubuh stickman
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private poolSize = 300;

  constructor() {
    // Siapkan object pool untuk menghindari alokasi memori per frame (PRD 10.4)
    for (let i = 0; i < this.poolSize; i++) {
      this.particles.push({
        active: false,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        gravity: 0,
        friction: 0.98,
        rotation: 0,
        vRot: 0,
        size: 2,
        life: 0,
        maxLife: 1,
        color: '#000',
        type: 'dot'
      });
    }
  }

  private spawn(
    x: number,
    y: number,
    vx: number,
    vy: number,
    color: string,
    type: Particle['type'],
    size: number,
    maxLife: number,
    gravity = 600,
    friction = 0.96,
    length = 0,
    vRot = 0
  ): void {
    const p = this.particles.find(part => !part.active);
    if (!p) return;

    p.active = true;
    p.x = x;
    p.y = y;
    p.vx = vx;
    p.vy = vy;
    p.color = color;
    p.type = type;
    p.size = size;
    p.life = maxLife;
    p.maxLife = maxLife;
    p.gravity = gravity;
    p.friction = friction;
    p.rotation = Math.random() * Math.PI * 2;
    p.vRot = vRot;
    p.length = length;
  }

  /**
   * Efek Stickman terpecah menjadi segmen garis & percikan tinta saat mati
   */
  public emitStickmanDeath(x: number, y: number): void {
    // Kepala melompat memantul
    this.spawn(x, y - 14, (Math.random() - 0.5) * 200, -280 - Math.random() * 100, CONFIG.COLORS.STICKMAN, 'circle', 6, 1.2, 900, 0.97, 0, (Math.random() - 0.5) * 10);

    // Badan & anggota tubuh (garis-garis yang berhamburan)
    for (let i = 0; i < 5; i++) {
      this.spawn(
        x + (Math.random() - 0.5) * 8,
        y - 5 + (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 260,
        -150 - Math.random() * 180,
        CONFIG.COLORS.STICKMAN,
        'line',
        2.5,
        1.1,
        800,
        0.96,
        12 + Math.random() * 6,
        (Math.random() - 0.5) * 12
      );
    }

    // Percikan tinta / darah doodle merah & hitam
    for (let i = 0; i < 16; i++) {
      const isRed = Math.random() > 0.4;
      this.spawn(
        x,
        y,
        (Math.random() - 0.5) * 220,
        (Math.random() - 0.5) * 220,
        isRed ? CONFIG.COLORS.HAZARD_RED : CONFIG.COLORS.STICKMAN,
        'dot',
        2 + Math.random() * 3,
        0.8 + Math.random() * 0.4,
        500,
        0.94
      );
    }
  }

  /**
   * Debu lompat / mendarat
   */
  public emitDust(x: number, y: number, count = 5): void {
    for (let i = 0; i < count; i++) {
      this.spawn(
        x + (Math.random() - 0.5) * 10,
        y,
        (Math.random() - 0.5) * 90,
        -20 - Math.random() * 40,
        '#888899',
        'dot',
        2 + Math.random() * 2,
        0.35 + Math.random() * 0.2,
        100,
        0.90
      );
    }
  }

  /**
   * Serpihan runtuhan batu
   */
  public emitCrumble(x: number, y: number, w: number): void {
    for (let i = 0; i < 8; i++) {
      this.spawn(
        x + Math.random() * w,
        y + Math.random() * 10,
        (Math.random() - 0.5) * 60,
        50 + Math.random() * 120,
        '#5a5a6a',
        'square',
        3 + Math.random() * 3,
        0.6,
        800,
        0.95
      );
    }
  }

  /**
   * Konfeti saat level selesai
   */
  public emitConfetti(x: number, y: number): void {
    const colors = ['#2a9d8f', '#e76f51', '#f4a261', '#e63946', '#457b9d', '#2b2d42'];
    for (let i = 0; i < 40; i++) {
      this.spawn(
        x,
        y,
        (Math.random() - 0.5) * 350,
        -200 - Math.random() * 250,
        colors[Math.floor(Math.random() * colors.length)],
        'square',
        3 + Math.random() * 3,
        1.5 + Math.random() * 0.5,
        500,
        0.97,
        0,
        (Math.random() - 0.5) * 8
      );
    }
  }

  public update(dt: number): void {
    for (const p of this.particles) {
      if (!p.active) continue;

      p.life -= dt;
      if (p.life <= 0) {
        p.active = false;
        continue;
      }

      p.vx *= p.friction;
      p.vy = p.vy * p.friction + p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rotation += p.vRot * dt;
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    for (const p of this.particles) {
      if (!p.active) continue;

      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.strokeStyle = p.color;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);

      if (p.type === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else if (p.type === 'line') {
        ctx.lineWidth = p.size;
        ctx.beginPath();
        const halfLen = (p.length || 10) / 2;
        ctx.moveTo(-halfLen, 0);
        ctx.lineTo(halfLen, 0);
        ctx.stroke();
      } else if (p.type === 'square') {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      } else {
        // Dot
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      }

      ctx.restore();
    }
  }

  public clear(): void {
    for (const p of this.particles) {
      p.active = false;
    }
  }
}
