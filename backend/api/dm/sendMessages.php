<?php
ini_set('display_errors', 1);
header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->receiver) || !isset($data->message)){
	echo json_encode(["status" => "error"]);
	exit;
}

//$sender = $data->sender;
$receiver = $data->receiver;
$message = $data->message;
$timestamp = date("Y-m-d H:i:s");

$token = $_COOKIE['authCookie'];

$conn = new mysqli("localhost", "npula", "50540565", "cse442_2025_spring_team_aj_db");

if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

$stmt = $conn->prepare("SELECT * FROM users WHERE token=?");
$stmt->bind_param("s",$token);
$stmt->execute();

$result = $stmt->get_result();
$result = $result->fetch_assoc();

$sender = $result["email"];


$sql = "INSERT INTO messages (sender, receiver, message, timestamp) VALUES (?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ssss", $sender, $receiver, $message, $timestamp);
$stmt->execute();

echo json_encode(["status" => "success"]);

$conn->close();
?>
