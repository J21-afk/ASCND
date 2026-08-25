document.addEventListener("DOMContentLoaded", function () {

    /* =========================================================
       ASCND ASSESSMENT ENGINE
       ========================================================= */


    /* =========================================================
       PAGE ELEMENTS
       ========================================================= */

    const landingPage =
        document.querySelector(".landing-page");

    const assessmentPage =
        document.getElementById("assessment-page");

    const startButton =
        document.getElementById("start-assessment");


    /* =========================================================
       ASSESSMENT ELEMENTS
       ========================================================= */

    const steps =
        document.querySelectorAll(
            ".assessment-step"
        );

    const continueButtons =
        document.querySelectorAll(
            ".continue-button"
        );

    const backButtons =
        document.querySelectorAll(
            ".back-button"
        );

    const progressFill =
        document.getElementById(
            "progress-fill"
        );

    const stepIndicator =
        document.getElementById(
            "step-indicator"
        );

    const progressPercent =
        document.getElementById(
            "progress-percent"
        );


    /* =========================================================
       STATE
       ========================================================= */

    let currentStep = 1;

    const totalSteps = 10;


    /* =========================================================
       ASSESSMENT DATA
       ========================================================= */

    const assessmentData = {

        businessName: "",

        businessDescription: "",

        teamSize: "",

        improvementAreas: [],

        timeConsuming: "",

        biggestImprovement: "",

        processManagement: "",

        systemConnection: "",

        onlinePresence: [],

        customerContact: [],

        digitalSatisfaction: "",

        primaryGoals: [],

        biggestDifference: [],

        oneProblem: "",

        timeline: "",

        investmentReadiness: "",

        results: null,

        selectedAdditionalSystems: []

    };


    /* =========================================================
       START ASSESSMENT
       ========================================================= */

    if (startButton) {

        startButton.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                if (landingPage) {

                    landingPage.classList.add(
                        "hidden"
                    );

                }

                if (assessmentPage) {

                    assessmentPage.classList.remove(
                        "hidden"
                    );

                }

                showStep(1);

            }
        );

    }


    /* =========================================================
       SHOW STEP
       ========================================================= */

    function showStep(stepNumber) {

        currentStep = stepNumber;


        steps.forEach(
            function (step) {

                const stepValue =
                    Number(
                        step.dataset.step
                    );

                step.classList.toggle(
                    "active",
                    stepValue === stepNumber
                );

            }
        );


        updateProgress();


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });


        /* =====================================================
           RESULTS STEPS
           ===================================================== */

        if (
            stepNumber >= 7 &&
            stepNumber <= 10
        ) {

            saveAllAssessmentData();

            generateAscndResults();

        }


        if (stepNumber === 7) {

            renderStep7();

        }


        if (stepNumber === 8) {

            renderStep8();

        }


        if (stepNumber === 9) {

            renderStep9();

        }


        if (stepNumber === 10) {

            renderStep10();

        }

    }


    /* =========================================================
       UPDATE PROGRESS
       ========================================================= */

    function updateProgress() {

        const percentage =
            Math.round(
                (currentStep / totalSteps) * 100
            );


        if (progressFill) {

            progressFill.style.width =
                `${percentage}%`;

        }


        if (stepIndicator) {

            stepIndicator.textContent =
                `STEP ${String(currentStep).padStart(2, "0")} OF ${String(totalSteps).padStart(2, "0")}`;

        }


        if (progressPercent) {

            progressPercent.textContent =
                `${percentage}%`;

        }

    }


    /* =========================================================
       CONTINUE BUTTONS
       ========================================================= */

    continueButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();


                    saveCurrentStep();


                    const nextStep =
                        Number(
                            button.dataset.next
                        );


                    if (
                        nextStep &&
                        nextStep <= totalSteps
                    ) {

                        showStep(
                            nextStep
                        );

                    }

                }
            );

        }
    );


    /* =========================================================
       BACK BUTTONS
       ========================================================= */

    backButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();


                    const previousStep =
                        Number(
                            button.dataset.previous
                        );


                    if (
                        previousStep >= 1
                    ) {

                        showStep(
                            previousStep
                        );

                    }

                }
            );

        }
    );


    /* =========================================================
       STEP 1 — TEAM SIZE
       ========================================================= */

    const teamSizeButtons =
        document.querySelectorAll(
            ".assessment-step[data-step='1'] .option-button"
        );


    teamSizeButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    teamSizeButtons.forEach(
                        function (option) {

                            option.classList.remove(
                                "selected"
                            );

                        }
                    );


                    button.classList.add(
                        "selected"
                    );


                    assessmentData.teamSize =
                        button.dataset.value || "";

                }
            );

        }
    );


    /* =========================================================
       GENERIC MULTI SELECT
       ========================================================= */

    function setupMultiSelect(selector) {

        const options =
            document.querySelectorAll(
                selector
            );


        options.forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        button.classList.toggle(
                            "selected"
                        );

                    }
                );

            }
        );

    }


    /* =========================================================
       GENERIC SINGLE SELECT
       ========================================================= */

    function setupSingleSelect(selector) {

        const options =
            document.querySelectorAll(
                selector
            );


        options.forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const parent =
                            button.parentElement;


                        parent
                            .querySelectorAll(
                                selector
                            )
                            .forEach(
                                function (option) {

                                    option.classList.remove(
                                        "selected"
                                    );

                                }
                            );


                        button.classList.add(
                            "selected"
                        );

                    }
                );

            }
        );

    }


    /* =========================================================
       STEP 2
       ========================================================= */

    setupMultiSelect(
        ".assessment-step[data-step='2'] [data-question='improvementAreas'] .assessment-option"
    );


    /* =========================================================
       STEP 3
       ========================================================= */

    setupSingleSelect(
        ".assessment-step[data-step='3'] .system-option"
    );


    /* =========================================================
       STEP 4
       ========================================================= */

    setupMultiSelect(
        ".assessment-step[data-step='4'] [data-question='onlinePresence'] .assessment-option"
    );


    setupMultiSelect(
        ".assessment-step[data-step='4'] [data-question='customerContact'] .assessment-option"
    );


    setupSingleSelect(
        ".assessment-step[data-step='4'] [data-question='digitalSatisfaction'] .assessment-option"
    );


    /* =========================================================
       STEP 5
       ========================================================= */

    setupMultiSelect(
        ".assessment-step[data-step='5'] [data-question='primaryPriority'] .assessment-option"
    );


    setupMultiSelect(
        ".assessment-step[data-step='5'] [data-question='biggestDifference'] .assessment-option"
    );


    /* =========================================================
       STEP 6
       ========================================================= */

    setupSingleSelect(
        ".assessment-step[data-step='6'] [data-question='timeline'] .assessment-option"
    );


    setupSingleSelect(
        ".assessment-step[data-step='6'] [data-question='investmentReadiness'] .assessment-option"
    );


    /* =========================================================
       SAVE CURRENT STEP
       ========================================================= */

    function saveCurrentStep() {


        /* =====================================================
           STEP 1
           ===================================================== */

        if (currentStep === 1) {

            const businessName =
                document.getElementById(
                    "business-name"
                );


            const businessDescription =
                document.getElementById(
                    "business-description"
                );


            if (businessName) {

                assessmentData.businessName =
                    businessName.value.trim();

            }


            if (businessDescription) {

                assessmentData.businessDescription =
                    businessDescription.value.trim();

            }


            const selectedTeamSize =
                document.querySelector(
                    ".assessment-step[data-step='1'] .option-button.selected"
                );


            if (selectedTeamSize) {

                assessmentData.teamSize =
                    selectedTeamSize.dataset.value || "";

            }

        }


        /* =====================================================
           STEP 2
           ===================================================== */

        if (currentStep === 2) {

            assessmentData.improvementAreas =
                getSelectedValues(
                    ".assessment-step[data-step='2'] [data-question='improvementAreas'] .assessment-option.selected"
                );


            const timeConsuming =
                document.getElementById(
                    "time-consuming"
                );


            const biggestImprovement =
                document.getElementById(
                    "biggest-improvement"
                );


            if (timeConsuming) {

                assessmentData.timeConsuming =
                    timeConsuming.value.trim();

            }


            if (biggestImprovement) {

                assessmentData.biggestImprovement =
                    biggestImprovement.value.trim();

            }

        }


        /* =====================================================
           STEP 3
           ===================================================== */

        if (currentStep === 3) {

            const systemOptions =
                document.querySelectorAll(
                    ".assessment-step[data-step='3'] .system-option.selected"
                );


            if (systemOptions[0]) {

                assessmentData.processManagement =
                    systemOptions[0].dataset.value || "";

            }


            if (systemOptions[1]) {

                assessmentData.systemConnection =
                    systemOptions[1].dataset.value || "";

            }

        }


        /* =====================================================
           STEP 4
           ===================================================== */

        if (currentStep === 4) {

            assessmentData.onlinePresence =
                getSelectedValues(
                    ".assessment-step[data-step='4'] [data-question='onlinePresence'] .assessment-option.selected"
                );


            assessmentData.customerContact =
                getSelectedValues(
                    ".assessment-step[data-step='4'] [data-question='customerContact'] .assessment-option.selected"
                );


            const digitalSatisfaction =
                document.querySelector(
                    ".assessment-step[data-step='4'] [data-question='digitalSatisfaction'] .assessment-option.selected"
                );


            if (digitalSatisfaction) {

                assessmentData.digitalSatisfaction =
                    digitalSatisfaction.dataset.value || "";

            }

        }


        /* =====================================================
           STEP 5
           ===================================================== */

        if (currentStep === 5) {

            assessmentData.primaryGoals =
                getSelectedValues(
                    ".assessment-step[data-step='5'] [data-question='primaryPriority'] .assessment-option.selected"
                );


            assessmentData.biggestDifference =
                getSelectedValues(
                    ".assessment-step[data-step='5'] [data-question='biggestDifference'] .assessment-option.selected"
                );


            const oneProblem =
                document.getElementById(
                    "one-problem"
                );


            if (oneProblem) {

                assessmentData.oneProblem =
                    oneProblem.value.trim();

            }

        }


        /* =====================================================
           STEP 6
           ===================================================== */

        if (currentStep === 6) {

            const timeline =
                document.querySelector(
                    ".assessment-step[data-step='6'] [data-question='timeline'] .assessment-option.selected"
                );


            const investment =
                document.querySelector(
                    ".assessment-step[data-step='6'] [data-question='investmentReadiness'] .assessment-option.selected"
                );


            if (timeline) {

                assessmentData.timeline =
                    timeline.dataset.value || "";

            }


            if (investment) {

                assessmentData.investmentReadiness =
                    investment.dataset.value || "";

            }

        }

    }


    /* =========================================================
       GET SELECTED VALUES
       ========================================================= */

    function getSelectedValues(selector) {

        return Array.from(
            document.querySelectorAll(
                selector
            )
        ).map(
            function (button) {

                return button.dataset.value || "";

            }
        );

    }


    /* =========================================================
       SAVE ALL ASSESSMENT DATA
       ========================================================= */

    function saveAllAssessmentData() {

        const originalStep =
            currentStep;


        for (
            let step = 1;
            step <= 6;
            step++
        ) {

            currentStep =
                step;

            saveCurrentStep();

        }


        currentStep =
            originalStep;

    }


    /* =========================================================
       ASCND RESULTS ENGINE
       ========================================================= */

    function generateAscndResults() {

        const opportunities = [];

        const keyFindings = [];


        /* =====================================================
           ADD OPPORTUNITY
           ===================================================== */

        function addOpportunity(
            name,
            score,
            reason,
            system
        ) {

            opportunities.push({

                name:
                    name,

                score:
                    score,

                reason:
                    reason,

                system:
                    system

            });

        }


        /* =====================================================
           KEY FINDING HELPER
           ===================================================== */

        function addFinding(
            title,
            description
        ) {

            if (
                !keyFindings.some(
                    function (finding) {

                        return (
                            finding.title ===
                            title
                        );

                    }
                )
            ) {

                keyFindings.push({

                    title:
                        title,

                    description:
                        description

                });

            }

        }


        /* =====================================================
           CUSTOMER ACQUISITION
           ===================================================== */

        if (
            assessmentData.improvementAreas.includes(
                "Getting more customers"
            ) ||
            assessmentData.primaryGoals.includes(
                "Getting more customers"
            )
        ) {

            addOpportunity(

                "Customer Acquisition",

                25,

                "Your answers indicate that generating more customer opportunities is an important area for improvement.",

                "Customer Acquisition System"

            );


            addFinding(

                "CUSTOMER ACQUISITION IS A GROWTH PRIORITY",

                "Your responses indicate that attracting more customers is an important priority, making the way your business generates and manages new opportunities especially important."

            );

        }


        /* =====================================================
           LEAD MANAGEMENT
           ===================================================== */

        if (
            assessmentData.improvementAreas.includes(
                "Managing leads"
            )
        ) {

            addOpportunity(

                "Lead Management",

                35,

                "Your answers indicate that organizing and managing potential customers could be improved.",

                "Lead Management System"

            );


            addFinding(

                "LEAD MANAGEMENT IS AN AREA OF FRICTION",

                "Your responses indicate that organizing and managing potential customers could be improved, particularly around visibility, organization, and consistency."

            );

        }


        /* =====================================================
           CUSTOMER FOLLOW-UP
           ===================================================== */

        if (
            assessmentData.improvementAreas.includes(
                "Customer follow-up"
            )
        ) {

            addOpportunity(

                "Customer Follow-Up",

                35,

                "Your answers indicate that customer follow-up could benefit from a more consistent process.",

                "Customer Follow-Up System"

            );


            addFinding(

                "CUSTOMER FOLLOW-UP COULD BE MORE CONSISTENT",

                "Your responses indicate that follow-up may depend too heavily on manual effort, creating an opportunity to make customer communication more consistent."

            );

        }


        /* =====================================================
           WORKFLOW AUTOMATION
           ===================================================== */

        if (
            assessmentData.improvementAreas.includes(
                "Repetitive manual work"
            ) ||
            assessmentData.primaryGoals.includes(
                "Automating repetitive work"
            ) ||
            assessmentData.primaryGoals.includes(
                "Saving time"
            )
        ) {

            addOpportunity(

                "Workflow Automation",

                40,

                "Your answers indicate that repetitive work may be consuming valuable time that could be redirected toward higher-value activities.",

                "Workflow Automation System"

            );


            addFinding(

                "YOUR BUSINESS RELIES HEAVILY ON MANUAL WORK",

                "A significant portion of your current business processes are being handled manually, which may be creating unnecessary work and limiting the time available for higher-value activities."

            );

        }


        /* =====================================================
           ORGANIZATION
           ===================================================== */

        if (
            assessmentData.improvementAreas.includes(
                "Organization"
            ) ||
            assessmentData.primaryGoals.includes(
                "Better organization"
            )
        ) {

            addOpportunity(

                "Business Organization",

                30,

                "Your answers indicate that creating more structure around information and processes could improve day-to-day operations.",

                "Business Organization System"

            );


            addFinding(

                "YOUR BUSINESS COULD BENEFIT FROM MORE STRUCTURE",

                "Your responses indicate that creating clearer systems for organizing information, tasks, and processes could make the business easier to manage."

            );

        }


        /* =====================================================
           COMMUNICATION
           ===================================================== */

        if (
            assessmentData.improvementAreas.includes(
                "Communication"
            )
        ) {

            addOpportunity(

                "Business Communication",

                25,

                "Your answers indicate an opportunity to make communication more consistent and connected.",

                "Business Communication System"

            );


            addFinding(

                "BUSINESS COMMUNICATION COULD BE MORE CONNECTED",

                "Your responses indicate an opportunity to improve how information moves between your business, team, and customers."

            );

        }


        /* =====================================================
           TECHNOLOGY
           ===================================================== */

        if (
            assessmentData.improvementAreas.includes(
                "Technology"
            )
        ) {

            addOpportunity(

                "Technology Optimization",

                30,

                "Your answers indicate that the technology supporting your business may have room for improvement.",

                "Technology Optimization System"

            );

        }


        /* =====================================================
           DIGITAL PRESENCE
           ===================================================== */

        if (
            assessmentData.improvementAreas.includes(
                "Online presence"
            ) ||
            assessmentData.onlinePresence.includes(
                "Not Currently Online"
            ) ||
            assessmentData.digitalSatisfaction ===
                "Needs improvement" ||
            assessmentData.digitalSatisfaction ===
                "Could be better" ||
            assessmentData.primaryGoals.includes(
                "Building a stronger online presence"
            )
        ) {

            addOpportunity(

                "Digital Presence",

                35,

                "Your answers indicate that the way customers discover and interact with your business online could be strengthened.",

                "Digital Presence System"

            );


            addFinding(

                "YOUR DIGITAL PRESENCE COULD BE STRONGER",

                "Your responses indicate an opportunity to strengthen how customers discover, understand, and interact with your business online."

            );

        }


        /* =====================================================
           REVENUE GROWTH
           ===================================================== */

        if (
            assessmentData.primaryGoals.includes(
                "Increasing revenue"
            )
        ) {

            addOpportunity(

                "Revenue Growth",

                30,

                "Increasing revenue is one of your stated priorities, making customer growth and conversion important areas to examine.",

                "Revenue Growth System"

            );

        }


        /* =====================================================
           CUSTOMER EXPERIENCE
           ===================================================== */

        if (
            assessmentData.primaryGoals.includes(
                "Improving customer experience"
            )
        ) {

            addOpportunity(

                "Customer Experience",

                30,

                "Your answers indicate that creating a smoother customer experience is important to your business.",

                "Customer Experience System"

            );

        }


        /* =====================================================
           BUSINESS SCALABILITY
           ===================================================== */

        if (
            assessmentData.primaryGoals.includes(
                "Scaling the business"
            )
        ) {

            addOpportunity(

                "Business Scalability",

                30,

                "Your goal of scaling makes it important to build systems that can support increased demand.",

                "Business Scalability System"

            );

        }


        /* =====================================================
           PROCESS MANAGEMENT
           ===================================================== */

        if (
            assessmentData.processManagement ===
            "Mostly Manual"
        ) {

            opportunities.forEach(
                function (opportunity) {

                    opportunity.score += 10;

                }
            );

        }


        if (
            assessmentData.processManagement ===
            "Mix of Software and Manual Work"
        ) {

            opportunities.forEach(
                function (opportunity) {

                    opportunity.score += 5;

                }
            );

        }


        /* =====================================================
           SYSTEM CONNECTION
           ===================================================== */

        if (
            assessmentData.systemConnection ===
            "Not At All"
        ) {

            addOpportunity(

                "Business Systems",

                35,

                "Your current systems are not fully connected, creating an opportunity to build a more unified business infrastructure.",

                "Business Systems"

            );


            addFinding(

                "YOUR BUSINESS SYSTEMS COULD BE MORE CONNECTED",

                "Your current software, platforms, and business processes may not be fully connected, which can create extra manual work and make information harder to manage."

            );

        }


        if (
            assessmentData.systemConnection ===
            "Somewhat"
        ) {

            addOpportunity(

                "Business Systems",

                25,

                "Your current systems are partially connected, creating an opportunity to improve how information moves through the business.",

                "Business Systems"

            );


            addFinding(

                "YOUR BUSINESS SYSTEMS COULD BE MORE CONNECTED",

                "Your current software, platforms, and business processes may not be fully connected, which can create extra manual work and make information harder to manage."

            );

        }


        /* =====================================================
           TIMELINE
           ===================================================== */

        if (
            assessmentData.timeline ===
            "Immediately"
        ) {

            opportunities.forEach(
                function (opportunity) {

                    opportunity.score += 5;

                }
            );

        }


        /* =====================================================
           INVESTMENT READINESS
           ===================================================== */

        if (
            assessmentData.investmentReadiness ===
            "Yes, ready now"
        ) {

            opportunities.forEach(
                function (opportunity) {

                    opportunity.score += 3;

                }
            );

        }


        /* =====================================================
           FALLBACK OPPORTUNITY
           ===================================================== */

        if (
            opportunities.length === 0
        ) {

            addOpportunity(

                "Business Systems Review",

                10,

                "Your answers did not identify one dominant area of friction. A broader review of your current systems could help identify the strongest opportunity.",

                "Business Systems Review"

            );

        }


        /* =====================================================
           FALLBACK KEY FINDING
           ===================================================== */

        if (
            keyFindings.length === 0
        ) {

            addFinding(

                "ASSESSMENT REVIEW",

                "ASCND has reviewed the information you provided and identified areas of opportunity based on your current business systems, processes, and goals."

            );

        }


        /* =====================================================
           SORT OPPORTUNITIES
           ===================================================== */

        opportunities.sort(
            function (a, b) {

                return b.score - a.score;

            }
        );


        /* =====================================================
           PRIMARY OPPORTUNITY
           ===================================================== */

        const primaryOpportunity =
            opportunities[0];


        /* =====================================================
           SYSTEM DESCRIPTIONS
           ===================================================== */

        const systemDescriptions = {

            "Customer Acquisition System":
                "Build a more structured process for attracting and capturing new customer opportunities.",

            "Lead Management System":
                "Organize and manage leads so opportunities are easier to track and prioritize.",

            "Customer Follow-Up System":
                "Create consistent follow-up workflows so potential customers are less likely to be missed.",

            "Workflow Automation System":
                "Automate repetitive processes and reduce unnecessary manual work.",

            "Business Organization System":
                "Create clearer systems for organizing information, tasks, and business activity.",

            "Business Communication System":
                "Improve how information moves between your business, team, and customers.",

            "Technology Optimization System":
                "Improve the technology supporting your business so your tools better match your needs.",

            "Digital Presence System":
                "Improve how customers discover, understand, trust, and interact with your business online.",

            "Revenue Growth System":
                "Build systems around customer growth and conversion to support your revenue goals.",

            "Customer Experience System":
                "Create a more consistent and connected customer experience.",

            "Business Scalability System":
                "Build systems that allow your business to grow without unnecessary manual work.",

            "Business Systems":
                "Connect the tools and processes your business relies on so information can move more efficiently.",

            "Business Systems Review":
                "Review your current workflows, tools, and processes to identify your strongest opportunity."

        };


        /* =====================================================
           RECOMMENDED SYSTEMS
           ===================================================== */

        const recommendedSystems = [];


        opportunities
            .slice(0, 4)
            .forEach(
                function (opportunity) {

                    const system =
                        opportunity.system;


                    const alreadyExists =
                        recommendedSystems.some(
                            function (item) {

                                return (
                                    item.name ===
                                    system
                                );

                            }
                        );


                    if (!alreadyExists) {

                        recommendedSystems.push({

                            name:
                                system,

                            description:
                                systemDescriptions[
                                    system
                                ] ||
                                opportunity.reason,

                            opportunity:
                                opportunity.name,

                            score:
                                opportunity.score

                        });

                    }

                }
            );


        /* =====================================================
           BUSINESS OVERVIEW
           ===================================================== */

        let businessOverview = "";


        if (
            assessmentData.businessDescription
        ) {

            businessOverview =
                `${assessmentData.businessName || "Your business"} is focused on ${assessmentData.businessDescription}.`;

        }

        else {

            businessOverview =
                `${assessmentData.businessName || "Your business"} is currently being evaluated across its operations, systems, digital presence, and growth priorities.`;

        }


        if (
            assessmentData.teamSize
        ) {

            businessOverview +=
                ` The business currently involves ${assessmentData.teamSize.toLowerCase()} people.`;

        }


        /* =====================================================
           ASCND ANALYSIS
           ===================================================== */

        const strongestAreas =
            opportunities
                .slice(0, 3)
                .map(
                    function (opportunity) {

                        return opportunity.name;

                    }
                );


        let analysis = "";


        if (
            strongestAreas.length === 0
        ) {

            analysis =
                "Your assessment gives ASCND a starting point for understanding your business. No specific areas of opportunity were identified strongly enough to prioritize yet.";

        }

        else {

            analysis =
                `Based on your assessment, ASCND identified ${strongestAreas.join(", ")} as your strongest areas of opportunity. These areas represent the parts of your business where improving processes, systems, or automation may create meaningful impact.`;

        }


        /* =====================================================
           SCORE
           ===================================================== */

        let score = 0;


        opportunities.forEach(
            function (opportunity) {

                score +=
                    opportunity.score;

            }
        );


        score =
            Math.min(
                score,
                100
            );


        /* =====================================================
           OPPORTUNITY LEVEL
           ===================================================== */

        let opportunityLevel =
            "EMERGING OPPORTUNITY";


        if (
            score >= 75
        ) {

            opportunityLevel =
                "HIGH OPPORTUNITY";

        }

        else if (
            score >= 50
        ) {

            opportunityLevel =
                "STRONG OPPORTUNITY";

        }

        else if (
            score >= 25
        ) {

            opportunityLevel =
                "GROWTH OPPORTUNITY";

        }


        /* =====================================================
           FINAL RESULTS OBJECT
           ===================================================== */

        assessmentData.results = {

            score:
                score,

            opportunityLevel:
                opportunityLevel,

            primaryOpportunity:
                primaryOpportunity.name,

            primarySystem:
                primaryOpportunity.system,

            primaryDescription:
                systemDescriptions[
                    primaryOpportunity.system
                ] ||
                primaryOpportunity.reason,

            opportunities:
                opportunities,

            keyFindings:
                keyFindings,

            recommendedSystems:
                recommendedSystems,

            businessOverview:
                businessOverview,

            analysis:
                analysis

        };


        window.ascndResults =
            assessmentData.results;


        console.log(
            "ASCND RESULTS:",
            assessmentData.results
        );

    }


    /* =========================================================
       STEP 7 — WHAT WE FOUND
       ========================================================= */

    function renderStep7() {

        const results =
            assessmentData.results;


        if (!results) {

            return;

        }


        /* =====================================================
           BUSINESS OVERVIEW
           ===================================================== */

        const businessSummary =
            document.getElementById(
                "business-summary"
            );


        if (businessSummary) {

            businessSummary.textContent =
                results.businessOverview;

        }


        /* =====================================================
           KEY FINDINGS
           ===================================================== */

        const keyFindingsContainer =
            document.getElementById(
                "key-findings"
            );


        if (keyFindingsContainer) {

            keyFindingsContainer.innerHTML =
                "";


            results.keyFindings.forEach(
                function (
                    finding,
                    index
                ) {

                    const item =
                        document.createElement(
                            "div"
                        );


                    item.className =
                        "finding-item";


                    item.innerHTML =
                        `
                        <span class="finding-number">
                            ${String(index + 1).padStart(2, "0")}
                        </span>

                        <div class="finding-content">

                            <h3>
                                ${finding.title}
                            </h3>

                            <p>
                                ${finding.description}
                            </p>

                        </div>
                        `;


                    keyFindingsContainer.appendChild(
                        item
                    );

                }
            );

        }


/* =====================================================
   PRIMARY OPPORTUNITY
   ===================================================== */

const primaryOpportunity =
    document.getElementById(
        "primary-opportunity"
    );


const primaryOpportunitySummary =
    document.getElementById(
        "primary-opportunity-summary"
    );


if (primaryOpportunity) {

    primaryOpportunity.textContent =
        results.primaryOpportunity;

}


if (primaryOpportunitySummary) {

    const primary =
        results.opportunities &&
        results.opportunities.length > 0
            ? results.opportunities[0]
            : null;


    if (primary) {

        primaryOpportunitySummary.innerHTML =
            `
            <div class="opportunity-summary-item">

                <strong>
                    ASCND NOTICED
                </strong>

                <p>
                    ${primary.reason}
                </p>

            </div>


            <div class="opportunity-summary-item">

                <strong>
                    WHY IT MATTERS
                </strong>

                <p>
                    This area may be creating unnecessary
                    friction in your current business
                    operations and limiting opportunities
                    for efficiency and growth.
                </p>

            </div>


            <div class="opportunity-summary-item">

                <strong>
                    THE OPPORTUNITY
                </strong>

                <p>
                    Improving the systems and processes
                    surrounding this area could help your
                    business operate more efficiently and
                    create a stronger foundation for growth.
                </p>

            </div>
            `;

    }

}

        /* =====================================================
           ASCND ANALYSIS
           ===================================================== */

        const analysis =
            document.getElementById(
                "results-meaning"
            );


        if (analysis) {

            analysis.textContent =
                results.analysis;

        }

    }


    /* =========================================================
       STEP 8 — RECOMMENDED SOLUTIONS
       ========================================================= */

    function renderStep8() {

        const results =
            assessmentData.results;


        if (!results) {

            return;

        }


        /* =====================================================
           PRIMARY OPPORTUNITY
           ===================================================== */

        const primaryOpportunity =
            document.getElementById(
                "primary-opportunity"
            );


        const primaryOpportunityDescription =
            document.getElementById(
                "primary-opportunity-description"
            );


        if (primaryOpportunity) {

            primaryOpportunity.textContent =
                results.primaryOpportunity;

        }


        if (primaryOpportunityDescription) {

            primaryOpportunityDescription.textContent =
                results.primaryDescription;

        }


        /* =====================================================
           RECOMMENDED SYSTEMS
           ===================================================== */

        const recommendedSystemsContainer =
            document.getElementById(
                "recommended-systems"
            );


        if (recommendedSystemsContainer) {

            recommendedSystemsContainer.innerHTML =
                "";


            results.recommendedSystems.forEach(
                function (
                    system,
                    index
                ) {

                    const item =
                        document.createElement(
                            "div"
                        );


                    item.className =
                        "service-option";


                    item.dataset.system =
                        system.name;


                    item.innerHTML =
                        `
                        <span class="service-number">
                            ${String(index + 1).padStart(2, "0")}
                        </span>

                        <div>

                            <h3>
                                ${system.name}
                            </h3>

                            <p>
                                ${system.description}
                            </p>

                        </div>
                        `;


                    recommendedSystemsContainer.appendChild(
                        item
                    );

                }
            );

        }


        /* =====================================================
           WHY ASCND RECOMMENDS THEM
           ===================================================== */

        const recommendationAnalysis =
            document.getElementById(
                "recommendation-analysis"
            );


        if (recommendationAnalysis) {

            const systemNames =
                results.recommendedSystems.map(
                    function (system) {

                        return system.name;

                    }
                );


            recommendationAnalysis.textContent =
                `ASCND recommends beginning with ${results.primaryOpportunity.toLowerCase()} because it represents the strongest opportunity identified in your assessment. ${systemNames.length > 1 ? `The additional recommended systems — ${systemNames.slice(1).join(", ")} — can support that primary opportunity as your business develops.` : "Additional systems can be added as your business develops."}`;

        }

    }


    /* =========================================================
   STEP 9 — ADDITIONAL SYSTEM SELECTION
   ========================================================= */

