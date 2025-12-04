<?php
header('Content-Type: application/json; charset=UTF-8');

$baseDir = dirname(__DIR__);
$dataDir = $baseDir . DIRECTORY_SEPARATOR . 'data';
$dbFile = $dataDir . DIRECTORY_SEPARATOR . 'reviews.sqlite';

if (!is_dir($dataDir)) {
    mkdir($dataDir, 0777, true);
}

try {
    $pdo = new PDO('sqlite:' . $dbFile);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $pdo->exec('CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        rating INTEGER NOT NULL,
        comment TEXT,
        experience TEXT,
        likes TEXT,
        pains TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )');

    // Migrations légères: ajouter colonnes si absentes
    $cols = [];
    $stmt = $pdo->query("PRAGMA table_info(reviews)");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $cols[] = $row['name'];
    }
    $needExperience = !in_array('experience', $cols, true);
    $needLikes = !in_array('likes', $cols, true);
    $needPains = !in_array('pains', $cols, true);
    if ($needExperience) { $pdo->exec('ALTER TABLE reviews ADD COLUMN experience TEXT'); }
    if ($needLikes) { $pdo->exec('ALTER TABLE reviews ADD COLUMN likes TEXT'); }
    if ($needPains) { $pdo->exec('ALTER TABLE reviews ADD COLUMN pains TEXT'); }

    echo json_encode(array('ok' => true, 'db' => $dbFile));
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array('error' => 'DB init failed', 'details' => $e->getMessage()));
}
