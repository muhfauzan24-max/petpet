<?php
// ============================================================
// PetPlace API — Chat Percakapan & Pesan
// ============================================================
require_once __DIR__ . '/config.php';
setCORSHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ($action) {
    case 'list':
        if ($method !== 'GET') sendError('Method not allowed', 405);
        listConversations();
        break;
    case 'messages':
        if ($method !== 'GET') sendError('Method not allowed', 405);
        listMessages();
        break;
    case 'send':
        if ($method !== 'POST') sendError('Method not allowed', 405);
        sendMessage();
        break;
    default:
        sendError('Action tidak ditemukan', 404);
}

// Get active conversations list
function listConversations(): void {
    $user = requireAuth();
    $db = getDB();
    
    // Cek peran user
    if ($user['peran'] === 'pembeli') {
        // Pembeli: ambil percakapan yang dikirim oleh pengguna ini
        $stmt = $db->prepare("
            SELECT c.id_percakapan AS id, c.tipe_mitra AS tipeMitra, c.id_mitra AS idMitra,
                   c.pesan_terakhir AS pesanTerakhir, c.waktu_terakhir AS waktuTerakhir, c.belum_dibaca AS belumDibaca,
                   CASE 
                     WHEN c.tipe_mitra = 'kios' THEN (SELECT nama_kios FROM kios WHERE id_kios = c.id_mitra)
                     WHEN c.tipe_mitra = 'dokter' THEN (SELECT nama_dokter FROM dokter_hewan WHERE id_dokter = c.id_mitra)
                     WHEN c.tipe_mitra = 'grooming' THEN (SELECT nama_usaha FROM penyedia_grooming WHERE id_grooming = c.id_mitra)
                   END AS nama,
                   CASE 
                     WHEN c.tipe_mitra = 'kios' THEN (SELECT logo FROM kios WHERE id_kios = c.id_mitra)
                     WHEN c.tipe_mitra = 'dokter' THEN (SELECT foto FROM dokter_hewan WHERE id_dokter = c.id_mitra)
                     WHEN c.tipe_mitra = 'grooming' THEN (SELECT foto FROM penyedia_grooming WHERE id_grooming = c.id_mitra)
                   END AS foto
            FROM percakapan c
            WHERE c.id_pengguna = ?
            ORDER BY c.waktu_terakhir DESC
        ");
        $stmt->execute([$user['id_pengguna']]);
        sendSuccess($stmt->fetchAll());
    } else {
        // Mitra (owner, dokter, grooming): cari id_mitra yang sesuai dengan user login
        $idMitra = 0;
        $tipeMitra = $user['peran'];
        
        if ($user['peran'] === 'owner') {
            $k = $db->prepare("SELECT id_kios FROM kios WHERE id_pengguna = ? LIMIT 1");
            $k->execute([$user['id_pengguna']]);
            $idMitra = (int)($k->fetchColumn() ?: 0);
            $tipeMitra = 'kios';
        } elseif ($user['peran'] === 'dokter') {
            $d = $db->prepare("SELECT id_dokter FROM dokter_hewan WHERE id_pengguna = ? LIMIT 1");
            $d->execute([$user['id_pengguna']]);
            $idMitra = (int)($d->fetchColumn() ?: 0);
        } elseif ($user['peran'] === 'grooming') {
            $g = $db->prepare("SELECT id_grooming FROM penyedia_grooming WHERE id_pengguna = ? LIMIT 1");
            $g->execute([$user['id_pengguna']]);
            $idMitra = (int)($g->fetchColumn() ?: 0);
        }
        
        if (!$idMitra) {
            sendSuccess([]); // Belum punya entri mitra aktif
        }
        
        // Ambil semua percakapan yang masuk ke idMitra & tipeMitra ini
        $stmt = $db->prepare("
            SELECT c.id_percakapan AS id, c.tipe_mitra AS tipeMitra, c.id_mitra AS idMitra,
                   c.pesan_terakhir AS pesanTerakhir, c.waktu_terakhir AS waktuTerakhir, c.belum_dibaca AS belumDibaca,
                   p.nama_lengkap AS nama, p.foto_profil AS foto, p.id_pengguna AS idPengguna
            FROM percakapan c
            JOIN pengguna p ON c.id_pengguna = p.id_pengguna
            WHERE c.id_mitra = ? AND c.tipe_mitra = ?
            ORDER BY c.waktu_terakhir DESC
        ");
        $stmt->execute([$idMitra, $tipeMitra]);
        sendSuccess($stmt->fetchAll());
    }
}

// Get messages for a conversation
function listMessages(): void {
    $user = requireAuth();
    $idConv = (int)($_GET['id'] ?? 0);
    $db = getDB();
    
    // Jika tidak ada ID percakapan, cari berdasarkan parameter idMitra dan tipeMitra (untuk mulai baru)
    if (!$idConv) {
        $idMitra = (int)($_GET['idMitra'] ?? 0);
        $tipeMitra = trim($_GET['tipeMitra'] ?? '');
        if ($idMitra && $tipeMitra) {
            $stmt = $db->prepare("SELECT id_percakapan FROM percakapan WHERE id_pengguna = ? AND id_mitra = ? AND tipe_mitra = ? LIMIT 1");
            $stmt->execute([$user['id_pengguna'], $idMitra, $tipeMitra]);
            $idConv = (int)($stmt->fetchColumn() ?: 0);
        }
    }
    
    if (!$idConv) {
        sendSuccess([]); // Percakapan baru, belum ada pesan
    }
    
    // Update status dibaca
    $db->prepare("UPDATE pesan SET sudah_dibaca = 1 WHERE id_percakapan = ? AND id_pengirim != ?")->execute([$idConv, $user['id_pengguna']]);
    
    $stmt = $db->prepare("
        SELECT id_pesan AS id, id_percakapan AS idPercakapan, pengirim_tipe AS pengirimTipe,
               id_pengirim AS idPengirim, isi_pesan AS text, created_at AS createdAt,
               DATE_FORMAT(created_at, '%H:%i') AS time,
               CASE WHEN id_pengirim = ? THEN 'user' ELSE 'mitra' END AS `from`
        FROM pesan
        WHERE id_percakapan = ?
        ORDER BY id_pesan ASC
    ");
    $stmt->execute([$user['id_pengguna'], $idConv]);
    sendSuccess($stmt->fetchAll());
}

// Send message
function sendMessage(): void {
    $user = requireAuth();
    $data = getRequestBody();
    
    $text = trim($data['text'] ?? '');
    $idMitra = (int)($data['idMitra'] ?? 0);
    $tipeMitra = trim($data['tipeMitra'] ?? '');
    $idConv = (int)($data['idPercakapan'] ?? 0);
    
    if (!$text) {
        sendError('Pesan tidak boleh kosong');
    }
    
    $db = getDB();
    $db->beginTransaction();
    
    try {
        // Jika tidak ada ID percakapan, cari atau buat percakapan baru
        if (!$idConv && $idMitra && $tipeMitra) {
            $stmt = $db->prepare("SELECT id_percakapan FROM percakapan WHERE id_pengguna = ? AND id_mitra = ? AND tipe_mitra = ? LIMIT 1");
            $stmt->execute([$user['id_pengguna'], $idMitra, $tipeMitra]);
            $idConv = (int)($stmt->fetchColumn() ?: 0);
            
            if (!$idConv) {
                // Buat percakapan baru
                $ins = $db->prepare("INSERT INTO percakapan (id_pengguna, tipe_mitra, id_mitra, pesan_terakhir, waktu_terakhir) VALUES (?,?,?,?,NOW())");
                $ins->execute([$user['id_pengguna'], $tipeMitra, $idMitra, $text]);
                $idConv = $db->lastInsertId();
            }
        }
        
        if (!$idConv) {
            throw new Exception("Percakapan tidak valid");
        }
        
        // Simpan pesan
        $senderType = ($user['peran'] === 'pembeli') ? 'pengguna' : 'mitra';
        $insMsg = $db->prepare("
            INSERT INTO pesan (id_percakapan, pengirim_tipe, id_pengirim, isi_pesan, sudah_dibaca)
            VALUES (?,?,?,?,0)
        ");
        $insMsg->execute([$idConv, $senderType, $user['id_pengguna'], $text]);
        
        // Update percakapan info
        $upd = $db->prepare("UPDATE percakapan SET pesan_terakhir = ?, waktu_terakhir = NOW() WHERE id_percakapan = ?");
        $upd->execute([$text, $idConv]);
        
        $db->commit();
        sendSuccess(['idPercakapan' => $idConv], 'Pesan berhasil dikirim');
        
    } catch (Exception $e) {
        $db->rollBack();
        sendError('Gagal mengirim pesan: ' . $e->getMessage());
    }
}
