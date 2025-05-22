<?php
// searchCities.php
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');

$tokenPath = __DIR__ . '/getAccessToken.php';
if (!file_exists($tokenPath)) {
    echo json_encode(['error' => 'Token file not found: ' . $tokenPath]);
    exit;
}

require_once $tokenPath;

// Get keyword from query string
$keyword = $_GET['keyword'] ?? null;
if (!$keyword) {
    http_response_code(400);
    echo json_encode(["error" => "Missing keyword"]);
    exit;
}

$token = getAccessToken();

if (!$token) {
    http_response_code(500);
    echo json_encode(["error" => "Invalid access token"]);
    exit;
}

// Call Amadeus City Search API
$locationUrl = "https://test.api.amadeus.com/v1/reference-data/locations/cities?keyword=" . urlencode($keyword) . "&max=5";
$locationHeaders = [
    "Authorization: Bearer " . $token
];

$locationOpts = [
    "http" => [
        "method" => "GET",
        "header" => implode("\r\n", $locationHeaders)
    ]
];

$locationContext = stream_context_create($locationOpts);
$response = file_get_contents($locationUrl, false, $locationContext);

if ($response === FALSE) {
    http_response_code(500);
    echo json_encode(["error" => "City search failed"]);
    exit;
}

echo $response;
?>
