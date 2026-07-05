<?php
require_once __DIR__ . '/config.php';

$db = getDB();
$stmt = $db->prepare("SELECT id_pengguna, nama_lengkap, email, peran, status FROM pengguna WHERE id_pengguna = 2");
$stmt->execute();
print_r($stmt->fetch());
