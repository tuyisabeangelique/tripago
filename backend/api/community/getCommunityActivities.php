<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data["email"], $data["tripId"])) {
  echo json_encode(["success" => false, "message" => "Missing required data"]);
  exit();
}

$email = $data["email"];
$tripId = $data["tripId"];

$mysqli = new mysqli("localhost", "romanswi", "50456839", "cse442_2025_spring_team_aj_db");
if ($mysqli->connect_errno) {
  echo json_encode(["success" => false, "message" => "DB connection failed"]);
  exit();
}

$stmt = $mysqli->prepare("SELECT * FROM trips WHERE trip_id = ? AND travel_log = 1");
$stmt->bind_param("i", $tripId);
$stmt->execute();
$result = $stmt->get_result();
if (!$result) {
  echo json_encode(["success" => false, "message" => "This trip is not shared."]);
  exit();
}

$stmt = $mysqli->prepare("
  SELECT day_number AS day, activity_name AS name, price
  FROM activities
  WHERE email = ? AND trip_id = ?
  ORDER BY day_number ASC
");

$stmt->bind_param("si", $email, $tripId);
$stmt->execute();
$result = $stmt->get_result();

$activities = [];
while ($row = $result->fetch_assoc()) {
  $activities[] = $row;
}

echo json_encode(["success" => true, "activities" => $activities]);
