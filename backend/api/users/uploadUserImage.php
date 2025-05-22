<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

file_put_contents(__DIR__ . "/debug.log", "SCRIPT STARTED\n", FILE_APPEND);

// 1. Start log
$debugLog = fopen(__DIR__ . "/debug.log", "a");
fwrite($debugLog, "\n--- UPLOAD START ---\n");

// 2. Check user session
$token = $_COOKIE['authCookie'];

$mysqli = new mysqli("localhost","romanswi","50456839","cse442_2025_spring_team_aj_db");
if ($mysqli->connect_errno) {
  echo json_encode(["success" => false, "message" => "Database connection failed"]);
  exit();
}

$stmt = $mysqli->prepare("SELECT * FROM users WHERE token=?");
$stmt->bind_param("s",$token);
$stmt->execute();

$result = $stmt->get_result();
$result = $result->fetch_assoc();

$email = $result["email"];

if (!$email) {
  echo json_encode(["success" => false, "message" => "Not logged in"]);
  exit();
}

fwrite($debugLog, "Email from cookie: " . ($email ?? 'NULL') . "\n");

if (!$email) {
  fwrite($debugLog, "Invalid auth cookie\n");
  echo json_encode(["success" => false, "message" => "Not logged in"]);
  fclose($debugLog);
  exit();
}

// 3. Validate file
if (!isset($_FILES['image'])) {
  fwrite($debugLog, "Invalid file upload\n");
  echo json_encode(["success" => false, "message" => "Invalid file upload"]);
  fclose($debugLog);
  exit();
}

fwrite($debugLog, "Image received: " . $_FILES['image']['name'] . "\n");

// 4. Prepare upload path
$uploadDir = __DIR__ . "/pictures/";
if (!is_dir($uploadDir)) {
  fwrite($debugLog, "Pictures directory not found. Creating it.\n");
  mkdir($uploadDir, 0777, true);
}

$filename = basename($_FILES['image']['name']);
$uniqueName = uniqid() . "_" . $filename;
$targetFile = $uploadDir . $uniqueName;
fwrite($debugLog, "Target file: " . $targetFile . "\n");

// 5. Move file
if (!move_uploaded_file($_FILES['image']['tmp_name'], $targetFile)) {
  fwrite($debugLog, "move_uploaded_file FAILED\n");
  echo json_encode(["success" => false, "message" => "Upload failed"]);
  fclose($debugLog);
  exit();
}
fwrite($debugLog, "File moved successfully\n");

// 6. Prepare DB
$relativePath = "/CSE442/2025-Spring/cse-442aj/backend/api/users/pictures/" . $uniqueName;

$stmt = $mysqli->prepare("UPDATE users SET user_image_url = ? WHERE email = ?");
$stmt->bind_param("ss", $relativePath, $email);

if ($stmt->execute()) {
  fwrite($debugLog, "DB updated with image path\n");
  echo json_encode(["success" => true, "imageUrl" => $relativePath]);
} else {
  fwrite($debugLog, "DB update failed: " . $stmt->error . "\n");
  echo json_encode(["success" => false, "message" => "DB update failed"]);
}

fclose($debugLog);
?>
