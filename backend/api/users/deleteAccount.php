<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

// Get JSON input
$data = json_decode(file_get_contents("php://input"), true);
if (!$data || !isset($data['password'])) {
    echo json_encode(["success" => false, "message" => "Password is required"]);
    exit();
}

$password = $data['password'];

// Get user from auth token
$token = $_COOKIE['authCookie'] ?? null;
if (!$token) {
    echo json_encode(["success" => false, "message" => "Not logged in"]);
    exit();
}

// Connect to database
$mysqli = new mysqli("localhost", "romanswi", "50456839", "cse442_2025_spring_team_aj_db");
if ($mysqli->connect_errno) {
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit();
}

// Get user info
$stmt = $mysqli->prepare("SELECT * FROM users WHERE token = ?");
$stmt->bind_param("s", $token);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

if (!$user) {
    echo json_encode(["success" => false, "message" => "User not found"]);
    exit();
}

// Verify password
if (!password_verify($password, $user['password_hash'])) {
    echo json_encode(["success" => false, "message" => "Incorrect password"]);
    exit();
}

// Start transaction
$mysqli->begin_transaction();

try {
    $email = $user['email'];
    
    // 1. Delete memory_images (references memories and trips)
    $stmt = $mysqli->prepare("
        DELETE mi FROM memory_images mi
        INNER JOIN trips t ON mi.trip_id = t.id
        WHERE t.email = ?
    ");
    $stmt->bind_param("s", $email);
    $stmt->execute();

    // 2. Delete memories (references trips)
    $stmt = $mysqli->prepare("
        DELETE m FROM memories m
        INNER JOIN trips t ON m.trip_id = t.id
        WHERE t.email = ?
    ");
    $stmt->bind_param("s", $email);
    $stmt->execute();

    // 3. Delete trip discussions
    $stmt = $mysqli->prepare("
        DELETE td FROM trip_discussion td
        LEFT JOIN trips t ON td.trip_id = t.id
        WHERE td.user_email = ? OR t.email = ?
    ");
    $stmt->bind_param("ss", $email, $email);
    $stmt->execute();

    // 4. Delete comments (on trips)
    $stmt = $mysqli->prepare("
        DELETE c FROM comments c
        LEFT JOIN trips t ON c.trip_id = t.id
        WHERE c.commenter_email = ? OR t.email = ?
    ");
    $stmt->bind_param("ss", $email, $email);
    $stmt->execute();

    // 5. Delete expenses
    $stmt = $mysqli->prepare("
        DELETE e FROM expenses e
        INNER JOIN trips t ON e.trip_id = t.id
        WHERE t.email = ?
    ");
    $stmt->bind_param("s", $email);
    $stmt->execute();

    // 6. Delete activities
    $stmt = $mysqli->prepare("DELETE FROM activities WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();

    // 7. Delete bucket list entries
    $stmt = $mysqli->prepare("DELETE FROM bucket_list WHERE user_email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();

    // 8. Delete favorites
    $stmt = $mysqli->prepare("DELETE FROM favorites WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();

    // 9. Delete trip collaborations
    $stmt = $mysqli->prepare("
        DELETE tc FROM trip_collaborators tc
        LEFT JOIN trips t ON tc.trip_id = t.id
        WHERE tc.user_email = ? OR t.email = ?
    ");
    $stmt->bind_param("ss", $email, $email);
    $stmt->execute();

    // 10. Delete friend connections
    $stmt = $mysqli->prepare("DELETE FROM friends WHERE sender = ? OR recipient = ?");
    $stmt->bind_param("ss", $email, $email);
    $stmt->execute();

    // 11. Delete all trips
    $stmt = $mysqli->prepare("DELETE FROM trips WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();

    // 12. Finally, delete the user
    $stmt = $mysqli->prepare("DELETE FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();

    // If we got here, commit the transaction
    $mysqli->commit();

    // Clear auth cookies
    setcookie("authCookie", "", time() - 3600, "/");
    setcookie("user", "", time() - 3600, "/");

    echo json_encode([
        "success" => true, 
        "message" => "Account and all associated data deleted successfully"
    ]);

} catch (Exception $e) {
    // If anything fails, roll back the transaction
    $mysqli->rollback();
    echo json_encode([
        "success" => false, 
        "message" => "Failed to delete account: " . $e->getMessage()
    ]);
}
?> 