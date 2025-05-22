<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT,GET,POST,DELETE,OPTIONS");
header("Content-Type: application/json");

// Get form data
$tripId = $_POST["tripId"];
$caption = $_POST["caption"];

// Get email from auth token
$token = $_COOKIE['authCookie'];
$mysqli = new mysqli("localhost","romanswi","50456839","cse442_2025_spring_team_aj_db");
$stmt = $mysqli->prepare("SELECT * FROM users WHERE token=?");
$stmt->bind_param("s",$token);
$stmt->execute();
$result = $stmt->get_result();
$result = $result->fetch_assoc();
$email = $result["email"];
if (!$email) {
    echo json_encode(["success" => false, "message" => "User not authenticated"]);
    exit();
}

// Check if user is owner or user is collaborator
$stmt = $mysqli->prepare("
  SELECT t.id FROM trips t
  LEFT JOIN trip_collaborators c ON t.id = c.trip_id
  WHERE t.id = ? AND (t.email = ? OR c.user_email = ?)
");
$stmt->bind_param("iss", $tripId, $email, $email);
$stmt->execute();
$result = $stmt->get_result()->fetch_assoc();
if (!$result) {
  echo json_encode(["success" => false, "message" => "You don’t have access to this trip"]);
  exit();
}

// Add memory to database
$stmt = $mysqli->prepare("INSERT INTO memories (trip_id, caption) VALUES (?, ?)");
$stmt->bind_param("is", $tripId, $caption);
$stmt->execute();

$memId = $stmt->insert_id;

// Prepare image directory
$uploadDir = __DIR__ . "/pictures/";
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

foreach($_FILES["images"]["tmp_name"] as $i => $tmp) {

    // Make sure the file works
    if (!isset($_FILES["images"]) || $_FILES["images"]["error"][$i] !== UPLOAD_ERR_OK) {
        echo json_encode(["success" => false, "message" => "Invalid file upload: " . $_FILES["images"]["error"][$i]]);
        exit();
    }

    // Prepare filename
    $filename = basename($_FILES["images"]["name"][$i]);
    $uniqueName = uniqid() . "_" . $filename;
    $targetFile = $uploadDir . $uniqueName;
    
    // Move file
    if (!move_uploaded_file($_FILES["images"]["tmp_name"][$i], $targetFile)) {
        echo json_encode(["success" => false, "message" => "Upload failed: " . $_FILES["images"]["error"][$i]]);
        exit();
    }
    
    // Prepare DB
    $relativePath = "/CSE442/2025-Spring/cse-442aj/backend/api/trips/pictures/" . $uniqueName;
    $stmt = $mysqli->prepare("INSERT INTO memory_images (trip_id, memory_id, image_url) VALUES (?, ?, ?)");
    $stmt->bind_param("iis", $tripId, $memId, $relativePath);
    $stmt->execute();
}

echo json_encode(["success" => true, "message" => "Memory saved"]);

?>