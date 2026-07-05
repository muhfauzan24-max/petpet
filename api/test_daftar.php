<?php
require_once __DIR__ . '/config.php';
try {
    $db = getDB();
    echo "<pre>";
    echo "Testing INSERT query for kios table...\n";
    
    // Attempt insert with mock data
    $stmt = $db->prepare("
        INSERT INTO kios (id_pengguna, nama_kios, slug, deskripsi, no_telepon, email_kios, jam_buka, jam_tutup, hari_operasi, no_rekening, nama_bank, nama_pemilik_rek, qris_image, status)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,'pending')
    ");
    
    // We will use user ID 1 (admin) as a test
    $success = $stmt->execute([
        1, 'Test Kios ' . rand(1,999), 'test-kios-' . rand(1,999),
        'Deskripsi test', '08123456789', 'test@kios.com',
        '08:00', '17:00', 'Senin-Sabtu',
        '12345678', 'BCA', 'Test Owner', 'mock_qris'
    ]);
    
    if ($success) {
        echo "✅ INSERT KIOS SUCCESS!\n";
        $kiosId = $db->lastInsertId();
        // clean up
        $db->exec("DELETE FROM lokasi_kios WHERE id_kios = $kiosId");
        $db->exec("DELETE FROM kios WHERE id_kios = $kiosId");
        echo "✅ Cleaned up test data.\n";
    } else {
        echo "❌ INSERT KIOS FAILED without throwing exception.\n";
    }
} catch (Exception $e) {
    echo "❌ INSERT KIOS FAILED WITH EXCEPTION:\n";
    echo $e->getMessage() . "\n";
}
echo "</pre>";