function setupAdditionalSystemOptions() {

    const additionalSystemOptions =
        document.querySelectorAll(
            ".additional-system-option"
        );


    additionalSystemOptions.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    button.classList.toggle(
                        "selected"
                    );


                    updateAdditionalSystems();

                }
            );

        }
    );

}


/* =========================================================
   UPDATE ADDITIONAL SYSTEMS
   ========================================================= */

function updateAdditionalSystems() {

    assessmentData.selectedAdditionalSystems =
        Array.from(
            document.querySelectorAll(
                ".additional-system-option.selected"
            )
        ).map(
            function (button) {

                return (
                    button.dataset.system ||
                    ""
                );

            }
        );


    renderSelectedAdditionalSystems();

}


/* =========================================================
   RENDER SELECTED ADDITIONAL SYSTEMS
   ========================================================= */

function renderSelectedAdditionalSystems() {

    const container =
        document.getElementById(
            "selected-additional-systems"
        );


    if (!container) {

        return;

    }


    container.innerHTML =
        "";


    if (
        assessmentData
            .selectedAdditionalSystems
            .length === 0
    ) {

        const empty =
            document.createElement(
                "p"
            );


        empty.className =
            "step-description";


        empty.textContent =
            "No additional systems selected.";


        container.appendChild(
            empty
        );


        return;

    }


    assessmentData
        .selectedAdditionalSystems
        .forEach(
            function (
                system,
                index
            ) {

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "service-option";


                item.innerHTML =
                    `
                    <span class="service-number">
                        ${String(index + 1).padStart(2, "0")}
                    </span>

                    <div>

                        <h3>
                            ${system}
                        </h3>

                        <p>
                            Additional system selected
                            for exploration.
                        </p>

                    </div>
                    `;


                container.appendChild(
                    item
                );

            }
        );

}


