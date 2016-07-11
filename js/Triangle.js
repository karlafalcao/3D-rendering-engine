/*
 * Triangle
 */

function Triangle(vertices, views, normals, originalVertices) {
	this.vertices = vertices;
	this.originalVertices = originalVertices;
	this.views = views;
	this.normals = normals;
	this.changed = false;
	this.bounds;
}


Triangle.prototype.getNormalViewPointInside = function(point, coords){
	/* Triangle vertices normals */
	var N1 = this.normals[0];
	var N2 = this.normals[1];
	var N3 = this.normals[2];

	/* Normal vector in point P */
	var a = coords[0] * N1[0] + coords[1] * N2[0] + coords[2] * N3[0];
	var b = coords[0] * N1[1] + coords[1] * N2[1] + coords[2] * N3[1];
	var c = coords[0] * N1[2] + coords[1] * N2[2] + coords[2] * N3[2];

	var N = vec3.create();
	N = vec3.normalize(N, vec3.fromValues(a, b, c));

	var V = vec3.fromValues(-point[0], -point[1], -point[2]);

	var dotNV = vec3.dot(N, V);
	/* Ensure that points toward the viewer */
	if (dotNV < 0) {
		N = vec3.fromValues(-N[0], -N[1], -N[2]);
	}

	return N;
};

Triangle.prototype.getViewPointInside = function(coords){

	var P1 = this.views[0];
	var P2 = this.views[1];
	var P3 = this.views[2];

	var x = coords[0] * P1[0] + coords[1] * P2[0] + coords[2] * P3[0];
	var y = coords[0] * P1[1] + coords[1] * P2[1] + coords[2] * P3[1];
	var z = coords[0] * P1[2] + coords[1] * P2[2] + coords[2] * P3[2];

	var point = vec3.fromValues(x, y, z);
	
	return point;
};

/*
 * Find Barycentric Coordinates
 */
Triangle.prototype.getBarycentricCoordinates = function(p) {
	var v1 = this.vertices[0];
	var v2 = this.vertices[1];
	var v3 = this.vertices[2];

	var xA = v1[0], yA = v1[1];
	var xB = v2[0], yB = v2[1];
	var xC = v3[0], yC = v3[1];

	var xP = p[0], yP = p[1];

	var coords = vec3.create();
	var areaABC = (xA - xC)*(yB - yC) - (yA - yC)*(xB - xC); //ABC
	var areaPBC = (yB - yC)*(xP - xC) - (xC - xB)*(yC - yP); //PBC
	var areaPAC = (yC - yA)*(xP - xC) - (xA - xC)*(yC - yP); //PAC
	var areaPAB = (yA - yB)*(xP - xB) - (xB - xA)*(yB - yP); //PAB

	coords[0] = areaPBC / areaABC;
	coords[1] = areaPAC / areaABC;
	coords[2] = areaPAB / areaABC;

	return coords;

};

/*
 * Calculates the initial bounds of the triangle Xmin, Xmax, Ymin, Ymax, and angular coeficients
 */
Triangle.prototype.getInitialBounds = function() {
	var v1 = this.vertices[0],
		v2 = this.vertices[1],
		v3 = this.vertices[2];

	var coefs = vec3.create();

	coefs[0] = ((Math.round(v2[1]) - Math.round(v1[1])) / (Math.round(v2[0]) - Math.round(v1[0])));
	coefs[1] = ((Math.round(v3[1]) - Math.round(v1[1])) / (Math.round(v3[0]) - Math.round(v1[0])));
	coefs[2] = ((Math.round(v3[1]) - Math.round(v2[1])) / (Math.round(v3[0]) - Math.round(v2[0])));

	// Calculate initial Ymin and Ymax values
	var maxY = Math.max(v1[1], v2[1], v3[1]);

	var Y = vec2.fromValues(v1[1], maxY);
	
	// Calculate initial Xmin and Xmax values
	var X = vec2.fromValues(v1[0], v1[0]);

	if (Math.abs(v1[1] - v2[1]) === 0) { // If v1 and v2 are in the same Y
		X[0] = Math.min(v1[0], v2[0]);
		X[1] = Math.max(v1[0], v2[0]);
		coefs[0] = coefs[2];
	} else if (Math.abs(v1[1] - v3[1]) === 0) { // If v1 and v3 are in the same Y
		this.changed = true;
		X[0] = Math.min(v1[0], v3[0]);
		X[1] = Math.max(v1[0], v3[0]);
		coefs[1] = coefs[2];
	}

	this.bounds = new Bounds(X, Y, coefs);

	return this.bounds;
};

