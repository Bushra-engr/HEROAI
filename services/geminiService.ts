import { GoogleGenAI, Chat, GenerateContentResponse, Modality } from "@google/genai";

const getAI = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API_KEY environment variable is not set.");
    }
    return new GoogleGenAI({ apiKey });
}

export const generateImage = async (prompt: string): Promise<string> => {
    const ai = getAI();
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '1:1',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    throw new Error("Image generation failed.");
};

export const editImage = async (prompt: string, imageBase64: string, mimeType: string): Promise<string> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: imageBase64,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
          responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64ImageBytes: string = part.inlineData.data;
          return `data:image/png;base64,${base64ImageBytes}`;
        }
    }
    throw new Error("Image editing failed.");
};

// FIX: Implement and export the 'generateVideo' function to resolve the import error in VideoGenerator.tsx.
export const generateVideo = async (
    prompt: string,
    aspectRatio: '16:9' | '9:16',
    setLoadingMessage: (message: string) => void
): Promise<string> => {
    let ai = getAI();
    
    setLoadingMessage("Initiating video generation...");
    let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: {
            numberOfVideos: 1,
            resolution: '720p', // Using 720p for faster generation
            aspectRatio: aspectRatio,
        }
    });

    const messages = [
        "Warming up the rendering engine...",
        "Choreographing digital actors...",
        "Composing the first few scenes...",
        "Adding special effects...",
        "Finalizing the soundtrack...",
        "Almost there, just polishing the lens...",
    ];
    let pollCount = 0;

    setLoadingMessage("Processing video... This can take a few minutes.");
    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        setLoadingMessage(messages[pollCount % messages.length]);
        pollCount++;
        ai = getAI(); // Refresh AI instance in case key changed
        operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    setLoadingMessage("Finalizing your video...");
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
        throw new Error("Video generation failed: No download link available.");
    }

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API_KEY environment variable is not set for fetching video.");
    }
    const videoResponse = await fetch(`${downloadLink}&key=${apiKey}`);
    
    if (!videoResponse.ok) {
        throw new Error(`Failed to fetch video data: ${videoResponse.statusText}`);
    }

    const videoBlob = await videoResponse.blob();
    return URL.createObjectURL(videoBlob);
};

export const transcribeAudio = async (audioBase64: string, mimeType: string): Promise<string> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                { text: "Transcribe the following audio:" },
                {
                    inlineData: {
                        data: audioBase64,
                        mimeType: mimeType,
                    },
                },
            ],
        },
    });
    return response.text;
};

export const createChat = (): Chat => {
    const ai = getAI();
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: 'You are HEROAI, a helpful and friendly AI assistant. Be concise but informative.',
        }
    });
};

export const getDeepThought = async (prompt: string): Promise<GenerateContentResponse> => {
    const ai = getAI();
    return ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            thinkingConfig: { thinkingBudget: 32768 }
        }
    });
};
