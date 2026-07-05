<?php
require_once __DIR__ . '/config.php';

$db = getDB();
$stmt = $db->query("SELECT id_kios, nama_kios, status, id_pengguna FROM kios");
print_r($stmt->fetchAll());
