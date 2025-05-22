<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

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
    echo json_encode(["success" => false, "message" => "comment id not provided"]);
    exit();
}

// Delete comment
$stmt = $mysqli->prepare("DELETE FROM comments WHERE commenter_email=? AND id=?");
$stmt->bind_param("si", $email, $id);
$stmt->execute();

echo json_encode(["success" => true, "message" => "Comment successfully deleted"])

?>