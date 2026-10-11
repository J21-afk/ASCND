require("dotenv").config();

if (!process.env.SUPABASE_URL && process.env.NODE_ENV !== "production") {
    require("dotenv").config({ path: "C:\\ASCND\\.env" });
}

console.log("SUPABASE URL LOADED:", !!process.env.SUPABASE_URL);
console.log("SUPABASE KEY LOADED:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);

const express = require("express");
const cors = require("cors");

const path = require("path");

const {
    createClient
} = require("@supabase/supabase-js");

const supabase =
    createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

const app = express();

app.use(cors());

const PORT =
    process.env.PORT ||
    3000;


/* =========================================================
   MIDDLEWARE
   ========================================================= */

app.use(
    express.json()
);

app.use(
    express.urlencoded({
        extended: true
    })
);

/* =========================================================
   PRIVATE OS API AUTHORIZATION
   Configure OS_ALLOWED_EMAIL or OS_ALLOWED_USER_ID on Render.
   ========================================================= */

app.get("/config.js", function (req, res) {
    res.type("application/javascript").send(
        "window.ASCND_CONFIG = " + JSON.stringify({
            supabaseUrl: process.env.SUPABASE_URL || "",
            supabaseAnonKey: process.env.SUPABASE_ANON_KEY ||
                process.env.SUPABASE_PUBLISHABLE_KEY || ""
        }) + ";"
    );
});
app.use("/api", async function (req, res, next) {
    const authorization = req.headers.authorization || "";
    const tokenMatch = authorization.match(/^Bearer\s+(.+)$/i);

    if (!tokenMatch) {
        return res.status(401).json({
            success: false,
            message: "Sign in to access the ASCND Operating System."
        });
    }

    try {
        const { data, error } = await supabase.auth.getUser(tokenMatch[1]);
        const user = data && data.user;

        if (error || !user) {
            return res.status(401).json({
                success: false,
                message: "Your session is invalid or has expired."
            });
        }

        const allowedId = (process.env.OS_ALLOWED_USER_ID || "").trim();
        const allowedEmail = (process.env.OS_ALLOWED_EMAIL || "").trim().toLowerCase();

        const isAllowed =
            (allowedId && user.id === allowedId) ||
            (allowedEmail && user.email &&
                user.email.toLowerCase() === allowedEmail);

        if (!isAllowed) {
            return res.status(403).json({
                success: false,
                message: "This account is not authorized to access this system."
            });
        }

        req.authUser = user;
        next();
    } catch (error) {
        console.error("OS authentication verification failed.");
        return res.status(401).json({
            success: false,
            message: "Unable to verify your session."
        });
    }
});



/* =========================================================
   HOME ROUTE
   ========================================================= */

app.get(
    "/",
    function (req, res) {

        res.sendFile(
            path.join(__dirname, "public", "index.html")
        );

    }
);


/* =========================================================
   STATIC WEBSITE
   ========================================================= */

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);

/* =========================================================
   SUPABASE CONNECTION TEST
   ========================================================= */

app.get(
    "/api/supabase-test",
    async function (req, res) {

        try {

            const {
                data,
                error
            } = await supabase
                .from("assessments")
                .select("id")
                .limit(1);


            if (error) {

                console.error(
                    "SUPABASE TEST ERROR:",
                    error
                );


                return res.status(500).json({

                    success: false,

                    message:
                        "Supabase connection failed.",

                    error:
                        error.message

                });

            }


            res.status(200).json({

                success: true,

                message:
                    "ASCND is connected to Supabase.",

                data:
                    data

            });

        }

        catch (error) {

            console.error(
                "SUPABASE CONNECTION ERROR:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Supabase connection failed.",

                error:
                    error.message

            });

        }

    }
);

/* =========================================================
   HEALTH CHECK
   ========================================================= */

app.get(
    "/api/status",
    function (req, res) {

        res.json({

            success: true,

            message:
                "ASCND backend is running."

        });

    }
);

/* =========================================================
   RADAR â€” ASCND INDUSTRY INTERPRETER
========================================================= */

function interpretRadarIndustry(industry) {

    const normalizedIndustry =
        String(industry || "")
            .toLowerCase()
            .trim();

    const industryMap = {

        /* =====================================================
           HOME & PROPERTY SERVICES
        ===================================================== */

        "home-property-services": [

            /* PROPERTY / CONSTRUCTION */
            "contractor",
            "contracting",
            "construction",
            "construction company",
            "general contractor",
            "home improvement",
            "remodeling",
            "renovation",
            "home repair",
            "home services",

            /* ROOFING */
            "roofing",
            "roofer",
            "roof",
            "roof repair",
            "roof replacement",

            /* FLOORING / COATINGS */
            "flooring",
            "floor",
            "carpet",
            "tile",
            "hardwood",
            "laminate",
            "vinyl",
            "epoxy",
            "epoxy flooring",
            "floor coating",
            "concrete coating",
            "concrete",
            "coatings",
            "polished concrete",
            "garage floor",

            /* HVAC */
            "hvac",
            "heating",
            "air conditioning",
            "air conditioner",
            "ac repair",
            "heating and cooling",

            /* PLUMBING */
            "plumbing",
            "plumber",
            "drain",
            "sewer",

            /* ELECTRICAL */
            "electrical",
            "electrician",

            /* LANDSCAPE / OUTDOOR */
            "landscaping",
            "landscape",
            "lawn care",
            "lawn service",
            "irrigation",
            "tree service",
            "tree care",
            "fencing",
            "fence",
            "deck",
            "decks",
            "patio",
            "garage door",
            "garage doors",

            /* CLEANING / MAINTENANCE */
            "cleaning",
            "house cleaning",
            "commercial cleaning",
            "janitorial",
            "pressure washing",
            "power washing",
            "carpet cleaning",
            "window cleaning",
            "window washing",
            "pest control",
            "exterminator",
            "pool service",
            "pool cleaning",
            "pool maintenance",

            /* PAINTING */
            "painting",
            "painter",

            /* INSTALLATION */
            "installer",
            "installation",
            "home installation",
            "cabinet",
            "cabinetry",

            /* PROPERTY SUPPORT */
            "handyman",
            "property maintenance",
            "property services",
            "home inspection",
            "inspection service",
            "restoration",
            "water damage",
            "fire damage",
            "mold remediation",

            /* REMOVAL / MOVING */
            "junk removal",
            "debris removal",
            "hauling",
            "moving",
            "movers",
            "moving company"

        ],


        /* =====================================================
           SPECIALTY SERVICES
        ===================================================== */

        "specialty-services": [

            /* AUTOMOTIVE */
            "auto detailing",
            "car detailing",
            "vehicle detailing",
            "detailing",
            "mobile detailing",
            "mobile mechanic",
            "mobile mechanics",
            "mechanic",
            "auto repair",
            "automotive repair",
            "automotive service",
            "transmission repair",
            "brake repair",
            "tire service",

            /* REPAIR */
            "appliance repair",
            "computer repair",
            "phone repair",
            "electronics repair",
            "device repair",
            "repair service",
            "locksmith",

            /* PERSONAL SERVICES */
            "barber",
            "barbershop",
            "hair salon",
            "salon",
            "beauty salon",
            "pet grooming",
            "dog grooming",
            "pet services",
            "dog daycare",
            "pet boarding",

            /* CREATIVE / PRODUCTION */
            "photography",
            "photographer",
            "videography",
            "videographer",
            "printing",
            "print shop",
            "printing services",
            "sign shop",
            "sign company",
            "graphics",
            "custom fabrication",
            "fabrication",

            /* EVENTS */
            "wedding services",
            "event services",
            "event planning",
            "event planner",
            "event rental",
            "party rental",
            "photo booth",

            /* SPECIALTY CRAFT */
            "upholstery",
            "auto upholstery",
            "furniture upholstery",
            "tailor",
            "tailoring",
            "alterations",
            "jewelry repair",

            /* MOBILE / CUSTOM */
            "mobile service",
            "mobile services",
            "specialty service",
            "specialty services",
            "custom service",
            "custom services"

        ],


        /* =====================================================
           CUSTOMER OPERATIONS
        ===================================================== */

        "customer-operations": [

            /*
             * These are intentionally broader.
             *
             * We are using this category to discover
             * customer-heavy service businesses.
             */

            /* FITNESS / TRAINING */
            "fitness",
            "gym",
            "personal trainer",
            "training",
            "training center",
            "martial arts",
            "yoga",
            "pilates",
            "dance studio",
            "dance school",

            /* EDUCATION / LESSONS */
            "tutoring",
            "tutoring service",
            "music lessons",
            "music school",
            "driving school",
            "training school",

            /* EVENTS / EXPERIENCES */
            "event venue",
            "wedding venue",
            "party venue",
            "event center",
            "event services",
            "event planning",
            "event planner",
            "photo booth",

            /* RENTALS */
            "rental",
            "rental company",
            "rental service",
            "equipment rental",
            "party rental",
            "event rental",
            "bike rental",
            "bicycle rental",
            "specialty rental",

            /* CUSTOMER-BASED CUSTOM SERVICES */
            "custom design",
            "custom work",
            "custom service",
            "custom services",
            "design service",

            /* RECURRING CUSTOMER OPERATIONS */
            "membership",
            "membership service",
            "subscription service",

            /* APPOINTMENT / BOOKING */
            "appointment",
            "appointments",
            "booking",
            "bookings",
            "reservation",
            "reservations"

        ],


        /* =====================================================
           SPECIFIC INDUSTRIES
           KEEP THESE
        ===================================================== */

        "epoxy flooring": [
            "epoxy",
            "epoxy flooring",
            "floor coating",
            "concrete coating",
            "concrete",
            "coatings",
            "polished concrete",
            "garage floor"
        ],

        "flooring": [
            "flooring",
            "floor",
            "carpet",
            "tile",
            "hardwood",
            "laminate",
            "vinyl"
        ],

        "roofing": [
            "roofing",
            "roofer",
            "roof",
            "roof repair",
            "roof replacement",
            "shingles"
        ],

        "landscaping": [
            "landscaping",
            "landscape",
            "lawn",
            "lawn care",
            "lawn service",
            "garden",
            "irrigation"
        ],

        "hvac": [
            "hvac",
            "heating",
            "air conditioning",
            "air conditioner",
            "ac repair",
            "heating and cooling"
        ],

        "plumbing": [
            "plumbing",
            "plumber",
            "pipe",
            "drain",
            "sewer"
        ],

        "auto detailing": [
            "auto detailing",
            "car detailing",
            "detailing",
            "mobile detailing",
            "vehicle detailing"
        ]

    };



    /* =====================================================
   RETURN MATCHING INDUSTRY VOCABULARY
===================================================== */

if (industryMap[normalizedIndustry]) {

    return industryMap[
        normalizedIndustry
    ];

}


/* =====================================================
   FALLBACK
===================================================== */

return normalizedIndustry
    .split(/[\s,/-]+/)
    .filter(
        function (term) {
            return term.length >= 3;
        }
    );

}

