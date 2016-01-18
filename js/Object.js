"use strict";
/*
 * Object class
 *
 * /---------------------------------------\
 * | 1                                     | ; ka - reflexao ambiental
 * | 1                                     | ; kd - constante difusa
 * | 0.5                                   | ; ks - parte especular
 * | 1 1 1                                 | ; Od - vetor difuso
 * | 2                                     | ; h  - constante de rugosidade
 * | 3 1                                   | ; 3 pontos e 1 triangulo
 * | 50.0000 0.0000 0.000                  | ; ponto 1: P1(50, 0, 0)
 * | 0 50 0                                | ; ponto 2: P2(0, 50, 0)
 * | 0 0 50                                | ; ponto 3: P3(0, 0, 50)
 * | 1 2 3                                 | ; triangulo 1: formado pelos vertices 1, 2 e 3
 * \---------------------------------------/
*/

function Object(attrs) {
	this.verticesQty = attrs.qty[0] || 0;
	this.trianglesQty = attrs.qty[1] || 0;
	this.vertices = attrs.vertices || new Array(); //tam = verticesQty
	this.triangles = attrs.triangles || new Array(); //tam = trianglesQty
	this.views = new Array();
	this.trianglesNormals = new Array(); //tam = trianglesQty
	this.verticesNormals = new Array(); //tam = verticesQty
	//this.triangles = this.getTriangleVertices();
	//var ambient = 1;//Float
	//var diffuse = 1;
	//var specular = 0;
	//var diffuseVector = vec3.fromValues(1,1,1);
	var h = 0;
}

Object.prototype.calculateVertices = function(camera) {

	for (var i = 0; i < this.verticesQty; i++) {
		vec3.sub(this.vertices[i], this.vertices[i], camera.position);

		var x_visao = vec3.dot(this.vertices[i], camera.rightVector);
		var y_visao = vec3.dot(this.vertices[i], camera.frontVector);
		var z_visao = vec3.dot(this.vertices[i], camera.upVector);

		/*Set ith-view */
		this.views[i] = vec3.fromValues(x_visao, y_visao, z_visao);
		this.views[i].idx = i;

		/*Project the vertice*/
		/*Set ith-vertice */
		this.vertices[i][0] = (camera.distance / camera.width) * (x_visao / z_visao);
		this.vertices[i][1] = (camera.distance / camera.height) * (y_visao / z_visao);
		this.vertices[i][2] = 0;
		this.vertices.idx = i;

		this.verticesNormals[i] = vec3.create();
	}

};

/*
 * Updates/calculates the normal
 */
Object .prototype.calculateNormals = function() {

	for (var i=0; i<this.trianglesQty; i++) {
		var idx1 = this.triangles[i][0] - 1;
		var idx2 = this.triangles[i][1] - 1;
		var idx3 = this.triangles[i][2] - 1;

		var v1 = this.views[idx1];
		var v2 = this.views[idx2];
		var v3 = this.views[idx3];

		var v1v2 = vec3.create();
		vec3.sub(v1v2, v2, v1);
		var v1v3 = vec3.create();
		vec3.sub(v1v3, v3, v1);

		/* cross product of v1v2 and v1v3 */
		this.trianglesNormals[i] = vec3.create();
		vec3.cross(this.trianglesNormals[i], v1v2, v1v3);

		/* normalization */
		vec3.normalize(this.trianglesNormals[i], this.trianglesNormals[i]);

		vec3.add(this.verticesNormals[idx1], this.verticesNormals[idx1], this.trianglesNormals[i])
		vec3.add(this.verticesNormals[idx2], this.verticesNormals[idx2], this.trianglesNormals[i])
		vec3.add(this.verticesNormals[idx3], this.verticesNormals[idx3], this.trianglesNormals[i])
	}
};


/*
 * Encontrar coordenadas baricentricas
 */


Object .prototype.getTriangleBarycentricCoordinates = function(v1, v2, v3, p) {
	var v1 = vertices[0];
	var v2 = vertices[1];
	var v3 = vertices[2];

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

};


Object .prototype.getNormalViewPointInside = function(P){
	/* Calcula o pixel em coordenadas de visão */
	var coords = this.getTriangleBarycentricCoordinates(point);

	/* Triangle vertices normals */
	var N1 = normals[0];
	var N2 = normals[1];
	var N3 = normals[2];

	/* Normal vector in point P */
	var a = coords[0]*N1[0] + coords[1]*N2[0] + coords[2]*N3[0];
	var b = coords[0]*N1[1] + coords[1]*N2[1] + coords[2]*N3[1];
	var c = coords[0]*N1[2] + coords[1]*N2[2] + coords[2]*N3[2];

	var N = vec3.normalize(vec3.create(), vec3.fromValues(a, b, c));

	var V = vec3.fromValues(-P[0], -P[1], -P[2]);

	var dotNV = vec3.dot(N, V);
	/* Ensure that points toward the viewer */
	if (dotNV < 0) {
		N = vec3.fromValues(-N[0], -N[1], -N[2]);
	}

	return N;
};

Object.prototype.getViewPointInside = function(point){

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

