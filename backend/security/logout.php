<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

function write_debug($msg) {
  file_put_contents(__DIR__ . "/debug_log.txt", date("Y-m-d H:i:s") . " - " . $msg . "\n", FILE_APPEND);
}

write_debug("logout.php script STARTED");

setcookie("authCookie", "", time() - 3600, "/", "", true, true);
setcookie("user", "", time() - 3600, "/", "", true, true);

echo json_encode(["success" => true, "message" => "Logged out successfully"]);
?>
