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

// Get the most recent trip (sorted by created_at)
$stmt = $mysqli->prepare("
  SELECT id, city_name, country_name, start_date, end_date, image_url, budget_amount, hotel_name, hotel_price
  FROM trips 
  WHERE email = ? 
  ORDER BY created_at DESC 
  LIMIT 1
");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();
$trip = $result->fetch_assoc();

if (!$trip) {
  echo json_encode(["success" => false, "message" => "No trips found"]);
  exit();
}

$tripId = $trip["id"];

// Fetch expenses for this trip
$expensesStmt = $mysqli->prepare("SELECT category, amount FROM expenses WHERE trip_id = ?");
$expensesStmt->bind_param("i", $tripId);
$expensesStmt->execute();
$expensesResult = $expensesStmt->get_result();

$expenses = [];
while ($row = $expensesResult->fetch_assoc()) {
  $expenses[] = [
    "category" => $row["category"],
    "amount" => (float)$row["amount"],
  ];
}

$response = [
  "id" => (int)$trip["id"],
  "city_name" => $trip["city_name"],
  "country_name" => $trip["country_name"],
  "start_date" => $trip["start_date"],
  "end_date" => $trip["end_date"],
  "image_url" => $trip["image_url"],
  "budget" => [
    "amount" => (float)($trip["budget_amount"] ?? 0),
    "expenses" => $expenses,
  ],
  "hotel" => [
    "name" => $trip["hotel_name"],
    "price" => (float)($trip["hotel_price"] ?? 0),
  ],
];

echo json_encode(["success" => true, "trip" => $response]);
?>
