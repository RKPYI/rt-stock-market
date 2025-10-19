import nodemailer from 'nodemailer';
import { WELCOME_EMAIL_TEMPLATE, NEWS_SUMMARY_EMAIL_TEMPLATE } from './templates';
export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.NODEMAILER_EMAIL!,
        pass: process.env.NODEMAILER_PASSWORD!,
    }
})

export const sendWelcomeEmail = async ({ email, name, intro }: WelcomeEmailData) => {
    const htmlTemplate = WELCOME_EMAIL_TEMPLATE
        .replace('{{name}}', name)
        .replace('{{intro}}', intro);

    const mailOptions = {
        from: `"Signalist" <signalist@romagading.pro>`,
        to: email,
        subject: 'Welcome to Signalist - your stock market toolkit is ready!',
        text: 'Thanks for joining Signalist',
        html: htmlTemplate,
    }

    await transporter.sendMail(mailOptions);    
}

export const sendNewsSummaryEmail = async ({ email, name, newsContent, date }: NewsSummaryEmailData) => {
    const htmlTemplate = NEWS_SUMMARY_EMAIL_TEMPLATE
        .replace('{{date}}', date || new Date().toDateString())
        .replace('{{newsContent}}', newsContent || '<p>No market news today.</p>');

    const subject = `Signalist Market Summary - ${date || new Date().toLocaleDateString()}`;

    const mailOptions = {
        from: `"Signalist" <signalist@romagading.pro>`,
        to: email,
        subject,
        text: 'Your daily market news summary',
        html: htmlTemplate,
    }

    await transporter.sendMail(mailOptions);
}