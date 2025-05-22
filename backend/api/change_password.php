<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT,GET,POST,DELETE,OPTIONS");
header("Content-Type: application/json");

// Get JSON input
$jsonData = file_get_contents("php://input");
$data = json_decode($jsonData, true);

if ($data == null) {
    echo json_encode(["success" => false, "message" => "Error with data received"]);
    exit();
}

// Connect to database
$mysqli = new mysqli("localhost", "romanswi", "50456839", "cse442_2025_spring_team_aj_db");

if ($mysqli->connect_errno != 0) {
    echo json_encode(["success" => false, "message" => "Database connection failed " . $mysqli->connect_errno]);
    exit();
}

// Get auth token from cookie
$token = $_COOKIE['authCookie'] ?? null;
if (!$token) {
    echo json_encode(["success" => false, "message" => "Not logged in"]);
    exit();
}

// Get user from token
$stmt = $mysqli->prepare("SELECT * FROM users WHERE token = ?");
$stmt->bind_param("s", $token);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();

if (!$user) {
    echo json_encode(["success" => false, "message" => "Invalid session"]);
    exit();
}

// Verify current password
if (!password_verify($data['currentPassword'], $user['password_hash'])) {
    echo json_encode(["success" => false, "message" => "Current password is incorrect"]);
    exit();
}

// Validate new password
$newPassword = $data['newPassword'];
$confirmPassword = $data['confirmPassword'];

if ($newPassword !== $confirmPassword) {
    echo json_encode(["success" => false, "message" => "New passwords don't match"]);
    exit();
}

if (
    strlen($newPassword) < 6 || 
    !preg_match('/[A-Z]/', $newPassword) || 
    !preg_match('/[\d\W]/', $newPassword) || 
    !preg_match('/[\W_]/', $newPassword)
) {
    echo json_encode([
        "success" => false, 
        "message" => "Password must be at least 6 characters long, include one uppercase letter and one number/special character"
    ]);
    exit();
}

// Hash and update new password
$hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT);
$updateStmt = $mysqli->prepare("UPDATE users SET password_hash = ? WHERE token = ?");
$updateStmt->bind_param("ss", $hashedPassword, $token);

if ($updateStmt->execute()) {
    echo json_encode(["success" => true, "message" => "Password updated successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to update password"]);
}
