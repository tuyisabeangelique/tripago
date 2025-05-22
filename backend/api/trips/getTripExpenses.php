<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$token = $_COOKIE['authCookie'] ?? null;

$mysqli = new mysqli("localhost","romanswi","50456839","cse442_2025_spring_team_aj_db");
if ($mysqli->connect_errno) {
  echo json_encode(["success" => false, "message" => "Database connection failed"]);
  exit();
}

// Auth user
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

// Check if user is owner OR collaborator
$validTripStmt = $mysqli->prepare("
  SELECT t.id FROM trips t
  LEFT JOIN trip_collaborators c ON t.id = c.trip_id
  WHERE t.id = ? AND (t.email = ? OR c.user_email = ?)
");
$validTripStmt->bind_param("iss", $tripId, $email, $email);
$validTripStmt->execute();
$validTrip = $validTripStmt->get_result()->fetch_assoc();

if (!$validTrip) {
  echo json_encode(["success" => false, "message" => "You don’t have access to this trip"]);
  exit();
}

// Fetch expenses
$expStmt = $mysqli->prepare("SELECT category, amount FROM expenses WHERE trip_id=?");
$expStmt->bind_param("i", $tripId);
$expStmt->execute();
$expResult = $expStmt->get_result();

$expenses = [];
while ($row = $expResult->fetch_assoc()) {
  $expenses[] = $row;
}

echo json_encode(["success" => true, "expenses" => $expenses]);
?>