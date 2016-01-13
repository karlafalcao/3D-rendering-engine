/*
 * Triangle
 */

function Triangle(vertices, camera) {
	var vertices = new Array();
	var camera = new Array();
	var normal = vec3.create();
	var facing = true;
	var bounds = new Bounds();
	var reflectivity = new Color();
	var colour = new Color();
	var P = vec3.create();
	var V = vec3.create(); //norm(C-P)
	var L = vec3.create(); //norm(lightSource-P)

	this.calculateNormal();
}

Triangle.prototype.calculateV = function() {
	vec3.sub(V, camera);
};

Triangle.prototype.getMinY = function(){
	return Math.round(bounds.getY());
};

/*
 * Calculates the bounds of the polygon
 */
Triangle.prototype.bounds = function() {
	var minX = Math.min(Math.min(vertices[0].x, vertices[1].x),vertices[2].x);
	var minY = Math.min(Math.min(vertices[0].y, vertices[1].y),vertices[2].y);
	var maxX = Math.max(Math.max(vertices[0].x, vertices[1].x),vertices[2].x);
	var maxY = Math.max(Math.max(vertices[0].y, vertices[1].y),vertices[2].y);
	bounds = new Bounds(minX, minY, (maxX - minX), (maxY - minY));
	return bounds;
};


/*
 * Updates/calculates the normal
 */
Triangle.prototype.calculateNormal = function() {

	/* Encontra vetor v1 */
	var v1 = vertices[1].minus(vertices[0]);
	/* Encontra vetor v2 */
	var v2 = vertices[2].minus(vertices[1]);

	/* normalizacao de n */
	/* Calculo do produto vetorial de v1 e v2 */
	normal = (v1.crossProduct(v2)).norm();

	// update facing boolean
	if (normal.z > 0)
		facing = false;
	else
		facing = true;
}


/*
 * Calculates the shading of the polygon
 * ￼I = Ia*Ka
 * ￼I = Il*(Kd cos(N,L))
 * ￼I = Is*Ks(R.V)^h
 *  R = 2N (N.L) - L
 */
Triangle.prototype.shading = function(lightSource, ambientLight) {
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


Triangle.prototype.edgeList = function() {
	bounds();
	var e = [];
	//EdgeList[] e = new EdgeList[Number(bounds.getHeight() + 1)];

	for(var i = 0; i<3; i++){
		//console.log("Edgelist vertices " +i + " "+ (i+1)%3);
		var va = vertices[i];
		var vb = vertices[(i+1)%3];

		//console.log("va.y " + va.y + " vb.y " + vb.y);

		if(va.y > vb.y){
			vb = va;
			va = vertices[(i+1)%3];
		}


		//console.log("va.y " + va.y + " vb.y " + vb.y);

		var mx = (vb.x - va.x)/(vb.y - va.y);
		var mz = (vb.z - va.z)/(vb.z - va.z);
		var x = va.x;
		var z = va.z;

		var j = Math.round(va.y)- Math.round(bounds.getY());
		var maxj = Math.round(vb.y) - Math.round(bounds.getY());

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
