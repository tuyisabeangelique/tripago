<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

// Get request data
$data = json_decode(file_get_contents("php://input"), true);

$tripId = $data['tripId'] ?? null;
$username = $data['username'] ?? null;
$firstName = $data['firstName'] ?? null;
$lastName = $data['lastName'] ?? null;

if (!$tripId || !$username || !$firstName || !$lastName) {
    echo json_encode(["success" => false, "message" => "Missing required information"]);
    exit();
}

// DB connection
$mysqli = new mysqli("localhost", "romanswi", "50456839", "cse442_2025_spring_team_aj_db");

if ($mysqli->connect_errno) {
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit();
}

// Get user email from username
$stmt = $mysqli->prepare("SELECT email FROM users WHERE username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$res = $stmt->get_result();
$user = $res->fetch_assoc();

if (!$user) {
    echo json_encode(["success" => false, "message" => "Username not found"]);
    exit();
}

$userEmail = $user['email'];

// Check if already a collaborator
$stmt = $mysqli->prepare("SELECT * FROM trip_collaborators WHERE trip_id = ? AND user_email = ?");
$stmt->bind_param("is", $tripId, $userEmail);
$stmt->execute();
$res = $stmt->get_result();

if ($res->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "User already added to this trip"]);
    exit();
}

// Insert new collaborator with inviter info
$stmt = $mysqli->prepare("INSERT INTO trip_collaborators (trip_id, user_email, invited_by_firstname, invited_by_lastname) VALUES (?, ?, ?, ?)");
$stmt->bind_param("isss", $tripId, $userEmail, $firstName, $lastName);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Collaborator added successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to add collaborator"]);
}
?>
