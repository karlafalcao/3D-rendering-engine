/*
 * Triangle
 */

function Triangle(vertices) {
	var vertices = vec3.create();
	var normals = vec3.create();
	var views = vec3.create();
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
	var minX = Math.min(Math.min(vertices[0][0], vertices[1][0]),vertices[2][0]);
	var minY = Math.min(Math.min(vertices[0][1], vertices[1][1]),vertices[2][1]);
	var maxX = Math.max(Math.max(vertices[0][0], vertices[1][0]),vertices[2][0]);
	var maxY = Math.max(Math.max(vertices[0][1], vertices[1][1]),vertices[2][1]);
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
	vec3.cross(normal, v1, v2);
	normal = vec3.norm(normal);

	// update facing boolean
	if (normal[2] > 0)
		facing = false;
	else
		facing = true;
};

Triangle.prototype.calculateArea = function() {
	var A = vertices[0];
	var B = vertices[1];
	var C = vertices[2];

	return Math.abs(A[0]*C[1] - A[1]*C[0] + A[1]*B[0] - A[0]*B[1] +
	C[0]*B[1] - C[1]*B[0] / 2);
};

/*
 * Encontrar coordenadas baricentricas
 */


Triangle.prototype.barycentricCoordinates = function(P) {
	var A = vertices[0];
	var B = vertices[1];
	var C = vertices[2];

//
//double[] PP1 = Algeb.sub(P, P1);
//double[] P2P1 = Algeb.sub(P2, P1);
//double[] P2P3 = Algeb.sub(P2, P3);
//double[] PP3 = Algeb.sub(P, P3);
//double[] P3P1 = Algeb.sub(P3, P1);
//double[] vPP1 = new double[] { PP1[0], PP1[1], 0 };
//double[] vP2P1 = new double[] { P2P1[0], P2P1[1], 0 };
//double[] vP2P3 = new double[] { P2P3[0], P2P3[1], 0 };
//double[] vPP3 = new double[] { PP3[0], PP3[1], 0 };
//double[] vP3P1 = new double[] { P3P1[0], P3P1[1], 0 };
//
//double A1 = Algeb.getNorma(Algeb.prodVetorial(vPP1, vP2P1));
//double A2 = Algeb.getNorma(Algeb.prodVetorial(vPP3, vP2P3));
//double A3 = Algeb.getNorma(Algeb.prodVetorial(vPP1, vP3P1));
//double total = A1 + A2 + A3;
//return new double[] { (A2 / total), (A3 / total), (A1 / total) };

	/* Using triangle area*/
//função pontoEmTriângulo(Ponto P,
//Ponto P1, Ponto P2, Ponto P3): booleano
//início
//real lambda1, lambda2, lambda3, S;
//S = áreaOrientadaTriângulo(P1, P2, P3);
//lambda1 = áreaOrientadaTriângulo(P, P2, P3) / S;
//lambda2 = áreaOrientadaTriângulo(P1, P, P3) / S;
//lambda3 = áreaOrientadaTriângulo(P1, P2, P) / S;
//retorne ((lambda1 > 0) e (lambda2 > 0) e (lambda3 > 0))
//fim.
};


Triangle.prototype.getViewPointInside = function(point){

	/* Calcula o pixel em coordenadas de visão */
	var coords = this.barycentricCoordinates(point);

	var P1 = views[0];
	var P2 = views[1];
	var P3 = views[1];

	var x = coords[0]*P1[0] + coords[1]*P2[0] + coords[2]*P3[0];
	var y = coords[0]*P1[1] + coords[1]*P2[1] + coords[2]*P3[1];
	var z = coords[0]*P1[2] + coords[1]*P2[2] + coords[2]*P3[2];

	var P = vec3.fromValues(x, y, z);
	return P;
};

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
