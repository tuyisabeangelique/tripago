<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$mysqli = new mysqli("localhost", "romanswi", "50456839", "cse442_2025_spring_team_aj_db");

if ($mysqli->connect_errno) {
    echo json_encode(["success" => false, "message" => "DB connection failed"]);
    exit();
}

$query = "SELECT t.*, u.first_name, u.last_name, u.user_image_url 
          FROM trips t 
          JOIN users u ON t.email = u.email 
          WHERE t.travel_log = 1
          ORDER BY t.created_at DESC";

$result = $mysqli->query($query);

if (!$result) {
    echo json_encode([
        "success" => false,
        "message" => "Query failed: " . $mysqli->error
    ]);
    exit();
}

$trips = [];

while ($row = $result->fetch_assoc()) {
    // Get the most recent comment for this trip
    $tripId = $row["id"];
    $stmt = $mysqli->prepare("SELECT comment_text FROM comments WHERE trip_id = ? ORDER BY created_at DESC LIMIT 1");
    $stmt->bind_param("i", $tripId);
    $stmt->execute();
    $commentRes = $stmt->get_result();
    $commentRow = $commentRes->fetch_assoc();
    $comment = ($commentRow && isset($commentRow["comment_text"])) ? $commentRow["comment_text"] : "";

    $trips[] = [
        "id" => $row["id"],
        "user" => $row["first_name"],
        "location" => $row["city_name"],
        "comment" => $comment,
        "imageUrl" => $row["image_url"],            // from trips
        "userImageUrl" => $row["user_image_url"] ?? null,    // from users
        "email" => $row["email"],
        "tags" => $row["tags"] ? explode(',', $row["tags"]) : []
    ];
}

echo json_encode($trips);