/* =========================================================
   RADAR â€” OPENSTREETMAP DISCOVERY PROVIDER
========================================================= */

async function discoverBusinessesFromOSM(
    location,
    industry
) {

    /*
     * ASCND currently uses OpenStreetMap as its
     * first discovery provider.
     *
     * This provider is intentionally isolated so
     * Radar can use additional sources later.
     */

    const nominatimUrl =
        "https://nominatim.openstreetmap.org/search?" +
        new URLSearchParams({
            q: location,
            format: "json",
            limit: "1"
        });

    const locationResponse =
        await fetch(
            nominatimUrl,
            {
                method: "GET",

                headers: {
                    "User-Agent":
                        "ASCND-Radar/1.0 (contact@ascndsystems.com)",
                    "Accept":
                        "application/json"
                }
            }
        );

    if (!locationResponse.ok) {

        throw new Error(
            "ASCND could not resolve the Radar location."
        );

    }

    const locationData =
        await locationResponse.json();

    if (
        !Array.isArray(locationData) ||
        locationData.length === 0
    ) {

        throw new Error(
            "Radar could not find the requested location."
        );

    }

    const latitude =
        Number(locationData[0].lat);

    const longitude =
        Number(locationData[0].lon);

    /*
     * Start with a focused geographic radius.
     * We can make this configurable later.
     */

    const radius =
        10000;

    const industryTerms =
    interpretRadarIndustry(
        industry
    );

const industryRegex =
    industryTerms
        .map(
            function (term) {

                return term
                    .replace(
                        /[.*+?^${}()|[\]\\]/g,
                        "\\$&"
                    );

            }
        )
        .join("|");


    const query = `
[out:json][timeout:25];
(
    nwr(
        around:${radius},
        ${latitude},
        ${longitude}
    )["shop"];

    nwr(
        around:${radius},
        ${latitude},
        ${longitude}
    )["craft"];

    nwr(
        around:${radius},
        ${latitude},
        ${longitude}
    )["office"];

    nwr(
        around:${radius},
        ${latitude},
        ${longitude}
    )["industrial"];

    nwr(
        around:${radius},
        ${latitude},
        ${longitude}
    )["service"];

    nwr(
        around:${radius},
        ${latitude},
        ${longitude}
    )["professional"];

    nwr(
        around:${radius},
        ${latitude},
        ${longitude}
    )["man_made"];
);
out center tags;
`;

    const overpassEndpoints = [

    "https://overpass-api.de/api/interpreter",

    "https://overpass.kumi.systems/api/interpreter"

];


let overpassResponse = null;


for (
    const endpoint of overpassEndpoints
) {

    try {

        console.log(
            "ASCND RADAR OVERPASS REQUEST:",
            endpoint
        );


        const response =
            await fetch(
                endpoint,
                {
                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/x-www-form-urlencoded",

                        "User-Agent":
                            "ASCND-Radar/1.0 (contact@ascndsystems.com)"

                    },

                    body:
                        new URLSearchParams({
                            data:
                                query
                        })

                }
            );


        if (response.ok) {

            overpassResponse =
                response;

            console.log(
                "ASCND RADAR OVERPASS SUCCESS:",
                endpoint
            );

            break;

        }


        const errorBody =
    await response.text();

console.warn(
    "ASCND RADAR OVERPASS PROVIDER FAILED:",
    endpoint,
    response.status
);

console.warn(
    "ASCND RADAR OVERPASS ERROR BODY:",
    errorBody.slice(0, 1000)
);

    }

    catch (error) {

        console.warn(
            "ASCND RADAR OVERPASS REQUEST ERROR:",
            endpoint,
            error.message
        );

    }

}


if (!overpassResponse) {

    throw new Error(
        "Radar discovery providers were unavailable."
    );

}

    if (!overpassResponse.ok) {

    const providerError =
        await overpassResponse.text();

    console.error(
        "ASCND RADAR OVERPASS ERROR:",
        overpassResponse.status,
        providerError
    );

    throw new Error(
        `Radar discovery provider failed (${overpassResponse.status}).`
    );

}

    const overpassData =
        await overpassResponse.json();

    const elements =
        Array.isArray(
            overpassData.elements
        )
            ? overpassData.elements
            : [];

    const normalized =
        elements
            .map(
                function (element) {

                    const tags =
                        element.tags || {};

                    return {

                        source:
                            "OpenStreetMap",

                        source_id:
                            `${element.type}/${element.id}`,

                        business_name:
                            tags.name ||
                            "Unknown",

                        website:
                            tags.website ||
                            tags["contact:website"] ||
                            null,

                        phone:
                            tags.phone ||
                            tags["contact:phone"] ||
                            null,

                        osm_tags:
                           tags,

                        industry:
                            industry,

                        location:
                            location,

                        latitude:
                            element.lat ||
                            element.center?.lat ||
                            null,

                        longitude:
                            element.lon ||
                            element.center?.lon ||
                            null,

                        review_status:
                            "REVIEW"

                    };

                }
            )
            .filter(
                function (business) {

                    return (
                        business.business_name !==
                        "Unknown"
                    );

                }
            );

    /*
     * Remove duplicate business names.
     */

    const unique =
    Array.from(
        new Map(
            normalized.map(
                function (business) {
                    return [
                        business.business_name
                            .toLowerCase(),
                        business
                    ];
                }
            )
        ).values()
    );

/* =========================================================
   RADAR â€” BUSINESS VALIDATION
========================================================= */

