<?php
header("Access-Control-Allow-Origin: *");

//echo $_GET['callback']."(\"{success: false}\")";

if (isset($_POST["img"]))
{
	// Get the data
	$imageData=$_POST['img'];
	//    
	// Remove the headers (data:,) part.
	// A real application should use them according to needs such as to check image type
	$filteredData=substr($imageData, strpos($imageData, ",")+1);

	// Need to decode before saving since the data we received is already base64 encoded
	$unencodedData=base64_decode($filteredData);

	// Save file. This example uses a hard coded filename for testing,
	// but a real application can specify filename in POST variable
	$filename="../img/drawing_.jpg";
	file_put_contents($filename, $unencodedData);
	chmod($filename, 0777);
	echo "{success: true, data: unencodedData".$unencodedData."}";
} else {
	echo "{success: false}";
}
?>
