<?php
// ============================================================
// PetPlace API — Clean Demo Data
// ============================================================
require_once __DIR__ . '/config.php';
setCORSHeaders();

try {
    $db = getDB();
    $db->beginTransaction();

    echo "<pre>=== STARTING DATABASE CLEANUP ===\n\n";

    // 1. Dapatkan ID pengguna demo
    $demoEmails = ['kios1@petplace.id', 'kios2@petplace.id', 'rian@petplace.id', 'sarah@petplace.id', 'grooming1@petplace.id'];
    $placeholders = implode(',', array_fill(0, count($demoEmails), '?'));
    
    // Query ID pengguna demo
    $stmtUsers = $db->prepare("SELECT id_pengguna FROM pengguna WHERE email IN ($placeholders)");
    $stmtUsers->execute($demoEmails);
    $demoUserIds = $stmtUsers->fetchAll(PDO::FETCH_COLUMN);

    if (!empty($demoUserIds)) {
        $userIdsStr = implode(',', $demoUserIds);

        // Hapus ulasan
        echo "1. Cleaning ulasan...\n";
        $db->exec("DELETE FROM ulasan_produk WHERE id_pengguna IN ($userIdsStr)");
        $db->exec("DELETE FROM ulasan_dokter WHERE id_pengguna IN ($userIdsStr)");
        $db->exec("DELETE FROM ulasan_grooming WHERE id_pengguna IN ($userIdsStr)");

        // Hapus janji dokter & booking grooming yang berelasi dengan demo
        echo "2. Cleaning janji temu & booking...\n";
        $db->exec("DELETE FROM janji_dokter WHERE id_pengguna IN ($userIdsStr) OR id_dokter IN (SELECT id_dokter FROM dokter_hewan WHERE id_pengguna IN ($userIdsStr))");
        $db->exec("DELETE FROM booking_grooming WHERE id_pengguna IN ($userIdsStr) OR id_grooming IN (SELECT id_grooming FROM penyedia_grooming WHERE id_pengguna IN ($userIdsStr))");

        // Hapus pesanan & pembayaran
        echo "3. Cleaning pesanan & pembayaran...\n";
        $db->exec("DELETE FROM pembayaran WHERE id_pesanan IN (SELECT id_pesanan FROM pesanan WHERE id_pengguna IN ($userIdsStr) OR id_kios IN (SELECT id_kios FROM kios WHERE id_pengguna IN ($userIdsStr)))");
        $db->exec("DELETE FROM detail_pesanan WHERE id_pesanan IN (SELECT id_pesanan FROM pesanan WHERE id_pengguna IN ($userIdsStr) OR id_kios IN (SELECT id_kios FROM kios WHERE id_pengguna IN ($userIdsStr)))");
        $db->exec("DELETE FROM pesanan WHERE id_pengguna IN ($userIdsStr) OR id_kios IN (SELECT id_kios FROM kios WHERE id_pengguna IN ($userIdsStr))");

        // Hapus chat percakapan & pesan
        echo "4. Cleaning percakapan & pesan...\n";
        $db->exec("DELETE FROM pesan WHERE id_percakapan IN (SELECT id_percakapan FROM percakapan WHERE id_pengguna IN ($userIdsStr))");
        $db->exec("DELETE FROM percakapan WHERE id_pengguna IN ($userIdsStr)");

        // Hapus pengguna demo (cascading ke kios, produk, dokter, grooming karena ON DELETE CASCADE)
        echo "5. Deleting demo users (cascading to kiosks, products, doctors, grooming)...\n";
        $stmtDelUser = $db->prepare("DELETE FROM pengguna WHERE email IN ($placeholders)");
        $stmtDelUser->execute($demoEmails);
        echo "   Demo users deleted.\n\n";
    }

    // 6. Hapus kategori produk demo (slugs: makanan, aksesoris, kesehatan, mainan, perawatan)
    echo "6. Deleting demo categories...\n";
    $demoSlugs = ['makanan', 'aksesoris', 'kesehatan', 'mainan', 'perawatan'];
    $slugPlaceholders = implode(',', array_fill(0, count($demoSlugs), '?'));
    $stmtDelCat = $db->prepare("DELETE FROM kategori_produk WHERE slug IN ($slugPlaceholders)");
    $stmtDelCat->execute($demoSlugs);
    echo "   Demo categories deleted.\n\n";

    $db->commit();
    echo "=========================================\n";
    echo "🎉 DATABASE CLEANUP COMPLETED SUCCESSFULLY!\n";
    echo "=========================================\n";
    echo "</pre>";

} catch (Exception $e) {
    if (isset($db)) {
        $db->rollBack();
    }
    echo "<pre>❌ CLEANUP FAILED: " . $e->getMessage() . "\n" . $e->getTraceAsString() . "</pre>";
}
