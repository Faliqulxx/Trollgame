import { describe, it, expect } from 'vitest';
import { Collision } from '../src/physics/Collision';

describe('Collision System', () => {
  it('harus mendeteksi tabrakan AABB yang beririsan', () => {
    const boxA = { x: 10, y: 10, w: 20, h: 20 };
    const boxB = { x: 20, y: 20, w: 20, h: 20 };
    expect(Collision.aabb(boxA, boxB)).toBe(true);
  });

  it('tidak boleh mendeteksi tabrakan jika kotak terpisah', () => {
    const boxA = { x: 0, y: 0, w: 10, h: 10 };
    const boxB = { x: 20, y: 20, w: 10, h: 10 };
    expect(Collision.aabb(boxA, boxB)).toBe(false);
  });

  it('harus mendeteksi tabrakan lingkaran dengan AABB', () => {
    const circle = { x: 15, y: 15, radius: 10 };
    const box = { x: 20, y: 20, w: 20, h: 20 };
    expect(Collision.circleRect(circle, box)).toBe(true);
  });

  it('harus mendeteksi tabrakan lingkaran terpisah dari AABB', () => {
    const circle = { x: 0, y: 0, radius: 5 };
    const box = { x: 20, y: 20, w: 20, h: 20 };
    expect(Collision.circleRect(circle, box)).toBe(false);
  });

  it('harus memeriksa titik di dalam kotak', () => {
    const box = { x: 10, y: 10, w: 30, h: 30 };
    expect(Collision.pointInRect(15, 25, box)).toBe(true);
    expect(Collision.pointInRect(5, 5, box)).toBe(false);
  });
});
