<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');

$servername = "localhost";
$username = "npula";
$password = "50540565";
$dbname = "cse442_2025_spring_team_aj_db";

$data = json_decode(file_get_contents("php://input"), true);
$name = $data["cityName"];
$cityCode = isset($data["cityCode"]) ? $data["cityCode"] : null;

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

if (!$email || !$name) {
    echo json_encode(["success" => false, "message" => "Missing required fields"]);
    exit();
}

// SQL query to insert into the favorites table

$query = "INSERT INTO favorites (email, location, city_code) VALUES (?, ?, ?)";
$stmt = mysqli_prepare($mysqli, $query);
mysqli_stmt_bind_param($stmt, "sss", $email, $name, $cityCode);

if (mysqli_stmt_execute($stmt)) {
    echo json_encode(["success" => true, "message" => "Added to favorites"]);
} else {
    echo json_encode(["success" => false, "message" => "Database error"]);
}

mysqli_stmt_close($stmt);
mysqli_close($mysqli);