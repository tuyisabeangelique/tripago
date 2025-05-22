<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

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

// Total Trips
$tripStmt = $mysqli->prepare("SELECT COUNT(*) AS total FROM trips WHERE email = ?");
$tripStmt->bind_param("s", $email);
$tripStmt->execute();
$totalTrips = $tripStmt->get_result()->fetch_assoc()['total'] ?? 0;

// Distinct Countries
$countryStmt = $mysqli->prepare("SELECT COUNT(DISTINCT country_name) AS uniqueCountries FROM trips WHERE email = ?");
$countryStmt->bind_param("s", $email);
$countryStmt->execute();
$countries = $countryStmt->get_result()->fetch_assoc()['uniqueCountries'] ?? 0;

echo json_encode([
  "success" => true,
  "totalTrips" => (int)$totalTrips,
  "countriesVisited" => (int)$countries
]);
?>
