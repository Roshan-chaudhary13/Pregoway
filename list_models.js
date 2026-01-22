
const apiKey = "AIzaSyCfbIVnvSVIRo4aypd_iRAAJOiFnzciZFs";

async function listModels() {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.models) {
            console.log("Available Flash Models:");
            data.models.forEach(m => {
                if (m.name.includes("flash")) console.log(m.name);
            });
        } else {
            console.log("No models found or error:", data);
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

listModels();
