import { describe, it, expect } from 'vitest';
import { Player, TileMapInterface } from '../src/entities/Player';
import { Input } from '../src/core/Input';
import { Rect } from '../src/physics/Collision';

class MockMap implements TileMapInterface {
  public solids: Rect[] = [];

  constructor(solids: Rect[] = []) {
    this.solids = solids;
  }

  isSolidTileAt(_pixelX: number, _pixelY: number): boolean {
    return false;
  }

  getSolidTilesInRect(_rect: Rect): Rect[] {
    return this.solids;
  }
}

class MockInput extends Input {
  public leftPressed = false;
  public rightPressed = false;
  public jumpPressed = false;
  public jumpJustPressed = false;

  override isLeft(): boolean { return this.leftPressed; }
  override isRight(): boolean { return this.rightPressed; }
  override isJump(): boolean { return this.jumpPressed; }
  override isJumpJustPressed(): boolean { return this.jumpJustPressed; }
}

describe('Player Physics & Movement', () => {
  it('harus terpengaruh gravitasi saat di udara', () => {
    const player = new Player(100, 100);
    const map = new MockMap();
    const input = new MockInput();

    const initialY = player.y;
    player.update(0.1, input, map);

    expect(player.vy).toBeGreaterThan(0);
    expect(player.y).toBeGreaterThan(initialY);
    expect(player.isGrounded).toBe(false);
  });

  it('harus berhenti jatuh dan mendarat saat menabrak lantai solid', () => {
    const player = new Player(100, 100);
    // Lantai solid di y = 140
    const floor: Rect = { x: 50, y: 140, w: 200, h: 32 };
    const map = new MockMap([floor]);
    const input = new MockInput();

    // Jalankan beberapa step sampai mendarat
    for (let i = 0; i < 10; i++) {
      player.update(0.016, input, map);
    }

    expect(player.isGrounded).toBe(true);
    expect(player.vy).toBe(0);
    // y player harus tepat di atas lantai (floor.y - player.height = 140 - 40 = 100)
    expect(player.y).toBe(100);
  });

  it('harus mendukung lompat ketika mendarat', () => {
    const player = new Player(100, 100);
    const floor: Rect = { x: 50, y: 140, w: 200, h: 32 };
    const map = new MockMap([floor]);
    const input = new MockInput();

    // Daratkan pemain
    player.update(0.016, input, map);
    expect(player.isGrounded).toBe(true);

    // Tekan tombol lompat
    input.jumpJustPressed = true;
    input.jumpPressed = true;
    player.update(0.016, input, map);

    expect(player.vy).toBeLessThan(0); // kecepatan vertikal negatif = ke atas
    expect(player.isGrounded).toBe(false);
  });

  it('harus mendukung coyote time setelah meninggalkan tepian lantai', () => {
    const player = new Player(100, 100);
    const floor: Rect = { x: 50, y: 140, w: 200, h: 32 };
    const map = new MockMap([floor]);
    const input = new MockInput();

    // Mendarat
    player.update(0.016, input, map);
    expect(player.isGrounded).toBe(true);

    // Lepaskan lantai (jatuh bebas dari tepi)
    map.solids = [];
    player.update(0.05, input, map); // 0.05s < 0.10s coyote time
    expect(player.isGrounded).toBe(false);
    expect(player.coyoteTimer).toBeGreaterThan(0);

    // Pemain masih bisa lompat dalam jendela coyote time!
    input.jumpJustPressed = true;
    input.jumpPressed = true;
    player.update(0.016, input, map);
    expect(player.vy).toBeLessThan(0);
  });

  it('AudioManager.playDeath harus dapat dipanggil tanpa error untuk suara kematian acak', async () => {
    const { AudioManager } = await import('../src/core/Audio');
    const audio = AudioManager.getInstance();
    expect(() => audio.playDeath()).not.toThrow();
  });
});
