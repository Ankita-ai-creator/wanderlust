if (document.getElementById("map")) {
  const map = L.map("map", { scrollWheelZoom: false });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 18,
  }).addTo(map);

  const pinIcon = L.divIcon({
    className: "",
    html: `<div style="
      width: 16px; height: 16px;
      background: #b5601a;
      border: 3px solid #fff;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

  fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(listingLocation)}&format=json&limit=1`)
    .then((res) => res.json())
    .then((data) => {
      if (data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        map.setView([lat, lng], 10);
        L.marker([lat, lng], { icon: pinIcon })
          .addTo(map)
          .bindPopup(`<b>${listingLocation}</b>`)
          .openPopup();
      } else {
        map.setView([20, 0], 2);
      }
    })
    .catch((err) => {
      console.error("Map error:", err);
      map.setView([20, 0], 2);
    });
}