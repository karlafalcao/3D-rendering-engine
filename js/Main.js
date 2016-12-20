var Main = (function(){
	var canvasCtx;
	var render;
	
	var subscribeClick = function() {
		
		document.querySelector('.readBytesButtons').addEventListener('click', function(evt) {
			if (evt.target.tagName.toLowerCase() == 'button') {
				startEnv();

				Main.render = new RenderingEngine();
				Main.render.init();
			}
		}, false);
	}
	var startEnv = function() {
		Main.canvasCtx = [];


		// //Gouraud
		// var gouraudWindow = window.open("Gouraud", "Gouraud", "toolbar=yes,scrollbars=yes,resizable=yes,top=0,left=0,width=600,height=500");
		// if (gouraudWindow)
		// {
		// 	gouraudWindow.document.write('<canvas id="canvas" width="665" height="480"></canvas>');
		// }

		// //Phong
		// var phongWindow = window.open("Phong", "Phong", "toolbar=yes,scrollbars=yes,resizable=yes,top=0,left=650,width=600,height=500");
		// if (phongWindow)
		// {
		// 	phongWindow.document.write('<canvas id="canvas" width="665" height="480"></canvas>');
		// }

		Main.canvasCtx = [
			utils.getGLContext('canvas'),
			utils.getGLContext('canvas1')
		];
		
	}
	return {
		subscribeClick: subscribeClick,
		canvasCtx: canvasCtx,
		render: render,
	};
})()