/*
 * Update Xmin, Xmax values
 */

Triangle.prototype.updateBounds = function(y) {
	if (!this.changed && (y === Math.round(this.vertices[1][1]) || y === Math.round(this.vertices[2][1]))) {
		this.changed = true;
		// If the angular coenficient changes in the left
		if (Math.abs(y - this.vertices[1][1]) === 0) {
			this.bounds.coefs[0] = this.bounds.coefs[2];
		} else { // If the angular coenficient changes in the right
			this.bounds.coefs[1] = this.bounds.coefs[2];
		}
	}

	// Calculate next Xmin
	if (this.bounds.coefs[0] != Number.POSITIVE_INFINITY && 
		this.bounds.coefs[0] != Number.NEGATIVE_INFINITY && 
		this.bounds.coefs[0] != 0 && 
		this.bounds.coefs[0] != Number.NaN) {
		
		this.bounds.X[0] += 1 / this.bounds.coefs[0];
	}

	// Calculate next Xmax
	if (this.bounds.coefs[1] != Number.POSITIVE_INFINITY && 
		this.bounds.coefs[1] != Number.NEGATIVE_INFINITY && 
		this.bounds.coefs[1] != 0 && 
		this.bounds.coefs[1] != Number.NaN) {
		
		this.bounds.X[1] += 1 / this.bounds.coefs[1];

	}
};

Triangle.prototype.orientation = function(){
	var v1 = this.vertices[0],
		v2 = this.vertices[1],
		v3 = this.vertices[2];

	var xA = v1[0], yA = v1[1],
		xB = v2[0], yB = v2[1],
		xC = v3[0], yC = v3[1];

	return (xB-xA)*(yC-yA) - (yB-yA)*(xC-xA);
};

Triangle.prototype.isValid = function () {
	var v1 = this.vertices[0],
		v2 = this.vertices[1],
		v3 = this.vertices[2];

	return ((v1[0] == v2[0] && v1[1] == v2[1]) || (v1[0] == v3[0] && v1[1] == v3[1]) || (v2[0] == v3[0] && v2[1] == v3[1]));
};

Triangle.prototype.sortVertices = function() {
	this.vertices.sort(function(v1, v2){
		return v1[1]-v2[1];
	});

	var v1 = this.vertices[0];
	var v2, v3;

	var orient = this.orientation();

	if (orient < 0) { /*clockwise*/
		v2 = this.vertices[1];
		v3 = this.vertices[2];
	} else if (orient > 0) { /*counter clockwise*/
		v2 = this.vertices[2];
		v3 = this.vertices[1];
	} else if (this.vertices[1][0] < v1[0] && this.vertices[2][0] < v1[0]) {
		v2 = this.vertices[1];
		v3 = this.vertices[2];
	} else if (this.vertices[1][0] > v1[0] && this.vertices[2][0] > v1[0]) {
		v2 = this.vertices[2];
		v3 = this.vertices[1];
	} else if (this.vertices[1][0] < this.vertices[2][0]) {
		v2 = this.vertices[1];
		v3 = this.vertices[2];
	} else {
		v2 = this.vertices[2];
		v3 = this.vertices[1];
	}

	this.vertices[1] = v2;
	this.vertices[2] = v3;

	var view1 = this.views[v1.idx];
	var view2 = this.views[v2.idx];
	var view3 = this.views[v3.idx];

	this.views[0] = view1;
	this.views[1] = view2;
	this.views[2] = view3;

	var normal1 = this.normals[v1.idx];
	var normal2 = this.normals[v2.idx];
	var normal3 = this.normals[v3.idx];

	this.normals[0] = normal1;
	this.normals[1] = normal2;
	this.normals[2] = normal3;


	var oVertice1 = this.originalVertices[v1.idx];
	var oVertice2 = this.originalVertices[v2.idx];
	var oVertice3 = this.originalVertices[v3.idx];

	this.originalVertices[0] = oVertice1;
	this.originalVertices[1] = oVertice2;
	this.originalVertices[2] = oVertice3;
};

