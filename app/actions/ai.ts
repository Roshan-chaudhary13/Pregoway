'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(apiKey);

export async function chatWithGemini(message: string, history: { role: 'user' | 'model', parts: string }[] = []) {
    if (!apiKey || apiKey === 'your-api-key-here') {
        return "I'm ready to help! Please configure my API key in settings to unlock my full potential.";
    }

    try {

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        // Gemini history must start with a user message. 
        // Filter out any leading model messages.
        let validHistory = history.map(h => ({
            role: h.role,
            parts: [{ text: h.parts }]
        }));

        while (validHistory.length > 0 && validHistory[0].role === 'model') {
            validHistory.shift();
        }

        const chat = model.startChat({
            history: validHistory,
            generationConfig: {
                maxOutputTokens: 500,
            },
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        return text;
    } catch (error: any) {
        console.error("Gemini Error:", error);
        return "I'm having trouble connecting to my brain right now. Please try again later.";
    }
}
