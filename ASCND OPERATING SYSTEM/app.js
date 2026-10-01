const navItems = document.querySelectorAll(".nav-item");
const views = document.querySelectorAll(".view");

function showView(viewName) {

    // Close global search whenever the main section changes
    if (
        typeof closeGlobalSearch === "function" &&
        globalSearchPanel &&
        globalSearchPanel.style.display !== "none"
    ) {
        closeGlobalSearch();
    }

    views.forEach(view => {
        view.classList.toggle("active", view.id === viewName);
    });

    navItems.forEach(item => {
        item.classList.toggle(
            "active",
            item.dataset.view === viewName
        );
    });

    const greetingElement =
        document.getElementById("greeting");

    if (greetingElement) {
        greetingElement.style.display =
            viewName === "overview" ? "block" : "none";
    }

}

navItems.forEach(item => {

    item.addEventListener("click", () => {
        showView(item.dataset.view);
    });

});


document.querySelectorAll("[data-view-target]").forEach(button => {

    button.addEventListener("click", () => {
        showView(button.dataset.viewTarget);
    });

});


const newOpportunityButton =
    document.getElementById("newOpportunity");

const newRadarOpportunity =
    document.getElementById("newRadarOpportunity");

const newOpportunityModal =
    document.getElementById("newOpportunityModal");

const closeNewOpportunity =
    document.getElementById("closeNewOpportunity");

const cancelNewOpportunity =
    document.getElementById("cancelNewOpportunity");


function openNewOpportunityModal() {

    if (!newOpportunityModal) return;

    newOpportunityModal.classList.add("active");

}


function closeNewOpportunityModal() {

    if (!newOpportunityModal) return;

    newOpportunityModal.classList.remove("active");

}


if (newOpportunityButton) {

    newOpportunityButton.addEventListener(
        "click",
        openNewOpportunityModal
    );

}


if (newRadarOpportunity) {

    newRadarOpportunity.addEventListener(
        "click",
        openNewOpportunityModal
    );

}


if (closeNewOpportunity) {

    closeNewOpportunity.addEventListener(
        "click",
        closeNewOpportunityModal
    );

}


if (cancelNewOpportunity) {

    cancelNewOpportunity.addEventListener(
        "click",
        closeNewOpportunityModal
    );

}

/* =========================================
   CREATE OPPORTUNITY
========================================= */

const newOpportunityForm =
    document.getElementById("newOpportunityForm");

    /* =========================================
   AUTOMATIC OPPORTUNITY VALUE
========================================= */

const opportunitySolutionInputs =
    document.querySelectorAll(
        'input[name="opportunitySolution"]'
    );

const opportunityCalculatedValue =
    document.getElementById(
        "newOpportunityCalculatedValue"
    );

function calculateOpportunityValue() {

    let total = 0;

    opportunitySolutionInputs.forEach(
        input => {

            if (input.checked) {

                total +=
                    Number(
                        input.dataset.value
                    ) || 0;

            }

        }
    );

    if (opportunityCalculatedValue) {

        opportunityCalculatedValue.textContent =
            `$${total.toLocaleString()}`;

    }

    return total;
}


opportunitySolutionInputs.forEach(
    input => {

        input.addEventListener(
            "change",
            calculateOpportunityValue
        );

    }
);


if (newOpportunityForm) {

    newOpportunityForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const opportunity = {

                business_name:
                    document
                        .getElementById(
                            "newOpportunityBusiness"
                        )
                        .value
                        .trim(),

                phone:
                    document
                        .getElementById(
                            "newOpportunityPhone"
                        )
                        .value
                        .trim(),

                email:
                    document
                        .getElementById(
                            "newOpportunityEmail"
                        )
                        .value
                        .trim(),

                website:
                    document
                        .getElementById(
                            "newOpportunityWebsite"
                        )
                .value
                       .trim(),

                value: 
                        calculateOpportunityValue(),

                        solutions:
    Array.from(
        opportunitySolutionInputs
    )
        .filter(
            input => input.checked
        )
        .map(
            input => input.value
        )
        .join(", "),
                        
                        
                opportunity:
                    document
                        .getElementById(
                            "newOpportunityWhat"
                        )
                        .value
                        .trim(),

                notes:
                    document
                        .getElementById(
                            "newOpportunityNotes"
                        )
                        .value
                        .trim()

            };


            if (!opportunity.business_name) {

                alert(
                    "Business name is required."
                );

                return;

            }


            if (!opportunity.opportunity) {

                alert(
                    "Opportunity is required."
                );

                return;

            }


            try {

                const response =
                    await fetch(
                        "http://localhost:3000/api/opportunities",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    opportunity
                                )
                        }
                    );


                const result =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        result.error ||
                        "Failed to create opportunity."
                    );

                }

                if (
    activeAssessmentId &&
    result &&
    result.id
) {

    const linkResponse =
        await fetch(
            `http://localhost:3000/api/assessments/${activeAssessmentId}/opportunity`,
            {
                method: "PATCH",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    opportunity_id:
                        result.id
                })
            }
        );


    const linkResult =
        await linkResponse.json();


    if (!linkResponse.ok) {

        console.error(
            "Assessment opportunity link failed:",
            linkResult
        );

        alert(
            "Opportunity was created, but it could not be linked to the assessment."
        );

        return;

    }

}


                newOpportunityForm.reset();

                calculateOpportunityValue();

                closeNewOpportunityModal();


                alert(
                    "Opportunity created successfully."
                );


            } catch (error) {

                console.error(
                    "Opportunity creation error:",
                    error
                );


                alert(
                    error.message ||
                    "Failed to create opportunity."
                );

            }

        }
    );

}

/* =========================================
   LOAD OPPORTUNITIES
========================================= */

let opportunities = [];

const opportunityList =
    document.getElementById("opportunityList");

const opportunityCount =
    document.getElementById("opportunityCount");

    const opportunityTotal =
    document.getElementById("opportunityTotal");

const opportunityNew =
    document.getElementById("opportunityNew");

const opportunityReview =
    document.getElementById("opportunityReview");

const opportunityPipelineValue =
    document.getElementById(
        "opportunityPipelineValue"
    );


function getOpportunityInitials(name) {

    if (!name) return "?";

    const words =
        name
            .trim()
            .split(/\s+/)
            .filter(Boolean);

    if (words.length === 1) {
        return words[0]
            .substring(0, 2)
            .toUpperCase();
    }

    return (
        words[0].charAt(0) +
        words[1].charAt(0)
    ).toUpperCase();

}


function escapeOpportunityHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}

/* =========================================
   LIVE ASCND BRIEFING
========================================= */

function renderOverviewBriefing() {

    const overviewElement =
        document.getElementById("briefingOverview");

    const pipelineElement =
        document.getElementById("briefingPipeline");

    const attentionElement =
        document.getElementById("briefingAttention");

    const focusElement =
        document.getElementById("briefingFocus");

    if (
        !overviewElement ||
        !pipelineElement ||
        !attentionElement ||
        !focusElement
    ) {
        return;
    }

    const opportunityList =
        Array.isArray(opportunities)
            ? opportunities
            : [];

    const assessmentList =
        Array.isArray(assessmentRecords)
            ? assessmentRecords
            : [];


    /* =========================================
       CURRENT DATA
    ========================================= */

    const activeOpportunities =
        opportunityList.filter(
            function (opportunity) {

                return String(
                    opportunity.stage || ""
                ).toUpperCase() !== "CLOSED";

            }
        );


    const newAssessments =
        assessmentList.filter(
            function (assessment) {

                const status =
                    String(
                        assessment.status || "NEW"
                    ).toUpperCase();

                return (
                    status === "NEW" &&
                    !assessment.opportunity_id
                );

            }
        );


    const reviewOpportunities =
        opportunityList.filter(
            function (opportunity) {

                return String(
                    opportunity.stage || ""
                ).toUpperCase() === "REVIEW";

            }
        );


    const highPriorityItems = [

        ...newAssessments.filter(
            function (assessment) {

                return String(
                    assessment.priority || ""
                ).toLowerCase() === "high";

            }
        ),

        ...opportunityList.filter(
            function (opportunity) {

                return (
                    String(
                        opportunity.priority || ""
                    ).toLowerCase() === "high"
                    &&
                    ["NEW", "REVIEW"].includes(
                        String(
                            opportunity.stage || ""
                        ).toUpperCase()
                    )
                );

            }
        )

    ];


    const pipelineValue =
        opportunityList.reduce(
            function (total, opportunity) {

                return (
                    total +
                    (Number(opportunity.value) || 0)
                );

            },
            0
        );


    /* =========================================
       BUSINESS NAMES
    ========================================= */

    const assessmentNames =
        newAssessments
            .map(function (assessment) {

                return (
                    assessment.business_name ||
                    assessment.business ||
                    assessment.company_name ||
                    "an incoming business"
                );

            })
            .slice(0, 2);


    const reviewNames =
        reviewOpportunities
            .map(function (opportunity) {

                return (
                    opportunity.business_name ||
                    "an active opportunity"
                );

            })
            .slice(0, 2);


    /* =========================================
       OVERVIEW DESCRIPTION
    ========================================= */

    if (newAssessments.length > 0) {

        let assessmentDescription =
            newAssessments.length === 1
                ? "A new assessment is currently waiting for review"
                : `${newAssessments.length} new assessments are currently waiting for review`;

        if (assessmentNames.length > 0) {

            assessmentDescription +=
                `, including ${assessmentNames.join(" and ")}`;

        }

        overviewElement.textContent =
            `${assessmentDescription}. This is currently expanding the opportunity pool while existing opportunities continue moving through the pipeline.`;

    } else if (activeOpportunities.length > 0) {

        overviewElement.textContent =
            `ASCND currently has ${activeOpportunities.length} active opportunit${
                activeOpportunities.length === 1
                    ? "y"
                    : "ies"
            } moving through the pipeline. No new assessments are currently waiting for review, so attention can remain focused on progressing the opportunities already in the system.`;

    } else {

        overviewElement.textContent =
            "The current pipeline is clear of active opportunities and unreviewed assessments. The next priority is generating new business activity and adding qualified opportunities to the system.";

    }


    /* =========================================
       PIPELINE DESCRIPTION
    ========================================= */

    if (pipelineValue > 0) {

        pipelineElement.textContent =
            `The current opportunity pipeline represents $${pipelineValue.toLocaleString()} in potential revenue across the businesses currently in the system.`;

    } else {

        pipelineElement.textContent =
            "There is currently no potential revenue attached to the active opportunity pipeline.";

    }


    /* =========================================
       ATTENTION DESCRIPTION
    ========================================= */

    if (
        highPriorityItems.length > 0 &&
        reviewOpportunities.length > 0
    ) {

        attentionElement.textContent =
            `${highPriorityItems.length} high-priority item${
                highPriorityItems.length === 1
                    ? ""
                    : "s"
            } require attention, while ${
                reviewOpportunities.length
            } ${
                reviewOpportunities.length === 1
                    ? "opportunity is"
                    : "opportunities are"
            } currently in review${
                reviewNames.length > 0
                    ? `, including ${reviewNames.join(" and ")}`
                    : ""
            }.`;

    } else if (highPriorityItems.length > 0) {

        attentionElement.textContent =
            `${highPriorityItems.length} high-priority item${
                highPriorityItems.length === 1
                    ? ""
                    : "s"
            } currently require attention.`;

    } else if (reviewOpportunities.length > 0) {

        attentionElement.textContent =
            `${reviewOpportunities.length} ${
                reviewOpportunities.length === 1
                    ? "opportunity is"
                    : "opportunities are"
            } currently in review${
                reviewNames.length > 0
                    ? `, including ${reviewNames.join(" and ")}`
                    : ""
            }.`;

    } else {

        attentionElement.textContent =
            "There are currently no high-priority or review-stage opportunities requiring immediate attention.";

    }


    /* =========================================
       CURRENT FOCUS
    ========================================= */

    if (newAssessments.length > 0) {

        focusElement.textContent =
            "Review incoming assessments, identify qualified opportunities, and move the strongest prospects into the active pipeline.";

    } else if (highPriorityItems.length > 0) {

        focusElement.textContent =
            "Address the highest-priority opportunities first and move them toward the next stage.";

    } else if (reviewOpportunities.length > 0) {

        focusElement.textContent =
            "Follow up on opportunities in review and keep active prospects moving forward.";

    } else if (activeOpportunities.length > 0) {

        focusElement.textContent =
            "Continue progressing active opportunities while creating new opportunities for the pipeline.";

    } else {

        focusElement.textContent =
            "Generate new business activity and continue building the ASCND opportunity pipeline.";

    }

}

