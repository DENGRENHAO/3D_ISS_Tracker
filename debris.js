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
// debrisLayer.enabled = false;
setTimeout(drawDebris(), 1000);



var dangerDebrisAttributes = new WorldWind.PlacemarkAttributes();
dangerDebrisAttributes.imageSource = "/Nasa_Space_App/assets/icons/red_dot.png";
dangerDebrisAttributes.imageScale = 0.5;
var safeDebrisAttributes = new WorldWind.PlacemarkAttributes();
safeDebrisAttributes.imageColor = new WorldWind.Color(1, 1, 1, 1);
safeDebrisAttributes.imageSource = null;
safeDebrisAttributes.imageScale = 1;
var prevMinIdx = -1;
var closestDistance = 0;

function updateDebris(){
    var time = get_render_time();
    var minDistance = Number.MAX_VALUE;
    var minIdx;
    for(let i = 0; i < allDebris.length; i++){
        try {
            var pos = get_iss_pos(allSatrec[i], time);
            allDebris[i].position['latitude'] = pos[0];
            allDebris[i].position['longitude'] = pos[1];
            allDebris[i].position['altitude'] = pos[2];
            var distance = getDistance(colladaLoader.position, allDebris[i].position);
            if(distance < minDistance){
                minDistance = distance;
                minIdx = i;
            }
        }
        catch(err) {
            // console.log(err, i);
        }
    }
    if(prevMinIdx != -1){
        debrisLayer.removeRenderable(allDebris[prevMinIdx]);
        var pos = get_iss_pos(allSatrec[prevMinIdx], time);
        var debris = new WorldWind.Placemark(
            new WorldWind.Position(pos[0], pos[1], pos[2])
        );
        debrisLayer.addRenderable(debris);
        allDebris[prevMinIdx] = debris;
    }
    else{
        allDebris[minIdx]["attributes"] = dangerDebrisAttributes;
    }
    allDebris[minIdx]["attributes"] = dangerDebrisAttributes;
    prevMinIdx = minIdx;
    modelLayer.refresh();
    wwd.redraw();
    closestDistance = minDistance;
}

setInterval(updateDebris, 3000);

function toggleDebris(){
    debrisLayer.enabled = !debrisLayer.enabled;
}

function getDistance(pos1, pos2){
    var carPos1 = sph2car(pos1['latitude'], pos1['longitude'], pos1['altitude'] / 1000);
    var carPos2 = sph2car(pos2['latitude'], pos2['longitude'], pos2['altitude'] / 1000);
    var distance = Math.sqrt(Math.pow((carPos1['x']-carPos2['x']), 2) + Math.pow((carPos1['y']-carPos2['y']), 2) + Math.pow((carPos1['z']-carPos2['z']), 2));
    return distance;
}


function getClosestDistance(){
    return closestDistance;
}