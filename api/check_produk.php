<?php
require_once __DIR__ . '/config.php';

$db = getDB();
$stmt = $db->query("SELECT id_produk, nama_produk, status, id_kios FROM produk ORDER BY id_produk DESC LIMIT 10");
print_r($stmt->fetchAll());