async function loadOpportunities() {

    try {

        const response =
            await fetch(
                "http://localhost:3000/api/opportunities"
            );

        if (!response.ok) {

            throw new Error(
                "Failed to load opportunities."
            );

        }

        opportunities =
    await response.json();

renderOpportunities();

renderOverviewMetrics();

renderAttentionQueue(
    opportunities,
    assessmentRecords
);

renderInboxRecentActivity();

renderOverviewAttention();

renderOverviewRecentActivity();

renderOverviewBriefing();

    } catch (error) {

        console.error(
            "Opportunities load error:",
            error
        );

    }

}

/* =========================================
   OVERVIEW METRICS
========================================= */

function renderOverviewMetrics() {

    const activeElement =
        document.getElementById(
            "overviewActiveOpportunities"
        );

    const followUpElement =
        document.getElementById(
            "overviewFollowUps"
        );

    const proposalsElement =
        document.getElementById(
            "overviewProposals"
        );

    const pipelineElement =
        document.getElementById(
            "overviewPipelineValue"
        );


    const activeOpportunities =
        opportunities.filter(
            opportunity =>
                opportunity.stage !== "CLOSED"
        ).length;


    const followUps =
        opportunities.filter(
            opportunity =>
                opportunity.stage === "FOLLOW-UP"
        ).length;


    const proposals =
        opportunities.filter(
            opportunity =>
                opportunity.stage === "PROPOSAL"
        ).length;


    const pipelineValue =
        opportunities.reduce(
            (total, opportunity) =>
                total +
                (Number(opportunity.value) || 0),
            0
        );


    if (activeElement) {

        activeElement.textContent =
            activeOpportunities;

    }


    if (followUpElement) {

        followUpElement.textContent =
            followUps;

    }


    if (proposalsElement) {

        proposalsElement.textContent =
            proposals;

    }


    if (pipelineElement) {

        pipelineElement.textContent =
            `$${pipelineValue.toLocaleString()}`;

    }

}

let opportunityDatabaseExpanded = false;


function renderOpportunities() {

    if (!opportunityList) return;


    /* =========================================
       RADAR SUMMARY
    ========================================= */

    const total =
        opportunities.length;

    const newCount =
        opportunities.filter(
            opportunity =>
                opportunity.stage === "NEW"
        ).length;

    const reviewCount =
        opportunities.filter(
            opportunity =>
                opportunity.stage === "REVIEW"
        ).length;


    if (opportunityTotal) {

        opportunityTotal.textContent =
            total;

    }


    if (opportunityNew) {

        opportunityNew.textContent =
            newCount;

    }


    if (opportunityReview) {

        opportunityReview.textContent =
            reviewCount;

    }


    const pipelineValue =
        opportunities.reduce(
            (total, opportunity) =>
                total +
                (Number(opportunity.value) || 0),
            0
        );


    if (opportunityPipelineValue) {

        opportunityPipelineValue.textContent =
            `$${pipelineValue.toLocaleString()}`;

    }


    /* =========================================
       DISPLAY LIMIT
    ========================================= */

    const visibleOpportunities =
        opportunityDatabaseExpanded
            ? opportunities
            : opportunities.slice(0, 3);


    opportunityList.innerHTML = "";


    /* =========================================
       OPPORTUNITY ROWS
    ========================================= */

    visibleOpportunities.forEach(
        opportunity => {

            const row =
                document.createElement("div");


            row.className =
                "company-row";


            row.dataset.opportunity =
                opportunity.id;


            const initials =
                getOpportunityInitials(
                    opportunity.business_name
                );


            row.innerHTML = `

                <div class="company-avatar">

                    ${escapeOpportunityHtml(
                        initials
                    )}

                </div>


                <div class="company-info">

                    <strong>

                        ${escapeOpportunityHtml(
                            opportunity.business_name
                        )}

                    </strong>


                    <span>

                        ${escapeOpportunityHtml(
                            opportunity.opportunity
                        )}

                    </span>

                </div>


                <div class="company-status prospect">

                    ${escapeOpportunityHtml(
                        opportunity.stage || "NEW"
                    )}

                </div>


                <div class="company-action">

                    →

                </div>

            `;


            row.addEventListener(
                "click",
                () => {

                    openOpportunityDetail(
                        opportunity
                    );

                }
            );


            opportunityList.appendChild(
                row
            );

        }
    );


    /* =========================================
       VIEW ALL / SHOW LESS
    ========================================= */

    if (opportunities.length > 3) {

        opportunityList.innerHTML += `

            <div
                class="attention-queue-toggle"
            >

                <button
                    type="button"
                    id="opportunityDatabaseToggle"
                    class="attention-toggle-button"
                >

                    ${
                        opportunityDatabaseExpanded
                            ? "SHOW LESS"
                            : "VIEW ALL"
                    }

                </button>

            </div>

        `;


        const toggleButton =
            document.getElementById(
                "opportunityDatabaseToggle"
            );


        if (toggleButton) {

            toggleButton.addEventListener(
                "click",
                function () {

                    opportunityDatabaseExpanded =
                        !opportunityDatabaseExpanded;


                    renderOpportunities();

                }
            );

        }

    }

    function renderOverviewMetrics() {

    const activeElement =
        document.getElementById(
            "overviewActiveOpportunities"
        );

    const followUpElement =
        document.getElementById(
            "overviewFollowUps"
        );

    const proposalsElement =
        document.getElementById(
            "overviewProposals"
        );

    const pipelineElement =
        document.getElementById(
            "overviewPipelineValue"
        );

    /* =========================================
       ACTIVE OPPORTUNITIES
    ========================================= */

    const activeOpportunities =
        opportunities.filter(
            opportunity =>
                opportunity.stage !== "CLOSED"
        ).length;


    /* =========================================
       FOLLOW-UPS
    ========================================= */

    const followUps =
        opportunities.filter(
            opportunity =>
                opportunity.stage === "FOLLOW-UP"
        ).length;


    /* =========================================
       PROPOSALS
    ========================================= */

    const proposals =
        opportunities.filter(
            opportunity =>
                opportunity.stage === "PROPOSAL"
        ).length;


    /* =========================================
       PIPELINE VALUE
    ========================================= */

    const pipelineValue =
        opportunities.reduce(
            (total, opportunity) =>
                total +
                (Number(opportunity.value) || 0),
            0
        );


    /* =========================================
       UPDATE OVERVIEW
    ========================================= */

    if (activeElement) {

        activeElement.textContent =
            activeOpportunities;

    }


    if (followUpElement) {

        followUpElement.textContent =
            followUps;

    }


    if (proposalsElement) {

        proposalsElement.textContent =
            proposals;

    }


    if (pipelineElement) {

        pipelineElement.textContent =
            `$${pipelineValue.toLocaleString()}`;

    }

}

    /* =========================================
       OPPORTUNITY COUNT
    ========================================= */

    if (opportunityCount) {

        opportunityCount.textContent =
            `${opportunities.length} opportunit${
                opportunities.length === 1
                    ? "y"
                    : "ies"
            }`;

    }

}


/* =========================================
   DYNAMIC GREETING
========================================= */

function updateGreeting() {
    const greetingElement = document.getElementById("greeting");

    if (!greetingElement) return;

    const hour = new Date().getHours();

    let greeting;

    if (hour < 12) {
        greeting = "Good morning";
    } else if (hour < 18) {
        greeting = "Good afternoon";
    } else {
        greeting = "Good evening";
    }

    greetingElement.textContent =
        `${greeting}, Mr. Laguna`;
}

updateGreeting();


/* =========================================
   COMPANIES
========================================= */

const companySearch =
    document.getElementById("companySearch");

const companyFilter =
    document.getElementById("companyFilter");

const companyList =
    document.getElementById("companyList");

const companyCount =
    document.getElementById("companyCount");

const newCompanyButton =
    document.getElementById("newCompany");

let companies = [];



/* =========================================
   LOAD COMPANIES
========================================= */

async function loadCompanies() {

    if (!companyList) return;

    try {

        const response = await fetch(
            "http://localhost:3000/api/companies"
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.error ||
                "Failed to load companies."
            );
        }

        companies = result;

        renderCompanies();

        console.log(
            "Companies loaded:",
            companies
        );

    } catch (error) {

        console.error(
            "Company loading failed:",
            error
        );

        companyList.innerHTML = `
            <div class="empty-state">
                Unable to load companies.
            </div>
        `;

    }

}



/* =========================================
   RENDER COMPANIES
========================================= */

function renderCompanies() {

    if (!companyList) return;

    const searchTerm =
        (companySearch?.value || "")
            .toLowerCase()
            .trim();

    const filterValue =
        companyFilter?.value || "all";


    const filteredCompanies =
        companies.filter(company => {

            const companyName =
                (company.name || "")
                    .toLowerCase();

            const status =
                (company.status || "")
                    .toLowerCase();


            const matchesSearch =
                companyName.includes(
                    searchTerm
                );


            const matchesFilter =
                filterValue === "all" ||
                status === filterValue;


            return (
                matchesSearch &&
                matchesFilter
            );

        });


    companyList.innerHTML = "";


    if (filteredCompanies.length === 0) {

        companyList.innerHTML = `
            <div class="empty-state">
                No companies found.
            </div>
        `;

    }


    filteredCompanies.forEach(
        company => {

            const row =
                document.createElement("div");

            row.className =
                "company-row";


            row.dataset.companyId =
                company.id;


            row.dataset.company =
                company.name;


            row.dataset.status =
                (company.status || "")
                    .toLowerCase();


            const initials =
                getCompanyInitials(
                    company.name
                );


            const status =
                (company.status ||
                    "PROSPECT")
                    .toUpperCase();


            const statusClass =
                status.toLowerCase();


            row.innerHTML = `

                <div class="company-avatar">
                    ${initials}
                </div>

                <div class="company-info">

                    <strong>
                        ${escapeHtml(
                            company.name
                        )}
                    </strong>

                    <span>
                        ${escapeHtml(
                            company.industry ||
                            "Business"
                        )}
                    </span>

                </div>

                <div
                    class="company-status ${statusClass}"
                >
                    ${status}
                </div>

                <div class="company-action">
                    →
                </div>

            `;


            row.addEventListener(
                "click",
                () => {

                    openCompany(
                        company.id
                    );

                }
            );


            companyList.appendChild(row);

        }
    );


    if (companyCount) {

        companyCount.textContent =
            `${filteredCompanies.length} ${
                filteredCompanies.length === 1
                    ? "company"
                    : "companies"
            }`;

    }

}



