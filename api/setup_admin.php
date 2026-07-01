<?php
$hash = password_hash('admin123', PASSWORD_BCRYPT);
$dsn  = 'mysql:host=localhost;dbname=petplace;charset=utf8mb4';
$pdo  = new PDO($dsn, 'root', '');
$pdo->prepare('UPDATE pengguna SET password=? WHERE email=?')
    ->execute([$hash, 'admin@petplace.id']);
echo "Password admin berhasil diupdate.\nHash: $hash\n";
echo "Verifikasi: " . (password_verify('admin123', $hash) ? "OK" : "GAGAL") . "\n";
