// ISS 3D model
var config = {dirPath: '/Nasa_Space_App/3D-model/'};
var cur_iss_position = [0, 0, 0];
var colladaLoader = new WorldWind.ColladaLoader(
    new WorldWind.Position(cur_iss_position[0], cur_iss_position[1], cur_iss_position[2] * 1000),
    config
    );

var model;
colladaLoader.load("textured.dae", function (colladaModel) {
	model = colladaModel;
    colladaModel.scale = 140000;
	colladaModel.xRotation = 20000;
    modelLayer.addRenderable(colladaModel);
});

let roundDecimal = function (val, precision) {
          return Math.round(Math.round(val * Math.pow(10, (precision || 0) + 1)) / 10) / Math.pow(10, (precision || 0));
}
const issRouteSec = 6000;

function focusISS() {
    wwd.goToAnimator.animationFrequency = 10;
    wwd.goTo(new WorldWind.Location(cur_iss_position[0], cur_iss_position[1]));
}

function get_iss_pos(satrec, time) {
    time = toDateTime(time);
    //  Propagate satellite using JavaScript Date
    var positionAndVelocity = satellite.propagate(satrec, time);

    // The position_velocity result is a key-value pair of ECI coordinates.
    // These are the base results from which all other coordinates are derived.
    var positionEci = positionAndVelocity.position,
        velocityEci = positionAndVelocity.velocity;

    // You will need GMST for some of the coordinate transforms.
    // http://en.wikipedia.org/wiki/Sidereal_time#Definition
    var gmst = satellite.gstime(time);
    var positionGd    = satellite.eciToGeodetic(positionEci, gmst);
    // Geodetic coords are accessed via `longitude`, `latitude`, `height`.
    var longitude = positionGd.longitude,
        latitude  = positionGd.latitude,
        height    = positionGd.height;

    var a = 57.2957795;
    return [latitude * a, longitude * a, height * 1000, velocityEci];
}

function get_calotta(isspos) {
    const re = 6371.0;
    const R = isspos[2] / 1000 + re;
    // const perimeter = re * 2000 * Math.PI;
    const fake_la = Math.acos(re / R);

    return re * 1000 * fake_la; // perimeter * fake_la / (Math.Pi * 2)
}

function get_route(time) {
    var positions = [];
    var t = time - issRouteSec/2;
    for (var i = 0; i < issRouteSec; i+=250) {
        var pos = get_iss_pos(satrec, t + i);
        positions.push(new WorldWind.Position(pos[0], pos[1], pos[2]));
    }

    return positions;
}

var issRouteAttributes = new WorldWind.ShapeAttributes();
issRouteAttributes.outlineColor = new WorldWind.Color(0, 1, 0, 1);
issRouteAttributes.interiorColor = new WorldWind.Color(0, 0, 1, 0);
var prevIssRoute;
var prevCalotta;

function draw_route(time) {
    if (prevIssRoute) {
        modelLayer.removeRenderable(prevIssRoute);
    }
    
    var issRoute = new WorldWind.Path(get_route(time), issRouteAttributes);
    issRoute.extrude = true;
    modelLayer.addRenderable(issRoute);
    // modelLayer.refresh();
    // wwd.redraw();

    prevIssRoute = issRoute;
}

function draw_calotta(isspos) {
    var attributes = new WorldWind.ShapeAttributes(null);
        attributes.outlineColor = WorldWind.Color.YELLOW;
        attributes.interiorColor = new WorldWind.Color(0, 1, 1, 0.2);
    if (prevCalotta) {
        modelLayer.removeRenderable(prevCalotta);
    }
    
    var curCalotta = new WorldWind.SurfaceCircle(new WorldWind.Location(isspos[0], isspos[1]), get_calotta(isspos), attributes);
    modelLayer.addRenderable(curCalotta);
    // modelLayer.refresh();
    // wwd.redraw();

    prevCalotta = curCalotta;
}

// calculate ISS position every second
var la_diff = 0, long_diff = 0;
function draw_ISS(pos) {
    cur_iss_position = pos;
    colladaLoader.position['latitude'] = pos[0];
    colladaLoader.position['longitude'] = pos[1];
    colladaLoader.position['altitude'] = pos[2];

	var sun_pos = SunPosition.getAsGeographicLocation(new Date());
    if (model) {
    	model.xRotation = -10000/90*la_diff/180;
	    model.yRotation = -10000/90*long_diff/180;

    	la_diff = pos[0] - sun_pos.latitude;
	    long_diff = pos[1] - sun_pos.longitude;

    	model.xRotation = 10000/90*la_diff/180;
	    model.yRotation = 10000/90*long_diff/360;
    }

    // Sphere coor. to Cartesian coor.
    // console.log("coor: ", sph2car(pos[0], pos[1], pos[2]));

    // modelLayer.refresh();
    // wwd.redraw();
};

function updateISS() {
    var time = get_render_time();
    var pos = get_iss_pos(satrec, time);
    draw_ISS(pos);
    draw_route(time);
    draw_calotta(pos);
    // redraw
    modelLayer.refresh();
    wwd.redraw();
}

function updateInfo() {
    var time = get_render_time();
    var pos = get_iss_pos(satrec, time);
    var velocity = Math.sqrt(pos[3]['x'] * pos[3]['x'] + pos[3]['y'] * pos[3]['y'] + pos[3]['z'] * pos[3]['z']);
    var lo = roundDecimal(pos[1], 4);
    var la = roundDecimal(pos[0], 4);
    var info = `
        Longtitude: ${Math.abs(lo)}${lo > 0 ? "°E" : "°W"}
        Latitude: ${Math.abs(la)}${la > 0 ? "°N" : "°S"}
        Altitude: ${roundDecimal(pos[2] / 1000, 4)}km
        Velocity: ${roundDecimal(velocity, 4)}km/s
        Time (UTC): ${toDateTime(get_render_time()).toISOString().substring(0, 19).replace('T', ' ')}
        Closest Debris Distance: ${Math.round(getClosestDistance())}km
        `
    text.text = info;
}