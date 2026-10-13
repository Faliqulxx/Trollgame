import { CONFIG } from '../config';
import { Rect } from '../physics/Collision';
import { TileMapInterface } from '../entities/Player';
import { Door, Checkpoint } from '../entities/Door';
import { Trap } from '../entities/traps/Trap';
import { Spikes, SpikeOrientation } from '../entities/traps/Spikes';
import { HiddenSpikes } from '../entities/traps/HiddenSpikes';
import { CrumbleTile } from '../entities/traps/CrumbleTile';
import { FakeFloor } from '../entities/traps/FakeFloor';
import { Saw } from '../entities/traps/Saw';
import { SlidingSaw } from '../entities/traps/SlidingSaw';
import { Thwomp } from '../entities/traps/Thwomp';
import { ClosingWall } from '../entities/traps/ClosingWall';
import { MovingPlatform } from '../entities/traps/MovingPlatform';
import { Shooter } from '../entities/traps/Shooter';
import { Laser } from '../entities/traps/Laser';
import { FakeButton } from '../entities/traps/FakeButton';
import { FakeCheckpoint } from '../entities/traps/FakeCheckpoint';
import { FakeDoor } from '../entities/traps/FakeDoor';
import { RunningDoor } from '../entities/traps/RunningDoor';
import { GravityZone } from '../entities/traps/GravityZone';
import { InvertControlZone } from '../entities/traps/InvertControlZone';
import { InvisibleBlock } from '../entities/traps/InvisibleBlock';
import { VanishingFloor } from '../entities/traps/VanishingFloor';
import { LauncherFloor } from '../entities/traps/LauncherFloor';
import { ExplodingFloor } from '../entities/traps/ExplodingFloor';
import { SpikeTransformFloor } from '../entities/traps/SpikeTransformFloor';
import { Trapdoor } from '../entities/traps/Trapdoor';
import { FallingCeiling } from '../entities/traps/FallingCeiling';
import { FakeSpring } from '../entities/traps/FakeSpring';
import { ChainBomb } from '../entities/traps/ChainBomb';
import { FallingPillar } from '../entities/traps/FallingPillar';
import { Camera } from '../core/Camera';
import { AudioManager } from '../core/Audio';
import { ParticleSystem } from '../core/Particles';

export interface LevelData {
  id: number;
  name: string;
  tileSize?: number;
  grid: string[];
  entities?: any[];
  checkpoints?: { x: number; y: number }[];
  signs?: { x: number; y: number; text: string }[];
  deathMessages?: string[];
  doorTeleport?: { x: number; y: number };
}

export class Level implements TileMapInterface {
  public id: number;
  public name: string;
  public tileSize: number;
  public grid: string[];
  public widthInTiles: number;
  public heightInTiles: number;
  public pixelWidth: number;
  public pixelHeight: number;

  public spawnX = 64;
  public spawnY = 64;
  public door: Door | null = null;
  public runningDoor: RunningDoor | null = null;
  public checkpoints: Checkpoint[] = [];
  public traps: Trap[] = [];
  public deathMessages: string[] = [];

  // Tile statis
  private staticSolids: Rect[] = [];

  constructor(data: LevelData, camera?: Camera, audio?: AudioManager, particles?: ParticleSystem) {
    this.id = data.id;
    this.name = data.name;
    this.tileSize = data.tileSize || CONFIG.TILE_SIZE;
    this.grid = [...data.grid];
    this.heightInTiles = data.grid.length;
    this.widthInTiles = data.grid[0]?.length || 0;
    this.pixelWidth = this.widthInTiles * this.tileSize;
    this.pixelHeight = this.heightInTiles * this.tileSize;
    this.deathMessages = data.deathMessages || [
      'Itu tadi jebakan.',
      'Coba lagi, jangan putus asa!',
      'Kurang hati-hati nih.',
      'Pintunya menertawakanmu.'
    ];

    this.parseGrid(camera, audio, particles, data);
  }

