# PRD — Stickman: The Trap Door

| | |
|---|---|
| **Versi** | 1.0 |
| **Platform** | Web (Desktop & Mobile browser) |
| **Genre** | 2D Troll Platformer |
| **Tools Pengembangan** | Google Antigravity (agent-driven IDE) |
| **Status** | Draft siap eksekusi |

---

## 1. Ringkasan Produk

**Stickman: The Trap Door** adalah game web 2D troll platformer. Pemain mengendalikan karakter stickman untuk mencapai pintu keluar di setiap level. Rintangannya adalah jebakan: duri, lantai runtuh, lubang tersembunyi, gergaji bergerak, serta jebakan kejutan yang aktif saat pemain melewati area tertentu. Area yang tampak aman, bahkan pintu keluar itu sendiri, bisa menjadi bagian dari jebakan.

Inti pengalamannya adalah **trial-and-error yang adil**: pemain mati, belajar, mencoba lagi, dan merasa puas (atau tertawa) saat berhasil.

### 1.1 Tujuan Utama
- Pemain mencapai pintu keluar di setiap level dengan bertahan hidup dari semua jebakan.
- Pemain dituntut berpikir cermat, bukan hanya cepat. Tidak semua yang terlihat aman benar-benar aman.

### 1.2 Tujuan Produk
1. Game berjalan mulus (60 FPS) di browser modern tanpa instalasi.
2. Kontrol sederhana dan responsif (keyboard + sentuh).
3. Minimal **10 level** dengan kurva kesulitan yang meningkat.
4. Kematian terasa lucu dan cepat diulang (respawn < 1 detik), bukan membuat frustrasi.

### 1.3 Non-Goals (di luar cakupan v1.0)
- Multiplayer / leaderboard online.
- Level editor untuk pemain.
- Backend / akun pengguna.
- Monetisasi, iklan, atau in-app purchase.

---

## 2. Target Pengguna

- Pemain kasual usia 10–35 tahun yang menyukai game troll ala *Cat Mario*, *Trap Adventure*, dan *Level Devil*.
- Bermain singkat (sesi 5–15 menit), di desktop maupun HP.
- Toleransi tinggi terhadap kematian berulang, selama kontrol terasa adil.

---

## 3. Tech Stack (Rekomendasi untuk Antigravity)

| Komponen | Pilihan | Alasan |
|---|---|---|
| Bahasa | **TypeScript** | Aman tipe, mudah di-refactor oleh agent |
| Build tool | **Vite** | Cepat, setup minimal |
| Rendering | **HTML5 Canvas 2D** (tanpa engine) | Ringan, kontrol penuh, cocok untuk stickman vektor |
| Audio | **Web Audio API** (efek suara disintesis lewat kode) | Tanpa aset eksternal, ukuran kecil |
| Penyimpanan | **localStorage** | Progres level, jumlah kematian, pengaturan |
| Testing | **Vitest** (unit) + verifikasi browser lewat agent Antigravity | Logika fisika & tabrakan bisa diuji |
| Deploy | Static hosting (GitHub Pages / Netlify / Vercel) | Tanpa server |

> **Catatan:** Jika ingin lebih cepat, boleh menggunakan JavaScript murni. Struktur modul di bawah tetap berlaku.

---

## 4. Gameplay & Mekanik Inti

### 4.1 Kontrol

| Aksi | Keyboard | Sentuh (Mobile) |
|---|---|---|
| Kiri / Kanan | `←` `→` atau `A` `D` | Tombol virtual kiri/kanan |
| Lompat | `Space`, `↑`, atau `W` | Tombol virtual lompat |
| Restart level | `R` | Tombol restart di HUD |
| Jeda | `Esc` atau `P` | Tombol jeda di HUD |

### 4.2 Fisika Karakter (nilai awal, mudah di-tweak lewat `config.ts`)

