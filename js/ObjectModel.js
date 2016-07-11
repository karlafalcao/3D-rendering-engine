"use strict";
/*
 * Object class
 *
 * /---------------------------------------\
 * | 3 1                                   | ; 3 pontos e 1 triangulo
 * | 50.0000 0.0000 0.000                  | ; ponto 1: P1(50, 0, 0)
 * | 0 50 0                                | ; ponto 2: P2(0, 50, 0)
 * | 0 0 50                                | ; ponto 3: P3(0, 0, 50)
 * | 1 2 3                                 | ; triangulo 1: formado pelos vertices 1, 2 e 3
 * \---------------------------------------/
*/

function ObjectModel(attrs) {
	this.verticesQty = attrs.qty[0] || 0;
	this.trianglesQty = attrs.qty[1] || 0;
	this.originalVertices = Array.from(attrs.vertices) || new Array(); //tam = verticesQty
	this.vertices = Array.from(attrs.vertices) || new Array(); //tam = verticesQty
	this.triangles = attrs.triangles || new Array(); //tam = trianglesQty
	this.views = new Array();
	this.trianglesNormals = new Array(); //tam = trianglesQty
	this.verticesNormals = new Array(); //tam = verticesQty
}

ObjectModel.prototype.getTriangle = function(index) {
	if (index < 0 || index >= this.trianglesQty) {
		return;
	}

	var indices = this.triangles[index];
	var vertices = [];
	var originalVertices = [];
	var views = [];
	var normals = [];

	for (var v = 0; v < 3; v++) {
		var vertice = this.vertices[indices[v]];
		vertices[v] = vec3.fromValues(vertice[0], vertice[1], vertice[2]);
		vertices[v].idx = v;

		var originVertice = this.originalVertices[indices[v]];
		originalVertices[v] = vec3.fromValues(originVertice[0], originVertice[1], originVertice[2]);

		var view = this.views[indices[v]];
		views[v] = vec3.fromValues(view[0], view[1], view[2]);

		var normal = this.verticesNormals[indices[v]];
		normals[v] = vec3.fromValues(normal[0], normal[1], normal[2]);
	}

	return new Triangle(vertices, views, normals, originalVertices);

};

ObjectModel.prototype.calculateVertices = function(camera) {

	for (var i = 0; i < this.verticesQty; i++) {
		vec3.sub(this.vertices[i], this.vertices[i], camera.position);

		var xView = vec3.dot(this.vertices[i], camera.rightVector);
		var yView = vec3.dot(this.vertices[i], camera.frontVector);
		var zView = vec3.dot(this.vertices[i], camera.upVector);

		/*Set ith-view */
		this.views[i] = vec3.fromValues(xView, yView, zView);
		this.views[i].idx = i;

		/*Project the vertice*/
		/*Set ith-vertice */
		this.vertices[i] = vec3.fromValues(
								(camera.distance / camera.width) * (xView / zView),
								(camera.distance / camera.height) * (yView / zView),
								0);
		
		this.vertices[i].idx = i;

		this.verticesNormals[i] = vec3.create();
	}

};

/*
 * Updates/calculates the normal
 */
ObjectModel.prototype.calculateNormals = function() {

	for (var i=0; i<this.trianglesQty; i++) {
		var idx1 = this.triangles[i][0];
		var idx2 = this.triangles[i][1];
		var idx3 = this.triangles[i][2];

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

		vec3.add(this.verticesNormals[idx1], this.verticesNormals[idx1], this.trianglesNormals[i]);
		vec3.add(this.verticesNormals[idx2], this.verticesNormals[idx2], this.trianglesNormals[i]);
		vec3.add(this.verticesNormals[idx3], this.verticesNormals[idx3], this.trianglesNormals[i]);
	}

	for (var i = 0; i < this.verticesQty; i++) {
		vec3.normalize(this.verticesNormals[i], this.verticesNormals[i]);
	}
};