const questionForm = document.getElementById("ascnd-question");
if (questionForm) {
    const input = document.getElementById("ascnd-question-input");
    const answer = document.getElementById("ascnd-answer");
    const entries = JSON.parse(document.getElementById("ascnd-faq-data").textContent);
    questionForm.hidden = false;

    questionForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const question = ` ${input.value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()} `;
        const matches = entries.map((item) => ({
            item,
            score: Math.max(0, ...item.phrases.map((phrase) =>
                question.includes(` ${phrase} `) ? phrase.split(" ").length : 0))
        })).filter(({score}) => score > 0).sort((a, b) => b.score - a.score);
        answer.replaceChildren();

        function addLink(container, href, label) {
            const link = document.createElement("a");
            link.href = href;
            link.textContent = label;
            container.append(link);
        }

        if (!matches.length) {
            const message = document.createElement("p");
            message.textContent = "I couldn’t find an answer to that in the FAQs. ";
            addLink(message, "/contact", "Ask the ASCND team");
            answer.append(message);
            return;
        }

        const highest = matches[0].score;
        for (const {item} of matches.filter(({score}) => score === highest).slice(0, 2)) {
            const detail = document.createElement("article");
            const title = document.createElement("h3");
            title.textContent = item.question;
            const copy = document.createElement("p");
            copy.textContent = item.answer;
            detail.append(title, copy);
            addLink(detail, item.url, "See related details");
            answer.append(detail);
        }
    });
}
