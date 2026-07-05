<?php
require_once __DIR__ . '/config.php';
setCORSHeaders();

try {
    $db = getDB();
    
    // Simulate login for Naomi (id_pengguna = 2)
    // Find Naomi
    $user = $db->query("SELECT * FROM pengguna WHERE id_pengguna = 2")->fetch();
    if (!$user) {
        throw new Exception("User Naomi not found in DB");
    }
    
    // Let's manually trigger the daftarKios logic using Naomi's user context
    // We will bypass the token check by mocking $_SERVER['HTTP_AUTHORIZATION'] or by running the code directly
    
    // Let's get input data
    $data = [
        'namaKios' => 'Test Kios Naomi',
        'namaBank' => 'BCA',
        'noRekening' => '1234567890',
        'namaPemilikRek' => 'Naomi',
        'deskripsi' => 'Kios deskripsi Naomi',
        'telepon' => '08123456789',
        'email' => 'naomikios@gmail.com',
        'jamBuka' => '08:00',
        'jamTutup' => '17:00',
        'hariOperasi' => 'Senin-Sabtu',
        'lat' => '-5.1477',
        'lng' => '119.4327',
        'alamat' => 'Jl. Urip Sumoharjo No. 1'
    ];
    
    $nama = trim($data['namaKios']);
    $slug = slugify($nama) . '-' . substr(md5(microtime()), 0, 6);
    
    $db->beginTransaction();
    
    $stmt = $db->prepare("
        INSERT INTO kios (id_pengguna, nama_kios, slug, deskripsi, no_telepon, email_kios, jam_buka, jam_tutup, hari_operasi, no_rekening, nama_bank, nama_pemilik_rek, qris_image, status)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,'pending')
    ");
    $stmt->execute([
        $user['id_pengguna'], $nama, $slug,
        $data['deskripsi'] ?? '',
        $data['telepon'] ?? '',
        $data['email'] ?? '',
        $data['jamBuka'] ?? '08:00',
        $data['jamTutup'] ?? '17:00',
        $data['hariOperasi'] ?? 'Senin-Sabtu',
        $data['noRekening'],
        $data['namaBank'],
        $data['namaPemilikRek'],
        $data['qris'] ?? '',
    ]);
    
    $kiosId = $db->lastInsertId();
    
    $locStmt = $db->prepare("INSERT INTO lokasi_kios (id_kios, tipe, alamat_lengkap, kota, lat, lng) VALUES (?,?,?,?,?,?)");
    $locStmt->execute([$kiosId, 'kios', $data['alamat'] ?? '', 'Makassar', $data['lat'], $data['lng']]);
    
    $userStmt = $db->prepare("UPDATE pengguna SET peran = 'owner' WHERE id_pengguna = ?");
    $userStmt->execute([$user['id_pengguna']]);
    
    $db->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'Simulasi pendaftaran berhasil',
        'kios_id' => $kiosId
    ]);
    
} catch (Exception $e) {
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
}
