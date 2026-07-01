<?php
// ============================================================
// PetPlace API — Dokter Hewan
// ============================================================
require_once __DIR__ . '/config.php';
setCORSHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$id     = (int)($_GET['id'] ?? 0);
$action = $_GET['action'] ?? '';

if ($method === 'GET' && !$id && !$action) {
    listDokter();
} elseif ($method === 'GET' && $id) {
    detailDokter($id);
} elseif ($method === 'POST' && $action === 'daftar') {
    daftarDokter();
} elseif ($method === 'PUT' && $id) {
    updateDokter($id);
} elseif ($method === 'POST' && $action === 'approve' && $id) {
    approveDokter($id);
} elseif ($method === 'POST' && $action === 'reject' && $id) {
    rejectDokter($id);
} elseif ($method === 'POST' && $action === 'booking') {
    bookingDokter();
} elseif ($method === 'GET' && $action === 'janji') {
    getJanjiDokter();
} else {
    sendError('Endpoint tidak ditemukan', 404);
}

function listDokter(): void {
    $db = getDB();
    $where = ["d.status = 'aktif'"];
    $params = [];
    
    if (!empty($_GET['kota'])) { $where[] = "d.kota = ?"; $params[] = $_GET['kota']; }
    if (!empty($_GET['q'])) { $where[] = "(d.nama_dokter LIKE ? OR d.spesialisasi LIKE ?)"; $params[] = '%' . $_GET['q'] . '%'; $params[] = '%' . $_GET['q'] . '%'; }
    
    $stmt = $db->prepare("
        SELECT d.id_dokter AS id, d.nama_dokter AS nama, d.spesialisasi, d.no_str AS noStr,
               d.deskripsi, d.foto, d.kota, d.lat, d.lng, d.alamat_praktik AS alamat,
               d.harga_konsultasi AS hargaKonsultasi, d.status_ready AS statusReady,
               d.rating_avg AS rating, d.total_ulasan AS totalUlasan, d.total_pasien AS totalPasien,
               d.no_rekening AS noRekening, d.nama_bank AS namaBank,
               d.status, d.verified
        FROM dokter_hewan d
        WHERE " . implode(' AND ', $where) . "
        ORDER BY d.rating_avg DESC
    ");
    $stmt->execute($params);
    $rows = $stmt->fetchAll();
    
    // Get jadwal for each dokter
    foreach ($rows as &$dokter) {
        $jadStmt = $db->prepare("SELECT hari, TIME_FORMAT(jam_mulai,'%H:%i') AS jamMulai, TIME_FORMAT(jam_selesai,'%H:%i') AS jamSelesai FROM jadwal_dokter WHERE id_dokter = ? AND status = 'aktif'");
        $jadStmt->execute([$dokter['id']]);
        $dokter['jadwal'] = array_map(fn($j) => ['hari' => $j['hari'], 'jam' => $j['jamMulai'] . ' - ' . $j['jamSelesai']], $jadStmt->fetchAll());
        $dokter['statusReady'] = (bool)$dokter['statusReady'];
        $dokter['verified'] = (bool)$dokter['verified'];
    }
    
    sendSuccess($rows);
}

function detailDokter(int $id): void {
    $db = getDB();
    $stmt = $db->prepare("
        SELECT d.*, p.nama_lengkap AS namaPengguna
        FROM dokter_hewan d
        JOIN pengguna p ON d.id_pengguna = p.id_pengguna
        WHERE d.id_dokter = ?
        LIMIT 1
    ");
    $stmt->execute([$id]);
    $dokter = $stmt->fetch();
    if (!$dokter) sendError('Dokter tidak ditemukan', 404);
    
    // Jadwal
    $jadStmt = $db->prepare("SELECT hari, TIME_FORMAT(jam_mulai,'%H:%i') AS jamMulai, TIME_FORMAT(jam_selesai,'%H:%i') AS jamSelesai FROM jadwal_dokter WHERE id_dokter = ? AND status = 'aktif'");
    $jadStmt->execute([$id]);
    $dokter['jadwal'] = array_map(fn($j) => ['hari' => $j['hari'], 'jam' => $j['jamMulai'] . ' - ' . $j['jamSelesai']], $jadStmt->fetchAll());
    
    // Ulasan
    $ulStmt = $db->prepare("
        SELECT u.id_ulasan AS id, p2.nama_lengkap AS nama, u.bintang, u.komentar, u.created_at AS tanggal
        FROM ulasan_dokter u
        JOIN pengguna p2 ON u.id_pengguna = p2.id_pengguna
        WHERE u.id_dokter = ? AND u.status = 'aktif'
        ORDER BY u.created_at DESC LIMIT 10
    ");
    $ulStmt->execute([$id]);
    $dokter['ulasan'] = $ulStmt->fetchAll();
    
    $dokter['statusReady'] = (bool)$dokter['status_ready'];
    $dokter['verified'] = (bool)$dokter['verified'];
    $dokter['hargaKonsultasi'] = (float)$dokter['harga_konsultasi'];
    
    sendSuccess($dokter);
}

function daftarDokter(): void {
    $user = requireAuth();
    $data = getRequestBody();
    $db   = getDB();
    
    $required = ['nama', 'spesialisasi', 'noStr', 'hargaKonsultasi', 'namaBank', 'noRekening'];
    foreach ($required as $f) {
        if (empty($data[$f])) sendError("Field '$f' wajib diisi");
    }
    
    $db->prepare("
        INSERT INTO dokter_hewan (id_pengguna, nama_dokter, spesialisasi, no_str, deskripsi, foto, no_telepon, email, alamat_praktik, kota, lat, lng, harga_konsultasi, no_rekening, nama_bank, nama_pemilik_rek, status)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'pending')
    ")->execute([
        $user['id_pengguna'],
        $data['nama'],
        $data['spesialisasi'],
        $data['noStr'],
        $data['deskripsi'] ?? '',
        $data['foto'] ?? "https://api.dicebear.com/7.x/avataaars/svg?seed={$user['email']}",
        $data['telepon'] ?? '',
        $data['email'] ?? $user['email'],
        $data['alamat'] ?? '',
        $data['kota'] ?? 'Makassar',
        $data['lat'] ?? null,
        $data['lng'] ?? null,
        (float)$data['hargaKonsultasi'],
        $data['noRekening'],
        $data['namaBank'],
        $data['namaPemilikRek'] ?? '',
    ]);
    
    $dokId = $db->lastInsertId();
    
    // Update pengguna peran
    $db->prepare("UPDATE pengguna SET peran = 'dokter' WHERE id_pengguna = ?")->execute([$user['id_pengguna']]);
    
    sendSuccess(['id' => $dokId], 'Pendaftaran dokter berhasil! Menunggu verifikasi admin.');
}

function updateDokter(int $id): void {
    $user = requireAuth();
    $db   = getDB();
    
    $stmt = $db->prepare("SELECT id_pengguna FROM dokter_hewan WHERE id_dokter = ?");
    $stmt->execute([$id]);
    $dok = $stmt->fetch();
    if (!$dok) sendError('Dokter tidak ditemukan', 404);
    if ($user['peran'] !== 'admin' && $dok['id_pengguna'] != $user['id_pengguna']) sendError('Tidak memiliki akses', 403);
    
    $data = getRequestBody();
    $fields = [];
    $params = [];
    
    $map = ['nama' => 'nama_dokter', 'spesialisasi' => 'spesialisasi', 'deskripsi' => 'deskripsi', 'foto' => 'foto', 'hargaKonsultasi' => 'harga_konsultasi', 'statusReady' => 'status_ready', 'kota' => 'kota', 'alamat' => 'alamat_praktik', 'lat' => 'lat', 'lng' => 'lng'];
    foreach ($map as $key => $col) {
        if (isset($data[$key])) { $fields[] = "$col = ?"; $params[] = $data[$key]; }
    }
    
    if (!empty($fields)) {
        $params[] = $id;
        $db->prepare("UPDATE dokter_hewan SET " . implode(', ', $fields) . " WHERE id_dokter = ?")->execute($params);
    }
    
    sendSuccess(null, 'Data dokter diperbarui');
}

function approveDokter(int $id): void {
    requireAdmin();
    $db = getDB();
    $stmt = $db->prepare("SELECT id_pengguna FROM dokter_hewan WHERE id_dokter = ?");
    $stmt->execute([$id]);
    $dok = $stmt->fetch();
    if (!$dok) sendError('Dokter tidak ditemukan', 404);
    
    $db->prepare("UPDATE dokter_hewan SET status = 'aktif', verified = 1 WHERE id_dokter = ?")->execute([$id]);
    $db->prepare("UPDATE pengguna SET peran = 'dokter', status = 'aktif' WHERE id_pengguna = ?")->execute([$dok['id_pengguna']]);
    sendSuccess(null, 'Dokter berhasil diverifikasi');
}

function rejectDokter(int $id): void {
    requireAdmin();
    $db = getDB();
    $db->prepare("UPDATE dokter_hewan SET status = 'nonaktif' WHERE id_dokter = ?")->execute([$id]);
    sendSuccess(null, 'Pendaftaran dokter ditolak');
}

function bookingDokter(): void {
    $user = requireAuth();
    $data = getRequestBody();
    $db   = getDB();
    
    $required = ['idDokter', 'tanggal', 'jam', 'namaHewan', 'jenisHewan'];
    foreach ($required as $f) {
        if (empty($data[$f])) sendError("Field '$f' wajib diisi");
    }
    
    // Get harga from dokter
    $stmt = $db->prepare("SELECT harga_konsultasi FROM dokter_hewan WHERE id_dokter = ? AND status = 'aktif'");
    $stmt->execute([(int)$data['idDokter']]);
    $dok = $stmt->fetch();
    if (!$dok) sendError('Dokter tidak tersedia');
    
    $db->prepare("
        INSERT INTO janji_dokter (id_pengguna, id_dokter, tanggal, jam, keluhan, nama_hewan, jenis_hewan, harga)
        VALUES (?,?,?,?,?,?,?,?)
    ")->execute([
        $user['id_pengguna'],
        (int)$data['idDokter'],
        $data['tanggal'],
        $data['jam'],
        $data['keluhan'] ?? '',
        $data['namaHewan'],
        $data['jenisHewan'],
        $dok['harga_konsultasi'],
    ]);
    
    sendSuccess(['id' => $db->lastInsertId()], 'Janji dokter berhasil dibuat');
}

function getJanjiDokter(): void {
    $user = requireAuth();
    $db   = getDB();
    
    if ($user['peran'] === 'dokter') {
        $stmt = $db->prepare("
            SELECT j.*, p.nama_lengkap AS namaPembeli, d.nama_dokter AS namaDokter
            FROM janji_dokter j
            JOIN pengguna p ON j.id_pengguna = p.id_pengguna
            JOIN dokter_hewan d ON j.id_dokter = d.id_dokter
            WHERE d.id_pengguna = ?
            ORDER BY j.tanggal DESC, j.jam DESC
        ");
        $stmt->execute([$user['id_pengguna']]);
    } else {
        $stmt = $db->prepare("
            SELECT j.*, d.nama_dokter AS namaDokter, d.foto AS fotoDokter
            FROM janji_dokter j
            JOIN dokter_hewan d ON j.id_dokter = d.id_dokter
            WHERE j.id_pengguna = ?
            ORDER BY j.tanggal DESC
        ");
        $stmt->execute([$user['id_pengguna']]);
    }
    
    sendSuccess($stmt->fetchAll());
}
