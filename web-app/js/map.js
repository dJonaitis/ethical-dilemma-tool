/*
    Map Module
    Contains all code handling map setup, loading of GeoJSON, rendering countries,
    drawing cities, arcs, and visual effects such as scanlines and flickers.
*/

document.addEventListener('DOMContentLoaded', function() {
    // Map setup
    const svg = d3.select("#map");
    const width = +svg.attr("width");
    const height = +svg.attr("height");
    const projection = d3.geoMercator().scale(250).translate([width / 2, height / 2]);
    const path = d3.geoPath().projection(projection);
    
    // Create a group for all map elements
    const mapGroup = svg.append("g");
    
    // Create a group for cities and arcs
    const citiesGroup = mapGroup.append("g").attr("class", "cities-layer");
    const arcsGroup = mapGroup.append("g").attr("class", "arcs-layer");
    
    // Track loaded layers
    let loadedLayers = 0;
    const layerCountElement = document.getElementById('layer-count');
    
    // Possible paths to try for GeoJSON (in order of preference)
    const possiblePaths = [
        "./1981-v1.1/geojson/Admin_0_polygons.geojson",
        "1981-v1.1/geojson/Admin_0_polygons.geojson",
        "./1981-v1.1/geojson/admin_0_polygons.geojson", // Try lowercase filename
        "1981-v1.1/geojson/admin_0_polygons.geojson",   // Try lowercase filename
        "../1981-v1.1/geojson/Admin_0_polygons.geojson",
        "/1981-v1.1/geojson/Admin_0_polygons.geojson"
    ];
    
    // Array of major cities with their coordinates
    const cities = [
        { name: "NEW YORK", lat: 40.7128, lon: -74.0060 },
        { name: "LONDON", lat: 51.5074, lon: -0.1278 },
        { name: "TOKYO", lat: 35.6762, lon: 139.6503 },
        { name: "BEIJING", lat: 39.9042, lon: 116.4074 },
        { name: "MOSCOW", lat: 55.7558, lon: 37.6173 },
        { name: "PARIS", lat: 48.8566, lon: 2.3522 },
        { name: "BERLIN", lat: 52.5200, lon: 13.4050 },
        { name: "CAIRO", lat: 30.0444, lon: 31.2357 },
        { name: "SYDNEY", lat: -33.8688, lon: 151.2093 },
        { name: "RIO DE JANEIRO", lat: -22.9068, lon: -43.1729 },
        { name: "MUMBAI", lat: 19.0760, lon: 72.8777 },
        { name: "DUBAI", lat: 25.2048, lon: 55.2708 }
    ];
    
    // Fallback GeoJSON data (simplified world map with just a few countries)
    const fallbackGeoJSON = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {"NAME": "United States", "CONTINENT": "North America"},
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[[-125, 25], [-125, 49], [-66, 49], [-66, 25], [-125, 25]]]
                }
            },
            {
                "type": "Feature",
                "properties": {"NAME": "Canada", "CONTINENT": "North America"},
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[[-140, 49], [-140, 70], [-60, 70], [-60, 49], [-140, 49]]]
                }
            },
            {
                "type": "Feature",
                "properties": {"NAME": "Mexico", "CONTINENT": "North America"},
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[[-120, 15], [-120, 32], [-85, 32], [-85, 15], [-120, 15]]]
                }
            },
            {
                "type": "Feature",
                "properties": {"NAME": "Brazil", "CONTINENT": "South America"},
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[[-75, -35], [-75, 5], [-35, 5], [-35, -35], [-75, -35]]]
                }
            },
            {
                "type": "Feature",
                "properties": {"NAME": "Western Europe", "CONTINENT": "Europe"},
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[[-10, 35], [-10, 60], [20, 60], [20, 35], [-10, 35]]]
                }
            },
            {
                "type": "Feature",
                "properties": {"NAME": "Eastern Europe", "CONTINENT": "Europe"},
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[[20, 35], [20, 60], [40, 60], [40, 35], [20, 35]]]
                }
            },
            {
                "type": "Feature",
                "properties": {"NAME": "Russia", "CONTINENT": "Asia"},
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[[40, 50], [40, 70], [180, 70], [180, 50], [40, 50]]]
                }
            },
            {
                "type": "Feature",
                "properties": {"NAME": "China", "CONTINENT": "Asia"},
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[[75, 20], [75, 45], [135, 45], [135, 20], [75, 20]]]
                }
            },
            {
                "type": "Feature",
                "properties": {"NAME": "India", "CONTINENT": "Asia"},
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[[70, 5], [70, 30], [90, 30], [90, 5], [70, 5]]]
                }
            },
            {
                "type": "Feature",
                "properties": {"NAME": "Australia", "CONTINENT": "Oceania"},
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[[115, -40], [115, -10], [155, -10], [155, -40], [115, -40]]]
                }
            },
            {
                "type": "Feature",
                "properties": {"NAME": "Africa", "CONTINENT": "Africa"},
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[[-20, -35], [-20, 35], [50, 35], [50, -35], [-20, -35]]]
                }
            },
            {
                "type": "Feature",
                "properties": {"NAME": "Japan", "CONTINENT": "Asia"},
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[[130, 30], [130, 45], [145, 45], [145, 30], [130, 30]]]
                }
            }
        ]
    };
    
    // Try loading GeoJSON from multiple possible locations
    function loadCountriesLayer() {
        const loadingIndicator = document.querySelector('.loading-indicator');
        loadingIndicator.textContent = "ATTEMPTING TO LOAD MAP DATA...";
        
        // Update status panel
        const statusPanel = document.querySelector('.status-panel .terminal-text');
        if (statusPanel) {
            const statusLine = document.createElement('div');
            statusLine.className = 'terminal-line';
            statusLine.textContent = `SEARCHING FOR GeoJSON FILES...`;
            statusPanel.appendChild(statusLine);
        }
        
        // Create layer group
        const countriesGroup = mapGroup.append("g").attr("class", "admin_0_polygons-layer");
        
        // Try each possible path in sequence
        tryNextPath(0, countriesGroup);
    }
    
    // Try loading from each path in sequence
    function tryNextPath(index, countriesGroup) {
        // If we've tried all paths, use the fallback
        if (index >= possiblePaths.length) {
            console.log("All paths failed, using fallback data");
            loadFallbackData(countriesGroup);
            return;
        }
        
        const filePath = possiblePaths[index];
        console.log(`Attempting to load: ${filePath}`);
        
        // Update status in UI
        const statusPanel = document.querySelector('.status-panel .terminal-text');
        if (statusPanel) {
            const statusLine = document.createElement('div');
            statusLine.className = 'terminal-line';
            statusLine.textContent = `TRYING: ${filePath}`;
            statusPanel.appendChild(statusLine);
        }
        
        // Use a timeout to handle fetch failures more gracefully
        const fetchTimeout = setTimeout(() => {
            console.warn(`Timeout loading ${filePath}, trying next path`);
            tryNextPath(index + 1, countriesGroup);
        }, 2000); // 2 second timeout
        
        // Try to load the file
        d3.json(filePath)
            .then(function(data) {
                clearTimeout(fetchTimeout); // Clear the timeout
                
                if (!data || !data.features || !Array.isArray(data.features)) {
                    console.error(`Invalid data structure in GeoJSON`);
                    tryNextPath(index + 1, countriesGroup);
                    return;
                }
                
                console.log(`Successfully loaded: ${filePath}`);
                renderCountriesLayer(data, countriesGroup);
            })
            .catch(function(error) {
                clearTimeout(fetchTimeout); // Clear the timeout
                console.error(`Error loading ${filePath}:`, error);
                tryNextPath(index + 1, countriesGroup);
            });
    }
    
    // Fall back to using the embedded GeoJSON data
    function loadFallbackData(countriesGroup) {
        console.log("Loading fallback map data");
        
        // Update status
        const statusPanel = document.querySelector('.status-panel .terminal-text');
        if (statusPanel) {
            const statusLine = document.createElement('div');
            statusLine.className = 'terminal-line error-line';
            statusLine.textContent = `USING FALLBACK MAP DATA`;
            statusPanel.appendChild(statusLine);
            
            const reasonLine = document.createElement('div');
            reasonLine.className = 'terminal-line';
            reasonLine.textContent = `REASON: GeoJSON FILES NOT FOUND`;
            statusPanel.appendChild(reasonLine);
        }
        
        // Hide loading indicator
        const loadingIndicator = document.querySelector('.loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.textContent = "USING SIMPLIFIED MAP";
            setTimeout(() => {
                loadingIndicator.style.display = 'none';
            }, 2000);
        }
        
        renderCountriesLayer(fallbackGeoJSON, countriesGroup);
        
        // Show warning
        updateInfoPanel({
            "WARNING": "USING SIMPLIFIED MAP",
            "STATUS": "External GeoJSON files not found",
            "ACTION": "City targeting still operational",
            "NOTE": "This is a fallback display only"
        });
    }
    
    // Render the countries layer with either loaded or fallback data
    function renderCountriesLayer(data, countriesGroup) {
        // Increment loaded layers counter
        loadedLayers = 1;
        layerCountElement.textContent = loadedLayers;
        
        // Render the map
        countriesGroup.selectAll("path")
            .data(data.features)
            .enter().append("path")
            .attr("d", path)
            .style("stroke", "#00d8ff")
            .style("fill", "none")
            .style("opacity", 0.8)
            .on("mouseover", function(event, d) {
                d3.select(this)
                    .style("stroke-width", 2)
                    .style("opacity", 1);
                updateInfoPanel(d.properties || {});
            })
            .on("mouseout", function() {
                d3.select(this)
                    .style("stroke-width", 1)
                    .style("opacity", 0.8);
            });
        
        console.log(`Rendered map layer`);
        
        // Hide loading indicator
        const loadingIndicator = document.querySelector('.loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
        
        // Update status in UI
        const statusPanel = document.querySelector('.status-panel .terminal-text');
        if (statusPanel) {
            const successLine = document.createElement('div');
            successLine.className = 'terminal-line';
            successLine.textContent = `COUNTRIES DATA ACTIVE`;
            statusPanel.appendChild(successLine);
        }
    }
    
    // Add terminal flicker effect
    function addRandomFlickers() {
        mapGroup.style("opacity", 1);
        
        setInterval(() => {
            // Random chance to flicker
            if (Math.random() < 0.05) {
                const flickerDuration = 50 + Math.random() * 200;
                const flickerOpacity = 0.7 + Math.random() * 0.3;
                
                mapGroup.transition()
                    .duration(flickerDuration / 2)
                    .style("opacity", flickerOpacity)
                    .transition()
                    .duration(flickerDuration / 2)
                    .style("opacity", 1);
            }
            
            // Random chance for glitch effect
            if (Math.random() < 0.01) {
                const glitchX = (Math.random() - 0.5) * 10;
                mapGroup.transition()
                    .duration(50)
                    .attr("transform", `translate(${glitchX}, 0)`)
                    .transition()
                    .duration(50)
                    .attr("transform", "translate(0, 0)");
            }
        }, 500);
    }
    
    // Add a scanline effect
    function addScanlineEffect() {
        // Get actual container dimensions for the scanline
        const mapContainer = document.querySelector('.map-container');
        const containerWidth = mapContainer.clientWidth;
        const containerHeight = mapContainer.clientHeight;
        
        const scanline = svg.append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", containerWidth)  // Use container width instead of SVG width
            .attr("y2", 0)
            .attr("stroke", "#00d8ff")
            .attr("stroke-width", 2)
            .attr("opacity", 0.2);
            
        function animateScanline() {
            scanline
                .attr("y1", 0)
                .attr("y2", 0)
                .attr("x2", containerWidth)  // Ensure width is always updated
                .transition()
                .duration(5000)
                .attr("y1", containerHeight)  // Use container height
                .attr("y2", containerHeight)
                .on("end", animateScanline);
        }
        
        // Handle window resize to update scanline dimensions
        window.addEventListener('resize', function() {
            const newWidth = mapContainer.clientWidth;
            const newHeight = mapContainer.clientHeight;
            scanline.attr("x2", newWidth);
        });
        
        animateScanline();
    }
    
    // Update terminal info text appearance
    function updateTerminalText() {
        // Fix the implementation to avoid function override issues
        const originalUpdateInfoPanel = updateInfoPanel;
        
        updateInfoPanel = function(properties) {
            const infoContent = document.getElementById('info-content');
            let html = '<div class="terminal-text">\n';
            
            html += `<div class="terminal-line">LOCATION DATA ACCESSED</div>\n`;
            
            for (const key in properties) {
                if (properties.hasOwnProperty(key)) {
                    html += `<div class="terminal-line">${key}: ${properties[key]}</div>\n`;
                }
            }
            
            html += '</div>';
            infoContent.innerHTML = html;
        };
    }
    
    // Update info panel with feature data
    function updateInfoPanel(properties) {
        const infoContent = document.getElementById('info-content');
        let html = '<div class="terminal-text">';
        
        for (const key in properties) {
            if (properties.hasOwnProperty(key)) {
                html += `<div class="terminal-line">${key}: ${properties[key]}</div>`;
            }
        }
        
        html += '</div>';
        infoContent.innerHTML = html;
    }
    
    // Draw cities as triangles
    function drawCities() {
        citiesGroup.selectAll(".city")
            .data(cities)
            .enter()
            .append("path")
            .attr("d", d => {
                const [x, y] = projection([d.lon, d.lat]);
                return `M ${x} ${y-5} L ${x+5} ${y+5} L ${x-5} ${y+5} Z`;
            })
            .attr("class", "city")
            .attr("fill", "#ff5e5e")
            .on("mouseover", function(event, d) {
                d3.select(this)
                    .attr("fill", "#ffff00")
                    .attr("transform", "scale(1.5)");
                updateInfoPanel({
                    "TARGET": d.name,
                    "COORDINATES": `${d.lat.toFixed(4)}°, ${d.lon.toFixed(4)}°`
                });
            })
            .on("mouseout", function() {
                d3.select(this)
                    .attr("fill", "#ff5e5e")
                    .attr("transform", "scale(1)");
            })
            .append("title")
            .text(d => d.name);
            
        // Populate city dropdowns
        const city1Select = document.getElementById('city1-select');
        const city2Select = document.getElementById('city2-select');
        
        cities.forEach(city => {
            const option1 = document.createElement('option');
            option1.value = city.name;
            option1.textContent = city.name;
            city1Select.appendChild(option1);
            
            const option2 = document.createElement('option');
            option2.value = city.name;
            option2.textContent = city.name;
            city2Select.appendChild(option2);
        });
    }
    
    // Draw arc between two cities by name
    function drawArcBetweenCities(city1Name, city2Name) {
        const city1 = cities.find(c => c.name === city1Name);
        const city2 = cities.find(c => c.name === city2Name);
        
        if (!city1 || !city2) {
            console.error("City not found");
            updateInfoPanel({
                "ERROR": "CITY NOT FOUND",
                "STATUS": "Selected city data unavailable"
            });
            return;
        }
        
        // Delete any existing arc with the same cities
        arcsGroup.selectAll("path.arc")
            .filter(function() {
                const from = d3.select(this).attr("data-from");
                const to = d3.select(this).attr("data-to");
                return (from === city1Name && to === city2Name) || 
                       (from === city2Name && to === city1Name);
            })
            .remove();
        
        const [x1, y1] = projection([city1.lon, city1.lat]);
        const [x2, y2] = projection([city2.lon, city2.lat]);
        
        // Calculate arc parameters
        const midX = (x1 + x2) / 2;
        const yOffset = -Math.min(300, Math.abs(x1 - x2) / 2);
        
        arcsGroup.append("path")
            .attr("d", `M${x1},${y1} Q${midX},${Math.min(y1, y2) + yOffset} ${x2},${y2}`)
            .attr("class", "arc")
            .attr("data-from", city1Name)
            .attr("data-to", city2Name);
            
        // Add connection message
        updateInfoPanel({
            "CONNECTION": "ESTABLISHED",
            "SOURCE": city1Name,
            "TARGET": city2Name,
            "STATUS": "ACTIVE"
        });
    }
    
    // Simulate terminal boot sequence
    function simulateBootSequence() {
        const infoContent = document.getElementById('info-content');
        infoContent.innerHTML = `<div class="terminal-text">
> INITIALIZING SYSTEM...
> LOADING GEOGRAPHIC DATABASE...
> ESTABLISHING SECURE CONNECTION...
> GLOBAL TRACKING SYSTEM ONLINE
> ATTEMPTING MAP DATA RETRIEVAL...
> AWAITING DATA...
</div>`;
    }
    
    // Initialize the application
    function init() {
        try {
            // Simulate boot sequence
            simulateBootSequence();
            
            // Add grid effect to map container
            const mapContainer = document.querySelector('.map-container');
            if (mapContainer) {
                const gridEffect = document.createElement('div');
                gridEffect.className = 'grid-effect';
                mapContainer.appendChild(gridEffect);
            }
            
            // Load countries layer with fallback support
            loadCountriesLayer();
            
            // Draw cities
            drawCities();
            
            // Set up connect button
            const connectButton = document.getElementById('connect-cities');
            if (connectButton) {
                connectButton.addEventListener('click', function() {
                    const city1 = document.getElementById('city1-select').value;
                    const city2 = document.getElementById('city2-select').value;
                    
                    if (city1 && city2 && city1 !== city2) {
                        drawArcBetweenCities(city1, city2);
                    } else {
                        updateInfoPanel({
                            "ERROR": "INVALID SELECTION",
                            "STATUS": "Select two different cities to establish connection"
                        });
                    }
                });
            }
            
            // Add terminal text effect
            updateTerminalText();
            
            // Add CRT flicker effects
            addRandomFlickers();
            
            // Add scanline effect - call this after the map container is fully initialized
            setTimeout(addScanlineEffect, 500);
        } catch (error) {
            console.error("Error initializing application:", error);
            const infoContent = document.getElementById('info-content');
            if (infoContent) {
                infoContent.innerHTML = `<div class="terminal-text">
> SYSTEM ERROR
> ${error.message || "Unknown error"}
> CONTACT SYSTEM ADMINISTRATOR
</div>`;
            }
        }
    }
    
    // Start the application
    init();
});
