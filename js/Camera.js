"use strict";
//
// Atributos da câmera virtual (C, N e V, triplas de pontos flutuantes,
//	d, hx, e hy, pontos flutuantes positivos)
//camera.cfg
///---------------------------------------\
//| -200 -50 300                          | ; Ponto da camera C
//| 0.667 0.172 -1                        | ; Vetor N (UP)
//| 0 3 0                                 | ; Vetor V (FRONT)
//| 65 0.5 0.6                            | ; distancia hx hy
//|                                       |
//\---------------------------------------/

function Camera(attrs) {

	this.position = attrs.position || vec3.create();
	this.upVector = attrs.up || new vec3.create();		// N vector
	this.frontVector = attrs.front || new vec3.create();	// V vector
	this.distance = attrs.dist || 10;
	this.width = attrs.hx || 10;
	this.height =attrs. hy || 10;
	this.rightVector;	// U vector
	this.focus;

	this.setFocus();

}


Camera.prototype.setFocus = function(){
	var frontVectorU = vec3.create();
	vec3.normalize(frontVectorU, this.frontVector);
	vec3.scaleAndAdd(this.focus, this.position, frontVectorU, this.distance)
};

Camera.prototype.setRightVector = function() {
	vec3.cross(this.rightVector, this.upVector, this.rightVector);
	vec3.normalize(this.rightVector, this.rightVector);
};