  private parseGrid(
    camera?: Camera,
    audio?: AudioManager,
    particles?: ParticleSystem,
    data?: LevelData
  ): void {
    const ts = this.tileSize;

    // 0. Bersihkan solid '#' dari grid pada tile yang ditempati oleh jebakan/hazard
    const floorReplacingTypes = new Set([
      'spikes',
      'fakeFloor',
      'vanishingFloor',
      'crumble',
      'trapdoor',
      'chainBomb',
      'explodingFloor',
      'spikeTransformFloor',
      'launcherFloor'
    ]);

    if (data?.entities) {
      for (const ent of data.entities) {
        if (floorReplacingTypes.has(ent.type)) {
          const startC = Math.floor(ent.x);
          const count = ent.w || ent.count || 1;
          const endC = startC + count;
          const r = Math.floor(ent.y);

          if (r >= 0 && r < this.heightInTiles) {
            const rowChars = this.grid[r].split('');
            for (let c = startC; c < endC; c++) {
              if (c >= 0 && c < this.widthInTiles) {
                rowChars[c] = '.';
              }
            }
            this.grid[r] = rowChars.join('');
          }
        }
      }
    }

    // 1. Baca Tile Grid
    for (let r = 0; r < this.heightInTiles; r++) {
      const row = this.grid[r];
      for (let c = 0; c < this.widthInTiles; c++) {
        const char = row[c];
        const px = c * ts;
        const py = r * ts;

        if (char === '#') {
          this.staticSolids.push({ x: px, y: py, w: ts, h: ts });
        } else if (char === 'P') {
          this.spawnX = px + (ts - CONFIG.PLAYER.WIDTH) / 2;
          this.spawnY = py + (ts - CONFIG.PLAYER.HEIGHT);
        } else if (char === 'D') {
          const tp = data?.doorTeleport
            ? { x: data.doorTeleport.x * ts, y: data.doorTeleport.y * ts + ts - 48 }
            : undefined;
          this.door = new Door(px, py + ts - 48, tp, audio, particles, camera);
        }
      }
    }

    // 2. Baca Checkpoints
    if (data?.checkpoints) {
      for (const cp of data.checkpoints) {
        this.checkpoints.push(new Checkpoint(cp.x * ts, cp.y * ts + ts - 40));
      }
    }

    // 3. Troll Signs dihilangkan sesuai permintaan user

    // 4. Baca Entities / Traps
    if (data?.entities) {
      for (let i = 0; i < data.entities.length; i++) {
        const ent = data.entities[i];
        const id = `trap_${i}_${ent.type}`;
        const ex = ent.x * ts;
        const ey = ent.y * ts;

        switch (ent.type) {
          case 'spikes': {
            const count = ent.w || 1;
            const ori: SpikeOrientation = ent.orientation || 'up';
            this.traps.push(new Spikes(id, ex, ey, count, ori, ts));
            break;
          }
          case 'hiddenSpikes': {
            const count = ent.w || 1;
            const tr = ent.trigger || { x: ent.x - 1, y: ent.y - 1, w: 2, h: 2 };
            const trigRect: Rect = {
              x: tr.x * ts,
              y: tr.y * ts,
              w: (tr.w || 2) * ts,
              h: (tr.h || 2) * ts
            };
            this.traps.push(new HiddenSpikes(id, ex, ey, count, trigRect, ts, audio));
            break;
          }
          case 'crumble': {
            const w = (ent.w || 1) * ts;
            this.traps.push(new CrumbleTile(id, ex, ey, w, ts, audio, particles));
            break;
          }
          case 'fakeFloor': {
            const w = (ent.w || 1) * ts;
            this.traps.push(new FakeFloor(id, ex, ey, w, ts));
            break;
          }
          case 'saw': {
            const tx = (ent.targetX !== undefined ? ent.targetX : ent.x) * ts;
            const ty = (ent.targetY !== undefined ? ent.targetY : ent.y) * ts;
            this.traps.push(new Saw(id, ex, ey, tx, ty, ent.radius || 18, ent.speed || 110));
            break;
          }
          case 'slidingSaw': {
            const tx = ent.targetX * ts;
            const ty = ent.targetY * ts;
            const tr = ent.trigger;
            const trigRect: Rect = {
              x: tr.x * ts,
              y: tr.y * ts,
              w: (tr.w || 2) * ts,
              h: (tr.h || 2) * ts
            };
            this.traps.push(new SlidingSaw(id, ex, ey, tx, ty, trigRect, ent.radius || 20, ent.speed || 380, audio));
            break;
          }
          case 'thwomp': {
            const ty = ent.targetY * ts;
            const w = (ent.w || 1.5) * ts;
            const h = (ent.h || 1.5) * ts;
            this.traps.push(new Thwomp(id, ex, ey, ty, w, h, camera, audio));
            break;
          }
          case 'closingWall': {
            const tx = ent.targetX * ts;
            const ty = ent.targetY * ts;
            const w = (ent.w || 1) * ts;
            const h = (ent.h || 3) * ts;
            const tr = ent.trigger;
            const trigRect: Rect = {
              x: tr.x * ts,
              y: tr.y * ts,
              w: (tr.w || 2) * ts,
              h: (tr.h || 2) * ts
            };
            this.traps.push(new ClosingWall(id, ex, ey, tx, ty, w, h, trigRect, ent.speed || 130, audio));
            break;
          }
          case 'movingPlatform': {
            const tx = (ent.targetX !== undefined ? ent.targetX : ent.x) * ts;
            const ty = (ent.targetY !== undefined ? ent.targetY : ent.y) * ts;
            const w = (ent.w || 2) * ts;
            const h = (ent.h || 0.5) * ts;
            this.traps.push(new MovingPlatform(id, ex, ey, tx, ty, w, h, ent.speed || 80, !!ent.trollFall));
            break;
          }
          case 'shooter': {
            this.traps.push(new Shooter(id, ex, ey, ent.dirX || -1, ent.dirY || 0, ent.interval || 1.6, ent.projectileSpeed || 240, ent.range || 500, audio));
            break;
          }
          case 'laser': {
            const w = ent.w ? ent.w * ts : 8;
            const h = ent.h ? ent.h * ts : 120;
            this.traps.push(new Laser(id, ex, ey, w, h, ent.on || 1.2, ent.off || 1.2, ent.offset || 0));
            break;
          }
          case 'fakeButton': {
            this.traps.push(new FakeButton(id, ex, ey, audio));
            break;
          }
          case 'fakeCheckpoint': {
            const fcy = ent.y !== undefined ? ent.y * ts + ts - 40 : ey;
            this.traps.push(new FakeCheckpoint(id, ex, fcy, audio));
            break;
          }
          case 'fakeDoor': {
            const fdy = ent.y !== undefined ? ent.y * ts + ts - 48 : ey;
            this.traps.push(new FakeDoor(id, ex, fdy, audio));
            break;
          }
          case 'runningDoor': {
            const rd = new RunningDoor(id, ex, ey, (ent.runDist || 5) * ts);
            this.runningDoor = rd;
            this.traps.push(rd);
            break;
          }
          case 'gravityZone': {
            this.traps.push(new GravityZone(id, ex, ey, (ent.w || 3) * ts, (ent.h || 3) * ts));
            break;
          }
          case 'invertControlZone': {
            this.traps.push(new InvertControlZone(id, ex, ey, (ent.w || 3) * ts, (ent.h || 3) * ts));
            break;
          }
          case 'invisibleBlock': {
            this.traps.push(new InvisibleBlock(id, ex, ey, (ent.w || 1) * ts, (ent.h || 1) * ts, audio));
            break;
          }
          case 'vanishingFloor': {
            this.traps.push(new VanishingFloor(id, ex, ey, (ent.w || 1) * ts, ts, ent.delay || 0.08, particles, audio));
            break;
          }
          case 'launcherFloor': {
            const ty = ent.targetY * ts;
            const csY = ent.ceilingSpikesY * ts;
            this.traps.push(new LauncherFloor(id, ex, ey, ty, csY, (ent.w || 1.5) * ts, 16, ent.count || 3, audio, camera));
            break;
          }
          case 'explodingFloor': {
            this.traps.push(new ExplodingFloor(id, ex, ey, (ent.w || 1) * ts, ts, ent.warnTime !== undefined ? ent.warnTime : 0.35, camera, audio, particles));
            break;
          }
          case 'spikeTransformFloor': {
            this.traps.push(new SpikeTransformFloor(id, ex, ey, (ent.w || 1) * ts, ts, audio));
            break;
          }
          case 'trapdoor': {
            this.traps.push(new Trapdoor(id, ex, ey, (ent.w || 2) * ts, 12, audio));
            break;
          }
          case 'fallingCeiling': {
            const floorY = ent.floorY * ts;
            this.traps.push(new FallingCeiling(id, ex, ey, floorY, (ent.w || 2) * ts, ts, camera, audio));
            break;
          }
          case 'fakeSpring': {
            this.traps.push(new FakeSpring(id, ex, ey, audio));
            break;
          }
          case 'chainBomb': {
            this.traps.push(new ChainBomb(id, ex, ey, ent.count || 5, ts, audio, camera));
            break;
          }
          case 'fallingPillar': {
            const floorY = (ent.floorY !== undefined ? ent.floorY : ent.y) * ts;
            const pw = (ent.w || 1.5) * ts;
            const ph = (ent.h || 7.5) * ts;
            this.traps.push(new FallingPillar(id, ex, floorY, pw, ph, camera, audio));
            break;
          }
        }
      }
    }
  }

