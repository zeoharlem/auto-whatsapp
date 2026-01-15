import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';
import { DevotionalAiPort } from '../ports/devotional-ai.port';
import { Injectable } from '@nestjs/common';
import { DevotionalModel } from 'src/domain/models/devotional.model';

@Injectable()
export class OpenAiDevotionalAdapter implements DevotionalAiPort {
  private readonly client: OpenAI;

  constructor(private readonly config: ConfigService) {
    this.client = new OpenAI({
      apiKey: config.get('OPENAI_API_KEY'),
    });
  }

  async extractDailyDevotionFromImage(image: Buffer): Promise<DevotionalModel> {
    const base64Image = image.toString('base64');
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

    const response = await this.client.responses.create({
      model: 'gpt-4.1-mini',
      input: [
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: prompt,
            },
            {
              type: 'input_image',
              image_url: `data:image/jpeg;base64,${base64Image}`,
              detail: 'auto',
            },
          ],
        },
      ],
    });

    const outputText = response.output_text;

    if (!outputText) {
      throw new Error('No output text returned from OpenAI');
    }
    return JSON.parse(outputText) as DevotionalModel;
  }
}
