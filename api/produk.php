<?php
// ============================================================
// PetPlace API — Produk
// GET list, GET detail, POST create, PUT update, DELETE
// ============================================================
require_once __DIR__ . '/config.php';
setCORSHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$id     = (int)($_GET['id'] ?? 0);
$action = $_GET['action'] ?? '';

if ($method === 'GET' && !$id && !$action) {
    listProduk();
} elseif ($method === 'GET' && $id) {
    detailProduk($id);
} elseif ($method === 'POST' && $action === 'create') {
    createProduk();
} elseif ($method === 'PUT' && $id) {
    updateProduk($id);
} elseif ($method === 'DELETE' && $id) {
    deleteProduk($id);
} elseif ($method === 'GET' && $action === 'kategori') {
    listKategori();
} elseif ($method === 'GET' && $action === 'admin-list') {
    adminListProduk();
} elseif ($method === 'POST' && $action === 'approve' && $id) {
    approveRejectProduk($id, 'aktif');
} elseif ($method === 'POST' && $action === 'reject' && $id) {
    approveRejectProduk($id, 'nonaktif');
} else {
    sendError('Endpoint tidak ditemukan', 404);
}

function listProduk(): void {
    $db = getDB();
    
    $where  = ["p.status = 'aktif'"];
    $params = [];
    
    if (!empty($_GET['kategori'])) {
        $where[]  = "kp.slug = ?";
        $params[] = $_GET['kategori'];
    }
    if (!empty($_GET['jenis'])) {
        $where[]  = "p.jenis_hewan = ?";
        $params[] = $_GET['jenis'];
    }
    // Support both 'kios' and 'idKios' params
    $kiosParam = $_GET['kios'] ?? $_GET['idKios'] ?? null;
    if (!empty($kiosParam)) {
        $where[]  = "p.id_kios = ?";
        $params[] = (int)$kiosParam;
    }
    if (!empty($_GET['q'])) {
        $where[]  = "p.nama_produk LIKE ?";
        $params[] = '%' . $_GET['q'] . '%';
    }
    
    $sort   = $_GET['sort'] ?? 'terjual';
    $order  = in_array($sort, ['terjual', 'harga', 'rating_avg', 'created_at']) ? $sort : 'terjual';
    $dir    = ($_GET['dir'] ?? 'desc') === 'asc' ? 'ASC' : 'DESC';
    $limit  = min((int)($_GET['limit'] ?? 20), 100);
    $offset = (int)($_GET['offset'] ?? 0);
    
    $whereSql = implode(' AND ', $where);
    
    $sql = "
        SELECT p.id_produk AS id, p.nama_produk AS nama, p.slug, p.deskripsi,
               p.jenis_hewan AS jenisHewan, p.tipe_produk AS tipeProduk,
               p.harga, p.harga_diskon AS hargaDiskon, p.berat_gram AS beratGram,
               p.foto_utama AS foto, p.terjual, p.rating_avg AS rating,
               p.total_ulasan AS totalUlasan, p.status,
               k.id_kios AS idKios, k.nama_kios AS namaKios,
               kp.id_kategori AS idKategori, kp.nama_kategori AS namaKategori,
               sp.jumlah_stok AS stok
        FROM produk p
        JOIN kios k ON p.id_kios = k.id_kios
        JOIN kategori_produk kp ON p.id_kategori = kp.id_kategori
        LEFT JOIN stok_produk sp ON sp.id_produk = p.id_produk
        WHERE $whereSql
        ORDER BY p.$order $dir
        LIMIT $limit OFFSET $offset
    ";
    
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();
    
    // Count total
    $countSql = "SELECT COUNT(*) FROM produk p JOIN kios k ON p.id_kios = k.id_kios JOIN kategori_produk kp ON p.id_kategori = kp.id_kategori WHERE $whereSql";
    $countStmt = $db->prepare($countSql);
    $countStmt->execute($params);
    $total = (int)$countStmt->fetchColumn();
    
    sendSuccess(['produk' => $rows, 'total' => $total, 'limit' => $limit, 'offset' => $offset]);
}