  public isSolidTileAt(pixelX: number, pixelY: number): boolean {
    const tileCol = Math.floor(pixelX / this.tileSize);
    const tileRow = Math.floor(pixelY / this.tileSize);
    if (tileRow < 0 || tileRow >= this.heightInTiles || tileCol < 0 || tileCol >= this.widthInTiles) {
      return false;
    }
    return this.grid[tileRow][tileCol] === '#';
  }

  public getSolidTilesInRect(rect: Rect): Rect[] {
    const solids: Rect[] = [];

    // 1. Grid solid tiles
    const startCol = Math.max(0, Math.floor(rect.x / this.tileSize));
    const endCol = Math.min(this.widthInTiles - 1, Math.floor((rect.x + rect.w) / this.tileSize));
    const startRow = Math.max(0, Math.floor(rect.y / this.tileSize));
    const endRow = Math.min(this.heightInTiles - 1, Math.floor((rect.y + rect.h) / this.tileSize));

    for (let r = startRow; r <= endRow; r++) {
      const rowStr = this.grid[r];
      for (let c = startCol; c <= endCol; c++) {
        if (rowStr[c] === '#') {
          solids.push({
            x: c * this.tileSize,
            y: r * this.tileSize,
            w: this.tileSize,
            h: this.tileSize
          });
        }
      }
    }

    // 2. Dynamic solid boxes from active traps (CrumbleTile, MovingPlatform, Thwomp, ClosingWall, InvisibleBlock)
    for (const trap of this.traps) {
      if (trap.getSolidBox) {
        const sBox = trap.getSolidBox();
        if (sBox) {
          solids.push(sBox);
        }
      }
    }

    return solids;
  }