/* =========================================
   COMPANY HELPERS
========================================= */

function getCompanyInitials(name) {

    if (!name) return "??";


    const words =
        name
            .trim()
            .split(/\s+/)
            .filter(Boolean);


    if (words.length === 1) {

        return words[0]
            .substring(0, 2)
            .toUpperCase();

    }


    return (
        words[0][0] +
        words[1][0]
    ).toUpperCase();

}



function escapeHtml(value) {

    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}



/* =========================================
   COMPANY SEARCH / FILTER
========================================= */

if (companySearch) {

    companySearch.addEventListener(
        "input",
        renderCompanies
    );

}


if (companyFilter) {

    companyFilter.addEventListener(
        "change",
        renderCompanies
    );

}



/* =========================================
   NEW COMPANY MODAL
========================================= */

const newCompanyModal =
    document.getElementById(
        "newCompanyModal"
    );

const closeNewCompany =
    document.getElementById(
        "closeNewCompany"
    );

const cancelNewCompany =
    document.getElementById(
        "cancelNewCompany"
    );

const newCompanyForm =
    document.getElementById(
        "newCompanyForm"
    );



if (newCompanyButton) {

    newCompanyButton.addEventListener(
        "click",
        () => {

            if (newCompanyModal) {

                newCompanyModal.style.display =
                    "flex";

            }

        }
    );

}



function closeNewCompanyModal() {

    if (newCompanyModal) {

        newCompanyModal.style.display =
            "none";

    }

}



if (closeNewCompany) {

    closeNewCompany.addEventListener(
        "click",
        closeNewCompanyModal
    );

}



if (cancelNewCompany) {

    cancelNewCompany.addEventListener(
        "click",
        closeNewCompanyModal
    );

}



if (newCompanyModal) {

    newCompanyModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                newCompanyModal
            ) {

                closeNewCompanyModal();

            }

        }
    );

}



/* =========================================
   CREATE COMPANY
========================================= */

if (newCompanyForm) {

    newCompanyForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const company = {

                name:
                    document
                        .getElementById(
                            "newCompanyName"
                        )
                        .value
                        .trim(),

                industry:
                    document
                        .getElementById(
                            "newCompanyIndustry"
                        )
                        .value
                        .trim(),

                status:
                    document
                        .getElementById(
                            "newCompanyStatus"
                        )
                        .value,

                phone:
                    document
                        .getElementById(
                            "newCompanyPhone"
                        )
                        .value
                        .trim(),

                email:
                    document
                        .getElementById(
                            "newCompanyEmail"
                        )
                        .value
                        .trim(),

                primary_contact:
                    document
                        .getElementById(
                            "newCompanyContact"
                        )
                        .value
                        .trim(),

                notes:
                    document
                        .getElementById(
                            "newCompanyNotes"
                        )
                        .value
                        .trim()

            };


            if (!company.name) {

                alert(
                    "Company name is required."
                );

                return;

            }


            try {

                const response =
                    await fetch(
                        "http://localhost:3000/api/companies",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    company
                                )
                        }
                    );


                const result =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        result.error ||
                        "Failed to create company."
                    );

                }


                alert(
                    "Company created successfully."
                );


                newCompanyForm.reset();


                closeNewCompanyModal();


                /*
                 * Add the newly created
                 * company to the local list.
                 */

                companies.unshift(
                    result
                );


                renderCompanies();


                console.log(
                    "Created company:",
                    result
                );


            } catch (error) {

                console.error(
                    "Company creation failed:",
                    error
                );


                alert(
                    error.message ||
                    "Something went wrong creating the company."
                );

            }

        }
    );

}



/* =========================================
   COMPANY RECORD
========================================= */

const companyRecord =
    document.getElementById(
        "companyRecord"
    );

const backToCompanies =
    document.getElementById(
        "backToCompanies"
    );



function openCompany(companyId) {

    const company =
        companies.find(
            item =>
                String(item.id) ===
                String(companyId)
        );


    if (
        !company ||
        !companyRecord
    ) {

        return;

    }


    document.getElementById(
        "companyRecordTitle"
    ).textContent =
        company.name || "—";


    document.getElementById(
        "companyRecordType"
    ).textContent =
        company.industry || "Business";


    document.getElementById(
        "companyRecordName"
    ).textContent =
        company.name || "—";


    document.getElementById(
        "companyRecordIndustry"
    ).textContent =
        company.industry || "—";


    document.getElementById(
        "companyRecordStatus"
    ).textContent =
        company.status || "—";


    document.getElementById(
        "companyRecordContact"
    ).textContent =
        company.primary_contact || "—";


    document.getElementById(
        "companyRecordPhone"
    ).textContent =
        company.phone || "—";


    document.getElementById(
        "companyRecordEmail"
    ).textContent =
        company.email || "—";


    const nextAction =
        document.getElementById(
            "companyRecordNextAction"
        );

    if (nextAction) {

        nextAction.textContent =
            company.status === "CLIENT"
                ? "Continue account development."
                : "Follow up with prospect.";

    }


    const opportunity =
        document.getElementById(
            "companyRecordOpportunity"
        );

    if (opportunity) {

        opportunity.textContent =
            "No opportunity linked yet.";

    }


    const stage =
        document.getElementById(
            "companyRecordOpportunityStage"
        );

    if (stage) {

        stage.textContent =
            "—";

    }


    const value =
        document.getElementById(
            "companyRecordOpportunityValue"
        );

    if (value) {

        value.textContent =
            "—";

    }


    const description =
        document.getElementById(
            "companyRecordOpportunityDescription"
        );

    if (description) {

        description.textContent =
            company.notes ||
            "No company notes yet.";

    }


    const activity =
        document.getElementById(
            "companyRecordActivity"
        );

    if (activity) {

        activity.textContent =
            "Company record created.";

    }


    showView("companyRecord");

}



if (backToCompanies) {

    backToCompanies.addEventListener(
        "click",
        () => {

            showView("companies");

        }
    );

}



/* =========================================
   INITIAL COMPANY LOAD
========================================= */

loadCompanies();

/* =========================================
   CONTACTS
========================================= */

let contacts = [];

const contactSearch =
    document.getElementById("contactSearch");

const contactList =
    document.getElementById("contactList");

const contactCount =
    document.getElementById("contactCount");

const newContactButton =
    document.getElementById("newContact");

const newContactModal =
    document.getElementById("newContactModal");

const closeNewContact =
    document.getElementById("closeNewContact");

const cancelNewContact =
    document.getElementById("cancelNewContact");

const newContactForm =
    document.getElementById("newContactForm");


/* =========================================
   CONTACT HELPERS
========================================= */

function getContactInitials(firstName, lastName) {

    const first =
        firstName?.trim().charAt(0) || "";

    const last =
        lastName?.trim().charAt(0) || "";

    return (
        first + last
    ).toUpperCase() || "?";

}


function escapeHtml(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================
   LOAD CONTACTS
========================================= */

async function loadContacts() {

    try {

        const response =
            await fetch(
                "http://localhost:3000/api/contacts"
            );

        if (!response.ok) {

            throw new Error(
                "Failed to load contacts."
            );

        }

        contacts =
            await response.json();

        renderContacts();

    } catch (error) {

        console.error(
            "Contacts load error:",
            error
        );

    }

}

/* =========================================
   RENDER CONTACTS
========================================= */

function renderContacts() {

    if (!contactList) return;

    const searchTerm =
        contactSearch
            ? contactSearch.value
                .trim()
                .toLowerCase()
            : "";

    const filteredContacts =
        contacts.filter(contact => {

            const fullName =
                [
                    contact.first_name,
                    contact.last_name
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();

            const companyName =
                contact.companies?.name
                    ?.toLowerCase() || "";

            return (
                fullName.includes(searchTerm) ||
                companyName.includes(searchTerm) ||
                (contact.email || "")
                    .toLowerCase()
                    .includes(searchTerm)
            );

        });


    contactList.innerHTML = "";


    filteredContacts.forEach(contact => {

        const fullName =
            [
                contact.first_name,
                contact.last_name
            ]
                .filter(Boolean)
                .join(" ");


        const companyName =
            contact.companies?.name ||
            "No company";


        const row =
            document.createElement("div");

        row.className =
            "company-row contact-row";


        row.dataset.contact =
            contact.id;


        row.innerHTML = `

            <div class="company-avatar">
                ${escapeHtml(
                    getContactInitials(
                        contact.first_name,
                        contact.last_name
                    )
                )}
            </div>

            <div class="company-info">

                <strong>
                    ${escapeHtml(fullName)}
                </strong>

                <span>
                    ${escapeHtml(companyName)}
                </span>

            </div>

            <div class="company-status prospect">
                CONTACT
            </div>

            <div class="company-action">
                →
            </div>

        `;


        /* =========================================
           OPEN CONTACT DETAIL
        ========================================= */

        row.addEventListener(
            "click",
            () => {

                openContactDetail(contact);

            }
        );


        contactList.appendChild(row);

    });


    if (contactCount) {

        contactCount.textContent =
            `${contacts.length} contact${contacts.length === 1 ? "" : "s"}`;

    }

}

/* =========================================
   CONTACT DETAIL
========================================= */

const contactDetail =
    document.getElementById("contactDetail");

const backToContacts =
    document.getElementById("backToContacts");


function openContactDetail(contact) {

    if (!contact || !contactDetail) {
        return;
    }


    /* NAME */

    const title =
        document.getElementById(
            "contactDetailTitle"
        );

    const subtitle =
        document.getElementById(
            "contactDetailSubtitle"
        );


    const fullName =
        [
            contact.first_name,
            contact.last_name
        ]
            .filter(Boolean)
            .join(" ");


    if (title) {

        title.textContent =
            fullName ||
            "Contact";

    }


    if (subtitle) {

        subtitle.textContent =
            contact.companies?.name ||
            "Business relationship";

    }


    /* FIRST NAME */

    const firstName =
        document.getElementById(
            "contactDetailFirstName"
        );

    if (firstName) {

        firstName.textContent =
            contact.first_name ||
            "—";

    }


    /* LAST NAME */

    const lastName =
        document.getElementById(
            "contactDetailLastName"
        );

    if (lastName) {

        lastName.textContent =
            contact.last_name ||
            "—";

    }


    /* EMAIL */

    const email =
        document.getElementById(
            "contactDetailEmail"
        );

    if (email) {

        email.textContent =
            contact.email ||
            "—";

    }


    /* PHONE */

    const phone =
        document.getElementById(
            "contactDetailPhone"
        );

    if (phone) {

        phone.textContent =
            contact.phone ||
            "—";

    }


    /* NOTES */

    const notes =
        document.getElementById(
            "contactDetailNotes"
        );

    if (notes) {

        notes.textContent =
            contact.notes ||
            "No notes have been added yet.";

    }


    /* NEXT ACTION */

    const nextAction =
        document.getElementById(
            "contactDetailNextAction"
        );

    if (nextAction) {

        nextAction.textContent =
            "No next action has been assigned.";

    }


    /* SHOW CONTACT DETAIL */

    document
        .querySelectorAll(".view")
        .forEach(view => {

            view.classList.remove("active");

        });


    contactDetail.classList.add("active");

}


/* =========================================
   BACK TO CONTACTS
========================================= */

if (backToContacts) {

    backToContacts.addEventListener(
        "click",
        () => {

            document
                .querySelectorAll(".view")
                .forEach(view => {

                    view.classList.remove("active");

                });


            const contactsView =
                document.getElementById(
                    "contacts"
                );


            if (contactsView) {

                contactsView.classList.add(
                    "active"
                );

            }

        }
    );

}

/* =========================================
   LOAD COMPANIES INTO CONTACT FORM
========================================= */

async function loadContactCompanies() {

    const companySelect =
        document.getElementById("newContactCompany");

    if (!companySelect) return;

    try {

        const response =
            await fetch(
                "http://localhost:3000/api/companies"
            );

        if (!response.ok) {
            throw new Error(
                "Failed to load companies."
            );
        }

        const companies =
            await response.json();

        companySelect.innerHTML = `
            <option value="">
                No company / Unassigned
            </option>
        `;

        companies.forEach(company => {

            const option =
                document.createElement("option");

            option.value =
                company.id;

            option.textContent =
                company.name;

            companySelect.appendChild(option);

        });

    } catch (error) {

        console.error(
            "Contact companies load error:",
            error
        );

    }

}


/* =========================================
   CONTACT SEARCH
========================================= */

if (contactSearch) {

    contactSearch.addEventListener(
        "input",
        renderContacts
    );

}


/* =========================================
   NEW CONTACT MODAL
========================================= */

if (newContactButton) {

    newContactButton.addEventListener(
        "click",
        () => {

            if (newContactModal) {

                newContactModal.style.display =
                    "flex";

            }

        }
    );

}


function closeNewContactModal() {

    if (newContactModal) {

        newContactModal.style.display =
            "none";

    }

}


if (closeNewContact) {

    closeNewContact.addEventListener(
        "click",
        closeNewContactModal
    );

}


if (cancelNewContact) {

    cancelNewContact.addEventListener(
        "click",
        closeNewContactModal
    );

}


if (newContactModal) {

    newContactModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                newContactModal
            ) {

                closeNewContactModal();

            }

        }
    );

}