const validated =
    unique.filter(
        function (business) {

            const tags =
                business.osm_tags || {};

            const businessName =
                String(
                    business.business_name || ""
                )
                    .toLowerCase()
                    .trim();

            const businessType =
                [
                    tags.shop,
                    tags.craft,
                    tags.office,
                    tags.industrial,
                    tags.amenity
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();


            /* =================================================
               EXCLUDE NON-BUSINESS PLACES
            ================================================= */

            const excludedTerms = [

                "building",
                "garden",
                "park",
                "plaza",
                "square",
                "center",
                "centre",
                "facility",
                "campus",
                "library",
                "museum",
                "school",
                "university",
                "church",
                "temple",
                "cemetery",
                "government",
                "city hall",
                "community center",
                "community centre"

            ];


            const matchesExcludedTerm =
                excludedTerms.some(
                    function (term) {

                        return (
                            businessName.includes(term) ||
                            businessType.includes(term)
                        );

                    }
                );


            if (matchesExcludedTerm) {

                return false;

            }


            /* =================================================
               REQUIRE SOME BUSINESS CONTEXT
            ================================================= */

            const hasBusinessContext =
                Boolean(
                    tags.shop ||
                    tags.craft ||
                    tags.office ||
                    tags.industrial ||
                    tags.amenity
                );


            if (!hasBusinessContext) {

                return false;

            }


            return true;

        }
    );


console.log(
    "RADAR BUSINESS VALIDATION:",
    {
        discoveredBeforeValidation:
            unique.length,

        remainingAfterValidation:
            validated.length
    }
);

/* =========================================================
   RADAR â€” INDUSTRY RELEVANCE FILTER
========================================================= */

const broadRadarIndustries = [
    "home-property-services",
    "specialty-services",
    "customer-operations"
];


const isBroadIndustry =
    broadRadarIndustries.includes(
        industry
    );


const relevant =
    validated.filter(
        function (business) {

            /*
               ------------------------------------------------
               BROAD DISCOVERY CATEGORIES
               ------------------------------------------------

               Do not aggressively filter these businesses.

               Radar's intelligence layer will determine
               whether the business actually represents an
               opportunity.
            */

            if (
                isBroadIndustry
            ) {

                return true;

            }


            /*
               ------------------------------------------------
               SPECIFIC INDUSTRY SEARCH
               ------------------------------------------------

               Specific searches still use industry vocabulary.
            */

            if (!industry) {

                return true;

            }


            const terms =
                interpretRadarIndustry(
                    industry
                );


            const businessText =
                [
                    business.business_name,
                    business.osm_tags?.name,
                    business.osm_tags?.shop,
                    business.osm_tags?.craft,
                    business.osm_tags?.office,
                    business.osm_tags?.industrial,
                    business.osm_tags?.amenity,
                    business.osm_tags?.service,
                    business.osm_tags?.description
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();


            return terms.some(
                function (term) {

                    return businessText.includes(
                        term.toLowerCase()
                    );

                }
            );

        }
    );


console.log(
    "RADAR INDUSTRY FILTER:",
    {
        requestedIndustry:
            industry,

        discoveredBeforeFilter:
            validated.length,

        remainingAfterFilter:
            relevant.length
    }
);

console.log(
    "RADAR INDUSTRY FILTER:",
    {
        requestedIndustry:
            industry,

        discoveredBeforeFilter:
            unique.length,

        remainingAfterFilter:
            relevant.length
    }
);


/* =========================================================
   RADAR â€” WEBSITE RESEARCH
========================================================= */

const researched =
    await Promise.all(
        relevant
            .slice(0, 100)
            .map(
                async function (business) {

                    const websiteCheck =
    await inspectRadarWebsite(
        business.website,
        business
    );

                    return {
                        ...business,

                        website_check:
                            websiteCheck
                    };

                }
            )
    );

/* =========================================================
   RADAR â€” BUSINESS UNDERSTANDING ENGINE
========================================================= */

function understandRadarBusiness(business) {

    const website =
        business.website_check || {};

    const websiteSignals =
        website.signals || {};

    const businessText =
        [
            business.business_name,
            business.industry,
            business.osm_tags?.name,
            business.osm_tags?.shop,
            business.osm_tags?.craft,
            business.osm_tags?.office,
            business.osm_tags?.industrial,
            business.osm_tags?.description
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();


    /*
       -------------------------------------------------------
       BUSINESS MODEL
       -------------------------------------------------------
    */

    const models = [];


    const localServiceTerms = [
        "contractor",
        "construction",
        "flooring",
        "roofing",
        "hvac",
        "heating",
        "air conditioning",
        "plumbing",
        "electrician",
        "electrical",
        "landscaping",
        "lawn",
        "painting",
        "concrete",
        "epoxy",
        "fencing",
        "handyman",
        "cleaning",
        "restoration",
        "pool",
        "pressure washing",
        "pest control",
        "home improvement",
        "repair",
        "installation"
    ];


    const appointmentTerms = [
        "barber",
        "barbershop",
        "salon",
        "beauty",
        "spa",
        "massage",
        "fitness",
        "gym",
        "trainer",
        "yoga",
        "pilates",
        "detailing",
        "grooming",
        "photography",
        "tutoring"
    ];


    const rentalTerms = [
        "rental",
        "rentals",
        "equipment rental",
        "bike rental",
        "party rental",
        "event rental"
    ];


    const retailTerms = [
        "retail",
        "shop",
        "store",
        "boutique"
    ];


    const customServiceTerms = [
        "design",
        "fabrication",
        "custom",
        "photography",
        "creative",
        "printing",
        "signs",
        "sign company"
    ];


    if (
        localServiceTerms.some(
            function(term) {
                return businessText.includes(term);
            }
        )
    ) {

        models.push("LOCAL_SERVICE");

    }


    if (
        appointmentTerms.some(
            function(term) {
                return businessText.includes(term);
            }
        )
    ) {

        models.push("APPOINTMENT_SERVICE");

    }


    if (
        rentalTerms.some(
            function(term) {
                return businessText.includes(term);
            }
        )
    ) {

        models.push("RENTAL");

    }


    if (
        retailTerms.some(
            function(term) {
                return businessText.includes(term);
            }
        )
    ) {

        models.push("RETAIL");

    }


    if (
        customServiceTerms.some(
            function(term) {
                return businessText.includes(term);
            }
        )
    ) {

        models.push("CUSTOM_SERVICE");

    }


    if (!models.length) {

        models.push("GENERAL_SERVICE");

    }


    /*
       -------------------------------------------------------
       CUSTOMER INTENT
       -------------------------------------------------------
    */

    const customerIntent = [];


    if (
        models.includes("LOCAL_SERVICE") ||
        models.includes("GENERAL_SERVICE")
    ) {

        customerIntent.push(
            "GET_INFORMATION"
        );

        customerIntent.push(
            "CONTACT_BUSINESS"
        );

    }


    if (
        models.includes("LOCAL_SERVICE")
    ) {

        customerIntent.push(
            "REQUEST_SERVICE"
        );

        customerIntent.push(
            "GET_ESTIMATE"
        );

    }


    if (
        models.includes("APPOINTMENT_SERVICE")
    ) {

        customerIntent.push(
            "BOOK_APPOINTMENT"
        );

    }


    if (
        models.includes("RENTAL")
    ) {

        customerIntent.push(
            "VIEW_OPTIONS"
        );

        customerIntent.push(
            "CHECK_AVAILABILITY"
        );

        customerIntent.push(
            "RESERVE"
        );

    }


    if (
        models.includes("RETAIL")
    ) {

        customerIntent.push(
            "VIEW_PRODUCTS"
        );

        customerIntent.push(
            "PURCHASE"
        );

    }


    if (
        models.includes("CUSTOM_SERVICE")
    ) {

        customerIntent.push(
            "VIEW_WORK"
        );

        customerIntent.push(
            "INQUIRE"
        );

    }


    /*
       -------------------------------------------------------
       EXPECTED CUSTOMER PATHS
       -------------------------------------------------------
    */

    const expectedPaths = [];


    if (
        customerIntent.includes(
            "GET_INFORMATION"
        )
    ) {

        expectedPaths.push(
            "INFORMATION"
        );

    }


    if (
        customerIntent.includes(
            "CONTACT_BUSINESS"
        )
    ) {

        expectedPaths.push(
            "CONTACT"
        );

    }


    if (
        customerIntent.includes(
            "REQUEST_SERVICE"
        )
    ) {

        expectedPaths.push(
            "SERVICE_REQUEST"
        );

    }


    if (
        customerIntent.includes(
            "GET_ESTIMATE"
        )
    ) {

        expectedPaths.push(
            "QUOTE_OR_ESTIMATE"
        );

    }


    if (
        customerIntent.includes(
            "BOOK_APPOINTMENT"
        )
    ) {

        expectedPaths.push(
            "BOOKING"
        );

    }


    if (
        customerIntent.includes(
            "CHECK_AVAILABILITY"
        )
    ) {

        expectedPaths.push(
            "AVAILABILITY"
        );

    }


    if (
        customerIntent.includes(
            "RESERVE"
        )
    ) {

        expectedPaths.push(
            "RESERVATION"
        );

    }


    if (
        customerIntent.includes(
            "PURCHASE"
        )
    ) {

        expectedPaths.push(
            "PURCHASE"
        );

    }


    if (
        customerIntent.includes(
            "VIEW_WORK"
        )
    ) {

        expectedPaths.push(
            "PORTFOLIO"
        );

    }


    /*
       -------------------------------------------------------
       OBSERVED CUSTOMER PATHS
       -------------------------------------------------------
    */

    const observedPaths = [];


    if (
        websiteSignals.phone ||
        websiteSignals.email ||
        websiteSignals.contact ||
        websiteSignals.contactForm
    ) {

        observedPaths.push(
            "CONTACT"
        );

    }


    if (
        websiteSignals.inquiry ||
        websiteSignals.callToAction
    ) {

        observedPaths.push(
            "SERVICE_REQUEST"
        );

    }


    if (
        websiteSignals.quote ||
        websiteSignals.estimate
    ) {

        observedPaths.push(
            "QUOTE_OR_ESTIMATE"
        );

    }


    if (
        websiteSignals.booking ||
        websiteSignals.appointment
    ) {

        observedPaths.push(
            "BOOKING"
        );

    }


    /*
       -------------------------------------------------------
       RETURN BUSINESS MODEL
       -------------------------------------------------------
    */

    return {

        businessModel:
            models[0],

        businessModels:
            models,

        customerIntent:
            Array.from(
                new Set(
                    customerIntent
                )
            ),

        expectedPaths:
            Array.from(
                new Set(
                    expectedPaths
                )
            ),

        observedPaths:
            Array.from(
                new Set(
                    observedPaths
                )
            )

    };

}


/* =========================================================
   RADAR â€” OPPORTUNITY REASONING ENGINE
========================================================= */

function reasonRadarOpportunity(
    business,
    understanding
) {

    const website =
        business.website_check || {};

    const websiteSignals =
        website.signals || {};

    const status =
        String(
            website.status || ""
        ).toUpperCase();


    const opportunities = [];


    /*
       =====================================================
       RULE 01
       WEBSITE AVAILABILITY
       =====================================================
    */

    if (
        status === "UNREACHABLE" ||
        status === "HTTP_ERROR"
    ) {

        opportunities.push({

            type:
                "WEBSITE_AVAILABILITY_ISSUE",

            category:
                "DIGITAL",

            severity:
                "HIGH",

            confidence:
                0.95,

            observation:
                status === "HTTP_ERROR"
                    ? `The business website returned HTTP status ${website.statusCode}.`
                    : "The business website could not be retrieved during Radar's inspection.",

            signal:
                "WEBSITE AVAILABILITY ISSUE",

            reasoning:
                "The business has an identified website, but Radar could not establish a working customer-facing connection to it.",

            nextMove:
                "Verify the website status and determine whether customers currently have another active digital entry point."

        });

    }


    /*
       =====================================================
       RULE 02
       QUOTE / ESTIMATE FRICTION
       =====================================================
    */

    if (
        status === "REACHABLE" &&
        understanding.expectedPaths.includes(
            "QUOTE_OR_ESTIMATE"
        ) &&
        !understanding.observedPaths.includes(
            "QUOTE_OR_ESTIMATE"
        )
    ) {

        opportunities.push({

            type:
                "QUOTE_PATH_GAP",

            category:
                "CUSTOMER PROCESS",

            severity:
                "MEDIUM",

            confidence:
                0.82,

            observation:
                "The business appears to operate as a service business where customers may need an estimate or quote, but no visible quote or estimate path was identified.",

            signal:
                "QUOTE PATH GAP",

            reasoning:
                "A likely customer acquisition step appears to depend on direct interaction rather than a clearly identified digital quote or estimate path.",

            nextMove:
                "Investigate how new estimate requests are currently received, qualified, and followed up."

        });

    }


    /*
       =====================================================
       RULE 03
       APPOINTMENT FRICTION
       =====================================================
    */

    if (
        status === "REACHABLE" &&
        understanding.expectedPaths.includes(
            "BOOKING"
        ) &&
        !understanding.observedPaths.includes(
            "BOOKING"
        )
    ) {

        opportunities.push({

            type:
                "BOOKING_PATH_GAP",

            category:
                "CUSTOMER PROCESS",

            severity:
                "MEDIUM",

            confidence:
                0.80,

            observation:
                "The business appears appointment-oriented, but Radar did not identify a visible booking or scheduling path.",

            signal:
                "BOOKING PATH GAP",

            reasoning:
                "Customers may need to initiate an appointment through direct communication rather than a clearly identified scheduling path.",

            nextMove:
                "Investigate how appointments are currently scheduled and whether the process is handled manually."

        });

    }


    /*
       =====================================================
       RULE 04
       CONTACT FRICTION
       =====================================================
    */

    if (
        status === "REACHABLE" &&
        understanding.expectedPaths.includes(
            "CONTACT"
        )
    ) {

        const hasContact =
            understanding.observedPaths.includes(
                "CONTACT"
            );


        if (!hasContact) {

            opportunities.push({

                type:
                    "CONTACT_PATH_GAP",

                category:
                    "LEAD MANAGEMENT",

                severity:
                    "MEDIUM",

                confidence:
                    0.84,

                observation:
                    "Radar could not identify a clear customer contact path within the retrieved website.",

                signal:
                    "CONTACT PATH GAP",

                reasoning:
                    "The website appears to provide a digital presence without a clearly identifiable path for a prospective customer to initiate contact.",

                nextMove:
                    "Investigate how new customer inquiries currently enter the business."

            });

        }

    }


    /*
       =====================================================
       RULE 05
       NO MEANINGFUL OPPORTUNITY
       =====================================================
    */

    if (
        !opportunities.length
    ) {

        return {

            decision:
                "DISCARD",

            opportunities:
                [],

            reasoning:
                "Radar did not identify sufficiently supported customer, digital, or operational friction."

        };

    }


    /*
       =====================================================
       QUALIFY
       =====================================================
    */

    const strongestOpportunity =
        opportunities
            .slice()
            .sort(
                function(a, b) {

                    return (
                        b.confidence -
                        a.confidence
                    );

                }
            )[0];


    return {

        decision:
            "SURFACE",

        opportunities:
            opportunities,

        strongestOpportunity:
            strongestOpportunity,

        reasoning:
            "Radar identified one or more evidence-supported areas of potential friction worth investigating."

    };

}

/* =========================================================
   RADAR â€” INTELLIGENCE QUALIFICATION
========================================================= */

return researched
    .map(
        function (business) {

            /*
               ---------------------------------------------
               UNDERSTAND THE BUSINESS
               ---------------------------------------------
            */

            const understanding =
                understandRadarBusiness(
                    business
                );


            /*
               ---------------------------------------------
               REASON ABOUT FRICTION
               ---------------------------------------------
            */

            const reasoning =
                reasonRadarOpportunity(
                    business,
                    understanding
                );


            /*
               ---------------------------------------------
               DISCARD BUSINESSES WITHOUT
               MEANINGFUL FRICTION
               ---------------------------------------------
            */

            if (
                reasoning.decision ===
                "DISCARD"
            ) {

                return null;

            }


            /*
               ---------------------------------------------
               CONVERT OPPORTUNITIES INTO
               EXISTING RADAR SIGNAL FORMAT
               ---------------------------------------------
            */

            const signals =
                reasoning.opportunities.map(
                    function(opportunity) {

                        return {

                            category:
                                opportunity.category,

                            type:
                                opportunity.type,

                            observation:
                                opportunity.observation,

                            signal:
                                opportunity.signal,

                            reasoning:
                                opportunity.reasoning,

                            nextMove:
                                opportunity.nextMove,

                            severity:
                                opportunity.severity,

                            confidence:
                                opportunity.confidence,

                            isOpportunity:
                                true

                        };

                    }
                );


            const priority =
                determineRadarPriority(
                    signals
                );


            return {

                ...business,

                radarDecision:
                    reasoning.decision,

                businessUnderstanding:
                    understanding,

                radarReasoning:
                    reasoning,

                signals:
                    signals,

                priority:
                    priority

            };

        }
    )
    .filter(
        function(business) {

            return business !== null;

        }
    )
    .sort(
        function(a, b) {

            const priorityOrder = {

                HIGH: 3,
                MEDIUM: 2,
                LOW: 1

            };


            return (
                priorityOrder[b.priority] -
                priorityOrder[a.priority]
            );

        }
    );

}

/* =========================================================
   RADAR â€” WEBSITE INTELLIGENCE INSPECTOR
========================================================= */

async function inspectRadarWebsite(website, business) {

    if (!website) {

        return {

            status: "WEBSITE_NOT_PROVIDED",

            reachable: false,

            statusCode: null,

            finalUrl: null,

            error: null,

            verified: false,

            verification:
                "The discovery source did not provide a website.",

            title: null,

            textLength: 0,

            signals: {

                contact: false,
                phone: false,
                email: false,
                contactForm: false,
                quote: false,
                estimate: false,
                booking: false,
                appointment: false,
                inquiry: false,
                callToAction: false

            }

        };

    }


    let url =
        String(website).trim();


    if (!/^https?:\/\//i.test(url)) {

        url =
            `https://${url}`;

    }


    try {

        const controller =
            new AbortController();


        const timeout =
            setTimeout(
                function () {

                    controller.abort();

                },
                8000
            );


        const response =
            await fetch(
                url,
                {

                    method: "GET",

                    redirect: "follow",

                    signal:
                        controller.signal,

                    headers: {

                        "User-Agent":
                            "ASCND-Radar/1.0 (contact@ascndsystems.com)",

                        "Accept":
                            "text/html,application/xhtml+xml"

                    }

                }
            );


        clearTimeout(timeout);


        const html =
            await response.text();


        /* =====================================================
           PAGE TITLE
        ===================================================== */

        const titleMatch =
            html.match(
                /<title[^>]*>([\s\S]*?)<\/title>/i
            );


        const title =
            titleMatch
                ? titleMatch[1]
                    .replace(/\s+/g, " ")
                    .trim()
                : null;


        /* =====================================================
           PAGE TEXT
        ===================================================== */

        const pageText =
            html

                .replace(
                    /<script[\s\S]*?<\/script>/gi,
                    " "
                )

                .replace(
                    /<style[\s\S]*?<\/style>/gi,
                    " "
                )

                .replace(
                    /<noscript[\s\S]*?<\/noscript>/gi,
                    " "
                )

                .replace(
                    /<[^>]+>/g,
                    " "
                )

                .replace(
                    /&nbsp;/gi,
                    " "
                )

                .replace(
                    /&amp;/gi,
                    "&"
                )

                .replace(
                    /\s+/g,
                    " "
                )

                .trim();


        const normalizedText =
            pageText.toLowerCase();


        /* =====================================================
           CONTACT
        ===================================================== */

        const hasPhone =
            /(\+?1[\s.-]?)?(\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]\d{4}/
                .test(pageText);


        const hasEmail =
            /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i
                .test(pageText);


        const hasContactLanguage =
            /\bcontact\b|\bcontact us\b|\bget in touch\b|\breach us\b/i
                .test(normalizedText);


        const hasContactForm =
            /<form\b/i.test(html) &&
            (
                hasContactLanguage ||
                /name=["'][^"']*(message|email|phone|contact)[^"']*["']/i
                    .test(html)
            );


        /* =====================================================
           QUOTE / ESTIMATE
        ===================================================== */

        const hasQuote =
            /\bquote\b|\brequest a quote\b|\bget a quote\b|\bfree quote\b/i
                .test(normalizedText);


        const hasEstimate =
            /\bestimate\b|\brequest an estimate\b|\bget an estimate\b|\bfree estimate\b/i
                .test(normalizedText);


        /* =====================================================
           BOOKING / APPOINTMENT
        ===================================================== */

        const hasBooking =
            /\bbook now\b|\bbook online\b|\bbooking\b|\breservation\b|\breserve\b/i
                .test(normalizedText);


        const hasAppointment =
            /\bappointment\b|\bschedule an appointment\b|\bschedule service\b/i
                .test(normalizedText);


        /* =====================================================
           INQUIRY / CUSTOMER ACTION
        ===================================================== */

        const hasInquiry =
            /\binquir(?:y|e)\b|\brequest service\b|\brequest information\b|\blearn more\b/i
                .test(normalizedText);


        const hasCallToAction =
            /\bget started\b|\bget a quote\b|\brequest\b|\bbook now\b|\bcontact us\b|\bschedule\b|\bcall now\b|\bstart here\b/i
                .test(normalizedText);


        /* =====================================================
           WEBSITE RESULT
        ===================================================== */

        return {

            status:
                response.ok
                    ? "REACHABLE"
                    : "HTTP_ERROR",

            reachable:
                response.ok,

            statusCode:
                response.status,

            finalUrl:
                response.url || url,

            error:
                null,

            verified:
                response.ok,

            verification:
                response.ok
                    ? "Radar successfully retrieved the business website."
                    : `The business website returned HTTP status ${response.status}.`,

            title:
                title,

            textLength:
                pageText.length,

            signals: {

                contact:
                    hasContactLanguage,

                phone:
                    hasPhone,

                email:
                    hasEmail,

                contactForm:
                    hasContactForm,

                quote:
                    hasQuote,

                estimate:
                    hasEstimate,

                booking:
                    hasBooking,

                appointment:
                    hasAppointment,

                inquiry:
                    hasInquiry,

                callToAction:
                    hasCallToAction

            }

        };

    }

    catch (error) {

        return {

            status:
                "UNREACHABLE",

            reachable:
                false,

            statusCode:
                null,

            finalUrl:
                url,

            error:
                error.name === "AbortError"
                    ? "TIMEOUT"
                    : error.message,

            verified:
                false,

            verification:
                "Radar could not retrieve the business website.",

            title:
                null,

            textLength:
                0,

            signals: {

                contact: false,
                phone: false,
                email: false,
                contactForm: false,
                quote: false,
                estimate: false,
                booking: false,
                appointment: false,
                inquiry: false,
                callToAction: false

            }

        };

    }

}

/* =========================================================
   RADAR â€” PROBLEM DETECTION ENGINE
========================================================= */

function detectRadarProblems(business) {

    const problems = [];

    const website =
        business.website_check || {};

    const websiteSignals =
        website.signals || {};

    const status =
        String(
            website.status || ""
        ).toUpperCase();

    const businessText =
        [
            business.business_name,
            business.industry,
            business.osm_tags?.name,
            business.osm_tags?.shop,
            business.osm_tags?.craft,
            business.osm_tags?.office,
            business.osm_tags?.industrial
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();


    /* =====================================================
       PROBLEM 01 â€” WEBSITE AVAILABILITY
    ===================================================== */

    if (
        status === "UNREACHABLE" ||
        status === "HTTP_ERROR"
    ) {

        problems.push({

            type:
                "WEBSITE_AVAILABILITY_ISSUE",

            category:
                "DIGITAL",

            severity:
                "HIGH",

            confidence:
                0.95,

            evidence: [
                status === "HTTP_ERROR"
                    ? `Website returned HTTP status ${website.statusCode}.`
                    : "Radar could not retrieve the business website."
            ],

            observation:
                status === "HTTP_ERROR"
                    ? `The business website returned HTTP status ${website.statusCode}.`
                    : "The business website could not be reached during Radar inspection.",

            review:
                "Verify the website is actually unavailable before treating this as an outreach opportunity.",

            isOpportunity:
                true

        });

    }


    /* =====================================================
       PROBLEM 02 â€” LEAD ACCESS GAP
    ===================================================== */

    if (
        status === "REACHABLE"
    ) {

        const hasLeadPath =
            Boolean(
                websiteSignals.phone ||
                websiteSignals.email ||
                websiteSignals.contactForm ||
                websiteSignals.contact ||
                websiteSignals.inquiry ||
                websiteSignals.callToAction
            );


        if (
            !hasLeadPath
        ) {

            problems.push({

                type:
                    "LEAD_ACCESS_GAP",

                category:
                    "LEAD MANAGEMENT",

                severity:
                    "MEDIUM",

                confidence:
                    0.80,

                evidence: [
                    "Website was successfully retrieved.",
                    "Radar did not identify a clear customer contact or inquiry path."
                ],

                observation:
                    "The website is reachable, but Radar did not identify a clear customer contact or inquiry path.",

                review:
                    "Review the website manually to confirm whether customers have an effective way to initiate contact.",

                isOpportunity:
                    true

            });

        }

    }


    /* =====================================================
       PROBLEM 03 â€” QUOTE / ESTIMATE PATH
    ===================================================== */

    const quoteDrivenTerms = [

        "contractor",
        "construction",
        "flooring",
        "roofing",
        "roofer",
        "remodeling",
        "renovation",
        "painting",
        "concrete",
        "epoxy",
        "landscaping",
        "lawn",
        "hvac",
        "plumbing",
        "electrician",
        "electrical",
        "fencing",
        "handyman",
        "pressure washing",
        "cleaning",
        "restoration",
        "pool",
        "property maintenance",
        "home improvement"

    ];


    const appearsQuoteDriven =
        quoteDrivenTerms.some(
            function(term) {

                return businessText.includes(
                    term
                );

            }
        );


    if (
        status === "REACHABLE" &&
        appearsQuoteDriven
    ) {

        const hasQuotePath =
            Boolean(
                websiteSignals.quote ||
                websiteSignals.estimate
            );


        if (
            !hasQuotePath
        ) {

            problems.push({

                type:
                    "QUOTE_PATH_GAP",

                category:
                    "CUSTOMER PROCESS",

                severity:
                    "MEDIUM",

                confidence:
                    0.78,

                evidence: [
                    "Website was successfully retrieved.",
                    "Business appears to operate in a quote-driven service category.",
                    "Radar did not identify a visible quote or estimate path."
                ],

                observation:
                    "The business appears to operate in a quote-driven service category, but Radar did not identify a visible quote or estimate path.",

                review:
                    "Review the website manually to confirm whether quoting is handled through another customer path.",

                isOpportunity:
                    true

            });

        }

    }


    /* =====================================================
       PROBLEM 04 â€” BOOKING PATH
    ===================================================== */

    const appointmentTerms = [

        "barber",
        "barbershop",
        "salon",
        "hair",
        "beauty",
        "detailing",
        "auto detailing",
        "pet grooming",
        "dog grooming",
        "fitness",
        "gym",
        "trainer",
        "massage",
        "spa",
        "yoga",
        "pilates",
        "tutoring",
        "photography"

    ];


    const appearsAppointmentBased =
        appointmentTerms.some(
            function(term) {

                return businessText.includes(
                    term
                );

            }
        );


    if (
        status === "REACHABLE" &&
        appearsAppointmentBased
    ) {

        const hasBookingPath =
            Boolean(
                websiteSignals.booking ||
                websiteSignals.appointment
            );


        if (
            !hasBookingPath
        ) {

            problems.push({

                type:
                    "BOOKING_PATH_GAP",

                category:
                    "CUSTOMER PROCESS",

                severity:
                    "MEDIUM",

                confidence:
                    0.76,

                evidence: [
                    "Website was successfully retrieved.",
                    "Business appears to operate in an appointment-oriented category.",
                    "Radar did not identify a visible booking or appointment path."
                ],

                observation:
                    "The business appears appointment-oriented, but Radar did not identify a visible booking or scheduling path.",

                review:
                    "Review the website manually to confirm whether appointments are handled through another system.",

                isOpportunity:
                    true

            });

        }

    }


    /* =====================================================
       PROBLEM 05 â€” DIGITAL PRESENCE GAP
    ===================================================== */

    if (
        !business.website &&
        business.business_name
    ) {

        problems.push({

            type:
                "DIGITAL_PRESENCE_GAP",

            category:
                "DIGITAL",

            severity:
                "MEDIUM",

            confidence:
                0.70,

            evidence: [
                "No website was provided by the discovery source."
            ],

            observation:
                "No business website was identified in the current discovery data.",

            review:
                "Verify the business's current digital presence before considering outreach.",

            isOpportunity:
                true

        });

    }


    return problems;

}

/* =========================================================
   RADAR â€” ASCND PRIORITY ENGINE
========================================================= */

function determineRadarPriority(signals) {

    const signalTypes =
        Array.isArray(signals)
            ? signals.map(
                function (signal) {

                    return String(
                        signal.type || ""
                    ).toUpperCase();

                }
            )
            : [];


    /* =====================================================
       HIGH PRIORITY
       Strong observable digital weakness
    ===================================================== */

    const highPrioritySignals = [

        "NO_WEBSITE",

        "WEBSITE_UNREACHABLE",

        "WEBSITE_HTTP_ERROR",

        "NO_CONTACT_PATH",

        "NO_LEAD_PATH",

        "BROKEN_WEBSITE",

        "BROKEN_CONTACT_PATH"

    ];


    const hasHighPrioritySignal =
        signalTypes.some(
            function (type) {

                return highPrioritySignals.includes(
                    type
                );

            }
        );


    if (hasHighPrioritySignal) {

        return "HIGH";

    }


    /* =====================================================
       MEDIUM PRIORITY
       Potential friction requiring investigation
    ===================================================== */

    const mediumPrioritySignals = [

        "WEAK_CONTACT_PATH",

        "NO_QUOTE_PATH",

        "NO_BOOKING_PATH",

        "NO_INQUIRY_PATH",

        "WEAK_LEAD_PATH",

        "LIMITED_DIGITAL_PRESENCE",

        "WEBSITE_CONTENT_REVIEW"

    ];


    const hasMediumPrioritySignal =
        signalTypes.some(
            function (type) {

                return mediumPrioritySignals.includes(
                    type
                );

            }
        );


    if (hasMediumPrioritySignal) {

        return "MEDIUM";

    }


    /* =====================================================
       LOW PRIORITY
       Functioning presence / no major issue detected
    ===================================================== */

    if (
        signalTypes.includes(
            "WEBSITE_REACHABLE"
        )
    ) {

        return "LOW";

    }


    /* =====================================================
       DEFAULT
    ===================================================== */

    return "LOW";

}

/* =========================================================
   RADAR â€” ASCND DISCOVERY ENGINE
========================================================= */

app.post(
    "/api/radar/discover",
    async function (req, res) {

        console.log(
            "RADAR DISCOVER ROUTE HIT:",
            req.body
        );

        try {

            const location =
                String(
                    req.body.location || ""
                ).trim();

            const industry =
                String(
                    req.body.industry || ""
                ).trim();

            const signal =
                String(
                    req.body.signal || ""
                ).trim();

            if (!location) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Radar location is required."
                });

            }

            /*
             * ASCND DISCOVERY ENGINE
             *
             * This is intentionally provider-neutral.
             *
             * Discovery sources will be connected here
             * as ASCND builds its own intelligence layer.
             */

            let results =
    await discoverBusinessesFromOSM(
        location,
        industry
    );

console.log(
    "RADAR DISCOVERED BUSINESSES:",
    results.length
);

            console.log(
                "ASCND RADAR CRITERIA:",
                {
                    location,
                    industry,
                    signal
                }
            );

            res.status(200).json({

                success: true,

                engine:
                    "ASCND RADAR",

                criteria: {

                    location:
                        location,

                    industry:
                        industry,

                    signal:
                        signal

                },

                count:
                    results.length,

                results:
                    results

            });

        }

        catch (error) {

            console.error(
                "ASCND RADAR DISCOVERY ERROR:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "ASCND Radar discovery failed.",

                error:
                    error.message

            });

        }

    }
);

