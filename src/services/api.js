// ============================================================
// PetPlace API Service Layer
// Semua request ke backend PHP/MySQL — tidak ada lagi localStorage
// ============================================================

// Detect API base URL automatically
const getApiBase = () => {
  const { protocol, hostname, port } = window.location;
  // If running on Vite dev server (5173), point to Laragon (80)
  if (port === '5173' || port === '3000') {
    return `${protocol}//${hostname}/apps/apps/pawboutique/api`;
  }
  // Production: relative path
  return '/api';
};

// Detect Laragon base for images
const getLaragonBase = () => {
  const { protocol, hostname, port } = window.location;
  if (port === '5173' || port === '3000') {
    return `${protocol}//${hostname}`;
  }
  return '';
};

export const API_BASE = getApiBase();
export const LARAGON_BASE = getLaragonBase();

// Helper: konversi path foto dari backend ke URL yang bisa diakses
export const getImageUrl = (path) => {
  if (!path) return null;
  // Sudah URL penuh (http/https/blob/data)
  if (path.startsWith('http') || path.startsWith('data:') || path.startsWith('blob:')) return path;
  // Path relatif dari backend (misal /apps/apps/pawboutique/uploads/...)
  return `${LARAGON_BASE}${path}`;
};

// ---- HTTP helpers ----

const getToken = () => sessionStorage.getItem('petplace_token');

const headers = (extra = {}) => ({
  'Content-Type': 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
  ...extra,
});

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  return data.data ?? data;
};

