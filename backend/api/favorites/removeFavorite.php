<?php
	ini_set('display_errors', 1);
    header("Access-Control-Allow-Origin: *");
    header('Content-Type: application/json');

    $servername = "localhost";
    $username = "npula";
    $password = "50540565";
    $dbname = "cse442_2025_spring_team_aj_db";

    $conn = new mysqli($servername, $username, $password, $dbname);
    if ($conn->connect_errno) {
      echo json_encode(["success" => false, "message" => "Database connection failed"]);
      exit();
    }

    $data = json_decode(file_get_contents("php://input"), true);
    $cityName = $data["cityName"];
    $cityCode = $data["cityCode"];
    if (!isset($data["email"])) {
        $email = isset($_COOKIE['user']) ? $_COOKIE['user'] : null;
    } else {
        $email = $data["email"];
    }

    // Prepare the SQL statement
    $stmt = $conn->prepare("DELETE FROM favorites WHERE email = ? AND city_code = ?");
    $stmt->bind_param("ss", $email, $cityCode);

    // Execute and check for success
    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Removed from favorites"]);
    } else {
        echo json_encode(["success" => false, "message" => "Database error"]);
    }
?>