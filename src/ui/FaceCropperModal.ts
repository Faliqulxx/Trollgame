// Modal Interaktif Crop Wajah Pemain (HD 512x512)

export class FaceCropperModal {
  private static instance: FaceCropperModal | null = null;
  private modalElement: HTMLElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private zoomSlider: HTMLInputElement | null = null;

  private image: HTMLImageElement | null = null;

  // Transformasi Foto
  private panX = 0;
  private panY = 0;
  private baseScale = 1;
  private userZoom = 1;

  // Drag State
  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private initialPanX = 0;
  private initialPanY = 0;

  // Dimensi Area Preview
  private readonly PREVIEW_SIZE = 320;
  private readonly CROP_RADIUS = 115; // Diameter 230px di preview

  private resolvePromise: ((dataUrl: string | null) => void) | null = null;

  private constructor() {
    this.createDom();
  }

  public static getInstance(): FaceCropperModal {
    if (!FaceCropperModal.instance) {
      FaceCropperModal.instance = new FaceCropperModal();
    }
    return FaceCropperModal.instance;
  }

  private createDom(): void {
    if (typeof document === 'undefined') return;

    // Buat elemen modal container
    const modal = document.createElement('div');
    modal.id = 'face-cropper-modal';
    modal.style.cssText = `
      display: none;
      position: fixed;
      inset: 0;
      z-index: 9999;
      background: rgba(10, 10, 16, 0.85);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      align-items: center;
      justify-content: center;
      font-family: 'Outfit', sans-serif;
      user-select: none;
      -webkit-user-select: none;
    `;

    modal.innerHTML = `
      <div style="
        background: #1e1e24;
        border: 2px solid #3b3b4a;
        box-shadow: 0 24px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.1);
        border-radius: 16px;
        width: 370px;
        max-width: 92vw;
        padding: 20px;
        color: #f3f4f6;
        display: flex;
        flex-direction: column;
        align-items: center;
        box-sizing: border-box;
      ">
        <div style="text-align: center; margin-bottom: 12px; width: 100%;">
          <h2 style="margin: 0; font-size: 19px; font-weight: 800; color: #ffffff; display: flex; align-items: center; justify-content: center; gap: 8px;">
            ✂️ CROP WAJAH (HD)
          </h2>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #9ca3af;">
            Geser foto & atur zoom agar pas di dalam lingkaran wajah
          </p>
        </div>

        <!-- Canvas Editor -->
        <div style="
          position: relative;
          width: 320px;
          height: 320px;
          border-radius: 12px;
          overflow: hidden;
          background: #111116;
          box-shadow: inset 0 0 20px rgba(0,0,0,0.8);
          border: 1px solid #333340;
          cursor: grab;
          touch-action: none;
        " id="cropper-canvas-box">
          <canvas id="cropper-canvas" width="320" height="320" style="display: block; width: 320px; height: 320px;"></canvas>
        </div>

        <!-- Slider Zoom & Reset -->
        <div style="width: 100%; margin-top: 14px; display: flex; flex-direction: column; gap: 6px;">
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #d1d5db;">
            <span style="font-weight: 600;">🔍 Atur Zoom:</span>
            <button id="cropper-reset-btn" type="button" style="
              background: none;
              border: none;
              color: #60a5fa;
              cursor: pointer;
              font-size: 11.5px;
              font-weight: 600;
              padding: 2px 6px;
            ">↺ Reset Posisi</button>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 14px; opacity: 0.7;">−</span>
            <input id="cropper-zoom-slider" type="range" min="0.5" max="3.5" step="0.02" value="1" style="
              flex: 1;
              cursor: pointer;
              accent-color: #3b82f6;
            " />
            <span style="font-size: 14px; opacity: 0.7;">+</span>
          </div>
        </div>

        <!-- Kualitas Output Badge -->
        <div style="
          margin-top: 10px;
          background: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.35);
          color: #34d399;
          font-size: 11px;
          font-weight: 600;
          padding: 4px 12px;
          border-radius: 20px;
        ">
          ✨ Kualitas Output: 512×512 HD Ultra-Clear
        </div>

        <!-- Tombol Aksi -->
        <div style="display: flex; gap: 10px; width: 100%; margin-top: 16px;">
          <button id="cropper-cancel-btn" type="button" style="
            flex: 1;
            padding: 10px 0;
            background: #2b2b36;
            border: 1px solid #444455;
            color: #d1d5db;
            border-radius: 8px;
            font-size: 13.5px;
            font-weight: 700;
            cursor: pointer;
            transition: background 0.15s;
          ">✖ Batal</button>
          <button id="cropper-confirm-btn" type="button" style="
            flex: 1.4;
            padding: 10px 0;
            background: #22c55e;
            border: 1px solid #16a34a;
            color: #ffffff;
            border-radius: 8px;
            font-size: 13.5px;
            font-weight: 800;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
            transition: filter 0.15s;
          ">✔ Pakai Wajah Ini</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.modalElement = modal;

    this.canvas = modal.querySelector('#cropper-canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d');
    this.zoomSlider = modal.querySelector('#cropper-zoom-slider') as HTMLInputElement;

    this.setupEvents(modal);
  }

  private setupEvents(modal: HTMLElement): void {
    const canvasBox = modal.querySelector('#cropper-canvas-box') as HTMLElement;
    const cancelBtn = modal.querySelector('#cropper-cancel-btn') as HTMLButtonElement;
    const confirmBtn = modal.querySelector('#cropper-confirm-btn') as HTMLButtonElement;
    const resetBtn = modal.querySelector('#cropper-reset-btn') as HTMLButtonElement;

    // Zoom Slider Event
    if (this.zoomSlider) {
      this.zoomSlider.addEventListener('input', () => {
        if (!this.zoomSlider) return;
        this.userZoom = parseFloat(this.zoomSlider.value);
        this.draw();
      });
    }

    // Reset Button
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.resetTransform();
        this.draw();
      });
    }

    // Mouse / Touch Drag Events
    canvasBox.addEventListener('pointerdown', (e) => {
      this.isDragging = true;
      canvasBox.style.cursor = 'grabbing';
      this.dragStartX = e.clientX;
      this.dragStartY = e.clientY;
      this.initialPanX = this.panX;
      this.initialPanY = this.panY;
      canvasBox.setPointerCapture(e.pointerId);
    });

    canvasBox.addEventListener('pointermove', (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.dragStartX;
      const dy = e.clientY - this.dragStartY;
      this.panX = this.initialPanX + dx;
      this.panY = this.initialPanY + dy;
      this.draw();
    });

    const endDrag = (e: PointerEvent) => {
      if (this.isDragging) {
        this.isDragging = false;
        canvasBox.style.cursor = 'grab';
        try {
          canvasBox.releasePointerCapture(e.pointerId);
        } catch {
          // ignore
        }
      }
    };

    canvasBox.addEventListener('pointerup', endDrag);
    canvasBox.addEventListener('pointercancel', endDrag);

    // Mouse Wheel Zoom
    canvasBox.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomStep = e.deltaY < 0 ? 0.08 : -0.08;
      this.userZoom = Math.max(0.5, Math.min(3.5, this.userZoom + zoomStep));
      if (this.zoomSlider) {
        this.zoomSlider.value = this.userZoom.toFixed(2);
      }
      this.draw();
    }, { passive: false });

    // Cancel Button
    cancelBtn.addEventListener('click', () => {
      this.close(null);
    });

    // Confirm Button (Crop ke HD 512x512)
    confirmBtn.addEventListener('click', () => {
      const hdDataUrl = this.exportHdCrop();
      this.close(hdDataUrl);
    });
  }

  private resetTransform(): void {
    if (!this.image) return;
    const imgW = this.image.naturalWidth;
    const imgH = this.image.naturalHeight;

    // Hitung base scale agar lingkaran crop (diameter 230px) terisi foto
    const cropDiameter = this.CROP_RADIUS * 2;
    const minSide = Math.min(imgW, imgH);
    this.baseScale = (cropDiameter * 1.1) / minSide;
    this.userZoom = 1;
    this.panX = 0;
    this.panY = 0;

    if (this.zoomSlider) {
      this.zoomSlider.value = '1';
    }
  }

  public open(imageSrc: string): Promise<string | null> {
    return new Promise((resolve) => {
      this.resolvePromise = resolve;

      const img = new Image();
      img.onload = () => {
        this.image = img;
        this.resetTransform();

        if (this.modalElement) {
          this.modalElement.style.display = 'flex';
        }
        this.draw();
      };
      img.onerror = () => {
        alert('Gagal memuat gambar untuk di-crop.');
        resolve(null);
      };
      img.src = imageSrc;
    });
  }

  private close(result: string | null): void {
    if (this.modalElement) {
      this.modalElement.style.display = 'none';
    }
    if (this.resolvePromise) {
      this.resolvePromise(result);
      this.resolvePromise = null;
    }
  }

  /**
   * Render editor preview dengan dark mask dan lingkaran pemotong
   */
  private draw(): void {
    if (!this.ctx || !this.image) return;
    const ctx = this.ctx;
    const w = this.PREVIEW_SIZE;
    const h = this.PREVIEW_SIZE;
    const cx = w / 2;
    const cy = h / 2;

    ctx.clearRect(0, 0, w, h);

    // Kualitas rendering tinggi
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // 1. Gambar foto dengan transformasi pan & scale
    ctx.save();
    ctx.translate(cx + this.panX, cy + this.panY);
    const totalScale = this.baseScale * this.userZoom;
    ctx.scale(totalScale, totalScale);

    const iw = this.image.naturalWidth;
    const ih = this.image.naturalHeight;
    ctx.drawImage(this.image, -iw / 2, -ih / 2, iw, ih);
    ctx.restore();

    // 2. Gambar overlay gelap di luar lingkaran (Circular Mask)
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.beginPath();
    ctx.rect(0, 0, w, h);
    ctx.arc(cx, cy, this.CROP_RADIUS, 0, Math.PI * 2, true); // counter-clockwise lubang
    ctx.fill();

    // 3. Garis Lingkar Panduan Crop (Cyan / Putih Halus)
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy, this.CROP_RADIUS, 0, Math.PI * 2);
    ctx.stroke();

    // Garis bidik / crosshair tipis di tengah (membantu menempatkan hidung/mata)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(cx - 16, cy);
    ctx.lineTo(cx + 16, cy);
    ctx.moveTo(cx, cy - 16);
    ctx.lineTo(cx, cy + 16);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.restore();
  }

  /**
   * Ekstrak hasil crop beresolusi HD 512x512 piksel dengan kejernihan maksimal
   */
  private exportHdCrop(): string {
    if (!this.image) return '';

    const hdSize = 512;
    const offscreen = document.createElement('canvas');
    offscreen.width = hdSize;
    offscreen.height = hdSize;
    const ctx = offscreen.getContext('2d');
    if (!ctx) return '';

    // Antialiasing kualitas HD
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const hdCx = hdSize / 2;
    const hdCy = hdSize / 2;

    // Rasio skala dari preview ke HD
    const ratio = (hdSize / 2) / this.CROP_RADIUS;

    ctx.save();
    // Klip melingkar pada canvas HD
    ctx.beginPath();
    ctx.arc(hdCx, hdCy, hdSize / 2, 0, Math.PI * 2);
    ctx.clip();

    // Hitung posisi foto yang setara di canvas HD
    ctx.translate(hdCx + this.panX * ratio, hdCy + this.panY * ratio);
    const totalScale = this.baseScale * this.userZoom * ratio;
    ctx.scale(totalScale, totalScale);

    const iw = this.image.naturalWidth;
    const ih = this.image.naturalHeight;
    ctx.drawImage(this.image, -iw / 2, -ih / 2, iw, ih);

    ctx.restore();

    // Ekspor PNG HD tanpa kompresi kehilangan detail
    return offscreen.toDataURL('image/png', 1.0);
  }
}
