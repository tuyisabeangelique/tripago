<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

$tripId = $data['tripId'] ?? null;
$email = $data['email'] ?? null;

if (!$tripId || !$email) {
    echo json_encode(["success" => false, "message" => "Missing trip ID or email"]);
    exit();
}

$mysqli = new mysqli("localhost", "romanswi", "50456839", "cse442_2025_spring_team_aj_db");

if ($mysqli->connect_errno) {
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit();
}

// Verify user was actually invited
$stmt = $mysqli->prepare("SELECT * FROM trip_collaborators WHERE trip_id = ? AND user_email = ?");
$stmt->bind_param("is", $tripId, $email);
$stmt->execute();
$res = $stmt->get_result();

if ($res->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "No invitation found for this user"]);
    exit();
}

// Accept the trip invite
$stmt = $mysqli->prepare("UPDATE trip_collaborators SET accepted = 1 WHERE trip_id = ? AND user_email = ?");
$stmt->bind_param("is", $tripId, $email);
$stmt->execute();

// Get trip owner's email to make friendship
$stmt = $mysqli->prepare("SELECT email FROM trips WHERE id = ?");
$stmt->bind_param("i", $tripId);
$stmt->execute();
$result = $stmt->get_result();
$tripOwnerRow = $result->fetch_assoc();
$tripOwner = $tripOwnerRow['email'] ?? null;

if ($tripOwner && $tripOwner !== $email) {
    // Check if a pending friend request exists between the two
    $stmt = $mysqli->prepare("SELECT * FROM friends WHERE sender = ? AND recipient = ? OR sender = ? AND recipient = ?");
    $stmt->bind_param("ssss", $email, $tripOwner, $tripOwner, $email);
    $stmt->execute();
    $friendRes = $stmt->get_result();

    if ($friendRes->num_rows > 0) {
        // If exists and not approved, update it
        $stmt = $mysqli->prepare("UPDATE friends SET approved = 1 WHERE (sender = ? AND recipient = ?) OR (sender = ? AND recipient = ?)");
        $stmt->bind_param("ssss", $email, $tripOwner, $tripOwner, $email);
        $stmt->execute();
    } else {
        // Otherwise insert new approved friendship
        $stmt = $mysqli->prepare("INSERT INTO friends (sender, recipient, approved) VALUES (?, ?, 1)");
        $stmt->bind_param("ss", $email, $tripOwner);
        $stmt->execute();
    }
}

echo json_encode(["success" => true, "message" => "Invite accepted and friendship established"]);
?>