/* =========================================================
   ASSESSMENT SUBMISSION
   ========================================================= */

app.post(
    "/api/assessment",
    async function (req, res) {

        try {

            const submission =
                req.body;


            /* =====================================================
               EXTRACT SUBMISSION DATA
               ===================================================== */

            const contact =
                submission.contact || {};


            const business =
                submission.business || {};


            const assessment =
                submission.assessment || {};


            const results =
                submission.results || {};


            const additionalSystems =
                submission.additionalSystems || [];


            /* =====================================================
               SAVE ASSESSMENT TO SUPABASE
               ===================================================== */

            const {
                data,
                error
            } = await supabase
                .from("assessments")
                .insert([

                    {

                        contact_name:
                            contact.name || null,

                        contact_email:
                            contact.email || null,

                        contact_phone:
                            contact.phone || null,


                        business_name:
                            business.name || null,

                        business_description:
                            business.description || null,

                        team_size:
                            business.teamSize || null,


                        assessment_data:
                            assessment,


                        results_data:
                            results,


                        additional_systems:
                            additionalSystems

                    }

                ])
                .select();


            /* =====================================================
               DATABASE ERROR
               ===================================================== */

            if (error) {

                console.error(
                    "SUPABASE INSERT ERROR:",
                    error
                );


                return res.status(500).json({

                    success: false,

                    message:
                        "Assessment could not be saved.",

                    error:
                        error.message

                });

            }


            /* =====================================================
               SUCCESS
               ===================================================== */

            console.log(
                "===================================="
            );

            console.log(
                "ASCND ASSESSMENT SAVED"
            );

            console.log(
                "===================================="
            );

            console.log(
                data
            );


            res.status(200).json({

                success: true,

                message:
                    "ASCND assessment saved successfully.",

                assessment:
                    data

            });

        }

        catch (error) {

            console.error(
                "ASCND SUBMISSION ERROR:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "There was a problem saving the assessment."

            });

        }

    }
);

