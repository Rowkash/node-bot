import { Configuration, OpenAIApi } from "openai";
import { createReadStream } from "fs";

class OpenAi {
  roles = {
    ASSISTANT: "assistant",
    USER: "user",
    SYSTEM: "system",
  };

  constructor() {
    const configuration = new Configuration({
      apiKey: "KEY", // API key
      basePath: "https://chimeragpt.adventblocks.cc/v1", // Base API path
    });
    this.openAi = new OpenAIApi(configuration);
  }

  // ---------- Chat with GPT ---------- //

  async chat(messages) {
    try {
      const response = await this.openAi.createChatCompletion({
        model: "gpt-3.5-turbo-16k",
        messages,
      });

      return response.data.choices[0].message;
    } catch (error) {
      console.log("Error chatting with GPT", error.message);
    }
  }

  // ---------- Voice Transcription ---------- //

  async transcription(filepath) {
    try {
      const response = await this.openAi.createTranscription(
        createReadStream(filepath),
        "whisper-1"
      );
      return response.data.text;
    } catch (error) {
      console.log("Error transcription", error.message);
    }
  }
}

export const openAi = new OpenAi();