/* =========================================
   CREATE CONTACT
========================================= */

if (newContactForm) {

    newContactForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            const contact = {

    first_name:
        document
            .getElementById("newContactFirstName")
            .value
            .trim(),

    last_name:
        document
            .getElementById("newContactLastName")
            .value
            .trim(),

    email:
        document
            .getElementById("newContactEmail")
            .value
            .trim(),

    phone:
        document
            .getElementById("newContactPhone")
            .value
            .trim(),

    notes:
        document
            .getElementById("newContactNotes")
            .value
            .trim()

};


            if (!contact.first_name) {

                alert(
                    "First name is required."
                );

                return;

            }


            try {

                const response =
                    await fetch(
                        "http://localhost:3000/api/contacts",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({

                                    first_name:
                                        contact.first_name,

                                    last_name:
                                        contact.last_name,

                                    email:
                                        contact.email,

                                    phone:
                                        contact.phone,

                                    company_id:
                                        contact.company_id ||
                                        null,

                                    notes:
                                        contact.notes

                                })
                        }
                    );


                const result =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        result.error ||
                        "Failed to create contact."
                    );

                }


                contacts.unshift(
                    result
                );


                renderContacts();


                newContactForm.reset();


                closeNewContactModal();


                alert(
                    "Contact created successfully."
                );


            } catch (error) {

                console.error(
                    "Contact creation error:",
                    error
                );

                alert(
                    error.message ||
                    "Failed to create contact."
                );

            }

        }
    );

}

/* =========================================
   INITIAL CONTACT LOAD
========================================= */

loadContacts();
loadContactCompanies();
loadOpportunities();

/* =========================================
   OPPORTUNITY DETAIL
========================================= */

const opportunityDetail =
    document.getElementById("opportunityDetail");

const backToOpportunities =
    document.getElementById("backToOpportunities");


function openOpportunityDetail(opportunity) {

    if (!opportunity || !opportunityDetail) {
        return;
    }


    /* =========================================
       BUSINESS HEADER
    ========================================= */

    const title =
        document.getElementById(
            "opportunityDetailTitle"
        );

    const type =
        document.getElementById(
            "opportunityDetailType"
        );

    if (title) {

        title.textContent =
            opportunity.business_name ||
            "Unknown Business";

    }

    if (type) {

        type.textContent =
            opportunity.opportunity ||
            "Potential Opportunity";

    }


    /* =========================================
       BUSINESS PROFILE
    ========================================= */

    const business =
        document.getElementById(
            "opportunityDetailBusiness"
        );

    const phone =
        document.getElementById(
            "opportunityDetailPhone"
        );

    const email =
        document.getElementById(
            "opportunityDetailEmail"
        );

    const website =
        document.getElementById(
            "opportunityDetailWebsite"
        );


    if (business) {

        business.textContent =
            opportunity.business_name ||
            "Unknown Business";

    }

    if (phone) {

        phone.textContent =
            opportunity.phone ||
            "—";

    }

    if (email) {

        email.textContent =
            opportunity.email ||
            "—";

    }

    if (website) {

        website.textContent =
            opportunity.website ||
            "—";

    }


    /* =========================================
       WHY THIS IS AN OPPORTUNITY
    ========================================= */

    const why =
        document.getElementById(
            "opportunityWhy"
        );

    if (why) {

        why.textContent =
            opportunity.notes ||
            "No opportunity analysis has been added yet.";

    }


    /* =========================================
       PRIMARY OPPORTUNITY
    ========================================= */

    const primary =
        document.getElementById(
            "opportunityDetailPrimary"
        );

    if (primary) {

        primary.textContent =
            opportunity.opportunity ||
            "Potential Opportunity";

    }


    /* =========================================
       IDENTIFIED NEEDS
    ========================================= */

    const need1 =
        document.getElementById(
            "opportunityNeed1"
        );

    const need2 =
        document.getElementById(
            "opportunityNeed2"
        );

    const need3 =
        document.getElementById(
            "opportunityNeed3"
        );


    const solutions =
        opportunity.solutions
            ? opportunity.solutions
                .split(",")
                .map(
                    solution =>
                        solution.trim()
                )
                .filter(Boolean)
            : [];


    const solutionNames = {

        start:
            "ASCND Start — Website / Digital Foundation",

        grow:
            "ASCND Grow — Lead & Customer System",

        brand:
            "Brand Identity — Logo / Visual Identity",

        estimate:
            "Estimate / Quote System — Automated estimating",

        other:
            "Other / Custom Solution"

    };


    const solutionLabels =
        solutions.map(
            solution =>
                solutionNames[solution] ||
                solution
        );


    if (need1) {

        need1.textContent =
            solutionLabels[0] ||
            "No specific need identified.";

    }

    if (need2) {

        need2.textContent =
            solutionLabels[1] ||
            "";

    }

    if (need3) {

        need3.textContent =
            solutionLabels[2] ||
            "";

    }


    /* =========================================
       RECOMMENDED ASCND SYSTEMS
    ========================================= */

    const solution =
        document.getElementById(
            "opportunitySolution"
        );

    if (solution) {

        solution.textContent =
            solutionLabels.length
                ? solutionLabels.join(" + ")
                : "No ASCND solution selected.";

    }


    /* =========================================
       STATUS
    ========================================= */

    const status =
        document.getElementById(
            "opportunityDetailStatus"
        );

    if (status) {

        status.textContent =
            opportunity.stage ||
            "NEW";

    }


    /* =========================================
       VALUE
    ========================================= */

    const value =
        document.getElementById(
            "opportunityDetailValue"
        );

    if (value) {

        value.textContent =
            `$${Number(
                opportunity.value || 0
            ).toLocaleString()}`;

    }


    /* =========================================
       NEXT ACTION
    ========================================= */

    const nextAction =
        document.getElementById(
            "opportunityDetailNextAction"
        );

    if (nextAction) {

        nextAction.textContent =
            "Follow Up";

    }


    /* =========================================
       NOTES
    ========================================= */

    const notes =
        document.getElementById(
            "opportunityDetailNotes"
        );

    if (notes) {

        notes.textContent =
            opportunity.notes ||
            "No notes have been added yet.";

    }


    /* =========================================
       SHOW DETAIL VIEW
    ========================================= */

    document
        .querySelectorAll(".view")
        .forEach(
            view => {
                view.classList.remove("active");
            }
        );

    opportunityDetail.classList.add("active");

}


/* =========================================
   OPPORTUNITY ROW CLICK
========================================= */

if (opportunityList) {

    opportunityList.addEventListener(
        "click",
        event => {

            const row =
                event.target.closest(
                    ".company-row"
                );

            if (!row) {
                return;
            }


            const opportunityId =
                row.dataset.opportunity;

            if (!opportunityId) {
                return;
            }


            const selectedOpportunity =
                opportunities.find(
                    opportunity =>
                        opportunity.id ===
                        opportunityId
                );


            if (!selectedOpportunity) {

                console.error(
                    "Opportunity not found:",
                    opportunityId
                );

                return;

            }


            openOpportunityDetail(
                selectedOpportunity
            );

        }
    );

}


/* =========================================
   BACK TO OPPORTUNITIES
========================================= */

if (backToOpportunities) {

    backToOpportunities.addEventListener(
        "click",
        () => {

            showView(
                "opportunities"
            );

        }
    );

}

/* =========================================
   OPPORTUNITY DATABASE CLICKS
========================================= */

const opportunityRows =
    document.querySelectorAll(
        "#opportunities .company-row"
    );


opportunityRows.forEach(row => {

    row.addEventListener(
        "click",
        () => {

            const opportunityId =
                row.dataset.opportunity;

            openOpportunity(opportunityId);

        }
    );

});


/* =========================================
   BACK TO OPPORTUNITIES
========================================= */

if (backToOpportunities) {

    backToOpportunities.addEventListener(
        "click",
        () => {

            showView("opportunities");

        }
    );

}


function openOpportunity(opportunityId) {

    const opportunity =
        opportunities[opportunityId];

    if (!opportunity || !opportunityRecord) {
        return;
    }


    document.getElementById(
        "opportunityRecordTitle"
    ).textContent =
        opportunity.business;


    document.getElementById(
        "opportunityRecordSubtitle"
    ).textContent =
        opportunity.type;


    document.getElementById(
        "opportunityBusinessName"
    ).textContent =
        opportunity.business;


    document.getElementById(
        "opportunityDescription"
    ).textContent =
        opportunity.description;


    document.getElementById(
        "opportunityStage"
    ).textContent =
        opportunity.stage;


    document.getElementById(
        "opportunityValue"
    ).textContent =
        opportunity.value;


    document.getElementById(
        "opportunityContact"
    ).textContent =
        opportunity.contact;


    document.getElementById(
        "opportunityContactRole"
    ).textContent =
        opportunity.role;


    document.getElementById(
        "opportunityNextAction"
    ).textContent =
        opportunity.nextAction;


    document.getElementById(
        "opportunityActivity"
    ).textContent =
        opportunity.activity;


    document.getElementById(
        "opportunityNotes"
    ).textContent =
        opportunity.notes;


    showView("opportunityRecord");

}

