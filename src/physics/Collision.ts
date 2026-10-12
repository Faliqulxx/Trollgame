// Modul Tabrakan AABB & Geometri (PRD Bagian 7.1 & 10.1)

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Circle {
  x: number;
  y: number;
  radius: number;
}

export class Collision {
  /**
   * Pengecekan tabrakan AABB (Axis-Aligned Bounding Box)
   */
  static aabb(a: Rect, b: Rect): boolean {
    return (
      a.x < b.x + b.w &&
      a.x + a.w > b.x &&
      a.y < b.y + b.h &&
      a.y + a.h > b.y
    );
  }

  /**
   * Pengecekan overlap dengan toleransi / margin
   */
  static aabbWithMargin(a: Rect, b: Rect, margin: number): boolean {
    return (
      a.x < b.x + b.w - margin &&
      a.x + a.w > b.x + margin &&
      a.y < b.y + b.h - margin &&
      a.y + a.h > b.y + margin
    );
  }

  /**
   * Pengecekan tabrakan antara Lingkaran dan Kotak AABB
   */
  static circleRect(circle: Circle, rect: Rect): boolean {
    // Cari titik terdekat pada kotak ke pusat lingkaran
    const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.w));
    const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.h));

    const distanceX = circle.x - closestX;
    const distanceY = circle.y - closestY;

    const distanceSquared = distanceX * distanceX + distanceY * distanceY;
    return distanceSquared < circle.radius * circle.radius;
  }

  /**
   * Pengecekan tabrakan antara dua lingkaran
   */
  static circleCircle(c1: Circle, c2: Circle): boolean {
    const dx = c1.x - c2.x;
    const dy = c1.y - c2.y;
    const radiusSum = c1.radius + c2.radius;
    return dx * dx + dy * dy < radiusSum * radiusSum;
  }

  /**
   * Pengecekan titik di dalam kotak
   */
  static pointInRect(px: number, py: number, rect: Rect): boolean {
    return (
      px >= rect.x &&
      px <= rect.x + rect.w &&
      py >= rect.y &&
      py <= rect.y + rect.h
    );
  }
}
