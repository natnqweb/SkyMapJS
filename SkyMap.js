class DateTime {
    constructor(year, month, day, time) {
        this.year = year;
        this.month = month;
        this.day = day;
        this.time = time;
    }
}
class SearchResult {

    // constructor
    constructor(az, alt) {
        this.az = (az);
        this.alt = (alt);
    }

    // setters and getters
    get_azimuth() {
        return this.az;
    }
    get_altitude() {
        return this.alt;
    }
    set_azimuth(az) {
        this.az = az;
    }
    set_altitude(alt) {
        this.alt = alt;
    }
}
class CelestialObject {

    constructor(ra, dec) {
        this.ra = ra;
        this.dec = dec;
    }
}
class ObserverPosition {

    constructor(lattitude, longitude) {
        this.lattitude = lattitude;
        this.longitude = longitude;
    }
}
class Planet extends CelestialObject {
    constructor(ra, dec) {
        super(ra, dec);
    }
}
class SkyMap {
    constructor(celestial_object, your_location, datetime) {
        this.celestial_object = celestial_object;
        this.your_location = your_location;
        this.datetime = datetime;
    }

    set_datetime(datetime) {
        this.datetime = datetime;
    }
    set_location(location) {
        this.your_location = location;
    }
    set_celestial_object(obj) {
        this.celestial_object = obj;
    }
    calculate_j2000(Y, M, D, TIME) {
        let JD = (367.00 * Y - Math.floor(7.00 * (Y + Math.floor((M + 9.00) / 12.00)) / 4.00)
            - Math.floor(3.00 * (Math.floor((Y + (M - 9) / 7.00) / 100.00) + 1.00) / 4.00) + Math.floor(275.00 * M / 9.00) + D + 1721028.50 + TIME / 24.00);

        return JD - 2451545.00;
    }
    rad2deg(value) {
        return value * 180.00 / 3.14159265358979;
    }
    deg2rad(value) {
        return value * 3.14159265358979 / 180.00;
    }
    deg2h(value) {
        return value / 15.00;
    }
    h2deg(value) {
        return value * 15.00;
    }
    asind(value) {
        return Math.asin(rad2deg(value));
    }
    acosd(value) {
        return Math.acos(rad2deg(value));
    }
    calculate_local_sidereal_time(j2000, time, longitude) {
        let lst = 100.46 + 0.985647 * j2000 + longitude + 15.00 * time;
        if (lst < 0.00) {
            lst += 360.00;
        }
        else if (lst > 360.00) {
            lst -= 360.00;
        }
        return lst;
    }
    calculate_hour_angle(lst, ra) {
        let ha = lst - ra;
        if (ha < 0.00) {
            ha += 360.00;
        }
        else if (ha > 360.00) {
            ha -= 360.00;
        }
        return ha;
    }
    calculate_az_alt(ha, dec, lat) {
        /*  math behind calculations -- conversion from HA and DEC to alt and  az
        sin(alt) = sin(DEC) * sin(LAT) + cos(DEC) * cos(LAT) * cos(HA)
        alt = asin(alt)
                   sin(DEC) - sin(alt) * sin(LAT)
        cos(a) = ---------------------------------
                        cos(alt) * cos(LAT)
        a = acos(a)
        If sin(HA) is negative,then az = a, otherwise az = 360 - a */

        let sin_dec = Math.sin(this.deg2rad(dec));
        let sin_ha = Math.sin(this.deg2rad(ha));
        let sin_lat = Math.sin(this.deg2rad(lat));
        let cos_dec = Math.cos(this.deg2rad(dec));
        let cos_ha = Math.cos(this.deg2rad(ha));
        let cos_lat = Math.cos(this.deg2rad(lat));
        let sin_alt = (sin_dec * sin_lat) + (cos_dec * cos_lat * cos_ha);
        let alt = Math.asin(sin_alt);
        let cos_alt = Math.cos(alt);
        let cos_a = (sin_dec - sin_alt * sin_lat) / (cos_alt * cos_lat);
        let a = Math.acos(cos_a);
        a = this.rad2deg(a);
        alt = this.rad2deg(alt);

        let _az = 0.00;
        if (sin_ha > 0.00) {
            _az = 360.00 - a;
        }
        else {
            _az = a;
        }
        let result = new SearchResult(_az, alt);

        return result;
    }

    calculate_j2000(datetime) {
        let jd = 367.00 * datetime.year
            - Math.floor(
                7.00 * (datetime.year + Math.floor((datetime.month + 9.00) / 12.00)) / 4.00
            )
            - Math.floor(
                3.00 * (Math.floor((datetime.year + (datetime.month - 9.00) / 7.00) / 100.00)
                    + 1.00)
                / 4.00
            )
            + Math.floor(275.00 * datetime.month / 9.00)
            + datetime.day
            + 1721028.5
            + datetime.time / 24.00;
        return jd - 2451545.00;
    }
    calculate() {
        let j2000 = this.calculate_j2000(this.datetime);
        let lst = this.calculate_local_sidereal_time(
            j2000,
            this.datetime.time,
            this.your_location.longitude
        );

        let ha = this.calculate_hour_angle(lst, this.celestial_object.ra);
        return this.calculate_az_alt(ha, this.celestial_object.dec, this.your_location.lattitude);
    }
    get_datetime() {
        return this.datetime;
    }
}
//Example Los Angeles -> Sirius
let sirius = new CelestialObject(101.52, -16.7424);
let observer = new ObserverPosition(34.05, -118.24358);
let datetime = new DateTime(2021.00, 9.00, 4.00, 20.2);
let skymap = new SkyMap(sirius, observer, datetime);
console.log(skymap.calculate());