/*
 * Triangle
 */

function Triangle(vertices) {
	this.vertices = new Array();
	this.facing = true;
	this.bounds;
	this.index;
}


Triangle.prototype.getMinY = function(){
	return Math.round(this.bounds.getY());
};

/*
 * Calculates the bounds of the polygon
 */
Triangle.prototype.bounds = function() {
	var minX = Math.min(Math.min(vertices[0][0], vertices[1][0]),vertices[2][0]);
	var minY = Math.min(Math.min(vertices[0][1], vertices[1][1]),vertices[2][1]);
	var maxX = Math.max(Math.max(vertices[0][0], vertices[1][0]),vertices[2][0]);
	var maxY = Math.max(Math.max(vertices[0][1], vertices[1][1]),vertices[2][1]);

	this.bounds = new Bounds(minX, minY, (maxX - minX), (maxY - minY));
	return bounds;
};


/*
 * Calculates the shading of the polygon
 * ￼I = Ia*Ka
 * ￼I = Il*(Kd cos(N,L))
 * ￼I = Is*Ks(R.V)^h
 *  R = 2N (N.L) - L
 */
Triangle.prototype.shading = function(normal, lightSource, ambientLight) {
	var reflect = ambientLight;
	if (normal.cosTheta(lightSource) > 0)
		reflect = ambientLight + normal.cosTheta(lightSource);

	var r = checkColourRange((reflectivity.getRed() * reflect));
	var g = checkColourRange((reflectivity.getGreen() * reflect));
	var b = checkColourRange((reflectivity.getBlue() * reflect));

	colour = new Color(r, g, b);
};

/*
 * Used to ensure the range of values for rgb are between 0 and 255
 */
Triangle.prototype.checkColourRange = function(x) {

	//console.log("Colour range being checked: " + x);

	if (x <= 0)
		x = 0;

	if (x >= 255)
		x = 255;

	return x;
};

Triangle.prototype.facing = function() {
	return facing;
};

Triangle.prototype.getColour = function() {
	return colour;
};


Triangle.prototype.toString = function() {
	var s = new String("Poly: ");

	for (var i = 0; i < 3; i++) {
		s = s.concat(vertices[i].toString()).concat("\t");
	}

	s = s.concat(reflectivity).concat("\t");
	s = s.concat(normal.toString()).concat("\t");
	s = s.concat(facing);

	return s.toString();
};


Triangle.prototype.getEdgeList = function(v1, v2, v3) {
	var bounds = this.getBounds();
	var e = [];
	var vertices = new Array(v1, v1, v3);
	//EdgeList[] e = new EdgeList[Number(bounds.getHeight() + 1)];

	for(var i = 0; i<3; i++){
		//console.log("Edgelist vertices " +i + " "+ (i+1)%3);
		var va = vertices[i];
		var vb = vertices[(i+1)%3];

		//console.log("va[1] " + va[1] + " vb[1] " + vb[1]);

		if(va[1] > vb[1]){
			vb = va;
			va = vertices[(i+1)%3];
		}


		//console.log("va[1] " + va[1] + " vb[1] " + vb[1]);

		var mx = (vb[0] - va[0])/(vb[1] - va[1]);
		var mz = (vb[2] - va[2])/(vb[2] - va[2]);
		var x = va[0];
		var z = va[2];

		var j = Math.round(va[1])- Math.round(bounds.getY());
		var maxj = Math.round(vb[1]) - Math.round(bounds.getY());

		while(j < maxj){
			if(e[j] == null){
				e[j] = new EdgeList(x, z);
			} else{
				e[j].add(x, z);

			}
			j++;
			x += mx;
			z += mz;
		}

	}
	return e;
};
