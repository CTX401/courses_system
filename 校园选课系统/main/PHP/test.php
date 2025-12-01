<?php
$servername = "localhost";
$username = "root";
$password = "Tian1027#"; // or your MySQL password
$database = "testdb";

// Create connection
$conn = new mysqli($servername, $username, $password, $database);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Get data from form
$name = $_POST['name'];
$email = $_POST['email'];

// Insert data into table
$sql = "INSERT INTO users (name, email) VALUES ('$name', '$email')";

if ($conn->query($sql) === TRUE) {
    echo "New record created successfully!<br>";
    echo "Name: $name<br>Email: $email";
} else {
    echo "Error: " . $sql . "<br>" . $conn->error;
}

$conn->close();
?>