| Parameter | Nilai Awal |
|---|---|
| Ukuran hitbox | 18 × 40 px (sedikit lebih kecil dari visual agar adil) |
| Kecepatan jalan maksimum | 260 px/s |
| Akselerasi / friksi | 1800 / 2200 px/s² |
| Gravitasi | 2200 px/s² |
| Kecepatan lompat | −720 px/s |
| Kecepatan jatuh maksimum | 1000 px/s |
| **Coyote time** | 0.10 s (masih bisa lompat sesaat setelah meninggalkan tepi) |
| **Jump buffer** | 0.12 s (input lompat sebelum mendarat tetap dihitung) |
| Variable jump | Lepas tombol saat naik memotong lompatan (kecepatan × 0.5) |

> Coyote time dan jump buffer **wajib ada**. Dalam game troll, kontrol harus terasa adil agar kematian terasa seperti salah jebakan, bukan salah kontrol.

### 4.3 Siklus Permainan
1. Pemain masuk level pada titik **spawn**.
2. Bergerak, melompat, dan menghindari jebakan menuju **pintu keluar**.
3. Jika terkena jebakan → animasi mati singkat (~0.6 s) → respawn di **spawn** atau **checkpoint** terakhir. Jebakan yang sudah aktif **kembali ke kondisi awal** kecuali ditandai persisten.
4. Menyentuh pintu keluar yang valid → level selesai → layar hasil → level berikutnya.

### 4.4 Checkpoint
- Berupa bendera kecil. Aktif saat disentuh pemain.
- Checkpoint **bisa juga menjadi jebakan** pada level lanjut (lihat katalog jebakan).
- Progres checkpoint hanya berlaku selama sesi level; tidak disimpan setelah keluar ke menu.

### 4.5 Kondisi Mati
- Bersentuhan dengan hazard (duri, gergaji, laser, dll.).
- Jatuh keluar batas bawah level.
- Terhimpit (platform bergerak/dinding menutup).

---

## 5. Katalog Jebakan

Setiap jebakan diimplementasikan sebagai kelas dengan antarmuka yang sama: `update(dt)`, `render(ctx)`, `reset()`, `getHitboxes()`, dan opsional `onPlayerEnterTrigger()`.

| ID | Nama | Perilaku | Pemicu | Tampak Jelas? |
|---|---|---|---|---|
| T01 | **Duri Statis** | Duri di lantai/dinding/langit-langit. Mematikan saat disentuh. | Selalu aktif | Ya |
| T02 | **Duri Muncul** | Duri keluar dari lantai secara tiba-tiba. | Pemain masuk zona pemicu | Tidak |
| T03 | **Lantai Runtuh** | Tile bergetar 0,4 s lalu jatuh. | Pemain menginjak | Samar (retak) |
| T04 | **Lantai Palsu / Lubang Tersembunyi** | Tampak seperti lantai biasa, langsung hilang. | Pemain menginjak / mendekat | Tidak |
| T05 | **Gergaji Bergerak** | Roda gergaji bergerak sepanjang jalur horizontal/vertikal/sirkular. | Selalu aktif | Ya |
| T06 | **Gergaji Meluncur** | Gergaji tersembunyi meluncur cepat dari luar layar. | Pemain melewati garis tertentu | Tidak |
| T07 | **Balok Menghimpit (Thwomp)** | Balok jatuh cepat ke bawah, lalu naik pelan. | Pemain di bawahnya | Ya |
| T08 | **Dinding Menutup** | Dinding bergerak menutup jalan/menghimpit. | Zona pemicu | Tidak |
| T09 | **Platform Bergerak** | Platform bergerak; ada yang jatuh/menghilang saat diinjak. | Selalu / saat diinjak | Ya |
| T10 | **Panah / Peluru** | Meriam menembak proyektil dengan interval atau saat dipicu. | Interval / zona | Ya / Tidak |
| T11 | **Laser** | Laser aktif–nonaktif dengan pola ritme. | Timer | Ya |
| T12 | **Tombol Palsu** | Tombol "aman" yang justru mengaktifkan jebakan. | Pemain menginjak | Ya (menipu) |
| T13 | **Checkpoint Palsu** | Bendera checkpoint yang saat disentuh memicu jebakan. | Pemain menyentuh | Ya (menipu) |
| T14 | **Pintu Palsu** | Pintu keluar yang meledak / menjatuhkan duri / kabur saat didekati. | Pemain mendekat | Ya (menipu) |
| T15 | **Pintu Kabur** | Pintu bergeser menjauh saat pemain mendekat. | Jarak < N px | Ya (menipu) |
| T16 | **Gravitasi Balik** | Zona yang membalik gravitasi sementara. | Zona | Samar |
| T17 | **Kontrol Terbalik** | Zona yang membalik kiri/kanan beberapa detik. | Zona | Tidak |
| T18 | **Blok Tak Terlihat** | Blok yang menghalangi lompatan atau menjadi pijakan tersembunyi. | Selalu | Tidak |
| T19 | **Teks Menipu** | Papan bertuliskan "Aman →" yang mengarah ke jebakan. | Narasi | Ya (menipu) |

