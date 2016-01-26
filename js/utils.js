
var utils = new utilsObject();


function utilsObject(){
}

/**
 * Obtains a WebGL context for the canvas with id 'canvas-element-id'
 * This function is invoked when the WebGL app is starting.
 */
utilsObject.prototype.getGLContext = function(name){

	var canvas = document.getElementById(name);
	var ctx = null;

	if (canvas == null){
		alert('there is no canvas on this page');
		return null;
	}
	else {
		c_width = canvas.width;
		c_height = canvas.height;
	}

	var names = ["2d"];

	for (var i = 0; i < names.length; ++i) {
		try {
			ctx = canvas.getContext(names[i]);
		}
		catch(e) {}
		if (ctx) {
			break;
		}
	}
	if (ctx == null) {
		alert("Could not initialise WebGL");
		return null;
	}
	else {
		return ctx;
	}
}

/**
 * Utilitary function that allows to set up the shaders (program) using an embedded script (look at the beginning of this source code)
 */
utilsObject.prototype.getShader = function(gl, id) {
	var script = document.getElementById(id);
	if (!script) {
		return null;
	}

	var str = "";
	var k = script.firstChild;
	while (k) {
		if (k.nodeType == 3) {
			str += k.textContent;
		}
		k = k.nextSibling;
	}

	var shader;
	if (script.type == "x-shader/x-fragment") {
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	} else if (script.type == "x-shader/x-vertex") {
		shader = gl.createShader(gl.VERTEX_SHADER);
	} else {
		return null;
	}

	gl.shaderSource(shader, str);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert(gl.getShaderInfoLog(shader));
		return null;
	}
	return shader;
}

utilsObject.prototype.drawPoint = function (x, y, rgb, ctx) {

	canvasCtx.fillRect(x,y,1,1);
	canvasCtx.fillStyle = 'rgb('+rgb[0]+','+rgb[1]+','+rgb[2]+')';
};

utilsObject.prototype.requestAnimFrame = function(o){
	requestAnimFrame(o);
}
/**
 * Provides requestAnimationFrame in a cross browser way.
 */
requestAnimFrame = (function() {
	return window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
			window.setTimeout(callback, 1000/60);
		};
})();
