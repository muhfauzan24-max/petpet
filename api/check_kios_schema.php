<?php
require_once __DIR__ . '/config.php';
try {
    $db = getDB();
    echo "<pre>";
    echo "=== KIOS TABLE SCHEMA ===\n";
    $q = $db->query("DESCRIBE kios");
    while($row = $q->fetch()) {
        print_r($row);
    }
    echo "\n=== LOKASI_KIOS TABLE SCHEMA ===\n";
    $q2 = $db->query("DESCRIBE lokasi_kios");
    while($row = $q2->fetch()) {
        print_r($row);
    }
    echo "</pre>";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
