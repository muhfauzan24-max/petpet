<?php
// File diagnostik sementara - HAPUS setelah selesai!
echo "<pre>";
echo "PHP Version: " . phpversion() . "\n";
echo "Server: " . ($_SERVER['SERVER_SOFTWARE'] ?? 'unknown') . "\n";
echo "Document Root: " . ($_SERVER['DOCUMENT_ROOT'] ?? 'unknown') . "\n";
echo "\n--- Coba koneksi MySQL ---\n";

// Coba dengan localhost
try {
    $pdo = new PDO('mysql:host=localhost;charset=utf8', 'root', '');
    echo "✅ Koneksi localhost/root BERHASIL\n";
} catch (Exception $e) {
    echo "❌ localhost/root gagal: " . $e->getMessage() . "\n";
}

// Coba dengan 127.0.0.1
try {
    $pdo = new PDO('mysql:host=127.0.0.1;charset=utf8', 'root', '');
    echo "✅ Koneksi 127.0.0.1/root BERHASIL\n";
} catch (Exception $e) {
    echo "❌ 127.0.0.1/root gagal: " . $e->getMessage() . "\n";
}

echo "\n--- Environment Variables ---\n";
$vars = ['DB_HOST', 'DB_USER', 'DB_PASS', 'DB_NAME', 'MYSQL_HOST', 'MYSQL_USER', 'MYSQL_DATABASE'];
foreach ($vars as $v) {
    $val = getenv($v);
    echo "$v: " . ($val ?: '(tidak ada)') . "\n";
}

echo "\n--- /etc/mysql/ exists: ";
echo file_exists('/etc/mysql') ? 'YES' : 'NO';
echo "\n";

phpinfo(INFO_MODULES);
echo "</pre>";
