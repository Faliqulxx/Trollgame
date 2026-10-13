# PRD — Stickman: The Trap Door

| | |
|---|---|
| **Versi** | 1.1 |
| **Platform** | Web (Desktop & Mobile browser) |
| **Genre** | 2D Troll Platformer |
| **Tools Pengembangan** | Google Antigravity (agent-driven IDE) |
| **Status** | Revisi: perbaikan bug, level lebih panjang, jebakan baru |

### Changelog v1.1
- **Bug fix**: aturan baru anti-bug (bagian 4.6), terutama jebakan yang muncul di dalam lantai (bagian 5.3).
- **Level lebih panjang**: pintu keluar kini jauh dari spawn, level 4–10 kali lebih lebar (bagian 6.2–6.3).
- **Jebakan baru** T20–T27: lantai hilang saat diinjak, lantai peluncur + duri langit-langit, lantai meledak, dan lainnya (bagian 5 dan 5.2).
- Kriteria penerimaan, struktur kode, dan prompt Antigravity diperbarui (bagian 10–12).

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
3. Minimal **10 level** dengan kurva kesulitan yang meningkat, masing-masing **panjang** (jalur 3–8 layar lebar) dengan pintu keluar jauh dari titik awal.
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

### 4.6 Aturan Anti-Bug (Wajib)

Daftar ini dibuat dari bug yang umum muncul di game jenis ini. Agent harus memastikan semuanya terpenuhi dan menulis tes untuknya.

| # | Masalah | Aturan / Perbaikan |
|---|---|---|
| B1 | **Duri muncul terjebak di dalam lantai**, pemain lewat dengan aman | Duri yang muncul harus bergerak dari **bawah permukaan lantai ke atas permukaan** dan hitbox bahaya mengikuti ujung duri. Posisi akhir duri **harus di atas permukaan tile** (lihat 5.3). Hitbox aktif sejak ujung duri keluar dari permukaan. |
| B2 | Pemain tembus lantai/dinding | Tabrakan per sumbu (X lalu Y), sub-step saat kecepatan tinggi, `dt` di-clamp ≤ 1/30 s. |
| B3 | Jebakan tidak ter-reset setelah mati | Setiap jebakan wajib mengimplementasikan `reset()` yang mengembalikan semua state, timer, posisi, dan hitbox ke kondisi awal. |
| B4 | Pemain mati berkali-kali dalam satu frame / respawn ganda | State `DYING` hanya bisa dimasuki sekali; abaikan hazard sampai respawn selesai. |
| B5 | Hitbox tidak sama dengan visual | Hitbox bahaya tidak boleh lebih besar dari visual; hitbox pemain sedikit lebih kecil dari visual. Tersedia mode debug (`F2`) untuk menampilkan semua hitbox. |
| B6 | Pemicu zona aktif berkali-kali | Setiap pemicu punya flag `triggered`; hanya sekali per percobaan, di-reset saat respawn. |
| B7 | Pemain terjepit di dalam tile (platform bergerak/lantai muncul) | Jika pemain tumpang tindih dengan solid, dorong keluar ke sisi terdekat; jika tidak bisa, anggap **terhimpit** → mati. |
| B8 | Pemain "menempel" pada platform bergerak atau lantai yang naik | Saat pemain berdiri di platform, terapkan delta gerak platform ke pemain sebelum fisika pemain. |
| B9 | Urutan update membuat hasil tidak konsisten | Urutan tetap per frame: Input → Update trap → Update platform → Update pemain → Tabrakan solid → Cek hazard → Cek pintu/checkpoint → Kamera → Render. |
| B10 | Lompatan terlalu besar saat tab di-background | Pause otomatis saat tab hilang fokus; `dt` di-clamp. |
| B11 | Level tidak bisa diselesaikan (jebakan tidak adil / tidak ada jalur) | Setiap level wajib punya `solution` (daftar langkah/komentar) dan lolos **tes jangkauan** (lompatan maksimum tidak melebihi jarak platform; lihat 4.7). |
| B12 | Input macet (tombol "tertahan") setelah kehilangan fokus | Reset semua status input pada event `blur` dan `visibilitychange`. |

