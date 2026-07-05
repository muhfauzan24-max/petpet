<?php
require_once __DIR__ . '/config.php';
setCORSHeaders();

try {
    $db = getDB();
    
    // Query exactly what getPending() does:
    
    // Pending kios
    $kiosStmt = $db->query("
        SELECT k.id_kios AS id, k.nama_kios AS namaKios, k.no_telepon AS telepon,
               k.nama_bank AS namaBank, k.no_rekening AS noRekening, k.nama_pemilik_rek AS namaPemilik,
               k.created_at AS createdAt, p.nama_lengkap AS namaPengguna, p.email
        FROM kios k
        JOIN pengguna p ON k.id_pengguna = p.id_pengguna
        WHERE k.status = 'pending'
        ORDER BY k.created_at DESC
    ");
    $kios = $kiosStmt->fetchAll();
    
    echo json_encode([
        'success' => true,
        'pending_kios' => $kios
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
