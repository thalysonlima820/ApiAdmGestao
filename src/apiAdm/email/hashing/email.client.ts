import { EmailInterface } from "../interface/email.interface";

export abstract class EmailClient {
  abstract sendEmail(input: EmailInterface): Promise<void>
}
