<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$token = $_COOKIE['authCookie'];

$mysqli = new mysqli("localhost", "romanswi", "50456839", "cse442_2025_spring_team_aj_db");
if ($mysqli->connect_errno) {
  echo json_encode(["success" => false, "message" => "Database connection failed"]);
  exit();
}

// First, verify token and get email
$stmt = $mysqli->prepare("SELECT email FROM users WHERE token = ?");
$stmt->bind_param("s", $token);
$stmt->execute();
$result = $stmt->get_result();
$result = $result->fetch_assoc();

$email = $result["email"];

if (!$email) {
  echo json_encode(["success" => false, "message" => "Not logged in"]);
  exit();
}

// Now fetch user details including username
$stmt = $mysqli->prepare("SELECT first_name, last_name, username, user_image_url FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

if (!$user) {
  echo json_encode(["success" => false, "message" => "User not found"]);
  exit();
}

// Return full user object including username
echo json_encode([
  "success" => true,
  "user" => [
    "first_name" => $user["first_name"],
    "last_name" => $user["last_name"],
    "username" => $user["username"],
    "email" => $email,
    "user_image_url" => $user["user_image_url"] ?? null
  ]
]);
?>
