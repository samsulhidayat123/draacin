# Gudang Film Stabilization Checklist

Dokumen ini berisi daftar pekerjaan yang perlu diselesaikan agar sistem normal, aman, dan siap deploy.

## Status Saat Ini

- Total data dari MongoDB app: 212 item.
- Semua item saat ini bersumber dari `idflix`.
- Pembagian tipe:
  - `movie`: 126
  - `kdrama`: 61
  - `series`: 24
  - `anime`: 1
- Hasil player terakhir:
  - Movie dengan server tersimpan: 125
  - Non-movie dengan episode tersimpan: 86
  - Movie tanpa server: 1

## Prioritas 1: Normalisasi Data

- [x] Pastikan semua item memiliki `_id`, `target_id`, `slug`, `title`, `type`, `source`, dan `poster`.
- [x] Tambahkan field `playable` untuk menandai item yang punya server aktif.
- [x] Tambahkan field `playbackStatus`, misalnya `available`, `missing_source`, `no_server`, `blocked`, atau `unknown`.
- [x] Tambahkan field `lastCheckedAt` untuk audit status player.
- [x] Pastikan `type` hanya berisi nilai valid: `movie`, `series`, `kdrama`, `anime`.

Catatan eksekusi:

- Script normalisasi: `npm run normalize:movies`.
- Hasil terakhir:
  - Total dicek: 182
  - `available`: 125
  - `missing_source`: 56
  - `no_server`: 1
  - Field wajib kosong/invalid: 0

## Prioritas 2: Routing Berdasarkan Tipe

- [x] Ubah card/detail supaya `movie` masuk ke `/movie/[slug]`.
- [x] Buat detail khusus untuk `series`, `kdrama`, dan `anime`.
- [x] Jangan arahkan semua item ke `/watch/movie/[id]`.
- [x] Untuk item non-movie, tampilkan daftar season/episode sebelum masuk player.

Catatan eksekusi:

- Route detail aktif:
  - `/movie/[slug]`
  - `/series/[slug]`
  - `/kdrama/[slug]`
  - `/anime/[slug]`
- Non-movie sekarang punya route detail masing-masing.
- Route player episode asli sudah dikerjakan di Prioritas 4.

## Prioritas 3: Player Movie

- [x] Pertahankan whitelist embed host.
- [x] Simpan daftar server yang berhasil diparse ke MongoDB.
- [x] Tampilkan server terbaik lebih dulu: `ST`, `TVP`, `VDZ`, `MD`, lalu `HYDRAX`.
- [x] Tampilkan status jelas kalau server kosong atau sumber 404.
- [x] Tambahkan tombol refresh/check ulang server per item.

Catatan eksekusi:

- Field baru/terpakai di MongoDB:
  - `playbackServers`
  - `playbackSourceUrl`
  - `playable`
  - `playbackStatus`
  - `lastCheckedAt`
- Endpoint refresh movie: `POST /api/movies/[id]/playback`.
- Semua movie dengan status `available` sudah punya `playbackServers`: 125/125.
- Watch movie sekarang memakai `playbackServers` tersimpan sebelum fallback cek live.

## Prioritas 4: Player Series, Kdrama, Anime

- [x] Tentukan sumber watch/API yang benar untuk episode non-movie.
- [x] Buat struktur episode di MongoDB.
- [x] Buat route watch per tipe:
  - [x] `/watch/series/[id]/[season]/[episode]`
  - [x] `/watch/kdrama/[id]/[episode]`
  - [x] `/watch/anime/[id]/[episode]`
- [x] Buat UI pilih season dan episode.
- [x] Pastikan episode yang tidak punya server tidak menampilkan tombol play palsu.

Catatan eksekusi:

- Sumber episode idflix:
  - Series detail: `https://idflix.my.id/series/[slug]`
  - Kdrama detail: `https://idflix.my.id/kdrama/[slug]`
  - Anime detail: `https://idflix.my.id/anime/[slug]`
- Sumber watch episode:
  - Series: `https://idflix.my.id/watch/episode/[episodeId]`
  - Kdrama: `https://idflix.my.id/watch/kdrama/episode/[episodeId]`
  - Anime: `https://idflix.my.id/watch/anime/episode/[episodeId]`