### 4.7 Batas Lompat (acuan desain level)
Dengan nilai fisika pada 4.2: tinggi lompat maksimum ≈ **118 px (~3,7 tile)**, jarak lompat horizontal maksimum ≈ **~170 px (~5 tile)** pada kecepatan penuh. Desain level **tidak boleh** meminta lompatan melebihi 85% batas ini kecuali ada platform bantu. Tulis helper `canJump(dx, dy)` di `physics/` dan gunakan di tes validasi level.

---

## 5. Katalog Jebakan

Setiap jebakan diimplementasikan sebagai kelas dengan antarmuka yang sama: `update(dt)`, `render(ctx)`, `reset()`, `getHitboxes()`, dan opsional `onPlayerEnterTrigger()`.

| ID | Nama | Perilaku | Pemicu | Tampak Jelas? |
|---|---|---|---|---|
| T01 | **Duri Statis** | Duri di lantai/dinding/langit-langit. Mematikan saat disentuh. | Selalu aktif | Ya |
| T02 | **Duri Muncul** | Duri **menyembul ke atas permukaan lantai** secara tiba-tiba (bukan terkubur di dalam lantai; lihat 5.3). | Pemain masuk zona pemicu | Tidak |
| T03 | **Lantai Runtuh** | Tile bergetar 0,4 s lalu jatuh. | Pemain menginjak | Samar (retak) |
| T04 | **Lantai Palsu / Lubang Tersembunyi** | Tampak seperti lantai biasa, tidak punya tabrakan solid sama sekali, pemain langsung jatuh. | Selalu / mendekat | Tidak |
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
| T20 | **Lantai Hilang Saat Diinjak** | Lantai tampak normal, lenyap **seketika** (atau ≤ 0,1 s) saat dipijak. Pemain jatuh ke jurang/duri bawah dan mati. | Pemain menginjak | Tidak |
| T21 | **Lantai Peluncur + Duri Langit-langit** | Lantai tiba-tiba meluncur ke atas membawa pemain; duri tiba-tiba muncul di langit-langit sehingga pemain tertusuk. | Pemain menginjak | Samar |
| T22 | **Lantai Meledak** | Lantai berkedip/berasap sebentar lalu meledak; pemain yang masih di atasnya atau terkena radius ledakan mati. | Pemain menginjak / timer | Samar |
| T23 | **Lantai Jadi Duri** | Lantai berubah menjadi duri tepat sesaat setelah pemain mendarat. | Pemain menginjak | Tidak |
| T24 | **Lantai Terbuka (Trapdoor)** | Dua daun lantai terbuka ke bawah seperti pintu jebakan. | Zona / injak | Samar |
| T25 | **Langit-langit Jatuh** | Blok langit-langit lepas dan jatuh saat pemain lewat di bawahnya. | Zona | Samar |
| T26 | **Lantai Lompat Terbalik (Spring Palsu)** | Pegas yang melontarkan pemain ke arah gergaji/duri, bukan ke platform. | Pemain menginjak | Ya (menipu) |
| T27 | **Lantai Bom Berantai** | Rangkaian lantai yang meledak berurutan mengikuti langkah pemain; pemain harus terus bergerak. | Pemain menginjak | Samar |

### 5.1 Prinsip Desain Jebakan ("Adil tapi Licik")
1. **Satu kejutan per kesempatan**: pemain boleh mati oleh jebakan baru, tetapi harus bisa menghindarinya di percobaan kedua.
2. **Ada petunjuk tersirat** untuk setiap jebakan tersembunyi (retakan kecil, bayangan, suara, tile sedikit berbeda, tulisan aneh).
3. **Tidak ada kematian instan tanpa jalan keluar**: setiap jebakan harus bisa dihindari dengan input yang wajar.
4. **Respawn cepat**: ulangi percobaan tanpa layar loading.
5. Jebakan mengajarkan pola; level lanjut **menggabungkan** pola yang sudah dikenal.

---

### 5.2 Spesifikasi Detail Jebakan Baru

Semua jebakan memakai state machine: `IDLE → ARMED → ACTIVE → DONE`, dan `reset()` selalu kembali ke `IDLE`.

