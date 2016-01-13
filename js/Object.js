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
	this.vertices = attrs.vertices || new Float32Array();
	this.triangles = attrs.triangles ||new Float32Array();
	//var ambient = 1;//Float
	//var diffuse = 1;
	//var specular = 0;
	//var diffuseVector = vec3.fromValues(1,1,1);
	var h = 0;
}

this.getTriangleVertices = function(index) {
	if (index < 0 || index >= this.verticesQty) {

	}	return [];

	var triangleIndexes = this.triangles.slice(index*3, (index*3)+2);
	var triangleVertices = [];
	for (var v = 0; v < 3; v++) {
		var vertice = this.getVertice(triangleIndexes[v]);
		triangleVertices[v] = vec3.fromValues(vertice[0], vertice[1], vertice[2]);
	}
	return triangleVertices;
};

this.getVertice = function(index) {
	return this.vertices.slice(index*3, (index*3)+2);
};
