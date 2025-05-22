<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

// Connect to DB
$mysqli = new mysqli("localhost", "romanswi", "50456839", "cse442_2025_spring_team_aj_db");
if ($mysqli->connect_errno) {
  echo json_encode(["success" => false, "message" => "Database connection failed"]);
  exit();
}

// Auth
$token = $_COOKIE['authCookie'] ?? null;
if (!$token) {
  echo json_encode(["success" => false, "message" => "No auth token provided"]);
  exit();
}

// Get email and username from token
$stmt = $mysqli->prepare("SELECT email, username FROM users WHERE token=?");
$stmt->bind_param("s", $token);
$stmt->execute();
$userResult = $stmt->get_result()->fetch_assoc();

$email = $userResult["email"] ?? null;
$username = $userResult["username"] ?? null;

if (!$email || !$username) {
  echo json_encode(["success" => false, "message" => "Not logged in"]);
  exit();
}

// Parse JSON input
$data = json_decode(file_get_contents("php://input"), true);
if (!$data || !isset($data["trip_id"], $data["hotel_name"], $data["hotel_price"])) {
  echo json_encode(["success" => false, "message" => "Missing required data"]);
  exit();
}

$tripId = intval($data["trip_id"]);
$hotelName = $data["hotel_name"];
$hotelPrice = $data["hotel_price"];

// Validate user has access to this trip (either as owner or collaborator)
$accessStmt = $mysqli->prepare("
  SELECT t.id FROM trips t
  LEFT JOIN trip_collaborators c ON t.id = c.trip_id
  WHERE t.id = ? AND (t.email = ? OR c.user_email = ?)
");
$accessStmt->bind_param("iss", $tripId, $email, $email);
$accessStmt->execute();
$accessResult = $accessStmt->get_result()->fetch_assoc();

if (!$accessResult) {
  echo json_encode(["success" => false, "message" => "Unauthorized to modify this trip"]);
  exit();
}

// Perform update
$updateStmt = $mysqli->prepare("UPDATE trips SET hotel_name=?, hotel_price=? WHERE id=?");
$updateStmt->bind_param("sdi", $hotelName, $hotelPrice, $tripId);
$success = $updateStmt->execute();

if ($success) {
  // Add action message to trip_discussion
  $actionMessage = "@$username updated the hotel";
  $logStmt = $mysqli->prepare("
    INSERT INTO trip_discussion (trip_id, user_email, username, message, is_action)
    VALUES (?, ?, ?, ?, 1)
  ");
  $logStmt->bind_param("isss", $tripId, $email, $username, $actionMessage);
  $logStmt->execute();

  echo json_encode(["success" => true, "message" => "Trip hotel updated!"]);
} else {
  echo json_encode(["success" => false, "message" => "Update failed"]);
}  
?>
