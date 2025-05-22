<?php
// display errors for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');


$tokenPath = __DIR__ . '/getAccessToken.php';
if (!file_exists($tokenPath)) {
    echo json_encode(['error' => 'Token file not found: ' . $tokenPath]);
    exit;
}
require_once $tokenPath;

// get category name from query param
$category = $_GET['category'] ?? null;

// map category to a seed city code
$categoryToCityCode = [
    "Relaxation" => "MIA",     // Miami
    "Culture"    => "PAR",     // Paris
    "Adventure"  => "DEN",     // Denver
    "Nature"     => "YVR",     // Vancouver
    "Recommendations" => "NYC"
];

if (!$category || !array_key_exists($category, $categoryToCityCode)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid or missing category']);
    exit;
}

$cityCode = $categoryToCityCode[$category];
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
