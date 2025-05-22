<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

// Get email from auth token
$token = $_COOKIE['authCookie'];

$mysqli = new mysqli("localhost","romanswi","50456839","cse442_2025_spring_team_aj_db");
if ($mysqli->connect_errno) {
  echo json_encode(["success" => false, "message" => "Database connection failed"]);
  exit();
}

$stmt = $mysqli->prepare("SELECT * FROM users WHERE token=?");
$stmt->bind_param("s",$token);
$stmt->execute();

$result = $stmt->get_result();
$result = $result->fetch_assoc();

$email = $result["email"];

if (!$email) {
  echo json_encode(["success" => false, "message" => "Not logged in"]);
  exit();
}

$raw = file_get_contents("php://input");
$data = json_decode($raw, true);

if (!$data) {
  echo json_encode([
    "success" => false,
    "message" => "Invalid input"
  ]);
  exit();
}

// Default fallback image if none provided
$image_url = $data["image_url"] ?? "/CSE442/2025-Spring/cse-442aj/backend/uploads/default_img.png";

// 1. First check for EXACT duplicate
$checkStmt = $mysqli->prepare("
  SELECT id FROM trips 
  WHERE email = ? 
  AND city_name = ? 
  AND country_name <=> ? 
  AND start_date <=> ? 
  AND end_date <=> ?
  LIMIT 1
");

// Use NULL-safe comparison operator <=>
$checkStmt->bind_param(
  "sssss", 
  $email,
  $data["city_name"],
  $data["country_name"],
  $data["start_date"],
  $data["end_date"]
);

$checkStmt->execute();
$result = $checkStmt->get_result();

// If duplicate exists
if ($result->num_rows > 0) {
  $row = $result->fetch_assoc();
  echo json_encode([
    "success" => false, 
    "message" => "Duplicate trip - already exists",
    "trip_id" => (int)$row['id'] // Return existing trip ID
  ]);
  exit();
}

// 2. Get user info
$userStmt = $mysqli->prepare("SELECT first_name, last_name FROM users WHERE email=?");
$userStmt->bind_param("s", $email);
$userStmt->execute();
$userResult = $userStmt->get_result();
$user = $userResult->fetch_assoc();

if (!$user) {
  echo json_encode(["success" => false, "message" => "User not found"]);
  exit();
}

// 3. Save new trip
$insertStmt = $mysqli->prepare("
  INSERT INTO trips 
  (email, first_name, last_name, city_name, country_name, start_date, end_date, image_url) 
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
");

$insertStmt->bind_param(
  "ssssssss", 
  $email, 
  $user["first_name"], 
  $user["last_name"],
  $data["city_name"],
  $data["country_name"],
  $data["start_date"],
  $data["end_date"],
  $image_url
);

if ($insertStmt->execute()) {
  echo json_encode([
    "success" => true, 
    "message" => "Trip saved successfully!",
    "trip_id" => $insertStmt->insert_id
  ]);
} else {
  echo json_encode([
    "success" => false, 
    "message" => "Failed to save trip",
    "error" => $insertStmt->error
  ]);
}
?>