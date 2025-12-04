<?php
header('Content-Type: application/json; charset=UTF-8');

$baseDir = dirname(__DIR__);
$dbFile = $baseDir . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'reviews.sqlite';

try {
    $pdo = new PDO('sqlite:' . $dbFile);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $count = (int)$pdo->query('SELECT COUNT(*) FROM reviews')->fetchColumn();
    $avg = $count > 0 ? (float)$pdo->query('SELECT AVG(rating) FROM reviews')->fetchColumn() : 0.0;
    $avg = number_format($avg, 1, '.', '');

    $hist = array(1=>0,2=>0,3=>0,4=>0,5=>0);
    $stmt = $pdo->query('SELECT rating, COUNT(*) c FROM reviews GROUP BY rating');
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $r = (int)$row['rating'];
        $hist[$r] = (int)$row['c'];
    }

    echo json_encode(array('count' => $count, 'avg' => $avg, 'hist' => $hist));
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array('error' => 'Stats failed'));
}