/* =========================================================
   ADMIN â€” CALCULATE PRIORITY
   ========================================================= */

function calculatePriority(
    timeline,
    primaryOpportunity
) {

    const timelineText =
        String(
            timeline || ""
        ).toLowerCase();


    const opportunityText =
        String(
            primaryOpportunity || ""
        ).toLowerCase();


    const urgentTimeline =
        timelineText.includes(
            "0-3"
        ) ||
        timelineText.includes(
            "0â€“3"
        ) ||
        timelineText.includes(
            "immediately"
        ) ||
        timelineText.includes(
            "asap"
        );


    const nearTimeline =
        timelineText.includes(
            "3-6"
        ) ||
        timelineText.includes(
            "3â€“6"
        );


    const meaningfulOpportunity =
        opportunityText !==
            "" &&
        opportunityText !==
            "not available" &&
        opportunityText !==
            "business systems review";


    if (
        urgentTimeline &&
        meaningfulOpportunity
    ) {

        return "HIGH";

    }


    if (
        urgentTimeline
    ) {

        return "HIGH";

    }


    if (
        nearTimeline &&
        meaningfulOpportunity
    ) {

        return "HIGH";

    }


    if (
        nearTimeline ||
        meaningfulOpportunity
    ) {

        return "MEDIUM";

    }


    return "LOW";

}

