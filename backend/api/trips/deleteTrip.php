<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

error_reporting(E_ALL);
ini_set('display_errors', '1');

// Authenticate & get email
$token = $_COOKIE['authCookie'];

$mysqli = new mysqli("localhost","romanswi","50456839","cse442_2025_spring_team_aj_db");
if ($mysqli->connect_error != 0){
  echo json_encode(["success"=>false,"message"=>"Database connection failed ". $mysqli->connect_error]);
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

// Get input data
$data = json_decode(file_get_contents("php://input"), true);
$id = $data["id"];
if (!$id) {
  echo json_encode(["success" => false, "message" => "trip id not provided"]);
  exit();
}

// Validate trip by email
$stmt = $mysqli->prepare("SELECT * FROM trips WHERE email=? AND id=?");
$stmt->bind_param("si", $email, $id);
$stmt->execute();
$result = $stmt->get_result();
$result = $result->fetch_assoc();
if (!$result) {
  echo json_encode(["success" => false, "message" => "Trip not found"]);
  exit();
}

// Deal with foreign keys
$stmt = $mysqli->prepare("DELETE FROM comments WHERE trip_id=?");
$stmt->bind_param("i", $id);
$stmt->execute();

$stmt = $mysqli->prepare("DELETE FROM expenses WHERE trip_id=?");
$stmt->bind_param("i", $id);
$stmt->execute();

$stmt = $mysqli->prepare("DELETE FROM trip_collaborators WHERE trip_id=?");
$stmt->bind_param("i", $id);
$stmt->execute();

$stmt = $mysqli->prepare("DELETE FROM trip_discussion WHERE trip_id=?");
$stmt->bind_param("i", $id);
$stmt->execute();

// Delete trip
$stmt = $mysqli->prepare("DELETE FROM trips WHERE email=? AND id=?");
$stmt->bind_param("si", $email, $id);
$stmt->execute();

echo json_encode(["success" => true, "message" => "Trip successfully deleted"])

?>