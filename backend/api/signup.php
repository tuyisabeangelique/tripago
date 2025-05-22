<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT,GET,POST,DELETE,OPTIONS");
header("Content-Type: application/json");

$jsonData = file_get_contents("php://input");
$data = json_decode($jsonData, true);

if ($data == null) {
  echo json_encode(["success" => false, "message" => "Error with data received"]);
  exit();
}

$firstName = $data['firstName'];
$lastName = $data['lastName'];
$username = $data['username'];
$email = $data['email'];
$password = $data['password'];
$confirmPassword = $data['confirmPassword'];

if (
  !preg_match('/[A-Z]/', $password) ||
  !preg_match('/[0-9!@#$%^&*(),.?":{}|<>]/', $password) ||
  strlen($password) < 6
) {
  echo json_encode(["success" => false, "message" => "Password requirements not met"]);
  exit();
}

$hashed_p_word = password_hash($password, PASSWORD_BCRYPT);

// $mysqli = new mysqli("localhost", "tuyisabe", "50393405", "cse442_2025_spring_team_aj_db");
$mysqli = new mysqli("localhost", "romanswi", "50456839", "cse442_2025_spring_team_aj_db");

if ($mysqli->connect_errno != 0) {
  echo json_encode(["success" => false, "message" => "Database connection failed " . $mysqli->connect_errno]);
  exit();
}

// Check email conflict
$emailStmt = $mysqli->prepare("SELECT id FROM users WHERE email=?");
$emailStmt->bind_param("s", $email);
$emailStmt->execute();
$emailResult = $emailStmt->get_result()->fetch_assoc();

// Check username conflict
$usernameStmt = $mysqli->prepare("SELECT id FROM users WHERE username=?");
$usernameStmt->bind_param("s", $username);
$usernameStmt->execute();
$usernameResult = $usernameStmt->get_result()->fetch_assoc();

if ($emailResult && $usernameResult) {
  echo json_encode(["success" => false, "message" => "Both the email and username are already taken"]);
} elseif ($emailResult) {
  echo json_encode(["success" => false, "message" => "This email is already taken"]);
} elseif ($usernameResult) {
  echo json_encode(["success" => false, "message" => "This username is already taken"]);
} else {
  // All clear, insert user
  $insertStmt = $mysqli->prepare("INSERT INTO users(first_name, last_name, username, email, password_hash) VALUES (?, ?, ?, ?, ?)");
  $insertStmt->bind_param("sssss", $firstName, $lastName, $username, $email, $hashed_p_word);
  $insertStmt->execute();

  echo json_encode(["success" => true, "message" => "User registered successfully!"]);
}

?>
