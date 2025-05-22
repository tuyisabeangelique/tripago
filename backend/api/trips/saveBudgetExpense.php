<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

$token = $_COOKIE['authCookie'] ?? '';

$mysqli = new mysqli("localhost", "romanswi", "50456839", "cse442_2025_spring_team_aj_db");

if ($mysqli->connect_errno) {
  echo json_encode(["success" => false, "message" => "Database connection failed"]);
  exit();
}

// Authenticate user
$stmt = $mysqli->prepare("SELECT email, username FROM users WHERE token=?");
$stmt->bind_param("s", $token);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();

$email = $user["email"] ?? null;
$username = $user["username"] ?? null;

if (!$email || !$username) {
  echo json_encode(["success" => false, "message" => "Not logged in"]);
  exit();
}

// Get data from frontend
$data = json_decode(file_get_contents("php://input"), true);
$city = $data["city_name"] ?? null;

if (!$data || !$city) {
  echo json_encode(["success" => false, "message" => "Invalid input"]);
  exit();
}

// Try finding trip as OWNER
$tripStmt = $mysqli->prepare("SELECT id FROM trips WHERE email=? AND city_name=?");
$tripStmt->bind_param("ss", $email, $city);
$tripStmt->execute();
$tripResult = $tripStmt->get_result()->fetch_assoc();

$tripId = $tripResult["id"] ?? null;

// If not found as COLLABORATOR
if (!$tripId) {
  $collabStmt = $mysqli->prepare("
    SELECT t.id FROM trips t
    JOIN trip_collaborators c ON t.id = c.trip_id
    WHERE c.user_email = ? AND t.city_name = ?
  ");
  $collabStmt->bind_param("ss", $email, $city);
  $collabStmt->execute();
  $collabResult = $collabStmt->get_result()->fetch_assoc();
  $tripId = $collabResult["id"] ?? null;
}

if (!$tripId) {
  echo json_encode(["success" => false, "message" => "Trip not found"]);
  exit();
}

// Save EXPENSE
if (isset($data["category"]) && isset($data["amount"])) {
  $category = $data["category"];
  $amount = floatval($data["amount"]);

  $insertStmt = $mysqli->prepare("INSERT INTO expenses (trip_id, category, amount) VALUES (?, ?, ?)");
  $insertStmt->bind_param("isd", $tripId, $category, $amount);
  $insertStmt->execute();

  // Log action
  $actionMessage = "@$username added an expense";
  $logStmt = $mysqli->prepare("INSERT INTO trip_discussion (trip_id, user_email, username, message, is_action) VALUES (?, ?, ?, ?, 1)");
  $logStmt->bind_param("isss", $tripId, $email, $username, $actionMessage);
  $logStmt->execute();

  echo json_encode(["success" => true, "message" => "Expense saved"]);
}
// Save BUDGET
else if (isset($data["budget_amount"])) {
  $budgetAmount = floatval($data["budget_amount"]);

  $updateStmt = $mysqli->prepare("UPDATE trips SET budget_amount = ? WHERE id = ?");
  $updateStmt->bind_param("di", $budgetAmount, $tripId);
  $updateStmt->execute();

  // Log action
  $actionMessage = "@$username updated the budgeting";
  $logStmt = $mysqli->prepare("INSERT INTO trip_discussion (trip_id, user_email, username, message, is_action) VALUES (?, ?, ?, ?, 1)");
  $logStmt->bind_param("isss", $tripId, $email, $username, $actionMessage);
  $logStmt->execute();

  echo json_encode(["success" => true, "message" => "Budget amount updated"]);
}
else {
  echo json_encode(["success" => false, "message" => "Missing expense or budget data"]);
}
?>
