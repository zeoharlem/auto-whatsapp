import { Inject, Injectable, Logger } from '@nestjs/common';
import { DevotionalModel } from '../../../domain/devotional/models/devotional.model';
import { DevotionalAiPort } from '../ports/devotional-ai.port';

@Injectable()
export class ExtractDevotionalTextUseCase {
  private readonly logger = new Logger(ExtractDevotionalTextUseCase.name);

  constructor(
    @Inject('DevotionalAiPort')
    private readonly devotionalAiPort: DevotionalAiPort,
  ) {}

  async execute(imageBuffer: Buffer): Promise<string> {
    const devotional = await this.devotionalAiPort.extractDailyDevotionFromImage(imageBuffer);
    this.logger.log(devotional, 'ExtractDevotionalTextUseCase.execute');
    return this.formatForWhatsapp(devotional);
  }

  private formatForWhatsapp(d: DevotionalModel): string {
    return `
      📅 *${d.date}*
      📖 *Topic: ${d.topic}*
      
      *Anchor Scripture:*  
      ${d.anchorScripture}
      
      ${d.contentBody}
      
      *To Do:*  
      ${d.todo}
      
      *To Pray:*  
      ${d.toPray}
      
      *Further Reading:*  
      ${d.furtherReading}
      
      *Bible In One Year:*  
      ${d.bibleInOneYear}
          `.trim();
  }

  private getTodayDevotional(): DevotionalModel {
    return DAILY_DEVOTIONAL;
  }
}

/**
  Mock Data:-> Make sure that when debugging,
  the extractDailyDevotionFromImage(..) in the execute block above is commented out
 and use getTodayDevotional() to get its return value
 **/
export const DAILY_DEVOTIONAL: DevotionalModel = {
  date: '11th January, 2026',
  topic: 'Good Character Matters A Lot',
  anchorScripture:
    "'And David went out whithersoever Saul sent him, and behaved himself wisely: and Saul set him over the men of war, and he was accepted in the sight of all the people, and also in the sight of Saul's servants' - 1 SAMUEL 18:5",
  contentBody:
    "If you really desire to go far with God in Life, then you must make up your mind to develop yourself and work on your character. Don't be comfortable with your flaws and deficiencies in character that you know won't help your Life. When you notice that there are certain behaviors, attitudes, and mannerisms in you that are not right and godly, don't ignore them; strive to improve yourself. Strive to grow beyond that level of attitude and become more mature and godly in your attitude and character.\n\nYou must understand that if you truly want to succeed and go far with God and make it in life, then you must decide to work on yourself. God's Favour and blessings might locate and take you to the top and place you at the helm of affairs, but it is your good character that will sustain you there. It takes God's Grace and favour to come into a level or secure a position in a good place or bring you among your helpers, but it is your good character that will keep you there.\n\nThis was what the scriptures make us understand about the Life of David. When God favours him, he was very careful with how he lived his life and he manifested the right character that glorifies God. 1 Samuel 18:5,30 tells us that, \"And David went out whithersoever Saul sent him, and behaved himself wisely: and Saul set him over the men of war, and he was accepted in the sight of all the people, and also in the sight of Saul's servants. Then the princes of the Philistines went forth: and it came to pass, after they went forth, that David behaved himself more wisely than all the servants of Saul; so that his name was much set by\".",
  todo: 'Develop the right character that is in you. Work on yourself.',
  toPray:
    'Holy Spirit, help me to be a better person. Help me to build and develop the Right and godly character always in the name of Jesus Christ.',
  furtherReading: 'Matthew 5:16, 1 Timothy 4:12',
  bibleInOneYear: '2Kings 4-5, John 4:1-30',
};
