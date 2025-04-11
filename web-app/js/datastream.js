function datastreamGenerator(){ // returns array of data lines
    let arr = [];
    
    // 100 radar anomalies
    let strRadarAnomaly = "Radar anomaly detected at: ";
    for (let i = 0; i < 100; i++){
        let lat = Math.floor(Math.random() * (48 - 18 + 1) + 18);
        let long = Math.floor(Math.random() * (-56 - -130 + 1) + -130);
        let str = strRadarAnomaly + lat + "," + long;
        arr.push(str);
    }
    
    // 100 trajectory calculations
    let strTrajectory = "Trajectory calculation #";
    for (let i = 0; i < 100; i++){
        let num = Math.floor(Math.random() * 1000);
        let str = strTrajectory + num;
        arr.push(str);
    }
    
    // 100 submarine pings
    let strSubmarine = "Submarine ping irregularity at: ";
    for (let i = 0; i < 100; i++){
        let lat = Math.floor(Math.random() * (30 - (-60) + 1) + (-60)); // Latitude range for Atlantic/Pacific
        let long = Math.floor(Math.random() * (-70 - (-160) + 1) + (-160)); // Longitude range for Atlantic/Pacific  let str = strSubmarine + lat + "," + long;
        str = strSubmarine + lat + "," + long;
        arr.push(str);
    }
    
    // 100 satellite deviations
    let strSatellite = "Satellite deviation logged at: ";
    for (let i = 0; i < 100; i++) {
        let lat = Math.floor(Math.random() * (90 - (-90) + 1) + (-90)); // Latitude range for entire globe
        let long = Math.floor(Math.random() * (180 - (-180) + 1) + (-180)); // Longitude range for entire globe
        let str = strSatellite + lat + "," + long;
        arr.push(str);
    }
    
    // 100 NORAD signal losses
    let strNoradBase = "Signal loss from NORAD monitoring station ";
    let stations = ["Alpha-7", "Beta-3", "Gamma-5", "Delta-2", "Epsilon-9", "Zeta-1", "Theta-8", "Iota-4", "Kappa-6", "Lambda-0"];
    for (let i = 0; i < 100; i++) {
        let station = stations[Math.floor(Math.random() * stations.length)];
        let strNorad = strNoradBase + station + ".";
        arr.push(strNorad);
    }
    
    // 100 Communications Intercepts
    let commSources = ["Soviet Naval Command", "Cuban Military", "Warsaw Pact", "East German Intel", "Chinese Embassy", "Soviet Embassy", "KGB Channel", "Moscow Central", "Havana Command", "Soviet Pacific Fleet"];
    let commTypes = ["encrypted", "partially decoded", "clear channel", "morse", "coded", "diplomatic", "military", "emergency", "standard", "priority"];
    for (let i = 0; i < 100; i++) {
        let source = commSources[Math.floor(Math.random() * commSources.length)];
        let type = commTypes[Math.floor(Math.random() * commTypes.length)];
        let code = Math.floor(Math.random() * 900) + 100; // 3-digit code
        let str = `COMINT: ${type} transmission from ${source}, code ${code}.`;
        arr.push(str);
    }
    
    // 100 Early Warning System Notifications
    let ewsLevels = ["DEFCON alert", "BMEWS notification", "Perimeter breach", "Airspace violation", "SLBM detection", "ICBM detection", "Unidentified object", "Nuclear signature", "DEW line contact", "SOSUS contact"];
    let ewsLocations = ["North Atlantic", "Arctic Circle", "Greenland", "Alaska", "North Pacific", "Baltic Sea", "North Sea", "Caribbean", "Mediterranean", "Japan Sea"];
    for (let i = 0; i < 100; i++) {
        let level = ewsLevels[Math.floor(Math.random() * ewsLevels.length)];
        let location = ewsLocations[Math.floor(Math.random() * ewsLocations.length)];
        let probability = Math.floor(Math.random() * 100);
        let str = `EWS: ${level} in ${location} region. Probability: ${probability}%.`;
        arr.push(str);
    }
    
    // 100 Missile Silo Status Updates
    let siloStates = ["ready", "armed", "standby", "maintenance", "alert", "diagnostic", "secure", "countdown", "safety check", "crew rotation"];
    let siloLocations = ["Montana", "North Dakota", "Wyoming", "Nebraska", "Colorado", "Missouri", "South Dakota", "Idaho", "Washington", "Kansas"];
    for (let i = 0; i < 100; i++) {
        let state = siloStates[Math.floor(Math.random() * siloStates.length)];
        let location = siloLocations[Math.floor(Math.random() * siloLocations.length)];
        let siloNum = Math.floor(Math.random() * 90) + 10; // 2-digit number
        let str = `SILO: LGM-30 #${siloNum} in ${location} status changed to ${state}.`;
        arr.push(str);
    }
    
    // 100 Strategic Asset Movements
    let assetTypes = ["bomber squadron", "carrier group", "submarine", "AWACS", "reconnaissance flight", "ballistic missile submarine", "destroyer fleet", "fighter wing", "spy plane", "tanker aircraft"];
    let assetActions = ["mobilized", "diverted", "on station", "departing", "arriving", "patrolling", "intercepting", "returning to base", "changing course", "refueling"];
    let assetRegions = ["Mediterranean", "Baltic", "North Sea", "Pacific", "Indian Ocean", "Caribbean", "Atlantic", "South China Sea", "Arctic", "Gulf of Mexico"];
    
    for (let i = 0; i < 100; i++) {
        let type = assetTypes[Math.floor(Math.random() * assetTypes.length)];
        let action = assetActions[Math.floor(Math.random() * assetActions.length)];
        let region = assetRegions[Math.floor(Math.random() * assetRegions.length)];
        let designator = Math.floor(Math.random() * 90) + 10; // 2-digit number
        let str = `STRATCOM: ${type} ${designator} ${action} in ${region} zone.`;
        arr.push(str);
    }
    
    // 100 Crisis Intelligence Updates
    let intelSources = ["CIA", "NSA", "DIA", "ONI", "SAC", "State Dept", "MI6 liaison", "NATO intel", "Pentagon", "field agent"];
    let intelSubjects = ["troop movements", "missile preparations", "naval deployments", "mobilization order", "diplomatic communiqué", "leadership meeting", "nuclear alert status", "civilian evacuation", "military broadcast", "command change"];
    let intelLocations = ["Moscow", "Havana", "Berlin", "Beijing", "Pyongyang", "Warsaw", "Prague", "Budapest", "Vladivostok", "Kiev"];
    
    for (let i = 0; i < 100; i++) {
        let source = intelSources[Math.floor(Math.random() * intelSources.length)];
        let subject = intelSubjects[Math.floor(Math.random() * intelSubjects.length)];
        let location = intelLocations[Math.floor(Math.random() * intelLocations.length)];
        let priority = ["FLASH", "URGENT", "PRIORITY", "ROUTINE"][Math.floor(Math.random() * 4)];
        let str = `INTEL ${priority}: ${source} reports ${subject} near ${location}.`;
        arr.push(str);
    }
    
    // 50 Emergency System Tests
    let systemTypes = ["Civil Defense", "Emergency Broadcast", "Fallout Warning", "Air Raid Alert", "Nuclear Shelter", "Evacuation Protocol", "Critical Infrastructure", "Command Continuity", "Presidential Emergency", "FEMA Disaster"];
    for (let i = 0; i < 50; i++) {
        let system = systemTypes[Math.floor(Math.random() * systemTypes.length)];
        let status = Math.random() > 0.7 ? "FAILED" : "PASSED";
        let region = ["East Coast", "West Coast", "Midwest", "South", "Pacific", "Northeast", "Northwest", "Southeast", "Southwest", "Central"][Math.floor(Math.random() * 10)];
        let str = `TEST: ${system} System in ${region} region ${status}.`;
        arr.push(str);
    }
    
    // 50 Radiation Monitoring
    for (let i = 0; i < 50; i++) {
        let location = ["Nevada Test Site", "New Mexico", "Marshall Islands", "Pacific Test Range", "Bikini Atoll", "Johnston Atoll", "Aleutian Islands", "Arctic Circle", "South Atlantic", "Novaya Zemlya"][Math.floor(Math.random() * 10)];
        let level = Math.floor(Math.random() * 500) + 10;
        let status = level > 300 ? "ALERT" : "NORMAL";
        let str = `RAD: ${location} radiation level at ${level} rems. Status: ${status}.`;
        arr.push(str);
    }
    
    return arr;
}
