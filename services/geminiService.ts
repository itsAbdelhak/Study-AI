
import { GoogleGenAI, Type } from "@google/genai";
import type { StudyPlanItem } from "../components/CourseTutor";

export type LearningMode = 'chat' | 'todo' | 'quiz' | 'summary' | 'explain' | 'explain_term' | 'diagram' | 'start_topic' | 'next_topic' | 'finish_plan';

export type PersonalizationSettings = {
    language: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    tone: 'Strict' | 'Friendly' | 'Fast & Focused' | 'Encouraging';
    goal: 'Exam Prep' | 'Deep Understanding' | 'Study Notes' | 'Quick Revision';
};

const TONE_INSTRUCTIONS = {
    'Strict': 'Adopt the persona of a serious, formal professor. Be precise and direct. Avoid emojis and casual language.',
    'Friendly': 'Adopt the persona of a helpful, friendly peer. Be encouraging and use emojis like 📘 and💡. Keep the tone conversational.',
    'Fast & Focused': 'Be concise and get straight to the point. Use bullet points and focus on core information.',
    'Encouraging': 'Be very positive and motivational. Celebrate small wins and gently guide the student. Use emojis like 🎉 and 🚀.'
};

const LEVEL_INSTRUCTIONS = {
    'Beginner': 'Explain concepts in the simplest terms possible. Assume no prior knowledge. Use basic vocabulary and frequent, simple analogies.',
    'Intermediate': 'Assume some foundational knowledge. You can use some technical terms, but explain them clearly the first time they are used.',
    'Advanced': 'Assume the student is comfortable with the subject. Use precise, technical language and focus on complex nuances and connections.'
};

const GOAL_INSTRUCTIONS = {
    'Exam Prep': 'Focus on key concepts, definitions, and potential exam questions. Structure responses to be easily reviewable.',
    'Deep Understanding': 'Go into detail and explore the "why" behind concepts. Use rich examples and connect ideas.',
    'Study Notes': 'Structure responses clearly with headings, bullet points, and bolded keywords to make them easy to copy as notes.',
    'Quick Revision': 'Provide high-level summaries and focus only on the most critical information for a quick refresher.'
};

const generateSystemPrompt = (mode: LearningMode, personalization: PersonalizationSettings, currentTopic?: StudyPlanItem, selectedTerm?: string) => {
    let basePrompt = '';

    switch(mode) {
        case 'chat':
            basePrompt = `You are an expert AI tutor. Your current task is to teach the topic: **"{current_topic_title}"** with the objective: **"{current_topic_objective}"**.
            Your goal is to help the student deeply understand this specific topic.
            **Method:**
            1.  **Focus Strictly on the Topic:** All explanations must relate to the current topic.
            2.  **Explain Step-by-Step:** Break down concepts simply.
            3.  **Check for Understanding:** After explaining, ask a gentle, open-ended question.`;
            break;
        case 'explain_term':
            basePrompt = `Explain the term **"{selected_term}"** concisely. First, give a simple definition, then a real-world example.`;
            break;
        case 'diagram':
            basePrompt = `Create a Mermaid.js graph to visually explain the core concepts of the topic **"{current_topic_title}"**.
**Instructions:**
1. The diagram should be simple and clear.
2. The text inside the diagram nodes MUST be in **${personalization.language}**.
3. **Crucial Syntax Rule for Special Characters:** If any node text contains special characters (like '(', ')', '[', ']', '{', '}', "'", '%', ','), you **MUST** enclose the entire text for that node in double quotes. Example: \`A["Text with (special chars)"] --> B\`.
4. **Crucial Syntax Rule for Quotes:** If you need to include a double quote character (") inside a node label, you **MUST** escape it using the HTML entity \`&quot;\`. Example: \`C["This node contains &quot;quotes&quot;"]\`. This prevents parsing errors.
5. Respond ONLY with the Mermaid syntax inside a \`\`\`mermaid code block.`;
            break;
        case 'start_topic':
            basePrompt = `Generate a short, friendly, and encouraging message to start the first topic of a study plan. The topic is **"{current_topic_title}"** and the objective is **"{current_topic_objective}"**.`;
            break;
        case 'next_topic':
            basePrompt = `Generate a short, positive message congratulating the student on completing the previous topic and introducing the next one: **"{current_topic_title}"** and its objective **"{current_topic_objective}"**.`;
            break;
        case 'finish_plan':
            basePrompt = `Generate a short, celebratory message congratulating the student on completing their entire study plan. Suggest what they could do next, like a quiz or review.`;
            break;
        default:
             basePrompt = `You are a helpful AI assistant.`;
    }

    if (currentTopic) {
        basePrompt = basePrompt
            .replace('{current_topic_title}', currentTopic.title)
            .replace('{current_topic_objective}', currentTopic.objective);
    }
    if (selectedTerm) {
        basePrompt = basePrompt.replace('{selected_term}', selectedTerm);
    }

    return `
        **Persona & Style:**
        - **Language:** You MUST respond in ${personalization.language}.
        - **Tone:** ${TONE_INSTRUCTIONS[personalization.tone]}
        - **Level:** ${LEVEL_INSTRUCTIONS[personalization.level]}
        - **Goal Focus:** ${GOAL_INSTRUCTIONS[personalization.goal]}
        
        **Core Task:**
        ${basePrompt}

        **Rules:**
        - Base all answers on the provided document context. If the information isn't there, state that clearly.
    `;
};