/* =========================================================
   ASSESSMENTS
========================================================= */

let assessmentRecords = [];
let activeAssessmentId = null;


/* LOAD ASSESSMENTS */

async function loadAssessments() {

    const tableBody =
        document.getElementById("assessmentTableBody");

    if (!tableBody) return;


    try {

        const response =
            await fetch("http://localhost:3000/api/assessments")

        const data =
            await response.json();


        if (!data.success) {

            throw new Error(
                data.message ||
                "Unable to load assessments."
            );

        }


        assessmentRecords =
            data.assessments || [];


        updateAssessmentMetrics(
            assessmentRecords
        );


        renderAssessments(
            assessmentRecords
        );

        renderOverviewAttention();

        renderAttentionQueue(
             opportunities,
             assessmentRecords
         );

    }

    catch (error) {

        console.error(
            "ASSESSMENTS LOAD ERROR:",
            error
        );


        tableBody.innerHTML = `
            <tr>
                <td colspan="5">

                    <div class="assessment-empty">
                        Unable to load assessments.
                    </div>

                </td>
            </tr>
        `;

    }

}


/* METRICS */

function updateAssessmentMetrics(
    assessments
) {

    const total =
        assessments.length;


    const newCount =
        assessments.filter(function (assessment) {

            return assessment.status === "NEW";

        }).length;


    const highCount =
        assessments.filter(function (assessment) {

            return assessment.priority === "HIGH";

        }).length;


    const now =
        new Date();


    const weekAgo =
        new Date();


    weekAgo.setDate(
        now.getDate() - 7
    );


    const weekCount =
        assessments.filter(function (assessment) {

            return new Date(
                assessment.created_at
            ) >= weekAgo;

        }).length;


    const totalElement =
        document.getElementById(
            "assessmentTotal"
        );


    const newElement =
        document.getElementById(
            "assessmentNew"
        );


    const highElement =
        document.getElementById(
            "assessmentHigh"
        );


    const weekElement =
        document.getElementById(
            "assessmentWeek"
        );


    if (totalElement)
        totalElement.textContent = total;


    if (newElement)
        newElement.textContent = newCount;


    if (highElement)
        highElement.textContent = highCount;


    if (weekElement)
        weekElement.textContent = weekCount;

}


/* RENDER TABLE */

function renderAssessments(
    assessments
) {

    const tableBody =
        document.getElementById(
            "assessmentTableBody"
        );


    if (!tableBody) return;


    if (!assessments.length) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="5">

                    <div class="assessment-empty">
                        No assessments received yet.
                    </div>

                </td>
            </tr>
        `;

        return;

    }


    tableBody.innerHTML =
        assessments.map(function (
            assessment
        ) {

            const priority =
                String(
                    assessment.priority ||
                    "LOW"
                ).toLowerCase();


            return `

                <tr
                    data-assessment-id="${escapeAssessmentText(
                        assessment.id
                    )}"
                >

                    <td>

                        <span class="assessment-business">
                            ${escapeAssessmentText(
                                assessment.business_name ||
                                "Unknown Business"
                            )}
                        </span>

                        <span class="assessment-contact">
                            ${escapeAssessmentText(
                                assessment.contact_name ||
                                "No contact"
                            )}
                        </span>

                    </td>


                    <td>
                        ${escapeAssessmentText(
                            assessment.primary_opportunity ||
                            "Not available"
                        )}
                    </td>


                    <td>
                        ${escapeAssessmentText(
                            assessment.timeline ||
                            "Not specified"
                        )}
                    </td>


                    <td>

                        <span
                            class="assessment-priority ${priority}"
                        >
                            ${escapeAssessmentText(
                                assessment.priority ||
                                "LOW"
                            )}
                        </span>

                    </td>


                    <td>

                        <span class="assessment-status">
                            ${escapeAssessmentText(
                                assessment.status ||
                                "NEW"
                            )}
                        </span>

                    </td>

                </tr>

            `;

        }).join("");


    /*
        Make every assessment row open
        its full detail view.
    */

    tableBody
        .querySelectorAll(
            "[data-assessment-id]"
        )
        .forEach(function (row) {

            row.addEventListener(
                "click",
                function () {

                    openAssessmentDetail(
                        row.dataset.assessmentId
                    );

                }
            );

        });

}


/* =========================================================
   OPEN ASSESSMENT DETAIL
========================================================= */

function openAssessmentDetail(
    assessmentId
) {

    const assessment =
        assessmentRecords.find(
            function (item) {

                return String(item.id) ===
                    String(assessmentId);

            }
        );


    if (!assessment) {

        console.error(
            "Assessment not found:",
            assessmentId
        );

        return;

    }


    activeAssessmentId =
        assessmentId;


    populateAssessmentDetail(
        assessment
    );


    showView(
        "assessmentDetail"
    );

}

function openAssessmentDetail(
    assessmentId
) {

    const assessment =
        assessmentRecords.find(
            function (item) {

                return String(item.id) ===
                    String(assessmentId);

            }
        );


    if (!assessment) {

        console.error(
            "Assessment not found:",
            assessmentId
        );

        return;

    }


    activeAssessmentId =
        assessmentId;


    populateAssessmentDetail(
        assessment
    );


    /* OPPORTUNITY BUTTON STATE */

    const conversionButton =
        document.getElementById(
            "convertAssessmentOpportunity"
        );

    if (conversionButton) {

        if (assessment.opportunity_id) {

            conversionButton.textContent =
                "Opportunity Created!";

            conversionButton.disabled =
                true;

        } else {

            conversionButton.textContent =
                "Create Opportunity";

            conversionButton.disabled =
                false;

        }

    }


    showView(
        "assessmentDetail"
    );

}

/* =========================================================
   POPULATE DETAIL
========================================================= */

function populateAssessmentDetail(
    assessment
) {

    setAssessmentText(
        "assessmentDetailTitle",
        assessment.business_name ||
        "Assessment"
    );


    setAssessmentText(
        "assessmentDetailSubtitle",
        assessment.contact_name ||
        "Business assessment results."
    );


    setAssessmentText(
        "assessmentBusinessName",
        assessment.business_name ||
        "—"
    );


    setAssessmentText(
        "assessmentContactName",
        assessment.contact_name ||
        "—"
    );


    setAssessmentText(
        "assessmentContactEmail",
        assessment.contact_email ||
        "—"
    );


    setAssessmentText(
        "assessmentContactPhone",
        assessment.contact_phone ||
        "—"
    );


    setAssessmentText(
        "assessmentTeamSize",
        assessment.team_size ||
        "—"
    );


    setAssessmentText(
        "assessmentBusinessDescription",
        assessment.business_description ||
        "No business description provided."
    );


    setAssessmentText(
        "assessmentPrimaryOpportunity",
        assessment.primary_opportunity ||
        "Not identified"
    );


    setAssessmentText(
        "assessmentPrimaryDescription",
        assessment.primary_description ||
        "No primary opportunity description available."
    );


    setAssessmentText(
        "assessmentTimeline",
        assessment.timeline ||
        "Not specified"
    );


    setAssessmentText(
        "assessmentSignalOpportunity",
        assessment.primary_opportunity ||
        "Not identified"
    );


    setAssessmentText(
        "assessmentDetailPriority",
        assessment.priority ||
        "LOW"
    );


    setAssessmentText(
        "assessmentDetailDate",
        formatAssessmentDate(
            assessment.created_at
        )
    );


    const statusSelect =
        document.getElementById(
            "assessmentDetailStatus"
        );


    if (statusSelect) {

        statusSelect.value =
            assessment.status ||
            "NEW";

    }


    /*
        Results may arrive as an object
        or JSON string depending on Supabase.
    */

    const results =
        normalizeAssessmentObject(
            assessment.results_data
        );


    const assessmentData =
        normalizeAssessmentObject(
            assessment.assessment_data
        );


    renderAssessmentFindings(
        assessment,
        results
    );


    renderRecommendedSystems(
        assessment,
        results
    );


    renderAdditionalSystems(
        assessment,
        results
    );


    renderAssessmentReadiness(
        assessment,
        results,
        assessmentData
    );


    renderAssessmentNextAction(
        assessment
    );

}


/* =========================================================
   FINDINGS
========================================================= */

function renderAssessmentFindings(
    assessment,
    results
) {

    const container =
        document.getElementById(
            "assessmentFindings"
        );


    if (!container) return;


    let findings =
        results.keyFindings ||
        results.key_findings ||
        assessment.key_findings ||
        [];


    if (!Array.isArray(findings)) {

        findings = [
            findings
        ];

    }


    findings =
        findings.filter(function (finding) {

            return String(finding || "").trim();

        });


    if (!findings.length) {

        container.innerHTML = `
            <div class="assessment-detail-empty">
                No findings available.
            </div>
        `;

        return;

    }


    container.innerHTML =
        findings.map(function (
            finding,
            index
        ) {

            return `

                <div class="assessment-finding">

                    <div class="assessment-finding-number">
                        ${String(index + 1).padStart(2, "0")}
                    </div>

                    <div>

                        <strong>
                            Finding ${index + 1}
                        </strong>

                        <p>
                            ${escapeAssessmentText(
                                typeof finding === "string"
                                    ? finding
                                    : finding.description ||
                                      finding.title ||
                                      JSON.stringify(finding)
                            )}
                        </p>

                    </div>

                </div>

            `;

        }).join("");

}


/* =========================================================
   RECOMMENDED SYSTEMS
========================================================= */

function renderRecommendedSystems(
    assessment,
    results
) {

    const container =
        document.getElementById(
            "assessmentRecommendedSystems"
        );


    if (!container) return;


    let systems =
        results.recommendedSystems ||
        results.recommended_systems ||
        assessment.recommended_systems ||
        [];


    if (!Array.isArray(systems)) {

        systems = [
            systems
        ];

    }


    systems =
        systems.filter(function (system) {

            return String(system || "").trim();

        });


    if (!systems.length) {

        container.innerHTML = `
            <div class="assessment-detail-empty">
                No recommendations available.
            </div>
        `;

        return;

    }


    container.innerHTML =
        systems.map(function (
            system
        ) {

            const name =
                typeof system === "string"
                    ? system
                    : system.name ||
                      system.title ||
                      "Recommended System";


            const description =
                typeof system === "string"
                    ? ""
                    : system.description ||
                      "";


            return `

                <div class="assessment-system-card">

                    <strong>
                        ${escapeAssessmentText(name)}
                    </strong>

                    <p>
                        ${escapeAssessmentText(
                            description ||
                            "Recommended based on the assessment."
                        )}
                    </p>

                </div>

            `;

        }).join("");

}


/* =========================================================
   ADDITIONAL SYSTEMS
========================================================= */

function renderAdditionalSystems(
    assessment,
    results
) {

    const container =
        document.getElementById(
            "assessmentAdditionalSystems"
        );


    if (!container) return;


    let systems =
        assessment.additional_systems ||
        results.additionalSystems ||
        results.additional_systems ||
        [];


    if (!Array.isArray(systems)) {

        systems = [
            systems
        ];

    }


    systems =
        systems.filter(function (system) {

            return String(system || "").trim();

        });


    if (!systems.length) {

        container.innerHTML = `
            <div class="assessment-detail-empty">
                None selected.
            </div>
        `;

        return;

    }


    container.innerHTML =
        systems.map(function (
            system
        ) {

            const name =
                typeof system === "string"
                    ? system
                    : system.name ||
                      system.title ||
                      "Additional System";


            return `

                <div class="assessment-system-card">

                    <strong>
                        ${escapeAssessmentText(name)}
                    </strong>

                    <p>
                        Additional system selected for exploration.
                    </p>

                </div>

            `;

        }).join("");

}


/* =========================================================
   READINESS
========================================================= */

function renderAssessmentReadiness(
    assessment,
    results,
    assessmentData
) {

    const readiness =
        results.investmentReadiness ||
        results.investment_readiness ||
        assessmentData.investmentReadiness ||
        assessmentData.investment_readiness ||
        "Not specified";


    setAssessmentText(
        "assessmentInvestmentReadiness",
        readiness
    );

}


/* =========================================================
   NEXT ACTION
========================================================= */

function renderAssessmentNextAction(
    assessment
) {

    let action =
        "Review assessment and determine opportunity.";


    switch (
        String(
            assessment.status ||
            "NEW"
        ).toUpperCase()
    ) {

        case "NEW":

            action =
                "Review the assessment and determine the strongest ASCND opportunity.";

            break;


        case "CONTACTED":

            action =
                "Continue conversation and determine discovery requirements.";

            break;


        case "DISCOVERY":

            action =
                "Use discovery to define the appropriate ASCND solution.";

            break;


        case "PROPOSAL":

            action =
                "Follow up on the proposal and move the opportunity forward.";

            break;


        case "ACTIVE":

            action =
                "Continue delivery and monitor the active system.";

            break;


        case "COMPLETED":

            action =
                "Assessment opportunity has completed its current workflow.";

            break;

    }


    setAssessmentText(
        "assessmentNextAction",
        action
    );

}


/* =========================================================
   STATUS UPDATE
========================================================= */

const assessmentStatusSelect =
    document.getElementById(
        "assessmentDetailStatus"
    );


if (assessmentStatusSelect) {

    assessmentStatusSelect.addEventListener(
        "change",
        async function () {

            if (!activeAssessmentId) return;


            const newStatus =
                assessmentStatusSelect.value;


            try {

                const response =
                    await fetch(
                         `http://localhost:3000/api/assessments/${activeAssessmentId}/status`,
                        {
                            method: "PATCH",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                status: newStatus
                            })
                        }
                    );


                const data =
                    await response.json();


                if (!data.success) {

                    throw new Error(
                        data.message ||
                        "Unable to update assessment."
                    );

                }


                const localAssessment =
                    assessmentRecords.find(
                        function (assessment) {

                            return String(
                                assessment.id
                            ) ===
                            String(
                                activeAssessmentId
                            );

                        }
                    );


                if (localAssessment) {

                    localAssessment.status =
                        newStatus;

                }


                renderAssessmentNextAction(
                    localAssessment ||
                    {}
                );


                renderAssessments(
                    assessmentRecords
                );

                renderInboxRecentActivity();


            }

            catch (error) {

                console.error(
                    "ASSESSMENT STATUS ERROR:",
                    error
                );


                alert(
                    "Unable to update assessment status."
                );

            }

        }
    );

}


