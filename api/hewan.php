<?php
// ============================================================
// PetPlace API — Hewan Peliharaan
// ============================================================
require_once __DIR__ . '/config.php';
setCORSHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ($action) {
    case 'list':
        if ($method !== 'GET') sendError('Method not allowed', 405);
        listHewan();
        break;
    case 'add':
        if ($method !== 'POST') sendError('Method not allowed', 405);
        addHewan();
        break;
    case 'delete':
        if ($method !== 'DELETE' && $method !== 'POST') sendError('Method not allowed', 405);
        deleteHewan();
        break;
    default:
        sendError('Action tidak ditemukan', 404);
}

function listHewan(): void {
    $user = requireAuth();
    $db = getDB();
    
    $stmt = $db->prepare("
        SELECT id_hewan AS id, nama_hewan AS nama, jenis_hewan AS jenis,
               ras, jenis_kelamin AS kelamin, tanggal_lahir AS lahir,
               berat_kg AS berat, catatan_kesehatan AS catatan, foto
        FROM hewan_peliharaan
        WHERE id_pengguna = ?
        ORDER BY id_hewan DESC
    ");
    $stmt->execute([$user['id_pengguna']]);
    sendSuccess($stmt->fetchAll());
}

function addHewan(): void {
    $user = requireAuth();
    $data = getRequestBody();
    
    $nama = trim($data['nama'] ?? '');
    $jenis = trim($data['jenis'] ?? 'kucing'); // kucing / anjing
    
    if (!$nama) {
        sendError('Nama hewan wajib diisi');
    }
    if ($jenis !== 'kucing' && $jenis !== 'anjing') {
        sendError('Jenis hewan tidak valid');
    }
    
    $db = getDB();
    
    // Save image if present (in base64 format)
    $dbPath = '';
    if (!empty($data['foto']) && preg_match('/^data:image\/(\w+);base64,/', $data['foto'], $type)) {
        $fotoData = substr($data['foto'], strpos($data['foto'], ',') + 1);
        $ext = strtolower($type[1]);
        if (in_array($ext, ['jpg', 'jpeg', 'gif', 'png'])) {
            $decoded = base64_decode($fotoData);
            if ($decoded !== false) {
                $filename = 'pet_' . $user['id_pengguna'] . '_' . time() . '.' . $ext;
                $uploadDir = __DIR__ . '/../uploads/';
                if (!is_dir($uploadDir)) {
                    @mkdir($uploadDir, 0755, true);
                }
                if (@file_put_contents($uploadDir . $filename, $decoded) !== false) {
                    $dbPath = '/uploads/' . $filename;
                }
            }
        }
    }
    
    $stmt = $db->prepare("
        INSERT INTO hewan_peliharaan (id_pengguna, nama_hewan, jenis_hewan, ras, jenis_kelamin, tanggal_lahir, berat_kg, catatan_kesehatan, foto)
        VALUES (?,?,?,?,?,?,?,?,?)
    ");
    $stmt->execute([
        $user['id_pengguna'],
        $nama,
        $jenis,
        $data['ras'] ?? '',
        $data['kelamin'] ?? 'Jantan',
        !empty($data['lahir']) ? $data['lahir'] : null,
        !empty($data['berat']) ? (float)$data['berat'] : null,
        $data['catatan'] ?? '',
        $dbPath
    ]);
    
    sendSuccess(['id' => $db->lastInsertId()], 'Hewan peliharaan berhasil ditambahkan');
}

function deleteHewan(): void {
    $user = requireAuth();
    $id = (int)($_GET['id'] ?? 0);
    
    if (!$id) {
        sendError('ID hewan wajib diisi');
    }
    
    $db = getDB();
    
    // Check owner
    $stmt = $db->prepare("SELECT id_pengguna FROM hewan_peliharaan WHERE id_hewan = ?");
    $stmt->execute([$id]);
    $hewan = $stmt->fetch();
    
    if (!$hewan) {
        sendError('Hewan tidak ditemukan', 404);
    }
    if ($hewan['id_pengguna'] != $user['id_pengguna']) {
        sendError('Bukan pemilik hewan ini', 403);
    }
    
    $db->prepare("DELETE FROM hewan_peliharaan WHERE id_hewan = ?")->execute([$id]);
    sendSuccess(null, 'Hewan peliharaan berhasil dihapus');
}