// =========================
// COMPANIES
// =========================

// Get all companies
app.get("/api/status", (req, res) => {
    res.json({
        success: true,
        user: {
            id: req.authUser.id,
            email: req.authUser.email
        }
    });
});

app.get("/api/companies", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("companies")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Companies fetch error:", error);
            return res.status(500).json({
                error: "Failed to load companies."
            });
        }

        res.json(data);
    } catch (error) {
        console.error("Companies route error:", error);

        res.status(500).json({
            error: "Server error."
        });
    }
});


// Create a new company
app.post("/api/companies", async (req, res) => {
    try {
        const {
            name,
            industry,
            status,
            phone,
            email,
            primary_contact,
            notes
        } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                error: "Company name is required."
            });
        }

        const { data, error } = await supabase
            .from("companies")
            .insert([
                {
                    name: name.trim(),
                    industry: industry || null,
                    status: status || "PROSPECT",
                    phone: phone || null,
                    email: email || null,
                    primary_contact: primary_contact || null,
                    notes: notes || null
                }
            ])
            .select()
            .single();

        if (error) {
            console.error("Company creation error:", error);

            return res.status(500).json({
                error: "Failed to create company."
            });
        }

        res.status(201).json(data);

    } catch (error) {
        console.error("Company route error:", error);

        res.status(500).json({
            error: "Server error."
        });
    }
});

