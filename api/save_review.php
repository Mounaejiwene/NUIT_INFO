<?php
header('Content-Type: application/json; charset=UTF-8');

$baseDir = dirname(__DIR__);
$dbFile = $baseDir . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'reviews.sqlite';

try {
    $pdo = new PDO('sqlite:' . $dbFile);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array('error' => 'DB connection failed'));
    exit;
}

$name = isset($_POST['name']) ? trim($_POST['name']) : '';
$rating = isset($_POST['rating']) ? intval($_POST['rating']) : 0;
$comment = isset($_POST['comment']) ? trim($_POST['comment']) : '';
$experience = isset($_POST['experience']) ? trim($_POST['experience']) : '';
$likes = isset($_POST['likes']) ? trim($_POST['likes']) : '';
$pains = isset($_POST['pains']) ? trim($_POST['pains']) : '';

if ($name === '' || $rating < 1 || $rating > 5) {
    echo json_encode(array('error' => 'Paramètres invalides'));
    exit;
}

try {
    $stmt = $pdo->prepare('INSERT INTO reviews (name, rating, comment, experience, likes, pains) VALUES (:name, :rating, :comment, :experience, :likes, :pains)');
    $stmt->execute(array(
        ':name' => substr($name, 0, 50),
        ':rating' => $rating,
        ':comment' => substr($comment, 0, 500),
        ':experience' => substr($experience, 0, 20),
        ':likes' => substr($likes, 0, 200),
        ':pains' => substr($pains, 0, 200)
    ));
    echo json_encode(array('ok' => true));
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array('error' => 'Insert failed'));
}
