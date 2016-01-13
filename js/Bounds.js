
function Bounds(x, y, w, h) {
	this.x = x;
	this.y = y;
	this.width = w;
	this.height = h;


	this.getX = function() {
		return x;
	}

	this.getY = function() {
		return y;
	}

	this.getWidth = function() {
		return width;
	}

	this.getHeight = function() {
		return height;
	}
}
