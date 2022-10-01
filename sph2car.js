function sph2car(la, long, hei) {
    r = hei + 6371;
    phi = (90 - la) * 360 / (2*Math.PI);
    theta = long * 360 / (2*Math.PI);
    
    x = r*Math.sin(theta)*Math.cos(phi);
    y = r*Math.sin(theta)*Math.sin(phi)
    z = r*Math.cos(theta);

    return {x, y, z, r, phi, theta};
};