/* =========================================================
   STEP 9 — FILTER ADDITIONAL SYSTEMS
   ========================================================= */

function filterAdditionalSystems(
    recommendedSystems
) {

    const additionalSystemOptions =
        document.querySelectorAll(
            ".additional-system-option"
        );


    /*
    Normalize the recommended system names
    so the filtering works even though the
    recommendation engine uses slightly
    different names.
    */

    const recommendedCategories =
        recommendedSystems.map(
            function (system) {

                const name =
                    system.name.toLowerCase();


                if (
                    name.includes(
                        "lead management"
                    ) ||
                    name.includes(
                        "customer acquisition"
                    ) ||
                    name.includes(
                        "customer follow-up"
                    )
                ) {

                    return "Lead & Customer Management";

                }


                if (
                    name.includes(
                        "workflow automation"
                    )
                ) {

                    return "Workflow Automation";

                }


                if (
                    name.includes(
                        "digital presence"
                    )
                ) {

                    return "Digital Presence";

                }


                if (
                    name.includes(
                        "business systems"
                    ) ||
                    name.includes(
                        "business organization"
                    ) ||
                    name.includes(
                        "business scalability"
                    ) ||
                    name.includes(
                        "technology optimization"
                    ) ||
                    name.includes(
                        "business communication"
                    )
                ) {

                    return "Business Operations";

                }


                if (
                    name.includes(
                        "customer experience"
                    )
                ) {

                    return "Customer Experience";

                }


                if (
                    name.includes(
                        "revenue growth"
                    )
                ) {

                    return "Business Operations";

                }


                return "";

            }
        );


    additionalSystemOptions.forEach(
        function (button) {

            const system =
                button.dataset.system;


            const shouldHide =
                recommendedCategories.includes(
                    system
                );


            if (shouldHide) {

                button.style.display =
                    "none";


                /*
                If it was previously selected,
                remove the selection.
                */

                button.classList.remove(
                    "selected"
                );

            }

            else {

                button.style.display =
                    "";

            }

        }
    );


    updateAdditionalSystems();

}