#### T20 — Lantai Hilang Saat Diinjak
- **Visual**: identik dengan tile solid biasa (sedikit beda satu piksel/garis boleh sebagai petunjuk).
- **Perilaku**: pada frame pemain menyentuh bagian atas tile, tile berubah non-solid dalam ≤ 0,1 s dan efek serpihan kecil muncul. Pemain mulai jatuh dengan gravitasi normal.
- **Jatuh = mati**: di bawah tile harus ada **jurang** (lubang keluar batas bawah) atau **hazard** (duri/lava) sehingga kematian jelas. Lubang minimal 4 tile agar tidak bisa "diselamatkan" lompat balik.
- **Variasi**: `delay` 0 s (instan), 0,3 s (getar dulu), atau berkelompok (beberapa tile berurutan).
- **Reset**: tile kembali solid.

#### T21 — Lantai Peluncur + Duri Langit-langit
- **Visual**: platform kecil dengan tanda panah samar atau garis rel di sisi.
- **Urutan**: (1) pemain menginjak, (2) jeda 0,15 s, (3) platform meluncur ke **atas** dengan akselerasi cepat (kecepatan puncak ~900 px/s) membawa pemain, (4) saat platform mencapai ±60% jarak, **duri langit-langit** menyembul turun dari atap, (5) platform berhenti di bawah duri sehingga pemain tertusuk, atau pemain harus melompat menyamping untuk selamat jika ada celah (versi adil).
- **Aturan keadilan**: harus ada satu cara selamat, misalnya melompat keluar dari platform sebelum mencapai atap, atau ada celah tanpa duri di salah satu sisi.
- **Reset**: platform kembali ke posisi awal, duri kembali tersembunyi di atap.
- **Perhatikan**: gunakan penerapan delta platform ke pemain (B8) supaya pemain tidak tertinggal di udara.

#### T22 — Lantai Meledak
- **Fase**: `ARMED` (pemain menginjak) → **peringatan** 0,5–0,8 s (berkedip merah, asap, bunyi bip makin cepat) → `ACTIVE` ledakan.
- **Ledakan**: radius 48–64 px (hitbox lingkaran). Pemain di dalam radius mati; tile hancur menjadi partikel dan menjadi non-solid.
- **Efek**: layar goyang, kilatan putih singkat, serpihan terlempar, bunyi ledakan.
- **Adil**: waktu peringatan cukup bagi pemain yang langsung berlari/melompat untuk keluar dari radius.
- **Variasi**: ledakan memantulkan pemain ke atas (knockback) menuju duri.
- **Reset**: tile kembali utuh.

#### T23 — Lantai Jadi Duri
- Tile berubah menjadi duri 0,25 s setelah pemain mendarat. Hitbox bahaya aktif setelah transformasi; beri satu frame animasi kilat sebagai petunjuk. Pemain yang langsung melompat lagi bisa selamat.

#### T24 — Lantai Terbuka (Trapdoor)
- Dua daun tile berayun ke bawah (animasi 0,2 s) saat pemain berada di atas zona pemicu. Tabrakan solid hilang pada awal animasi.

#### T25 — Langit-langit Jatuh
- Blok di atap bergetar 0,3 s lalu jatuh dengan gravitasi; mematikan pemain yang tertimpa, lalu menjadi solid di lantai (bisa menjadi pijakan atau penghalang).

#### T26 — Pegas Palsu
- Pegas melontarkan pemain dengan kecepatan −1100 px/s menuju area bahaya. Petunjuk: pegas berwarna agak pucat atau bertanda "?".

#### T27 — Lantai Bom Berantai
- 4–8 tile meledak berurutan setiap 0,25 s mulai dari tile yang diinjak, maju searah gerak pemain. Pemain harus terus bergerak/lompat cepat. Sediakan platform aman di ujung.

### 5.3 Spesifikasi Duri Muncul (Perbaikan Bug "Duri di Dalam Lantai")

**Masalah**: duri yang dimaksudkan muncul tiba-tiba terkubur di dalam tile lantai sehingga hitbox bahaya berada di dalam area solid, dan pemain yang berjalan di atas lantai tidak pernah menyentuhnya.

