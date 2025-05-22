<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

$input = json_decode(file_get_contents("php://input"), true);
$tripId = $input["tripId"] ?? null;
$message = trim($input["message"] ?? "");

$token = $_COOKIE["authCookie"] ?? null;

if (!$tripId || !$message || !$token) {
    echo json_encode(["success" => false, "message" => "Missing required fields."]);
    exit();
}

$mysqli = new mysqli("localhost", "romanswi", "50456839", "cse442_2025_spring_team_aj_db");
if ($mysqli->connect_errno) {
    echo json_encode(["success" => false, "message" => "Database connection failed."]);
    exit();
}

// Get user email and username from token
$stmt = $mysqli->prepare("SELECT email, username FROM users WHERE token = ?");
$stmt->bind_param("s", $token);
$stmt->execute();
$res = $stmt->get_result();
$user = $res->fetch_assoc();

if (!$user) {
    echo json_encode(["success" => false, "message" => "Invalid user token."]);
    exit();
}

$userEmail = $user["email"];
$username = $user["username"];

// Insert comment (is_action = 0)
$stmt = $mysqli->prepare("INSERT INTO trip_discussion (trip_id, user_email, username, message, is_action) VALUES (?, ?, ?, ?, 0)");
$stmt->bind_param("isss", $tripId, $userEmail, $username, $message);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Comment added."]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to add comment."]);
}
?>
