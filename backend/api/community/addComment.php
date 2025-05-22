<?php
header("Content-Type: application/json");

// Read input
$data = json_decode(file_get_contents("php://input"), true);

// Validate
if (!isset($data["tripId"], $data["commenter"], $data["text"])) {
  echo json_encode(["success" => false, "message" => "Missing fields"]);
  exit();
}

$tripId = $data["tripId"];
$commenter = $data["commenter"];
$text = $data["text"];

// Connect to DB
$mysqli = new mysqli("localhost", "romanswi", "50456839", "cse442_2025_spring_team_aj_db");

if ($mysqli->connect_errno) {
  echo json_encode(["success" => false, "message" => "DB connection failed"]);
  exit();
}

// Insert comment
$stmt = $mysqli->prepare("INSERT INTO comments (trip_id, commenter_email, comment_text, created_at) VALUES (?, ?, ?, NOW())");
$stmt->bind_param("iss", $tripId, $commenter, $text);
$stmt->execute();

if ($stmt->affected_rows > 0) {
  echo json_encode(["success" => true]);
} else {
  echo json_encode(["success" => false, "message" => "Failed to insert comment"]);
}
?>
