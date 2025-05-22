<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

// Write log to current directory
$logPath = __DIR__ . "/activity_fetch_debug.log";
function log_msg($msg) {
    global $logPath;
    file_put_contents($logPath, "[" . date("Y-m-d H:i:s") . "] $msg\n", FILE_APPEND);
}

// Get JSON input
$jsonData = file_get_contents("php://input");
$data = json_decode($jsonData, true);

if (!$data) {
    log_msg("ERROR: Invalid JSON input.");
    echo json_encode(["success" => false, "message" => "Invalid JSON input"]);
    exit();
}

$start = $data['start_date'] ?? null;
$city = $data['city_name'] ?? null;

if (!$start || !$city) {
    log_msg("ERROR: Missing start_date or city_name in input.");
    echo json_encode(["success" => false, "message" => "Missing required trip info"]);
    exit();
}

// Authenticate user via token
$token = $_COOKIE['authCookie'] ?? '';
$mysqli = new mysqli("localhost", "romanswi", "50456839", "cse442_2025_spring_team_aj_db");

if ($mysqli->connect_errno) {
    log_msg("ERROR: Database connection failed: " . $mysqli->connect_error);
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit();
}

$userStmt = $mysqli->prepare("SELECT email FROM users WHERE token = ?");
$userStmt->bind_param("s", $token);
$userStmt->execute();
$userResult = $userStmt->get_result()->fetch_assoc();

$email = $userResult['email'] ?? null;
log_msg("Auth token resolved to email: " . ($email ?? "NULL"));

if (!$email) {
    log_msg("ERROR: Invalid token, no email found.");
    echo json_encode(["success" => false, "message" => "User not logged in"]);
    exit();
}

// Get the correct trip_id using both start_date and city_name
// First, try to find trip as owner
$tripStmt = $mysqli->prepare("
  SELECT id FROM trips 
  WHERE email = ? AND start_date = ? AND city_name = ?
");
$tripStmt->bind_param("sss", $email, $start, $city);
$tripStmt->execute();
$tripResult = $tripStmt->get_result()->fetch_assoc();

$tripId = $tripResult['id'] ?? null;

// If not found as owner, try to find trip as collaborator
if (!$tripId) {
    log_msg("Not found as owner, trying collaborator check.");

    $collabStmt = $mysqli->prepare("
      SELECT t.id FROM trips t
      JOIN trip_collaborators c ON t.id = c.trip_id
      WHERE c.user_email = ? AND t.start_date = ? AND t.city_name = ?
    ");
    $collabStmt->bind_param("sss", $email, $start, $city);
    $collabStmt->execute();
    $collabResult = $collabStmt->get_result()->fetch_assoc();
    $tripId = $collabResult['id'] ?? null;
}

if (!$tripId) {
    log_msg("ERROR: No trip found for given user, start_date, and city_name.");
    echo json_encode(["success" => false, "message" => "No trip found"]);
    exit();
}

// Now fetch activities using trip_id
$activityStmt = $mysqli->prepare("SELECT day_number, activity_name, price FROM activities WHERE trip_id = ?");
$activityStmt->bind_param("i", $tripId);
$activityStmt->execute();
$res = $activityStmt->get_result();

$activities = [];
while ($row = $res->fetch_assoc()) {
    $activities[] = [
        "day" => $row["day_number"],
        "name" => $row["activity_name"],
        "price" => $row["price"]
    ];
}

log_msg("Activities fetched for trip_id $tripId: " . json_encode($activities));
echo json_encode(["success" => true, "activities" => $activities]);
?>
