<?php
require_once __DIR__ . '/config.php';
setCORSHeaders();

// We will simulate calling handleUpdateProfile for Naomi (id=2)
try {
    $db = getDB();
    $user = $db->query("SELECT * FROM pengguna WHERE id_pengguna = 2")->fetch();
    if (!$user) throw new Exception("User Naomi not found");
    
    // Let's run the update profile code directly to see if any warning/error is thrown
    $nama = "Naomi";
    $telepon = "083646282";
    $foto = $user['foto_profil'] ?? '';
    $kota = "Makassar";
    
    // Test the UPDATE query
    $stmt = $db->prepare("UPDATE pengguna SET nama_lengkap = ?, no_telepon = ?, foto_profil = ?, kota = ? WHERE id_pengguna = ?");
    $stmt->execute([$nama, $telepon, $foto, $kota, $user['id_pengguna']]);
    
    // Test the SELECT query
    $stmtMe = $db->prepare("SELECT id_pengguna, nama_lengkap, email, peran, status, foto_profil, no_telepon, kota, created_at FROM pengguna WHERE id_pengguna = ?");
    $stmtMe->execute([$user['id_pengguna']]);
    $userData = $stmtMe->fetch();
    
    // Test Kios info
    $kiosInfo = null;
    $kStmt = $db->prepare("SELECT id_kios AS id, nama_kios AS nama, status FROM kios WHERE id_pengguna = ? LIMIT 1");
    $kStmt->execute([$userData['id_pengguna']]);
    $kiosInfo = $kStmt->fetch() ?: null;
    
    // Test Dokter info
    $dokterInfo = null;
    $dStmt = $db->prepare("SELECT id_dokter AS id, nama_dokter AS nama, status FROM dokter_hewan WHERE id_pengguna = ? LIMIT 1");
    $dStmt->execute([$userData['id_pengguna']]);
    $dokterInfo = $dStmt->fetch() ?: null;
    
    // Test Grooming info
    $groomingInfo = null;
    $gStmt = $db->prepare("SELECT id_grooming AS id, nama_usaha AS nama, status FROM penyedia_grooming WHERE id_pengguna = ? LIMIT 1");
    $gStmt->execute([$userData['id_pengguna']]);
    $groomingInfo = $gStmt->fetch() ?: null;
    
    echo json_encode([
        'success' => true,
        'message' => 'Simulasi update profile berhasil',
        'user' => $userData,
        'kios' => $kiosInfo,
        'dokter' => $dokterInfo,
        'grooming' => $groomingInfo
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
}
