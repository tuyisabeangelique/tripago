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
$hotelIds = isset($_GET['hotelIds']) ? trim($_GET['hotelIds']) : null;
$checkInDate = isset($_GET['checkInDate']) ? $_GET['checkInDate'] : null;
$checkOutDate = isset($_GET['checkOutDate']) ? $_GET['checkOutDate'] : null;
$adults = isset($_GET['adults']) ? (int)$_GET['adults'] : null;
$rooms = isset($_GET['rooms']) ? (int)$_GET['rooms'] : null;

if (!$hotelIds) {
    respondWithError('hotelIds parameter is required');
}

// Check hotel ID format - should be alphanumeric in most cases
if (!preg_match('/^[\w,]+$/', $hotelIds)) {
    respondWithError('hotelIds parameter contains invalid characters. Use only letters, numbers, underscores, and commas for multiple IDs.');
}

if (!$checkInDate) {
    respondWithError('checkInDate parameter is required (YYYY-MM-DD format)');
}

if (!$checkOutDate) {
    respondWithError('checkOutDate parameter is required (YYYY-MM-DD format)');
}

if (!$adults || $adults < 1) {
    respondWithError('adults parameter is required and must be at least 1');
}

if (!$rooms || $rooms < 1) {
    respondWithError('rooms parameter is required and must be at least 1');
}

if ($adults < $rooms) {
    respondWithError('Number of adults must be at least equal to number of rooms');
}

// Validate date formats
$dateRegex = '/^\d{4}-\d{2}-\d{2}$/';
if (!preg_match($dateRegex, $checkInDate) || !preg_match($dateRegex, $checkOutDate)) {
    respondWithError('Dates must be in YYYY-MM-DD format');
}

// Validate dates are in the future and checkOut is after checkIn
$today = new DateTime();
$checkIn = new DateTime($checkInDate);
$checkOut = new DateTime($checkOutDate);

if ($checkIn < $today) {
    respondWithError('Check-in date must be in the future');
}

if ($checkOut <= $checkIn) {
    respondWithError('Check-out date must be after check-in date');
}

try {
    // Initialize Amadeus API client
    $amadeus = new AmadeusAPI();
    
    // Build the search parameters
    $params = [
        'hotelIds' => $hotelIds,
        'adults' => $adults,
        'checkInDate' => $checkInDate,
        'checkOutDate' => $checkOutDate,
        'roomQuantity' => $rooms,
        'paymentPolicy' => isset($_GET['paymentPolicy']) ? $_GET['paymentPolicy'] : 'NONE',
        'bestRateOnly' => isset($_GET['bestRateOnly']) ? $_GET['bestRateOnly'] === 'true' : true,
        'currency' => isset($_GET['currency']) ? $_GET['currency'] : 'USD'
    ];
    
    // V3 specific parameters
    if (isset($_GET['priceRange'])) {
        $params['priceRange'] = $_GET['priceRange'];
    }
    
    // Remove null parameters
    $params = array_filter($params, function($value) {
        return $value !== null;
    });
    
    // Make API request (will use v3 endpoint via AmadeusAPI class)
    $response = $amadeus->getHotelOffers(
        $hotelIds,
        $checkInDate,
        $checkOutDate,
        $adults,
        $rooms,
        array_diff_key($params, array_flip(['hotelIds', 'checkInDate', 'checkOutDate', 'adults', 'rooms']))
    );
    
    // Return the results
    echo json_encode([
        'success' => true,
        'data' => $response
    ]);
    
} catch (Exception $e) {
    $code = $e->getCode() >= 400 ? $e->getCode() : 500;
    $additionalInfo = [
        'hotelIds' => $hotelIds,
        'checkInDate' => $checkInDate,
        'checkOutDate' => $checkOutDate,
        'adults' => $adults,
        'rooms' => $rooms
    ];
    
    respondWithError('Error: ' . $e->getMessage(), $code, $additionalInfo);
}
?>