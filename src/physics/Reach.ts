// Helper Validasi Jangkauan Lompatan Karakter (PRD Bagian 4.7 & 10.1)

import { CONFIG } from '../config';

export class Reach {
  /**
   * Menghitung tinggi lompatan puncak teoretis (pixel)
   */
  public static getMaxJumpHeight(): number {
    const v0 = Math.abs(CONFIG.PLAYER.JUMP_SPEED);
    const g = CONFIG.PLAYER.GRAVITY;
    return (v0 * v0) / (2 * g); // ≈ 117.8 px
  }

  /**
   * Mengecek apakah pemain dapat melompat dari platform asal ke platform tujuan.
   * @param dx Jarak horizontal antara platform (pixel, positif)
   * @param dy Selisih ketinggian (pixel: negatif jika melompat ke tempat lebih tinggi, positif jika melompat ke tempat lebih rendah)
   * @param safetyMargin Toleransi keamanan (default 0.85 sesuai aturan PRD 4.7)
   */
  public static canJump(dx: number, dy: number, safetyMargin = 0.85): boolean {
    const v0 = Math.abs(CONFIG.PLAYER.JUMP_SPEED);
    const g = CONFIG.PLAYER.GRAVITY;
    const vx = CONFIG.PLAYER.MAX_SPEED;

    // Jika platform tujuan lebih tinggi dari batas maksimum lompat
    if (dy < 0 && Math.abs(dy) > Reach.getMaxJumpHeight() * safetyMargin) {
      return false;
    }

    // Hitung total waktu di udara sampai mencapai ketinggian dy (h = -dy)
    // -dy = -v0 * t + 0.5 * g * t^2  =>  0.5 * g * t^2 - v0 * t + dy = 0
    const a = 0.5 * g;
    const b = -v0;
    const c = dy;

    const discriminant = b * b - 4 * a * c;
    if (discriminant < 0) {
      return false;
    }

    // Ambil akar terbesar (saat mendarat/jatuh)
    const t = (-b + Math.sqrt(discriminant)) / (2 * a);
    const maxHorizontalDistance = vx * t * safetyMargin;

    return Math.abs(dx) <= maxHorizontalDistance;
  }
}
