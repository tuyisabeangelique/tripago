<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

// Get request data
$data = json_decode(file_get_contents("php://input"), true);

$tripId = $data['tripId'] ?? null;
$username = $data['username'] ?? null;
$email = $data['email'] ?? null;

if (!$tripId || (!$username && !$email)) {
    echo json_encode(["success" => false, "message" => "Missing trip ID or user identifier"]);
    exit();
}

// DB connection
$mysqli = new mysqli("localhost", "romanswi", "50456839", "cse442_2025_spring_team_aj_db");

if ($mysqli->connect_errno) {
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit();
}

// Resolve email if only username is provided
if (!$email) {
    $stmt = $mysqli->prepare("SELECT email FROM users WHERE username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $res = $stmt->get_result();
    $user = $res->fetch_assoc();

    if (!$user) {
        echo json_encode(["success" => false, "message" => "Username not found"]);
        exit();
    }

    $email = $user['email'];
}

// Delete the collaborator row (invite or accepted)
$stmt = $mysqli->prepare("DELETE FROM trip_collaborators WHERE trip_id = ? AND user_email = ?");
$stmt->bind_param("is", $tripId, $email);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Collaborator removed successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to remove collaborator"]);
}
?>