export const api = {
  get: async (endpoint, params = {}) => {
    const url = new URL(`${API_BASE}/${endpoint}`);
    Object.entries(params).forEach(([k, v]) => v !== undefined && url.searchParams.set(k, v));
    const res = await fetch(url.toString(), { headers: headers() });
    return handleResponse(res);
  },

  post: async (endpoint, body = {}, params = {}) => {
    const url = new URL(`${API_BASE}/${endpoint}`);
    Object.entries(params).forEach(([k, v]) => v !== undefined && url.searchParams.set(k, v));
    const res = await fetch(url.toString(), {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },

  put: async (endpoint, body = {}, params = {}) => {
    const url = new URL(`${API_BASE}/${endpoint}`);
    Object.entries(params).forEach(([k, v]) => v !== undefined && url.searchParams.set(k, v));
    const res = await fetch(url.toString(), {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },

  delete: async (endpoint, params = {}) => {
    const url = new URL(`${API_BASE}/${endpoint}`);
    Object.entries(params).forEach(([k, v]) => v !== undefined && url.searchParams.set(k, v));
    const res = await fetch(url.toString(), { method: 'DELETE', headers: headers() });
    return handleResponse(res);
  },
};

// ============================================================
// AUTH
// ============================================================
export const authAPI = {
  login: (email, password) => api.post('auth.php?action=login', { email, password }),
  register: (data) => api.post('auth.php?action=register', data),
  logout: () => api.post('auth.php?action=logout'),
  me: () => api.get('auth.php?action=me'),
  changePassword: (oldPassword, newPassword) => api.post('auth.php?action=change-password', { oldPassword, newPassword }),
};

// ============================================================
// PRODUK
// ============================================================
export const produkAPI = {
  list: (params = {}) => api.get('produk.php', params),
  detail: (id) => api.get(`produk.php?id=${id}`),
  create: (data) => api.post('produk.php?action=create', data),
  update: (id, data) => api.put(`produk.php?id=${id}`, data),
  delete: (id) => api.delete(`produk.php?id=${id}`),
  kategori: () => api.get('produk.php?action=kategori'),
};

// ============================================================
// KIOS
// ============================================================
export const kiosAPI = {
  list: (params = {}) => api.get('kios.php', params),
  detail: (id) => api.get(`kios.php?id=${id}`),
  daftar: (data) => api.post('kios.php?action=daftar', data),
  update: (id, data) => api.put(`kios.php?id=${id}`, data),
  approve: (id) => api.post(`kios.php?action=approve&id=${id}`),
  reject: (id) => api.post(`kios.php?action=reject&id=${id}`),
  my: () => api.get('kios.php?action=my'),
  stats: (id) => api.get(`kios.php?action=stats&id=${id}`),
};

// ============================================================
// DOKTER
// ============================================================
export const dokterAPI = {
  list: (params = {}) => api.get('dokter.php', params),
  detail: (id) => api.get(`dokter.php?id=${id}`),
  daftar: (data) => api.post('dokter.php?action=daftar', data),
  update: (id, data) => api.put(`dokter.php?id=${id}`, data),
  approve: (id) => api.post(`dokter.php?action=approve&id=${id}`),
  reject: (id) => api.post(`dokter.php?action=reject&id=${id}`),
  booking: (data) => api.post('dokter.php?action=booking', data),
  getJanji: () => api.get('dokter.php?action=janji'),
  janji: (id) => api.get(`dokter.php?action=janji&id=${id}`),
  stats: (id) => api.get(`dokter.php?action=stats&id=${id}`),
};

// ============================================================
// GROOMING
// ============================================================
export const groomingAPI = {
  list: (params = {}) => api.get('grooming.php', params),
  detail: (id) => api.get(`grooming.php?id=${id}`),
  daftar: (data) => api.post('grooming.php?action=daftar', data),
  update: (id, data) => api.put(`grooming.php?id=${id}`, data),
  approve: (id) => api.post(`grooming.php?action=approve&id=${id}`),
  reject: (id) => api.post(`grooming.php?action=reject&id=${id}`),
  booking: (data) => api.post('grooming.php?action=booking', data),
  getBooking: () => api.get('grooming.php?action=booking'),
  bookings: (id) => api.get(`grooming.php?action=bookings&id=${id}`),
  stats: (id) => api.get(`grooming.php?action=stats&id=${id}`),
};

// ============================================================
// PESANAN
// ============================================================
export const pesananAPI = {
  checkout: (data) => api.post('pesanan.php?action=checkout', data),
  list: (params = {}) => api.get('pesanan.php', params),
  detail: (id) => api.get(`pesanan.php?id=${id}`),
  updateStatus: (id, status, noResi) => api.put(`pesanan.php?id=${id}&action=status`, { status, noResi }),
  uploadBukti: (data) => api.post('pesanan.php?action=bayar', data),
  verifikasi: (id, diterima) => api.post(`pesanan.php?action=verifikasi&id=${id}`, { diterima }),
  kiosList: (params = {}) => api.get('pesanan.php?action=kios', params),
};

// ============================================================
// ADMIN
// ============================================================
export const adminAPI = {
  stats: () => api.get('admin.php?action=stats'),
  pengguna: (params = {}) => api.get('admin.php?action=pengguna', params),
  updatePengguna: (id, data) => api.put(`admin.php?action=pengguna&id=${id}`, data),
  komisi: () => api.get('admin.php?action=komisi'),
  laporan: () => api.get('admin.php?action=laporan'),
  pending: () => api.get('admin.php?action=pending'),
  // Moderasi produk kios
  produkList: (params = {}) => api.get('produk.php?action=admin-list', params),
  produkKios: (params = {}) => api.get('admin.php?action=produk-kios', params),
  produkDelete: (id) => api.delete(`produk.php?id=${id}`),
  produkApprove: (id) => api.post(`produk.php?action=approve&id=${id}`),
  produkReject: (id) => api.post(`produk.php?action=reject&id=${id}`),
};

// ============================================================
// LOKASI
// ============================================================
export const lokasiAPI = {
  all: () => api.get('lokasi.php?action=all'),
  getAlamat: () => api.get('lokasi.php?action=alamat'),
  addAlamat: (data) => api.post('lokasi.php?action=alamat', data),
  updateAlamat: (id, data) => api.put(`lokasi.php?action=alamat&id=${id}`, data),
  deleteAlamat: (id) => api.delete(`lokasi.php?action=alamat&id=${id}`),
};

// ============================================================
// UTIL: Format Rupiah
// ============================================================
export const formatRupiah = (angka) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);

export const formatBerat = (gram) => {
  if (!gram) return '-';
  if (gram >= 1000) return `${(gram / 1000).toFixed(1)} kg`;
  return `${gram} gram`;
};

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