### 5.1 Prinsip Desain Jebakan ("Adil tapi Licik")
1. **Satu kejutan per kesempatan**: pemain boleh mati oleh jebakan baru, tetapi harus bisa menghindarinya di percobaan kedua.
2. **Ada petunjuk tersirat** untuk setiap jebakan tersembunyi (retakan kecil, bayangan, suara, tile sedikit berbeda, tulisan aneh).
3. **Tidak ada kematian instan tanpa jalan keluar**: setiap jebakan harus bisa dihindari dengan input yang wajar.
4. **Respawn cepat**: ulangi percobaan tanpa layar loading.
5. Jebakan mengajarkan pola; level lanjut **menggabungkan** pola yang sudah dikenal.

---

## 6. Desain Level

### 6.1 Format Level
Level didefinisikan sebagai data (JSON) agar mudah ditambah oleh agent tanpa mengubah engine.

```json
{
  "id": 1,
  "name": "Pintu Pertama",
  "tileSize": 32,
  "grid": [
    "..............................",
    "..............................",
    "......................D.......",
    "P.........###.......#####.....",
    "#####..........................",
    "##############################"
  ],
  "legend": { "#": "solid", ".": "empty", "P": "spawn", "D": "exit" },
  "entities": [
    { "type": "spikes", "x": 10, "y": 5, "w": 3 },
    { "type": "crumble", "x": 14, "y": 5, "w": 2 },
    { "type": "hiddenSpike", "x": 20, "y": 5, "trigger": { "x": 18, "y": 4, "w": 2, "h": 2 } }
  ],
  "checkpoints": [{ "x": 12, "y": 4 }],
  "signs": [{ "x": 3, "y": 4, "text": "Aman! Percayalah." }],
  "deathMessages": ["Itu tadi duri.", "Kamu yakin?"]
}
```

### 6.2 Daftar Level (minimal 10)

| # | Nama | Jebakan Baru | Konsep |
|---|---|---|---|
| 1 | Pintu Pertama | T01, T03 | Tutorial: gerak, lompat, duri, lantai retak. Hampir tanpa trik. |
| 2 | Jangan Percaya Lantai | T04, T02 | Lantai palsu dan duri muncul. Pertama kali pemain dikhianati. |
| 3 | Roda Bergigi | T05, T09 | Gergaji dan platform bergerak, butuh timing. |
| 4 | Dari Atas! | T07, T10 | Balok jatuh dan meriam. Pemain belajar membaca pola. |
| 5 | Bendera Mencurigakan | T13, T12 | Checkpoint dan tombol palsu. |
| 6 | Dinding Lapar | T08, T06 | Jebakan zona yang memburu pemain. |
| 7 | Terbalik | T16, T17 | Gravitasi dan kontrol berubah. |
| 8 | Laser Disko | T11 + kombinasi | Ritme, platform, dan gergaji bersamaan. |
| 9 | Pintu Itu Bohong | T14, T15, T18 | Pintu keluar palsu dan kabur. Pemain curiga pada semuanya. |
| 10 | Pintu Terakhir | Semua | Gabungan semua pola, durasi lebih panjang, final troll. |

### 6.3 Kurva Kesulitan
- Level 1–2: tutorial, rata-rata mati < 5 kali.
- Level 3–6: menengah, 5–20 kali.
- Level 7–10: sulit, 15–50 kali per level.
- Satu level dirancang selesai dalam **30–120 detik** jika tanpa mati.

---

## 7. Fitur & Kebutuhan Fungsional

