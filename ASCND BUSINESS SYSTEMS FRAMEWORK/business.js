// ============================================================
// ASCND BUSINESS SYSTEMS FRAMEWORK
// Business Configuration
// ============================================================
//
// This file contains the information that makes each business
// unique.
//
// The framework stays the same.
// The business configuration changes.
// ============================================================

const BUSINESS = {

    // --------------------------------------------------------
    // BASIC BUSINESS INFORMATION
    // --------------------------------------------------------

    name: "Blue Star Bike Co.",
    shortName: "Blue Star",

    industry: "Cycling",

    location: "San Antonio, Texas",

    tagline: "Ride San Antonio Differently.",


    // --------------------------------------------------------
    // NAVIGATION
    // --------------------------------------------------------

    navigation: [
        {
            label: "Home",
            id: "home"
        },
        {
            label: "Rentals",
            id: "rentals"
        },
        {
            label: "History",
            id: "history"
        },
        {
            label: "Repairs",
            id: "repairs"
        },
        {
            label: "Contact",
            id: "contact"
        }
    ],


    // --------------------------------------------------------
    // SYSTEM FEATURES
    // --------------------------------------------------------
    //
    // These determine which capabilities this business uses.
    //
    // Later, another business can simply turn features on/off.
    // --------------------------------------------------------

    features: {

        rentals: true,

        routes: true,

        repairs: true,

        contact: true,

        leadManagement: true,

        rentalTracking: true,

        followUp: true

    },


    // --------------------------------------------------------
    // RENTAL EXPERIENCES
    // --------------------------------------------------------

    rentalExperiences: [

        {
            id: "explore",
            title: "Rent & Explore",
            description:
                "Choose your bike, choose your time, and explore San Antonio your way."
        },

        {
            id: "route",
            title: "Rent a Route",
            description:
                "Choose a curated ride and discover where your bike can take you."
        }

    ],


    // --------------------------------------------------------
    // BIKE TYPES
    // --------------------------------------------------------

    bikes: [

        {
            id: "townie",
            name: "Townie",
            type: "Comfort / City",
            price: "$30/ 4 Hours $45/ 8 Hours",
            image: "css/assets/blue-star/townie.png",
            description:
                "An easygoing ride built for exploring the city."
        },

        {
            id: "road",
            name: "Road Bike",
            type: "Performance",
            price: "$40/ 4 Hours $55/ 8 Hours",
            image: "css/assets/blue-star/road-bike.png",
            description:
                "A faster ride for cyclists looking to cover more ground."
        },

        {
            id: "ebike",
            name: "E-Bike",
            type: "Electric",
            price: "$45/ 4 Hours $65/ 8 Hours",
            image: "css/assets/blue-star/ebike.png",
            description:
                "Extra power for longer rides and easier exploration."
                
        }
    

],


gear: {

    helmets: [
    {
        name: "Helmet",
        type: "HELMET",
        price: "$—",
        image: "css/assets/blue-star/helmet.png",
        description:
            "Protective helmet for everyday riding."
    },

    {
        name: "Road Helmet",
        type: "HELMET",
        price: "$—",
        image: "css/assets/blue-star/helmet.png",
        description:
            "Lightweight helmet for longer rides."
    },

    {
        name: "City Helmet",
        type: "HELMET",
        price: "$—",
        image: "css/assets/blue-star/helmet.png",
        description:
            "Comfortable helmet for everyday city riding."
    }
],

    locks: [
        {
            name: "Bike Lock",
            type: "LOCK",
            price: "$—",
            image: "css/assets/blue-star/lock.png",
            description:
                "Secure your bike while exploring."
        }
    ],

    baskets: [
        {
            name: "Bike Basket",
            type: "BASKET",
            price: "$—",
            image: "css/assets/blue-star/basket.png",
            description:
                "Convenient storage for your ride."
        }
    ],

    lights: [
        {
            name: "Bike Light",
            type: "LIGHT",
            price: "$—",
            image: "css/assets/blue-star/bike-light.png",
            description:
                "Stay visible while riding."
        }
    ],

    bottles: [
        {
            name: "Water Bottle",
            type: "BOTTLE",
            price: "$—",
            image: "css/assets/blue-star/bottle.png",
            description:
                "Keep hydrated on the ride."
        }
    ],

    accessories: [
        {
            name: "Bike Accessories",
            type: "ACCESSORY",
            price: "$—",
            image: "css/assets/blue-star/accessory.png",
            description:
                "Additional essentials for your ride."
        }
    ]

},

    // --------------------------------------------------------
    // ROUTES
    // --------------------------------------------------------
    //
    // These are currently CONCEPT routes for the demo.
    // Actual routes, pricing and availability would be
    // determined with the business.
    // --------------------------------------------------------

    routes: [

{
    name: "The River Walk",
    location: "WALK · EXPLORE · DOWNTOWN",
    description: "Park your bike and experience the heart of downtown on foot.",
    distance: "ON FOOT",
    duration: "1–2 HRS",
    difficulty: "WALK",
    image: "css/assets/blue-star/river-walk.png"
}, 

{
    name: "The Alamo / Hemisfair Park",
    location: "HISTORY · DOWNTOWN · CULTURE",
    description: "Ride toward two of San Antonio's most recognizable destinations in the heart of downtown.",
    distance: "1.7 MI",
    duration: "1–2 HRS",
    difficulty: "EASY",
    image: "css/assets/blue-star/alamo.png"
},

{
    name: "The Historic Pearl Brewery",
    location: "FOOD · CULTURE · SHOPPING",
    description: "Head north toward Pearl and experience one of San Antonio's most distinctive destinations.",
    distance: "ABOUT 3 MI",
    duration: "1–2 HRS",
    difficulty: "EASY",
    image: "css/assets/blue-star/pearl.png"
},

{
    name: "King William Historic District",
    location: "ARCHITECTURE · HISTORY · SOUTHTOWN",
    description: "Explore historic homes, neighborhood streets and the character of Southtown.",
    distance: "3.6 MI",
    duration: "1–2 HRS",
    difficulty: "EASY",
    image: "css/assets/blue-star/king-william.png"
},

{
    name: "Mission Trail",
    location: "HISTORY · NATURE · ADVENTURE",
    description: "Head south toward the historic missions and the Mission Reach trail system.",
    distance: "ABOUT 20 MI",
    duration: "3–5 HRS",
    difficulty: "MODERATE",
    image: "css/assets/blue-star/mission-ride.png"
},

    ],


    // --------------------------------------------------------
    // RENTAL DURATIONS
    // --------------------------------------------------------
    //
    // These are examples for the demo.
    // Actual pricing and rental periods would be determined
    // with Blue Star.
    // --------------------------------------------------------

    rentalDurations: [

        {
            id: "quick",
            name: "Quick Ride",
            duration: "2 Hours"
        },

        {
            id: "half",
            name: "Half Day",
            duration: "4 Hours"
        },

        {
            id: "full",
            name: "Full Day",
            duration: "8 Hours"
        }

    ]

};


// ============================================================
// EXPORT
// ============================================================
//
// This makes BUSINESS available to the other parts of the
// framework.
// ============================================================

window.BUSINESS = BUSINESS;