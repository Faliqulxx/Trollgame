// Interface & Base Class untuk Seluruh Jebakan (PRD Bagian 5 & 10.1)

import { Rect } from '../../physics/Collision';
import { Player } from '../Player';

export interface Trap {
  readonly id: string;
  readonly type: string;

  /**
   * Pembaruan logika jebakan tiap fixed update
   */
  update(dt: number, player: Player): void;

  /**
   * Gambar visual jebakan ke canvas
   */
  render(ctx: CanvasRenderingContext2D): void;

  /**
   * Reset jebakan ke kondisi awal saat pemain respawn
   */
  reset(): void;

  /**
   * Ambil hitbox mematikan (hazard)
   */
  getHitboxes(): Rect[];

  /**
   * Apakah jebakan sedang mematikan saat ini
   */
  isDeadly(): boolean;

  /**
   * Ambil hitbox solid untuk pijakan (misal crumble tile atau balok bergerak)
   */
  getSolidBox?(): Rect | null;

  /**
   * Reaksi opsional saat pemicu tersentuh
   */
  onPlayerEnterTrigger?(player: Player): void;
}
