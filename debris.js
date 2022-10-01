function drawDebris(){
    fetch("/Nasa_Space_App/data/satellites.json")
    .then(response => response.json())
    .then((json) => {
        var debrisLayer = new WorldWind.RenderableLayer("Debris Layer");
        wwd.addLayer(debrisLayer);
        var time = get_render_time();
        for(let i = 0; i < json.length; i++){
            if(json[i].OBJECT_TYPE=='DEBRIS'){
                var tleLine1 = json[i].TLE_LINE1,
                    tleLine2 = json[i].TLE_LINE2;    

                var satrec = satellite.twoline2satrec(tleLine1, tleLine2);
                var pos = get_iss_pos(satrec, time);
                debrisLayer.addRenderable(new WorldWind.Placemark(
                    new WorldWind.Position(pos[0], pos[1], pos[2])
                ));
            }
        }
    });
}

drawDebris();