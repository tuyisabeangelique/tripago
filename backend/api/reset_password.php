
<?php

	header("Access-Control-Allow-Origin: *");
	header("Access-Control-Allow-Methods: OPTIONS, PUT, GET, POST");
	header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization");

	use PHPMailer\PHPMailer\PHPMailer;
	use PHPMailer\PHPMailer\SMTP;
	//use PHPMailer\PHPMailer\Exception;

	include dirname(__DIR__) .'/PHPMailer.php';
  	include dirname(__DIR__) .'/SMTP.php';
  	//include dirname(__DIR__) .'/Exception.php';

	//$path_to_composers_autoloader = dirname(__FILE__) . "/frontend/vendor/" . "autoload.php";
	//Load Composer's autoloader
	//require '..\..\npula\frontend\vendor\autoload.php';
	//require $_SERVER['DOCUMENT_ROOT'] . '../../npula/frontend/vendor/autoload.php';
	require "vendor/autoload.php";

	$con = mysqli_connect("localhost","npula","50540565","cse442_2025_spring_team_aj_db");
		if (mysqli_connect_errno()){
			die(json_encode(["status" => "error", "message" => "Database connection failed"]));
			//echo "Failed to connect to MySQL: " . mysqli_connect_error();
			//die();
		}
	$data = json_decode(file_get_contents("php://input"));
	$url = "";

	$error="";
	//if(isset($_POST["email"]) && (!empty($_POST["email"]))){
	if(isset($data->email) && (!empty($data->email))){
		//$email = $_POST["email"];
		$email = $con->real_escape_string($data->email);
		$email = filter_var($email, FILTER_SANITIZE_EMAIL);
		$email = filter_var($email, FILTER_VALIDATE_EMAIL);
		if (!$email) {
		   //$error .="<p>Invalid email address please type a valid email address!</p>";
		   echo json_encode(["status" => "error", "message" => "Enter a valid email"]);
		   exit;
		}else{
			// THIS WAS CLEANED ON LINES 35-37
		   $sel_query = "SELECT email FROM users WHERE email='$email' LIMIT 1";
		   $results = mysqli_query($con,$sel_query);
		   $row = mysqli_num_rows($results);
		   if ($row==0){
			   echo json_encode(["status" => "error", "message" => "Email not found"]);
			   exit;
		   }
		}
		$expFormat = mktime(
		date("H"), date("i"), date("s"), date("m") ,date("d")+1, date("Y")
		);
		$expDate = date("Y-m-d H:i:s",$expFormat);
		$token = bin2hex(random_bytes(16));
		$token_hash = hash("sha256", $token);
	   
		$key = $token;
	
		// Insert token (key) into table
		// All these variables were either made by us in the backend or were cleaned previously
		$sel_query = "UPDATE users SET reset_token='$key', reset_token_expires= '$expDate' WHERE email='$email'";
		if (!$results = mysqli_query($con, $sel_query)) {
			echo json_encode(["status" => "error", "message" => "Unable to update user: $email"]);
			exit;
		} 
		//echo json_encode(["status" => "success", "message" => "updated user: $email, $key"]);
		//exit;
		//$row = mysqli_num_rows($results);
		//if ($row==0){
		//	echo json_encode(["status" => "error", "message" => "Unable to update user"]);
		//	exit;
		//}
		//"INSERT INTO `users` (`email`, `key`, `expDate`) VALUES ('".$email."', '".$key."', '".$expDate."');");
		
		$output='<p>To user,</p>';
		$output.='<p>Please click on the following link to reset your password.</p>';
		$output.='<p>-------------------------------------------------------------</p>';
		$output.='<p><a href="https://cattle.cse.buffalo.edu/CSE442/2025-Spring/cse-442aj/frontend/#/new-password?key='.$key.'&email='.$email.'&action=reset" target="_blank">
		https://cattle.cse.buffalo.edu/CSE442/2025-Spring/cse-442aj/frontend/#/new-password?key=$key&email=$email&action=reset</a></p>';	
		$url = 'https://cattle.cse.buffalo.edu/CSE442/2025-Spring/cse-442aj/frontend/#/new-password?key='.$key.'&email='.$email.'&action=reset';
		$output.='<p>-------------------------------------------------------------</p>';
		$output.='<p>Please be sure to copy the link into your browser.
		The link will expire after 1 day for security reason.</p>';
		$output.='<p>If you did not request this forgotten password email, no action 
		is needed, your password will not be reset.</p>';   	
		$output.='<p>Thanks,</p>';
		$output.='<p>Tripago Team</p>';
		$body = $output; 
		$subject = "Password Recovery - Tripago";
		$emailSentNotification = "If the email doesnt show up in your inbox please check the junk/spam folder.";

		$email_to = $email;
		$fromserver = "[npulaaa@gmail.com]"; // enter email in brackets
		//require("PHPMailer/PHPMailerAutoload.php");
		
		
		$mail = new PHPMailer();
		//$mail->SMTPDebug = SMTP::DEBUG_SERVER;
		$mail->IsSMTP();
		$mail->Host = "smtp.gmail.com"; // Enter your host here
		$mail->SMTPAuth = true;
		$mail->Username = "npulaaa@gmail.com"; // Enter your email here
		$mail->Password = "sjdi xwyh jbpi sxvo"; //Enter your password here
		$mail->Port = 465;
		$mail->IsHTML(true);
		$mail->From = "npulaaa@gmail.com";
		$mail->FromName = "Tripago";
		$mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
		//$mail->Sender = $fromserver; // indicates ReturnPath header
		$mail->Subject = $subject;
		$mail->Body = $body;
		$mail->AddAddress($email_to);
		if(!$mail->Send()){
			//echo "Mailer Error: " . $mail->ErrorInfo;
			echo json_encode(["status" => "success", "message" => "Mailer Error: " . $mail->ErrorInfo]);
			exit;
		} 

		//echo json_encode(["status" => "success", "message" => "Email sent:", "resetLink" => $url]);
		echo json_encode(["status" => "success", "message" => "Email sent:", "resetLink" => $emailSentNotification]);
		exit;		
	}else{
		echo json_encode(["status" => "error", "message" => "Email is required"]);
		exit;
	}
?>