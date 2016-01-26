"use strict";
/*
 * Flat Shading
 */
// Get the list of points
// Get the list of triangles
// TODO Calibrate the camera (U(RIGHT) = NxV)
// O seu sistema começa preparando a câmera, ortogonalizando V e gerando U, e depois os normalizando
//TODO Converter todas as coordenadas para vista
// Fazer a mudança de coordenadas para o sistema de vista de todos os vértices dos objetos e da
// posição da fonte de luz PL,
//TODO Calcula normais dos triangulos (call triangleNormalVector)
//TODO Ordenam-se os triângulos do objeto segundo a distância dos seus baricentros para a origem, do mais distante para o mais próximo.
//  Para que se faça a conversão do mais distante primeiro (Zbuffer)
//TODO Calcula normais nos vertices
//TODO Inicialização z-buffer
//TODO - Para cada triangulo
//TODO - Projeta seus vertices (P1', P2', P3')vertices
//TODO - Algoritmo de pintura(Algoritmo Scan conversion)
//TODO --- Para cada pixel/ponto P'-> encontre suas coordenadas baricentricas P' = alfa*P1'+beta*P2'+gama*P3'
//TODO --- Para cada pixel/ponto P'-> encontre ponto no mundo 3d : P(views) = alfa*P1+beta*P2+gama*P3
//TODO --- Para cada pixel/ponto P'-> Consulte z-buffer, se Pz < zbuffer[Px, Py];
//TODO --- Para cada pixel/ponto P'-> Equacao de iluminacao
//TODO --- Para cada pixel/ponto P'-> Encontre N = alfa*N1+beta*N2+gama*N3 -> Encontre R e V() e normalize
//TODO --- Para cada pixel/ponto P'-> Encontre R e V(norm(C-P)) e normalize
//TODO --- Para cada pixel/ponto P'-> Jogar na equacao de iluminacao
//TODO --- Para cada pixel/ponto P'-> Checar se N está no mesmo sentido de V (norma do triangulo)
//TODO --- Para cada pixel/ponto P'-> Se N.V < 0 entao muda o sinal de V (N=-N);
//TODO --- Para cada pixel/ponto P'-> Se N.L > 0 entao adicionar componente difusa;
//TODO --- Para cada pixel/ponto P'-> Se V.R > 0 entao adicionar componente especular;

