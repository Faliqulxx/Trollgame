// Entitas Player & Animasi Prosedural Stickman (PRD Bagian 4.2 & 8.2)

import { CONFIG } from '../config';
import { Collision, Rect } from '../physics/Collision';
import { Input } from '../core/Input';
import { AudioManager } from '../core/Audio';
import { ParticleSystem } from '../core/Particles';
import { HeadImageManager } from '../core/HeadImageManager';

export type PlayerState = 'idle' | 'running' | 'jumping' | 'falling' | 'dead';

export interface TileMapInterface {
  isSolidTileAt(pixelX: number, pixelY: number): boolean;
  getSolidTilesInRect(rect: Rect): Rect[];
}

export class Player {
  // Posisi & Dimensi Hitbox
  public x = 0;
  public y = 0;
  public width = CONFIG.PLAYER.WIDTH;
  public height = CONFIG.PLAYER.HEIGHT;

  // Kecepatan
  public vx = 0;
  public vy = 0;

  // Status
  public isGrounded = false;
  public wasGrounded = false;
  public facing: 1 | -1 = 1;
  public state: PlayerState = 'idle';

  // Coyote time & Jump buffer (PRD 4.2)
  public coyoteTimer = 0;
  public jumpBufferTimer = 0;

  // Modifikasi Dunia (Jebakan T16 & T17)
  public gravityScale = 1;      // -1 jika terbalik
  public controlsInverted = false;

  // Animasi & Jump Grace
  private animTimer = 0;
  private jumpGraceTimer = 0;
  public isDead = false;

  constructor(spawnX = 0, spawnY = 0) {
    this.spawn(spawnX, spawnY);
  }

  public spawn(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.isGrounded = false;
    this.wasGrounded = false;
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;
    this.jumpGraceTimer = 0;
    this.gravityScale = 1;
    this.controlsInverted = false;
    this.isDead = false;
    this.state = 'idle';
  }

  public getHitbox(): Rect {
    return {
      x: this.x,
      y: this.y,
      w: this.width,
      h: this.height
    };
  }

  public update(
    dt: number,
    input: Input,
    map: TileMapInterface,
    audio?: AudioManager,
    particles?: ParticleSystem
  ): void {
    if (this.isDead) {
      this.state = 'dead';
      return;
    }

    // 1. Timer Penyangga (Coyote & Jump Buffer)
    if (this.isGrounded) {
      this.coyoteTimer = CONFIG.PLAYER.COYOTE_TIME;
    } else {
      this.coyoteTimer = Math.max(0, this.coyoteTimer - dt);
    }

    if (input.isJumpJustPressed()) {
      this.jumpBufferTimer = CONFIG.PLAYER.JUMP_BUFFER_TIME;
    } else {
      this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - dt);
    }

    // 2. Input Gerak Horizontal
    let moveDir = 0;
    if (input.isLeft()) moveDir -= 1;
    if (input.isRight()) moveDir += 1;

    // Jebakan T17: Kontrol Terbalik
    if (this.controlsInverted) {
      moveDir = -moveDir;
    }

    if (moveDir !== 0) {
      this.facing = moveDir > 0 ? 1 : -1;
      this.vx += moveDir * CONFIG.PLAYER.ACCELERATION * dt;
      if (Math.abs(this.vx) > CONFIG.PLAYER.MAX_SPEED) {
        this.vx = Math.sign(this.vx) * CONFIG.PLAYER.MAX_SPEED;
      }
    } else {
      // Friksi saat tidak ada input
      const frictionAmount = CONFIG.PLAYER.FRICTION * dt;
      if (Math.abs(this.vx) <= frictionAmount) {
        this.vx = 0;
      } else {
        this.vx -= Math.sign(this.vx) * frictionAmount;
      }
    }

    // 3. Gravitasi
    const effectiveGravity = CONFIG.PLAYER.GRAVITY * this.gravityScale;
    this.vy += effectiveGravity * dt;
    // Batasi kecepatan jatuh
    if (this.gravityScale > 0 && this.vy > CONFIG.PLAYER.MAX_FALL_SPEED) {
      this.vy = CONFIG.PLAYER.MAX_FALL_SPEED;
    } else if (this.gravityScale < 0 && this.vy < -CONFIG.PLAYER.MAX_FALL_SPEED) {
      this.vy = -CONFIG.PLAYER.MAX_FALL_SPEED;
    }