function detailProduk(int $id): void {
    $db = getDB();
    $stmt = $db->prepare("
        SELECT p.id_produk AS id, p.nama_produk AS nama, p.slug, p.deskripsi,
               p.jenis_hewan AS jenisHewan, p.tipe_produk AS tipeProduk,
               p.harga, p.harga_diskon AS hargaDiskon, p.berat_gram AS beratGram,
               p.foto_utama AS foto, p.terjual, p.rating_avg AS rating,
               p.total_ulasan AS totalUlasan, p.status, p.created_at AS createdAt,
               k.id_kios AS idKios, k.nama_kios AS namaKios, k.rating AS ratingKios,
               kp.id_kategori AS idKategori, kp.nama_kategori AS namaKategori,
               sp.jumlah_stok AS stok
        FROM produk p
        JOIN kios k ON p.id_kios = k.id_kios
        JOIN kategori_produk kp ON p.id_kategori = kp.id_kategori
        LEFT JOIN stok_produk sp ON sp.id_produk = p.id_produk
        WHERE p.id_produk = ?
        LIMIT 1
    ");
    $stmt->execute([$id]);
    $produk = $stmt->fetch();
    
    if (!$produk) sendError('Produk tidak ditemukan', 404);
    
    // Get reviews
    $ulasanStmt = $db->prepare("
        SELECT u.id_ulasan AS id, p2.nama_lengkap AS nama, u.bintang, u.komentar, u.created_at AS tanggal
        FROM ulasan_produk u
        JOIN pengguna p2 ON u.id_pengguna = p2.id_pengguna
        WHERE u.id_produk = ? AND u.status = 'aktif'
        ORDER BY u.created_at DESC
        LIMIT 10
    ");
    $ulasanStmt->execute([$id]);
    $ulasan = $ulasanStmt->fetchAll();
    
    $produk['ulasan'] = $ulasan;
    sendSuccess($produk);
}

function createProduk(): void {
    $user = requireAuth();
    if (!in_array($user['peran'], ['owner', 'admin'])) sendError('Hanya owner yang dapat menambah produk', 403);
    
    $data = getRequestBody();
    $db   = getDB();
    
    // Get kios for this owner
    if ($user['peran'] === 'owner') {
        $kStmt = $db->prepare("SELECT id_kios FROM kios WHERE id_pengguna = ? AND status = 'aktif' LIMIT 1");
        $kStmt->execute([$user['id_pengguna']]);
        $kios = $kStmt->fetch();
        if (!$kios) sendError('Kios Anda belum aktif. Hubungi admin.');
        $idKios = $kios['id_kios'];
    } else {
        $idKios = (int)($data['idKios'] ?? 0);
    }
    
    $required = ['nama', 'idKategori', 'jenisHewan', 'tipeProduk', 'harga'];
    foreach ($required as $field) {
        if (empty($data[$field])) sendError("Field '$field' wajib diisi");
    }
    
    $nama     = trim($data['nama']);
    $slug     = slugify($nama) . '-' . substr(md5(microtime()), 0, 6);
    $idKat    = (int)$data['idKategori'];
    $jenis    = $data['jenisHewan'];
    $tipe     = $data['tipeProduk'];
    $harga    = (float)$data['harga'];
    $diskon   = !empty($data['hargaDiskon']) ? (float)$data['hargaDiskon'] : null;
    $berat    = (float)($data['beratGram'] ?? 0);
    $deskripsi = $data['deskripsi'] ?? '';
    $stok     = (int)($data['stok'] ?? 0);
    
    // ── Simpan foto base64 ──────────────────────────────────────
    $foto = null;
    if (!empty($data['foto'])) {
        $fotoData = $data['foto'];
        if (str_starts_with($fotoData, 'data:image/')) {
            // Base64 image upload
            $parts   = explode(',', $fotoData, 2);
            $imgData = base64_decode($parts[1]);
            // Detect extension
            preg_match('/data:image\/(\w+);/', $fotoData, $ext);
            $extStr  = strtolower($ext[1] ?? 'jpg');
            if ($extStr === 'jpeg') $extStr = 'jpg';
            $dir     = __DIR__ . '/../uploads/produk/';
            if (!is_dir($dir)) mkdir($dir, 0775, true);
            $fname   = 'produk_' . time() . '_' . uniqid() . '.' . $extStr;
            file_put_contents($dir . $fname, $imgData);
            // URL yang bisa diakses browser
            $foto = '/apps/apps/pawboutique/uploads/produk/' . $fname;
        } else {
            // URL langsung
            $foto = $fotoData;
        }
    }
    // ────────────────────────────────────────────────────────────
    
    $db->prepare("
        INSERT INTO produk (id_kios, id_kategori, nama_produk, slug, deskripsi, jenis_hewan, tipe_produk, harga, harga_diskon, berat_gram, foto_utama)
        VALUES (?,?,?,?,?,?,?,?,?,?,?)
    ")->execute([$idKios, $idKat, $nama, $slug, $deskripsi, $jenis, $tipe, $harga, $diskon, $berat, $foto]);
    
    $newId = $db->lastInsertId();
    
    // Insert stok
    $db->prepare("INSERT INTO stok_produk (id_produk, jumlah_stok) VALUES (?,?)")
       ->execute([$newId, $stok]);
    
    sendSuccess(['id' => $newId, 'foto' => $foto], 'Produk berhasil ditambahkan');
}

function updateProduk(int $id): void {
    $user = requireAuth();
    $data = getRequestBody();
    $db   = getDB();
    
    // Check ownership
    $stmt = $db->prepare("SELECT p.id_produk, k.id_pengguna FROM produk p JOIN kios k ON p.id_kios = k.id_kios WHERE p.id_produk = ?");
    $stmt->execute([$id]);
    $produk = $stmt->fetch();
    if (!$produk) sendError('Produk tidak ditemukan', 404);
    if ($user['peran'] !== 'admin' && $produk['id_pengguna'] != $user['id_pengguna']) {
        sendError('Anda tidak memiliki akses ke produk ini', 403);
    }
    
    $fields = [];
    $params = [];
    
    if (isset($data['nama'])) { $fields[] = 'nama_produk = ?'; $params[] = $data['nama']; }
    if (isset($data['deskripsi'])) { $fields[] = 'deskripsi = ?'; $params[] = $data['deskripsi']; }
    if (isset($data['harga'])) { $fields[] = 'harga = ?'; $params[] = (float)$data['harga']; }
    if (array_key_exists('hargaDiskon', $data)) { $fields[] = 'harga_diskon = ?'; $params[] = $data['hargaDiskon'] ? (float)$data['hargaDiskon'] : null; }
    if (isset($data['beratGram'])) { $fields[] = 'berat_gram = ?'; $params[] = (float)$data['beratGram']; }
    if (isset($data['foto'])) { $fields[] = 'foto_utama = ?'; $params[] = $data['foto']; }
    if (isset($data['status'])) { $fields[] = 'status = ?'; $params[] = $data['status']; }
    // ── Update label/kategori produk ──────────────────────────────────
    if (isset($data['idKategori'])) { $fields[] = 'id_kategori = ?'; $params[] = (int)$data['idKategori']; }
    if (isset($data['jenisHewan'])) { $fields[] = 'jenis_hewan = ?'; $params[] = $data['jenisHewan']; }
    if (isset($data['tipeProduk'])) { $fields[] = 'tipe_produk = ?'; $params[] = $data['tipeProduk']; }
    // ─────────────────────────────────────────────────────────────────
    
    if (!empty($fields)) {
        $params[] = $id;
        $db->prepare("UPDATE produk SET " . implode(', ', $fields) . " WHERE id_produk = ?")
           ->execute($params);
    }
    
    // Update stok if provided
    if (isset($data['stok'])) {
        $db->prepare("INSERT INTO stok_produk (id_produk, jumlah_stok) VALUES (?,?) ON DUPLICATE KEY UPDATE jumlah_stok = ?")
           ->execute([$id, (int)$data['stok'], (int)$data['stok']]);
    }
    
    sendSuccess(['id' => $id], 'Produk berhasil diperbarui');
}

function deleteProduk(int $id): void {
    $user = requireAuth();
    $db   = getDB();
    
    $stmt = $db->prepare("SELECT p.id_produk, k.id_pengguna FROM produk p JOIN kios k ON p.id_kios = k.id_kios WHERE p.id_produk = ?");
    $stmt->execute([$id]);
    $produk = $stmt->fetch();
    if (!$produk) sendError('Produk tidak ditemukan', 404);
    if ($user['peran'] !== 'admin' && $produk['id_pengguna'] != $user['id_pengguna']) {
        sendError('Anda tidak memiliki akses', 403);
    }
    
    $db->prepare("UPDATE produk SET status = 'nonaktif' WHERE id_produk = ?")->execute([$id]);
    sendSuccess(null, 'Produk berhasil dihapus');
}

// ── Admin: list semua produk dari semua kios (dengan filter) ────────────────
function adminListProduk(): void {
    $user = requireAuth();
    if ($user['peran'] !== 'admin') sendError('Akses ditolak', 403);

    $db     = getDB();
    $where  = ['1=1'];
    $params = [];

    if (!empty($_GET['idKios'])) {
        $where[]  = 'p.id_kios = ?';
        $params[] = (int)$_GET['idKios'];
    }
    if (!empty($_GET['status'])) {
        $where[]  = 'p.status = ?';
        $params[] = $_GET['status'];
    }
    if (!empty($_GET['q'])) {
        $where[]  = 'p.nama_produk LIKE ?';
        $params[] = '%' . $_GET['q'] . '%';
    }

    $limit  = min((int)($_GET['limit'] ?? 50), 200);
    $offset = (int)($_GET['offset'] ?? 0);
    $sql = "
        SELECT p.id_produk AS id, p.nama_produk AS nama, p.slug,
               p.jenis_hewan AS jenisHewan, p.tipe_produk AS tipeProduk,
               p.harga, p.harga_diskon AS hargaDiskon, p.berat_gram AS beratGram,
               p.foto_utama AS foto, p.terjual, p.rating_avg AS rating,
               p.status, p.created_at AS createdAt,
               k.id_kios AS idKios, k.nama_kios AS namaKios,
               sp.jumlah_stok AS stok
        FROM produk p
        JOIN kios k ON p.id_kios = k.id_kios
        LEFT JOIN stok_produk sp ON sp.id_produk = p.id_produk
        WHERE " . implode(' AND ', $where) . "
        ORDER BY p.created_at DESC
        LIMIT $limit OFFSET $offset
    ";

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    $countSql  = "SELECT COUNT(*) FROM produk p WHERE " . implode(' AND ', $where);
    $cStmt     = $db->prepare($countSql);
    $cStmt->execute($params);
    $total     = (int)$cStmt->fetchColumn();

    sendSuccess(['produk' => $rows, 'total' => $total]);
}

// ── Admin: approve atau reject produk ───────────────────────────────────────
function approveRejectProduk(int $id, string $status): void {
    $user = requireAuth();
    if ($user['peran'] !== 'admin') sendError('Akses ditolak', 403);

    $db = getDB();
    $stmt = $db->prepare('SELECT id_produk FROM produk WHERE id_produk = ?');
    $stmt->execute([$id]);
    if (!$stmt->fetch()) sendError('Produk tidak ditemukan', 404);

    $db->prepare('UPDATE produk SET status = ? WHERE id_produk = ?')->execute([$status, $id]);
    $msg = $status === 'aktif' ? 'Produk disetujui dan sekarang aktif' : 'Produk berhasil dinonaktifkan';
    sendSuccess(['id' => $id, 'status' => $status], $msg);
}

function listKategori(): void {
    $db = getDB();
    $stmt = $db->query("SELECT id_kategori AS id, nama_kategori AS nama, slug, jenis_hewan AS jenis, tipe_produk AS tipe FROM kategori_produk WHERE status = 'aktif' ORDER BY urutan");
    $rows = $stmt->fetchAll();
    
    // Add icon based on tipe
    $icons = [
        'makanan-kucing' => ['icon' => '🐱', 'warna' => 'orange'],
        'makanan-anjing' => ['icon' => '🐶', 'warna' => 'blue'],
        'pasir-kucing'   => ['icon' => '🪣', 'warna' => 'yellow'],
        'pasir-anjing'   => ['icon' => '🪣', 'warna' => 'green'],
        'mainan-kucing'  => ['icon' => '🎾', 'warna' => 'purple'],
        'mainan-anjing'  => ['icon' => '🦴', 'warna' => 'red'],
        'aksesoris-kucing' => ['icon' => '🎀', 'warna' => 'pink'],
        'aksesoris-anjing' => ['icon' => '🏷️', 'warna' => 'teal'],
        'kesehatan-kucing' => ['icon' => '💊', 'warna' => 'cyan'],
        'kesehatan-anjing' => ['icon' => '💉', 'warna' => 'indigo'],
    ];
    
    $rows = array_map(fn($r) => array_merge($r, $icons[$r['slug']] ?? ['icon' => '📦', 'warna' => 'gray']), $rows);
    sendSuccess($rows);
}

function slugify(string $text): string {
    $text = strtolower($text);
    $text = preg_replace('/[^a-z0-9\s-]/', '', $text);
    $text = preg_replace('/\s+/', '-', trim($text));
    return $text;
}
