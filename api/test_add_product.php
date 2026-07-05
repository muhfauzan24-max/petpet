<?php
require_once __DIR__ . '/config.php';

try {
    $db = getDB();
    echo "Database connected successfully.\n";
    
    // Check if there is any kios
    $stmt = $db->query("SELECT id_kios, id_pengguna, nama_kios FROM kios LIMIT 5");
    $kiosList = $stmt->fetchAll();
    echo "Kios list:\n";
    print_r($kiosList);
    
    if (empty($kiosList)) {
        echo "No kios found in database!\n";
        exit();
    }
    
    $kiosId = $kiosList[0]['id_kios'];
    
    // Check if there is any kategori
    $katStmt = $db->query("SELECT id_kategori, nama_kategori FROM kategori_produk LIMIT 5");
    $katList = $katStmt->fetchAll();
    echo "Kategori list:\n";
    print_r($katList);
    
    if (empty($katList)) {
        echo "No categories found in database!\n";
        exit();
    }
    
    $katId = $katList[0]['id_kategori'];
    
    // Try to insert a test product
    $nama = "Test Product " . time();
    $slug = "test-product-" . time();
    $deskripsi = "Test description";
    $jenis = "kucing";
    $tipe = "makanan";
    $harga = 10000;
    $diskon = null;
    $berat = 100;
    $foto = null;
    $stok = 5;
    
    $db->beginTransaction();
    
    $insertStmt = $db->prepare("
        INSERT INTO produk (id_kios, id_kategori, nama_produk, slug, deskripsi, jenis_hewan, tipe_produk, harga, harga_diskon, berat_gram, foto_utama)
        VALUES (?,?,?,?,?,?,?,?,?,?,?)
    ");
    $insertStmt->execute([$kiosId, $katId, $nama, $slug, $deskripsi, $jenis, $tipe, $harga, $diskon, $berat, $foto]);
    $newId = $db->lastInsertId();
    echo "Inserted product ID: $newId\n";
    
    $stokStmt = $db->prepare("INSERT INTO stok_produk (id_produk, jumlah_stok) VALUES (?,?)");
    $stokStmt->execute([$newId, $stok]);
    echo "Inserted stock successfully.\n";
    
    $db->commit();
    echo "Transaction committed successfully. Testing passed!\n";
    
} catch (Exception $e) {
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "TRACE:\n" . $e->getTraceAsString() . "\n";
}
