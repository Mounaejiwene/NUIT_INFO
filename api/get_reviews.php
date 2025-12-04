<?php
header('Content-Type: application/json; charset=UTF-8');

$baseDir = dirname(__DIR__);
$dbFile = $baseDir . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'reviews.sqlite';

try {
    $pdo = new PDO('sqlite:' . $dbFile);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $stmt = $pdo->query('SELECT name, rating, comment, experience, likes, pains, created_at FROM reviews ORDER BY id DESC LIMIT 20');
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(array('reviews' => $rows));
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array('error' => 'Query failed'));
}