### 7.1 Prioritas MVP (P0)
- [ ] Game loop fixed timestep (60 Hz update, render dengan interpolasi).
- [ ] Karakter stickman dengan gerak, lompat, coyote time, jump buffer.
- [ ] Deteksi tabrakan AABB terhadap tile dan entitas.
- [ ] Level loader dari JSON.
- [ ] Spawn, kematian, respawn, checkpoint.
- [ ] Pintu keluar dan transisi level.
- [ ] Jebakan: T01, T02, T03, T04, T05, T09.
- [ ] Layar: Menu Utama, Pilih Level, Game, Jeda, Level Selesai.
- [ ] Penyimpanan progres & jumlah kematian (localStorage).
- [ ] Kontrol keyboard.

### 7.2 Prioritas Tinggi (P1)
- [ ] Sisa jebakan: T06–T19.
- [ ] Kontrol sentuh untuk mobile + layout responsif.
- [ ] Efek suara dan musik latar sintetis.
- [ ] Animasi stickman lengkap (diam, lari, lompat, jatuh, mati).
- [ ] Partikel (debu, percikan saat mati, serpihan lantai).
- [ ] Pesan kematian lucu / narator sarkastik.
- [ ] Layar game over/akhir (ending) dengan statistik.

### 7.3 Prioritas Rendah (P2)
- [ ] Mode "Speedrun" dengan timer per level.
- [ ] Pencapaian (misalnya "Mati 100 kali", "Selesai tanpa mati").
- [ ] Opsi aksesibilitas (kurangi layar goyang, kontras tinggi).
- [ ] PWA agar bisa di-install dan main offline.
- [ ] Pilihan bahasa (ID/EN).

---

## 8. UI / UX

### 8.1 Layar
1. **Menu Utama**: Judul, Main, Pilih Level, Pengaturan, Tentang.
2. **Pilih Level**: grid 10 level, level terkunci diberi ikon gembok, tampil jumlah kematian per level.
3. **Game (HUD)**: nomor level, jumlah kematian, tombol jeda & restart. HUD minimalis, tidak menutupi area bermain.
4. **Jeda**: Lanjut, Restart, Menu.
5. **Level Selesai**: waktu, jumlah kematian, tombol Berikutnya.
6. **Ending**: ucapan selamat sarkastik + total kematian.

### 8.2 Arah Visual
- **Gaya**: minimalis, garis tebal hitam di atas latar putih/krem bergaya sketsa kertas.
- **Palet**: hitam, putih, abu; aksen **merah** untuk bahaya, **hijau** untuk pintu/checkpoint, **kuning** untuk petunjuk.
- **Stickman**: digambar prosedural (kepala lingkaran + garis badan/anggota) agar animasi mudah lewat sudut sendi. Tanpa aset gambar.
- **Resolusi logis**: 960 × 540 (16:9), diskalakan dengan menjaga rasio (letterbox).
- **Kamera**: mengikuti pemain dengan *smoothing*, dibatasi tepi level.

### 8.3 Umpan Balik Kematian
- Layar goyang singkat, stickman terpecah jadi segmen garis, bunyi "pop" lucu.
- Teks pesan kematian acak muncul sekitar 1 detik (misal: "Itu tadi duri.", "Pintunya bohong.").
- Respawn instan setelah animasi selesai.

---

## 9. Audio

Semua disintesis dengan Web Audio API (osilator + envelope), tanpa file audio.

| Peristiwa | Karakter Suara |
|---|---|
| Lompat | Nada naik pendek |
| Mendarat | Thud rendah pendek |
| Mati | Pop/boing lucu |
| Lantai runtuh | Gemuruh noise |
| Jebakan muncul | Stinger tajam |
| Checkpoint | Dua nada naik ceria |
| Level selesai | Arpeggio kemenangan |
| Musik latar | Loop chiptune sederhana, bisa dimatikan |

Pengaturan: volume SFX, volume musik, mute. Audio baru aktif setelah interaksi pertama pengguna (kebijakan autoplay browser).

---

## 10. Arsitektur Teknis

### 10.1 Struktur Folder

