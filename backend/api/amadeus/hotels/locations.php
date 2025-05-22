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
$keyword = isset($_GET['keyword']) ? trim($_GET['keyword']) : null;
if (!$keyword) {
    respondWithError('keyword parameter is required');
}

try {
    // Initialize Amadeus API client
    $amadeus = new AmadeusAPI();
    
    // Perform location search using the searchLocations method
    $results = $amadeus->searchLocations($keyword);
    
    // Return the results
    echo json_encode([
        'success' => true,
        'data' => $results
    ]);
    
} catch (Exception $e) {
    $code = $e->getCode() >= 400 ? $e->getCode() : 500;
    $additionalInfo = [
        'keyword' => $keyword,
        'params' => $_GET
    ];
    
    respondWithError('Error: ' . $e->getMessage(), $code, $additionalInfo);
}
?>