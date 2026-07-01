<?php
// ============================================================
// PetPlace API — Auth (Login, Register, Logout, Me)
// ============================================================
require_once __DIR__ . '/config.php';
setCORSHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ($action) {
    case 'login':
        if ($method !== 'POST') sendError('Method not allowed', 405);
        handleLogin();
        break;
    case 'register':
        if ($method !== 'POST') sendError('Method not allowed', 405);
        handleRegister();
        break;
    case 'logout':
        if ($method !== 'POST') sendError('Method not allowed', 405);
        handleLogout();
        break;
    case 'me':
        handleMe();
        break;
    case 'change-password':
        if ($method !== 'POST') sendError('Method not allowed', 405);
        handleChangePassword();
        break;
    default:
        sendError('Action tidak ditemukan', 404);
}

function handleLogin(): void {
    $data = getRequestBody();
    $email = trim($data['email'] ?? '');
    $password = $data['password'] ?? '';
    
    if (!$email || !$password) sendError('Email dan password wajib diisi');
    
    $db = getDB();
    $stmt = $db->prepare("SELECT * FROM pengguna WHERE email = ? LIMIT 1");
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    
    if (!$user || !password_verify($password, $user['password'])) {
        sendError('Email atau password salah', 401);
    }
    
    if ($user['status'] !== 'aktif') {
        sendError('Akun Anda belum aktif atau telah dinonaktifkan. Hubungi admin.', 403);
    }
    
    // Generate token
    $token = bin2hex(random_bytes(32));
    $expired = date('Y-m-d H:i:s', strtotime('+7 days'));
    $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
    $ua = $_SERVER['HTTP_USER_AGENT'] ?? '';
    
    $db->prepare("INSERT INTO sesi_login (id_pengguna, token, ip_address, user_agent, expired_at) VALUES (?,?,?,?,?)")
       ->execute([$user['id_pengguna'], $token, $ip, $ua, $expired]);
    
    // Update last IP
    $db->prepare("UPDATE pengguna SET ip_terakhir = ? WHERE id_pengguna = ?")
       ->execute([$ip, $user['id_pengguna']]);
    
    // Get kios if owner
    $kiosInfo = null;
    if ($user['peran'] === 'owner') {
        $kStmt = $db->prepare("SELECT id_kios AS id, nama_kios AS nama, status FROM kios WHERE id_pengguna = ? LIMIT 1");
        $kStmt->execute([$user['id_pengguna']]);
        $kiosInfo = $kStmt->fetch();
    }
    
    // Get dokter if dokter
    $dokterInfo = null;
    if ($user['peran'] === 'dokter') {
        $dStmt = $db->prepare("SELECT id_dokter AS id, nama_dokter AS nama, status FROM dokter_hewan WHERE id_pengguna = ? LIMIT 1");
        $dStmt->execute([$user['id_pengguna']]);
        $dokterInfo = $dStmt->fetch();
    }
    
    // Get grooming if grooming
    $groomingInfo = null;
    if ($user['peran'] === 'grooming') {
        $gStmt = $db->prepare("SELECT id_grooming AS id, nama_usaha AS nama, status FROM penyedia_grooming WHERE id_pengguna = ? LIMIT 1");
        $gStmt->execute([$user['id_pengguna']]);
        $groomingInfo = $gStmt->fetch();
    }

    sendSuccess([
        'token' => $token,
        'user' => [
            'id'        => $user['id_pengguna'],
            'nama'      => $user['nama_lengkap'],
            'email'     => $user['email'],
            'peran'     => $user['peran'],
            'status'    => $user['status'],
            'foto'      => $user['foto_profil'],
            'telepon'   => $user['no_telepon'],
            'kios'      => $kiosInfo,
            'dokter'    => $dokterInfo,
            'grooming'  => $groomingInfo,
        ]
    ], 'Login berhasil');
}

