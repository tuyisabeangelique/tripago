<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT,GET,POST,DELETE,OPTIONS");
header("Content-Type: application/json");

// Get form data
$jsonData = file_get_contents("php://input");
$data = json_decode($jsonData,true);
$tripId = $data["id"];

// Get email from auth token
$token = $_COOKIE['authCookie'];
$mysqli = new mysqli("localhost","romanswi","50456839","cse442_2025_spring_team_aj_db");
$stmt = $mysqli->prepare("SELECT * FROM users WHERE token=?");
$stmt->bind_param("s",$token);
$stmt->execute();
$result = $stmt->get_result();
$result = $result->fetch_assoc();
$email = $result["email"];
if (!$email) {
    echo json_encode(["success" => false, "message" => "User not authenticated"]);
    exit();
}

// Check if user is owner or user is collaborator or trip is shared
$stmt = $mysqli->prepare("
  SELECT t.id FROM trips t
  LEFT JOIN trip_collaborators c ON t.id = c.trip_id
  WHERE (t.id = ? AND (t.email = ? OR c.user_email = ?)) OR (t.travel_log = 1)
");
$stmt->bind_param("iss", $tripId, $email, $email);
$stmt->execute();
$result = $stmt->get_result()->fetch_assoc();
if (!$result) {
  echo json_encode(["success" => false, "message" => "You don’t have access to this trip"]);
  exit();
}

// Fetch memories
$stmt = $mysqli->prepare("SELECT * FROM memories WHERE trip_id=? ORDER BY created_at DESC");
$stmt->bind_param("i", $tripId);
$stmt->execute();
$result = $stmt->get_result();

$memories = [];

while ($row = $result->fetch_assoc()) {
    $id = $row["id"];
    $caption = $row["caption"];

    $memories[] = [
        "id" => $id,
        "caption" => $caption,
    ];
}

// Fetch images
$stmt = $mysqli->prepare("SELECT * FROM memory_images WHERE trip_id=? ORDER BY image_index ASC");
$stmt->bind_param("i", $tripId);
$stmt->execute();
$result = $stmt->get_result();

$images = [];

while ($row = $result->fetch_assoc()) {
    $memory_id = $row["memory_id"];
    $image_url = $row["image_url"];

    $images[] = [
        "memory_id" => $memory_id,
        "image_url" => $image_url,
    ];
}

// Return result
echo json_encode(["success" => true, "memories" => $memories, "images" => $images]);

?>