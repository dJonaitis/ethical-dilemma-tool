/*
    Main UI & Book Management Module
    Contains general UI controls, event binding, and BookshelfManager along with other
    interface functions for user interaction (e.g. launch sequences, resetting maps, etc.).
*/

// Declare global variables to hold data needed by demoMissiles
window.appData = {
    cities: null,
    americanCities: null,
    username : null,
    demoTargetCount : null,
    projection: null,
    path: null,
    geoJsonData: null
};

// Make demoMissiles a global function attached to window
window.demoMissiles = function() {
    console.log("Demo missiles function called");
    setTimeout(() => {
        // Check if data is loaded
        if (!window.appData.cities || !window.appData.americanCities) {
            console.error("Map data not loaded yet");
            return;
        }
        
        // Find Havana in the cities array for the demo
        const havana = window.appData.cities.find(city => city.name === "Havana");
        
        // Create all animated arcs simultaneously
        if (havana) {
            
            window.appData.americanCities.forEach(city => {
                window.createAnimatedArc(havana, city);
            });
        }
    }, 500);
    // Update #casualty-counter after timeout
    setTimeout(() => {
        const casualtyCounter = document.getElementById('casualty-counter');
    if (casualtyCounter) {
        let currentCount = 0;
        const targetCount = 3120944; // i estimated these deaths by looking at https://nuclearsecrecy.com/nukemap/ and taking a random city, dropping 150kt and multiplying that by our 10 cities
        window.appData.demoTargetCount = targetCount;
        const increment = Math.ceil(targetCount / 200); // Adjust speed by dividing into 200 steps
        const interval = 30; // Update every 50ms

        const counterInterval = setInterval(() => {
            currentCount += increment;
            if (currentCount >= targetCount) {
                currentCount = targetCount;
                clearInterval(counterInterval);
            }
            casualtyCounter.textContent = `Casualties: ${currentCount.toLocaleString()}`; // Format with commas
        }, interval);
    }
    }, 3000);
    


};