**Aturan perbaikan**:
1. **Posisi dasar**: duri didefinisikan dengan `baseY` = koordinat **permukaan atas tile lantai** (bukan pusat atau dalam tile).
2. **Animasi**: tinggi duri `h` naik dari 0 ke `spikeHeight` (default 28 px) dalam 0,08 s (cepat). Ujung duri berada di `baseY - h`, jadi duri selalu bergerak **ke atas dari permukaan**.
3. **Gambar**: duri digambar **di atas** lapisan tile (layer render duri > layer tile), dengan *clip* di garis permukaan agar tampak muncul dari celah.
4. **Hitbox bahaya**: segitiga/persegi sempit dari `baseY` ke `baseY - h`, **di luar** area solid tile. Aktif ketika `h ≥ 30%` tinggi penuh.
5. **Celah pemicu**: tile lantai tempat duri muncul digambar dengan celah/garis tipis (petunjuk samar) atau diganti **tile khusus** `spikeTrapTile` yang tetap solid untuk pijakan tetapi punya slot duri.
6. **Zona pemicu** harus berada **sebelum** duri (pemain masuk zona → duri muncul beberapa tile di depan), bukan tepat di bawah kaki, agar bisa dihindari dengan lompat.
7. **Tes otomatis**: buat tes yang menempatkan pemain berdiri di atas `spikeTrapTile`, memicu duri, dan memastikan pemain mati (hitbox bahaya beririsan dengan hitbox pemain).
8. **Mode debug (F2)**: tampilkan hitbox bahaya dalam warna merah sehingga posisi duri mudah dicek visual.

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

> **Catatan:** contoh JSON di atas hanya ilustrasi format (ukuran diperkecil). Level sungguhan harus mengikuti ukuran minimum di 6.1a. Untuk jebakan baru gunakan tipe entitas `vanishingFloor`, `launcherFloor` (dengan `ceilingSpikes`), `explodingFloor`, `chainBomb`, dst.

### 6.1a Panjang Level & Jarak Pintu (Perubahan v1.1)

Level lama terlalu pendek sehingga pintu terlalu dekat. Aturan baru:

| Parameter | Nilai |
|---|---|
| Lebar level | **min. 150 tile (4.800 px)**; level akhir hingga **300 tile (9.600 px)** |
| Tinggi level | 17–34 tile (1–2 layar) boleh ada bagian vertikal |
| Jarak spawn → pintu | **min. 4 layar lebar** (≥ 3.800 px) di level 1–3, makin jauh di level berikutnya |
| Struktur | Bagi level menjadi **3–6 "bagian"** (section), tiap bagian memperkenalkan atau menggabungkan satu pola jebakan |
| Checkpoint | Satu setiap 1–2 bagian (± setiap 30–45 detik jalan), kecuali level final yang lebih jarang |
| Lanskap | Variasi: jalan datar, jurang, naik/turun, ruang vertikal, lorong sempit, agar tidak monoton |
| Pintu | Terlihat dari kejauhan di akhir (kecuali level troll tertentu), dengan jalur kembali tidak mungkin |

Kamera boleh memperlihatkan pintu lebih dulu (pan singkat di awal level) agar pemain tahu tujuannya jauh.

### 6.2 Daftar Level (minimal 10)

| # | Nama | Jebakan Baru | Konsep |
|---|---|---|---|
| 1 | Pintu Pertama | T01, T03, T20 | Tutorial panjang: gerak, lompat, duri, lantai retak, lantai hilang pertama (di jurang dangkal yang adil). |
| 2 | Jangan Percaya Lantai | T04, T02, T20, T23, T03, T06, T07, T13, T14, T18, T21, T22, T24, T25, T26, T27 | Gauntlet lantai penuh tipuan: lantai palsu, runtuh, hilang, duri muncul, peluncur, trapdoor, pilar tumbang, bom berantai, checkpoint palsu, hingga pintu palsu. |
| 3 | Roda Bergigi | T05, T09, T24 | Gergaji, platform bergerak, trapdoor, butuh timing. |
| 4 | Dari Atas! | T07, T10, T25 | Balok jatuh, meriam, langit-langit jatuh. Pemain belajar membaca pola. |
| 5 | Bendera Mencurigakan | T13, T12, T22 | Checkpoint palsu, tombol palsu, lantai meledak. |
| 6 | Naik Lalu Tertusuk | T21, T08, T06 | Lantai peluncur + duri langit-langit, dinding menutup, gergaji meluncur. |
| 7 | Terbalik | T16, T17, T26 | Gravitasi dan kontrol berubah, pegas palsu. |
| 8 | Laser Disko | T11, T27 + kombinasi | Ritme, lantai bom berantai, platform, dan gergaji bersamaan. |
| 9 | Pintu Itu Bohong | T14, T15, T18, T22 | Pintu keluar palsu dan kabur, ledakan di depan pintu. Pemain curiga pada semuanya. |
| 10 | Pintu Terakhir | Semua | Gabungan semua pola, level terpanjang (≥ 300 tile), final troll. |

