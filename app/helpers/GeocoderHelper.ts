import {Location} from "../models/Location";

const geocoder = require("geocoder");

export class GeocoderHelper {
    public static resolveLocationByName(locationName: string): Promise<Location> {
        return new Promise((resolve, reject) => {
            geocoder.geocode(locationName, (err, data) => {
                if (err || data.status === "ZERO_RESULTS") {
                    throw new Error("Location not found");
                }

                let location = new Location();
                location.latitude = data.results[0].geometry.location.lat;
                location.longitude = data.results[0].geometry.location.lng;
                location.name = locationName;

                resolve(location);
            });

        });
    };

    public static resolveLocationByCoordinates(latitude: number, longitude: number): Promise<Location> {
        return new Promise((resolve, reject) => {

            geocoder.reverseGeocode(latitude, longitude, (err, data) => {
                if (err || data.status === "ZERO_RESULTS") {
                    throw new Error("Location not found");
                }

                let location = new Location();
                location.latitude = longitude;
                location.longitude = longitude;
                location.name = data.results[0].formatted_address;

                resolve(location);
            });

        });
    }
}
