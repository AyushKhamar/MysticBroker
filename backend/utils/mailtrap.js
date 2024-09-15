import { MailtrapClient } from "mailtrap";
import dotenv from "dotenv";
dotenv.config();
const TOKEN = process.env.MAILTRAP;

export const emailClient = new MailtrapClient({
  token: TOKEN,
});

export const emailSender = {
  email: process.env.EMAIL_FROM,
  name: "Ayush Khamar",
};
const recipients = [
  {
    email: "ayushkhamar8@gmail.com",
  },
];
