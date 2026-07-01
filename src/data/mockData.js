// ============================================================
// PetPlace — Utilities Only (semua data sekarang dari API backend)
// Data produk, kios, dokter, grooming diambil dari MySQL via PHP API
// ============================================================

// ---- KATEGORI PRODUK (tetap lokal karena statis) ----
export const kategoriProduk = [
  { id: 1, nama: 'Makanan Kucing', slug: 'makanan-kucing', jenis: 'kucing', tipe: 'makanan', icon: '🐱', warna: 'orange' },
  { id: 2, nama: 'Makanan Anjing', slug: 'makanan-anjing', jenis: 'anjing', tipe: 'makanan', icon: '🐶', warna: 'blue' },
  { id: 3, nama: 'Pasir Kucing',   slug: 'pasir-kucing',   jenis: 'kucing', tipe: 'pasir',   icon: '🪣', warna: 'yellow' },
  { id: 4, nama: 'Pasir Anjing',   slug: 'pasir-anjing',   jenis: 'anjing', tipe: 'pasir',   icon: '🪣', warna: 'green' },
  { id: 5, nama: 'Mainan Kucing',  slug: 'mainan-kucing',  jenis: 'kucing', tipe: 'mainan',  icon: '🎾', warna: 'purple' },
  { id: 6, nama: 'Mainan Anjing',  slug: 'mainan-anjing',  jenis: 'anjing', tipe: 'mainan',  icon: '🦴', warna: 'red' },
  { id: 7, nama: 'Aksesoris Kucing', slug: 'aksesoris-kucing', jenis: 'kucing', tipe: 'aksesoris', icon: '🎀', warna: 'pink' },
  { id: 8, nama: 'Aksesoris Anjing', slug: 'aksesoris-anjing', jenis: 'anjing', tipe: 'aksesoris', icon: '🏷️', warna: 'teal' },
  { id: 9, nama: 'Kesehatan Kucing', slug: 'kesehatan-kucing', jenis: 'kucing', tipe: 'kesehatan', icon: '💊', warna: 'cyan' },
  { id: 10, nama: 'Kesehatan Anjing', slug: 'kesehatan-anjing', jenis: 'anjing', tipe: 'kesehatan', icon: '💉', warna: 'indigo' },
];

// ---- FORMAT HELPERS ----
export const formatRupiah = (angka) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka ?? 0);

export const formatBerat = (gram) => {
  if (!gram) return '-';
  if (gram >= 1000) return `${(gram / 1000).toFixed(1)} kg`;
  return `${gram} gram`;
};

export const hitungBeratTotal = (items) =>
  items.reduce((total, item) => total + ((item.beratGram ?? 0) * (item.jumlah ?? 1)), 0);

export const hitungOngkir = (beratGram) => {
  if (beratGram <= 1000) return 15000;
  if (beratGram <= 5000) return 25000;
  if (beratGram <= 10000) return 35000;
  return 50000;
};

export const generateKodePesanan = () => {
  const now = new Date();
  const ts = now.getTime().toString().slice(-6);
  return `PP-${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}-${ts}`;
};

// Legacy stubs — semua ini sekarang digantikan oleh API calls
// Kept only for backward compatibility during transition
export const kiosData = [];
export const dokterData = [];
export const groomingData = [];
export const produkData = [];
export const ulasanProdukData = {};
export const lokasiPeta = [];
export const statsAdmin = {
  totalPengguna: 0, totalKios: 0, totalDokter: 0, totalGrooming: 0,
  totalPesanan: 0, totalKomisi: 0, pendingVerifikasi: 0, transaksiHariIni: 0,
};

// Legacy helpers (will return empty, pages should use API now)
export const getProdukByKategori = () => [];
export const getProdukByJenis = () => [];
export const getFeaturedProduk = () => [];
export const getTopDokter = () => [];
export const getTopGrooming = () => [];