    // 4. Eksekusi Lompat (Coyote Time + Jump Buffer)
    const canJump = this.coyoteTimer > 0;
    if (this.jumpBufferTimer > 0 && canJump) {
      this.vy = CONFIG.PLAYER.JUMP_SPEED * this.gravityScale;
      this.coyoteTimer = 0;
      this.jumpBufferTimer = 0;
      this.jumpGraceTimer = 0.08; // 80ms grace time untuk memastikan awal loncatan selalu penuh
      this.isGrounded = false;
      input.consumeJump?.();
      audio?.playJump();
      if (particles) {
        particles.emitDust(this.x + this.width / 2, this.y + (this.gravityScale > 0 ? this.height : 0), 6);
      }
    }

    // 5. Variable Jump Height: potong loncatan HANYA jika tombol dilepas dan sudah melewati grace timer
    if (this.jumpGraceTimer > 0) {
      this.jumpGraceTimer -= dt;
    } else if (!input.isJump()) {
      if (this.gravityScale > 0 && this.vy < -250) {
        this.vy *= Math.pow(CONFIG.PLAYER.VARIABLE_JUMP_MULTIPLIER, dt * 60);
      } else if (this.gravityScale < 0 && this.vy > 250) {
        this.vy *= Math.pow(CONFIG.PLAYER.VARIABLE_JUMP_MULTIPLIER, dt * 60);
      }
    }

    // 6. Integrasi Fisika & Tabrakan Tile Solid (Per-Sumbu)
    this.wasGrounded = this.isGrounded;
    this.isGrounded = false;

    // Sumbu X
    this.x += this.vx * dt;
    this.resolveTileCollisionX(map);

    // Sumbu Y
    this.y += this.vy * dt;
    this.resolveTileCollisionY(map, audio, particles);

