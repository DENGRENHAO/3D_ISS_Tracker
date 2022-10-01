// event listeners
window.addEventListener("load", eventWindowLoaded, false);
window.addEventListener("dblclick", focusISS);

// Create a WorldWindow for the canvas.
var wwd = new WorldWind.WorldWindow("canvas");
var modelLayer = new WorldWind.RenderableLayer();

// Define the event listener to initialize Web WorldWind.
var text;
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
    offset = new WorldWind.Offset(WorldWind.OFFSET_FRACTION, 0.2, WorldWind.OFFSET_FRACTION, 0);
    text = new WorldWind.ScreenText(offset, "Loading...");
    text.attributes.offset = new WorldWind.Offset(WorldWind.OFFSET_FRACTION, 0.5, WorldWind.OFFSET_FRACTION, 0.1);
    textLayer.addRenderable(text);
    
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
        {layer: new WorldWind.CompassLayer(), enabled: true},
        {layer: new WorldWind.CoordinatesDisplayLayer(wwd), enabled: true},
        {layer: new WorldWind.ViewControlsLayer(wwd), enabled: true}
    ];

    for (let i = 0; i < layers.length; i++) {
        layers[i].layer.enabled = layers[i].enabled;
        wwd.addLayer(layers[i].layer);
    }

    wwd.addLayer(modelLayer);
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

function get_current_time() {
    return Math.round(Date.now() / 1000)
}

function get_render_time() {
    return get_current_time() + get_user_time();
}
