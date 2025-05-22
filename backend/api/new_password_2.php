<?php
session_start();
	header("Access-Control-Allow-Origin: *");
	header("Access-Control-Allow-Methods: OPTIONS, PUT, GET, POST");
	header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization");
	
	
	// Database connection
	$servername = "localhost"; 
	$username = "npula"; 
	$dpassword = "50540565"; 
	$dbname = "cse442_2025_spring_team_aj_db"; 

	
	$con = new mysqli($servername, $username, $dpassword, $dbname);
	if ($con->connect_error) {
		die(json_encode(["status" => "error", "message" => "Database connection failed"]));
	}

	// Get JSON input from React frontend
	$data = json_decode(file_get_contents("php://input"), true);
	//$test = $data['password'];
	//echo json_encode(["status" => "success", "message" => "value: '$test'"]);
	//exit;
	
	//$token = $data['key'];
	//echo json_encode(["status" => "success", "message" => "value: $token"]);
	//$email = $data['email'];
	
    //$password = $data['password'];
    //$confirmPassword = $data['confirmPassword'];
	/*
	$con = mysqli_connect("localhost","root","","tripago");
	if (mysqli_connect_errno()){
		die(json_encode(["status" => "error", "message" => "Database connection failed"]));
		//echo "Failed to connect to MySQL: " . mysqli_connect_error();
		//die();
	}
	
	$data = json_decode(file_get_contents("php://input"), true);  // Decode JSON data
*/
	// Check if password and current password are provided
	//if (isset($data['password']) && isset($data['currentPassword'])) {
	//	$password = $data['password'];
	//	$confirmPassword = $data['currentPassword'];
	//} else {
	//	echo json_encode(["status" => "error", "message" => "no data!"]);
	//	exit;
	//}

	// Validate and reset password logic
	if (isset($data['key'])){
		$key = $data['key'];

		//echo json_encode(["status" => "error", "message" => "link expired"]);
		//exit;
		// Assuming $key is already set
		//$key = mysqli_real_escape_string($con, $key);  // Escape key to avoid SQL injection
		//echo json_encode(["status" => "success", "message" => "value: {$key}"]);

		// Query to check if a user exists with the given reset_token
		$stmt = $con->prepare("SELECT * FROM users WHERE reset_token=? LIMIT 1");
		$stmt->bind_param("s", $key);
		$stmt->execute();

		$result = $stmt->get_result();
		$result = $result->fetch_assoc();

		// Check if the query was successful and if a row is returned
		if ($result) {
			$row = mysqli_num_rows($result);
			
			// If no rows are returned, the link is invalid
			if ($row == 0) {
				echo json_encode(["status" => "error", "message" => "invalid link"]);
				exit;
			} else {
				//$row = mysqli_fetch_assoc($query);
				//$expDate = $row['expDate'];

				//if ($expDate <= $curDate) {
				//	echo json_encode(["status" => "error", "message" => "link expired"]);
				//	exit;
				//}
				$password = $data['password'];
				$confirmPassword = $data['confirmPassword'];
				
				//$key = $data['key'];
				//echo json_encode(["status" => "success", "message" => "value: $key"]);

				if ($password != $confirmPassword) {
					echo json_encode(["status" => "error", "message" => "passwords don't match"]);
					exit;
				}

				if (strlen($password) < 6 || !preg_match('/[A-Z]/', $password) || !preg_match('/[\d\W]/', $password) || !preg_match('/[\W_]/', $password)) {
    					echo json_encode(["status" => "error", "message" => "Password must be at least 6 characters long, include one uppercase letter and one number/special character"]);
    					exit;
				}	
 
				$hashed_password = password_hash($password , PASSWORD_BCRYPT);
				
				// Update the password in the database
				$stmt = $con->prepare("UPDATE users SET password_hash=? WHERE reset_token=?");
				$stmt->bind_param("ss", $hashed_password, $key);
				$stmt->execute();

				echo json_encode(["status" => "success", "message" => "password reset"]);
				exit;
			}
		} else {
		echo json_encode(["status" => "error", "message" => "no data found"]);
		exit;
		}
	}
	
	/*
	// Reset the password if the email and action are set
	if (isset($data["email"]) && isset($data["action"]) && ($data["action"] == "reset")) {
		$email = $data["email"];
		$curDate = date("Y-m-d H:i:s");

		if ($password != $confirmPassword) {
			echo json_encode(["status" => "error", "message" => "passwords don't match"]);
			exit;
		}

		// You can hash the password here (recommend using a stronger hashing algorithm like bcrypt)
		$hashedPassword = md5($password);  // This should ideally be replaced with password_hash() in production

		// Update the password in the database
		mysqli_query($con, "UPDATE `users` SET `password`='".$hashedPassword."', `reset_token_expires`='".$curDate."' WHERE `email`='".$email."';");

		echo json_encode(["status" => "success", "message" => "password reset"]);
	} */
?>