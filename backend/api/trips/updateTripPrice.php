<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

$token = $_COOKIE['authCookie'];

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
if (!$data || !isset($data["city_name"]) || !isset($data["price"])) {
  echo json_encode(["success" => false, "message" => "Invalid input"]);
  exit();
}

$city = $data["city_name"];
$price = (int)$data["price"];

// Find trip ID by ownership or collaboration
$tripStmt = $mysqli->prepare("
  SELECT t.id FROM trips t
  LEFT JOIN trip_collaborators c ON t.id = c.trip_id
  WHERE t.city_name = ? AND (t.email = ? OR c.user_email = ?)
");
$tripStmt->bind_param("sss", $city, $email, $email);
$tripStmt->execute();
$tripRow = $tripStmt->get_result()->fetch_assoc();
$tripId = $tripRow["id"] ?? null;

if (!$tripId) {
  echo json_encode(["success" => false, "message" => "Trip not found or unauthorized"]);
  exit();
}

// Update trip price
$updateStmt = $mysqli->prepare("UPDATE trips SET price=? WHERE id=?");
$updateStmt->bind_param("ii", $price, $tripId);
$updateStmt->execute();

if ($updateStmt->affected_rows > 0) {
  // Log action to discussion table
  $actionMessage = "@$username updated the budgeting";
  $logStmt = $mysqli->prepare("
    INSERT INTO trip_discussion (trip_id, user_email, username, message, is_action)
    VALUES (?, ?, ?, ?, 1)
  ");
  $logStmt->bind_param("isss", $tripId, $email, $username, $actionMessage);
  $logStmt->execute();

  echo json_encode(["success" => true, "message" => "Trip price updated!"]);
} else {
  echo json_encode(["success" => false, "message" => "Trip not found or price unchanged."]);
}

$mysqli->close();
?>
