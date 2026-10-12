// Modal Pengambilan Foto Langsung dari Kamera / Webcam (CameraCaptureModal)
export class CameraCaptureModal {
  private static instance: CameraCaptureModal | null = null;
  private modalElement: HTMLElement | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private stream: MediaStream | null = null;
  private currentFacingMode: 'user' | 'environment' = 'user';

  private resolvePromise: ((dataUrl: string | null) => void) | null = null;

  private constructor() {
    this.createDom();
  }

  public static getInstance(): CameraCaptureModal {
    if (!CameraCaptureModal.instance) {
      CameraCaptureModal.instance = new CameraCaptureModal();
    }
    return CameraCaptureModal.instance;
  }

  private createDom(): void {
    if (typeof document === 'undefined') return;

    const modal = document.createElement('div');
    modal.id = 'camera-capture-modal';
    modal.style.cssText = `
      display: none;
      position: fixed;
      inset: 0;
      z-index: 9998;
      background: rgba(10, 10, 16, 0.88);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      align-items: center;
      justify-content: center;
      font-family: 'Outfit', sans-serif;
      user-select: none;
      -webkit-user-select: none;
    `;

    modal.innerHTML = `
      <div style="
        background: #1c1c24;
        border: 2px solid #3b3b4a;
        box-shadow: 0 24px 60px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.1);
        border-radius: 18px;
        width: 390px;
        max-width: 94vw;
        padding: 22px;
        color: #f3f4f6;
        display: flex;
        flex-direction: column;
        align-items: center;
        box-sizing: border-box;
      ">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 14px; width: 100%;">
          <h2 style="margin: 0; font-size: 20px; font-weight: 800; color: #ffffff; display: flex; align-items: center; justify-content: center; gap: 8px;">
            📸 FOTO WAJAH LANGSUNG
          </h2>
          <p style="margin: 4px 0 0 0; font-size: 12.5px; color: #9ca3af;">
            Arahkan wajahmu ke tengah kamera lalu tekan tombol jepret
          </p>
        </div>

        <!-- Video Viewfinder Box -->
        <div style="
          position: relative;
          width: 330px;
          height: 330px;
          border-radius: 14px;
          overflow: hidden;
          background: #000000;
          box-shadow: inset 0 0 24px rgba(0,0,0,0.9);
          border: 2px solid #38bdf8;
          display: flex;
          align-items: center;
          justify-content: center;
        " id="camera-viewfinder-box">
          <video id="camera-video" autoplay playsinline muted style="
            width: 100%;
            height: 100%;
            object-fit: cover;
            transform: scaleX(-1);
          "></video>

          <!-- Circular Overlay Target Wajah -->
          <div style="
            position: absolute;
            inset: 0;
            pointer-events: none;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              width: 220px;
              height: 220px;
              border-radius: 50%;
              border: 2.5px dashed rgba(255, 255, 255, 0.85);
              box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.45);
            "></div>
            <span style="
              position: absolute;
              bottom: 24px;
              font-size: 11px;
              background: rgba(0, 0, 0, 0.65);
              padding: 3px 10px;
              border-radius: 12px;
              color: #e0f2fe;
              font-weight: 600;
            ">Lingkaran Wajah</span>
          </div>

          <div id="camera-loading-msg" style="
            position: absolute;
            font-size: 13px;
            color: #93c5fd;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 6px;
          ">
            Memuat kamera...
          </div>
        </div>

        <!-- Tombol Aksi Kontrol Kamera -->
        <div style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          margin-top: 18px;
        ">
          <!-- Tombol Switch Kamera (Depan / Belakang) -->
          <button id="camera-switch-btn" type="button" style="
            background: #2b2b36;
            border: 1px solid #475569;
            color: #cbd5e1;
            padding: 8px 12px;
            border-radius: 10px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 4px;
          " title="Ganti Kamera Depan / Belakang">
            🔄 Putar
          </button>

          <!-- Tombol Shutter Jepret (Tengah Menonjol) -->
          <button id="camera-shutter-btn" type="button" style="
            background: linear-gradient(135deg, #ef4444, #dc2626);
            border: 4px solid #ffffff;
            color: #ffffff;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 0 16px rgba(239, 68, 68, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            transition: transform 0.1s;
          " title="Jepret Foto">
            ⚪
          </button>

          <!-- Tombol Tutup / Batal -->
          <button id="camera-cancel-btn" type="button" style="
            background: #2b2b36;
            border: 1px solid #475569;
            color: #cbd5e1;
            padding: 8px 14px;
            border-radius: 10px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
          ">
            ✖ Batal
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.modalElement = modal;
    this.videoElement = modal.querySelector('#camera-video') as HTMLVideoElement;

    this.setupEvents(modal);
  }

  private setupEvents(modal: HTMLElement): void {
    const shutterBtn = modal.querySelector('#camera-shutter-btn') as HTMLButtonElement;
    const cancelBtn = modal.querySelector('#camera-cancel-btn') as HTMLButtonElement;
    const switchBtn = modal.querySelector('#camera-switch-btn') as HTMLButtonElement;

    // Tombol Jepret Foto
    shutterBtn.addEventListener('click', () => {
      shutterBtn.style.transform = 'scale(0.9)';
      setTimeout(() => {
        shutterBtn.style.transform = 'scale(1)';
        this.capturePhoto();
      }, 80);
    });

    // Tombol Batal
    cancelBtn.addEventListener('click', () => {
      this.close(null);
    });

    // Tombol Ganti Kamera
    switchBtn.addEventListener('click', () => {
      this.currentFacingMode = this.currentFacingMode === 'user' ? 'environment' : 'user';
      if (this.videoElement) {
        this.videoElement.style.transform = this.currentFacingMode === 'user' ? 'scaleX(-1)' : 'none';
      }
      this.startCameraStream();
    });
  }

  public open(): Promise<string | null> {
    return new Promise(async (resolve) => {
      this.resolvePromise = resolve;

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Browser Anda tidak mendukung akses kamera langsung. Silakan gunakan tombol Upload Foto.');
        this.close(null);
        return;
      }

      if (this.modalElement) {
        this.modalElement.style.display = 'flex';
      }

      const success = await this.startCameraStream();
      if (!success) {
        this.close(null);
      }
    });
  }

  private async startCameraStream(): Promise<boolean> {
    this.stopCameraStream();

    const loadingMsg = this.modalElement?.querySelector('#camera-loading-msg') as HTMLElement | null;
    if (loadingMsg) loadingMsg.style.display = 'flex';

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: this.currentFacingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.stream = stream;

      if (this.videoElement) {
        this.videoElement.srcObject = stream;
        await this.videoElement.play();
      }

      if (loadingMsg) loadingMsg.style.display = 'none';
      return true;
    } catch (err) {
      console.error('Gagal mengakses kamera:', err);
      alert('Tidak dapat mengakses kamera. Pastikan Anda telah memberikan izin (permission) akses kamera di browser.');
      return false;
    }
  }

  private stopCameraStream(): void {
    if (this.stream) {
      for (const track of this.stream.getTracks()) {
        try {
          track.stop();
        } catch {
          // ignore
        }
      }
      this.stream = null;
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
  }

  private capturePhoto(): void {
    if (!this.videoElement || !this.videoElement.videoWidth) {
      return;
    }

    const vw = this.videoElement.videoWidth;
    const vh = this.videoElement.videoHeight;

    const canvas = document.createElement('canvas');
    canvas.width = vw;
    canvas.height = vh;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      this.close(null);
      return;
    }

    // Jika kamera depan, mirror agar hasil foto sama persis seperti di cermin
    if (this.currentFacingMode === 'user') {
      ctx.translate(vw, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(this.videoElement, 0, 0, vw, vh);

    const snapshotDataUrl = canvas.toDataURL('image/png', 0.95);
    this.close(snapshotDataUrl);
  }

  private close(result: string | null): void {
    this.stopCameraStream();

    if (this.modalElement) {
      this.modalElement.style.display = 'none';
    }

    if (this.resolvePromise) {
      this.resolvePromise(result);
      this.resolvePromise = null;
    }
  }
}
