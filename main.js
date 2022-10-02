// event listeners
window.addEventListener("load", eventWindowLoaded, false);
window.addEventListener("dblclick", focusISS);

// Create a WorldWindow for the canvas.
var wwd = new WorldWind.WorldWindow("canvas");
var modelLayer = new WorldWind.RenderableLayer();

// Define the event listener to initialize Web WorldWind.
var text;
var defaultDate;
var gtextLayer;
function eventWindowLoaded() {
    timeline_init();

    var starFieldLayer = new WorldWind.StarFieldLayer();
    var atmosphereLayer = new WorldWind.AtmosphereLayer();
    var now = new Date();
    starFieldLayer.time = now;
    atmosphereLayer.time = now;
    // info
    var offset;
    var textLayer = new WorldWind.RenderableLayer("information");
    offset = new WorldWind.Offset(WorldWind.OFFSET_FRACTION, 0, WorldWind.OFFSET_FRACTION, 0.2);
    text = new WorldWind.ScreenText(offset, "Loading...");
    text.attributes.offset = new WorldWind.Offset(WorldWind.OFFSET_FRACTION, 0, WorldWind.OFFSET_FRACTION, 0);
    textLayer.addRenderable(text);
    gtextLayer = new WorldWind.RenderableLayer("Ground Stations");
    axios.get("data/groundstations.json")
        .then(function(res) {
        var gtext;
        var stations = res.data;
        for (var i = 0; i < stations.length; i++) {
            var station = stations[i];
            var station_pos = new WorldWind.Position(station["LATITUDE"], station["LONGITUDE"], station["ALTITUDE"]);
            gtext = new WorldWind.GeographicText(station_pos, station["NAME"]);
            gtextLayer.addRenderable(gtext);
        }
    });
    
    var layers = [
        // Imagery layers.
        {layer: new WorldWind.BMNGLayer(), enabled: true},
        {layer: new WorldWind.BMNGLandsatLayer(), enabled: false},
        {layer: new WorldWind.BingAerialLayer(null), enabled: true},
        {layer: new WorldWind.BingAerialWithLabelsLayer(null), enabled: true},
        {layer: new WorldWind.BingRoadsLayer(null), enabled: false},
        {layer: new WorldWind.OpenStreetMapImageLayer(null), enabled: false},
        {layer: starFieldLayer, enabled: true},
        // Add atmosphere layer on top of all base layers.
        {layer: atmosphereLayer, enabled: true},
        // WorldWindow UI layers.
        {layer: textLayer, enabled: true},
        {layer: gtextLayer, enabled: true},
        {layer: new WorldWind.CompassLayer(), enabled: true},
        {layer: new WorldWind.CoordinatesDisplayLayer(wwd), enabled: true},
        {layer: new WorldWind.ViewControlsLayer(wwd), enabled: true}
    ];

    for (let i = 0; i < layers.length; i++) {
        layers[i].layer.enabled = layers[i].enabled;
        wwd.addLayer(layers[i].layer);
    }

    wwd.addLayer(modelLayer);

    // set default date (today)
    var now_date = new Date();
    defaultDate = now_date.toISOString().split('T')[0];
    document.getElementById("date-input").defaultValue = defaultDate;
    // console.log(document.getElementById("date-input").value);
}

var satrec;
// fetch ISS data
axios.get("https://live.ariss.org/iss.txt")
    .then((res) => {
    //console.log(res.data);
    lines = res.data.split(/\r?\n/);
    
    var tleLine1 = lines[1],
        tleLine2 = lines[2];    

    satrec = satellite.twoline2satrec(tleLine1, tleLine2);
    })
    .then(() => {
        updateISS();
        setInterval(updateISS, 1000);
        focusISS();
    });

function toDateTime(secs) {
    return new Date(secs * 1000); // Epoch
}

function get_current_date() {
    var input_date = document.getElementById("date-input");
    var parsed = Date.parse(input_date.value);
    var parsed_defaultDate = Date.parse(defaultDate);
    // console.log(parsed, parsed_defaultDate, parsed - parsed_defaultDate);
    return parsed - parsed_defaultDate;
}

function get_current_time() {
    return Math.round((get_current_date() + Date.now()) / 1000);
}

function get_render_time() {
    return get_current_time() + get_user_time();
}