// ===============================
// CONTACTS API
// ===============================

// Get all contacts
app.get("/api/contacts", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("contacts")
            .select(`
                *,
                companies (
                    id,
                    name
                )
            `)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Contacts fetch error:", error);

            return res.status(500).json({
                error: "Failed to load contacts."
            });
        }

        res.json(data);

    } catch (error) {
        console.error("Contacts route error:", error);

        res.status(500).json({
            error: "Server error."
        });
    }
});


// Create a new contact
app.post("/api/contacts", async (req, res) => {
    try {
        const {
            first_name,
            last_name,
            email,
            phone,
            company_id,
            notes
        } = req.body;

        if (!first_name || !first_name.trim()) {
            return res.status(400).json({
                error: "First name is required."
            });
        }

        const { data, error } = await supabase
            .from("contacts")
            .insert([
                {
                    first_name: first_name.trim(),
                    last_name: last_name?.trim() || null,
                    email: email?.trim() || null,
                    phone: phone?.trim() || null,
                    company_id: company_id || null,
                    notes: notes?.trim() || null
                }
            ])
            .select(`
                *,
                companies (
                    id,
                    name
                )
            `)
            .single();

        if (error) {

    console.error(
        "CONTACT CREATION ERROR:",
        error
    );

    return res.status(500).json({
        error:
            error.message ||
            "Failed to create contact."
    });
}

        res.status(201).json(data);

    } catch (error) {
        console.error("Contact route error:", error);

        res.status(500).json({
            error: "Server error."
        });
    }
});

// ===============================
// OPPORTUNITIES API
// ===============================

// Get all opportunities
app.get("/api/opportunities", async (req, res) => {
    try {

        const { data, error } = await supabase
            .from("opportunities")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {

            console.error(
                "Opportunities fetch error:",
                error
            );

            return res.status(500).json({
                error:
                    error.message ||
                    "Failed to load opportunities."
            });
        }

        res.json(data);

    } catch (error) {

        console.error(
            "Opportunities route error:",
            error
        );

        res.status(500).json({
            error: "Server error."
        });
    }
});


// Create a new opportunity
app.post("/api/opportunities", async (req, res) => {
    try {

        const {
            contact_name,
            business_name,
            location,
            phone,
            email,
            website,
            value,
            solutions,
            notes
        } = req.body;


        if (!business_name || !business_name.trim()) {

            return res.status(400).json({
                error: "Business name is required."
            });

        }


        if (!solutions || !solutions.trim()) {

            return res.status(400).json({
                error: "At least one solution is required."
            });

        }


        /*
        =========================================
        STEP 1 â€” FIND OR CREATE COMPANY
        =========================================
        */

        let company = null;


        const {
            data: existingCompany,
            error: companyLookupError
        } = await supabase
            .from("companies")
            .select("*")
            .ilike(
                "name",
                business_name.trim()
            )
            .maybeSingle();


        if (companyLookupError) {

            console.error(
                "Company lookup error:",
                companyLookupError
            );

            return res.status(500).json({
                error:
                    companyLookupError.message ||
                    "Failed to find company."
            });

        }


        if (existingCompany) {

            company = existingCompany;

        } else {

            const {
                data: newCompany,
                error: companyCreateError
            } = await supabase
                .from("companies")
                .insert([
                    {
                        name:
                            business_name.trim(),

                        status:
                            "PROSPECT",

                        phone:
                            phone?.trim() || null,

                        email:
                            email?.trim() || null,

                        primary_contact:
                            contact_name?.trim() || null,

                        notes:
                            notes?.trim() || null
                    }
                ])
                .select("*")
                .single();


            if (companyCreateError) {

                console.error(
                    "Company creation error:",
                    companyCreateError
                );

                return res.status(500).json({
                    error:
                        companyCreateError.message ||
                        "Failed to create company."
                });

            }


            company = newCompany;

        }


        /*
        =========================================
        STEP 2 â€” CREATE CONTACT
        =========================================
        */

        let contact = null;


        if (contact_name && contact_name.trim()) {

            const nameParts =
                contact_name
                    .trim()
                    .split(/\s+/);


            const firstName =
                nameParts.shift();


            const lastName =
                nameParts.length > 0
                    ? nameParts.join(" ")
                    : null;


            const {
                data: newContact,
                error: contactCreateError
            } = await supabase
                .from("contacts")
                .insert([
                    {
                        first_name:
                            firstName,

                        last_name:
                            lastName,

                        email:
                            email?.trim() || null,

                        phone:
                            phone?.trim() || null,

                        company_id:
                            company.id,

                        notes:
                            notes?.trim() || null
                    }
                ])
                .select(`
                    *,
                    companies (
                        id,
                        name
                    )
                `)
                .single();


            if (contactCreateError) {

                console.error(
                    "Contact creation error:",
                    contactCreateError
                );

                return res.status(500).json({
                    error:
                        contactCreateError.message ||
                        "Failed to create contact."
                });

            }


            contact = newContact;

        }


        /*
        =========================================
        STEP 3 â€” CREATE OPPORTUNITY
        =========================================
        */

        const {
            data,
            error
        } = await supabase
            .from("opportunities")
            .insert([
                {
                    company_id:
                        company.id,

                    contact_id:
                        contact?.id || null,

                    contact_name:
                        contact_name?.trim() || null,

                    business_name:
                        business_name.trim(),

                    location:
                        location?.trim() || null,

                    phone:
                        phone?.trim() || null,

                    email:
                        email?.trim() || null,

                    website:
                        website?.trim() || null,

                    value:
                        Number(value) || 0,

                    solutions:
                        solutions,

                    // Keep legacy column populated
                    // for database compatibility.
                    opportunity:
                        solutions,

                    notes:
                        notes?.trim() || null,

                    stage:
                        "NEW"
                }
            ])
            .select("*")
            .single();


        if (error) {

            console.error(
                "Opportunity creation error:",
                error
            );

            return res.status(500).json({
                error:
                    error.message ||
                    "Failed to create opportunity."
            });

        }


        res.status(201).json({
            opportunity: data,
            company: company,
            contact: contact
        });


    } catch (error) {

        console.error(
            "Opportunity route error:",
            error
        );

        res.status(500).json({
            error: "Server error."
        });

    }
});

/* =========================================
   ONE-TIME OPPORTUNITY BACKFILL
========================================= */

app.post("/api/opportunities/backfill", async (req, res) => {
    try {

        const {
            data: opportunities,
            error: opportunitiesError
        } = await supabase
            .from("opportunities")
            .select("*")
            .is("company_id", null)
            .order("created_at", {
                ascending: true
            });


        if (opportunitiesError) {
            console.error(
                "Backfill opportunity fetch error:",
                opportunitiesError
            );

            return res.status(500).json({
                error:
                    opportunitiesError.message
            });
        }


        const results = [];


        for (const opportunity of opportunities) {

            /*
            =========================================
            STEP 1 â€” FIND OR CREATE COMPANY
            =========================================
            */

            let company = null;


            const {
                data: existingCompany,
                error: companyLookupError
            } = await supabase
                .from("companies")
                .select("*")
                .ilike(
                    "name",
                    opportunity.business_name.trim()
                )
                .maybeSingle();


            if (companyLookupError) {
                throw companyLookupError;
            }


            if (existingCompany) {

                company = existingCompany;

            } else {

                const {
                    data: newCompany,
                    error: companyCreateError
                } = await supabase
                    .from("companies")
                    .insert([
                        {
                            name:
                                opportunity.business_name.trim(),

                            status:
                                "PROSPECT",

                            phone:
                                opportunity.phone?.trim() ||
                                null,

                            email:
                                opportunity.email?.trim() ||
                                null,

                            primary_contact:
                                opportunity.contact_name?.trim() ||
                                null,

                            notes:
                                opportunity.notes?.trim() ||
                                null
                        }
                    ])
                    .select("*")
                    .single();


                if (companyCreateError) {
                    throw companyCreateError;
                }


                company = newCompany;

            }


            /*
            =========================================
            STEP 2 â€” FIND OR CREATE CONTACT
            =========================================
            */

            let contact = null;


            if (
                opportunity.contact_name &&
                opportunity.contact_name.trim()
            ) {

                const nameParts =
                    opportunity.contact_name
                        .trim()
                        .split(/\s+/);


                const firstName =
                    nameParts.shift();


                const lastName =
                    nameParts.length > 0
                        ? nameParts.join(" ")
                        : null;


                /*
                Look for an existing contact
                belonging to this company.
                */

                let contactQuery =
                    supabase
                        .from("contacts")
                        .select(`
                            *,
                            companies (
                                id,
                                name
                            )
                        `)
                        .eq(
                            "company_id",
                            company.id
                        )
                        .ilike(
                            "first_name",
                            firstName
                        );


                if (lastName) {

                    contactQuery =
                        contactQuery.ilike(
                            "last_name",
                            lastName
                        );

                }


                const {
                    data: existingContacts,
                    error: contactLookupError
                } = await contactQuery;


                if (contactLookupError) {
                    throw contactLookupError;
                }


                if (
                    existingContacts &&
                    existingContacts.length > 0
                ) {

                    contact =
                        existingContacts[0];

                } else {

                    const {
                        data: newContact,
                        error: contactCreateError
                    } = await supabase
                        .from("contacts")
                        .insert([
                            {
                                first_name:
                                    firstName,

                                last_name:
                                    lastName,

                                email:
                                    opportunity.email?.trim() ||
                                    null,

                                phone:
                                    opportunity.phone?.trim() ||
                                    null,

                                company_id:
                                    company.id,

                                notes:
                                    opportunity.notes?.trim() ||
                                    null
                            }
                        ])
                        .select(`
                            *,
                            companies (
                                id,
                                name
                            )
                        `)
                        .single();


                    if (contactCreateError) {
                        throw contactCreateError;
                    }


                    contact = newContact;

                }

            }


            /*
            =========================================
            STEP 3 â€” LINK OPPORTUNITY
            =========================================
            */

            const {
                data: updatedOpportunity,
                error: updateError
            } = await supabase
                .from("opportunities")
                .update({
                    company_id:
                        company.id,

                    contact_id:
                        contact?.id || null
                })
                .eq(
                    "id",
                    opportunity.id
                )
                .select("*")
                .single();


            if (updateError) {
                throw updateError;
            }


            results.push({
                opportunity:
                    updatedOpportunity.business_name,

                company:
                    company.name,

                contact:
                    contact
                        ? `${contact.first_name} ${contact.last_name || ""}`.trim()
                        : null,

                company_id:
                    company.id,

                contact_id:
                    contact?.id || null
            });

        }


        res.json({
            success: true,

            migrated:
                results.length,

            results
        });


    } catch (error) {

        console.error(
            "Opportunity backfill error:",
            error
        );

        res.status(500).json({
            error:
                error.message ||
                "Backfill failed."
        });

    }
});