/* =========================================================
   STEP 9 — RENDER EXPLORE ASCND
   ========================================================= */

function renderStep9() {

    const results =
        assessmentData.results;


    if (!results) {

        return;

    }


    /* =====================================================
       RECOMMENDED FOR YOU
       ===================================================== */

    const recommendedContainer =
        document.getElementById(
            "explore-recommended-systems"
        );


    if (recommendedContainer) {

        recommendedContainer.innerHTML =
            "";


        results.recommendedSystems
            .forEach(
                function (
                    system,
                    index
                ) {

                    const item =
                        document.createElement(
                            "div"
                        );


                    item.className =
                        "service-option";


                    item.dataset.system =
                        system.name;


                    item.innerHTML =
                        `
                        <span class="service-number">
                            ${String(index + 1).padStart(2, "0")}
                        </span>

                        <div>

                            <h3>
                                ${system.name}
                            </h3>

                            <p>
                                ${system.description}
                            </p>

                        </div>
                        `;


                    recommendedContainer.appendChild(
                        item
                    );

                }
            );

    }


    /* =====================================================
       HIDE RECOMMENDED SYSTEMS FROM
       ADDITIONAL SYSTEM OPTIONS
       ===================================================== */

    filterAdditionalSystems(
        results.recommendedSystems
    );


    /* =====================================================
       RENDER SELECTED ADDITIONAL SYSTEMS
       ===================================================== */

    renderSelectedAdditionalSystems();

}


