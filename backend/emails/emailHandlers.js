import { emailClient, emailSender } from "../utils/mailtrap.js";
import { createWelcomeEmailTemplate } from "./emailTemplates.js";
export const sendWelcomeEmail = async (email, name, profileUrl) => {
  const recipient = [{ email }];
  try {
    const response = await emailClient.send({
      from: emailSender,
      to: recipient,
      subject: "Welcome to Mystic Broker!",
      html: createWelcomeEmailTemplate(name, profileUrl),
      category: "welcome",
    });
    console.log("welcome email sent successfully ", response);
  } catch (error) {
    console.log(error);
  }
};
