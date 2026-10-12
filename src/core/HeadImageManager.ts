// Pengelola Foto Kepala Kustom Stickman (HeadImageManager)
import { Storage } from './Storage';
import { FaceCropperModal } from '../ui/FaceCropperModal';
import { CameraCaptureModal } from '../ui/CameraCaptureModal';

export class HeadImageManager {
  private static instance: HeadImageManager | null = null;
  private imageElement: HTMLImageElement | null = null;
  private isLoaded = false;
  private listeners: Array<() => void> = [];

  private constructor() {
    this.reloadFromStorage();
  }

  public static getInstance(): HeadImageManager {
    if (!HeadImageManager.instance) {
      HeadImageManager.instance = new HeadImageManager();
    }
    return HeadImageManager.instance;
  }

  /**
   * Muat gambar dari data URL yang tersimpan di Storage
   */
  public reloadFromStorage(): void {
    const dataUrl = Storage.getCustomHeadImage();
    if (!dataUrl) {
      this.imageElement = null;
      this.isLoaded = false;
      return;
    }

    const img = new Image();
    img.onload = () => {
      this.imageElement = img;
      this.isLoaded = true;
      this.notifyListeners();
    };
    img.onerror = () => {
      console.warn('Gagal memuat foto kepala dari storage');
      this.imageElement = null;
      this.isLoaded = false;
    };
    img.src = dataUrl;
  }

  /**
   * Dapatkan elemen gambar jika siap di-render di canvas
   */
  public getImage(): HTMLImageElement | null {
    if (this.isLoaded && this.imageElement && this.imageElement.complete && this.imageElement.naturalWidth > 0) {
      return this.imageElement;
    }
    return null;
  }

  public hasCustomHead(): boolean {
    return this.getImage() !== null;
  }

  /**
   * Daftarkan listener saat foto kepala berubah
   */
  public addChangeListener(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      try {
        listener();
      } catch (err) {
        console.error('Error pada HeadImageManager listener:', err);
      }
    }
  }

  /**
   * Hapus foto kepala kustom dan kembali ke stickman original
   */
  public removeCustomHead(): void {
    Storage.setCustomHeadImage(null);
    this.imageElement = null;
    this.isLoaded = false;
    this.notifyListeners();
  }

  /**
   * Pemicu file picker bawaan OS
   */
  public triggerFileInput(): void {
    const input = document.getElementById('head-image-input') as HTMLInputElement | null;
    if (input) {
      input.click();
    }
  }

  /**
   * Pemicu foto langsung dari kamera / webcam lalu crop wajah HD
   */
  public async triggerCameraCapture(): Promise<boolean> {
    try {
      const capturedRawSrc = await CameraCaptureModal.getInstance().open();
      if (!capturedRawSrc) {
        return false;
      }

      // Langsung bawa hasil foto ke FaceCropperModal agar bisa di-crop wajahnya saja secara HD
      const croppedHdDataUrl = await FaceCropperModal.getInstance().open(capturedRawSrc);
      if (croppedHdDataUrl) {
        Storage.setCustomHeadImage(croppedHdDataUrl);
        this.reloadFromStorage();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error saat capture foto kamera:', err);
      return false;
    }
  }

  /**
   * Proses file gambar dari input: buka FaceCropperModal agar pengguna bisa
   * mengatur crop hanya bagian wajah dan mengekspor ke HD 512x512
   */
  public processAndSaveFile(file: File): Promise<boolean> {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) {
        alert('Harap pilih berkas foto gambar (JPG, PNG, WebP).');
        resolve(false);
        return;
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        const rawSrc = e.target?.result as string;
        if (!rawSrc) {
          resolve(false);
          return;
        }

        try {
          // Buka modal cropper interaktif untuk crop wajah HD
          const croppedHdDataUrl = await FaceCropperModal.getInstance().open(rawSrc);
          if (croppedHdDataUrl) {
            Storage.setCustomHeadImage(croppedHdDataUrl);
            this.reloadFromStorage();
            resolve(true);
          } else {
            resolve(false);
          }
        } catch (err) {
          console.error('Gagal saat memproses crop wajah:', err);
          resolve(false);
        }
      };
      reader.onerror = () => {
        alert('Gagal membaca berkas dari perangkat.');
        resolve(false);
      };
      reader.readAsDataURL(file);
    });
  }

  /**
   * Pasang listener change pada elemen input file
   */
  public setupFileInput(): void {
    if (typeof document === 'undefined') return;
    const input = document.getElementById('head-image-input') as HTMLInputElement | null;
    if (!input || (input as any)._hasHeadListener) return;
    (input as any)._hasHeadListener = true;

    input.addEventListener('change', async () => {
      const file = input.files?.[0];
      if (file) {
        await this.processAndSaveFile(file);
        input.value = '';
      }
    });
  }
}
