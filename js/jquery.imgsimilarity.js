(function($){  
	/*
	   Constructor: imgSimilarity

	   Examines the image's RGB values and builds up a histogram.

	   Parameters:

	   r - boolean, whether to consider red color channel information
	   (default: true).

	   g - boolean, whether to consider green color channel information
	   (default: true).

	   b - boolean, whether to consider blue color channel information
	   (default: true).

	   height - height of rectangle starting at top left corner to process
	   (default: null to autodetect).

	   width - width of rectangle starting at top left corner to process
	   (default: null to autodetect ).

	   buckets - number of histogram buckets to use (default: 4).

	   normalize - whether to normalize the histogram counts (default:
	   true).

	   Returns:

	   Nothing. The computed histogram information will be stored in the
	   image, using jQuery's data key/value storage system. This
	   constructor stores entries into the imgSimilarity key. E.g.,
	   $("#someimg").imgSimilarity() builds the information, then
	   $("#someimg").data("imgSimilarity") contains the results.

	   Use $("#someimg").data("imgSimilarity").findClosest($(...images
	   that had imgSimilarity called on them...)) to compute an array
	   whose values indicate how similar the passed in images are to the
	   $("#someimg"). See the demo for an example usage.

	 */

	$.fn.imgSimilarity = function(options) {  

		var defaults = {
			r: true,
			g: true,
			b: true,
			height: null,
			width: null,
			buckets: 4,
			normalize: true,
		}

		//Provide default settings.
		var options = $.extend(defaults, options);

		function histogram(buckets, dimensionality)
		{
			if (dimensionality == 0)
			{
				return 0;
			}

			var array = new Array(buckets);

			for (var i = 0; i < buckets; i++)
			{
				array[i] = histogram(buckets, dimensionality-1);
			}
			
			return array;
		}

		/*
		   Function: accumulate

		   Increments the correct part of the histogram corresponding to
		   the given RGB value. For internal use only.

		   Parameters:

		   dataTarget: a 3D array built by the histogram function.

		   r: a red value, between 0 and 255 (inclusive).

		   g: a green value, between 0 and 255 (inclusive).

		   b: a blue value, between 0 and 255 (inclusive).

		   buckets: how many buckets are in the histogram.

		   Returns:

		   nothing
		 */


		function accumulate(dataTarget, r, g, b, buckets)
		{
			var destCalc = function(value) { return Math.round(value/255.0*(buckets-1)); };

			dataTarget[destCalc(r)][destCalc(g)][destCalc(b)]++;
		}

		/*
		   Function: imgRealSize

		   Returns an object whose width attribute specifies the image's
		   natural width and whose height attribute specifies the image's
		   natural height. The natural width and height of an image are
		   the width and height that come from the image file (before CSS
		   resizing is done). For internal use only.

		   This function was found at and appears to be freely released (as in speech):
		   <http://css-tricks.com/snippets/jquery/get-an-images-native-width/#comment-117242>

		   Parameters:

		   img: The image to find the natural width and height of.

		   Returns:

		   An object, o: o.width is the image's natural width. o.height is
		   the image's natural height.

		 */

		function imgRealSize(img) {
			var $img = $(img);
			if ($img.prop('naturalWidth') === "undefined") {
				var $tmpImg = $('<img/>').attr('src', $img.attr('src'));
				$img.prop('naturalWidth', $tmpImg[0].width);
				$img.prop('naturalHeight', $tmpImg[0].height);
			}
			return { 'width': $img.prop('naturalWidth'), 'height': $img.prop('naturalHeight') }
		}

		/*

		   Function: makeFindClosest

		   Creates and returns a function that can be called later to
		   compute the similarity of this image (specified by
		   histogramData parameter) with other images. For internal use
		   only.

		   Parameters:

		   histogramData: the histogram data

		   buckets: the number of buckets in the histogram data

		   Returns:

		   A function that should be passed an array of images, images,
		   who have also had $(...).imgSimilarity(...) called on them. An
		   array will be returned where returnValue[i] is the difference
		   of the original image to images[i]. A lower difference
		   indicates similarity.
		 */

		function makeFindClosest(histogramData, buckets)
		{
			return function(matches)
			{
				return $.map(matches, function(value, index) {
					value = $(value).data("imgSimilarity");

					var otherData = value.data;

					var error = 0.0;

					for (var r = 0; r < buckets; r++)
					{
						for (var g = 0; g < buckets; g++)
						{
							for (var b = 0; b < buckets; b++)
							{
								error += Math.abs(histogramData[r][g][b] - otherData[r][g][b]);
							}
						}
					}

					return error;
				});
			}
		}

		/*
		   Function: normalize

		   Normalize the 3D array by dividing each element by divisor.
		 */

		function normalize(array, divisor)
		{
			for (var r = 0; r < array.length; r++)
			{
				for (var g = 0; g < array[r].length; g++)
				{
					for (var b = 0; b < array[r][g].length; b++)
					{
						array[r][g][b] = array[r][g][b]/divisor;
					}
				}
			}
		}

		//For each object that had imgSimilarity called on it (e.g.,
		//$("img.imagestocompare").imgSimilarity() will compute similarity
		//information on, potentially, many images.
		return this.each(function() {  
			var canvas = $("<canvas/>");
			var height = options["height"] || imgRealSize($(this))["height"];
			var width = options["width"] || imgRealSize($(this))["width"];

			var context = $(canvas)[0].getContext("2d");

			canvas.prop("height", height);
			canvas.prop("width", width);
			//context.drawImage(this, 0, 0);
			
			var image=new Image;
			console.log(this.src);
    		image.onload=function(){
				context.drawImage(this, 0, 0);
    		}
    		image.crossOrigin="anonymous";
    		image.src=this.src;

			var id = context.getImageData(0, 0, width, height);
			var length = id.data.length;
			var pixels = id.data;

			var data = histogram(options["buckets"], 3);

			var r;
			var g;
			var b;

			for (var i = 0; i < length; i += 4)
			{
				r = pixels[i];
				g = pixels[i+1];
				b = pixels[i+2];

				var total = r + g + b;

				if (!options["r"]) { r = 0; }
				if (!options["g"]) { g = 0; }
				if (!options["b"]) { b = 0; }

				accumulate(data, r, g, b, options["buckets"]);
			}

			if (options["normalize"])
			{
				normalize(data, width*height);
			}

			var findClosest = makeFindClosest(data, options["buckets"]);

			var data = {data: data, findClosest: findClosest};

			$(this).data("imgSimilarity", data);
		});  
	};  
})(jQuery); 



