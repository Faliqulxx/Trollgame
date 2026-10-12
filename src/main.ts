// Entry Point: Stickman — The Trap Door (PRD Bagian 10.1)

import { Game } from './core/Game';
import { HeadImageManager } from './core/HeadImageManager';

window.addEventListener('DOMContentLoaded', () => {
  try {
    HeadImageManager.getInstance().setupFileInput();
    const game = new Game('gameCanvas');
    game.start();
    console.log('🎮 Stickman: The Trap Door v1.0 berhasil dimuat dan siap dimainkan!');
  } catch (error) {
    console.error('Terjadi kesalahan saat memuat game:', error);
  }
});
