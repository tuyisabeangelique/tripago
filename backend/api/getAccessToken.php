<?php
function getAccessToken() {
    $clientId = 'Av20Yizlm0D5Nh0YO01LJ7LvXUvhgoEN';
    $clientSecret = 'n80E84OCqJAsYELp';
    $url = 'https://test.api.amadeus.com/v1/security/oauth2/token';
    $data = http_build_query([
        'grant_type' => 'client_credentials',
        'client_id' => $clientId,
        'client_secret' => $clientSecret
    ]);

    $options = [
        'http' => [
            'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
            'method'  => 'POST',
            'content' => $data,
        ],
    ];

    $context  = stream_context_create($options);
    $result = file_get_contents($url, false, $context);

    if ($result === FALSE) {
        error_log(" Failed to get access token from Amadeus.");
        return null;
    }

    $response = json_decode($result, true);

    // Debug log:
    if (!$response || !isset($response['access_token'])) {
        error_log(" Invalid token response: " . $result);
    }

    return $response['access_token'] ?? null;
}
?>