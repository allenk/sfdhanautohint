function Point(x, y, on, id) {
	this.xori = x;
	this.yori = y;
	this.xtouch = x;
	this.ytouch = y;
	this.touched = false;
	this.donttouch = false;
	this.on = on;
	this.id = id;
	this.interpolated = id < 0;
}
function Contour() {
	this.points = []
	this.ccw = false
}
Contour.prototype.stat = function () {
	var points = this.points;
	if (
		points[0].yori > points[points.length - 2].yori && points[0].yori >= points[1].yori
		|| points[0].yori < points[points.length - 2].yori && points[0].yori <= points[1].yori) {
		points[0].yExtrema = true;
		points[0].yStrongExtrema = points[0].yori > points[points.length - 2].yori + 1 && points[0].yori > points[1].yori - 1
			|| points[0].yori < points[points.length - 2].yori + 1 && points[0].yori < points[1].yori - 1;
	}
	if (
		points[0].xori > points[points.length - 2].xori && points[0].xori >= points[1].xori
		|| points[0].xori < points[points.length - 2].xori && points[0].xori <= points[1].xori) {
		points[0].xExtrema = true;
		points[0].xStrongExtrema = points[0].xori > points[points.length - 2].xori + 1 && points[0].xori > points[1].xori - 1
			|| points[0].xori < points[points.length - 2].xori + 1 && points[0].xori < points[1].xori - 1;
	}
	for (var j = 1; j < points.length - 1; j++) {
		if (points[j].yori > points[j - 1].yori && points[j].yori >= points[j + 1].yori
			|| points[j].yori < points[j - 1].yori && points[j].yori <= points[j + 1].yori) {
			points[j].yExtrema = true;
			points[j].yStrongExtrema = points[j].yori > points[j - 1].yori + 1 && points[j].yori >= points[j + 1].yori - 1
				|| points[j].yori < points[j - 1].yori + 1 && points[j].yori <= points[j + 1].yori - 1;
		}
		if (points[j].xori > points[j - 1].xori && points[j].xori >= points[j + 1].xori
			|| points[j].xori < points[j - 1].xori && points[j].xori <= points[j + 1].xori) {
			points[j].xExtrema = true;
			points[j].xStrongExtrema = points[j].xori > points[j - 1].xori + 1 && points[j].xori >= points[j + 1].xori - 1
				|| points[j].xori < points[j - 1].xori + 1 && points[j].xori <= points[j + 1].xori - 1;
		}
	};
	var xoris = this.points.map(function (p) { return p.xori });
	var yoris = this.points.map(function (p) { return p.yori });
	this.xmax = Math.max.apply(Math, xoris);
	this.ymax = Math.max.apply(Math, yoris);
	this.xmin = Math.min.apply(Math, xoris);
	this.ymin = Math.min.apply(Math, yoris);
	this.orient();
}
Contour.prototype.orient = function () {
	// Findout PYmin
	var jm = 0, ym = this.points[0].yori
	for (var j = 0; j < this.points.length - 1; j++) if (this.points[j].yori < ym) {
		jm = j; ym = this.points[j].yori;
	}
	var p0 = this.points[(jm ? jm - 1 : this.points.length - 2)], p1 = this.points[jm], p2 = this.points[jm + 1];
	var x = ((p0.xori - p1.xori) * (p2.yori - p1.yori) - (p0.yori - p1.yori) * (p2.xori - p1.xori))
	if (x < 0) this.ccw = true;
	else if (x === 0) this.ccw = p2.xori > p1.xori
}
var inPoly = function (point, vs) {
	// ray-casting algorithm based on
	// http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

	var x = point.xori, y = point.yori;

	var inside = false;
	for (var i = 0, j = vs.length - 2; i < vs.length - 1; j = i++) {
		var xi = vs[i].xori, yi = vs[i].yori;
		var xj = vs[j].xori, yj = vs[j].yori;

		var intersect = ((yi > y) !== (yj > y))
			&& (yj > yi ? (x - xi) * (yj - yi) < (xj - xi) * (y - yi) : (x - xi) * (yj - yi) > (xj - xi) * (y - yi));
		if (intersect) inside = !inside;
	}

	return inside;
};
Contour.prototype.includes = function (that) {
	for (var j = 0; j < that.points.length - 1; j++) {
		if (!inPoly(that.points[j], this.points)) return false
	}
	return true;
}
function Glyph(contours) {
	this.contours = contours || []
	this.stems = []
}
Glyph.prototype.containsPoint = function (x, y) {
	var nCW = 0, nCCW = 0;
	for (var j = 0; j < this.contours.length; j++) {
		if (inPoly({ xori: x, yori: y }, this.contours[j].points)) {
			if (this.contours[j].ccw) nCCW += 1;
			else nCW += 1;
		}
	};
	return nCCW != nCW
}

exports.Glyph = Glyph;
exports.Contour = Contour;
exports.Point = Point;