```
stickman-trap-door/
├─ index.html
├─ package.json
├─ vite.config.ts
├─ tsconfig.json
├─ PRD.md
├─ src/
│  ├─ main.ts                 # entry point
│  ├─ config.ts               # semua konstanta fisika & game
│  ├─ core/
│  │  ├─ Game.ts              # game loop, state machine
│  │  ├─ Input.ts             # keyboard + touch
│  │  ├─ Camera.ts
│  │  ├─ Audio.ts             # sintesis SFX & musik
│  │  ├─ Storage.ts           # localStorage wrapper
│  │  └─ Particles.ts
│  ├─ entities/
│  │  ├─ Player.ts
│  │  ├─ Door.ts
│  │  ├─ Checkpoint.ts
│  │  └─ traps/
│  │     ├─ Trap.ts           # base class / interface
│  │     ├─ Spikes.ts
│  │     ├─ HiddenSpikes.ts
│  │     ├─ CrumbleTile.ts
│  │     ├─ FakeFloor.ts
│  │     ├─ Saw.ts
│  │     ├─ MovingPlatform.ts
│  │     └─ ... (sesuai katalog)
│  ├─ levels/
│  │  ├─ LevelLoader.ts
│  │  ├─ level01.json
│  │  └─ ... level10.json
│  ├─ physics/
│  │  └─ Collision.ts         # AABB, tile collision
│  ├─ ui/
│  │  ├─ Menu.ts
│  │  ├─ LevelSelect.ts
│  │  ├─ HUD.ts
│  │  └─ TouchControls.ts
│  └─ scenes/
│     ├─ MenuScene.ts
│     ├─ GameScene.ts
│     └─ EndScene.ts
└─ tests/
   ├─ collision.test.ts
   └─ player.test.ts
```

### 10.2 State Machine Game
`BOOT → MENU → LEVEL_SELECT → PLAYING ⇄ PAUSED → DYING → PLAYING → LEVEL_COMPLETE → (PLAYING | ENDING)`

### 10.3 Skema Penyimpanan (localStorage key `stickman_trapdoor_save`)

```json
{
  "version": 1,
  "unlockedLevel": 3,
  "levels": {
    "1": { "completed": true, "bestTime": 41.2, "deaths": 4 }
  },
  "totalDeaths": 27,
  "settings": { "sfx": 0.8, "music": 0.5, "language": "id" }
}
```

### 10.4 Performa & Kompatibilitas
- Target 60 FPS di laptop menengah dan HP Android menengah.
- Hindari alokasi objek per frame (object pooling untuk partikel).
- Browser: Chrome, Edge, Firefox, Safari versi 2 rilis terakhir.
- Ukuran build < 1 MB (tanpa aset eksternal).
- Hanya render objek yang terlihat kamera (culling).

---

## 11. Kriteria Penerimaan (Acceptance Criteria)

**Gameplay**
- Pemain bisa berjalan, melompat, dan mendarat dengan kontrol responsif; coyote time & jump buffer berfungsi.
- Semua jebakan di katalog berfungsi sesuai deskripsi dan kembali normal setelah respawn.
- Level 1–10 dapat diselesaikan (setiap level punya solusi yang dapat ditempuh).
- Respawn setelah mati terjadi dalam ≤ 1 detik.

**Teknis**
- `npm run dev` menjalankan game tanpa error di console.
- `npm run build` menghasilkan build statis yang jalan di hosting statis.
- Tes unit untuk tabrakan dan fisika pemain lulus.
- Game tetap berjalan saat tab kehilangan fokus lalu kembali (tanpa lompatan `dt` besar; `dt` di-clamp).

**UX**
- Dapat dimainkan penuh dengan keyboard saja dan dengan sentuh saja.
- Progres tersimpan dan terbaca ulang setelah refresh halaman.
- Layout menyesuaikan layar HP portrait/landscape (disarankan landscape; tampilkan petunjuk putar layar).

---

## 12. Rencana Implementasi untuk Antigravity

Antigravity bekerja paling baik dengan tugas yang terukur per fase. Berikan satu fase per tugas ke agent, lalu verifikasi sebelum lanjut. Minta agent menjalankan game di browser dan memberi bukti (screenshot/rekaman) pada tiap fase.

