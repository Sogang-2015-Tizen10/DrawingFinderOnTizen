/*
 * Copyright (c) 2012 Samsung Electronics Co., Ltd. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*jslint devel: true*/
/*global window, document, tizen*/


(function start() { // strict mode wrapper
    'use strict';

    var canvas = null,
        context = null,
        content = null,
        drawPath = {},
        strokeColor = '',        // line color
        strokeWidth = 5;    // line width

    /**
     * (S) touch events feature
     */
    function touchStartHandler(e) {
        var touch = e.changedTouches[0];

        drawPath[touch.identifier] = touch;

        context.fillStyle = strokeColor;
        context.beginPath();
        context.arc(
            drawPath[touch.identifier].pageX - content.offsetLeft,
            drawPath[touch.identifier].pageY - content.offsetTop,
            strokeWidth / 2,
            0,
            Math.PI * 2,
            true
        );
        context.closePath();
        context.fill();
    }

    function touchMoveHandler(e) {
        var touches = e.changedTouches,
            touchesLength = touches.length,
            currentDrawPath = null,
            i = 0;

        context.lineWidth = strokeWidth;
        context.strokeStyle = strokeColor;
        context.lineJoin = 'round';

        for (i = 0; i < touchesLength; i += 1) {
            currentDrawPath = drawPath[touches[i].identifier];
            if (currentDrawPath !== undefined) {
                context.beginPath();
                context.moveTo(
                    currentDrawPath.pageX - content.offsetLeft,
                    currentDrawPath.pageY - content.offsetTop
                );
                context.lineTo(
                    touches[i].pageX - content.offsetLeft,
                    touches[i].pageY - content.offsetTop
                );
                context.closePath();
                context.stroke();

                drawPath[touches[i].identifier] = touches[i];
            }
        }
        e.preventDefault();
    }

    function touchEndHandler(e) {
        var touch = e.changedTouches[0];

        delete drawPath[touch.identifier];
        
        var canvasData = canvas.toDataURL("image/jpeg");
       /* 
        //var canvasData = testCanvas.toDataURL("image/png");
        var ajax = new XMLHttpRequest();
        ajax.open("POST",'http://cspro.sogang.ac.kr/~cse20131570/cgi-bin/test.php',false);
        
        ajax.setRequestHeader('Content-Type', 'application/upload');
        //alert(canvasData);
        ajax.send(canvasData);
        */
        //document.write(canvasData);
        //alert(canvasData);
        //console.info(canvasData);
        $.ajax({
        	url: 'http://cspro.sogang.ac.kr/~cse20131570/cgi-bin/drawing_upload.php',
        	type: 'POST',
        	//dataType: 'jsonp',
        	data: {
        		img : canvasData
        	}
        }).done(function(res) {
        	//console.log(res);
        	//alert(res);
        	/*$.ajax({
        		url: "http://cspro.sogang.ac.kr/~cse20131570/cgi-bin/histogram.php",
        		method: "GET",
        		
        	}).done(function(res){
        		alert(res);
        	});*/
        	//alert(catalogImages);
        	$('body').find('#ifr1p').html('').append('<iframe name = "ifr1" id = "ifr1" src="http://cspro.sogang.ac.kr/~cse20131570/index.php">');
        	
        });
       
 
        
    }

    /*************************************************/

    /**
    * Line Color Selector
    */
    function changeStrokeColor(e) {
        strokeColor = e.target.value;
    }

    /**
    * Line Width Selector
    */
    function changeStrokeWidth(e) {
        strokeWidth = e.target.value;
    }

    /**
    * Canvas Cleaner
    */
    function clearCanvas() {
        context.clearRect(0, 0, canvas.width, canvas.height);
    }
    /*
    function convertToImg() {
    	context.clearRect(0, 0, canvas.width, canvas.height);
    	canvas.toDataURL("image/png");
    	document.write('<img src="'+img+'"/>');
    }
    
    function downloadCanvas(link, canvasId, filename) {
    	//context.clearRect(0, 0, canvas.width, canvas.height);
        link.href = canvasId.getElementById(canvasId).toDataURL('image/png');
        link.download = filename;
    }*/

    function init() {
        var strokeColorSel = document.querySelector('.color-input'),
            strokeWidthSel = document.querySelector('.range-input'),
            clearBtn = document.querySelector('.clear-input');
        	//img = document.querySelector('.convert-img');
            //img = document.getElementById('convert-img');

        content = document.querySelector('.content');
        canvas = document.querySelector('.canvas');
        context = canvas.getContext('2d');
        //context.fillStyle="#cc0000";
       // context.fillRect(0,0,1000,1000);

        // Canvas size setting
        canvas.width = content.clientWidth;
        canvas.height = content.clientHeight;

        // Touch events handler
        canvas.addEventListener('touchstart', touchStartHandler, false);
        canvas.addEventListener('touchend', touchEndHandler, false);
        canvas.addEventListener('touchmove', touchMoveHandler, false);

        // Apply eventHandler
        strokeColorSel.addEventListener('change', changeStrokeColor, false);
        strokeWidthSel.addEventListener('change', changeStrokeWidth, false);
        clearBtn.addEventListener('click', clearCanvas, false);
        //img.addEventListener('click', function() {downloadCanvas(this, 'canvas_id', 'draw.png')}, false);
        //img.addEventListener('click', clearCanvas, false);
        
        // Add eventListener for tizenhwkey
        window.addEventListener('tizenhwkey', function onTizenHwKey(e) {
            if (e.keyName === 'back') {
                try {
                    tizen.application.getCurrentApplication().exit();
                } catch (err) {
                    console.error('Error: ', err);
                }
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function onDocumentReady() {
        init();
    });
}());