/* =========================================================
   INITIALIZE ADDITIONAL SYSTEM OPTIONS
   ========================================================= */

setupAdditionalSystemOptions();


    /* =========================================================
       STEP 10 — CONFIRMATION
       ========================================================= */

    function renderStep10() {

        const results =
            assessmentData.results;


        if (!results) {

            return;

        }


        /* =====================================================
           FINAL SYSTEM LIST
           ===================================================== */

        const finalContainer =
            document.getElementById(
                "final-selected-systems"
            );


        if (finalContainer) {

            finalContainer.innerHTML =
                "";


            const finalSystems = [];


            results.recommendedSystems.forEach(
                function (system) {

                    if (
                        !finalSystems.includes(
                            system.name
                        )
                    ) {

                        finalSystems.push(
                            system.name
                        );

                    }

                }
            );


            assessmentData
                .selectedAdditionalSystems
                .forEach(
                    function (system) {

                        if (
                            !finalSystems.includes(
                                system
                            )
                        ) {

                            finalSystems.push(
                                system
                            );

                        }

                    }
                );


            finalSystems.forEach(
                function (
                    system,
                    index
                ) {

                    const item =
                        document.createElement(
                            "div"
                        );


                    item.className =
                        "service-option";


                    item.innerHTML =
                        `
                        <span class="service-number">
                            ${String(index + 1).padStart(2, "0")}
                        </span>

                        <div>

                            <h3>
                                ${system}
                            </h3>

                            <p>
                                Selected for your ASCND business plan.
                            </p>

                        </div>
                        `;


                    finalContainer.appendChild(
                        item
                    );

                }
            );

        }


        /* =====================================================
           CONFIRMATION MESSAGE
           ===================================================== */

        const confirmationMessage =
            document.getElementById(
                "confirmation-message"
            );


        if (confirmationMessage) {

            confirmationMessage.textContent =
                `Your assessment is complete. ASCND identified ${results.primaryOpportunity.toLowerCase()} as your primary opportunity and selected ${results.recommendedSystems.length} recommended system${results.recommendedSystems.length === 1 ? "" : "s"} based on your responses.`;

        }

    }


    /* =========================================================
       FINAL START WITH ASCND
       ========================================================= */

    const startAscndButton =
    document.getElementById(
        "start-ascnd-button"
    );