    // 7. Penentuan Status & Animasi
    if (this.isGrounded) {
      if (Math.abs(this.vx) > 10) {
        this.state = 'running';
        this.animTimer += dt * 14;
      } else {
        this.state = 'idle';
        this.animTimer += dt * 3;
      }
    } else {
      if ((this.gravityScale > 0 && this.vy < 0) || (this.gravityScale < 0 && this.vy > 0)) {
        this.state = 'jumping';
      } else {
        this.state = 'falling';
      }
      this.animTimer += dt * 6;
    }
  }

  private resolveTileCollisionX(map: TileMapInterface): void {
    const hitbox = this.getHitbox();
    const solids = map.getSolidTilesInRect(hitbox);

    for (const solid of solids) {
      if (Collision.aabb(hitbox, solid)) {
        if (this.vx > 0) {
          this.x = solid.x - this.width;
          this.vx = 0;
        } else if (this.vx < 0) {
          this.x = solid.x + solid.w;
          this.vx = 0;
        }
        hitbox.x = this.x;
      }
    }
  }

  private resolveTileCollisionY(
    map: TileMapInterface,
    audio?: AudioManager,
    particles?: ParticleSystem
  ): void {
    const hitbox = this.getHitbox();
    const solids = map.getSolidTilesInRect(hitbox);

    for (const solid of solids) {
      if (Collision.aabb(hitbox, solid)) {
        if (this.gravityScale > 0) {
          // Gravitasi normal (jatuh ke bawah)
          if (this.vy > 0) {
            this.y = solid.y - this.height;
            if (!this.wasGrounded && this.vy > 250) {
              audio?.playLand();
              particles?.emitDust(this.x + this.width / 2, this.y + this.height, 4);
            }
            this.vy = 0;
            this.isGrounded = true;
          } else if (this.vy < 0) {
            this.y = solid.y + solid.h;
            this.vy = 0;
          }
        } else {
          // Gravitasi terbalik (jatuh ke atas)
          if (this.vy < 0) {
            this.y = solid.y + solid.h;
            if (!this.wasGrounded && Math.abs(this.vy) > 250) {
              audio?.playLand();
              particles?.emitDust(this.x + this.width / 2, this.y, 4);
            }
            this.vy = 0;
            this.isGrounded = true;
          } else if (this.vy > 0) {
            this.y = solid.y - this.height;
            this.vy = 0;
          }
        }
        hitbox.y = this.y;
      }
    }

    // Ground probe: Jika pemain sedang berjalan/berdiri di atas lantai datar (selisih <= 3px) dan vy kecil
    // memastikan status isGrounded tidak pernah fluktuasi/hilang di antara sambungan tile
    if (!this.isGrounded && this.gravityScale > 0 && this.vy >= 0 && this.vy < 200) {
      const probe: Rect = {
        x: this.x + 2,
        y: this.y + this.height,
        w: this.width - 4,
        h: 3
      };
      const probeSolids = map.getSolidTilesInRect(probe);
      for (const s of probeSolids) {
        if (Collision.aabb(probe, s)) {
          this.isGrounded = true;
          this.y = s.y - this.height;
          this.vy = 0;
          break;
        }
      }
    }
  }

  /**
   * Render Stickman Prosedural Vektor (PRD Bagian 8.2)
   */
  public render(ctx: CanvasRenderingContext2D): void {
    if (this.isDead) return;

    ctx.save();

    // Titik pusat kaki
    const centerX = this.x + this.width / 2;
    const footY = this.y + this.height;

    ctx.translate(centerX, footY);
    if (this.gravityScale < 0) {
      ctx.scale(1, -1);
      ctx.translate(0, -this.height);
    }

    ctx.strokeStyle = CONFIG.COLORS.STICKMAN;
    ctx.fillStyle = CONFIG.COLORS.STICKMAN;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const cycle = Math.sin(this.animTimer);
    const cycleCos = Math.cos(this.animTimer);

    // Koordinat anatomi stickman
    const headRadius = 6.5;
    const headCenterY = -33;
    const neckY = -26;
    const pelvisY = -16;

    const customHead = HeadImageManager.getInstance().getImage();

    if (customHead) {
      // 1. Render Foto Kepala Wajah Pemain (Circular Cutout HD)
      // Radius 10px memberi proporsi bobblehead wajah yang sangat jelas, tajam, & ekspresif
      const customRadius = 10;
      ctx.save();
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.beginPath();
      ctx.arc(0, headCenterY, customRadius, 0, Math.PI * 2);
      ctx.clip();

      // Jika menghadap ke kiri (facing === -1), balik foto secara horizontal
      if (this.facing === -1) {
        ctx.scale(-1, 1);
      }

      ctx.drawImage(
        customHead,
        -customRadius,
        headCenterY - customRadius,
        customRadius * 2,
        customRadius * 2
      );
      ctx.restore();

      // Outline hitam khas doodle stickman
      ctx.strokeStyle = CONFIG.COLORS.STICKMAN;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, headCenterY, customRadius, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      // 1. Kepala Lingkaran Asli Stickman
      ctx.beginPath();
      ctx.arc(0, headCenterY, headRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Mata (titik ekspresif melihat ke arah lari)
      const eyeOffsetX = this.facing * 2.2;
      ctx.fillStyle = CONFIG.COLORS.STICKMAN;
      ctx.beginPath();
      ctx.arc(eyeOffsetX, headCenterY - 0.5, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Garis Badan (Torso)
    ctx.beginPath();
    ctx.moveTo(0, neckY);
    ctx.lineTo(0, pelvisY);
    ctx.stroke();

    // 3. Tangan (Arms)
    let leftHandX = 0;
    let leftHandY = 0;
    let rightHandX = 0;
    let rightHandY = 0;

    const shoulderY = neckY + 3;

    if (this.state === 'jumping') {
      // Menjangkau ke atas saat melompat
      leftHandX = -6;
      leftHandY = shoulderY - 8;
      rightHandX = 6;
      rightHandY = shoulderY - 8;
    } else if (this.state === 'falling') {
      // Panik melambai saat jatuh
      leftHandX = -8 + Math.sin(this.animTimer * 2) * 3;
      leftHandY = shoulderY - 4;
      rightHandX = 8 - Math.sin(this.animTimer * 2) * 3;
      rightHandY = shoulderY - 4;
    } else if (this.state === 'running') {
      // Ayunan tangan saat lari
      leftHandX = -cycle * 9;
      leftHandY = shoulderY + 5 + cycleCos * 3;
      rightHandX = cycle * 9;
      rightHandY = shoulderY + 5 - cycleCos * 3;
    } else {
      // Diam santai
      leftHandX = -5;
      leftHandY = shoulderY + 6;
      rightHandX = 5;
      rightHandY = shoulderY + 6;
    }

    ctx.beginPath();
    ctx.moveTo(0, shoulderY);
    ctx.lineTo(leftHandX, leftHandY);
    ctx.moveTo(0, shoulderY);
    ctx.lineTo(rightHandX, rightHandY);
    ctx.stroke();

    // 4. Kaki (Legs)
    let leftFootX = -4;
    let leftFootY = 0;
    let rightFootX = 4;
    let rightFootY = 0;

    if (this.state === 'running') {
      leftFootX = -cycle * 10;
      leftFootY = Math.max(0, -Math.abs(cycleCos) * 5);
      rightFootX = cycle * 10;
      rightFootY = Math.max(0, -Math.abs(cycle) * 5);
    } else if (this.state === 'jumping' || this.state === 'falling') {
      leftFootX = -5;
      leftFootY = -3;
      rightFootX = 5;
      rightFootY = -6;
    }

    ctx.beginPath();
    ctx.moveTo(0, pelvisY);
    ctx.lineTo(leftFootX, leftFootY);
    ctx.moveTo(0, pelvisY);
    ctx.lineTo(rightFootX, rightFootY);
    ctx.stroke();

    ctx.restore();
  }
}
