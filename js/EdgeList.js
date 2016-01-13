/*
 * EdgeList
 */

function EdgeList(x, z) {
	// 0 is left x, 1 is left z, 2 is right x and 3 is right z
	this.coordinates = [];

	/*
	 * New Edgelist adds the first edge coordinates
	 */
	coordinates[0] = x;
	coordinates[1] = z;
}

/*
 * Adds the right hand edge coordinates
 */
EdgeList.prototype.add = function(x, z) {
	//left edge
	if(x < coordinates[0]){
		coordinates[2] = coordinates[0];
		coordinates[3] = coordinates[1];
		coordinates[0] = x;
		coordinates[1] = z;
	} else{
		coordinates[2] = x;
		coordinates[3] = z;

	}
}

EdgeList.prototype.getLeftX = function() {
	return coordinates[0];
}

EdgeList.prototype.getLeftZ = function() {
	return coordinates[1];
}

EdgeList.prototype.getRightX = function() {
	return coordinates[2];
}

EdgeList.prototype.getRightZ = function() {
	return coordinates[3];
}

EdgeList.prototype.toString = function() {
	for (var i = 0; i < coordinates.length; i++) {
		console.log(coordinates[i]);
	}
}
