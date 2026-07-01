<?php
// ============================================================
// PetPlace API — Peta & Lokasi
// ============================================================
require_once __DIR__ . '/config.php';
setCORSHeaders();

$action = $_GET['action'] ?? 'all';

switch ($action) {
    case 'all':
        getSemuaLokasi();
        break;
    case 'alamat':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') getAlamat();
        elseif ($_SERVER['REQUEST_METHOD'] === 'POST') addAlamat();
        elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') updateAlamat();
        elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') deleteAlamat();
        break;
    default:
        sendError('Action tidak ditemukan', 404);
}

function getSemuaLokasi(): void {
    $db = getDB();
    $lokasi = [];
    
    // Kios — ambil dari tabel lokasi_kios yang berelasi ke kios
    $kStmt = $db->query("
        SELECT CONCAT('k', k.id_kios) AS id, 'kios' AS tipe,
               k.nama_kios AS nama, lk.alamat_lengkap AS alamat,
               lk.lat, lk.lng, lk.kota, k.logo,
               NULL AS rating
        FROM kios k
        JOIN lokasi_kios lk ON lk.id_kios = k.id_kios
        WHERE k.status = 'aktif' AND lk.lat IS NOT NULL AND lk.lat != ''
    ");
    $lokasi = array_merge($lokasi, $kStmt->fetchAll());
    
    // Dokter
    $dStmt = $db->query("
        SELECT CONCAT('d', id_dokter) AS id, 'dokter' AS tipe,
               nama_dokter AS nama, alamat_praktik AS alamat,
               lat, lng, kota, NULL AS logo,
               rating_avg AS rating
        FROM dokter_hewan
        WHERE status = 'aktif' AND lat IS NOT NULL AND lat != ''
    ");
    $lokasi = array_merge($lokasi, $dStmt->fetchAll());
    
    // Grooming
    $gStmt = $db->query("
        SELECT CONCAT('g', id_grooming) AS id, 'grooming' AS tipe,
               nama_usaha AS nama, alamat,
               lat, lng, kota, NULL AS logo,
               rating_avg AS rating
        FROM penyedia_grooming
        WHERE status = 'aktif' AND lat IS NOT NULL AND lat != ''
    ");
    $lokasi = array_merge($lokasi, $gStmt->fetchAll());
    
    sendSuccess($lokasi);
}

function getAlamat(): void {
    $user = requireAuth();
    $db   = getDB();
    
    $stmt = $db->prepare("
        SELECT id_alamat AS id, label, nama_penerima AS namaPenerima, no_telepon AS telepon,
               provinsi, kota, kecamatan, kelurahan, kode_pos AS kodePos, alamat_lengkap AS alamat,
               lat, lng, is_utama AS isUtama
        FROM alamat_pengguna
        WHERE id_pengguna = ?
        ORDER BY is_utama DESC, created_at DESC
    ");
    $stmt->execute([$user['id_pengguna']]);
    sendSuccess($stmt->fetchAll());
}

function addAlamat(): void {
    $user = requireAuth();
    $data = getRequestBody();
    $db   = getDB();
    
    $required = ['namaPenerima', 'telepon', 'kota', 'kecamatan', 'kelurahan', 'alamat'];
    foreach ($required as $f) {
        if (empty($data[$f])) sendError("Field '$f' wajib diisi");
    }
    
    // If set as primary, unset others
    if (!empty($data['isUtama'])) {
        $db->prepare("UPDATE alamat_pengguna SET is_utama = 0 WHERE id_pengguna = ?")->execute([$user['id_pengguna']]);
    }
    
    $db->prepare("
        INSERT INTO alamat_pengguna (id_pengguna, label, nama_penerima, no_telepon, provinsi, kota, kecamatan, kelurahan, kode_pos, alamat_lengkap, lat, lng, is_utama)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
    ")->execute([
        $user['id_pengguna'],
        $data['label'] ?? 'Rumah',
        $data['namaPenerima'],
        $data['telepon'],
        $data['provinsi'] ?? 'Sulawesi Selatan',
        $data['kota'],
        $data['kecamatan'],
        $data['kelurahan'],
        $data['kodePos'] ?? '',
        $data['alamat'],
        $data['lat'] ?? null,
        $data['lng'] ?? null,
        !empty($data['isUtama']) ? 1 : 0,
    ]);
    
    sendSuccess(['id' => $db->lastInsertId()], 'Alamat berhasil ditambahkan');
}

function updateAlamat(): void {
    $user = requireAuth();
    $id   = (int)($_GET['id'] ?? 0);
    $data = getRequestBody();
    $db   = getDB();
    
    $stmt = $db->prepare("SELECT id_pengguna FROM alamat_pengguna WHERE id_alamat = ?");
    $stmt->execute([$id]);
    $alamat = $stmt->fetch();
    if (!$alamat || $alamat['id_pengguna'] != $user['id_pengguna']) sendError('Alamat tidak ditemukan', 404);
    
    $db->prepare("UPDATE alamat_pengguna SET label=?, nama_penerima=?, no_telepon=?, kota=?, kecamatan=?, kelurahan=?, kode_pos=?, alamat_lengkap=? WHERE id_alamat=?")
       ->execute([$data['label'] ?? 'Rumah', $data['namaPenerima'], $data['telepon'], $data['kota'], $data['kecamatan'], $data['kelurahan'], $data['kodePos'] ?? '', $data['alamat'], $id]);
    
    sendSuccess(null, 'Alamat diperbarui');
}

function deleteAlamat(): void {
    $user = requireAuth();
    $id   = (int)($_GET['id'] ?? 0);
    $db   = getDB();
    
    $stmt = $db->prepare("SELECT id_pengguna FROM alamat_pengguna WHERE id_alamat = ?");
    $stmt->execute([$id]);
    $alamat = $stmt->fetch();
    if (!$alamat || $alamat['id_pengguna'] != $user['id_pengguna']) sendError('Alamat tidak ditemukan', 404);
    
    $db->prepare("DELETE FROM alamat_pengguna WHERE id_alamat = ?")->execute([$id]);
    sendSuccess(null, 'Alamat dihapus');
}
