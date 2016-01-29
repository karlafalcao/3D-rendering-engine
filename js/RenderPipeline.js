"use strict";

function RenderPipeline (object, light, camera){
	this.object = object;
	this.light = light;
	this.camera = camera;

	this.screen = new Array();
	this.zBuffer = new Array();

	this.canvasHeight = 480;
	this.canvasWidth = Math.round(this.canvasHeight * (camera.width/camera.height));
	canvasCtx.width  = this.canvasHeight;
	canvasCtx.height = this.canvasWidth;

}

RenderPipeline.prototype.initialisezBuffer = function() {
	for (var i = 0; i < this.canvasWidth; i++) {
		this.screen[i] = new Array();
		this.zBuffer[i] = new Array();
		for (var j = 0; j < this.canvasHeight; j++) {
			this.screen[i][j] = vec3.fromValues(255,255,255);
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

		triangle.getBounds();
		//console.log(' Vertices normals '+triangle.normals);

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

					var color = vec3.fromValues((10*i)%255,(20*i)%255,(30*i)%255);

					var point3dNormal = triangle.getNormalViewPointInside(point3d, coords);
					//console.log('3D point '+point3d);
					//console.log('3D point normal: '+point3dNormal);

					if (coords[0]<0.1 || coords[1]<0.1 || coords[2] < 0.1) {
						this.light.diffuseVector = vec3.fromValues(10/256,200/256,10/256);
					} else
					if ((coords[0]<0.6 && coords[0]>0.3) || (coords[1]<0.6 && coords[1]>0.3) ||
						(coords[2]<0.6 && coords[2]>0.3)) {
						this.light.diffuseVector = vec3.fromValues(10/256,10/256,200/256);
					} else {
						this.light.diffuseVector = vec3.fromValues(200/256,10/256,10/256);
					}

					///* Calculate pixel color */
					var color = this.calculateColor(point3d, point3dNormal);

					//utils.drawPoint(x, y, color);
					/* Draw the pixel */
					this.screen[x][y] = color;

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
			utils.drawPoint(x, y, color);
			//img.push(color[0]);
			//img.push(color[1]);
			//img.push(color[2]);
			//img.push(1);
		}
	}
	//
	//imgData.data.set(new Uint8Array(img));
	//canvasCtx.putImageData(imgData, 0, 0);
};

/*
 * Calculates the shading of the polygon
 * ￼I = Ia*Ka
 * ￼I = Il*(Kd cos(N,L))
 * ￼I = Is*Ks(R.V)^h
 *  R = 2N (N.L) - L
 */
RenderPipeline.prototype.calculateColor = function(point3d, point3dNormal) {

	var color = vec3.create();

	var ka = this.light.ambient;

	/* Ambient Component */
	color[0] = ka*this.light.ambientColor[0];
	color[1] = ka*this.light.ambientColor[1];
	color[2] = ka*this.light.ambientColor[2];

	/*Vetor L*/
	var L = vec3.fromValues(this.light.lightSource[0] - point3d[0],
		this.light.lightSource[1] - point3d[1],
		this.light.lightSource[2] - point3d[2]);
	vec3.normalize(L, L);

	/* Diffuse component */
	var dotNL = vec3.dot(L, point3dNormal);
	if (dotNL > 0) {
		color[0] += this.light.diffuseVector[0]*this.light.lightColor[0]*this.light.diffuse*dotNL;
		color[1] += this.light.diffuseVector[1]*this.light.lightColor[1]*this.light.diffuse*dotNL;
		color[2] += this.light.diffuseVector[2]*this.light.lightColor[2]*this.light.diffuse*dotNL;
	}

	/* R Vector */
	var R = vec3.fromValues(2*dotNL*point3dNormal[0] - L[0],
							2*dotNL*point3dNormal[1] - L[1],
							2*dotNL*point3dNormal[2] - L[2]);

	/* V Vector */
	var V = vec3.fromValues(-point3d[0], -point3d[1], -point3d[2]);
	vec3.normalize(V, V);

	/* Specular component */
	var dotVR = vec3.dot(V, R);
	if (dotVR > 0) {
		var rugosity = this.light.specular*Math.pow(dotVR, this.light.n);
		color[0] += this.light.lightColor[0]*rugosity;
		color[1] += this.light.lightColor[1]*rugosity;
		color[2] += this.light.lightColor[2]*rugosity;
	}

	color[0] = Math.round(this.checkColourRange(color[0]));
	color[1] = Math.round(this.checkColourRange(color[1]));
	color[2] = Math.round(this.checkColourRange(color[2]));

	//console.log(color[0] + " " + color[1] + " " + color[2]);

	return color;

};


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