import { describe, it, expect, beforeEach } from 'vitest';
import { AudioManager } from '../src/core/Audio';
import { Storage } from '../src/core/Storage';

describe('AudioManager Volume Control', () => {
  beforeEach(() => {
    Storage.updateSettings({ sfx: 0.8, music: 0.4 });
  });

  it('dapat mengecilkan volume dengan decreaseVolume()', () => {
    const audio = AudioManager.getInstance();
    audio.setVolume(0.8);
    expect(audio.getVolumePercent()).toBe(80);

    audio.decreaseVolume(0.2);
    expect(audio.getVolumePercent()).toBe(60);

    audio.decreaseVolume(0.5);
    expect(audio.getVolumePercent()).toBe(10);
  });

  it('dapat menaikkan volume dengan increaseVolume()', () => {
    const audio = AudioManager.getInstance();
    audio.setVolume(0.3);
    audio.increaseVolume(0.2);
    expect(audio.getVolumePercent()).toBe(50);
  });

  it('tidak dapat mengecilkan volume di bawah 0 (clamped)', () => {
    const audio = AudioManager.getInstance();
    audio.setVolume(0.1);
    audio.decreaseVolume(0.5);
    expect(audio.getVolumePercent()).toBe(0);
    expect(audio.getMuted()).toBe(true);
  });

  it('dapat memutar volume dengan cycleVolume()', () => {
    const audio = AudioManager.getInstance();
    audio.setVolume(1.0);
    audio.cycleVolume(); // 1.0 -> 0.8
    expect(audio.getVolumePercent()).toBe(80);

    audio.cycleVolume(); // 0.8 -> 0.5
    expect(audio.getVolumePercent()).toBe(50);

    audio.cycleVolume(); // 0.5 -> 0.2
    expect(audio.getVolumePercent()).toBe(20);

    audio.cycleVolume(); // 0.2 -> 0.0 (mute)
    expect(audio.getVolumePercent()).toBe(0);

    audio.cycleVolume(); // 0.0 -> 1.0 (100%)
    expect(audio.getVolumePercent()).toBe(100);
  });

  it('menyimpan volume yang diubah ke Storage', () => {
    const audio = AudioManager.getInstance();
    audio.setVolume(0.4);
    expect(Storage.getData().settings.sfx).toBe(0.4);
    expect(Storage.getData().settings.music).toBe(0.2);
  });
});