/* =========================================================
   BACK BUTTON
========================================================= */

const backToAssessments =
    document.getElementById(
        "backToAssessments"
    );


if (backToAssessments) {

    backToAssessments.addEventListener(
        "click",
        function () {

            showView(
                "assessments"
            );

        }
    );

}


/* =========================================================
   CREATE OPPORTUNITY FROM ASSESSMENT
========================================================= */

const convertAssessmentOpportunity =
    document.getElementById(
        "convertAssessmentOpportunity"
    );

if (convertAssessmentOpportunity) {

    convertAssessmentOpportunity.addEventListener(
        "click",
        function () {

            const assessment =
                assessmentRecords.find(
                    function (item) {

                        return String(item.id) ===
                            String(activeAssessmentId);

                    }
                );


            if (!assessment) {

                console.error(
                    "Active assessment ID:",
                    activeAssessmentId
                );

                console.error(
                    "Assessment records:",
                    assessmentRecords
                );

                alert(
                    "Unable to find the active assessment."
                );

                return;

            }


            showView(
                "opportunities"
            );


            const newOpportunityButton =
                document.getElementById(
                    "newOpportunity"
                );


            if (newOpportunityButton) {

                newOpportunityButton.click();

            }

            setTimeout(
    function () {

        const business =
            document.getElementById(
                "newOpportunityBusiness"
            );

        const phone =
            document.getElementById(
                "newOpportunityPhone"
            );

        const email =
            document.getElementById(
                "newOpportunityEmail"
            );

        const website =
            document.getElementById(
                "newOpportunityWebsite"
            );

        const opportunity =
            document.getElementById(
                "newOpportunityWhat"
            );

        const notes =
            document.getElementById(
                "newOpportunityNotes"
            );


        if (business) {

            business.value =
                assessment.business_name ||
                "";

        }


        if (phone) {

            phone.value =
                assessment.contact_phone ||
                "";

        }


        if (email) {

            email.value =
                assessment.contact_email ||
                "";

        }


        if (website) {

            website.value =
                assessment.website ||
                "";

        }


        if (opportunity) {

            opportunity.value =
                assessment.primary_opportunity ||
                "";

        }


        if (notes) {

            notes.value =
                assessment.business_description ||
                "";

        }

    },
    300
);

        }
    );

}


/* =========================================================
   HELPERS
========================================================= */

function normalizeAssessmentObject(
    value
) {

    if (!value) {
        return {};
    }


    if (typeof value === "object") {
        return value;
    }


    if (typeof value === "string") {

        try {

            return JSON.parse(
                value
            );

        }

        catch (error) {

            return {};

        }

    }


    return {};

}


function setAssessmentText(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (!element) return;


    element.textContent =
        value === undefined ||
        value === null ||
        value === ""
            ? "—"
            : String(value);

}


function formatAssessmentDate(
    value
) {

    if (!value) {
        return "—";
    }


    const date =
        new Date(value);


    if (Number.isNaN(
        date.getTime()
    )) {

        return "—";

    }


    return date.toLocaleDateString(
        "en-US",
        {
            month: "short",
            day: "numeric",
            year: "numeric"
        }
    );

}


function escapeAssessmentText(
    value
) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* INITIALIZE */

loadAssessments();
renderInboxRecentActivity();

/* =====================================================
   INBOX — RECENT ACTIVITY
===================================================== */

function renderInboxRecentActivity() {

    const activity =
        document.getElementById(
            "inboxRecentActivity"
        );

    if (!activity) return;


    const activities = [];

    /* =====================================================
       ASSESSMENTS
    ===================================================== */

    assessmentRecords.forEach(
        function (assessment) {

            activities.push({

                type: "assessment",

                name:
                    assessment.business_name ||
                    "Unknown Business",

                title:
                    "New assessment received",

                description:
                    "Business submitted the ASCND assessment.",

                created_at:
                    assessment.created_at

            });

        }
    );


    /* =====================================================
       OPPORTUNITIES
    ===================================================== */

    opportunities.forEach(
        function (opportunity) {

            activities.push({

                type: "opportunity",

                name:
                    opportunity.business_name ||
                    "Unknown Business",

                title:
                    "Opportunity Created",

                description:
                    opportunity.opportunity ||
                    "New opportunity added to the pipeline.",

                created_at:
                    opportunity.created_at

            });

        }
    );


    /* =====================================================
       SORT NEWEST FIRST
    ===================================================== */

    activities.sort(
        function (a, b) {

            return (
                new Date(b.created_at || 0) -
                new Date(a.created_at || 0)
            );

        }
    );


    /* =====================================================
       EMPTY STATE
    ===================================================== */

    if (!activities.length) {

        activity.innerHTML = `

            <div class="assessment-empty">

                No recent activity yet.

            </div>

        `;

        return;

    }


    /* =====================================================
       RENDER
    ===================================================== */

    activity.innerHTML =
        activities
            .slice(0, 10)
            .map(
                function (item) {

                    const date =
                        new Date(
                            item.created_at
                        );

                    const timeAgo =
                        formatActivityTime(
                            date
                        );


                    return `

                        <div class="activity-row">

                            <span class="activity-time">

                                ${escapeAssessmentText(
                                    timeAgo
                                )}

                            </span>

                            <div>

                                <strong>

                                    ${escapeAssessmentText(
                                        item.title
                                    )}

                                </strong>

                                <p>

                                    ${escapeAssessmentText(
                                        item.name
                                    )}
                                    —
                                    ${escapeAssessmentText(
                                        item.description
                                    )}

                                </p>

                            </div>

                        </div>

                    `;

                }
            )
            .join("");

}

function renderOverviewRecentActivity() {

    const activity =
        document.getElementById(
            "overviewRecentActivity"
        );

    if (!activity) return;

    const activities = [];

    assessmentRecords.forEach(function (assessment) {

        activities.push({
            title:
                "New assessment received",

            name:
                assessment.business_name ||
                "Unknown Business",

            description:
                "Business submitted the ASCND assessment.",

            created_at:
                assessment.created_at
        });

    });

    opportunities.forEach(function (opportunity) {

        activities.push({
            title:
                "Opportunity Created",

            name:
                opportunity.business_name ||
                "Unknown Business",

            description:
                opportunity.opportunity ||
                "New opportunity added to the pipeline.",

            created_at:
                opportunity.created_at
        });

    });

    activities.sort(function (a, b) {

        return (
            new Date(b.created_at || 0) -
            new Date(a.created_at || 0)
        );

    });

    if (!activities.length) {

        activity.innerHTML = `
            <div class="assessment-empty">
                No recent activity yet.
            </div>
        `;

        return;
    }

    activity.innerHTML =
        activities
            .slice(0, 3)
            .map(function (item) {

                const date =
                    new Date(
                        item.created_at
                    );

                const timeAgo =
                    formatActivityTime(
                        date
                    );

                return `
                    <div class="activity-row">

                        <span class="activity-time">
                            ${escapeAssessmentText(
                                timeAgo
                            )}
                        </span>

                        <div>

                            <strong>
                                ${escapeAssessmentText(
                                    item.title
                                )}
                            </strong>

                            <p>
                                ${escapeAssessmentText(
                                    item.name
                                )}
                                —
                                ${escapeAssessmentText(
                                    item.description
                                )}
                            </p>

                        </div>

                    </div>
                `;

            })
            .join("");
}

function formatActivityTime(date) {

    if (
        !date ||
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "—";

    }


    const now =
        new Date();

    const difference =
        now.getTime() -
        date.getTime();


    const minutes =
        Math.floor(
            difference / 60000
        );


    if (minutes < 1) {

        return "now";

    }


    if (minutes < 60) {

        return `${minutes}m`;

    }


    const hours =
        Math.floor(
            minutes / 60
        );


    if (hours < 24) {

        return `${hours}h`;

    }


    const days =
        Math.floor(
            hours / 24
        );


    if (days < 7) {

        return `${days}d`;

    }


    return date.toLocaleDateString(
        "en-US",
        {
            month: "short",
            day: "numeric"
        }
    );

}

/* =====================================================
   OVERVIEW — ATTENTION REQUIRED
===================================================== */

