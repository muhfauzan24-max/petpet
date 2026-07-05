<?php
require_once __DIR__ . '/config.php';
setCORSHeaders();

try {
    $db = getDB();
    echo json_encode([
        'success' => true,
        'kios' => $db->query("SELECT id_kios, id_pengguna, nama_kios, status, created_at FROM kios")->fetchAll(),
        'pengguna' => $db->query("SELECT id_pengguna, nama_lengkap, email, peran, status FROM pengguna")->fetchAll()
    ]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
