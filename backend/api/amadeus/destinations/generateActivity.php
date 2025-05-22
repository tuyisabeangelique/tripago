<?php

// display errors for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT,GET,POST,DELETE,OPTIONS");
header('Content-Type: application/json');


$jsonData = file_get_contents("php://input");

$data = json_decode($jsonData,true);

if ($data == null){
  echo json_encode(["success"=>false,"message"=>"Error with data recieved"]);
  exit();
}


//get the location of trip from frontend
$location = $data['location'];


$lat_long = getLatLong($location);

$lat = $lat_long[0];
$long = $lat_long[1];

//AT THIS POINT lat AND long HAS LAT AND LONG OF TRIP LOCATION

/*
activity_information will return a list with two lists
The first list has activity names, and the second will have activity prices
The indexes of list associate the name with the corresponding price

100% not the best way to do it, but here we are :)
*/
$activity_information = getActivity($lat,$long);

//will be null if no activities were found
if ($activity_information == null){
    echo json_encode(["success"=>true,"has_trips"=>false,"message"=>"Sorry, we couldn't find any activities. Add your own!"]);
    exit();
}

//gets a random activity and the corresponding price of it
$activity_names = $activity_information[0];
$random_index = array_rand($activity_names);
$random_activity_name = $activity_names[$random_index];
$corresponding_price = $activity_information[1][$random_index];

//send activity name and price information
echo json_encode(["success"=>true,'has_trips'=>true,'activity_name'=>$random_activity_name,'activity_price'=>$corresponding_price]);
exit();

//END OF EXECUTION

function getLatLong($location){
    //MAKE SURE THIS TOKEN PATH IS DIRECT PATH TO THAT FILE :D
    $tokenPath = "/data/web/CSE442/2025-Spring/cse-442aj/backend/api/amadeus/destinations/getAccessToken.php";
    if (!file_exists($tokenPath)) {
        echo json_encode(['error' => 'Token file not found: ' . $tokenPath]);
        exit;
    }
    require_once $tokenPath;
    $token = getAccessToken();

    if (!$token) {
        http_response_code(500);
        echo json_encode(["error" => "Invalid access token"]);
        exit;
    }

    // Call Amadeus City Search API
    $locationUrl = "https://test.api.amadeus.com/v1/reference-data/locations/cities?keyword=" . urlencode($location) . "&max=1";
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

    $response = json_decode($response,true);

    //get lat and long from response object (I KNOW IT'S SHITTY/BAD ;_;)
    $latitude = $response["data"][0]['geoCode']['latitude'];
    $longitude = $response["data"][0]['geoCode']['longitude'];
    return [$latitude,$longitude];

}


function getActivity($lat,$long){
    $tokenPath = "/data/web/CSE442/2025-Spring/cse-442aj/backend/api/amadeus/destinations/getAccessToken.php";
    if (!file_exists($tokenPath)) {
        echo json_encode(['error' => 'Token file not found: ' . $tokenPath]);
        exit;
    }
    require_once $tokenPath;
    $token = getAccessToken();

    if (!$token) {
        http_response_code(500);
        echo json_encode(["error" => "Invalid access token"]);
        exit;
    }

    /*
    CAN CHANGE SEARCH RADIUS HERE, BUT FUG IT
    THE MORE THE MERRIER (?)
    20 is max
    */
    $radius = 20;
    
    $activityURL = "https://test.api.amadeus.com/v1/shopping/activities?latitude=" . urlencode($lat). " &longitude=" . urlencode($long)."&radius=" . urlencode($radius);

    $options = [
        'http' => [
            'header' => "Authorization: Bearer $token\r\n",
            'method' => 'GET',
        ]
    ];

    $context = stream_context_create($options);
    $response = file_get_contents($activityURL, false, $context);
    $response = json_decode($response,true);

    //count has number of activities
    $count = $response['meta']['count'];

    //return null if there are no activites that were found
    if ($count==0){
        return null;
    }

    $activity_names = [];
    $activity_prices = [];
    
    //loop through activities and get info that you want
    //will just take name and price for now
    for ($i=0; $i<$count; $i++){


        if (!isset($response['data'][$i]['name']) || !isset($response['data'][$i]['price']['amount'])){
            continue;
        }
            $activity_names[] = $response['data'][$i]['name'];
            $activity_prices[] = $response['data'][$i]['price']['amount'];
            
    }

    return [$activity_names,$activity_prices];


}

?>


