/*
 * Light class
 *
 * /---------------------------------------\
 * | -200 -50 300                          | ; Pl - Coordenadas do ponto de luz
 * | 1                                     | ; ka - reflexao ambiental
 * | 2 2 2                                 | ; Ia - vetor cor ambiental
 * | 1                                     | ; kd - constante difusa
 * | 1 1 1                                 | ; Od - vetor difuso
 * | 0.5                                   | ; ks - parte especular
 * | 0 255 0                               | ; Il - cor da fonte de luz
 * | 2                                     | ; n  - constante de rugosidade
 * |                                       |
 * \---------------------------------------/
 */

function Light(attrs){
	"use strict";

	this.lightSource = attrs.lightSource || vec3.create();
	this.ambient = attrs.ambient || 0.1;//Float
	this.ambientColor = attrs.ambientColor || vec3.create();
	this.diffuse = attrs.diffuse || 1;
	this.diffuseVector = attrs.diffuseVector || vec3.fromValues(1,1,1);
	this.specular = attrs.specular || 0;
	this.lightColor = attrs.lightColor || vec3.create();
}