  public resetTraps(): void {
    for (const trap of this.traps) {
      trap.reset();
    }
    this.door?.reset();
  }

  public render(ctx: CanvasRenderingContext2D, camera: Camera): void {
    const ts = this.tileSize;

    // Gambar grid latar halus (kertas bergaris sketsa)
    ctx.save();
    ctx.strokeStyle = CONFIG.COLORS.GRID_LINE;
    ctx.lineWidth = 1;
    const startC = Math.max(0, Math.floor(camera.x / ts));
    const endC = Math.min(this.widthInTiles, Math.ceil((camera.x + camera.width) / ts));
    const startR = Math.max(0, Math.floor(camera.y / ts));
    const endR = Math.min(this.heightInTiles, Math.ceil((camera.y + camera.height) / ts));

    for (let c = startC; c <= endC; c++) {
      ctx.beginPath();
      ctx.moveTo(c * ts, startR * ts);
      ctx.lineTo(c * ts, endR * ts);
      ctx.stroke();
    }
    for (let r = startR; r <= endR; r++) {
      ctx.beginPath();
      ctx.moveTo(startC * ts, r * ts);
      ctx.lineTo(endC * ts, r * ts);
      ctx.stroke();
    }

    // Gambar tile solid dengan bayangan & tekstur sketsa tangan
    for (let r = startR; r < endR; r++) {
      const row = this.grid[r];
      if (!row) continue;
      for (let c = startC; c < endC; c++) {
        if (row[c] === '#') {
          const px = c * ts;
          const py = r * ts;

          // Isi blok solid
          ctx.fillStyle = CONFIG.COLORS.SOLID_BLOCK_FILL;
          ctx.fillRect(px, py, ts, ts);

          // Garis tepi sketsa
          ctx.strokeStyle = CONFIG.COLORS.SOLID_BLOCK;
          ctx.lineWidth = 2;
          ctx.strokeRect(px, py, ts, ts);

          // Detail crosshatch sketsa doodle di permukaan
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(px + 4, py + 4);
          ctx.lineTo(px + ts - 4, py + 4);
          ctx.stroke();
        }
      }
    }
    ctx.restore();

    // Gambar Checkpoints
    for (const cp of this.checkpoints) {
      cp.render(ctx);
    }

    // Gambar Traps & Rambu
    for (const trap of this.traps) {
      trap.render(ctx);
    }

    // Gambar Pintu Keluar Asli
    if (this.door) {
      this.door.render(ctx);
    }
  }
}
