import nodemailer from "nodemailer";

export const createTransporter = () => {
    //  Mail Trap
    // const transporter = nodemailer.createTransport({
    //     host: "sandbox.smtp.mailtrap.io",
    //     port: 2525,
    //     auth: {
    //         user: process.env.MAILTRAP_USER,
    //         pass: process.env.MAILTRAP_PASSWORD,
    //     },
    // });

    // outlook
    const transporter = nodemailer.createTransport({
        service: "hotmail",
        auth: {
            user: "tubeverse@outlook.com",
            pass: process.env.NODEMAILER_OUTLOOK_PASSWORD,
        },
    });

    return transporter;
};