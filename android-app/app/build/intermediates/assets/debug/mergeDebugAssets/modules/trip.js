const TRIP_KEY = "ua_current_trip";

export function createDefaultTrip() {
    return {
        id: "trip-1",
        title: "Meine Reise",
        destination: "",
        startDate: "",
        endDate: "",
        departureTime: "",
        accommodation: null,
        flights: [],
        savedPlaces: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
}

export function loadTrip() {
    const raw = localStorage.getItem(TRIP_KEY);
    if (!raw) {
        const trip = createDefaultTrip();
        saveTrip(trip);
        return trip;
    }
    try {
        return JSON.parse(raw);
    } catch {
        const trip = createDefaultTrip();
        saveTrip(trip);
        return trip;
    }
}

export function saveTrip(trip) {
    const updatedTrip = {
        ...trip,
        updatedAt: new Date().toISOString()
    };
    localStorage.setItem(TRIP_KEY, JSON.stringify(updatedTrip));
    return updatedTrip;
}

export function updateTrip(partialData) {
    const currentTrip = loadTrip();
    const updatedTrip = {
        ...currentTrip,
        ...partialData,
        updatedAt: new Date().toISOString()
    };
    saveTrip(updatedTrip);
    return updatedTrip;
}
