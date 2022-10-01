var allDebris = [];
var allSatrec = [];

function drawDebris(time){
    fetch("/Nasa_Space_App/data/satellites.json")
    .then(response => response.json())
    .then((json) => {
        if(allDebris.length==0){
            for(let i = 0; i < json.length; i++){
                if(json[i].OBJECT_TYPE=='DEBRIS'){
                    var tleLine1 = json[i].TLE_LINE1,
                        tleLine2 = json[i].TLE_LINE2;    
    
                    var satrec = satellite.twoline2satrec(tleLine1, tleLine2);
                    allSatrec.push(satrec);
                    var pos = get_iss_pos(satrec, time);
                    var debris = new WorldWind.Placemark(
                        new WorldWind.Position(pos[0], pos[1], pos[2])
                    );
                    debrisLayer.addRenderable(debris);
                    allDebris.push(debris);
                }
            }
        }
    });
}

var time = get_render_time();
var debrisLayer = new WorldWind.RenderableLayer("Debris Layer");
wwd.addLayer(debrisLayer);
setTimeout(drawDebris(), 1000);

function updateDebris(){
    var time = get_render_time();
    for(let i = 0; i < allDebris.length; i++){
        var pos = get_iss_pos(allSatrec[i], time)
        allDebris[i].position['latitude'] = pos[0];
        allDebris[i].position['longitude'] = pos[1];
        allDebris[i].position['altitude'] = pos[2];
        modelLayer.refresh();
        wwd.redraw();
    }
}

setInterval(updateDebris, 3000);

function toggleDebris(){
    debrisLayer.enabled = !debrisLayer.enabled;
}