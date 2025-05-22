<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$tripId = $_GET['tripId'] ?? null;

if (!$tripId) {
    echo json_encode(["success" => false, "message" => "Missing tripId"]);
    exit();
}

$mysqli = new mysqli("localhost", "romanswi", "50456839", "cse442_2025_spring_team_aj_db");

if ($mysqli->connect_errno) {
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit();
}

$stmt = $mysqli->prepare("
  SELECT u.first_name, u.last_name, u.username, u.user_image_url
  FROM trip_collaborators tc
  JOIN users u ON tc.user_email = u.email
  WHERE tc.trip_id = ? AND tc.accepted = 1
");
$stmt->bind_param("i", $tripId);
$stmt->execute();
$result = $stmt->get_result();

$collaborators = [];
while ($row = $result->fetch_assoc()) {
    $collaborators[] = [
        "firstName" => $row["first_name"],
        "lastName" => $row["last_name"],
        "username" => $row["username"],
        "image" => $row["user_image_url"],
    ];
}

echo json_encode(["success" => true, "collaborators" => $collaborators]);
?>