document.addEventListener('DOMContentLoaded', function() {
    // Get username from localStorage (set during login)
    const username = localStorage.getItem('username') || 'OPERATOR';
    window.appData.username = username;
    
    // Set a welcome message in the header
    const header = document.querySelector('header');
    const welcomeMessage = document.createElement('div');
    welcomeMessage.className = 'welcome-message';
    welcomeMessage.textContent = `WELCOME, ${username.toUpperCase()} | TODAY'S DATE IS OCTOBER 24, 1962`;
    header.appendChild(welcomeMessage);

    
    // Check if user is logged in, redirect to login if not
    if (!localStorage.getItem('username')) {
        window.location.href = 'login.html';
        return;
    }
    
    const svg = d3.select("#map");
    
    // Set projection focused on North America
    const projection = d3.geoMercator()
        .center([-90, 30])  // Center on North America (longitude, latitude)
        .scale(800)         // Zoom in more
        .translate([960, 540]);  // Center in the SVG

    const path = d3.geoPath().projection(projection);

    // Make the projection and path accessible globally
    window.appData.projection = projection;
    window.appData.path = path;

    // Load GeoJSON data for the map
    d3.json("./1981-v1.1/geojson/Admin_0_polygons.geojson").then(function(data) {
        // Store the GeoJSON data for later use
        window.appData.geoJsonData = data;
        
        svg.selectAll(".country")
        .data(data.features)
        .enter().append("path")
        .attr("d", path)
        .attr("class", "country")
        .attr("data-name", d => d.properties.NAME || "");
        
        // Load waterbodies after countries
        d3.json("./1981-v1.1/geojson/Rivers.geojson").then(function(data) {
            svg.selectAll(".waterbody")
                .data(data.features)
                .enter().append("path")
                .attr("d", path)
                .attr("class", "waterbody")
                .style("opacity", 0.5);
                

        });
    }).catch(function(error) {
        console.error("Error loading map data:", error);
    });

    // Example of adding missile arcs
    function addArc(x1, y1, x2, y2) {
        svg.append("path")
            .attr("d", `M${x1},${y1} Q${(x1 + x2) / 2},${y1 - 300} ${x2},${y2}`)
            .attr("class", "arc");
    }

    // Major world cities coordinates [longitude, latitude]
    const cities = [
        {name: "Moscow", coords: [37.6173, 55.7558]},
        {name: "Havana", coords: [-82.3666, 23.1136]},
        {name: "St. Petersburg", coords: [30.3351, 59.9342]},
        {name: "Kyiv", coords: [30.5169, 50.4501]},
        {name: "Volgograd", coords: [44.5133, 48.7080]},
        {name: "Tbilisi", coords: [44.8271, 41.7151]},
        {name: "Vilnius", coords: [25.2797, 54.6872]},
        {name: "Riga", coords: [24.1052, 56.9496]},
        {name: "Minsk", coords: [27.5590, 53.9045]},
        {name: "Krasnodar", coords: [38.9760, 45.0355]},
        {name: "Perm", coords: [56.2965, 58.6016]},
        {name: "Odessa", coords: [30.7233, 46.4825]},
        {name: "Kharkiv", coords: [36.2304, 49.9935]},
        {name: "Tashkent", coords: [69.2401, 41.2995]},
        {name: "Almaty", coords: [76.9286, 43.2220]},
        {name: "Chisinau", coords: [28.8575, 47.0105]},
        {name: "Yerevan", coords: [44.5084, 40.1776]},
        {name: "Baku", coords: [49.8671, 40.4093]},
        {name: "Tallinn", coords: [24.7545, 59.4369]},
        {name: "Lviv", coords: [24.0315, 49.8397]},
        {name: "Sochi", coords: [39.7303, 43.6028]},
        {name: "Kazan", coords: [49.1221, 55.7887]},
    ];

    const americanCities = [
        {name: "Los Angeles", coords: [-118.2437, 34.0522]},
        {name: "San Diego", coords: [-117.1611, 32.7157]},
        {name: "Chicago", coords: [-87.6298, 41.8781]},
        {name: "Houston", coords: [-95.3698, 29.7604]},
        {name: "Dallas", coords: [-96.7969, 32.7767]},
        {name: "Phoenix", coords: [-112.0740, 33.4484]},
        {name: "Philadelphia", coords: [-75.1652, 39.9526]},
        {name: "New York", coords: [-74.006, 40.7128]},
        {name: "Miami", coords: [-80.1918, 25.7617]},
        {name: "Seattle", coords: [-122.3321, 47.6062]},
    ];

    const submarines = [
        {name: "alpha", coords: [0.0, 56]}, // Moved to North Sea, west of Denmark
        {name: "bravo", coords: [3.5, 58]}, // Moved to North Sea, northwest of Denmark
        {name: "charlie", coords: [39.483789, 71.559293]}, // Above Finland, Barents Sea
        {name: "delta", coords: [31.26, 44.05]}, // Black Sea
    ];
    
    // Store cities in global appData for access by demoMissiles
    window.appData.cities = cities;
    window.appData.americanCities = americanCities;
    window.appData.submarines = submarines;

    // Add cities as red triangles
    svg.selectAll(".city")
        .data(cities)
        .enter()
        .append("path")
        .attr("d", d => {
            const [x, y] = projection(d.coords);
            return `M${x},${y-12} L${x+12},${y+12} L${x-12},${y+12} Z`;
        })
        .attr("class", "city")
        .style("fill", "red") // Use style() instead of attr() to override CSS
        .append("title")
        .text(d => d.name);
    
    // Add American cities as green triangles
    svg.selectAll(".american-city")
        .data(americanCities)
        .enter()
        .append("path")
        .attr("d", d => {
            const [x, y] = projection(d.coords);
            return `M${x},${y-12} L${x+12},${y+12} L${x-12},${y+12} Z`;
        })
        .attr("class", "american-city")
        .style("fill", "green")
        .append("title")
        .text(d => d.name);
    
    // Add submarines as green upside down triangles
    svg.selectAll(".submarine")
        .data(submarines)
        .enter()
        .append("path")
        .attr("class", "submarine")
        .attr("d", d => {
            const [x, y] = projection(d.coords);
            return `M${x-12},${y-12} L${x+12},${y-12} L${x},${y+12} Z`;
        })
        .style("fill", "green")
        .append("title")
        .text(d => d.name);
        
    
    // Function to create an animated arc - make it global
    window.createAnimatedArc = function(fromCity, toCity) {
        const [x1, y1] = projection(fromCity.coords);
        const [x2, y2] = projection(toCity.coords);
        
        // Create the arc path
        const arc = svg.append("path")
            .attr("class", "arc")
            .attr("d", `M${x1},${y1} Q${(x1 + x2) / 2},${Math.min(y1, y2) - 300} ${x1},${y1}`)
            .style("opacity", 0);
        
        // Animate the arc
        arc.transition()
            .duration(2000)
            .style("opacity", 1)
            .attrTween("d", function() {
                return function(t) {
                    // Gradually extend the path
                    return `M${x1},${y1} Q${(x1 + x2) / 2},${Math.min(y1, y2) - 300} ${x1 + (x2 - x1) * t},${y1 + (y2 - y1) * t}`;
                };
            })
            .on("end", function() {
                // Create explosion at the end point
                const explosion = svg.append("circle")
                    .attr("cx", x2)
                    .attr("cy", y2)
                    .attr("r", 0)
                    .attr("fill", "yellow")
                    .attr("opacity", 1);
                
                // Animate the explosion
                explosion.transition()
                    .duration(1000)
                    .attr("r", 30)
                    .attr("fill", "orange")
                    .style("filter", "blur(3px)")
                    .transition()
                    .duration(500)
                    .attr("r", 10)
                    .attr("fill", "red")
                    .attr("opacity", 0)
                    .remove();
            });
    };

    // Function to create an animated arc from a submarine to a city
    window.submarineToCity = function(submarine, targetCity) {
        const [x1, y1] = projection(submarine.coords);
        const [x2, y2] = projection(targetCity.coords);
        
        // Create the arc path with submarine-specific styling
        const arc = svg.append("path")
            .attr("class", "arc submarine-arc")
            .attr("d", `M${x1},${y1} Q${(x1 + x2) / 2},${Math.min(y1, y2) - 300} ${x1},${y1}`)
            .style("opacity", 0)
            .style("stroke", "green")
            .style("stroke-width", 2);
        
        // Animate the arc
        arc.transition()
            .duration(2500)
            .style("opacity", 1)
            .attrTween("d", function() {
                return function(t) {
                    // Gradually extend the path
                    return `M${x1},${y1} Q${(x1 + x2) / 2},${Math.min(y1, y2) - 300} ${x1 + (x2 - x1) * t},${y1 + (y2 - y1) * t}`;
                };
            })
            .on("end", function() {
                // Create explosion at the end point
                const explosion = svg.append("circle")
                    .attr("cx", x2)
                    .attr("cy", y2)
                    .attr("r", 0)
                    .attr("fill", "cyan")
                    .attr("opacity", 1);
                
                // Animate the explosion
                explosion.transition()
                    .duration(1000)
                    .attr("r", 40)
                    .attr("fill", "blue")
                    .style("filter", "blur(5px)")
                    .transition()
                    .duration(600)
                    .attr("r", 15)
                    .attr("fill", "darkblue")
                    .attr("opacity", 0)
                    .remove();
            });
    };

    // Function to create synchronized arcs from submarines to their closest cities
    window.submarineAttack = function() {
        // Track which cities have been targeted to ensure one arc per city
        const targetedCities = new Set();
        
        // Filter cities to exclude Havana
        const targetableCities = cities.filter(city => city.name !== "Havana");
        
        // Divide cities evenly among submarines
        const submarinesWithTargets = [];
        const totalSubmarine = submarines.length;
        const citiesPerSubmarine = Math.ceil(targetableCities.length / totalSubmarine);
        
        // For each submarine, assign a set of cities
        submarines.forEach((submarine, index) => {
            const startIndex = index * citiesPerSubmarine;
            const endIndex = Math.min(startIndex + citiesPerSubmarine, targetableCities.length);
            const assignedCities = targetableCities.slice(startIndex, endIndex);
            
            submarinesWithTargets.push({
                submarine: submarine,
                targets: assignedCities
            });
            
            // Add each city to targeted set
            assignedCities.forEach(city => targetedCities.add(city.name));
        });
        
        // Check if we missed any cities (could happen due to rounding)
        targetableCities.forEach(city => {
            if (!targetedCities.has(city.name)) {
                // Assign to submarine with fewest targets
                let minTargetSub = submarinesWithTargets[0];
                submarinesWithTargets.forEach(sub => {
                    if (sub.targets.length < minTargetSub.targets.length) {
                        minTargetSub = sub;
                    }
                });
                minTargetSub.targets.push(city);
                targetedCities.add(city.name);
            }
        });
        
        // Create all arcs with calculated timing
        submarinesWithTargets.forEach(subData => {
            subData.targets.forEach(city => {
                // Calculate path length for timing
                const [x1, y1] = projection(subData.submarine.coords);
                const [x2, y2] = projection(city.coords);
                
                // Create arc path with submarine-specific styling
                const arc = svg.append("path")
                    .attr("class", "arc submarine-arc")
                    .attr("d", `M${x1},${y1} Q${(x1 + x2) / 2},${Math.min(y1, y2) - 300} ${x1},${y1}`)
                    .style("opacity", 0)
                    .style("stroke", "green")
                    .style("stroke-width", 2);
                
                // Store reference to city for explosion
                arc.datum({submarine: subData.submarine, city: city});
            });
        });
        
        // Now animate all arcs simultaneously with same duration to ensure synchronized arrival
        const allArcs = svg.selectAll("path.submarine-arc");
        
        allArcs.transition()
            .duration(3000)
            .style("opacity", 1)
            .attrTween("d", function() {
                const arcData = d3.select(this).datum();
                const [x1, y1] = projection(arcData.submarine.coords);
                const [x2, y2] = projection(arcData.city.coords);
                
                return function(t) {
                    // Gradually extend the path
                    return `M${x1},${y1} Q${(x1 + x2) / 2},${Math.min(y1, y2) - 300} ${x1 + (x2 - x1) * t},${y1 + (y2 - y1) * t}`;
                };
            })
            .on("end", function() {
                const arcData = d3.select(this).datum();
                const [x2, y2] = projection(arcData.city.coords);
                
                // Create explosion at the end point
                const explosion = svg.append("circle")
                    .attr("cx", x2)
                    .attr("cy", y2)
                    .attr("r", 0)
                    .attr("fill", "yellow")
                    .attr("opacity", 1);
                
                // Animate the explosion
                explosion.transition()
                    .duration(1000)
                    .attr("r", 40) 
                    .attr("fill", "orange")
                    .style("filter", "blur(5px)")
                    .transition()
                    .duration(600)
                    .attr("r", 15)
                    .attr("fill", "red")
                    .attr("opacity", 0)
                    .remove();
            });
    };

    // Add a global function to recenter the map on the Soviet Union
    window.recenterOnSovietUnion = function() {
        console.log("Recentering map on Soviet Union");
        
        // New center coordinates for Soviet Union region (approximately Moscow)
        const newCenter = [37, 55];
        const newScale = 600;
        
        // Update the projection
        projection
            .center(newCenter)
            .scale(newScale);
        
        // Update all paths with the new projection
        svg.selectAll("path")
            .attr("d", path);
        
        // Update city markers with the new projection
        svg.selectAll(".city")
            .attr("d", d => {
                const [x, y] = projection(d.coords);
                return `M${x},${y-12} L${x+12},${y+12} L${x-12},${y+12} Z`;
            });
        
        // update submarines
        svg.selectAll(".submarine")
            .attr("d", d => {
                const [x, y] = projection(d.coords);
                return `M${x-12},${y-12} L${x+12},${y-12} L${x},${y+12} Z`;
            });
            
        svg.selectAll(".american-city")
            .attr("d", d => {
                const [x, y] = projection(d.coords);
                return `M${x},${y-12} L${x+12},${y+12} L${x-12},${y+12} Z`;
            });
            
        // Highlight former Soviet republics
        const sovietRepublics = [
            "Russia", "Ukraine", "Belarus", "Lithuania", "Latvia", 
            "Estonia", "Moldova", "Georgia", "Armenia", "Azerbaijan",
            "Kazakhstan", "Uzbekistan", "Turkmenistan", "Kyrgyzstan", "Tajikistan"
        ];
        
        // Reset all countries to default style
        svg.selectAll(".country")
            .style("fill", "none")
            .style("stroke-width", 1);
            
        // Highlight Soviet republics
        svg.selectAll(".country")
            .filter(function() {
                const countryName = d3.select(this).attr("data-name");
                return sovietRepublics.includes(countryName);
            })
            .style("fill", "rgba(255, 0, 0, 0.2)")
            .style("stroke", "#ff0000")
            .style("stroke-width", 1.5);
            
        // Add map title for Soviet Union
        if (svg.select(".map-title").empty()) {
            svg.append("text")
                .attr("class", "map-title")
                .attr("x", 50)
                .attr("y", 50)
                .attr("fill", "#ff0000")
                .attr("font-family", "'VT323', 'Courier New', monospace")
                .attr("font-size", "24px")
                .text("SOVIET UNION TERRITORY");
        } else {
            svg.select(".map-title")
                .text("SOVIET UNION TERRITORY");
        }
        
        // Add a subtle transition effect
        svg.transition()
            .duration(1000)
            .style("opacity", 0.8)
            .transition()
            .duration(500)
            .style("opacity", 1);
    };

    // Modified launch button event - now selects random cities
    const launchButton = document.getElementById('launch-sequence');
    launchButton.addEventListener('click', function() {
        // Select random cities instead of using dropdowns
        const randomSourceIndex = Math.floor(Math.random() * cities.length);
        const randomTargetIndex = Math.floor(Math.random() * americanCities.length);
        
        const source = cities[randomSourceIndex];
        const target = americanCities[randomTargetIndex];
        
        // Show dialogue before animation
        DialogueSystem.show({
            speaker: "LAUNCH CONTROL",
            text: `Launch sequence initiated from ${source.name} targeting ${target.name}. Missile trajectory calculated. Awaiting final confirmation.`,
            next: {
                speaker: "LAUNCH CONTROL",
                text: "Launch confirmed. Missile deployed. Impact estimated in T-minus 180 seconds.",
                next: function() {
                    // Create the animated arc after dialogue sequence
                    window.createAnimatedArc(source, target);
                }
            }
        });
    });

    // Modified Reset button - no need to reset dropdowns
    const resetButton = document.getElementById('reset-map');
    resetButton.addEventListener('click', function() {
        // Remove all arcs
        svg.selectAll("path.arc").remove();
        // Remove all explosions
        svg.selectAll("circle").remove();
    });    
    
    // Book class to represent manuals in the library
    class Book {
        constructor(title, subtitle, contents, image) {
            this.name = title; // title used as the book name
            this.subtitle = subtitle; // new subtitle property
            this.contents = contents;
            this.image = `images/books/${image}`; // Include directory in path
        }
    }

    // BookshelfManager to handle the bookshelf UI
    class BookshelfManager {
        constructor() {
            this.books = [];
            this.bookshelfElement = null;
        }

        addBook(book) {
            this.books.push(book);
        }

        loadBooksFromJSON(callback) {
            console.log("Loading books from JSON...");
            
            // Fetch the books data from JSON file
            fetch('data/books.json')
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Network response was not ok: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log(`Loaded ${data.length} books from JSON:`, data);
                    
                    // Clear existing books
                    this.books = [];
                    
                    // Add each book from the JSON
                    data.forEach(bookData => {
                        console.log(`Adding book: ${bookData.title}`);
                        this.addBook(new Book(
                            bookData.title,
                            bookData.subtitle || "No subtitle available",
                            bookData.contents,
                            bookData.image
                        ));
                    });
                    
                    // Call the callback when books are loaded
                    if (callback) callback();
                })
                .catch(error => {
                    console.error('Error loading books:', error);
                    
                    
                });
        }

        // Create a library interface with 4 evenly spaced image buttons
        createLibraryInterface() {
            // Create container for buttons
            const container = document.createElement('div');
            container.className = 'library-buttons';
            container.style.pointerEvents = "auto";  // ensure interactivity
            
            // Get up to 4 books
            const booksToShow = this.books.slice(0, 4);
            
            // Create buttons for each book; replace test alert with opening contents UI
            booksToShow.forEach(book => {
                const button = document.createElement('div');
                button.className = 'library-button';
                button.style.backgroundImage = `url('${book.image}')`;
                // Replace test alert with terminal-style contents UI call
                button.addEventListener('click', () => {
                    this.openBook(book);
                });
                container.appendChild(button);
            });
            
            return container;
        }
        
        openBook(book) {
            console.log("Opening book dialogue for", book.name);
            
            // If the library modal is still open, store a reference but don't remove it
            const libraryModal = document.querySelector('.library-modal');
            if (libraryModal) {
                // Hide the library modal instead of removing it
                libraryModal.style.display = 'none';
                // Don't remove the dialogue-open class
            }
            
            // Create overlay for modal effect
            const overlay = document.createElement('div');
            overlay.className = 'dialogue-overlay';
            document.body.appendChild(overlay);
            
            // Create a modal dialogue box for the book
            const dialogue = document.createElement('div');
            dialogue.className = 'dialogue-box modal';
            
            // Add a class to blur other UI
            document.body.classList.add('dialogue-open');
            
            // Create header with title and close button
            const headerElem = document.createElement('div');
            headerElem.className = 'dialogue-header';
            
            // Book title in header
            const titleElem = document.createElement('div');
            titleElem.className = 'terminal-header';
            titleElem.textContent = book.name;
            headerElem.appendChild(titleElem);
            
            
            // New subtitle element with more prominence
            const subtitleElem = document.createElement('div');
            subtitleElem.className = 'book-subtitle';
            subtitleElem.textContent = book.subtitle;
            subtitleElem.style.fontWeight = 'bold';
            subtitleElem.style.margin = '8px 0';
            headerElem.appendChild(subtitleElem);
            
            // Close button - Modified to return to library
            const closeBtn = document.createElement('button');
            closeBtn.className = 'dialogue-close-btn';
            closeBtn.innerHTML = '&times;';
            closeBtn.addEventListener('click', () => {
                document.body.removeChild(overlay);
                document.body.removeChild(dialogue);
                
                // If we have a stored library modal, show it again
                if (libraryModal) {
                    libraryModal.style.display = 'flex';
                } else {
                    document.body.classList.remove('dialogue-open');
                }
            });
            headerElem.appendChild(closeBtn);
            dialogue.appendChild(headerElem);
            
            // Create content container for the book contents
            const contentElem = document.createElement('div');
            contentElem.className = 'dialogue-content';
            contentElem.style.maxHeight = '60vh';
            contentElem.style.overflowY = 'auto';
            
            // Create text element for book content
            const textElem = document.createElement('div');
            textElem.className = 'dialogue-text';
            textElem.textContent = book.contents;
            contentElem.appendChild(textElem);
            
            dialogue.appendChild(contentElem);
            document.body.appendChild(dialogue);
        }
    }

    // Initialize bookshelf manager (books will be loaded when needed)
    const bookshelfManager = new BookshelfManager();
    
    // user manual database
    const manualDatabaseBtn = document.getElementById('manual-database-btn');
    
    if (manualDatabaseBtn) {
        manualDatabaseBtn.addEventListener('click', function() {
            // Add visual feedback
            this.classList.add('button-pulse');
            setTimeout(() => {
                this.classList.remove('button-pulse');
            }, 2000);
            
            // Load books from JSON and then show the library UI directly
            bookshelfManager.loadBooksFromJSON(() => {
                console.log("Books loaded successfully");
                
                // Create the library interface (4 image buttons)
                const libraryInterface = bookshelfManager.createLibraryInterface();
                
                // Clean up any existing dialogues and overlays
                document.querySelectorAll('.dialogue-box').forEach(el => el.remove());
                document.querySelectorAll('.dialogue-overlay').forEach(el => el.remove());
                
                // Remove overlay creation to prevent it from intercepting pointer events
                // const overlay = document.createElement('div');
                // overlay.className = 'dialogue-overlay library-overlay';
                // overlay.addEventListener('click', e => e.stopPropagation());
                
                // Create custom modal box for the library interface
                const modalBox = document.createElement('div');
                modalBox.className = 'dialogue-box modal library-modal';
                modalBox.style.maxWidth = '1250px';  // widened slightly
                modalBox.style.pointerEvents = "auto";  // ensure modal is interactive
                // Set a fully opaque, brighter background
                modalBox.style.backgroundColor = "rgba(0,26,26,1)";
                
                // Create header with title and close button
                const header = document.createElement('div');
                header.className = 'dialogue-header';
                
                const title = document.createElement('div');
                title.className = 'terminal-header';
                title.textContent = 'CLASSIFIED DOCUMENT REPOSITORY';
                header.appendChild(title);
                
                const closeButton = document.createElement('button');
                closeButton.className = 'dialogue-close-btn';
                closeButton.innerHTML = '&times;';
                closeButton.addEventListener('click', () => {
                    document.body.removeChild(modalBox);
                    // document.body.removeChild(overlay);
                    document.body.classList.remove('dialogue-open');
                });
                header.appendChild(closeButton);
                
                modalBox.appendChild(header);
                
                // Create content area and insert the library interface
                const content = document.createElement('div');
                content.className = 'dialogue-content';
                content.style.maxHeight = '80vh';
                content.appendChild(libraryInterface);
                modalBox.appendChild(content);
                
                // Append only the modal box, not the overlay
                // document.body.appendChild(overlay);
                document.body.appendChild(modalBox);
                document.body.classList.add('dialogue-open');
            });
        });
    }

    // Set up data stream in the control panel
    setupDataStream();
    
    // DATASTREAM
    function setupDataStream() {
        const controlPanel = document.querySelector('.control-panel');
        
        // Clear existing content but keep the header
        const header = controlPanel.querySelector('.terminal-header');
        controlPanel.innerHTML = '';
        controlPanel.appendChild(header);
        
        // Create data stream console
        const dataStreamConsole = document.createElement('div');
        dataStreamConsole.className = 'data-stream-console';
        
        // Create container for stream lines
        const dataStreamContainer = document.createElement('div');
        dataStreamContainer.className = 'data-stream-container';
        dataStreamConsole.appendChild(dataStreamContainer);
        
        // Add the console to the control panel
        controlPanel.appendChild(dataStreamConsole);
        
        // Get the data from dataStreamGenerator and randomize
        const dataLines = datastreamGenerator();
        
        // Shuffle the array
        for (let i = dataLines.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [dataLines[i], dataLines[j]] = [dataLines[j], dataLines[i]];
        }
        
        let currentIndex = 0;
        
        // Display initial lines
        displayInitialLines();
        
        const streamInterval = setInterval(streamData, 100);
        
        function displayInitialLines() {
            // Add more lines to start with for a fuller appearance
            for (let i = 0; i < 12; i++) {
                addDataLine(dataLines[currentIndex]);
                currentIndex = (currentIndex + 1) % dataLines.length;
            }
        }
        
        function streamData() {
            // Add a new line from the data array
            addDataLine(dataLines[currentIndex]);
            
            // Move to next data item, loop if at the end
            currentIndex = (currentIndex + 1) % dataLines.length;
            
            // Occasionally add a random entry for more variability
            if (Math.random() < 0.1) {
                const randomIndex = Math.floor(Math.random() * dataLines.length);
                addDataLine(dataLines[randomIndex]);
            }
        }
        
        function addDataLine(text) {
            // Create new line element
            const line = document.createElement('div');
            line.className = 'data-stream-line';
            line.textContent = text;
            
            // Add to container
            dataStreamContainer.appendChild(line);
            
            // Remove old lines if there are too many (increased to show more lines)
            while (dataStreamContainer.children.length > 20) {
                dataStreamContainer.removeChild(dataStreamContainer.firstChild);
            }
            
            // Scroll to bottom (will be limited by overflow: hidden)
            dataStreamConsole.scrollTop = dataStreamConsole.scrollHeight;
        }
    }
});
