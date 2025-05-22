<?php
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');

$city = $_GET['query'] ?? '';
if (empty($city)) {
    echo json_encode(['error' => 'Missing query']);
    exit;
}

$apiKey = "mXWlLuovwPkrar3QohDSUk3gc3u6EYlynL1ITVBYjGlsvvyUsVNCzb19";
$url = "https://api.pexels.com/v1/search?query=" . urlencode($city) . "&per_page=1";

$opts = [
    "http" => [
        "header" => "Authorization: $apiKey\r\n",
        "method" => "GET"
    ]
];

$context = stream_context_create($opts);
$response = file_get_contents($url, false, $context);

echo $response ?: json_encode(['error' => 'Failed to fetch']);
