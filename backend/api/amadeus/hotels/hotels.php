<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once('amadeus_utils.php');

// Validate request
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    respondWithError('Only GET requests are allowed', 405);
}

// Required parameters
$latitude = isset($_GET['latitude']) ? (float)$_GET['latitude'] : null;
$longitude = isset($_GET['longitude']) ? (float)$_GET['longitude'] : null;

if (!$latitude || !$longitude) {
    respondWithError('Both latitude and longitude parameters are required');
}

// Validate latitude and longitude ranges
if ($latitude < -90 || $latitude > 90) {
    respondWithError('Latitude must be between -90 and 90 degrees');
}
if ($longitude < -180 || $longitude > 180) {
    respondWithError('Longitude must be between -180 and 180 degrees');
}

$radius = isset($_GET['radius']) ? (int)$_GET['radius'] : 10;

try {
    // Initialize Amadeus API client
    $amadeus = new AmadeusAPI();

    $searchParams = [
        'radius' => $radius,
    ];
    
    $results = $amadeus->searchHotels($latitude, $longitude, $searchParams);
    
    // Return the results
    echo json_encode([
        'success' => true,
        'data' => $results
    ]);
    
} catch (Exception $e) {
    $code = $e->getCode() >= 400 ? $e->getCode() : 500;
    $additionalInfo = [
        'latitude' => $latitude,
        'longitude' => $longitude,
        'params' => $_GET
    ];
    
    respondWithError('Error: ' . $e->getMessage(), $code, $additionalInfo);
}
?>