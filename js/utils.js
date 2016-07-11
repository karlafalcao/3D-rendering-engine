var utils = new utilsObject();

function utilsObject() {}

/**
 * Obtains a WebGL context for the canvas with id 'canvas-element-id'
 * This function is invoked when the WebGL app is starting.
 */
utilsObject.prototype.getGLContext = function(name, windowEl){
	
	if (windowEl) {
		var canvas = windowEl.document.getElementById(name);
	} else {
		var canvas = window.document.getElementById(name);
	}
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

utilsObject.prototype.drawPoint = function (x, y, rgb, ctx) {

	ctx.fillRect(x,y,1,1);
	ctx.fillStyle = 'rgb('+rgb[0]+','+rgb[1]+','+rgb[2]+')';
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
