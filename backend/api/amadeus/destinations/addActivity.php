<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT,GET,POST,DELETE,OPTIONS");
header("Content-Type: application/json");

$debugFile = __DIR__ . "/activity_debug.log";
function debug_log($msg) {
    global $debugFile;
    file_put_contents($debugFile, "[" . date("Y-m-d H:i:s") . "] $msg\n", FILE_APPEND);
}

$jsonData = file_get_contents("php://input");
$data = json_decode($jsonData, true);

if ($data == null) {
    debug_log("ERROR: Invalid JSON received.");
    echo json_encode(["success" => false, "message" => "Invalid data"]);
    exit();
}

$trip_id = $data['trip_id'] ?? null;
$day = $data['day'];
$name = $data['name'];
$price = $data['price'];
$start = $data['start'];
$city_name = $data['city_name'] ?? '';

debug_log("Received - Trip ID: $trip_id | Day: $day | Name: $name");

$token = $_COOKIE['authCookie'] ?? '';
debug_log("Auth Cookie: $token");

$mysqli = new mysqli("localhost", "romanswi", "50456839", "cse442_2025_spring_team_aj_db");
if ($mysqli->connect_errno) {
    debug_log("DB CONNECTION FAILED: " . $mysqli->connect_error);
    echo json_encode(["success" => false, "message" => "DB connection failed"]);
    exit();
}

// Get user email from token
$stmt = $mysqli->prepare("SELECT email, username FROM users WHERE token = ?");
$stmt->bind_param("s", $token);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();
$email = $user["email"] ?? null;
$username = $user["username"] ?? null;

if (!$email || !$username) {
    debug_log("ERROR: Not logged in or missing username.");
    echo json_encode(["success" => false, "message" => "Not logged in"]);
    exit();
}

// ───── Check permission: user must be owner or collaborator ─────
$permissionCheck = $mysqli->prepare("
    SELECT 1 FROM trips 
    WHERE id = ? AND email = ?
    UNION
    SELECT 1 FROM trip_collaborators 
    WHERE trip_id = ? AND user_email = ?
");
$permissionCheck->bind_param("isis", $trip_id, $email, $trip_id, $email);
$permissionCheck->execute();
$allowed = $permissionCheck->get_result()->num_rows > 0;

if (!$allowed) {
    debug_log("ERROR: Unauthorized user $email for trip $trip_id");
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit();
}

// ───── Prevent duplicate activity for same day ─────
if (checkForActivity($trip_id, $day)) {
    debug_log("DUPLICATE: Activity exists for trip $trip_id on day $day.");
    echo json_encode(['success' => false, 'message' => 'You already have an activity for that day!']);
    exit();
}

// ───── Insert Activity ─────
$insertStmt = $mysqli->prepare("INSERT INTO activities (trip_id, email, activity_name, day_number, price) VALUES (?, ?, ?, ?, ?)");
$insertStmt->bind_param("isssd", $trip_id, $email, $name, $day, $price);
$success = $insertStmt->execute();

if ($success) {
    debug_log("SUCCESS: Activity added for trip $trip_id by $email");

    // Insert action message into trip_discussion
    $actionMessage = "@$username added an activity";
    $logStmt = $mysqli->prepare("INSERT INTO trip_discussion (trip_id, user_email, username, message, is_action) VALUES (?, ?, ?, ?, 1)");
    $logStmt->bind_param("isss", $trip_id, $email, $username, $actionMessage);
    $logStmt->execute();

    echo json_encode(["success" => true, "message" => "Activity added!"]);
} else {
    debug_log("ERROR: Insert failed - " . $insertStmt->error);
    echo json_encode(["success" => false, "message" => "Insert failed"]);
}

// ───── Check for duplicates helper ─────
function checkForActivity($trip_id, $day) {
    $mysqli = new mysqli("localhost", "romanswi", "50456839", "cse442_2025_spring_team_aj_db");
    $stmt = $mysqli->prepare("SELECT id FROM activities WHERE trip_id = ? AND day_number = ?");
    $stmt->bind_param("ii", $trip_id, $day);
    $stmt->execute();
    $result = $stmt->get_result()->fetch_assoc();
    return $result !== null;
}
?>
