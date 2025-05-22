
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
		}
		
		$quote = $data->quote;
		$trip = $data->trip;
		$userName = $data->userName;
		$imageUrl = $data->tripImage;
		
		$output ='<p>A User shared their recent trip to '.$trip.' with you!</p>';
		$output.='<img src='.$imageUrl.'>';		
		$output.='<p>Quote from user: </p>';
        	$output.='<p>'.$quote.'</p>';
        	$output.='<p>If you enjoy services such as this you can sign up <a href="https://cattle.cse.buffalo.edu/CSE442/2025-Spring/cse-442aj/frontend/#/signup">here</a><p>';
		$output.='<p>If you already have an account you can login <a href="https://cattle.cse.buffalo.edu/CSE442/2025-Spring/cse-442aj/frontend/#/login">here</a><p>';
        	$body = $output; 
		$subject = 'Message from '.$userName;
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
		
		// Add image attachments
		if (isset($data->images)) {
			foreach ($data->images as $image) {
				$imageData = base64_decode($image->data);
				$filename = preg_replace("/[^a-zA-Z0-9\._-]/", "", $image->filename); // sanitize filename
				$mail->addStringAttachment($imageData, $filename, 'base64', $image->type);
			}
		}
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