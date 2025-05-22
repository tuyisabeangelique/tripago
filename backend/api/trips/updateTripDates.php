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

// Get logged-in user info
$stmt = $mysqli->prepare("SELECT email, username FROM users WHERE token=?");
$stmt->bind_param("s", $token);
$stmt->execute();
$result = $stmt->get_result()->fetch_assoc();

$email = $result["email"] ?? null;
$username = $result["username"] ?? null;

if (!$email || !$username) {
  echo json_encode(["success" => false, "message" => "Not logged in"]);
  exit();
}

// Parse input
$data = json_decode(file_get_contents("php://input"), true);
if (!$data) {
  echo json_encode(["success" => false, "message" => "Invalid input"]);
  exit();
}

$city = $data["city_name"] ?? null;
$start = $data["start_date"] ?? null;
$end = $data["end_date"] ?? null;

if (!$city || !$start || !$end) {
  echo json_encode(["success" => false, "message" => "Missing city or date info"]);
  exit();
}

// First: Try to find trip as OWNER
$tripStmt = $mysqli->prepare("
  SELECT id FROM trips 
  WHERE email = ? AND city_name = ?
");
$tripStmt->bind_param("ss", $email, $city);
$tripStmt->execute();
$tripResult = $tripStmt->get_result()->fetch_assoc();
$tripId = $tripResult['id'] ?? null;

// If not found, try as COLLABORATOR
if (!$tripId) {
  $collabStmt = $mysqli->prepare("
    SELECT t.id FROM trips t
    JOIN trip_collaborators c ON t.id = c.trip_id
    WHERE c.user_email = ? AND t.city_name = ?
  ");
  $collabStmt->bind_param("ss", $email, $city);
  $collabStmt->execute();
  $collabResult = $collabStmt->get_result()->fetch_assoc();
  $tripId = $collabResult['id'] ?? null;
}

if (!$tripId) {
  echo json_encode(["success" => false, "message" => "Trip not found"]);
  exit();
}

// Update trip dates
$updateStmt = $mysqli->prepare("UPDATE trips SET start_date = ?, end_date = ? WHERE id = ?");
$updateStmt->bind_param("ssi", $start, $end, $tripId);
$updateStmt->execute();

if ($updateStmt->affected_rows > 0) {
  //  Add action comment to trip_discussion
  $actionMessage = "@$username changed the trip dates";
  $logStmt = $mysqli->prepare("
    INSERT INTO trip_discussion (trip_id, user_email, username, message, is_action)
    VALUES (?, ?, ?, ?, 1)
  ");
  $logStmt->bind_param("isss", $tripId, $email, $username, $actionMessage);
  $logStmt->execute();

  echo json_encode(["success" => true, "message" => "Trip dates updated!"]);
} else {
  echo json_encode(["success" => false, "message" => "Trip dates unchanged or update failed"]);
}
?>
