// Sistem Input Terpadu Keyboard & Touch (PRD Bagian 4.1 & 10.1)

export class Input {
  // Status tombol aktif
  private keys: Record<string, boolean> = {};
  private keysJustPressed: Record<string, boolean> = {};

  // Virtual touch button states
  private touchLeft = false;
  private touchRight = false;
  private touchJump = false;
  private touchJumpJustPressed = false;

  // Pointer / Mouse untuk menu & HUD
  public pointerX = 0;
  public pointerY = 0;
  public pointerDown = false;
  public pointerClicked = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.setupKeyboard();
      this.setupTouch();
      this.setupPointer();
    }
  }

  // Typing mode untuk input username
  public isTyping = false;
  public typedKey: string | null = null;

  private setupKeyboard(): void {
    window.addEventListener('keydown', (e) => {
      if (this.isTyping) {
        if (e.key === 'Backspace' || e.key === 'Enter') {
          e.preventDefault();
          this.typedKey = e.key;
          return;
        }
        if (e.key.length === 1) {
          e.preventDefault();
          this.typedKey = e.key;
          return;
        }
      }

      // Cegah default browser scroll untuk space & arrow keys
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }

      if (!this.keys[e.code]) {
        this.keysJustPressed[e.code] = true;
      }
      this.keys[e.code] = true;
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    // Reset saat tab kehilangan fokus atau tab disembunyikan (Aturan B10 & B12)
    const resetInputState = () => {
      this.keys = {};
      this.keysJustPressed = {};
      this.touchLeft = false;
      this.touchRight = false;
      this.touchJump = false;
      this.touchJumpJustPressed = false;
    };

    window.addEventListener('blur', resetInputState);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        resetInputState();
      }
    });
  }

  private setupTouch(): void {
    const btnLeft = document.getElementById('btn-left');
    const btnRight = document.getElementById('btn-right');
    const btnJump = document.getElementById('btn-jump');
    const touchContainer = document.getElementById('touch-controls');

    // Tampilkan touch control jika perangkat sentuh
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice && touchContainer) {
      touchContainer.style.display = 'flex';
    }

    const bindTouchBtn = (
      btn: HTMLElement | null,
      onPress: () => void,
      onRelease: () => void
    ) => {
      if (!btn) return;
      btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        btn.classList.add('pressed');
        onPress();
      });
      btn.addEventListener('touchend', (e) => {
        e.preventDefault();
        btn.classList.remove('pressed');
        onRelease();
      });
      btn.addEventListener('touchcancel', () => {
        btn.classList.remove('pressed');
        onRelease();
      });
    };

    bindTouchBtn(
      btnLeft,
      () => { this.touchLeft = true; },
      () => { this.touchLeft = false; }
    );

    bindTouchBtn(
      btnRight,
      () => { this.touchRight = true; },
      () => { this.touchRight = false; }
    );

    bindTouchBtn(
      btnJump,
      () => {
        if (!this.touchJump) this.touchJumpJustPressed = true;
        this.touchJump = true;
      },
      () => { this.touchJump = false; }
    );
  }

  private setupPointer(): void {
    const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    if (!canvas) return;

    const updatePointerPos = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      this.pointerX = (clientX - rect.left) * scaleX;
      this.pointerY = (clientY - rect.top) * scaleY;
    };

    canvas.addEventListener('mousemove', (e) => {
      updatePointerPos(e.clientX, e.clientY);
    });

    canvas.addEventListener('mousedown', (e) => {
      updatePointerPos(e.clientX, e.clientY);
      this.pointerDown = true;
      this.pointerClicked = true;
    });

    window.addEventListener('mouseup', () => {
      this.pointerDown = false;
    });

    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        updatePointerPos(e.touches[0].clientX, e.touches[0].clientY);
        this.pointerDown = true;
        this.pointerClicked = true;
      }
    }, { passive: true });

    canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        updatePointerPos(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    canvas.addEventListener('touchend', () => {
      this.pointerDown = false;
    });
  }

  /**
   * Panggil di akhir frame untuk mereset just pressed status
   */
  public endFrame(): void {
    this.keysJustPressed = {};
    this.touchJumpJustPressed = false;
    this.pointerClicked = false;
    this.typedKey = null;
  }

  // --- Getter Aksi Permainan ---

  public isLeft(): boolean {
    return this.keys['ArrowLeft'] || this.keys['KeyA'] || this.touchLeft;
  }

  public isRight(): boolean {
    return this.keys['ArrowRight'] || this.keys['KeyD'] || this.touchRight;
  }

  public isJump(): boolean {
    return (
      this.keys['Space'] ||
      this.keys['ArrowUp'] ||
      this.keys['KeyW'] ||
      this.keys['KeyZ'] ||
      this.keys['KeyK'] ||
      this.touchJump
    );
  }

  public isJumpJustPressed(): boolean {
    return (
      this.keysJustPressed['Space'] ||
      this.keysJustPressed['ArrowUp'] ||
      this.keysJustPressed['KeyW'] ||
      this.keysJustPressed['KeyZ'] ||
      this.keysJustPressed['KeyK'] ||
      this.touchJumpJustPressed
    );
  }

  public consumeJump(): void {
    delete this.keysJustPressed['Space'];
    delete this.keysJustPressed['ArrowUp'];
    delete this.keysJustPressed['KeyW'];
    delete this.keysJustPressed['KeyZ'];
    delete this.keysJustPressed['KeyK'];
    this.touchJumpJustPressed = false;
  }

  public isRestartJustPressed(): boolean {
    return !!this.keysJustPressed['KeyR'];
  }

  public isPauseJustPressed(): boolean {
    return !!(this.keysJustPressed['Escape'] || this.keysJustPressed['KeyP']);
  }

  public isDebugJustPressed(): boolean {
    return !!this.keysJustPressed['F2'];
  }
}