- Script sinkron episode: `npm run sync:episodes`.
- Hasil sinkron terakhir:
  - Series: 24 item, 1507 episode
  - Kdrama: 31 item, 599 episode
  - Anime: 1 item, 12 episode
  - Total episode tersimpan: 2118
- Contoh route terverifikasi status 200 dan iframe muncul:
  - `/watch/series/43/1/1`
  - `/watch/series/43/1/8`
  - `/watch/kdrama/31/1`
  - `/watch/kdrama/31/12`
  - `/watch/anime/2/1`
  - `/watch/anime/2/12`

## Prioritas 5: Import dan Sinkronisasi Data

- [x] Buat script scanner untuk menghitung total katalog sumber.
- [x] Buat script import/update ke MongoDB.
- [x] Hindari duplikat berdasarkan `source`, `type`, dan `target_id`.
- [x] Simpan log import: total ditemukan, total baru, total update, total gagal.
- [x] Tambahkan pagination di API `/api/movies` agar tidak mengirim semua item sekaligus saat data ribuan.

Catatan eksekusi:

- Script scan katalog: `npm run scan:idflix`.
- Script import/update katalog: `npm run import:idflix`.
- Log tersimpan:
  - `logs/idflix-scan.json`
  - `logs/idflix-import.json`
- Hasil scan sitemap idflix terakhir:
  - Total ditemukan: 156
  - Movie: 100
  - Series: 24
  - Kdrama: 31
  - Anime: 1
- Hasil import terakhir:
  - Insert baru: 30
  - Update: 126
  - Gagal: 0
- Database setelah import + normalisasi:
  - Total: 212
  - Movie: 126
  - Kdrama: 61
  - Series: 24
  - Anime: 1
  - Duplikat `source + type + target_id`: 0
- Pagination API aktif:
  - `/api/movies?page=1&limit=10`
  - `/api/movies?page=2&limit=10&type=kdrama`
  - Response berisi `data` dan `pagination`.

## Prioritas 6: UI dan UX

- [x] Tambahkan filter tipe: Movie, Series, Kdrama, Anime.
- [x] Tambahkan badge `Bisa Play` atau `Belum Tersedia`.
- [x] Tambahkan empty state yang jelas untuk hasil search.
- [x] Pastikan halaman detail menampilkan metadata sesuai tipe.
- [x] Pastikan layout tetap rapi untuk data ribuan item.

Catatan eksekusi:

- Filter katalog aktif di homepage dan search:
  - `/`
  - `/?type=movie`
  - `/?type=series`
  - `/?type=kdrama`
  - `/?type=anime`
  - `/search?q=[keyword]&type=[type]`
- Grid katalog tetap paginated 60 item per halaman, memakai tombol Prev/Next.
- Card sekarang menampilkan badge tipe konten dan status play.
- Search page menampilkan judul pencarian, jumlah hasil, filter tipe, empty state, dan grid konsisten dengan homepage.
- Detail page menampilkan metadata tipe/status/rilis/kualitas/rating/server atau jumlah episode.
- Detail non-movie mengelompokkan episode series per season dan menonaktifkan tombol episode yang belum punya data playable.

## Prioritas Frontend

- [x] Buat filter katalog di homepage:
  - [x] Semua
  - [x] Movie
  - [x] Series
  - [x] Kdrama
  - [x] Anime
- [x] Tambahkan badge status di card:
  - [x] `Bisa Play`
  - [x] `Belum Tersedia`
  - [x] `Episode`
  - [x] `Movie`
- [x] Tambahkan badge tipe konten di detail page.
- [x] Tambahkan info jumlah server di detail movie.
- [x] Tambahkan info jumlah episode di detail series/kdrama/anime.
- [x] Rapikan grid episode:
  - [x] Group by season untuk `series`.
  - [x] Episode button aktif hanya jika data episode ada.
  - [x] Status kosong kalau episode belum tersedia.