if (startAscndButton) {

    startAscndButton.addEventListener(
        "click",
        async function (event) {

            event.preventDefault();


            /* =====================================================
               CONTACT INFORMATION
               ===================================================== */

            const contactName =
                document.getElementById(
                    "contact-name"
                );


            const contactEmail =
                document.getElementById(
                    "contact-email"
                );


            const contactPhone =
                document.getElementById(
                    "contact-phone"
                );


            const contactData = {

                name:
                    contactName
                        ? contactName.value.trim()
                        : "",

                email:
                    contactEmail
                        ? contactEmail.value.trim()
                        : "",

                phone:
                    contactPhone
                        ? contactPhone.value.trim()
                        : ""

            };


            /* =====================================================
               BASIC VALIDATION
               ===================================================== */

            if (!contactData.name) {

                alert(
                    "Please enter your name before continuing."
                );

                return;

            }


            if (!contactData.email) {

                alert(
                    "Please enter your email address before continuing."
                );

                return;

            }


            /* =====================================================
               BUILD FINAL SUBMISSION
               ===================================================== */

            const submission = {

                contact:
                    contactData,

                business:
                    {

                        name:
                            assessmentData.businessName,

                        description:
                            assessmentData.businessDescription,

                        teamSize:
                            assessmentData.teamSize

                    },

                assessment:
                    {

                        improvementAreas:
                            assessmentData.improvementAreas,

                        timeConsuming:
                            assessmentData.timeConsuming,

                        biggestImprovement:
                            assessmentData.biggestImprovement,

                        processManagement:
                            assessmentData.processManagement,

                        systemConnection:
                            assessmentData.systemConnection,

                        onlinePresence:
                            assessmentData.onlinePresence,

                        customerContact:
                            assessmentData.customerContact,

                        digitalSatisfaction:
                            assessmentData.digitalSatisfaction,

                        primaryGoals:
                            assessmentData.primaryGoals,

                        biggestDifference:
                            assessmentData.biggestDifference,

                        oneProblem:
                            assessmentData.oneProblem,

                        timeline:
                            assessmentData.timeline,

                        investmentReadiness:
                            assessmentData.investmentReadiness

                    },

                results:
                    assessmentData.results,

                additionalSystems:
                    assessmentData.selectedAdditionalSystems

            };


            /* =====================================================
               DISABLE BUTTON WHILE SUBMITTING
               ===================================================== */

            startAscndButton.disabled =
                true;


            startAscndButton.innerHTML =
                `
                SUBMITTING
                <span>...</span>
                `;


            try {

                /* =================================================
                   SEND ASSESSMENT TO ASCND BACKEND
                   ================================================= */

                const response =
                    await fetch(
                        "/api/assessment",
                        {

                            method:
                                "POST",

                            headers:
                                {

                                    "Content-Type":
                                        "application/json"

                                },

                            body:
                                JSON.stringify(
                                    submission
                                )

                        }
                    );


                const result =
                    await response.json();


                /* =================================================
                   SUCCESS
                   ================================================= */

                if (
    response.ok &&
    result.success
) {

    console.log(
        "ASCND ASSESSMENT SUBMITTED:",
        submission
    );


    alert(
        "CONGRATULATIONS! Your ASCND assessment has been successfully submitted. A member of our team will be in contact with you soon."
    );


    startAscndButton.innerHTML =
        `
        SUBMITTED
        <span>✓</span>
        `;


    return;

}


                /* =================================================
                   SERVER ERROR
                   ================================================= */

                throw new Error(
                    result.message ||
                    "Assessment submission failed."
                );

            }

            catch (error) {

                console.error(
                    "ASCND SUBMISSION ERROR:",
                    error
                );


                alert(
                    "We couldn't submit your assessment right now. Please try again."
                );


                startAscndButton.disabled =
                    false;


                startAscndButton.innerHTML =
                    `
                    START WITH ASCND
                    <span>→</span>
                    `;

            }

        }
    );

}


    /* =========================================================
       INITIALIZE
       ========================================================= */

    showStep(1);


    console.log(
        "ASCND Assessment Engine Loaded."
    );

});