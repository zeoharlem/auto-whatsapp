import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GeminiService {
  private genAi: GoogleGenerativeAI;

  constructor(private readonly configService: ConfigService) {
    this.genAi = new GoogleGenerativeAI(
      this.configService.get('GEMINI_API_KEY'),
    );
  }

  async getExtractedTextData(imageBuffer: Buffer): Promise<string> {
    const model = this.genAi.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });
    //const imageBuffer = fs.readFileSync(imagePath);
    const prompt = `
      Extract the text from this devotional image and return it as a JSON object.
      Include these fields: date, topic, anchorScripture, content, todo, prayer, furtherReading, and bibleReading.
    `;
    const imagePart = {
      inlineData: {
        data: imageBuffer.toString('base64'),
        mimeType: 'image/jpeg',
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = result.response;
    return JSON.parse(response.text());
  }
}
