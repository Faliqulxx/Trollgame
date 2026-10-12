// Master Game Engine & Fixed Timestep Loop (PRD Bagian 7.1, 10.2 & 11)

import { CONFIG } from '../config';
import { Camera } from './Camera';
import { Input } from './Input';
import { AudioManager } from './Audio';
import { ParticleSystem } from './Particles';
import { Storage } from './Storage';
import { IntroScene } from '../scenes/IntroScene';
import { MenuScene } from '../scenes/MenuScene';
import { LevelSelectScene } from '../scenes/LevelSelectScene';
import { GameScene } from '../scenes/GameScene';
import { EndScene } from '../scenes/EndScene';

export type GameState = 'INTRO' | 'MENU' | 'LEVEL_SELECT' | 'PLAYING' | 'ENDING';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  private state: GameState = 'INTRO';
  private input: Input;
  private camera: Camera;
  private audio: AudioManager;
  private particles: ParticleSystem;

  // Scenes
  private introScene: IntroScene;
  private menuScene: MenuScene;
  private levelSelectScene: LevelSelectScene;
  private gameScene: GameScene | null = null;
  private endScene: EndScene | null = null;

  // Game Loop Timers
  private lastTime = 0;
  private accumulator = 0;
  private isRunning = false;

  constructor(canvasId: string) {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) {
      throw new Error(`Canvas dengan id '${canvasId}' tidak ditemukan!`);
    }
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Gagal menginisialisasi CanvasRenderingContext2D!');
    }
    this.ctx = ctx;

    // Inisialisasi Sub-Sistem
    this.input = new Input();
    this.camera = new Camera();
    this.audio = AudioManager.getInstance();
    this.particles = new ParticleSystem();

    // Scene Awal
    this.introScene = new IntroScene(this.audio);
    this.menuScene = new MenuScene(this.audio);
    this.levelSelectScene = new LevelSelectScene();

    this.setupWindowResize();
    this.resizeCanvas();
    this.setupAutoPause();
  }

  private setupAutoPause(): void {
    // Aturan B10: Auto-pause saat tab hilang fokus atau disembunyikan
    window.addEventListener('blur', () => {
      if (this.state === 'PLAYING' && this.gameScene && this.gameScene.status === 'PLAYING') {
        this.gameScene.status = 'PAUSED';
        this.gameScene.hud.isPaused = true;
      }
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.state === 'PLAYING' && this.gameScene && this.gameScene.status === 'PLAYING') {
        this.gameScene.status = 'PAUSED';
        this.gameScene.hud.isPaused = true;
      }
    });
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  private loop(currentTime: number): void {
    if (!this.isRunning) return;

    // 1. Hitung Delta Time dengan Clamping (PRD 11 & 13: cegah lonjakan dt saat tab background)
    let dt = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    if (dt > CONFIG.PHYSICS.MAX_DT_CLAMP) {
      dt = CONFIG.PHYSICS.MAX_DT_CLAMP;
    }

    // 2. Fixed Timestep Accumulator (60 Hz konsisten)
    this.accumulator += dt;
    if (this.accumulator > CONFIG.PHYSICS.MAX_ACCUMULATOR) {
      this.accumulator = CONFIG.PHYSICS.MAX_ACCUMULATOR;
    }

    while (this.accumulator >= CONFIG.PHYSICS.FIXED_DELTA) {
      this.update(CONFIG.PHYSICS.FIXED_DELTA);
      this.accumulator -= CONFIG.PHYSICS.FIXED_DELTA;
    }

    // 3. Render
    this.render();

    // 4. Akhiri Frame Input
    this.input.endFrame();

    requestAnimationFrame((t) => this.loop(t));
  }

  private update(fixedDt: number): void {
    // Mulai BGM saat ada interaksi pertama
    if (this.input.pointerClicked || this.input.isJumpJustPressed()) {
      this.audio.startBGM();
    }

    switch (this.state) {
      case 'INTRO': {
        this.introScene.update(fixedDt, this.input.pointerX, this.input.pointerY);

        if (this.introScene.isHoveringReadyButton(this.input.pointerX, this.input.pointerY)) {
          this.canvas.style.cursor = 'pointer';
        } else {
          this.canvas.style.cursor = 'default';
        }

        if (this.input.pointerClicked) {
          const action = this.introScene.handleClick(this.input.pointerX, this.input.pointerY);
          if (action === 'play') {
            this.canvas.style.cursor = 'default';
            this.state = 'MENU';
          }
        }
        break;
      }

      case 'MENU': {
        this.menuScene.update(fixedDt);
        if (this.input.pointerClicked) {
          const action = this.menuScene.handleClick(this.input.pointerX, this.input.pointerY);
          if (action === 'play') {
            const unlocked = Storage.getUnlockedLevel();
            this.startGameAtLevel(unlocked);
          } else if (action === 'select') {
            this.levelSelectScene.refreshCards();
            this.state = 'LEVEL_SELECT';
          } else if (action === 'audio') {
            this.audio.toggleMute();
          } else if (action === 'reset') {
            if (confirm('Apakah kamu yakin ingin mereset seluruh progres level?')) {
              Storage.resetProgress();
              this.levelSelectScene.refreshCards();
            }
          }
        }
        break;
      }

      case 'LEVEL_SELECT': {
        if (this.input.pointerClicked) {
          const action = this.levelSelectScene.handleClick(this.input.pointerX, this.input.pointerY);
          if (action === 'back') {
            this.state = 'MENU';
          } else if (typeof action === 'number') {
            this.startGameAtLevel(action);
          }
        }
        break;
      }

      case 'PLAYING': {
        if (this.gameScene) {
          this.gameScene.update(fixedDt, this.input);

          if (this.input.pointerClicked) {
            const action = this.gameScene.handlePointerClick(this.input.pointerX, this.input.pointerY);
            if (action === 'menu') {
              this.state = 'MENU';
            } else if (action === 'next_level') {
              // Jika baru saja menyelesaikan level terakhir (Level 10)
              this.endScene = new EndScene(this.particles);
              this.state = 'ENDING';
            }
          }
        }
        break;
      }

      case 'ENDING': {
        if (this.endScene) {
          this.endScene.update(fixedDt);
          this.particles.update(fixedDt);

          if (this.input.pointerClicked) {
            const replay = this.endScene.handleClick(this.input.pointerX, this.input.pointerY);
            if (replay) {
              this.startGameAtLevel(1);
            }
          }
        }
        break;
      }
    }
  }

  private startGameAtLevel(levelId: number): void {
    this.gameScene = new GameScene(levelId, this.camera, this.particles, this.audio);
    this.state = 'PLAYING';
  }

  private render(): void {
    this.ctx.clearRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

    switch (this.state) {
      case 'INTRO':
        this.introScene.render(this.ctx, this.input.pointerX, this.input.pointerY);
        break;
      case 'MENU':
        this.menuScene.render(this.ctx);
        break;
      case 'LEVEL_SELECT':
        this.levelSelectScene.render(this.ctx);
        break;
      case 'PLAYING':
        if (this.gameScene) {
          this.gameScene.render(this.ctx);
        }
        break;
      case 'ENDING':
        if (this.endScene) {
          this.endScene.render(this.ctx);
        }
        break;
    }
  }

  private setupWindowResize(): void {
    window.addEventListener('resize', () => {
      this.resizeCanvas();
    });
  }

  private resizeCanvas(): void {
    const windowW = window.innerWidth;
    const windowH = window.innerHeight;

    const targetRatio = CONFIG.CANVAS_WIDTH / CONFIG.CANVAS_HEIGHT;
    const currentRatio = windowW / windowH;

    let displayW = 0;
    let displayH = 0;

    if (currentRatio > targetRatio) {
      // Dibatasi oleh tinggi layar
      displayH = windowH;
      displayW = windowH * targetRatio;
    } else {
      // Dibatasi oleh lebar layar
      displayW = windowW;
      displayH = windowW / targetRatio;
    }

    this.canvas.style.width = `${Math.floor(displayW)}px`;
    this.canvas.style.height = `${Math.floor(displayH)}px`;
  }
}
