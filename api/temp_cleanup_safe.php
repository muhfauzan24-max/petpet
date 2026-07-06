<?php
// ============================================================
// PetPlace API — Temporary Database Cleanup (Self-Destructive)
// ============================================================
require_once __DIR__ . '/config.php';
setCORSHeaders();

// Kunci keamanan rahasia untuk memicu penghapusan
$secret_key = "clean_petplace_2026_xyz";

if (($_GET['key'] ?? '') !== $secret_key) {
    sendError('Akses ditolak. Secret key tidak valid.', 403);
}

try {
    $db = getDB();
    $db->beginTransaction();

    // 1. Daftar email demo yang akan dihapus
    $demoEmails = ['kios1@petplace.id', 'kios2@petplace.id', 'rian@petplace.id', 'sarah@petplace.id', 'grooming1@petplace.id'];
    $placeholders = implode(',', array_fill(0, count($demoEmails), '?'));
    
    // Query ID pengguna demo
    $stmtUsers = $db->prepare("SELECT id_pengguna FROM pengguna WHERE email IN ($placeholders)");
    $stmtUsers->execute($demoEmails);
    $demoUserIds = $stmtUsers->fetchAll(PDO::FETCH_COLUMN);

    $logs = [];
    if (!empty($demoUserIds)) {
        $userIdsStr = implode(',', $demoUserIds);

        // Hapus ulasan
        $db->exec("DELETE FROM ulasan_produk WHERE id_pengguna IN ($userIdsStr)");
        $db->exec("DELETE FROM ulasan_dokter WHERE id_pengguna IN ($userIdsStr)");
        $db->exec("DELETE FROM ulasan_grooming WHERE id_pengguna IN ($userIdsStr)");
        $logs[] = "Ulasan demo dibersihkan.";

        // Hapus janji dokter & booking grooming yang berelasi dengan demo
        $db->exec("DELETE FROM janji_dokter WHERE id_pengguna IN ($userIdsStr) OR id_dokter IN (SELECT id_dokter FROM dokter_hewan WHERE id_pengguna IN ($userIdsStr))");
        $db->exec("DELETE FROM booking_grooming WHERE id_pengguna IN ($userIdsStr) OR id_grooming IN (SELECT id_grooming FROM penyedia_grooming WHERE id_pengguna IN ($userIdsStr))");
        $logs[] = "Janji temu & booking demo dibersihkan.";

        // Hapus pesanan & pembayaran
        $db->exec("DELETE FROM pembayaran WHERE id_pesanan IN (SELECT id_pesanan FROM pesanan WHERE id_pengguna IN ($userIdsStr) OR id_kios IN (SELECT id_kios FROM kios WHERE id_pengguna IN ($userIdsStr)))");
        $db->exec("DELETE FROM detail_pesanan WHERE id_pesanan IN (SELECT id_pesanan FROM pesanan WHERE id_pengguna IN ($userIdsStr) OR id_kios IN (SELECT id_kios FROM kios WHERE id_pengguna IN ($userIdsStr)))");
        $db->exec("DELETE FROM pesanan WHERE id_pengguna IN ($userIdsStr) OR id_kios IN (SELECT id_kios FROM kios WHERE id_pengguna IN ($userIdsStr))");
        $logs[] = "Pesanan & pembayaran demo dibersihkan.";

        // Hapus chat percakapan & pesan
        $db->exec("DELETE FROM pesan WHERE id_percakapan IN (SELECT id_percakapan FROM percakapan WHERE id_pengguna IN ($userIdsStr))");
        $db->exec("DELETE FROM percakapan WHERE id_pengguna IN ($userIdsStr)");
        $logs[] = "Chat percakapan demo dibersihkan.";

        // Hapus pengguna demo (cascading ke kios, produk, dokter, grooming)
        $stmtDelUser = $db->prepare("DELETE FROM pengguna WHERE email IN ($placeholders)");
        $stmtDelUser->execute($demoEmails);
        $logs[] = "Pengguna & Mitra demo (Kios, Dokter, Grooming) dibersihkan dari database.";
    } else {
        $logs[] = "Tidak ditemukan pengguna demo untuk dibersihkan.";
    }

    $db->commit();
    
    // HAPUS DIRI SENDIRI (Self-destructive untuk keamanan maksimal)
    @unlink(__FILE__);
    
    sendSuccess([
        'logs' => $logs,
        'self_destroyed' => true
    ], 'Database berhasil dibersihkan! File pembersih ini telah otomatis menghapus dirinya sendiri dari server.');

} catch (Exception $e) {
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }
    sendError('Gagal membersihkan database: ' . $e->getMessage(), 500);
}
