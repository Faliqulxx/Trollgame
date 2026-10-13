// Test Suite Sistem Dialog Stickman (Dialogue System Tests)

import { describe, it, expect, beforeEach } from 'vitest';
import { DialogueManager } from '../src/dialogue/DialogueManager';
import { SpeechBubble } from '../src/dialogue/SpeechBubble';
import { DIALOGUE_DATA } from '../src/dialogue/dialogueData';
import { Storage } from '../src/core/Storage';
import { Player } from '../src/entities/Player';
import { Camera } from '../src/core/Camera';

describe('Dynamic Stickman Dialogue System', () => {
  let dialogueManager: DialogueManager;

  beforeEach(() => {
    Storage.setDialogueEnabled(true);
    Storage.setDialogueFrequency('normal');
    dialogueManager = new DialogueManager();
    dialogueManager.resetForNewLevel();
  });

  it('SpeechBubble harus mengaktifkan balon, mengetik teks, dan selesai setelah durasi', () => {
    const bubble = new SpeechBubble();
    expect(bubble.isActive).toBe(false);

    bubble.show('Halo dunia!', 2.0);
    expect(bubble.isActive).toBe(true);
    expect(bubble.fullText).toBe('Halo dunia!');

    // Update 0.1 detik: efek mengetik mulai berjalan
    bubble.update(0.1, 100, 100);
    expect(bubble.text.length).toBeGreaterThan(0);

    // Update hingga lewat durasi 2 detik
    bubble.update(2.5, 100, 100);
    expect(bubble.isActive).toBe(false);
  });

  it('onDeath harus memicu dialog kematian dan memiliki prioritas tertinggi', () => {
    // Munculkan dialog prioritas rendah dulu (misal idle)
    dialogueManager.triggerDialogue('IDLE', 6, 'Cepat gerak woi!');
    expect(dialogueManager.bubble.isActive).toBe(true);
    expect(dialogueManager.bubble.fullText).toBe('Cepat gerak woi!');

    // Kematian (Prioritas 1) harus memotong dialog idle seketika!
    dialogueManager.onDeath('spikes', 1);
    expect(dialogueManager.bubble.isActive).toBe(true);
    expect(dialogueManager.bubble.fullText).not.toBe('Cepat gerak woi!');
  });

  it('onDeath harus memicu dialog khusus saat mati 3 kali berturut-turut', () => {
    dialogueManager.onDeath('spikes', 3);
    expect(dialogueManager.bubble.fullText).toBe(DIALOGUE_DATA.BEHAVIORS.DEATH_STREAK_3);
  });

  it('onDeath harus memicu dialog khusus saat mati 10 kali dalam satu level', () => {
    dialogueManager.onDeath('spikes', 10);
    expect(dialogueManager.bubble.fullText).toBe(DIALOGUE_DATA.BEHAVIORS.DEATH_STREAK_10);
  });

  it('onRespawn harus memicu dialog sambutan nyawa baru', () => {
    dialogueManager.onRespawn();
    expect(dialogueManager.bubble.isActive).toBe(true);
    expect(dialogueManager.bubble.fullText.length).toBeGreaterThan(0);
  });

  it('onVictory harus memicu dialog kemenangan', () => {
    dialogueManager.onVictory(2);
    expect(dialogueManager.bubble.isActive).toBe(true);
    expect(dialogueManager.bubble.fullText.length).toBeGreaterThan(0);
  });

  it('tidak boleh menampilkan dialog jika dinonaktifkan di pengaturan Storage', () => {
    Storage.setDialogueEnabled(false);
    const triggered = dialogueManager.triggerDialogue('IDLE', 6, 'Tes dialog');
    expect(triggered).toBe(false);
    expect(dialogueManager.bubble.isActive).toBe(false);
  });

  it('deteksi idle harus memicu dialog saat pemain tidak bergerak selama 7 detik', () => {
    const player = new Player(100, 100);
    player.vx = 100; // Bergerak dulu sejenak
    const camera = new Camera();
    dialogueManager.update(0.1, player, [], null, false, camera);

    // Lalu berhenti diam selama 7 detik
    player.vx = 0;
    for (let i = 0; i < 70; i++) {
      dialogueManager.update(0.1, player, [], null, false, camera);
    }

    expect(dialogueManager.bubble.isActive).toBe(true);
  });
});
