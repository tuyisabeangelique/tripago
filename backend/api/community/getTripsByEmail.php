<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$mysqli = new mysqli("localhost", "romanswi", "50456839", "cse442_2025_spring_team_aj_db");
if ($mysqli->connect_errno) {
  echo json_encode(["success" => false, "message" => "DB connection failed"]);
  exit();
}

$email = $_GET["email"] ?? null;

if (!$email) {
  echo json_encode(["success" => false, "message" => "Missing email parameter"]);
  exit();
}

// Get trips by email
$stmt = $mysqli->prepare("SELECT * FROM trips WHERE email = ? AND travel_log = 1 ORDER BY created_at DESC");
$stmt->bind_param("s", $email);
$stmt->execute();
$tripResult = $stmt->get_result();

$trips = [];

while ($trip = $tripResult->fetch_assoc()) {
  $tripId = $trip['id'];

  // Fetch most recent comment for this trip
  $commentStmt = $mysqli->prepare("SELECT comment_text FROM comments WHERE trip_id = ? ORDER BY created_at DESC LIMIT 1");
  $commentStmt->bind_param("i", $tripId);
  $commentStmt->execute();
  $commentResult = $commentStmt->get_result();
  $commentRow = $commentResult->fetch_assoc();
  $comment = $commentRow ? $commentRow["comment_text"] : "";

  $trips[] = [
    "id" => $trip["id"],
    "city_name" => $trip["city_name"],
    "image_url" => $trip["image_url"],
    "comment" => $comment
  ];
}

echo json_encode(["success" => true, "trips" => $trips]);
?>
