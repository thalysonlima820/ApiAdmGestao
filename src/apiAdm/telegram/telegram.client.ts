import { BotType } from "./interface/bottype.interface";

export abstract class TelegramClient {
  abstract sendMessage(input: {
    chatId: string;
    text: string;
    botType: BotType;
    title: string;
  }): Promise<void>;
}
