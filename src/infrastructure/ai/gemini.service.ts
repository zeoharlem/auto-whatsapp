import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';
import { DevotionalModel } from '../../domain/models/devotional.model';
import { DevotionalAiPort } from './ports/devotional-ai.port';

//import * as fs from 'fs';

@Injectable()
export class GeminiService implements DevotionalAiPort {
  private genAi: GoogleGenerativeAI;

  constructor(private readonly configService: ConfigService) {
    this.genAi = new GoogleGenerativeAI(
      this.configService.get('GEMINI_API_KEY'),
    );
  }

  async extractDailyDevotionFromImage(
    //imagePath: string,
    imageBuffer: Buffer,
  ): Promise<DevotionalModel> {
    const model = this.genAi.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            date: { type: SchemaType.STRING },
            topic: { type: SchemaType.STRING },
            anchorScripture: { type: SchemaType.STRING },
            contentBody: { type: SchemaType.STRING },
            todo: { type: SchemaType.STRING },
            toPray: { type: SchemaType.STRING },
            furtherReading: { type: SchemaType.STRING },
            bibleInOneYear: { type: SchemaType.STRING },
          },
          required: [
            'date',
            'topic',
            'anchorScripture',
            'contentBody',
            'todo',
            'toPray',
            'furtherReading',
            'bibleInOneYear',
          ],
        },
      },
    });

    //const imageBuffer = fs.readFileSync(imagePath);

    const prompt = `
      Extract the text from this devotional image and return it as a JSON object.
      Include these fields: date, topic, anchorScripture, contentBody, todo, toPray, furtherReading, and bibleInOneYear.
      Rules:
      - Do NOT add explanations
      - Do NOT wrap in markdown
      - If a field is missing in the image, return an empty string
      - Preserve Bible references accurately
      - Keep line breaks inside text fields where appropriate
    `;
    const imagePart = {
      inlineData: {
        data: imageBuffer.toString('base64'),
        mimeType: 'image/jpeg',
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = result.response;
    return JSON.parse(response.text()) as DevotionalModel;
  }
}
