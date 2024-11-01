<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$file_path = __DIR__ . '/../index.html';

if (file_exists($file_path)) {
    $timestamp = filemtime($file_path);
    echo json_encode([
        'lastModified' => date("m/d/Y, h:i:s A", $timestamp),
        'success' => true
    ]);
} else {
    echo json_encode([
        'lastModified' => 'File not found',
        'success' => false
    ]);
} 