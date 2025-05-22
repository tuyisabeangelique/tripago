<?php
$servername = "localhost";
$username = "npula";
$password = "50540565";
$dbname = "cse442_2025_spring_team_aj_db";

$conn = new mysqli($servername, $username, $password, $dbname);
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data["email"])) {
    $email = isset($_COOKIE['user']) ? $_COOKIE['user'] : null;
} else {
    $email = $data["email"];
}

$query = "SELECT location, city_code FROM favorites WHERE email = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result) {
    $locations = [];
    while ($row = $result->fetch_assoc()) {
        $locations[] = [
            "location" => $row["location"],
            "cityCode" => $row["city_code"]
        ];
    }
    echo json_encode(["success" => true, "locations" => $locations]);
} else {
    echo json_encode(["success" => false, "error" => "DB error"]);
}

$conn->close();
?>