"use strict";

function RenderPipeline (object, light, camera){
	this.object = object;
	this.light = light;
	this.camera = camera;

	this.screen = new Array();
	this.zBuffer = new Array();

	this.canvasWidth = 200;
	this.canvasHeight= 200;

}


RenderPipeline.prototype.initialisezBuffer = function(width, height) {
	for (var i = 0; i < height; i++) {
		this.screen[i] = new Array();
		this.zBuffer[i] = new Array();
		for (var j = 0; j < width; j++) {
			this.screen[i][j] = vec3.fromValues(128,128,128);
			this.zBuffer[i][j] = Infinity;
		}
	}
};

/*Coloca as coordenadas dos pontos em Coordenadas de Tela*/
RenderPipeline.prototype.updateCoords = function(width, height) {
	for (var i = 0; i < this.object.vertices.length; i++) {
		this.object.vertices[i][0] = parseInt((this.object.vertices[i][0] + 1) * width / 2);
		this.object.vertices[i][1] = parseInt((1 - this.object.vertices[i][1]) * height / 2);
	}
};

RenderPipeline.prototype.render = function () {
	debugger;
	var width = this.canvasWidth;
	var height = this.canvasHeight;
	this.initialisezBuffer(width, height);
	this.updateCoords(width, height);

	for (var i in this.object.triangles) {
		var triangle = this.object.triangles[i];
		//if (triangle.facing()) {
			//p.shading(light.lightSource, light.ambientLight);
			var edgelist = triangle.getEdgeList();
			var minY = triangle.getMinY();
			//var c = p.getColour();

			for (var j = 0; j < edgelist.length && edgelist[j]!=null; j++) {
				var y = minY + j;

				//edgelist[j].print();
				//console.log(edgelist[j].getLeftX());
				var x = Math.round(edgelist[j].getLeftX());
				var z = Math.round(edgelist[j].getLeftZ());

				var mz = Math.round((edgelist[j].getRightZ() - edgelist[j].getLeftZ())
					/ (edgelist[j].getRightX() - edgelist[j].getLeftX()));

				//console.log("Left X: "+ x + " RightX: "+ edgelist[j].getRightX());
				while (x <= edgelist[j].getRightX()) {

					var pixel = vec3.fromValues(x, y, 0);
					// Point that will be inked inside the triangle
					var P = triangle.getViewPointInside(pixel);
					//z = P[2];

					if (z < zBuffer[x][y]) {
						//console.log("does this work?");

						triangle.getNormalViewPointInside(P);

						/* Calculate pixel color */
						var color = calculateColor(P, N);

						this.zBuffer[x][y] = z;
						this.screen[x][y] = color;

						/* Paint the pixel */
						//call WebGL

					}
					x++;
					z += mz;
				}
			}
		//}
	}
};

RenderPipeline.prototype.calculateColor = function(pixel, normal) {

	var color = vec3.create();

	var ka = light.ambient;

	/* Ambient Component */
	color[0] = ka*light.ambientColor[0];
	color[1] = ka*light.ambientColor[1];
	color[2] = ka*light.ambientColor[2];

	/*Vetor L*/
	var L = vec3.fromValues(light.lightSource[0] - pixel[0],
		light.lightSource[1] - pixel[1],
		light.lightSource[2] - pixel[2]);
	vec3.normalize(L, L);

	/* Diffuse component */
	var dotNL = vec3.dot(L, normal);

	if (dotNL > 0) {
		color[0] += light.diffuseVector[0]*light.lightColor[0]*light.diffuse*dotNL;
		color[1] += light.diffuseVector[1]*light.lightColor[1]*light.diffuse*dotNL;
		color[2] += light.diffuseVector[2]*light.lightColor[2]*light.diffuse*dotNL;
	}

	var aux = dotNL;

	/* R Vector */
	var R = vec3.fromValues(2*aux*normal[0] - L[0], 2*aux*normal[1] - L[1], 2*aux*normal[2] - L[2]);

	/* V Vector */
	var V = vec3.fromValues(-pixel[0], -pixel[1], -pixel[2]);
	vec3.normalize(V, V);

	var dotVR = vec3.dot(V, R);

	/* Specular component */
	if (dotVR > 0) {
		var rugosity = light.specular*Math.pow(dotVR, light.n);
		color[0] += light.lightColor[0]*rugosity;
		color[1] += light.lightColor[1]*rugosity;
		color[2] += light.lightColor[2]*rugosity;
	}

	color[0] = Math.min(color[0], 255);
	color[1] = Math.min(color[1], 255);
	color[2] = Math.min(color[2], 255);

	//console.log(color[0] + " " + color[1] + " " + color[2]);

	return color;

};

RenderPipeline.prototype.getMinY = function(){
	return Math.round(this.bounds.getY());
};

/*
 * Calculates the bounds of the polygon
 */
RenderPipeline.prototype.getBounds = function(v1, v2, v3) {
	var minX = Math.min(Math.min(v1[0], v2[0]),v3[0]);
	var minY = Math.min(Math.min(v1[1], v2[1]),v3[1]);
	var maxX = Math.max(Math.max(v1[0], v2[0]),v3[0]);
	var maxY = Math.max(Math.max(v1[1], v2[1]),v3[1]);

	var bounds = new Bounds(minX, minY, (maxX - minX), (maxY - minY));
	return bounds;
};


RenderPipeline.prototype.getEdgeList = function(v1, v2, v3) {
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

