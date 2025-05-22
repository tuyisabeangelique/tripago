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

//get first and last name of sender of request
$first_name = $data['first_name'];
$last_name = $data['last_name'];

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

$recipient_email = $result["email"];
if (!$recipient_email) {
  echo json_encode(["success" => false, "message" => "Not logged in"]);
  exit();
}

//get the email associated with sender first and last name

$stmt = $mysqli->prepare("SELECT `email` FROM users WHERE first_name=? AND last_name = ?");
$stmt->bind_param("ss",$first_name,$last_name);
$stmt->execute();

$result = $stmt->get_result();
$result = $result->fetch_all();

$sender_email = $result[0][0];

/*
1. Approve the original friend request (sender -> recipient)
*/
$stmt = $mysqli->prepare("UPDATE `friends` SET approved=1 WHERE sender=? AND recipient=?");
$stmt->bind_param("ss",$sender_email,$recipient_email);
$stmt->execute();

//errno is non zero if an error occurred
if ($stmt->errno){
    echo json_encode(["success"=>false,"message"=>"There was an error approving the initial request (sender -> recipient)"]);
    exit();
}

/*
2. Check if a reciprocal friend request (recipient -> sender) already exists and is approved.
   If not, create and approve it.
*/
$stmt = $mysqli->prepare("SELECT * FROM `friends` WHERE sender=? AND recipient=? AND approved=1");
$stmt->bind_param("ss", $recipient_email, $sender_email);
$stmt->execute();
$reciprocal_result = $stmt->get_result();

if ($reciprocal_result->num_rows == 0) {
    // Reciprocal friendship doesn't exist or isn't approved, so create and approve it
    $stmt = $mysqli->prepare("INSERT INTO `friends` (sender, recipient, approved) VALUES (?, ?, 1)");
    $stmt->bind_param("ss", $recipient_email, $sender_email);
    $stmt->execute();

    if ($stmt->errno) {
        echo json_encode(["success"=>false,"message"=>"There was an error establishing the reciprocal friendship (recipient -> sender)"]);
        exit();
    }
}

echo json_encode(["success"=>true,"message"=>"You are now friends with " . $sender_email . "!"]);

$mysqli->close();

?>