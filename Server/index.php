<?php
header("Access-Control-Allow-Origin: *");
?>
<?php
session_start();

$images = array();
if (isset($_SESSION['user_images'])) {
	$images[] = 'http://cspro.sogang.ac.kr/~cse20131570/img/drawing_.jpg';
	foreach ($_SESSION['user_images'] as $key) {
		$images[] = $key['url'];
	}
} else {
}
?>
<!doctype html>  
<html lang="en">  
	<head>  
		<meta charset="utf-8">  
		<title>DrawingImageFinder</title>  
		<!--[if lt IE 9]>  
		<script src="http://html5shiv.googlecode.com/svn/trunk/html5.js"></script>  
		<![endif]-->  

		<link href="http://ajax.googleapis.com/ajax/libs/jqueryui/1.9.1/themes/smoothness/jquery-ui.css" type="text/css" rel="stylesheet" />
		<style type="text/css">
			div#controls { 
				/*border: 1px solid black;*/
				margin-bottom: 10px;
				margin-top: 10px;
				padding: 10px;
			}

			div#results div.matches img { 
				width: 100px;
				height: 100px;
				border: 1px solid black; 

			}

			div#threshold {
				margin-left: 20px;
				width: 200px;
				margin-bottom: 20px;
			}
			div#catalog img {
				width: 400px;
				height: 400px;
				display: none;
			}

			.clear { clear: both; }

			#logindiv, #logoutdiv {
				text-align:center;
			}
			#logindiv_form{
				background-color: #d2ecf5;
				z-index: 2;
				width: 200px;
				height: 150px;
				border: 2px solid black;
				text-align: center;
				margin: 0 auto;
			}
			#logoutdiv_form{
				text-align: center;
				margin: 0 auto;
			}
		</style>
	</head>  
	<body>  
		<?php if (!isset($_SESSION['user_images'])) { ?>
		<div id='logindiv'>
			<form id='logindiv_form'>
				Username: <input type='text' id='username' name='username'><br>
				Password: <input type='password' id='password' name='password'><br>
				<input type='submit' name='submit' value='login'>
			</form>
		</div>
		<?php }  else {?>
		<div id='logoutdiv'>	
			<form id='logoutdiv_form'>
				<input type='submit' name='logout' value='logout'>
			</form>
		</div>
		<?php } ?>
		<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js"></script>
		<script src="http://ajax.googleapis.com/ajax/libs/jqueryui/1.9.1/jquery-ui.min.js"></script>
		<script src="./js/jquery.imgsimilarity.js"></script>

		<div id="controls">
			<!--
			<div>


				<p>Similarity Threshold: 
				<span id="thresholdvalue">??</span>/<span id="divisor">??</span>.
				</p>

				<div id="threshold"></div>
				

			</div>
			-->

			<div>
				<div id="results"></div>
			</div>
		</div>

		<div>
			<!--<p>The following images are the base images.</p>-->
			<div id="catalog"></div>
		</div>

		<script>
			var baseDirectory = "";
			var catalogImages = JSON.parse('<?php echo json_encode($images) ?>');
			//var catalogImages = ["korea_my.png", "02.jpg", "03.jpg", "korea.png",
			//"01.jpg", "japan.png"/*, "japan_my.png"*/, "redball.png", "te.png", "ne.png", "usa.png"];

			$(document).ready(function()
			{
				/*$("#divisor").text(100);
				$("#recompute").button().click(function()
				{
					recomputeMatches();
				});*/

				/*var slider = $("#threshold").slider({
					max: 500,
					slide: function(event, ui){
						$("#thresholdvalue").text(ui.value);
						recomputeMatches();
					}
				});*/

				//$("#thresholdvalue").text($("#threshold").slider("value"));

				//$("#thresholdvalue").text(200);

				var catalog = $("#catalog");
				var results = $("#results");

				$.each(catalogImages, function(index, value) {
				//Build up images and have them automatically calculate their
				//similarity information.
					//console.log(value);
					

					var image = comparableImage(baseDirectory + value
						//"http://cspro.sogang.ac.kr/~cse20131570/table.png"
						, value);

					//if(index>0){
						catalog.append(image);
					//}
						//jQuery UI Accordion to show results
						//results.append($("<h3/>").text(value + "'s similar images"));
					if(index==0){
						matches = $("<div/>").addClass("matches").attr("id", "match"+index);

						results.append(matches);
					}
				});
				/*var image = comparableImage(//baseDirectory + value
					"http://cspro.sogang.ac.kr/~cse20131570/table.png"
					, "none");
					catalog.append(image);
				results.append($("<h3/>").text("'s similar images"));
				matches = $("<div/>").addClass("matches").attr("id", "match");

				results.append(matches);
*/

				//results.accordion({ autoHeight: false, clearStyle: true});

			});

			function comparableImage(url, title)
			{
				//Given a URL return a created img element. The image will
				//automatically calculate its similarity histogram once its data is
				//loaded. Then, matches will be recomputed because there is a new
				//loaded image.
				var element = $("<img/>");
				element.attr("alt", title);
				element.attr("title", title);

				//console.log(this);

				element.load(function() {
					//When the image loads, automatically calculate image
					//comparison information.
					$(this).imgSimilarity();
					recomputeMatches();
				});

				element.attr("src", url);

				return element;
			}

			function recomputeMatches()
			{
				//var threshold = parseInt($("#thresholdvalue").text())/parseInt($("#divisor").text());
				var threshold = 5;

				var allData = $("#catalog img").map(function(index, element) {
					return $(element);
				});

				allData = $.grep(allData, function(element)
				{
					//Has loaded histogram information.
					return typeof (element.data('imgSimilarity')) !== "undefined";
				});


				//console.log(allData);

				//algorithm could be slightly improved by not reexamining pairs.
				for (var i = 0; i < 1; i++)
				{
					var matches = new Array();

					var matchData = allData[i].data('imgSimilarity').findClosest(allData);
					//Find appropriate div to list our matches.
					var container = $("#match" + i);
					//Remove existing results, we're building up new results next.
					container.empty();

					for (var j = 0; j < matchData.length; j++)
					{
						//Close enough!
						if (matchData[j] <= threshold) 
						{
							var matchImg = $("<img/>");
							matchImg.attr('src', allData[j].attr('src'));
							//if(matchImg[0].currentSrc != "http://cspro.sogang.ac.kr/~cse20131570/img/drawing_.png"){
								console.log(matchImg[0].currentSrc);
								matches.push({  amount: matchData[j], 
									img: matchImg, 
									data: allData[j].data('imgSimilarity')
								});
							//}
						}

						//Sort by closest matches first.
						matches.sort(function(a,b) { return a.amount - b.amount; });

						$.each(matches, function(index, element) {
							//Show each match.
							container.append(element.img);
							var similarityInfo = "Similarity: " + element.amount.toFixed(4);

							element.img.attr("title", similarityInfo);
						});
					}
				}
			}

		</script>  
		<script>
			$(document).ready(readyCb);
			function readyCb() {
				$('#logindiv_form').on('submit', login);
				$('#logoutdiv_form').on('submit', logout);
			}
			function login() {
				var username = $('input#username').val().trim();
				var password = $('input#password').val().trim();
				$.ajax({
					url: 'http://cspro.sogang.ac.kr/~cse20131570/cgi-bin/login.php',
					type: 'POST',
					data: {
						user_id: username,
						user_passwd: password	
					}
				}).done(function(res) {
					//alert(res);
					if (res == 'success') {
						$('#logindiv').css('display', 'none');
						location.reload();
					} else {
						alert(res);
					}
				});
				return false;
			}
			function logout() {
				$.ajax({
					url: 'http://cspro.sogang.ac.kr/~cse20131570/cgi-bin/logout.php',
					type: 'POST',
				}).done(function(res) {
					//console.log("asf");
					//alert("logout?");
					location.reload();
				});
				return false;
			}
		</script>
				

	</body>  
</html>  



