"use client";

import { useEffect } from "react";
import "leaflet/dist/leaflet.css";

const Map = () => {
    useEffect(() => {
        // Dynamically import Leaflet to avoid SSR issues
        const L = require("leaflet");

        const map = L.map("map").setView([64.1355, -21.8954], 13);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        L.marker([64.1355, -21.8954]).addTo(map)
            .bindPopup("This is Reykjavík!")
            .openPopup();
    }, []);

    return <div id="map" style={{ height: "500px", width: "100%" }}></div>;
};

export default Map;