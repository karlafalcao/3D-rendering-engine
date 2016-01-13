"use strict";

//
//	Tangent Tang = point(t)'/ |point(t)'|,
//	Main Normal MNorm = Tang(t)' / |Tang(t)'|,
//	Binormal Bin = Tang(t) x MNorm(t)
//
function Bezier() {
	var w = 700,
		h = 700,
		t = 1,
		delta = .01,
		points = [{x: 20, y: 250, z: 0}, {x: 20, y: 30, z: 0}, {x: 100, y: 20, z: 0}, {x: 200, y: 250, z: 0}, {
			x: 225, y: 125, z: 0
		}],
		bezier = {},
		n = 4,
		b,
		fatorialN = [];

// Casteljau algorithm
// Calculates the interpolation points in a level based on previous(Level) interpolated points ,
// Receives a set of control points (of the previous levels) and t E [0,1]
// Returns n-1 interpolated controls points
// r[{x: x1, y: y1}, {x: x2, y: y2}, ...]

	function interpolate(points, _t) {
		if (arguments.length < 2) _t = t;
		var r = [];
		for (var i = 0; i < points.length - 1; i++) {
			var di = points[i], di_1 = points[i + 1];
			r.push({
				x: di.x * (1 - _t) + di_1.x * _t,
				y: di.y * (1 - _t) + di_1.y * _t,
				z: di.z * (1 - _t) + di_1.z * _t
			});
		}
		return r;
	}

// Casteljau algorithm
// Receives a set of control points and t E [0,1]
// Returns d levels of interpolated controls points
	function getLevels(d, t_) {
		if (arguments.length < 2) t_ = t;
		var x = [points.slice(0, d)];
		for (var i = 1; i < d; i++) {
			x.push(interpolate(x[x.length - 1], t_));
		}
		return x;
	}

	function getCurve(d, t_) {
		if (arguments.length < 2) t_ = t;
		var curve = bezier[d];
		if (!curve) {
			curve = bezier[d] = [];
			//Draw the curve with the latest control points x[n][0]
			// for t varying
			for (var t_ = 0; t_ <= 1; t_ += delta) {
				var x = getLevels(d, t_);
				var pto = x[x.length - 1][0];
				curve.push(pto);
			}
		}
		return [curve.slice(0, t_ / delta + 1)];
	}

	function getBezier(t_) {
		var curve = getCurve(5, t_);
		var curvePto = curve[0][t_ / delta - 1];
		return curvePto;
	}

	function getTangModel(t_) {
		var tangPto = getTang(t_);

		tangPto[0] = vec3.fromValues(tangPto[0].x, tangPto[0].y, tangPto[0].z);
		tangPto[1] = vec3.fromValues(tangPto[1].x, tangPto[1].y, tangPto[1].z);
		//tangPto = vec3.fromValues(tangPto.x, tangPto.y, tangPto.z);
//    tangPto = tangPto.removeAxis();

		var bezierPto = getBezier(t_);
		bezierPto = vec3.fromValues(bezierPto.x, bezierPto.y, bezierPto.z);

		//var tangPtoUni = vec3.fromValues(tangPto.x, tangPto.y, tangPto.z);
		//tangPtoUni  = tangPtoUni.scale(1/tangPtoUni.len());

		//console.log(tangPtoUni);

//    Vn = r.pos[n+1]-r.pos[n] #
		var Vn = tangPto[1].sub(bezierPto);
//
//    VnMinus1 = r.pos[n]-r.pos[n-1] #
		var VnMinus1 = bezierPto.sub(tangPto[0]);
//
//    speed = mag((r.pos[n+1]-r.pos[n])/stepsize) #the magnitute of r'(t)
//
//    #Calculations for the unit tangent vector
//    T.pos = r.pos[n]
//    T.axis = ((Vn + VnMinus1) / mag(VnMinus1 + Vn))
		var T = {
			from: bezierPto,
			to: Vn.add(VnMinus1).scale(1 / VnMinus1.add(Vn).len())
		};
//
//        #Calculations for the unit normal vector
//    N.pos = r.pos[n]
//    N.axis = ( (Vn - VnMinus1)/mag(Vn - VnMinus1) )
		var N = {
			from: bezierPto,
			to: Vn.sub(VnMinus1).scale(1 / VnMinus1.sub(Vn).len())
		};
//
//        #Calculations for the unit binormal vector
//    B.pos=r.pos[n]
//    B.axis= cross(T.axis,N.axis)/mag(cross(T.axis,N.axis))

		var B = {
			from: bezierPto,
			to: T.to.cross(N.to).scale(1 / T.to.cross(N.to))
		};

		bezierPto = bezierPto.removeAxis();

		var tangVertices = tangPto[0].removeAxis().concat(tangPto[1].removeAxis());
		tangVertices = bezierPto.concat(tangVertices);
		var tangIndices = [0, 1];


		//var tangModel = {
		//	T : {
		//		vertices: bezierPto.removeAxis().concat(T.to.removeAxis()),
		//		indices: [0, 1]
		//	},
		//	N: {
		//		vertices: tangVertices,
		//		indices: tangIndices
		//	},
		//	B: {
		//		vertices: tangVertices,
		//		indices: tangIndices
		//	}
		//};
		var tangModel = {
			vertices: tangVertices,
			indices: tangIndices
		}

		console.log(tangModel);

		return tangModel;
	}

	function getTang(t_) {
		//var tang = BernsteinDerivative(n,t_);
		var tang = getLevel(3, t_);
		return tang;
	}

	function BernsteinDerivative(n, t_) {
		if (arguments.length < 2) t_ = t;
		//var curve = getCurve(n, t);
		var controlP = points.slice(0, n);
		var k = n - 1;
		var totalSum = {
			x: 0.0,
			y: 0.0,
			z: 0.0
		};
		var bernSum = [];
		for (var i = 0; i < k; i++) {
			var binTerm = bin(k, i);
			var polTerm = Math.pow(1 - t_, k - i) * Math.pow(t_, i);

			var derWeightX = controlP[i + 1].x - controlP[i].x;
			var derWeightY = controlP[i + 1].y - controlP[i].y;
			var derWeightZ = controlP[i + 1].z - controlP[i].z;
			var point = vec3.fromValues(derWeightX, derWeightY, derWeightZ);

			bernSum[i] = point.scale(binTerm * polTerm * n);
			//{
			//	x: binTerm * polTerm * n * derWeightX,
			//	y: binTerm * polTerm * n * derWeightY,
			//	z: binTerm * polTerm * n * derWeightZ
			//};
			totalSum = bernSum[i].add(totalSum);
			//{
			//	x: totalSum.x + bernSum[i].x,
			//	y: totalSum.y + bernSum[i].y,
			//	z: totalSum.z + bernSum[i].z,
			//}
		}

		return totalSum;
	}

	function getLevel(l, t_) {
		var x = getLevels(5, t_);
		return x[l];
	}

	function bin(n, i) {
		return fatorial(n) / (fatorial(n - i) * fatorial(i));

	}

	function fatorial(n) {
		var fatN = fatorialN[n];
		if (!fatN) {
			fatN = fatorialN[n] = 1;
			for (var i = 1; i <= n; i++) {
				fatN *= i;
			}
		}

		return fatN;
	}


	var self = {

	};

	return self;
};