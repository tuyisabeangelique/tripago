<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT,GET,POST,DELETE,OPTIONS");
header("Content-Type: application/json");

$jsonData = file_get_contents("php://input");
$data = json_decode($jsonData, true);

if ($data == null){
  echo json_encode(["success" => false, "message" => "Error with data received"]);
  exit();
}

$token = $_COOKIE['authCookie'];

$mysqli = new mysqli("localhost", "romanswi", "50456839", "cse442_2025_spring_team_aj_db");

if ($mysqli->connect_error != 0){
  echo json_encode(["success" => false, "message" => "Database connection failed " . $mysqli->connect_error]);
  exit();
}

// Get sender's email using auth token
$stmt = $mysqli->prepare("SELECT * FROM users WHERE token = ?");
$stmt->bind_param("s", $token);
$stmt->execute();
$result = $stmt->get_result()->fetch_assoc();

$sender = $result["email"];
if (!$sender) {
  echo json_encode(["success" => false, "message" => "Not logged in"]);
  exit();
}

// Get recipient's username from frontend
$username = $data['searchTerm'];

// Look up their email based on the username
$stmt = $mysqli->prepare("SELECT email FROM users WHERE username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$userResult = $stmt->get_result()->fetch_assoc();

if (!$userResult) {
  echo json_encode(["success" => false, "message" => "User not found"]);
  exit();
}

$recipient = $userResult['email'];

// Prevent sending a request to self
if ($sender === $recipient) {
  echo json_encode(["success" => false, "message" => "You can't send a request to yourself"]);
  exit();
}

// Check if friend request already exists
$stmt = $mysqli->prepare("SELECT * FROM friends WHERE sender = ? AND recipient = ?");
$stmt->bind_param("ss", $sender, $recipient);
$stmt->execute();
$existing = $stmt->get_result()->fetch_assoc();

if ($existing) {
  echo json_encode(["success" => false, "message" => "There is already an outgoing request to this user"]);
  exit();
}

// Insert new friend request
$stmt = $mysqli->prepare("INSERT INTO friends (sender, recipient) VALUES (?, ?)");
$stmt->bind_param("ss", $sender, $recipient);
$stmt->execute();

echo json_encode(["success" => true, "message" => "Request sent!"]);

?>
