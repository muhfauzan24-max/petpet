<?php
require_once __DIR__ . '/config.php';

$hash = password_hash('admin123', PASSWORD_BCRYPT);
$db   = getDB();

$stmt = $db->prepare('UPDATE pengguna SET password=? WHERE email=?');
$stmt->execute([$hash, 'admin@petplace.id']);

if ($stmt->rowCount() > 0) {
    echo "Password admin berhasil diupdate.\n";
    echo "Hash: $hash\n";
    echo "Verifikasi: " . (password_verify('admin123', $hash) ? "OK" : "GAGAL") . "\n";
} else {
    echo "PERINGATAN: Tidak ada baris yang diupdate.\n";
    echo "Akun admin@petplace.id mungkin belum ada di database.\n\n";
    // Coba insert akun admin baru
    $insert = $db->prepare("INSERT IGNORE INTO pengguna (nama_lengkap, email, password, peran, status) VALUES (?, ?, ?, 'admin', 'aktif')");
    $insert->execute(['Admin', 'admin@petplace.id', $hash]);
    if ($insert->rowCount() > 0) {
        echo "Akun admin baru berhasil dibuat!\n";
        echo "Email: admin@petplace.id\n";
        echo "Password: admin123\n";
    } else {
        echo "Gagal membuat akun admin. Cek struktur tabel 'pengguna'.\n";
    }
}
