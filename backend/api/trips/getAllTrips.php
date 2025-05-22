<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// Get auth token from cookie
$token = $_COOKIE['authCookie'] ?? null;

if (!$token) {
  echo json_encode(["success" => false, "message" => "No auth token provided"]);
  exit();
}

// Connect to DB
$mysqli = new mysqli("localhost", "romanswi", "50456839", "cse442_2025_spring_team_aj_db");
if ($mysqli->connect_errno) {
  echo json_encode(["success" => false, "message" => "Database connection failed"]);
  exit();
}

// Look up user by token
$stmt = $mysqli->prepare("SELECT email FROM users WHERE token=?");
$stmt->bind_param("s", $token);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

if (!$user || !isset($user["email"])) {
  echo json_encode(["success" => false, "message" => "Not logged in"]);
  exit();
}

$email = $user["email"];

$trips = [];
$collaborating = [];

// ───────── FETCH USER'S OWN TRIPS ─────────
$stmt = $mysqli->prepare("
  SELECT id, city_name, start_date, end_date, image_url, travel_log, hotel_name, hotel_price
  FROM trips 
  WHERE email = ? 
  ORDER BY created_at DESC
");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

while ($row = $result->fetch_assoc()) {
  $tripId = $row['id'];
  $start = $row['start_date'];
  $end = $row['end_date'];

  $formattedDates = "";
  if ($start && $end) {
    $formattedStart = date("n/j", strtotime($start));
    $formattedEnd = date("n/j", strtotime($end));
    $formattedDates = "$formattedStart - $formattedEnd";
  }

  // Get total expenses
  $expenseStmt = $mysqli->prepare("SELECT SUM(amount) as total_expenses FROM expenses WHERE trip_id = ?");
  $expenseStmt->bind_param("i", $tripId);
  $expenseStmt->execute();
  $expenseResult = $expenseStmt->get_result()->fetch_assoc();

  $totalPrice = (float)($expenseResult["total_expenses"] ?? 0);

  $trips[] = [
    "id" => $tripId,
    "destination" => $row["city_name"],
    "start_date" => $start,
    "end_date" => $end,
    "dates" => $formattedDates,
    "price" => $totalPrice,
    "image_url" => $row["image_url"],
    "hotel_name" => $row["hotel_name"],
    "hotel_price" => $row["hotel_price"],
    "logged" => $row["travel_log"],
    "is_invitee" => false
  ];
}

// ───────── FETCH TRIPS WHERE USER IS A COLLABORATOR ─────────
$collabStmt = $mysqli->prepare("
  SELECT t.id, t.city_name, t.start_date, t.end_date, t.image_url, t.travel_log, t.hotel_name, t.hotel_price
  FROM trips t
  JOIN trip_collaborators c ON t.id = c.trip_id
  WHERE c.user_email = ? AND t.email != ? AND c.accepted = 1
  ORDER BY t.created_at DESC
");
$collabStmt->bind_param("ss", $email, $email);
$collabStmt->execute();
$collabResult = $collabStmt->get_result();

while ($row = $collabResult->fetch_assoc()) {
  $tripId = $row['id'];
  $start = $row['start_date'];
  $end = $row['end_date'];

  $formattedDates = "";
  if ($start && $end) {
    $formattedStart = date("n/j", strtotime($start));
    $formattedEnd = date("n/j", strtotime($end));
    $formattedDates = "$formattedStart - $formattedEnd";
  }

  // Get total expenses
  $expenseStmt = $mysqli->prepare("SELECT SUM(amount) as total_expenses FROM expenses WHERE trip_id = ?");
  $expenseStmt->bind_param("i", $tripId);
  $expenseStmt->execute();
  $expenseResult = $expenseStmt->get_result()->fetch_assoc();

  $totalPrice = (float)($expenseResult["total_expenses"] ?? 0);

  $collaborating[] = [
    "id" => $tripId,
    "destination" => $row["city_name"],
    "start_date" => $start,
    "end_date" => $end,
    "dates" => $formattedDates,
    "price" => $totalPrice,
    "image_url" => $row["image_url"],
    "hotel_name" => $row["hotel_name"],
    "hotel_price" => $row["hotel_price"],
    "logged" => $row["travel_log"],
    "is_invitee" => true
  ];
}

// Final response
if (empty($trips) && empty($collaborating)) {
  echo json_encode(["success" => false, "message" => "No trips found"]);
  exit();
}

echo json_encode([
  "success" => true,
  "trips" => $trips,
  "collaborating" => $collaborating
]);
?>
