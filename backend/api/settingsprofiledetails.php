<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT,GET,POST,DELETE,OPTIONS");
header("Content-Type: application/json");

$jsonData = file_get_contents("php://input");

//DATA SHOULD HAVE DICTIONARY THING FROM SIGNUP PAGE
$data = json_decode($jsonData,true);

if ($data == null){
  echo json_encode(["success"=>false,"message"=>"Error with data recieved"]);
}

$displayName = $data['displayName'];
$email = $data['email'];

//establish connection to sql DATABASE
$mysqli = new mysqli("localhost","romanswi","50456839","cse442_2025_spring_team_aj_db");

//return error if there is connection issue to database
if ($mysqli->connect_errno != 0){
  echo json_encode(["success"=>false,"message"=>"Database connection failed". $mysqli->connect_errno]);
}

//prepare
$stmt = $mysqli->prepare("SELECT * FROM users WHERE email=?");

//specify that firstname will go into above param
$stmt->bind_param("s",$email);

//execute the sql command
$stmt->execute();

//gets sql container object of all results
$result = $stmt->get_result();

//gets next result in object (will be null if doesn't return anything)
$result = $result->fetch_assoc();

$token = $_COOKIE['authCookie'];

$stmt = $mysqli->prepare("SELECT * FROM users WHERE token=?");
$stmt->bind_param("s",$token);
$stmt->execute();

$old = $stmt->get_result();
$old = $old->fetch_assoc();

$oldEmail = $old["email"];

if ($result == null){ //email is available

  $stmt = $mysqli->prepare("UPDATE users SET email=? WHERE token=?");
  $stmt->bind_param("ss", $email, $token);
  $stmt->execute();

  $stmt = $mysqli->prepare("UPDATE trips SET email=? WHERE email=?");
  $stmt->bind_param("ss",$email,$oldEmail);
  $stmt->execute();

  $stmt = $mysqli->prepare("UPDATE trip_discussion SET user_email=? WHERE user_email=?");
  $stmt->bind_param("ss",$email,$oldEmail);
  $stmt->execute();

  $stmt = $mysqli->prepare("UPDATE trip_collaborators SET user_email=? WHERE user_email=?");
  $stmt->bind_param("ss",$email,$oldEmail);
  $stmt->execute();

  $stmt = $mysqli->prepare("UPDATE comments SET commenter_email=? WHERE commenter_email=?");
  $stmt->bind_param("ss",$email,$oldEmail);
  $stmt->execute();

  $stmt = $mysqli->prepare("UPDATE bucket_list SET user_email=? WHERE user_email=?");
  $stmt->bind_param("ss",$email,$oldEmail);
  $stmt->execute();

  $stmt = $mysqli->prepare("UPDATE activities SET email=? WHERE email=?");
  $stmt->bind_param("ss",$email,$oldEmail);
  $stmt->execute();

  $stmt = $mysqli->prepare("UPDATE friends SET 
  sender = REPLACE(sender,?,?),
  recipient = REPLACE(recipient,?,?)
  WHERE
  sender=? OR recipient=?
 
");
  $stmt->bind_param("ssssss",$oldEmail,$email,$oldEmail,$email,$oldEmail,$oldEmail);
  $stmt->execute();



  $expiration = (new DateTime())->getTimestamp() + 3600;
  setcookie("user",$email,$expiration,"/","",true,true);

  $response = ["success"=>true, "message"=>"Changed profile details successfully!"];
  echo json_encode($response);
  
} elseif ($email == $oldEmail) {

  $response = ["success"=>false, "message"=>"New email is the same as old email"];

  echo json_encode($response);

} else {

  $response = ["success"=>false, "message"=>"This email is already taken"];

  echo json_encode($response);

}

?>
