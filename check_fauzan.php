<?php
require_once __DIR__ . '/api/config.php';
$db = getDB();
$stmt = $db->prepare('
    SELECT p.id_pengguna, p.nama_lengkap, p.email, p.peran,
           k.id_kios, k.nama_kios, k.status AS status_kios,
           lk.lat, lk.lng, lk.alamat_lengkap, lk.kota
    FROM pengguna p
    LEFT JOIN kios k ON k.id_pengguna = p.id_pengguna
    LEFT JOIN lokasi_kios lk ON lk.id_kios = k.id_kios
    WHERE p.email = ?
');
$stmt->execute(['fauzan@gmail.com']);
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($rows, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