function handleRegister(): void {
    $data = getRequestBody();
    $nama     = trim($data['nama'] ?? '');
    $email    = trim(strtolower($data['email'] ?? ''));
    $password = $data['password'] ?? '';
    $telepon  = trim($data['telepon'] ?? '');
    $peran    = $data['peran'] ?? 'pembeli';
    
    if (!$nama || !$email || !$password) sendError('Nama, email, dan password wajib diisi');
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) sendError('Format email tidak valid');
    if (strlen($password) < 6) sendError('Password minimal 6 karakter');
    
    $allowedRoles = ['pembeli', 'owner', 'dokter', 'grooming'];
    if (!in_array($peran, $allowedRoles)) $peran = 'pembeli';
    
    $db = getDB();
    
    // Check existing
    $stmt = $db->prepare("SELECT id_pengguna FROM pengguna WHERE email = ? LIMIT 1");
    $stmt->execute([$email]);
    if ($stmt->fetch()) sendError('Email sudah terdaftar. Gunakan email lain atau login.');
    
    $hash  = password_hash($password, PASSWORD_BCRYPT);
    $foto  = "https://api.dicebear.com/7.x/avataaars/svg?seed=" . urlencode($email);
    // Pembeli langsung aktif, peran lain perlu verifikasi
    $status = ($peran === 'pembeli') ? 'aktif' : 'aktif';
    
    $db->prepare("INSERT INTO pengguna (nama_lengkap, email, password, no_telepon, foto_profil, peran, status) VALUES (?,?,?,?,?,?,?)")
       ->execute([$nama, $email, $hash, $telepon, $foto, $peran, $status]);
    
    $newId = $db->lastInsertId();
    
    // Auto-login
    $token = bin2hex(random_bytes(32));
    $expired = date('Y-m-d H:i:s', strtotime('+7 days'));
    $db->prepare("INSERT INTO sesi_login (id_pengguna, token, ip_address, expired_at) VALUES (?,?,?,?)")
       ->execute([$newId, $token, $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1', $expired]);
    
    sendSuccess([
        'token' => $token,
        'user'  => [
            'id'     => $newId,
            'nama'   => $nama,
            'email'  => $email,
            'peran'  => $peran,
            'status' => $status,
            'foto'   => $foto,
            'telepon' => $telepon,
        ]
    ], 'Registrasi berhasil');
}

function handleLogout(): void {
    $user = requireAuth();
    $headers = getallheaders();
    $token = str_replace('Bearer ', '', $headers['Authorization'] ?? '');
    
    $db = getDB();
    $db->prepare("DELETE FROM sesi_login WHERE token = ?")->execute([$token]);
    sendSuccess(null, 'Logout berhasil');
}

function handleMe(): void {
    $user = requireAuth();
    $db = getDB();
    
    $stmt = $db->prepare("SELECT id_pengguna, nama_lengkap, email, peran, status, foto_profil, no_telepon, kota, provinsi, created_at FROM pengguna WHERE id_pengguna = ?");
    $stmt->execute([$user['id_pengguna']]);
    $userData = $stmt->fetch();
    
    // Kios info (selalu cek, bukan hanya jika peran=owner)
    $kiosInfo = null;
    $kStmt = $db->prepare("SELECT id_kios AS id, nama_kios AS nama, status FROM kios WHERE id_pengguna = ? LIMIT 1");
    $kStmt->execute([$userData['id_pengguna']]);
    $kiosInfo = $kStmt->fetch() ?: null;
    // Jika punya kios tapi peran belum terupdate, fix otomatis
    if ($kiosInfo && $userData['peran'] === 'pembeli') {
        $db->prepare("UPDATE pengguna SET peran = 'owner' WHERE id_pengguna = ?")->execute([$userData['id_pengguna']]);
        $userData['peran'] = 'owner';
    }
    
    // Dokter info
    $dokterInfo = null;
    $dStmt = $db->prepare("SELECT id_dokter AS id, nama_dokter AS nama, status FROM dokter_hewan WHERE id_pengguna = ? LIMIT 1");
    $dStmt->execute([$userData['id_pengguna']]);
    $dokterInfo = $dStmt->fetch() ?: null;
    if ($dokterInfo && $userData['peran'] === 'pembeli') {
        $db->prepare("UPDATE pengguna SET peran = 'dokter' WHERE id_pengguna = ?")->execute([$userData['id_pengguna']]);
        $userData['peran'] = 'dokter';
    }
    
    // Grooming info
    $groomingInfo = null;
    $gStmt = $db->prepare("SELECT id_grooming AS id, nama_usaha AS nama, status FROM penyedia_grooming WHERE id_pengguna = ? LIMIT 1");
    $gStmt->execute([$userData['id_pengguna']]);
    $groomingInfo = $gStmt->fetch() ?: null;
    if ($groomingInfo && $userData['peran'] === 'pembeli') {
        $db->prepare("UPDATE pengguna SET peran = 'grooming' WHERE id_pengguna = ?")->execute([$userData['id_pengguna']]);
        $userData['peran'] = 'grooming';
    }
    
    sendSuccess([
        'id'        => $userData['id_pengguna'],
        'nama'      => $userData['nama_lengkap'],
        'email'     => $userData['email'],
        'peran'     => $userData['peran'],
        'status'    => $userData['status'],
        'foto'      => $userData['foto_profil'],
        'telepon'   => $userData['no_telepon'],
        'kota'      => $userData['kota'],
        'createdAt' => $userData['created_at'],
        'kios'      => $kiosInfo,
        'dokter'    => $dokterInfo,
        'grooming'  => $groomingInfo,
    ]);
}

function handleChangePassword(): void {
    $user = requireAuth();
    $data = getRequestBody();
    $oldPass = $data['oldPassword'] ?? '';
    $newPass = $data['newPassword'] ?? '';
    
    if (!$oldPass || !$newPass) sendError('Password lama dan baru wajib diisi');
    if (strlen($newPass) < 6) sendError('Password baru minimal 6 karakter');
    
    $db = getDB();
    $stmt = $db->prepare("SELECT password FROM pengguna WHERE id_pengguna = ?");
    $stmt->execute([$user['id_pengguna']]);
    $row = $stmt->fetch();
    
    if (!password_verify($oldPass, $row['password'])) {
        sendError('Password lama tidak benar');
    }
    
    $hash = password_hash($newPass, PASSWORD_BCRYPT);
    $db->prepare("UPDATE pengguna SET password = ? WHERE id_pengguna = ?")
       ->execute([$hash, $user['id_pengguna']]);
    
    sendSuccess(null, 'Password berhasil diubah');
}
