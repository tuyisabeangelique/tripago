<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$token = $_COOKIE['authCookie'];

$mysqli = new mysqli("localhost","romanswi","50456839","cse442_2025_spring_team_aj_db");
if ($mysqli->connect_errno) {
  echo json_encode(["success" => false, "message" => "Database connection failed"]);
  exit();
}

$stmt = $mysqli->prepare("SELECT * FROM users WHERE token=?");
$stmt->bind_param("s",$token);
$stmt->execute();

$result = $stmt->get_result();
$result = $result->fetch_assoc();

$email = $result["email"];

if (!$email) {
  echo json_encode(["success" => false, "message" => "Not logged in"]);
  exit();
}

// Connect to DB
$mysqli = new mysqli("localhost", "romanswi", "50456839", "cse442_2025_spring_team_aj_db");

if ($mysqli->connect_errno) {
    echo json_encode(["success" => false, "message" => "DB connection failed"]);
    exit();
}

// Get trip invites where user has not accepted yet
$stmt = $mysqli->prepare("
    SELECT 
        tc.trip_id,
        t.city_name AS destination,
        tc.invited_by_firstname,
        tc.invited_by_lastname
    FROM trip_collaborators tc
    JOIN trips t ON tc.trip_id = t.id
    WHERE tc.user_email = ? AND tc.accepted = 0
");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

$invites = [];

while ($row = $result->fetch_assoc()) {
    $invites[] = [
        "tripId" => $row['trip_id'],
        "destination" => $row['destination'],
        "senderName" => $row['invited_by_firstname'] . " " . $row['invited_by_lastname'],
    ];
}

echo json_encode(["success" => true, "invites" => $invites]);
?>