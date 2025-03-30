document.addEventListener('DOMContentLoaded', function() {
    const svg = d3.select("#map");
    
    // Set projection focused on North America
    const projection = d3.geoMercator()
        .center([-90, 30])  // Center on North America (longitude, latitude)
        .scale(800)         // Zoom in more
        .translate([960, 540]);  // Center in the SVG

    const path = d3.geoPath().projection(projection);

    // Function to update the info panel
    function updateInfoPanel(message) {
        const infoContent = document.getElementById('info-content');
        infoContent.innerHTML = message;
    }

    // Show loading message
    updateInfoPanel(`
        > INITIALIZING MAP DATA...
        > LOADING GEOGRAPHIC DATABASE...
        > SCANNING SATELLITE IMAGERY...
        > ESTABLISHING GLOBAL COORDINATES...
    `);

    // Load GeoJSON data for the map
    d3.json("./1981-v1.1/geojson/Admin_0_polygons.geojson").then(function(data) {
        svg.selectAll(".country")
        .data(data.features)
        .enter().append("path")
        .attr("d", path)
        .attr("class", "country");
        
        // Load waterbodies after countries
        d3.json("./1981-v1.1/geojson/Waterbodies.geojson").then(function(data) {
            svg.selectAll(".waterbody")
                .data(data.features)
                .enter().append("path")
                .attr("d", path)
                .attr("class", "waterbody")
                .style("opacity", 0.5);
                
            // Update status after loading map data
            updateInfoPanel(`
                > MAP DATA LOADED SUCCESSFULLY
                > TARGETING SYSTEM ONLINE
                > COORDINATES ESTABLISHED
                > READY FOR TARGET SELECTION
            `);
        });
    }).catch(function(error) {
        console.error("Error loading map data:", error);
        updateInfoPanel(`
            > ERROR LOADING MAP DATA
            > CHECK NETWORK CONNECTION
            > CONTACT SYSTEM ADMINISTRATOR
        `);
    });

    // Example of adding missile arcs
    function addArc(x1, y1, x2, y2) {
        svg.append("path")
            .attr("d", `M${x1},${y1} Q${(x1 + x2) / 2},${y1 - 300} ${x2},${y2}`)
            .attr("class", "arc");
    }

    // Major world cities coordinates [longitude, latitude]
    const cities = [
        {name: "New York", coords: [-74.006, 40.7128]},
        {name: "London", coords: [-0.1278, 51.5074]},
        {name: "Tokyo", coords: [139.6917, 35.6895]},
        {name: "Beijing", coords: [116.4074, 39.9042]},
        {name: "Moscow", coords: [37.6173, 55.7558]},
        {name: "Rio de Janeiro", coords: [-43.1729, -22.9068]},
        {name: "Sydney", coords: [151.2093, -33.8688]},
        {name: "Cairo", coords: [31.2357, 30.0444]},
        {name: "Havana", coords: [-82.3666, 23.1136]},
        {name: "Amsterdam", coords: [4.9041, 52.3676]}
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

    // Populate dropdowns with cities
    const sourceSelect = document.getElementById('source-select');
    const targetSelect = document.getElementById('target-select');
    
    // Add options for source (only foreign cities)
    cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city.name;
        option.textContent = city.name;
        sourceSelect.appendChild(option);
    });
    
    // Add options for target (only American cities)
    americanCities.forEach(city => {
        const option = document.createElement('option');
        option.value = city.name;
        option.textContent = city.name;
        targetSelect.appendChild(option);
    });

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
        .style("fill", "green") // Use style() instead of attr() to override CSS
        .append("title")
        .text(d => d.name);
    
    // Function to create an animated arc
    function createAnimatedArc(fromCity, toCity) {
        const [x1, y1] = projection(fromCity.coords);
        const [x2, y2] = projection(toCity.coords);
        
        // Create the arc path
        const arc = svg.append("path")
            .attr("class", "arc")
            .attr("d", `M${x1},${y1} Q${(x1 + x2) / 2},${Math.min(y1, y2) - 300} ${x1},${y1}`)
            .style("opacity", 0);
        
        // Animate the arc
        arc.transition()
            .duration(3000)
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
    }

    // Set up launch button event
    const launchButton = document.getElementById('launch-sequence');
    launchButton.addEventListener('click', function() {
        const sourceCity = sourceSelect.value;
        const targetCity = targetSelect.value;
        
        if (!sourceCity || !targetCity) {
            updateInfoPanel(`
                > ERROR: MISSING PARAMETERS
                > SOURCE AND TARGET LOCATIONS REQUIRED
                > LAUNCH SEQUENCE ABORTED
            `);
            
            // Show error dialogue
            DialogueSystem.show({
                speaker: "ERROR",
                text: "Missing launch parameters. You must select both source and target locations to continue with the launch sequence.",
                next: function() {
                    // Optional callback after dialogue is closed
                    console.log("Dialogue closed");
                }
            });
            
            return;
        }
        
        // Find the city objects
        const source = cities.find(city => city.name === sourceCity);
        const target = americanCities.find(city => city.name === targetCity);
        
        if (source && target) {
            // Show dialogue before animation
            DialogueSystem.show({
                speaker: "LAUNCH CONTROL",
                text: `Launch sequence initiated from ${sourceCity} targeting ${targetCity}. Missile trajectory calculated. Awaiting final confirmation.`,
                next: {
                    speaker: "LAUNCH CONTROL",
                    text: "Launch confirmed. Missile deployed. Impact estimated in T-minus 180 seconds.",
                    next: function() {
                        // Create the animated arc after dialogue sequence
                        createAnimatedArc(source, target);
                    }
                }
            });
            
            updateInfoPanel(`
                > LAUNCH SEQUENCE INITIATED
                > SOURCE: ${sourceCity}
                > TARGET: ${targetCity}
                > CALCULATING TRAJECTORY...
                > MISSILE LAUNCHED
            `);
        }
    });

    // Reset button
    const resetButton = document.getElementById('reset-map');
    resetButton.addEventListener('click', function() {
        // Remove all arcs
        svg.selectAll("path.arc").remove();
        // Remove all explosions
        svg.selectAll("circle").remove();
        
        // Reset dropdowns
        sourceSelect.value = "";
        targetSelect.value = "";
        
        // Update info panel
        updateInfoPanel(`
            > SYSTEM RESET COMPLETE
            > SIMULATION CLEARED
            > READY FOR NEW TARGET SELECTION
        `);
    });
    
    // Optional: Automatically run the demo when loading
    setTimeout(() => {
        // Find Havana in the cities array for the demo
        const havana = cities.find(city => city.name === "Havana");
        
        // Create one animated arc with delay
        if (havana) {
            updateInfoPanel(`
                > DEMONSTRATION MODE ACTIVATED
                > SOURCE: HAVANA, CUBA
                > MULTIPLE TARGETS IDENTIFIED
                > MISSILES LAUNCHING...
            `);
            
            americanCities.forEach((city, i) => {
                setTimeout(() => {
                    createAnimatedArc(havana, city);
                }, i * 1000); // 1 second delay between each arc
            });
        }
    }, 3000); // Start demo after 3 seconds
    
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
                    
                    // Add fallback books in case JSON fails to load
                    console.log("Using fallback books");
                    this.addBook(new Book(
                        "Kant at His Extremes",
                        "Exploring the boundaries of moral philosophy",
                        "Exploring the categorical imperative and its applications in extreme scenarios.",
                        "book_kant_at_his_extremes.png"
                    ));
                    
                    this.addBook(new Book(
                        "Just and Unjust War",
                        "The ethics of conflict",
                        "Analysis of the moral dimensions of warfare and the ethics of military conflict.",
                        "book_just_and_unjust_war.png"
                    ));
                    
                    this.addBook(new Book(
                        "MAD",
                        "Destruction and deterrence",
                        "Mutually assured destruction (MAD) is a doctrine of military strategy and national security policy.",
                        "book_MAD.png"
                    ));
                    
                    this.addBook(new Book(
                        "Optimising Nuclear Deterrence",
                        "Strategies for maximum efficiency",
                        "Nuclear deterrence theory and implementation strategies for maximum effectiveness.",
                        "book_optimising_nuclear_deterrence.png"
                    ));
                    
                    if (callback) callback();
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
            // If the library modal is still open, remove it
            const modal = document.querySelector('.library-modal');
            if (modal) {
                modal.parentNode.removeChild(modal);
                document.body.classList.remove('dialogue-open');
            }
            // Create a dialogue box for the book using the new CSS class
            const dialogue = document.createElement('div');
            dialogue.className = 'book-dialogue';
            
            // Add a class to blur other UI
            document.body.classList.add('book-dialogue-open');
            
            // Create header with title and close button
            const headerElem = document.createElement('div');
            headerElem.className = 'dialogue-header';
            
            const titleElem = document.createElement('div');
            titleElem.className = 'terminal-header';
            titleElem.textContent = book.name;
            headerElem.appendChild(titleElem);
            
            // New subtitle element.
            const subtitleElem = document.createElement('div');
            subtitleElem.className = 'book-subtitle';
            subtitleElem.textContent = book.subtitle;
            headerElem.appendChild(subtitleElem);
            
            const closeBtn = document.createElement('button');
            closeBtn.className = 'dialogue-close-btn';
            closeBtn.innerHTML = '&times;';
            closeBtn.addEventListener('click', () => {
                document.body.removeChild(dialogue);
                document.body.classList.remove('book-dialogue-open');
            });
            headerElem.appendChild(closeBtn);
            dialogue.appendChild(headerElem);
            
            // Create content container for the book contents
            const contentElem = document.createElement('div');
            contentElem.className = 'dialogue-content';
            contentElem.textContent = book.contents;
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
});
