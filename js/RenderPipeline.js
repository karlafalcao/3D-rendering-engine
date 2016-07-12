"use strict";

function RenderPipeline (object, light, camera){
	this.object = object;
	this.light = light;
	this.camera = camera;

	this.screen = new Array();
	this.screen2 = new Array();
	this.zBuffer = new Array();

	this.canvasHeight = 480;
	this.canvasWidth = Math.round(this.canvasHeight * (camera.width/camera.height));
	Main.canvasCtx[0].width  = this.canvasWidth;
	Main.canvasCtx[1].width  = this.canvasWidth;
	Main.canvasCtx[0].height = this.canvasHeight;
	Main.canvasCtx[1].height = this.canvasHeight;

}

RenderPipeline.prototype.initialisezBuffer = function() {
	for (var i = 0; i < this.canvasWidth; i++) {
		this.screen[i] = new Array();
		this.screen2[i] = new Array();
		this.zBuffer[i] = new Array();
		for (var j = 0; j < this.canvasHeight; j++) {
			this.screen[i][j] = vec3.fromValues(255,255,255);
			this.screen2[i][j] = vec3.fromValues(255,255,255);
			this.zBuffer[i][j] = Infinity;
		}
	}
};

/*Coloca as coordenadas dos pontos em Coordenadas de Tela*/
RenderPipeline.prototype.updateVerticesInScreen = function() {
	for (var i = 0; i < this.object.vertices.length; i++) {
		this.object.vertices[i][0] = parseInt((this.object.vertices[i][0] + 1) * this.canvasWidth / 2);
		this.object.vertices[i][1] = parseInt((1 - this.object.vertices[i][1]) * this.canvasHeight / 2);
	}
};

RenderPipeline.prototype.render = function () {

	this.initialisezBuffer();
	this.updateVerticesInScreen();

	for (var i in this.object.triangles) {
		var triangle = this.object.getTriangle(i);

		triangle.sortVertices();

		if (triangle.isValid()) {
			continue;
		}

		// Calculate inital Ymin Ymax Xmin and Xmax values
		triangle.getInitialBounds();
		//console.log(' Vertices normals '+triangle.normals);
		var getFinalColor = this.calculateColorByGouraud(triangle);

		for (var y = Math.round(triangle.bounds.Y[0]); y <= Math.round(triangle.bounds.Y[1]); y++) {

			for (var x = Math.round(triangle.bounds.X[0]); x <= Math.round(triangle.bounds.X[1]); x++) {

				var pixel = vec3.fromValues(x, y, 0);
				//console.log('Pixel:'+ pixel);

				var coords = triangle.getBarycentricCoordinates(pixel);
				//console.log('Coords bar: '+coords);

				/*Find 3d point in world*/
				var point3d = triangle.getViewPointInside(coords);

				/*z-buffer test*/
				if ((x >= 0 && y >= 0 && x < this.zBuffer.length
					&& y < this.zBuffer[0].length && point3d[2] > 0
					&& point3d[2] < this.zBuffer[Math.round(x)][Math.round(y)])) {

					this.zBuffer[Math.round(x)][Math.round(y)] = point3d[2];

					// var color = vec3.fromValues((10*i)%255,(20*i)%255,(30*i)%255);

					var point3dNormal = triangle.getNormalViewPointInside(point3d, coords);
					//console.log('3D point '+point3d);
					//console.log('3D point normal: '+point3dNormal);

					///* Calculate pixel color */
					var color = this.calculateColor(point3d, point3dNormal);
					var color2 = getFinalColor(coords);

					/* Draw the pixel */
					this.screen[x][y] = color;
					this.screen2[x][y] = color2;

				}

			}

			triangle.updateBounds(y);
		}
	}
};

RenderPipeline.prototype.drawScene = function() {

// first, create a new ImageData to contain our pixels
//	var imgData = canvasCtx.createImageData(this.canvasWidth, this.canvasHeight); // width x height
//	var data = imgData.data;
//	var img = [];
	for (var x = 0; x < this.canvasWidth; x++) {
		for (var y = 0; y < this.canvasHeight; y++){
			var color = this.screen[x][y];
			var color2 = this.screen2[x][y];
			utils.drawPoint(x, y, color, Main.canvasCtx[0]);
			utils.drawPoint(x, y, color2, Main.canvasCtx[1]);
			//img.push(color[0]);
			//img.push(color[1]);
			//img.push(color[2]);
			//img.push(1);
		}
	}

};

