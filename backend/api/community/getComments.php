<?php
header("Content-Type: application/json");

// Read input
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data["tripId"])) {
  echo json_encode(["success" => false, "message" => "Missing trip ID"]);
  exit();
}

$tripId = $data["tripId"];

// Connect to DB
$mysqli = new mysqli("localhost", "romanswi", "50456839", "cse442_2025_spring_team_aj_db");

if ($mysqli->connect_errno) {
  echo json_encode(["success" => false, "message" => "DB connection failed"]);
  exit();
}

// Fetch comments with names
$stmt = $mysqli->prepare("
  SELECT 
    c.id,
    c.commenter_email, 
    c.comment_text, 
    c.created_at, 
    u.first_name, 
    u.last_name 
  FROM comments c
  LEFT JOIN users u ON c.commenter_email = u.email
  WHERE c.trip_id = ?
  ORDER BY c.created_at ASC
");
$stmt->bind_param("i", $tripId);
$stmt->execute();
$result = $stmt->get_result();

$comments = [];
while ($row = $result->fetch_assoc()) {
  $comments[] = [
    "id" => $row["id"],
    "commenter_email" => $row["commenter_email"],
    "comment_text" => $row["comment_text"],
    "created_at" => $row["created_at"],
    "first_name" => $row["first_name"] ?? null,
    "last_name" => $row["last_name"] ?? null
  ];
}

echo json_encode(["success" => true, "comments" => $comments]);
?>
