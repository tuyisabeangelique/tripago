<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

// Get and decode the request body
$data = json_decode(file_get_contents("php://input"), true);
$tripId = $data['trip_id'] ?? null;

// Validate input
if (!$tripId) {
    echo json_encode(["success" => false, "message" => "Missing trip_id"]);
    exit();
}

// Connect to the database
$mysqli = new mysqli("localhost", "romanswi", "50456839", "cse442_2025_spring_team_aj_db");

if ($mysqli->connect_errno) {
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit();
}

// Fetch trip info
$tripStmt = $mysqli->prepare("SELECT * FROM trips WHERE id = ?");
$tripStmt->bind_param("i", $tripId);
$tripStmt->execute();
$tripResult = $tripStmt->get_result();
$trip = $tripResult->fetch_assoc();

if (!$trip) {
    echo json_encode(["success" => false, "message" => "Trip not found"]);
    exit();
}

// Fetch expense items for this trip
$expenseStmt = $mysqli->prepare("SELECT category, amount FROM expenses WHERE trip_id = ?");
$expenseStmt->bind_param("i", $tripId);
$expenseStmt->execute();
$expenseResult = $expenseStmt->get_result();

$expenses = [];
while ($row = $expenseResult->fetch_assoc()) {
    $expenses[] = [
        "category" => $row['category'],
        "amount" => floatval($row['amount'])
    ];
}

// Build response
$response = [
    "success" => true,
    "trip" => [
        "id" => $trip['id'],
        "city_name" => $trip['city_name'],
        "country_name" => $trip['country_name'],
        "start_date" => $trip['start_date'],
        "end_date" => $trip['end_date'],
        "image_url" => $trip['image_url'],
        "budget" => [
            "amount" => floatval($trip['budget_amount']),
            "expenses" => $expenses
        ],
        "hotel" => [
            "name" => $trip['hotel_name'] ?? "",
            "price" => floatval($trip['hotel_price'] ?? 0)
        ]
    ]
];

echo json_encode($response);
?>
