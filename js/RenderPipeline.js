"use strict";

function RenderPipeline (object, light, screenWidth, screenHeight){
	var object = object || new Object();

	var screen = new Float32Array();
	var zBuffer = new Float32Array();

	var screenWidth = screenWidth;
	var screenHeight = screenHeight;
	var image;
	var light = light;

	var INFINITY = Infinity;

	var render = function () {
		for (var i in object.triangles) {
			var triangle = object.triangles[i];
			if (triangle.facing()) {
				//p.shading(light.lightSource, light.ambientLight);
				var edgelist = triangle.edgeList();
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

						var pixel = new Ponto(x, y, 0);
						// Point that will be inked inside the triangle
						var P = triangle.getViewPointInside(pixel);
						//z = P[2];

						if (z < zBuffer[x][y]) {
							//console.log("does this work?");

							/* Triangle vertices normals */
							var N1 = triangle.normals[0];
							var N2 = triangle.normals[1];
							var N3 = triangle.normals[2];

							/* Normal vector in point P */
							var a = triangle.coords[0]*N1[0] + triangle.coords[1]*N2[0] + triangle.coords[2]*N3[0];
							var b = triangle.coords[0]*N1[1] + triangle.coords[1]*N2[1] + triangle.coords[2]*N3[1];
							var c = triangle.coords[0]*N1[2] + triangle.coords[1]*N2[2] + triangle.coords[2]*N3[2];

							var N = vec3.normalize(vec3.create(), vec3.fromValues(a, b, c));

							var V = vec3.fromValues(-P[0], -P[1], -P[2]);

							var dotNV = vec3.dot(N, V);
							/* Ensure that points toward the viewer */
							if (dotNV < 0) {
								N = vec3.fromValues(-N[0], -N[1], -N[2]);
							}

							/* Calculate pixel color */
							var color = calculateColor(P, N);

							zBuffer[x][y] = z;
							screen[x][y] = color;

							/* Paint the pixel */
							//call WebGL

						}
						x++;
						z += mz;
					}
				}
			}
		}
	};

	var calculateColor = function(pixel, normal) {

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

	var initialisezBuffer = function() {
		for (var i = 0; i < screenHeight; i++) {
			for (var j = 0; j < screenWidth; j++) {
				screen[i][j] = Color.gray;
				zBuffer[i][j] = Infinity;
			}
		}
	};

	/*
	 * Prints out a list of all the polygons in the scene along with their
	 * individual properties
	 */
	var printTriangles = function() {
		console.log("Number of triangles: " + triangles.size());

		for (var i in triangles)
			console.log(triangles[i].toString());
	}
}
