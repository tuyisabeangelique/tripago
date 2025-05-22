<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

// 1. Decode request
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['email']) || !isset($data['destination'])) {
  echo json_encode(["success" => false, "message" => "Missing required fields"]);
  exit();
}

$email = trim($data['email']);
$destination = trim($data['destination']);

if ($email === "" || $destination === "") {
  echo json_encode(["success" => false, "message" => "Fields cannot be empty"]);
  exit();
}

// 2. Connect to DB
$mysqli = new mysqli("localhost", "romanswi", "50456839", "cse442_2025_spring_team_aj_db");

if ($mysqli->connect_errno) {
  echo json_encode(["success" => false, "message" => "Database connection failed"]);
  exit();
}

// Insert destination
$stmt = $mysqli->prepare("INSERT INTO bucket_list (user_email, destination) VALUES (?, ?)");
$stmt->bind_param("ss", $email, $destination);

if ($stmt->execute()) {
  echo json_encode(["success" => true, "message" => "Destination added successfully"]);
} else {
  echo json_encode(["success" => false, "message" => "Insert failed: " . $stmt->error]);
}
?>