interface Message {
    role: 'user' | 'model';
    content: string;
}

const studyPlanSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        title: {
          type: Type.STRING,
          description: 'A short, engaging title for the learning topic or chapter.',
        },
        objective: {
          type: Type.STRING,
          description: 'A brief, one-sentence learning goal for this topic.',
        },
      },
      required: ['title', 'objective'],
    },
};

export const generateStudyPlan = async (
    fileInfo: { dataUrl: string; name: string; type: string; },
    personalization: PersonalizationSettings,
): Promise<Omit<StudyPlanItem, 'completed' | 'confidence'>[]> => {
    if (!process.env.API_KEY) throw new Error("API_KEY environment variable not set.");

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-2.5-flash';

    const [_, base64Data] = fileInfo.dataUrl.split(';base64,');
    if (!base64Data) throw new Error("Invalid file data URL.");
    
    const systemPrompt = `You are an AI learning architect. Your task is to analyze the provided document and create a structured study plan.
**Instructions:**
1.  The plan MUST be generated in the following language: **${personalization.language}**.
2.  Tailor the plan for a student whose learning level is **${personalization.level}** and whose main goal is **${personalization.goal}**.
3.  Logically break down the document's content into manageable learning units.
4.  Respond ONLY with the JSON array that adheres to the provided schema.`;

    const filePart = { inlineData: { data: base64Data, mimeType: fileInfo.type } };
    const textPart = { text: systemPrompt };

    const response = await ai.models.generateContent({
        model,
        contents: { parts: [textPart, filePart] },
        config: {
            responseMimeType: 'application/json',
            responseSchema: studyPlanSchema,
        }
    });
    
    try {
        const jsonText = response.text.trim();
        const plan = JSON.parse(jsonText);
        if (Array.isArray(plan)) {
            return plan;
        }
        throw new Error("Parsed JSON is not an array.");
    } catch (error) {
        console.error("Failed to parse study plan JSON:", error);
        throw new Error("Could not generate a valid study plan from the document.");
    }
};

export const generateResponse = async (
    fileInfo: { dataUrl: string; name: string; type: string; }, 
    chatHistory: Message[], 
    latestQuestion: string,
    mode: LearningMode,
    personalization: PersonalizationSettings,
    currentTopic?: StudyPlanItem
): Promise<string> => {
    if (!process.env.API_KEY) throw new Error("API_KEY environment variable not set.");

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-2.5-flash';

    const [_, base64Data] = fileInfo.dataUrl.split(';base64,');
    if (!base64Data) throw new Error("Invalid file data URL.");

    try {
        const systemPrompt = generateSystemPrompt(mode, personalization, currentTopic, mode === 'explain_term' ? latestQuestion : undefined);

        const historyForPrompt = chatHistory.map(message => `**${message.role === 'user' ? 'Student' : 'Tutor'}:** ${message.content}`).join('\n');
        
        const contents = [
            `**System Prompt:**\n${systemPrompt}\n\n`,
            `**Conversation History:**\n${historyForPrompt}\n\n`,
            `**Student's New Request:**\n${latestQuestion}\n\n`,
        ];

        let response;
        const filePart = { inlineData: { data: base64Data, mimeType: fileInfo.type } };
        
        const textContent = `**Document Context is attached.**\n\n---\n\n${contents.join('')}`;
        const textPart = { text: textContent };

        response = await ai.models.generateContent({
            model,
            contents: { parts: [textPart, filePart] },
        });
        
        return response.text;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error) {
            return Promise.reject(new Error(`Gemini API Error: ${error.message}`));
        }
        return Promise.reject(new Error("An unknown error occurred."));
    }
};