function getDayOfYear(date = new Date()) {
    const timestamp1 = Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
    );
    const timestamp2 = Date.UTC(date.getFullYear(), 0, 0);

    const differenceInMilliseconds = timestamp1 - timestamp2;

    const differenceInDays = differenceInMilliseconds / 1000 / 60 / 60 / 24;

    return differenceInDays;
}

// from https://spotthestation.nasa.gov/tracking_map.cfm
function calculateSunPosition(time) {
    var MAR21 = (31 + 28.25 + 21) * 1.0;
    var Days = getDayOfYear(time);
    var DayPart = Days - Math.floor(Days); 
    var SunLon = Math.PI * (1 - 2 * DayPart);
    var SunLat = (23.5 * Math.PI / 180) * Math.sin(Math.PI * 2 / 365.25 * (Days - MAR21));
    var SunLonDeg = SunLon * 180.0 / Math.PI;
    var SunLatDeg = SunLat * 180.0 / Math.PI;

    return [SunLatDeg, SunLonDeg];
}