/*
 * Calculates the shading of the polygon
 * ￼I = Ia * Ka (Ambient component)
 * ￼I = Il * Od * Kd * <N,L> (Difuse component)
 * ￼I = Il * Ks * Os * <R.V>^n (Specular component)
 *  R = 2N <N.L> - L
 */
RenderPipeline.prototype.calculateColor = function(point3d, point3dNormal) {

	var color = vec3.create();

	var ka = this.light.ambient;

	/* Ambient Component Ia * Ka */
	color[0] = ka * this.light.ambientColor[0];
	color[1] = ka * this.light.ambientColor[1];
	color[2] = ka * this.light.ambientColor[2];

	/* L = Light Source Vector */
	var L = vec3.fromValues(this.light.lightSource[0] - point3d[0],
							this.light.lightSource[1] - point3d[1],
							this.light.lightSource[2] - point3d[2]);
	vec3.normalize(L, L);

	var dotNL = vec3.dot(L, point3dNormal);
	if (dotNL > 0) {
		/* Diffuse component Il * Od * Kd * <N,L> */
		color[0] += this.light.lightColor[0] * this.light.diffuseVector[0]* this.light.diffuse * dotNL;
		color[1] += this.light.lightColor[1] * this.light.diffuseVector[1]* this.light.diffuse * dotNL;
		color[2] += this.light.lightColor[2] * this.light.diffuseVector[2]* this.light.diffuse * dotNL;

		/* R = Reflection Vector 2N <N.L> - L */
		var R = vec3.fromValues(2 * dotNL*point3dNormal[0] - L[0],
								2 * dotNL*point3dNormal[1] - L[1],
								2 * dotNL*point3dNormal[2] - L[2]);

		/* V = View/Observer Vector */
		var V = vec3.fromValues(-point3d[0], -point3d[1], -point3d[2]);
		vec3.normalize(V, V);
		
		var dotVR = vec3.dot(V, R);
		if (dotVR > 0) {
			/* Specular component Il * Ks <R.V>^n */
			var rugosity = this.light.specular * Math.pow(dotVR, this.light.n);
			color[0] += this.light.lightColor[0] * rugosity;
			color[1] += this.light.lightColor[1] * rugosity;
			color[2] += this.light.lightColor[2] * rugosity;
		}
	}

	color[0] = Math.round(this.checkColourRange(color[0]));
	color[1] = Math.round(this.checkColourRange(color[1]));
	color[2] = Math.round(this.checkColourRange(color[2]));

	//console.log(color[0] + " " + color[1] + " " + color[2]);

	return color;

};

RenderPipeline.prototype.calculateColorByGouraud = function(triangle) {

	var C1 = this.calculateColor(triangle.originalVertices[0], triangle.normals[0]),
		C2 = this.calculateColor(triangle.originalVertices[1], triangle.normals[1]),
		C3 = this.calculateColor(triangle.originalVertices[2], triangle.normals[2]);

	var that = this;
	
	return function(coords) {
		var color = vec3.create();

		color[0] = coords[0] * C1[0] + coords[1] * C2[0] + coords[2] * C3[0];
		color[1] = coords[0] * C1[1] + coords[1] * C2[1] + coords[2] * C3[1];
		color[2] = coords[0] * C1[2] + coords[1] * C2[2] + coords[2] * C3[2];

		color[0] = Math.round(that.checkColourRange(color[1]));
		color[1] = Math.round(that.checkColourRange(color[1]));
		color[2] = Math.round(that.checkColourRange(color[2]));

		return color; // Final Color
	};
}

/*
 * Used to ensure the range of values for rgb are between 0 and 255
 */
RenderPipeline.prototype.checkColourRange = function(x) {

	//console.log("Colour range being checked: " + x);

	if (x <= 0)
		x = 0;

	if (x >= 255)
		x = 255;

	return x;
};