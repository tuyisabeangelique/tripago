<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$token = $_COOKIE['authCookie'] ?? null;

$mysqli = new mysqli("localhost", "romanswi", "50456839", "cse442_2025_spring_team_aj_db");
if ($mysqli->connect_errno) {
  echo json_encode(["success" => false, "message" => "Database connection failed"]);
  exit();
}

// Get user info
$stmt = $mysqli->prepare("SELECT email FROM users WHERE token=?");
$stmt->bind_param("s", $token);
$stmt->execute();
$userResult = $stmt->get_result()->fetch_assoc();
$email = $userResult["email"] ?? null;

if (!$email) {
  echo json_encode(["success" => false, "message" => "Not logged in"]);
  exit();
}

$tripId = $_GET['trip_id'] ?? null;

if (!$tripId) {
  echo json_encode(["success" => false, "message" => "Missing trip ID"]);
  exit();
}

// Check if user has access to this trip
$accessStmt = $mysqli->prepare("
  SELECT t.tags FROM trips t
  LEFT JOIN trip_collaborators c ON t.id = c.trip_id
  WHERE t.id = ? AND (t.email = ? OR c.user_email = ?)
");
$accessStmt->bind_param("iss", $tripId, $email, $email);
$accessStmt->execute();
$result = $accessStmt->get_result()->fetch_assoc();

if (!$result) {
  echo json_encode(["success" => false, "message" => "Trip not found or unauthorized"]);
  exit();
}

$tags = $result['tags'] ? explode(',', $result['tags']) : [];

echo json_encode([
  "success" => true,
  "tags" => $tags
]);
?> 