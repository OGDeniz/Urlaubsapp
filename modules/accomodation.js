export class Accommodation {
    constructor({
        name = "",
        type = "",
        address = "",
        checkIn = "",
        checkOut = "",
        lat = null,
        lng = null,
    } = {}) {
        this.name = name;
        this.type = type;
        this.address = address;
        this.checkIn = checkIn;
        this.checkOut = checkOut;
        this.lat = lat;
        this.lng = lng;
    }

    hasCoordinates() {
        return this.lat !== null && this.lng !== null;
    }
}