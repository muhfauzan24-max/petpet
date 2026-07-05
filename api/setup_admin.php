<?php
require_once __DIR__ . '/config.php';

$hash = password_hash('admin123', PASSWORD_BCRYPT);
$db   = getDB();

// Coba update dulu
$stmt = $db->prepare('UPDATE pengguna SET password=?, status=? WHERE email=?');
$stmt->execute([$hash, 'aktif', 'admin@petplace.id']);

if ($stmt->rowCount() > 0) {
    echo "✅ Password admin berhasil diupdate.\n";
    echo "Email: admin@petplace.id\n";
    echo "Password: admin123\n";
    echo "Verifikasi: " . (password_verify('admin123', $hash) ? "OK" : "GAGAL") . "\n";
} else {
    // Belum ada akun, insert baru
    $insert = $db->prepare("INSERT IGNORE INTO pengguna (nama_lengkap, email, password, peran, status) VALUES ('Admin', 'admin@petplace.id', ?, 'admin', 'aktif')");
    $insert->execute([$hash]);
    if ($insert->rowCount() > 0) {
        echo "✅ Akun admin baru berhasil dibuat!\n";
        echo "Email: admin@petplace.id\n";
        echo "Password: admin123\n";
    } else {
        echo "⚠️ Tidak ada perubahan. Cek apakah tabel 'pengguna' ada.\n";
        // List tables untuk debug
        $tables = $db->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
        echo "Tables: " . implode(', ', $tables) . "\n";
    }
}
// Langsung nonaktifkan diri sendiri setelah dijalankan
file_put_contents(__FILE__, "<?php die('Sudah dijalankan dan dinonaktifkan.'); ?>\n");
echo "\n🔒 File ini otomatis dinonaktifkan.\n";
