// T15: Pintu Kabur / Running Door (PRD Bagian 5)

import { CONFIG } from '../../config';
import { Rect } from '../../physics/Collision';
import { Player } from '../Player';
import { Trap } from './Trap';

export class RunningDoor implements Trap {
  public readonly id: string;
  public readonly type = 'runningDoor';
  public x: number;
  public y: number;
  public width = 32;
  public height = 48;

  private startX: number;
  private maxRunDistance: number;
  private currentDist = 0;
  private isRunning = false;
  private legAnim = 0;

  constructor(id: string, x: number, y: number, maxRunDistance = 180) {
    this.id = id;
    this.startX = x;
    this.x = x;
    this.y = y;
    this.maxRunDistance = maxRunDistance;
  }

  public reset(): void {
    this.x = this.startX;
    this.currentDist = 0;
    this.isRunning = false;
    this.legAnim = 0;
  }

  public update(dt: number, player: Player): void {
    const distToPlayer = (this.x + this.width / 2) - (player.x + player.width / 2);

    // Jika pemain mendekat dari kiri dalam jarak 110px dan masih bisa lari
    if (distToPlayer > 0 && distToPlayer < 110 && this.currentDist < this.maxRunDistance) {
      this.isRunning = true;
      const speed = 220;
      const runStep = speed * dt;
      this.x += runStep;
      this.currentDist += runStep;
      this.legAnim += dt * 18;
    } else {
      this.isRunning = false;
    }
  }

  public isDeadly(): boolean {
    return false; // Bukan mematikan, tetapi pintu keluar yang licik!
  }

  public getHitboxes(): Rect[] {
    return [];
  }

  /**
   * Pintu ini bisa dimasuki setelah mencapai batas larinya (terpojok di ujung)
   */
  public canEnter(): boolean {
    return this.currentDist >= this.maxRunDistance - 5;
  }

  public getDoorHitbox(): Rect {
    return {
      x: this.x + 4,
      y: this.y + 4,
      w: this.width - 8,
      h: this.height - 4
    };
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Kaki kecil lucu yang berlari di bawah pintu!
    if (this.isRunning) {
      ctx.strokeStyle = CONFIG.COLORS.STICKMAN;
      ctx.lineWidth = 2;
      const legSin = Math.sin(this.legAnim) * 8;
      // Kaki kiri
      ctx.beginPath();
      ctx.moveTo(8, this.height);
      ctx.lineTo(8 - legSin, this.height + 7);
      ctx.stroke();
      // Kaki kanan
      ctx.beginPath();
      ctx.moveTo(24, this.height);
      ctx.lineTo(24 + legSin, this.height + 7);
      ctx.stroke();
    }

    // Pintu
    ctx.strokeStyle = CONFIG.COLORS.STICKMAN;
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, this.width, this.height);

    ctx.fillStyle = CONFIG.COLORS.EXIT_GREEN;
    ctx.fillRect(3, 3, this.width - 6, this.height - 3);

    // Gagang
    ctx.fillStyle = '#ffea00';
    ctx.beginPath();
    ctx.arc(this.width - 8, this.height / 2 + 2, 3, 0, Math.PI * 2);
    ctx.fill();

    // Teks
    ctx.fillStyle = CONFIG.COLORS.TEXT_DARK;
    ctx.font = 'bold 8px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.isRunning ? 'KABUR!' : 'EXIT', this.width / 2, -4);

    ctx.restore();
  }
}