### Fase 0 — Setup
> Buat proyek Vite + TypeScript sesuai struktur folder di PRD.md bagian 10.1. Siapkan `config.ts`, game loop fixed timestep 60 Hz, canvas 960×540 yang diskalakan menjaga rasio. Tampilkan latar dan teks "Stickman: The Trap Door". Pastikan `npm run dev` berjalan.

### Fase 1 — Pemain & Fisika
> Implementasikan `Player` dengan gerak, gravitasi, lompat variabel, coyote time, jump buffer sesuai bagian 4.2. Tambahkan tabrakan AABB terhadap tile solid dan unit test di `tests/`. Gambar stickman prosedural dengan animasi diam/lari/lompat/jatuh.

### Fase 2 — Level Loader & Inti Gameplay
> Buat `LevelLoader` untuk format JSON bagian 6.1, spawn, pintu keluar, checkpoint, kamera mengikuti pemain, kematian & respawn. Buat level 1 dengan T01 dan T03.

### Fase 3 — Katalog Jebakan
> Implementasikan jebakan T01–T19 dengan antarmuka `Trap` yang sama (bagian 5). Kerjakan bertahap: statis → bergerak → pemicu zona → menipu (T12–T15) → modifikasi dunia (T16–T18). Tambahkan satu level demo per kelompok jebakan.

### Fase 4 — Konten Level
> Buat level 2–10 mengikuti tabel bagian 6.2 dan prinsip desain bagian 5.1. Verifikasi setiap level dapat diselesaikan; catat solusi singkat di komentar JSON.

### Fase 5 — UI, Audio, Polish
> Tambahkan menu, pilih level, HUD, jeda, layar selesai, ending. Sintesis SFX & musik dengan Web Audio. Tambahkan partikel, layar goyang, pesan kematian, penyimpanan progres.

### Fase 6 — Mobile & Rilis
> Tambahkan kontrol sentuh, optimasi performa, uji di ukuran layar berbeda, siapkan `npm run build` dan panduan deploy ke hosting statis. (Opsional: PWA.)

### Tips Penggunaan Antigravity
- Taruh `PRD.md` di root proyek agar agent selalu merujuknya.
- Minta agent **membuat rencana (plan/artifact) dulu** sebelum menulis kode pada fase besar.
- Minta agent menguji game di browser bawaan dan melampirkan bukti visual.
- Simpan semua angka penyeimbang di `config.ts`, jadi penyetelan tidak perlu menyentuh logika.
- Kerjakan level dan jebakan sebagai **data + kelas kecil**, bukan kode khusus per level.

---

## 13. Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Jebakan terasa tidak adil | Pemain berhenti main | Prinsip 5.1, petunjuk tersirat, playtest tiap level |
| Kontrol kurang responsif di mobile | Frustrasi | Coyote time, jump buffer, tombol sentuh besar, uji di perangkat nyata |
| `dt` besar saat tab di-background | Pemain tembus lantai | Clamp `dt` ≤ 1/30 s, fixed timestep |
| Tunneling (tembus dinding pada kecepatan tinggi) | Bug tabrakan | Gerak per sumbu + sub-step |
| Audio diblokir autoplay | Tanpa suara | Inisialisasi audio pada interaksi pertama |
| Cakupan membesar | Jadwal molor | Patuhi prioritas P0 → P1 → P2 |

---

## 14. Metrik Keberhasilan

- Level 1 diselesaikan oleh ≥ 90% pemain baru.
- Rata-rata sesi ≥ 8 menit.
- Setidaknya 50% pemain yang menyelesaikan Level 3 lanjut ke Level 5.
- Tidak ada error console kritis pada Chrome, Firefox, Safari, dan Edge.
- Frame rate stabil ≥ 55 FPS di perangkat target.

---

## 15. Glosarium

- **Troll platformer**: platformer yang sengaja menipu ekspektasi pemain.
- **Coyote time**: jeda singkat setelah meninggalkan tepi di mana lompat masih diizinkan.
- **Jump buffer**: input lompat sesaat sebelum mendarat tetap dieksekusi saat mendarat.
- **AABB**: Axis-Aligned Bounding Box, kotak tabrakan sejajar sumbu.
- **Fixed timestep**: logika game diperbarui dengan interval tetap agar fisika konsisten.
