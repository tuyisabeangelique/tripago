<?php
ini_set('display_errors', 1);
header("Content-Type: application/json");

//$sender = $_GET['sender'];
$receiver = $_GET['receiver'];

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


$sql = "SELECT * FROM messages WHERE (sender=? AND receiver=?) OR (sender=? AND receiver=?) ORDER BY timestamp ASC";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ssss", $sender, $receiver, $receiver, $sender);
$stmt->execute();
$result = $stmt->get_result();

$messages = array();
while ($row = $result->fetch_assoc()) {
  $messages[] = $row;
}

echo json_encode($messages);

$conn->close();
?>