/* =========================================================
   LINK ASSESSMENT TO OPPORTUNITY
   ========================================================= */

app.patch(
    "/api/assessments/:id/opportunity",
    async function (req, res) {

        try {

            const id =
                req.params.id;

            const opportunityId =
                req.body.opportunity_id;


            if (!opportunityId) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Opportunity ID is required."

                });

            }


            const {
                data,
                error
            } = await supabase
                .from("assessments")
                .update({

                    opportunity_id:
                        opportunityId

                })
                .eq(
                    "id",
                    id
                )
                .select()
                .single();


            if (error) {

                console.error(
                    "ASSESSMENT OPPORTUNITY LINK ERROR:",
                    error
                );


                return res.status(500).json({

                    success: false,

                    message:
                        "Assessment could not be linked to opportunity.",

                    error:
                        error.message

                });

            }


            res.status(200).json({

                success: true,

                message:
                    "Assessment linked to opportunity successfully.",

                assessment:
                    data

            });

        }

        catch (error) {

            console.error(
                "ASSESSMENT OPPORTUNITY LINK ROUTE ERROR:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Server error."

            });

        }

    }
);

/* =========================================================
   ADMIN â€” LOAD ASSESSMENTS
   ========================================================= */

app.get(
    "/api/assessments",
    async function (req, res) {

        try {

            const {
                data,
                error
            } = await supabase
                .from("assessments")
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


            if (error) {

                console.error(
                    "SUPABASE ASSESSMENTS ERROR:",
                    error
                );


                return res.status(500).json({

                    success: false,

                    message:
                        "Unable to load assessments.",

                    error:
                        error.message

                });

            }


            const assessments =
                (data || [])
                    .map(
                        function (assessment) {

                            const assessmentData =
                                assessment.assessment_data ||
                                {};


                            const resultsData =
                                assessment.results_data ||
                                {};


                            const timeline =
                                assessmentData.timeline ||
                                "Not specified";


                            const primaryOpportunity =
                                resultsData.primaryOpportunity ||
                                resultsData.primarySystem ||
                                "Not available";


                            let priority =
                                "LOW";


                            const timelineText =
                                String(
                                    timeline
                                ).toLowerCase();


                            const opportunityText =
                                String(
                                    primaryOpportunity
                                ).toLowerCase();


                            const urgentTimeline =
                                timelineText.includes(
                                    "0-3"
                                ) ||
                                timelineText.includes(
                                    "0â€“3"
                                ) ||
                                timelineText.includes(
                                    "immediately"
                                ) ||
                                timelineText.includes(
                                    "asap"
                                );


                            const nearTimeline =
                                timelineText.includes(
                                    "3-6"
                                ) ||
                                timelineText.includes(
                                    "3â€“6"
                                );


                            const meaningfulOpportunity =
                                opportunityText !==
                                    "not available" &&
                                opportunityText !==
                                    "business systems review";


                            if (
                                urgentTimeline &&
                                meaningfulOpportunity
                            ) {

                                priority =
                                    "HIGH";

                            }

                            else if (
                                urgentTimeline
                            ) {

                                priority =
                                    "HIGH";

                            }

                            else if (
                                nearTimeline ||
                                meaningfulOpportunity
                            ) {

                                priority =
                                    "MEDIUM";

                            }


                            return {

                                id:
                                    assessment.id,

                                created_at:
                                    assessment.created_at,

                                opportunity_id:
                                    assessment.opportunity_id,

                                contact_name:
                                    assessment.contact_name,

                                contact_email:
                                    assessment.contact_email,

                                contact_phone:
                                    assessment.contact_phone,


                                business_name:
                                    assessment.business_name,

                                business_description:
                                    assessment.business_description,

                                team_size:
                                    assessment.team_size,


                                primary_opportunity:
                                    primaryOpportunity,

                                primary_description:
                                    resultsData.primaryDescription ||
                                    "",


                                key_findings:
                                    resultsData.keyFindings ||
                                    [],


                                recommended_systems:
                                    resultsData.recommendedSystems ||
                                    [],


                                additional_systems:
                                    assessment.additional_systems ||
                                    [],


                                timeline:
                                    timeline,


                                priority:
                                    priority,


                                status:
                                    assessment.status ||
                                    "NEW"

                            };

                        }
                    );


            res.status(200).json({

                success: true,

                assessments:
                    assessments

            });

        }

        catch (error) {

            console.error(
                "ADMIN ASSESSMENTS ERROR:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to load assessments.",

                error:
                    error.message

            });

        }

    }
);

/* =========================================================
   ADMIN â€” UPDATE ASSESSMENT STATUS
   ========================================================= */

app.patch(
    "/api/assessments/:id/status",
    async function (req, res) {

        try {

            const id =
                req.params.id;


            const status =
                req.body.status;


            const allowedStatuses = [

                "NEW",

                "CONTACTED",

                "DISCOVERY",

                "PROPOSAL",

                "ACTIVE",

                "COMPLETED"

            ];


            if (
                !allowedStatuses.includes(
                    status
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid assessment status."

                });

            }


            const {
                data,
                error
            } = await supabase
                .from("assessments")
                .update({

                    status:
                        status

                })
                .eq(
                    "id",
                    id
                )
                .select();


            if (error) {

                console.error(
                    "SUPABASE STATUS UPDATE ERROR:",
                    error
                );


                return res.status(500).json({

                    success: false,

                    message:
                        "Assessment status could not be updated.",

                    error:
                        error.message

                });

            }


            res.status(200).json({

                success: true,

                message:
                    "Assessment status updated successfully.",

                assessment:
                    data

            });

        }

        catch (error) {

            console.error(
                "STATUS UPDATE ERROR:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "There was a problem updating the status."

            });

        }

    }
);

/* =========================================================
   HOME ROUTE
   ========================================================= */

app.get(
    "/",
    function (req, res) {

        res.sendFile(
            path.join(
                __dirname,
                "public",
                "home-new.html"
            )
        );

    }
);

/* =========================================================
   ASSESSMENT ROUTE
   ========================================================= */

app.get(
    "/assessment",
    function (req, res) {

        res.set(
            "Cache-Control",
            "no-store, no-cache, must-revalidate, proxy-revalidate"
        );

        res.sendFile(
            path.join(
                __dirname,
                "public",
                "assessment.html"
            )
        );

    }
);

/* =========================================================
   PRIVACY ROUTE
   ========================================================= */

app.get(
    "/privacy",
    function (req, res) {

        res.sendFile(
            path.join(
                __dirname,
                "public",
                "privacy.html"
            )
        );

    }
);

/* =========================================================
   TERMS ROUTE
   ========================================================= */

app.get(
    "/terms",
    function (req, res) {

        res.sendFile(
            path.join(
                __dirname,
                "public",
                "terms.html"
            )
        );

    }
);

/* =========================================================
   START SERVER
   ========================================================= */

app.listen(
    PORT,
    function () {

        console.log(
            `ASCND is running at http://localhost:${PORT}`
        );

    }
);
