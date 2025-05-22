<?php
require_once('amadeus_config.php');


// Common error handling function for all Amadeus endpoints
function respondWithError($message, $code = 400, $additionalInfo = null) {
    http_response_code($code);
    $response = [
        'success' => false,
        'error' => $message
    ];
    
    if ($additionalInfo) {
        $response['details'] = $additionalInfo;
    }
    
    echo json_encode($response);
    exit();
}


class AmadeusAPI {
    private $access_token;
    private $token_expiry;


    /**
     * Get Amadeus API authentication token
     * @return string The access token
     */
    public function getAccessToken() {
        // Check if we have a valid token
        if (isset($this->access_token) && isset($this->token_expiry) && $this->token_expiry > time()) {
            return $this->access_token;
        }
        
        // Get a new token
        $curl = curl_init();
        curl_setopt_array($curl, [
            CURLOPT_URL => AMADEUS_BASE_URL . '/v1/security/oauth2/token',
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => '',
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => 'POST',
            CURLOPT_POSTFIELDS => 'grant_type=client_credentials&client_id=' . AMADEUS_API_KEY . '&client_secret=' . AMADEUS_API_SECRET,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/x-www-form-urlencoded',
            ],
        ]);
        
        $response = curl_exec($curl);
        $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        $err = curl_error($curl);
        curl_close($curl);
        
        if ($err) {
            throw new Exception("cURL Error: " . $err);
        }
        
        $responseData = json_decode($response, true);
        
        if (isset($responseData['error'])) {
            throw new Exception("Amadeus API Error: " . $responseData['error_description']);
        }
        
        $this->access_token = $responseData['access_token'];
        $this->token_expiry = time() + $responseData['expires_in'] - 60; // Buffer of 60 seconds
        
        return $this->access_token;
    }
    
    /**
     * Make an API request to Amadeus
     * @param string $endpoint The API endpoint
     * @param array $params Query parameters
     * @param string $method HTTP method (GET, POST)
     * @param string $version API version to use ('v1', 'v2', or 'v3')
     * @return array The API response
     */
    public function makeRequest($endpoint, $params = [], $method = 'GET', $version = 'v1') {
        $token = $this->getAccessToken();
        
        // Select the correct base URL based on version
        if ($version === 'v3') {
            $baseUrl = AMADEUS_V3_BASE_URL;
        } else if ($version === 'v2') {
            $baseUrl = AMADEUS_V2_BASE_URL;
        } else {
            $baseUrl = AMADEUS_V1_BASE_URL;
        }
        
        $url = $baseUrl . $endpoint;
        if ($method === 'GET' && !empty($params)) {
            $url .= '?' . http_build_query($params);
        }
        
        $curl = curl_init();
        $curlOptions = [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => '',
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => $method,
            CURLOPT_HTTPHEADER => [
                'Authorization: Bearer ' . $token,
                'Content-Type: application/json',
            ],
        ];
        
        if ($method === 'POST' && !empty($params)) {
            $curlOptions[CURLOPT_POSTFIELDS] = json_encode($params);
        }
        
        curl_setopt_array($curl, $curlOptions);
        
        $response = curl_exec($curl);
        $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        $err = curl_error($curl);
        curl_close($curl);
        
        if ($err) {
            throw new Exception("cURL Error: " . $err);
        }
        
        $responseData = json_decode($response, true);
        
        // Check for API errors
        if ($httpCode >= 400) {
            $errorMessage = isset($responseData['errors'][0]['detail']) 
                ? $responseData['errors'][0]['detail'] 
                : 'Unknown API error';
            $errorCode = isset($responseData['errors'][0]['code']) 
                ? $responseData['errors'][0]['code'] 
                : $httpCode;
            
            throw new Exception("Amadeus API Error ({$errorCode}): {$errorMessage}", $httpCode);
        }
        
        return $responseData;
    }
    
    /**
     * Search for locations (cities) by keyword
     * @param string $keyword The search keyword
     * @param array $options Additional search options
     * @return array Location search results
     */
    public function searchLocations($keyword, $options = []) {
        $params = array_merge([
            'keyword' => $keyword,
            'max' => 5
        ], $options);
        
        return $this->makeRequest('/reference-data/locations/cities', $params);
    }
    
    /**
     * Search for hotels by geographic coordinates
     * @param float $latitude Location latitude
     * @param float $longitude Location longitude
     * @param array $options Additional search options
     * @return array Hotel search results
     */
    public function searchHotels($latitude, $longitude, $options = []) {
        $params = array_merge([
            'latitude' => $latitude,
            'longitude' => $longitude,
            'radius' => 10,
            'radiusUnit' => 'MILE',
            'ratings' => '2,3,4,5',
            'hotelSource' => 'ALL'
        ], $options);
        
        return $this->makeRequest('/reference-data/locations/hotels/by-geocode', $params);
    }
    
    /**
     * Search for hotel offers with pricing
     * @param string $hotelIds Comma-separated list of hotel IDs
     * @param string $checkInDate Check-in date (YYYY-MM-DD)
     * @param string $checkOutDate Check-out date (YYYY-MM-DD)
     * @param int $adults Number of adults per room
     * @param int $rooms Number of rooms to book
     * @param array $options Additional search options
     * @return array Hotel offers results
     */
    public function getHotelOffers($hotelIds, $checkInDate, $checkOutDate, $adults, $rooms, $options = []) {
        // Make sure the hotelIds are properly formatted
        $hotelIds = trim($hotelIds);

        $defaultOptions = [
            'paymentPolicy' => 'NONE',
            'bestRateOnly' => true,
            'currency' => 'USD',
        ];

        $params = array_merge($defaultOptions, [
            'hotelIds' => $hotelIds,
            'adults' => $adults,
            'roomQuantity' => $rooms,
            'checkInDate' => $checkInDate,
        ], $options);
        
        // Add checkOutDate only if provided (v3 needs it for multiple night stays)
        if ($checkOutDate) {
            $params['checkOutDate'] = $checkOutDate;
        }
        
        // Use the v3 endpoint for hotel offers
        try {
            return $this->makeRequest('/shopping/hotel-offers', $params, 'GET', 'v3');
        } catch (Exception $e) {
            // If the error is a 404 (Resource not found), provide more specific information
            if ($e->getCode() == 404) {
                throw new Exception("Hotel IDs not found in Amadeus system. Please verify the hotel IDs are correct: {$hotelIds}", 404);
            }
            throw $e;
        }
    }

    /**
     * Get detailed information about a specific hotel offer
     * @param string $offerId The offer ID
     * @return array Hotel offer details
     */
    public function getHotelOfferById($offerId) {
        return $this->makeRequest('/shopping/hotel-offers/' . $offerId, [], 'GET', 'v3');
    }
}
?>