<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT,GET,POST,DELETE,OPTIONS");
header("Content-Type: application/json");

$jsonData = file_get_contents("php://input");
$data = json_decode($jsonData, true);

if ($data == null) {
    echo json_encode(["success" => false, "message" => "Error with data received"]);
    exit();
}

// Set sender as the user who sent the request
$token = $_COOKIE['authCookie'];

$mysqli = new mysqli("localhost", "romanswi", "50456839", "cse442_2025_spring_team_aj_db");
if ($mysqli->connect_error != 0) {
    echo json_encode(["success" => false, "message" => "Database connection failed " . $mysqli->connect_error]);
    exit();
}

$stmt = $mysqli->prepare("SELECT email FROM users WHERE token=?");
$stmt->bind_param("s", $token);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();
$sender = $user["email"];

if (!$sender) {
    echo json_encode(["success" => false, "message" => "Not logged in"]);
    exit();
}

$pending_requests = [];
// Get recipient emails for pending requests
$stmt = $mysqli->prepare("SELECT recipient FROM friends WHERE sender=? AND approved=0");
$stmt->bind_param("s", $sender);
$stmt->execute();
$result = $stmt->get_result();
while ($row = $result->fetch_assoc()) {
    $pending_requests[] = $row['recipient'];
}

$approved_requests = [];
// Get recipient emails for approved requests (friends)
$stmt = $mysqli->prepare("SELECT recipient FROM friends WHERE sender=? AND approved=1");
$stmt->bind_param("s", $sender);
$stmt->execute();
$result = $stmt->get_result();
while ($row = $result->fetch_assoc()) {
    $approved_requests[] = $row['recipient'];
}

$pending_with_email = [];
if (count($pending_requests) > 0) {
    $in = str_repeat('?,', count($pending_requests) - 1) . '?';
    $stmt = $mysqli->prepare("SELECT first_name, last_name, email FROM users WHERE email IN ($in)");
    $types = str_repeat('s', count($pending_requests));
    $stmt->bind_param($types, ...$pending_requests);
    $stmt->execute();
    $result = $stmt->get_result();
    while ($row = $result->fetch_assoc()) {
        $full_name = $row['first_name'] . ' ' . $row['last_name'];
        $pending_with_email[] = ['name' => $full_name, 'email' => $row['email']];
    }
}

$approved_with_email = [];
if (count($approved_requests) > 0) {
    $in = str_repeat('?,', count($approved_requests) - 1) . '?';
    $stmt = $mysqli->prepare("SELECT first_name, last_name, email FROM users WHERE email IN ($in)");
    $types = str_repeat('s', count($approved_requests));
    $stmt->bind_param($types, ...$approved_requests);
    $stmt->execute();
    $result = $stmt->get_result();
    while ($row = $result->fetch_assoc()) {
        $full_name = $row['first_name'] . ' ' . $row['last_name'];
        $approved_with_email[] = ['name' => $full_name, 'email' => $row['email']];
    }
}

// Send a list of approved requests (friends) and pending requests, each with name and email
echo json_encode([$approved_with_email, $pending_with_email]);

$stmt->close();
$mysqli->close();

?>