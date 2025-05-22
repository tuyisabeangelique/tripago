<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

$token = $_COOKIE['authCookie'] ?? null;

$mysqli = new mysqli("localhost", "romanswi", "50456839", "cse442_2025_spring_team_aj_db");
if ($mysqli->connect_errno) {
  echo json_encode(["success" => false, "message" => "Database connection failed"]);
  exit();
}

// Get user info
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

// Get input
$data = json_decode(file_get_contents("php://input"), true);
if (!$data || !isset($data["trip_id"]) || !isset($data["tags"])) {
  echo json_encode(["success" => false, "message" => "Invalid input"]);
  exit();
}

$tripId = (int)$data["trip_id"];
$tags = implode(",", array_map('trim', $data["tags"])); // Convert array to comma-separated string

// Verify user has access to this trip
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

// Update trip tags
$updateStmt = $mysqli->prepare("UPDATE trips SET tags=? WHERE id=?");
$updateStmt->bind_param("si", $tags, $tripId);
$success = $updateStmt->execute();

if ($success) {
  echo json_encode(["success" => true, "message" => "Tags updated successfully"]);
} else {
  echo json_encode(["success" => false, "message" => "Failed to update tags"]);
}
?> 