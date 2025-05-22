<?php
header('Content-Type: application/json');

if (isset($_GET['keyword'])) {
    $keyword = $_GET['keyword'];

    $mysqli = new mysqli("localhost", "romanswi", "50456839", "cse442_2025_spring_team_aj_db");

    if ($mysqli->connect_error) {
        echo json_encode(['error' => 'Database connection failed: ' . $mysqli->connect_error]);
        exit();
    }

    $stmt = $mysqli->prepare("SELECT username FROM users WHERE username LIKE ? LIMIT 10");
    $keywordWithWildcards = "%" . $keyword . "%";
    $stmt->bind_param("s", $keywordWithWildcards); // "s" indicates a string parameter

    if ($stmt->execute()) {
        $result = $stmt->get_result();
        $usernames = [];
        while ($row = $result->fetch_assoc()) {
            $usernames[] = $row['username'];
        }
        $stmt->close();
        $mysqli->close();
        echo json_encode(['usernames' => $usernames]);
    } else {
        echo json_encode(['error' => 'Error executing query: ' . $stmt->error]);
    }
} else {
    echo json_encode(['error' => 'No keyword provided']);
}
?>


