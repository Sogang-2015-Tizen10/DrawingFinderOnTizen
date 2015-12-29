<?php
header("Access-Control-Allow-Origin: *");
?>
<?php
session_start();

$servername = "localhost";
$username = "cs20131570";
$password = "qwer1234";
$dbname = "db_20131570";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
// Check connection
if ($conn->connect_error) {
	die("Connection failed: " . $conn->connect_error);
}
$_SESSION['checkcheck'] = true;
$_SESSION['user_images'] = Array();

$user = $_REQUEST['user_id'];
$pass = $_REQUEST['user_passwd'];
if(isset($user, $pass)){
	$query = "SELECT distinct url FROM Images 
				join Users on Images.id=Users.id 
				WHERE '" . $user . "'=Users.id AND '" . $pass . "'=Users.passwd";
	$result = mysqli_query($conn, $query);
	if (mysqli_num_rows($result) >= 1) {
		
		while ($row = mysqli_fetch_array($result)) {
			$_SESSION['user_images'][] = $row;
		}
		$images = array();
		/*while($row = mysqli_fetch_assoc($result))
			$_SESSION['user_images'][] = $row;
		 */
		echo "success";
		//echo "{success: true, data:".json_encode($images)."}";
		#	header('location:../members.php');
	}
	else{
		echo "fail login";
	}
}
else{
	echo "There is empty input";
}
$conn->close();
?>
