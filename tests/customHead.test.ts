import { describe, it, expect, beforeEach } from 'vitest';
import { Storage } from '../src/core/Storage';
import { HeadImageManager } from '../src/core/HeadImageManager';
import { Player } from '../src/entities/Player';

describe('Custom Head Photo Feature', () => {
  beforeEach(() => {
    Storage.setCustomHeadImage(null);
  });

  it('harus menyimpan dan mengembalikan customHeadImage di Storage', () => {
    expect(Storage.getCustomHeadImage()).toBeNull();

    const dummyDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    Storage.setCustomHeadImage(dummyDataUrl);

    expect(Storage.getCustomHeadImage()).toBe(dummyDataUrl);

    Storage.setCustomHeadImage(null);
    expect(Storage.getCustomHeadImage()).toBeNull();
  });

  it('HeadImageManager harus menangani status hasCustomHead dan removeCustomHead', () => {
    const manager = HeadImageManager.getInstance();
    manager.removeCustomHead();

    expect(manager.hasCustomHead()).toBe(false);
    expect(manager.getImage()).toBeNull();
    expect(Storage.getCustomHeadImage()).toBeNull();
  });

  it('Player harus merender tanpa error dengan default doodle head', () => {
    const player = new Player(100, 100);
    const mockCtx = {
      save: () => {},
      restore: () => {},
      translate: () => {},
      scale: () => {},
      beginPath: () => {},
      arc: () => {},
      stroke: () => {},
      fill: () => {},
      moveTo: () => {},
      lineTo: () => {},
      clip: () => {},
      drawImage: () => {},
      strokeStyle: '',
      fillStyle: '',
      lineWidth: 1,
      lineCap: '',
      lineJoin: '',
      imageSmoothingEnabled: false,
      imageSmoothingQuality: 'low'
    } as unknown as CanvasRenderingContext2D;

    expect(() => player.render(mockCtx)).not.toThrow();
  });

  it('FaceCropperModal harus singleton dan dapat diakses dengan aman', async () => {
    const { FaceCropperModal } = await import('../src/ui/FaceCropperModal');
    expect(FaceCropperModal.getInstance()).toBeDefined();
  });

  it('CameraCaptureModal harus singleton dan dapat diakses dengan aman', async () => {
    const { CameraCaptureModal } = await import('../src/ui/CameraCaptureModal');
    expect(CameraCaptureModal.getInstance()).toBeDefined();
  });
});
