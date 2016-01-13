"use strict";

function RenderPipeline (triangles, light, screenWidth, screenHeight){
	var triangles = triangles || new Float32Array();

	var screen = new Float32Array();
	var zBuffer = new Float32Array();

	var screenWidth = screenWidth;
	var screenHeight = screenHeight;
	var image;
	var light = light;

	var INFINITY = Infinity;

	var render = function () {
		for (var i in triangles) {
			var p = triangles[i];
			if (p.facing()) {
				p.shading(light.lightSource, light.ambientLight);
				var edgelist = p.edgeList();
				var minY = p.getMinY();
				var c = p.getColour();

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
						if (z < zBuffer[x][y]) {
							//console.log("does this work?");
							zBuffer[x][y] = z;
							screen[x][y] = c;
						}
						x++;
						z += mz;
					}
				}
			}
		}
	}

	var initialisezBuffer = function() {
		for (var i = 0; i < screenHeight; i++) {
			for (var j = 0; j < screenWidth; j++) {
				screen[i][j] = Color.gray;
				zBuffer[i][j] = Infinity;
			}
		}
	}

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
