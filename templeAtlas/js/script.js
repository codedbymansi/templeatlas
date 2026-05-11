var allMarkers = [];
var allTemples = [];

// Create map
var map = L.map('map').setView([22.5937, 78.9629], 5);

// Get temple ID from URL
function getTempleFromURL(){
const params = new URLSearchParams(window.location.search);
return params.get("temple");
}

// Map tiles
L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
attribution: '© OpenStreetMap'
}).addTo(map);

// Animated temple marker
var templeIcon = L.divIcon({
className: "pulse-marker",
iconSize: [16,16]
});

// Load temples from JSON
fetch('data/temples.json')
.then(response => response.json())
.then(temples => {
    allTemples = temples;

    // 1. Create Markers First
    temples.forEach(temple => {
        var markerColor = temple.marker_color || '#A33A3A';
        var templeIcon = L.divIcon({
            className: "custom-pulse-container",
            html: `<div class="pulse-marker" style="background-color: ${markerColor}"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });

        var marker = L.marker([temple.lat, temple.lng], { icon: templeIcon }).addTo(map);

        marker.bindPopup(`
            <div style="text-align:center;max-width:240px">
                <h3>${temple.name}</h3>
                <img src="${temple.image}" class="popup-img" onerror="this.src='images/fallback.jpg'">
                <p style="font-size:14px">${temple.description}</p>
                <a href="temple.html?id=${temple.id}" class="explore-btn">View Details</a>
            </div>
        `);

        allMarkers.push({ marker: marker, data: temple });
    });

    // 2. NOW call the functions to fill the UI
    populateSidebar(temples);
    setupHiddenGems(temples);

    // 3. Handle URL params if any
    let selectedId = getTempleFromURL();
    if(selectedId) {
        const found = allMarkers.find(m => m.data.id === selectedId);
        if(found) {
            map.flyTo([found.data.lat, found.data.lng], 10);
            found.marker.openPopup();
        }
    }
});

// MOVE THESE FUNCTIONS TO THE VERY BOTTOM OF YOUR JS FILE
function populateSidebar(temples) {
    const sidebar = document.getElementById('templeListSidebar');
    if (!sidebar) return;
    sidebar.innerHTML = "";
    temples.forEach(t => {
        let div = document.createElement('div');
        div.className = 'sidebar-item';
        div.innerHTML = `<strong>${t.name}</strong> <small>(${t.state})</small>`;
        div.onclick = () => {
            map.flyTo([t.lat, t.lng], 12);
            const target = allMarkers.find(m => m.data.id === t.id);
            if(target) target.marker.openPopup();
        };
        sidebar.appendChild(div);
    });
}

function setupHiddenGems(temples) {
    const gemsContainer = document.getElementById("gemsList");
    if (!gemsContainer) return;
    gemsContainer.innerHTML = "";
    const randomTemples = [...temples].sort(() => 0.5 - Math.random()).slice(0, 3);

    randomTemples.forEach(t => {
        const gemCard = document.createElement("div");
        gemCard.className = "gem-card";
        gemCard.innerHTML = `
            <img src="${t.image}" onerror="this.src='images/fallback.jpg'">
            <h4>${t.name}</h4>
            <p>${t.state}</p>`;
        gemCard.onclick = () => {
            map.flyTo([t.lat, t.lng], 12);
            const target = allMarkers.find(m => m.data.id === t.id);
            if(target) target.marker.openPopup();
        };
        gemsContainer.appendChild(gemCard);
    });
}
// Inside your temples.forEach loop, after markers are created:
function setupHiddenGems(temples) {
    const gemsContainer = document.getElementById("gemsList");
    // Pick 10 random temples
    const randomTemples = temples.sort(() => 0.5 - Math.random()).slice(0, 10);

    randomTemples.forEach(t => {
        const gemCard = document.createElement("div");
        gemCard.className = "gem-card";
        gemCard.innerHTML = `
            <img src="${t.image}" onerror="this.src='images/fallback.jpg'">
            <h4>${t.name}</h4>
            <p>${t.state}</p>
        `;
        gemCard.onclick = () => {
            map.flyTo([t.lat, t.lng], 12);
            // Find the specific marker and open it
            const target = allMarkers.find(m => m.data.id === t.id);
            if(target) target.marker.openPopup();
        };
        gemsContainer.appendChild(gemCard);
    });
}


// Define the coordinates for the Char Dham
var charDhamRoute = [
    [30.7352, 79.0669],  // Kedarnath
    [30.7433, 79.4938],  // Badrinath
    [31.0140, 78.4600],  // Yamunotri
    [30.9947, 78.9398]   // Gangotri
];

// 1. Create a "Sacred Path" using AntPath for animation (looks much better!)
var path = L.polyline.antPath(charDhamRoute, {
    "delay": 800,
    "dashArray": [10, 20],
    "weight": 5,
    "color": "#D4AF37", // Gold
    "pulseColor": "#FFFFFF",
    "paused": false,
    "reverse": false
}).addTo(map);

// 2. Add special markers for the route points so they stand out
charDhamRoute.forEach(coords => {
    L.circleMarker(coords, {
        radius: 10,
        fillColor: "#ff6600",
        color: "#fff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
    }).addTo(map);
});

// 3. Auto-zoom to show the whole route
map.fitBounds(path.getBounds(), { padding: [50, 50] });

// Sacred route line
var routeLine = L.polyline(charDhamRoute,{
color:'#D4AF37',
weight:5,
opacity:0.9
}).addTo(map);

routeLine.bindPopup("Sacred Char Dham Pilgrimage Route");

// Highlight temples on route
charDhamRoute.forEach(coords => {

L.circleMarker(coords,{
radius:8,
color:'#A33A3A',
fillColor:'#D4AF37',
fillOpacity:0.9
}).addTo(map);

});

function newFunction() {
    setupHiddenGems(temples);
}

// Filter temples by state
function filterByState() {
    const selectedState = document.getElementById("stateFilter").value;

    allMarkers.forEach(item => {
        // If "All of India" is selected, or the temple state matches the selection
        if (selectedState === "" || item.data.state === selectedState) {
            item.marker.addTo(map);
        } else {
            map.removeLayer(item.marker);
        }
    });
    
    // Zoom out to show all filtered markers
    map.setView([22.5937, 78.9629], 5);
}

//Search temple
function searchTemple() {
    var input = document.getElementById("searchInput").value.toLowerCase();
    
    // Clear search if empty
    if (input === "") {
        allMarkers.forEach(item => item.marker.addTo(map));
        return;
    }

    // Find the best match
    var found = allMarkers.find(item => 
        item.data.name.toLowerCase().includes(input) || 
        item.data.city.toLowerCase().includes(input)
    );

    if (found) {
        // Show only the searched marker
        allMarkers.forEach(item => {
            if(item.data.id === found.data.id) {
                item.marker.addTo(map);
            } else {
                map.removeLayer(item.marker);
            }
        });

        // "Fly" to the temple smoothly
        map.flyTo(found.marker.getLatLng(), 10, {
            animate: true,
            duration: 2.0 
        });

        found.marker.openPopup();
    } else {
        alert("Temple not found. Please try another name.");
    }
}

// Discover random temple
function discoverTemple() {
    if (allMarkers.length === 0) return;

    var randomIndex = Math.floor(Math.random() * allMarkers.length);
    var temple = allMarkers[randomIndex];

    // Reset visibility so the user can see it
    allMarkers.forEach(item => item.marker.addTo(map));

    // Smooth "FlyTo"
    map.flyTo(temple.marker.getLatLng(), 12, {
        animate: true,
        duration: 3
    });

    // Automatically open the popup so they see the name immediately
    temple.marker.openPopup();
    
    // Add a little text alert or UI update
    console.log("Discovered: " + temple.data.name);
}

// Dark mode toggle
function toggleDarkMode(){
document.body.classList.toggle("dark-mode");
}

//pilgrimage route toggle
function showCharDham() {
    // Smoothly fly to the Himalayas to see the route
    map.flyTo([30.7352, 79.0669], 8);
    
    // Pulse the line or open a popup
    routeLine.bindPopup("This is the sacred Char Dham Yatra path.").openPopup();
}

function getTempleFromURL(){
    const params = new URLSearchParams(window.location.search);
    // Ensure this matches the key used in your <a> tag in temple.html
    return params.get("temple") || params.get("id"); 
}