### 6.3 Kurva Kesulitan
- Level 1–2: tutorial, rata-rata mati < 5 kali.
- Level 3–6: menengah, 5–20 kali.
- Level 7–10: sulit, 15–50 kali per level.
- Satu level dirancang selesai dalam **2–5 menit** jika tanpa mati (level 1–3 ≈ 2 menit, level 8–10 ≈ 4–5 menit), karena jalur kini lebih panjang.

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
│  │     ├─ VanishingFloor.ts     # T20
│  │     ├─ LauncherFloor.ts      # T21 (+ CeilingSpikes)
│  │     ├─ ExplodingFloor.ts     # T22, T27
│  │     └─ ... (sesuai katalog)
│  ├─ levels/
│  │  ├─ LevelLoader.ts
│  │  ├─ level01.json
│  │  └─ ... level10.json
│  ├─ physics/
│  │  ├─ Collision.ts         # AABB, tile collision
│  │  └─ Reach.ts             # canJump(dx,dy) untuk validasi level
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
   ├─ player.test.ts
   ├─ traps.test.ts        # spike muncul, lantai hilang, peluncur, ledakan, reset()
   └─ levels.test.ts       # panjang minimal, jarak pintu, jangkauan lompat, ada solusi
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
- Level 1–10 dapat diselesaikan (setiap level punya solusi yang dapat ditempuh) dan memenuhi panjang minimal pada 6.1a.
- **Duri muncul (T02)** selalu berada di atas permukaan lantai dan mematikan pemain yang berdiri di titiknya (tes otomatis + verifikasi visual dengan mode debug).
- **T20** menjatuhkan pemain ke area mati; **T21** membawa pemain naik lalu duri langit-langit muncul dan ada jalur selamat; **T22** meledak dengan peringatan dan radius sesuai spesifikasi.
- Seluruh aturan anti-bug B1–B12 (bagian 4.6) lolos.
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

### Fase 3b — Perbaikan Bug & Jebakan Baru (v1.1)
> Baca PRD.md bagian 4.6, 5.2, dan 5.3. Pertama, audit kode yang ada terhadap aturan B1–B12 dan buat daftar bug beserta penyebabnya. Perbaiki duri muncul (T02) sehingga selalu berada di atas permukaan lantai, tambahkan mode debug hitbox (F2), dan tambahkan tes otomatis. Kemudian implementasikan T20 (lantai hilang), T21 (lantai peluncur + duri langit-langit), T22 (lantai meledak), lalu T23–T27. Setelah itu jalankan game di browser dan beri bukti (rekaman/screenshot) tiap jebakan bekerja dan ter-reset saat respawn.

### Fase 4 — Konten Level
> Buat ulang level 1–10 mengikuti tabel bagian 6.2, aturan panjang bagian 6.1a (min. 150 tile, pintu jauh, 3–6 bagian, checkpoint berkala), dan prinsip desain bagian 5.1. Validasi dengan `levels.test.ts` (panjang, jarak pintu, jangkauan lompat) dan catat solusi singkat di JSON. Verifikasi setiap level dapat diselesaikan di browser.

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
| Level panjang terasa membosankan | Pemain berhenti | Bagi jadi bagian bervariasi, checkpoint berkala, kejutan di tiap bagian |
| Jebakan baru (T20–T27) terasa tidak adil | Frustrasi | Petunjuk samar, jalur selamat, waktu peringatan cukup, playtest |

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