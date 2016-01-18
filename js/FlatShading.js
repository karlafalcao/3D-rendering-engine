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

function FlatShading() {

	this.object;
	this.light;
	this.camera;
	var fs = this;

	this.init = function() {

		loadFiles()
			.then(function(data){
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
				fs.object = new Object(objectAttr);

				fs.object.calculateVertices(fs.camera);
				fs.object.calculateNormals(fs.camera);

				console.log(fs.object);

				var rp = new RenderPipeline(fs.object, fs.light, fs.camera);

				rp.render();

				console.log(rp.screen);
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
			var errorEls = document.getElementsByClassName('error');
			var errorEl = errorEls[0];
			errorEl.textContent = 'Camera File loaded: ' + cameraFiles.length?'Yes': 'No' +' \n';
			errorEl.textContent += 'Light File loaded: ' + lightFiles.length?'Yes': 'No' +' \n';
			errorEl.textContent += 'Object File loaded: ' + objectFiles.length?'Yes': 'No' +' \n';
			return;
		}

		var cameraFile = cameraFiles[0];
		var lightFile = lightFiles[0];
		var objectFile = objectFiles[0];

		return Promise.all([
			readBlob(cameraFile),
			readBlob(lightFile),
			readBlob(objectFile)])
	};

	var fromServerRequest = function(){
		var cameraFileName = '../data/camera.cfg';
		var lightFileName = '../data/iluminacao.txt';
		var objectFileName = '../data/dalton.byu';

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
		var cameraFileLines = fileContent.split('\n').slice(0,-1);
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

			if(lineAttr[i] && lineValues.length === 3) {
				camera[lineAttr[i]] = vec3.fromValues(
					parseFloat(lineValues[0]),
					parseFloat(lineValues[1]),
					parseFloat(lineValues[2])
				);

			}
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
		var lightFileLines = fileContent.split('\n').slice(0,-1);
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

		return light;
	};


	var loadObject = function(fileContent) {
		var objectFileLines = fileContent.split('\n').slice(0,-1);
		var object = {};
		var lineAttr = [
			//'ambient',
			//'diffuse',
			//'specular',
			//'diffuseVector',
			'qty',
			'vertices',
			'triangles',
		];

		var i = 0;

		var line = objectFileLines[i];
		var lineValues = line.split(' ');
		if(lineAttr[i] == 'qty' && lineValues.length === 2) {
			/*
			Reading: Qty of vertices and qty of triangles*/
			var verticesQty = parseInt(lineValues[0]);
			var trianglesQty = parseInt(lineValues[1]);
			object[lineAttr[i]] = [];
			object[lineAttr[i]].push(verticesQty);
			object[lineAttr[i]].push(trianglesQty);

			/*Reading: Vertices*/
			var vS = i+1;
			var vF = i+verticesQty;

			object.vertices = [];

			while (vS <= vF && objectFileLines[vS] !== undefined) {
				var verticeLine = objectFileLines[vS];
				var vertice = verticeLine.split(' ');

				if(vertice.length === 3) {
					object.vertices.push(vec3.fromValues(
					parseFloat(vertice[0]),
					parseFloat(vertice[1]),
					parseFloat(vertice[2])));
					vS++;
				} else {
					vS++;
					vF++;
				}
			}

			if (object.vertices.length !== verticesQty) {
				return;
			}

			/*Keeping reading*/
			/*Reading: Triangles*/
			var tS = vS;
			var tF = vS+trianglesQty-1;

			object.triangles = [];

			while (tS <= tF && objectFileLines[tS] !== undefined) {
				var triangleLine = objectFileLines[tS];
				var triangle = triangleLine.split(' ');

				if(triangle.length === 3) {
					object.triangles.push(vec3.fromValues(
						parseFloat(triangle[0]),
						parseFloat(triangle[1]),
						parseFloat(triangle[2])));
					tS++;
				} else {
					tS++;
					tF++;
				}
			}

			if (object.triangles.length !== trianglesQty) {
				return;
			}
		}

		return object;
	};

	function readBlob(file) {
		var deferred = Promise.defer();

		var start = 0;
		var stop = file.size - 1;

		var reader = new FileReader();

		// If we use onloadend, we need to check the readyState.
		reader.onloadend = function(evt) {
			if (evt.target.readyState == FileReader.DONE) { // DONE == 2

				document.getElementById('byte_content').textContent = evt.target.result;
				//document.getElementById('byte_range').textContent =
				//	['Read bytes: ', start + 1, ' - ', stop + 1,
				//		' of ', file.size, ' byte file'].join('');
				deferred.resolve(evt.target.result);

			} else {
				deferred.reject('File is not ready!');
			}
		};

		var blob = file.slice(start, stop + 1);
		reader.readAsBinaryString(blob);

		return deferred.promise;
	}


	/*
	 * Converts a 2D array of Colors to a BufferedImage. Assumes that bitmap is
	 * indexed by column then row and has imageHeight rows and imageWidth
	 * columns. Note that image.setRGB requires x (col) and y (row) are given in
	 * that order.
	 */
	//this.convertToImage(bitmap) {
	//	image = new BufferedImage(screenWidth, screenHeight,
	//		BufferedImage.TYPE_INT_RGB);
	//	for (int x = 0; x < screenWidth; x++) {
	//		for (int y = 0; y < screenHeight; y++) {
	//			image.setRGB(x, y, bitmap[x][y].getRGB());
	//		}
	//	}
	//	return image;
	//}

	/**
	 * writes a BufferedImage to a file of the specified name
	 */
	//this.saveImage(fname) {
	//	try {
	//		ImageIO.write(image, "png", new File(fname));
	//	} catch (IOException e) {
	//		console.log("Image saving failed: " + e);
	//	}
	//}

}