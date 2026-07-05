<?php
require_once __DIR__ . '/config.php';
setCORSHeaders();

try {
    $db = getDB();
    
    // Kios schema
    $kiosSchema = [];
    $q = $db->query("DESCRIBE kios");
    while($row = $q->fetch()) {
        $kiosSchema[] = $row;
    }
    
    // Lokasi Kios schema
    $lokasiSchema = [];
    $q2 = $db->query("DESCRIBE lokasi_kios");
    while($row = $q2->fetch()) {
        $lokasiSchema[] = $row;
    }

    echo json_encode([
        'success' => true,
        'kios_schema' => $kiosSchema,
        'lokasi_schema' => $lokasiSchema,
        'kios_data' => $db->query("SELECT * FROM kios")->fetchAll(),
        'lokasi_data' => $db->query("SELECT * FROM lokasi_kios")->fetchAll(),
    ]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