- [x] Buat search page lebih rapi:
  - [x] Judul hasil pencarian.
  - [x] Jumlah hasil.
  - [x] Empty state.
  - [x] Grid konsisten dengan homepage.
- [x] Tambahkan loading state/skeleton untuk halaman katalog.
- [x] Tambahkan error state yang user-friendly untuk API/database gagal.
- [x] Pastikan responsive mobile:
  - [x] Navbar tidak pecah.
  - [x] Search input tetap muat.
  - [x] Card title tidak overflow.
  - [x] Episode grid tetap mudah ditekan.
- [x] Pastikan visual tetap konsisten dengan tema Netflix/Gudang Film.

Catatan eksekusi:

- Komponen filter dan pagination katalog:
  - `components/CatalogFilter.jsx`
  - `components/CatalogPagination.jsx`
- Komponen loading dan error:
  - `components/CatalogSkeleton.jsx`
  - `components/CatalogErrorState.jsx`
  - `app/loading.jsx`
  - `app/search/loading.jsx`
  - `app/error.jsx`
- Homepage dan search memakai filter tipe, pagination, empty state, serta error state saat MongoDB/API gagal.
- Navbar dibuat wrap-friendly di mobile, search input memakai lebar fleksibel, card title dibuat `line-clamp` dan `break-words`.
- Episode grid memakai ukuran tombol minimal 48px, group season untuk series, dan episode non-playable tampil disabled.

## Prioritas 7: Security dan Deploy

- [x] Pastikan `.env.local` tidak pernah di-commit.
- [x] Pastikan Vercel env berisi `MONGODB_URI`, `MONGODB_DB`, dan `MONGODB_COLLECTION`.
- [x] Batasi MongoDB Atlas user hanya ke database app.
- [x] Review CSP jika ada host player baru.
- [x] Jalankan sebelum deploy:
  - [x] `npm run build`
  - [x] `npx eslint app components lib`
  - [x] `npm audit --omit=dev`

Catatan eksekusi:

- `.env.local` sudah di-ignore oleh `.gitignore` dan tidak tracked oleh git.
- Env lokal berisi key wajib:
  - `MONGODB_URI`
  - `MONGODB_DB`
  - `MONGODB_COLLECTION`
- Panduan deploy dan konfigurasi Vercel/Atlas ditambahkan di `docs/deploy.md`.
- Konfigurasi Atlas yang wajib dipakai: user khusus app dengan role `readWrite` hanya pada database `MONGODB_DB`, bukan admin cluster.
- CSP header aktif dan sudah memuat whitelist host player yang sama dengan `lib/playerSecurity.js`.
- Hasil verifikasi pre-deploy:
  - `npm run build`: sukses
  - `npx eslint app components lib`: sukses
  - `npm audit --omit=dev`: 0 vulnerabilities
  - Smoke test `/`: status 200 dan header `Content-Security-Policy` muncul.

## Definisi Selesai

Sistem dianggap normal jika:

- [x] Semua item punya route detail yang benar.
- [x] Semua item playable punya tombol play yang benar.
- [x] Item non-playable tidak menyebabkan error atau halaman kosong.
- [x] Movie, series, kdrama, dan anime punya alur play masing-masing.
- [x] Build, lint, dan audit bersih.
- [ ] Deploy production berhasil dan route utama status 200.

Catatan cek:

- Katalog API dicek: 212 item total (`movie`: 126, `kdrama`: 61, `series`: 24, `anime`: 1).
- Validasi data route: 0 item dengan tipe/slug/target detail invalid.
- Item playable: 211 item. Item non-playable: 1 item (`Adieu, Jean-Pat`, status `no_server`).
- Detail non-playable `/movie/adieu-jean-pat`: status 200 dan menampilkan pesan player belum tersedia.
- Detail sample tiap tipe status 200 dan punya link play:
  - `/movie/the-morrigan`
  - `/series/loving-strangers`
  - `/kdrama/pro-bono`
  - `/anime/danshi-koukousei-no-nichijou`
- Watch route sample tiap tipe status 200:
  - `/watch/movie/258`
  - `/watch/series/29/1/1`
  - `/watch/kdrama/49/1`
  - `/watch/anime/2/1`
