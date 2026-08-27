require("dotenv").config();

const express = require("express");
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
   ADMIN — CALCULATE PRIORITY
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
            "0–3"
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
            "3–6"
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

/* =========================================================
   ADMIN — LOAD ASSESSMENTS
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
                                    "0–3"
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
                                    "3–6"
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
   ADMIN — UPDATE ASSESSMENT STATUS
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
   ASSESSMENT ROUTE
   ========================================================= */

app.get(
    "/assessment",
    function (req, res) {

        res.sendFile(
            path.join(
                __dirname,
                "public",
                "index.html"
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