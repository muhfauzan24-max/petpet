<?php
require_once __DIR__ . '/config.php';
$db = getDB();

echo "=== USERS ===\n";
print_r($db->query('SELECT id_pengguna, nama_lengkap, email, peran, status FROM pengguna')->fetchAll(PDO::FETCH_ASSOC));

echo "\n=== KIOS ===\n";
print_r($db->query('SELECT id_kios, id_pengguna, nama_kios, status FROM kios')->fetchAll(PDO::FETCH_ASSOC));

echo "\n=== DOKTER ===\n";
print_r($db->query('SELECT id_dokter, id_pengguna, nama_dokter, status FROM dokter_hewan')->fetchAll(PDO::FETCH_ASSOC));

echo "\n=== GROOMING ===\n";
print_r($db->query('SELECT id_grooming, id_pengguna, nama_usaha, status FROM penyedia_grooming')->fetchAll(PDO::FETCH_ASSOC));
