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

// Check required parameters
$offerId = isset($_GET['offerId']) ? trim($_GET['offerId']) : null;

if (!$offerId) {
    respondWithError('offerId parameter is required');
}

try {
    // Initialize Amadeus API client
    $amadeus = new AmadeusAPI();

    $response = $amadeus->getHotelOfferById($offerId);
    
    // Return the results
    echo json_encode([
        'success' => true,
        'data' => $response
    ]);
    
} catch (Exception $e) {
    $code = $e->getCode() >= 400 ? $e->getCode() : 500;
    $additionalInfo = [
        'offerId' => $offerId
    ];
    
    respondWithError('Error: ' . $e->getMessage(), $code, $additionalInfo);
}
?>