<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$input = json_decode(file_get_contents("php://input"), true);
$email = $input['email'] ?? null;

if (!$email) {
  echo json_encode(["success" => false, "message" => "Missing email"]);
  exit();
}

$mysqli = new mysqli("localhost", "romanswi", "50456839", "cse442_2025_spring_team_aj_db");
if ($mysqli->connect_errno) {
  echo json_encode(["success" => false, "message" => "DB connection failed"]);
  exit();
}

$stmt = $mysqli->prepare("SELECT destination FROM bucket_list WHERE user_email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();

$result = $stmt->get_result();
$destinations = [];

while ($row = $result->fetch_assoc()) {
  $destinations[] = $row["destination"];
}

echo json_encode(["success" => true, "bucketList" => $destinations]);
?>