function RenderingEngine() {

	this.object;
	this.light;
	this.camera;
	var fs = this;

	this.init = function() {

		loadFiles()
			.then(function(data){
				var start;
				var end;
				var finalTime;

				var cameraFileContent = data[0];
				var lightFileContent = data[1];
				var objectFileContent = data[2];

				var cameraAttr = loadCamera(cameraFileContent);
				var lightAttr = loadLight(lightFileContent);
				var objectAttr = loadObject(objectFileContent);

				if (!cameraAttr || !lightAttr || !objectAttr) {
					alert('Erro de leitura;');
					return;
				}
				/*Camera setup*/
				fs.camera = new Camera(cameraAttr);

				fs.camera.calculateFrontVector();
				fs.camera.calculateUpVector();
				fs.camera.calculateRightVector();

				console.log(fs.camera);

				/*Light setup*/
				fs.light = new Light(lightAttr);

				fs.light.calculateLightSource(fs.camera);

				console.log(fs.light);

				/*Object setup*/
				fs.object = new ObjectModel(objectAttr);
				console.log(fs.object);

				fs.object.calculateVertices(fs.camera);

				start = new Date().getTime();

				fs.object.calculateNormals(fs.camera);

				var rp = new RenderPipeline(fs.object, fs.light, fs.camera);

				rp.render();

				rp.drawScene();

				end = new Date().getTime();

				finalTime = end-start;

				console.log('Operation took ' + (finalTime) + ' msec');
				//
				//console.log(rp.screen);
			},
			function (reason) {
				console.log(reason);
			});
	};

	var loadFiles = function() {
		/*Request files*/
		return fromServerRequest();
		//return fromFileChooser();
	};

	var fromFileChooser = function() {
		var cameraFiles = document.getElementById('camera-file').files;
		var lightFiles = document.getElementById('light-file').files;
		var objectFiles = document.getElementById('object-file').files;

		if (!cameraFiles.length || !lightFiles.length || !objectFiles.length) {
			var errorEls = document.getElementsByClassName('camera-error');
			var errorEl = errorEls[0];
			errorEl.textContent = 'Camera File loaded: ' + (cameraFiles.length?'Yes': 'No');

			var errorEls = document.getElementsByClassName('light-error');
			var errorEl = errorEls[0];
			errorEl.textContent = 'Light File loaded: ' + (lightFiles.length?'Yes': 'No');

			var errorEls = document.getElementsByClassName('object-error');
			var errorEl = errorEls[0];
			errorEl.textContent = 'Object File loaded: ' + (objectFiles.length?'Yes': 'No');
			return Promise.reject("Load File Error");
		}

		var cameraFile = cameraFiles[0];
		var lightFile = lightFiles[0];
		var objectFile = objectFiles[0];

		return Promise.all([
			readBlob(cameraFile),
			readBlob(lightFile),
			readBlob(objectFile)])
	};

	function readBlob(file) {
		var deferred = Promise.defer();

		var start = 0;
		var stop = file.size - 1;

		var reader = new FileReader();

		// If we use onloadend, we need to check the readyState.
		reader.onloadend = function(evt) {
			if (evt.target.readyState == FileReader.DONE) { // DONE == 2
				deferred.resolve(evt.target.result);
			} else {
				deferred.reject('File is not ready!');
			}
		};

		var blob = file.slice(start, stop + 1);
		reader.readAsBinaryString(blob);

		return deferred.promise;
	}

	var fromServerRequest = function(){
		var cameraFileName = 'data/Cameras/calice2.cfg';
		var lightFileName = 'data/iluminacao.txt';
		var objectFileName = 'data/Objetos/calice2.byu';

		var requestFile = function(filename,alias,attributes,callback) {
			var request = new XMLHttpRequest();
			var deferred = Promise.defer();
			console.info('Requesting ' + filename);
			request.open("GET",filename);

			request.onreadystatechange = function() {
				if (request.readyState == 4) {
					if(request.status == 404) {
						console.info(filename + ' does not exist');
					}
					else {
						deferred.resolve(request.responseText);
					}
				}
			};
			request.send();

			return deferred.promise;
		};

		return Promise.all([
			requestFile(cameraFileName),
			requestFile(lightFileName),
			requestFile(objectFileName)])
	};

	var loadCamera = function(fileContent) {
		/*Load Camera attributtes*/
		var cameraFileLines = fileContent.split('\n');
		var camera = {};
		var lineAttr = [
			'position',
			'up',
			'front',
			'distHxHy',
		];

		for (var i=0; i < cameraFileLines.length; i++) {
			var line = cameraFileLines[i];
			var lineValues = line.split(' ');

			lineValues = lineValues.filter(function(value){
				return !isNaN(parseFloat(value));
			});

			if(lineAttr[i] && lineValues.length === 3) {
				camera[lineAttr[i]] = vec3.fromValues(
					parseFloat(lineValues[0]),
					parseFloat(lineValues[1]),
					parseFloat(lineValues[2])
				);

			}
		}

		if (lineAttr.length != Object.keys(camera).length) {
			return false;
		}

		if(camera.distHxHy.length === 3) {
			camera.dist = camera.distHxHy[0];
			camera.hx = camera.distHxHy[1];
			camera.hy = camera.distHxHy[2];
			delete camera.distHxHy;
		}

		return camera;
	};

	var loadLight = function(fileContent) {
		/*Load Light attributtes*/
		var lightFileLines = fileContent.split('\n');
		var light = {};
		var lineAttr = [
			'lightSource',
			'ambient',
			'ambientColor',
			'diffuse',
			'diffuseVector',
			'specular',
			'lightColor',
			'n',
		];

		for (var i=0; i < lightFileLines.length; i++) {
			var line = lightFileLines[i];
			var lineValues = line.split(' ');

			lineValues = lineValues.filter(function(value){
				return !isNaN(parseFloat(value));
			});

			if(lineAttr[i]) {
				if (lineValues.length == 1) {
					light[lineAttr[i]] = parseFloat(lineValues[0]);
				} else {
					light[lineAttr[i]] = vec3.fromValues(
						parseFloat(lineValues[0]),
						parseFloat(lineValues[1]),
						parseFloat(lineValues[2])
					);
				}
			}
		}

		if (lineAttr.length != Object.keys(light).length) {
			return false;
		}

		return light;
	};


	var loadObject = function(fileContent) {
		var objectFileLines = fileContent.split('\n');
		var object = {};
		var lineAttr = [
			'qty',
			'vertices',
			'triangles',
		];

		var vIdx = 0;
		var tIdx = 0;
		object.vertices

		for (var i=0; i < objectFileLines.length; i++) {
			var line = objectFileLines[i];
			var lineValues = line.split(' ');

			lineValues = lineValues.filter(function(value){
				return !isNaN(parseFloat(value));
			});

			if (lineValues.length == 2) {
				object[lineAttr[i]] = vec2.fromValues(
					parseFloat(lineValues[0]),
					parseFloat(lineValues[1])
				);

			} else if (lineValues.length == 3 ) {
				if (object.qty && vIdx < object.qty[0]) {
					if (!object.vertices) {
						object.vertices = []
					}

					object.vertices.push(vec3.fromValues(
						parseFloat(lineValues[0]),
						parseFloat(lineValues[1]),
						parseFloat(lineValues[2])
					));
					vIdx++;

				} else if (object.qty && tIdx < object.qty[1]) {
					if (!object.triangles) {
						object.triangles = []
					}

					object.triangles.push(vec3.fromValues(
						parseFloat(lineValues[0]-1),
						parseFloat(lineValues[1]-1),
						parseFloat(lineValues[2]-1)
					));
					tIdx++;

				}
			}
		}

		if (lineAttr.length != Object.keys(object).length) {
			return false;
		}

		if (object.vertices.length !== object.qty[0]) {
			return;
		}

		if (object.triangles.length !== object.qty[1]) {
			return;
		}

		return object;
	};

}