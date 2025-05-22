<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$email = $_GET['email'] ?? null;

if (!$email) {
    echo json_encode(["success" => false, "message" => "Missing email"]);
    exit();
}

$mysqli = new mysqli("localhost", "romanswi", "50456839", "cse442_2025_spring_team_aj_db");

if ($mysqli->connect_errno) {
    echo json_encode(["success" => false, "message" => "DB error"]);
    exit();
}

// Get basic info
$stmt = $mysqli->prepare("SELECT first_name, last_name, username, user_image_url FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$userRes = $stmt->get_result();
$user = $userRes->fetch_assoc();

if (!$user) {
    echo json_encode(["success" => false, "message" => "User not found"]);
    exit();
}

// Get trip stats
$stmt = $mysqli->prepare("SELECT COUNT(*) AS totalTrips, COUNT(DISTINCT country_name) AS countriesVisited FROM trips WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$statsRes = $stmt->get_result();
$stats = $statsRes->fetch_assoc();

// Get friends
$stmt = $mysqli->prepare("
  SELECT u.first_name, u.last_name
  FROM friends f
  JOIN users u ON (u.email = f.sender OR u.email = f.recipient)
  WHERE f.approved = 1 AND (f.sender = ? OR f.recipient = ?) AND u.email != ?
");
$stmt->bind_param("sss", $email, $email, $email);
$stmt->execute();
$friendsRes = $stmt->get_result();

$friends = [];
while ($row = $friendsRes->fetch_assoc()) {
    $friends[] = [
        "name" => $row["first_name"] . " " . $row["last_name"]
    ];
}

echo json_encode([
    "success" => true,
    "user" => $user,
    "totalTrips" => $stats["totalTrips"],
    "countriesVisited" => $stats["countriesVisited"],
    "friends" => $friends
]);
?>
