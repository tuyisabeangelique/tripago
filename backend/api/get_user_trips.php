<?php

	// Database connection
	$servername = "localhost"; 
	$username = "root"; 
	$dpassword = ""; 
	$dbname = "tripago"; 

	
	$conn = new mysqli($servername, $username, $dpassword, $dbname);
	if ($conn->connect_error) {
		die(json_encode(["status" => "error", "message" => "Database connection failed"]));
	}

	// Get JSON input from React frontend
	$data = json_decode(file_get_contents("php://input"), true);

	if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['email'])) {
		$email = $_GET['email'];

		$stmt = $conn->prepare("SELECT first_name, last_name, city_name, country_name, start_date, end_date, created_at, image_url FROM trips WHERE email = ?");
		$stmt->bind_param("s", $email);
		$stmt->execute();
		$result = $stmt->get_result();

		$trips = [];
		while ($row = $result->fetch_assoc()) {
			$trips[] = $row;
		}

		echo json_encode($trips);

		$stmt->close();
		$conn->close();
	} else {
		http_response_code(400);
		echo json_encode(["error" => "Missing or invalid email parameter"]);
	}
?>