function renderOverviewAttention() {

    const list =
        document.getElementById(
            "overviewAttentionList"
        );

    if (!list) return;

    const attentionItems = [];

    /* ASSESSMENTS */

    assessmentRecords.forEach(
        function (assessment) {

            if (
                assessment.opportunity_id
            ) {
                return;
            }

            if (
                String(
                    assessment.status || ""
                ).toUpperCase() !== "NEW"
            ) {
                return;
            }

            attentionItems.push({

                priority: "medium",

                business:
                    assessment.business_name ||
                    "Unknown Business",

                description:
                    "Business assessment is ready for review.",

                action: "REVIEW"

            });

        }
    );


    /* OPPORTUNITIES */

    opportunities.forEach(
        function (opportunity) {

            const stage =
                String(
                    opportunity.stage || ""
                ).toUpperCase();

            if (
                stage !== "NEW" &&
                stage !== "REVIEW"
            ) {
                return;
            }

            attentionItems.push({

                priority:
                    stage === "NEW"
                        ? "high"
                        : "medium",

                business:
                    opportunity.business_name ||
                    "Unknown Business",

                description:
                    stage === "NEW"
                        ? "New opportunity requires follow-up."
                        : "Active opportunity requiring review.",

                action:
                    stage === "NEW"
                        ? "FOLLOW UP"
                        : "REVIEW"

            });

        }
    );


    /* EMPTY STATE */

    if (!attentionItems.length) {

        list.innerHTML = `

            <div class="assessment-empty">

                Nothing currently requires attention.

            </div>

        `;

        return;

    }


    /* RENDER */

    list.innerHTML =
        attentionItems
            .slice(0, 3)
            .map(
                function (item) {

                    return `

                        <div class="inbox-item">

                            <div
                                class="priority ${item.priority}"
                            ></div>

                            <div class="inbox-content">

                                <strong>
                                    ${escapeAssessmentText(
                                        item.business
                                    )}
                                </strong>

                                <p>
                                    ${escapeAssessmentText(
                                        item.description
                                    )}
                                </p>

                            </div>

                            <span class="item-action">

                                ${escapeAssessmentText(
                                    item.action
                                )}

                            </span>

                        </div>

                    `;

                }
            )
            .join("");

}

/* =========================================================
   ATTENTION QUEUE
========================================================= */
let attentionQueueExpanded = false;

function renderAttentionQueue(
    opportunitiesData,
    assessmentsData
) {

    const queue =
        document.getElementById(
            "attentionQueueList"
        );

    const count =
        document.getElementById(
            "attentionQueueCount"
        );

    if (!queue) return;


    const opportunitiesList =
        Array.isArray(opportunitiesData)
            ? opportunitiesData
            : [];

    const assessmentsList =
        Array.isArray(assessmentsData)
            ? assessmentsData
            : [];


    const attentionItems = [];


    /* =====================================================
       ASSESSMENTS
    ===================================================== */

    assessmentsList.forEach(
        function (assessment) {

            const status =
                String(
                    assessment.status || "NEW"
                ).toUpperCase();


            if (
                assessment.opportunity_id ||
                status !== "NEW"
            ) {
                return;
            }


            const priority =
                String(
                    assessment.priority || "MEDIUM"
                ).toLowerCase();


            attentionItems.push({

                type: "assessment",

                id: assessment.id,

                name:
                    assessment.business_name ||
                    "Unknown Business",

                description:
                    "New assessment ready for review.",

                action: "REVIEW",

                priority: priority,

                created_at:
                    assessment.created_at

            });

        }
    );


    /* =====================================================
       OPPORTUNITIES
    ===================================================== */

    opportunitiesList.forEach(
        function (opportunity) {

            const stage =
                String(
                    opportunity.stage || "NEW"
                ).toUpperCase();


            if (
                stage !== "NEW" &&
                stage !== "REVIEW"
            ) {
                return;
            }


            attentionItems.push({

                type: "opportunity",

                id: opportunity.id,

                name:
                    opportunity.business_name ||
                    "Unknown Business",

                description:
                    opportunity.opportunity ||
                    "Opportunity requires review.",

                action:
                    stage === "REVIEW"
                        ? "FOLLOW UP"
                        : "REVIEW",

                priority:
                    String(
                        opportunity.priority ||
                        "MEDIUM"
                    ).toLowerCase(),

                created_at:
                    opportunity.created_at

            });

        }
    );

    /* =====================================================
   INBOX SUMMARY COUNTS
===================================================== */

const needsAttentionCount =
    attentionItems.length;

 const inboxNavCount =
    document.getElementById(
        "inboxNavCount"
    );

if (inboxNavCount) {
    inboxNavCount.textContent =
        needsAttentionCount;
}

const followUpsCount =
    attentionItems.filter(
        function (item) {
            return item.action === "FOLLOW UP";
        }
    ).length;


const reviewsCount =
    attentionItems.filter(
        function (item) {
            return item.action === "REVIEW";
        }
    ).length;


const highPriorityCount =
    attentionItems.filter(
        function (item) {
            return item.priority === "high";
        }
    ).length;


/* =====================================================
   UPDATE INBOX SUMMARY
===================================================== */

const inboxNeedsAttention =
    document.getElementById(
        "inboxNeedsAttention"
    );

const inboxFollowUps =
    document.getElementById(
        "inboxFollowUps"
    );

const inboxReviews =
    document.getElementById(
        "inboxReviews"
    );

const inboxHighPriority =
    document.getElementById(
        "inboxHighPriority"
    );


if (inboxNeedsAttention) {

    inboxNeedsAttention.textContent =
        needsAttentionCount;

}


if (inboxFollowUps) {

    inboxFollowUps.textContent =
        followUpsCount;

}


if (inboxReviews) {

    inboxReviews.textContent =
        reviewsCount;

}


if (inboxHighPriority) {

    inboxHighPriority.textContent =
        highPriorityCount;

}

    /* =====================================================
       SORT
    ===================================================== */

    const priorityRank = {

        high: 1,
        medium: 2,
        low: 3

    };


    attentionItems.sort(
        function (a, b) {

            const priorityDifference =
                (priorityRank[a.priority] || 2) -
                (priorityRank[b.priority] || 2);


            if (priorityDifference !== 0) {

                return priorityDifference;

            }


            return (
                new Date(b.created_at || 0) -
                new Date(a.created_at || 0)
            );

        }
    );


    /* =====================================================
       EMPTY STATE
    ===================================================== */

    if (!attentionItems.length) {

        queue.innerHTML = `

            <div class="assessment-empty">

                Nothing currently needs your attention.

            </div>

        `;

        if (count) {

            count.textContent =
                "0 items";

        }

        return;

    }


    /* =====================================================
       DISPLAY LIMIT
    ===================================================== */

    const visibleItems =
        attentionQueueExpanded
            ? attentionItems
            : attentionItems.slice(0, 3);


    /* =====================================================
       RENDER ITEMS
    ===================================================== */

    queue.innerHTML =
        visibleItems
            .map(
                function (item) {

                    return `

                        <div
                            class="inbox-item"
                            data-attention-type="${escapeAssessmentText(
                                item.type
                            )}"
                            data-attention-id="${escapeAssessmentText(
                                item.id
                            )}"
                        >

                            <div
                                class="priority ${escapeAssessmentText(
                                    item.priority
                                )}"
                            ></div>


                            <div class="inbox-content">

                                <strong>
                                    ${escapeAssessmentText(
                                        item.name
                                    )}
                                </strong>


                                <p>
                                    ${escapeAssessmentText(
                                        item.description
                                    )}
                                </p>

                            </div>


                            <span class="item-action">

                                ${escapeAssessmentText(
                                    item.action
                                )}

                            </span>

                        </div>

                    `;

                }
            )
            .join("");


    /* =====================================================
       VIEW ALL / SHOW LESS
    ===================================================== */

    if (attentionItems.length > 3) {

    queue.innerHTML += `

        <div
            class="attention-queue-toggle"
        >

            <button
                type="button"
                id="attentionQueueToggle"
                class="attention-toggle-button"
            >

                ${
                    attentionQueueExpanded
                        ? "SHOW LESS"
                        : "VIEW ALL"
                }

            </button>

        </div>

    `;


    const toggleButton =
        document.getElementById(
            "attentionQueueToggle"
        );


    if (toggleButton) {

        toggleButton.addEventListener(
            "click",
            function () {

                attentionQueueExpanded =
                    !attentionQueueExpanded;


                renderAttentionQueue(
                    opportunitiesData,
                    assessmentsData
                );

            }
        );

    }

}


    /* =====================================================
       COUNT
    ===================================================== */

    if (count) {

        count.textContent =
            `${attentionItems.length} item${
                attentionItems.length === 1
                    ? ""
                    : "s"
            }`;

    }

}


/* MOBILE NAVIGATION */

const mobileMenuButton =
    document.getElementById("mobileMenuButton");

const sidebar =
    document.querySelector(".sidebar");

if (mobileMenuButton && sidebar) {

    mobileMenuButton.addEventListener(
        "click",
        () => {

            sidebar.classList.toggle("mobile-open");

        }
    );


    const mobileNavItems =
        sidebar.querySelectorAll(".nav-item");

    mobileNavItems.forEach(
        item => {

            item.addEventListener(
                "click",
                () => {

                    sidebar.classList.remove(
                        "mobile-open"
                    );

                }
            );

        }
    );

}

// ============================================================
// GLOBAL SEARCH
// ============================================================

const globalSearchToggle =
    document.getElementById("globalSearchToggle");

const globalSearchPanel =
    document.getElementById("globalSearchPanel");

const globalSearchInput =
    document.getElementById("globalSearchInput");

const globalSearchClear =
    document.getElementById("globalSearchClear");

const globalSearchResults =
    document.getElementById("globalSearchResults");


function openGlobalSearch() {

    if (!globalSearchPanel || !globalSearchInput) {
        return;
    }

    globalSearchPanel.style.display = "block";

    if (globalSearchToggle) {
        globalSearchToggle.setAttribute(
            "aria-expanded",
            "true"
        );
    }

    setTimeout(() => {
        globalSearchInput.focus();
    }, 50);

}


function closeGlobalSearch() {

    if (!globalSearchPanel) {
        return;
    }

    globalSearchPanel.style.display = "none";

    if (globalSearchToggle) {
        globalSearchToggle.setAttribute(
            "aria-expanded",
            "false"
        );
    }

}


function clearGlobalSearch() {

    if (!globalSearchInput) {
        return;
    }

    globalSearchInput.value = "";

    if (globalSearchClear) {
        globalSearchClear.style.display = "none";
    }

    if (globalSearchResults) {

        globalSearchResults.innerHTML = `
            <div
                style="
                    padding: 24px;
                    text-align: center;
                    color: rgba(255,255,255,0.5);
                    font-size: 13px;
                "
            >
                Start typing to search ASCND.
            </div>
        `;

    }

    globalSearchInput.focus();

}


// ============================================================
// GLOBAL SEARCH BUTTON
// ============================================================

document.addEventListener(
    "pointerdown",
    event => {

        const searchButton =
            event.target.closest(
                "#globalSearchToggle"
            );

        if (!searchButton) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        const isOpen =
            globalSearchPanel &&
            globalSearchPanel.style.display !== "none";

        if (isOpen) {

            closeGlobalSearch();

        } else {

            openGlobalSearch();

        }

    },
    true
);


if (globalSearchClear) {

    globalSearchClear.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            clearGlobalSearch();

        }
    );

}


if (globalSearchInput) {

    globalSearchInput.addEventListener(
        "input",
        () => {

            const query =
                globalSearchInput.value.trim();

            if (globalSearchClear) {

                globalSearchClear.style.display =
                    query.length > 0
                        ? "block"
                        : "none";

            }

            if (!query) {

                clearGlobalSearch();

                return;

            }

            renderGlobalSearch(query);

        }
    );

}


