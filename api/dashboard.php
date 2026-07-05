<?php
// ============================================================
// PetPlace API — Dashboard Pengguna (Stats)
// ============================================================
require_once __DIR__ . '/config.php';
setCORSHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($action === 'stats') {
    if ($method !== 'GET') sendError('Method not allowed', 405);
    getUserStats();
} else {
    sendError('Action tidak ditemukan', 404);
}

function getUserStats(): void {
    $user = requireAuth();
    $db = getDB();
    
    // Hitung pesanan
    $totalPesanan = (int)$db->query("SELECT COUNT(*) FROM pesanan WHERE id_pengguna = " . (int)$user['id_pengguna'])->fetchColumn();
    $prosesPesanan = (int)$db->query("SELECT COUNT(*) FROM pesanan WHERE id_pengguna = " . (int)$user['id_pengguna'] . " AND status IN ('verifikasi', 'diproses', 'dikirim')")->fetchColumn();
    $selesaiPesanan = (int)$db->query("SELECT COUNT(*) FROM pesanan WHERE id_pengguna = " . (int)$user['id_pengguna'] . " AND status = 'selesai'")->fetchColumn();
    
    // Hitung hewan peliharaan
    $totalHewan = (int)$db->query("SELECT COUNT(*) FROM hewan_peliharaan WHERE id_pengguna = " . (int)$user['id_pengguna'])->fetchColumn();
    
    sendSuccess([
        'totalPesanan' => $totalPesanan,
        'prosesPesanan' => $prosesPesanan,
        'selesaiPesanan' => $selesaiPesanan,
        'totalHewan' => $totalHewan
    ]);
}
