<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$tripId = $_GET['tripId'] ?? null;

if (!$tripId) {
  echo json_encode(["success" => false, "message" => "Missing tripId"]);
  exit();
}

// DB connection
$mysqli = new mysqli("localhost", "romanswi", "50456839", "cse442_2025_spring_team_aj_db");

if ($mysqli->connect_errno) {
  echo json_encode(["success" => false, "message" => "DB connection failed"]);
  exit();
}

// Fetch discussion comments with username + profile image + is_action
$stmt = $mysqli->prepare("
  SELECT td.message, td.timestamp, td.is_action, u.username, u.user_image_url
  FROM trip_discussion td
  JOIN users u ON td.user_email = u.email
  WHERE td.trip_id = ?
  ORDER BY td.timestamp ASC
");

$stmt->bind_param("i", $tripId);
$stmt->execute();
$result = $stmt->get_result();

$comments = [];
while ($row = $result->fetch_assoc()) {
  $comments[] = [
    "username" => $row["username"],
    "image" => $row["user_image_url"],
    "comment" => $row["message"],
    "timestamp" => $row["timestamp"],
    "is_action" => (bool)$row["is_action"]
  ];
}

echo json_encode(["success" => true, "comments" => $comments]);
?>
