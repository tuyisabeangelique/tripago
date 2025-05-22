<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json");

// Verify user token
$token = $_COOKIE['authCookie'] ?? null;

if (!$token) {
    echo json_encode(["success" => false, "message" => "No auth token found"]);
    exit();
}

// Connect to database
$mysqli = new mysqli("localhost", "romanswi", "50456839", "cse442_2025_spring_team_aj_db");

if ($mysqli->connect_error) {
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit();
}

// Get email from token
$stmt = $mysqli->prepare("SELECT email FROM users WHERE token = ?");
$stmt->bind_param("s", $token);
$stmt->execute();
$res = $stmt->get_result();
$user = $res->fetch_assoc();

if (!$user || !$user["email"]) {
    echo json_encode(["success" => false, "message" => "User not found"]);
    exit();
}

$email = $user["email"];

// Get all approved friends (sender or recipient is this user)
$stmt = $mysqli->prepare("
    SELECT sender, recipient FROM friends
    WHERE approved = 1 AND (sender = ? OR recipient = ?)
");
$stmt->bind_param("ss", $email, $email);
$stmt->execute();
$result = $stmt->get_result();

$friendEmails = [];

while ($row = $result->fetch_assoc()) {
    $friendEmail = ($row["sender"] === $email) ? $row["recipient"] : $row["sender"];
    $friendEmails[] = $friendEmail;
}

// Fetch full details for friends
if (count($friendEmails) > 0) {
    $placeholders = implode(',', array_fill(0, count($friendEmails), '?'));
    $types = str_repeat('s', count($friendEmails));

    $stmt = $mysqli->prepare("
        SELECT email, first_name, last_name, user_image_url 
        FROM users 
        WHERE email IN ($placeholders)
    ");
    $stmt->bind_param($types, ...$friendEmails);
    $stmt->execute();
    $res = $stmt->get_result();

    $friends = [];

    while ($row = $res->fetch_assoc()) {
        $friends[] = [
            "email" => $row["email"],
            "first_name" => $row["first_name"],
            "last_name" => $row["last_name"],
            "user_image_url" => $row["user_image_url"] ?? null
        ];
    }

    echo json_encode(["success" => true, "friends" => $friends]);
} else {
    echo json_encode(["success" => true, "friends" => []]);
}
?>
