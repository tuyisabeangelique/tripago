<?php
// display errors for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

$tokenPath = __DIR__ . '/getAccessToken.php';
if (!file_exists($tokenPath)) {
    echo json_encode(['error' => 'Token file not found: ' . $tokenPath]);
    exit;
}
require_once $tokenPath;

$cityCode = $_GET['cityCode'] ?? null;

$travelerCountryCode = 'US'; // Assuming all users are from the US

// get access token
$token = getAccessToken();
if (!$token) {
    http_response_code(500);
    echo json_encode(['error' => 'Unable to get access token']);
    exit;
}

// make API call to Amadeus
$url = "https://test.api.amadeus.com/v1/reference-data/recommended-locations?cityCodes=$cityCode&travelerCountryCode=$travelerCountryCode";

$options = [
    'http' => [
        'header' => "Authorization: Bearer $token\r\n",
        'method' => 'GET',
    ]
];

$context = stream_context_create($options);
$response = file_get_contents($url, false, $context);

if ($response === FALSE) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch recommendations']);
    exit;
}

echo $response;
?>
