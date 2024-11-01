<?php
header('Content-Type: application/json');
echo json_encode([
    'lastModified' => date("m/d/Y, h:i:s A", filemtime('../index.html'))
]);
?> 