<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT,GET,POST,DELETE,OPTIONS");
header("Content-Type: application/json");

$jsonData = file_get_contents("php://input");

$data = json_decode($jsonData,true);

if ($data == null){
  echo json_encode(["success"=>false,"message"=>"Error with data recieved"]);
  exit();
}

//set recipient as user who sent the request
$token = $_COOKIE['authCookie'];

$mysqli = new mysqli("localhost","romanswi","50456839","cse442_2025_spring_team_aj_db");
if ($mysqli->connect_error != 0){
    echo json_encode(["success"=>false,"message"=>"Database connection failed ". $mysqli->connect_error]);
    exit();
}

$stmt = $mysqli->prepare("SELECT * FROM users WHERE token=?");
$stmt->bind_param("s",$token);
$stmt->execute();

$result = $stmt->get_result();
$result = $result->fetch_assoc();

$recipient = $result["email"];
if (!$recipient) {
  echo json_encode(["success" => false, "message" => "Not logged in"]);
  exit();
}

//get all emails that are sending friend requests to this user
$stmt = $mysqli->prepare("SELECT (sender) FROM friends WHERE recipient=? AND approved=0");
$stmt->bind_param("s",$recipient);
$stmt->execute();

$result = $stmt->get_result();


//get list of emails
//need to check if result has a simple list of strings
//fetch all returns a list of lists
//each inner list should have an email string
//use a loop to aggregate them all into a single list
$result = $result->fetch_all();
$emails = [];
foreach ($result as $email){
    $emails[] = $email[0];
}


$names = [];
if (count($emails) > 0){
    $in = str_repeat('?,',count($emails)-1). '?';


    //get first and last names of emails from users table
    $stmt = $mysqli->prepare("SELECT first_name,last_name FROM users WHERE email IN ($in)");
    $types = str_repeat('s',count($emails));
    $stmt->bind_param($types,...$emails);
    $stmt->execute();
    $result = $stmt->get_result();
    $result = $result->fetch_all();

    if ($result == null){
        echo "result was null!";
    }

    //$result should have list of lists
    //this should get a list of first names and last names from the users table
    foreach ($result as $Names){
        $full_name = $Names[0] . ' ' . $Names[1];
        $names[] = $full_name;
    }
} else {
    $names = [];
}

//in theory, sends list of first and last name strings to front end 
echo json_encode($names);

?>