document.addEventListener(
    "keydown",
    event => {

        if (event.key === "Escape") {

            if (
                globalSearchPanel &&
                globalSearchPanel.style.display !== "none"
            ) {

                closeGlobalSearch();

            }

        }

    }
);


document.addEventListener(
    "click",
    event => {

        if (
            !globalSearchPanel ||
            !globalSearchToggle
        ) {
            return;
        }

        if (
            globalSearchPanel.contains(event.target) ||
            globalSearchToggle.contains(event.target)
        ) {
            return;
        }

        closeGlobalSearch();

    }
);

// ============================================================
// GLOBAL SEARCH ENGINE
// ============================================================

function normalizeSearchValue(value) {

    return String(value || "")
        .toLowerCase()
        .trim();

}


function searchMatches(record, query) {

    const normalizedQuery =
        normalizeSearchValue(query);

    if (!normalizedQuery) {
        return false;
    }

    const searchableText =
        normalizeSearchValue(
            Object.values(record)
                .map(value => {

                    if (
                        value &&
                        typeof value === "object"
                    ) {
                        return JSON.stringify(value);
                    }

                    return value;

                })
                .join(" ")
        );

    const searchWords =
        normalizedQuery
            .split(/\s+/)
            .filter(Boolean);

    return searchWords.every(word =>
        searchableText.includes(word)
    );

}


function getGlobalSearchRecords(query) {

    const results = [];

     // ========================================================
    // NAVIGATION / SECTIONS
    // ========================================================

    const sections = [

        {
            type: "section",
            title: "Overview",
            subtitle: "ASCND Overview",
            keywords: "overview dashboard home",
            action: () => {
                showView("overview");
            }
        },

        {
            type: "section",
            title: "Inbox",
            subtitle: "ASCND Inbox",
            keywords: "inbox messages communication",
            action: () => {
                showView("inbox");
            }
        },

        {
            type: "section",
            title: "Radar",
            subtitle: "ASCND Radar",
            keywords: "radar activity signals",
            action: () => {
                showView("radar");
            }
        },

        {
            type: "section",
            title: "Opportunities",
            subtitle: "Opportunity Pipeline",
            keywords: "opportunities pipeline leads prospects",
            action: () => {
                showView("opportunities");
            }
        },

        {
            type: "section",
            title: "Assessments",
            subtitle: "Business Assessments",
            keywords: "assessments business assessment",
            action: () => {
                showView("assessments");
            }
        },

        {
            type: "section",
            title: "Companies",
            subtitle: "Company Records",
            keywords: "companies businesses company records",
            action: () => {
                showView("companies");
            }
        },

        {
    type: "section",
    title: "Contacts",
    subtitle: "Business Contacts",
    keywords: "contacts people relationships",
    action: () => {
        showView("contacts");
    }
},

{
    type: "section",
    title: "Business Pipeline",
    subtitle: "Revenue + Growth",
    keywords: "business pipeline revenue growth money goals sales",
    action: () => {
        showView("business-pipeline");
    }
}

    ];


    sections.forEach(section => {

    const normalizedQuery =
        normalizeSearchValue(query);

    const exactSectionMatch =
        normalizeSearchValue(section.title) ===
        normalizedQuery;

    const titleStartsWithQuery =
        normalizeSearchValue(section.title)
            .startsWith(normalizedQuery);

    const keywordMatch =
        section.keywords
            .split(/\s+/)
            .some(keyword =>
                normalizeSearchValue(keyword) ===
                normalizedQuery
            );

    if (
        normalizedQuery.length >= 3 &&
        (
            exactSectionMatch ||
            titleStartsWithQuery ||
            keywordMatch
        )
    ) {

        results.push(section);

    }

});


    // ========================================================
    // COMPANIES
    // ========================================================

    companies.forEach(company => {

        if (
            searchMatches(
                {
                    name: company.name,
                    industry: company.industry,
                    status: company.status,
                    primary_contact: company.primary_contact,
                    phone: company.phone,
                    email: company.email,
                    notes: company.notes
                },
                query
            )
        ) {

            results.push({

                type: "company",

                title:
                    company.name ||
                    "Unnamed Company",

                subtitle:
                    company.industry ||
                    company.status ||
                    "Company",

                record: company,

                action: () => {
                    openCompany(company.id);
                }

            });

        }

    });


    // ========================================================
    // CONTACTS
    // ========================================================

    contacts.forEach(contact => {

        const companyName =
            contact.companies?.name || "";

        if (
            searchMatches(
                {
                    first_name: contact.first_name,
                    last_name: contact.last_name,
                    email: contact.email,
                    phone: contact.phone,
                    notes: contact.notes,
                    company: companyName
                },
                query
            )
        ) {

            const fullName =
                [
                    contact.first_name,
                    contact.last_name
                ]
                    .filter(Boolean)
                    .join(" ");

            results.push({

                type: "contact",

                title:
                    fullName ||
                    "Unnamed Contact",

                subtitle:
                    companyName ||
                    contact.email ||
                    "Contact",

                record: contact,

                action: () => {
                    openContactDetail(contact);
                }

            });

        }

    });


    // ========================================================
    // OPPORTUNITIES
    // ========================================================

    opportunities.forEach(opportunity => {

        if (
            searchMatches(
                {
                    business_name:
                        opportunity.business_name,

                    opportunity:
                        opportunity.opportunity,

                    stage:
                        opportunity.stage,

                    solutions:
                        opportunity.solutions,

                    notes:
                        opportunity.notes,

                    phone:
                        opportunity.phone,

                    email:
                        opportunity.email,

                    website:
                        opportunity.website

                },
                query
            )
        ) {

            results.push({

                type: "opportunity",

                title:
                    opportunity.business_name ||
                    opportunity.opportunity ||
                    "Opportunity",

                subtitle:
                    opportunity.stage ||
                    opportunity.opportunity ||
                    "Opportunity",

                record: opportunity,

                action: () => {
                    openOpportunityDetail(
                        opportunity
                    );
                }

            });

        }

    });


    // ========================================================
    // ASSESSMENTS
    // ========================================================

    assessmentRecords.forEach(assessment => {

        if (
            searchMatches(
                {
                    business_name:
                        assessment.business_name,

                    contact_name:
                        assessment.contact_name,

                    primary_opportunity:
                        assessment.primary_opportunity,

                    timeline:
                        assessment.timeline,

                    priority:
                        assessment.priority,

                    status:
                        assessment.status,

                    contact_email:
                        assessment.contact_email,

                    contact_phone:
                        assessment.contact_phone,

                    website:
                        assessment.website,

                    business_description:
                        assessment.business_description

                },
                query
            )
        ) {

            results.push({

                type: "assessment",

                title:
                    assessment.business_name ||
                    "Business Assessment",

                subtitle:
                    assessment.primary_opportunity ||
                    assessment.status ||
                    "Assessment",

                record: assessment,

                action: () => {

                    openAssessmentDetail(
                        assessment.id
                    );

                }

            });

        }

    });


    return results.slice(0, 20);

}


function renderGlobalSearch(query) {

    if (!globalSearchResults) {
        return;
    }


    const results =
        getGlobalSearchRecords(query);


    if (!results.length) {

        globalSearchResults.innerHTML = `

            <div
                style="
                    padding: 30px 24px;
                    text-align: center;
                    color: rgba(255,255,255,0.5);
                    font-size: 13px;
                "
            >

                No results found for
                <strong style="color:#f4f7f9;">
                    "${query}"
                </strong>

            </div>

        `;

        return;

    }


    const groups = {

    company: {
        label: "COMPANIES",
        items: []
    },

    contact: {
        label: "CONTACTS",
        items: []
    },

    opportunity: {
        label: "OPPORTUNITIES",
        items: []
    },

    assessment: {
        label: "ASSESSMENTS",
        items: []
    }

};


    const sectionResults = [];

results.forEach(result => {

    if (result.type === "section") {

        sectionResults.push(result);

        return;

    }

    if (groups[result.type]) {

        groups[result.type].items.push(
            result
        );

    }

});


    globalSearchResults.innerHTML = "";

    sectionResults.forEach(result => {

    const row =
        document.createElement("button");

    row.type = "button";

    row.style.display = "block";
    row.style.width = "100%";
    row.style.border = "0";
    row.style.background = "transparent";
    row.style.color = "#f4f7f9";
    row.style.textAlign = "left";
    row.style.padding = "11px 16px";
    row.style.cursor = "pointer";

    row.innerHTML = `

        <div
            style="
                font-size:14px;
                font-weight:600;
                margin-bottom:3px;
            "
        >
            ${escapeGlobalSearchHTML(
                result.title
            )}
        </div>

        <div
            style="
                font-size:11px;
                color:rgba(255,255,255,0.45);
            "
        >
            ${escapeGlobalSearchHTML(
                result.subtitle
            )}
        </div>

    `;

    row.addEventListener(
        "mouseenter",
        () => {

            row.style.background =
                "rgba(255,255,255,0.06)";

        }
    );

    row.addEventListener(
        "mouseleave",
        () => {

            row.style.background =
                "transparent";

        }
    );

    row.addEventListener(
        "click",
        () => {

            closeGlobalSearch();

            result.action();

        }
    );

    globalSearchResults.appendChild(row);

});

    Object.values(groups).forEach(group => {

        if (!group.items.length) {
            return;
        }


        const groupContainer =
            document.createElement("div");

        groupContainer.style.padding =
            "10px 0";


        const groupTitle =
            document.createElement("div");

        groupTitle.textContent =
            group.label;

        groupTitle.style.padding =
            "8px 16px";

        groupTitle.style.fontSize =
            "10px";

        groupTitle.style.fontWeight =
            "700";

        groupTitle.style.letterSpacing =
            "0.12em";

        groupTitle.style.color =
            "rgba(255,255,255,0.45)";


        groupContainer.appendChild(
            groupTitle
        );


        group.items.forEach(result => {

            const row =
                document.createElement("button");

            row.type = "button";

            row.style.display = "block";
            row.style.width = "100%";
            row.style.border = "0";
            row.style.background = "transparent";
            row.style.color = "#f4f7f9";
            row.style.textAlign = "left";
            row.style.padding = "11px 16px";
            row.style.cursor = "pointer";


            row.innerHTML = `

                <div
                    style="
                        font-size:14px;
                        font-weight:600;
                        margin-bottom:3px;
                    "
                >
                    ${escapeGlobalSearchHTML(
                        result.title
                    )}
                </div>

                <div
                    style="
                        font-size:11px;
                        color:rgba(255,255,255,0.45);
                    "
                >
                    ${escapeGlobalSearchHTML(
                        result.subtitle
                    )}
                </div>

            `;


            row.addEventListener(
                "mouseenter",
                () => {

                    row.style.background =
                        "rgba(255,255,255,0.06)";

                }
            );


            row.addEventListener(
                "mouseleave",
                () => {

                    row.style.background =
                        "transparent";

                }
            );


            row.addEventListener(
                "click",
                () => {

                    closeGlobalSearch();

                    result.action();

                }
            );


            groupContainer.appendChild(row);

        });


        globalSearchResults.appendChild(
            groupContainer
        );

    });

}


function escapeGlobalSearchHTML(value) {

    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}