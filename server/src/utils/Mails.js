import { createTransporter } from "./MailTransporter.js";

export const sendVerificationMail = (user, unHashedToken) => {
    const transporter = createTransporter();

    let message = {
        from: '"Chatt App" <tubeverse@outlook.com>',
        to: "surajsa1858@gmail.com",
        subject: "User Verification Mail Please verfiy",
        html: `<p>Hello ${user?.name}, verify your email by clicking on this link...</p>
        <a href='${process.env.CLIENT_URL}/verify/${unHashedToken}'> Verify Your Email</a>
        <p>The link will be activated for about 10 mins</p>`,
    };

    transporter.sendMail(message, (err, inf) => {
        if (err) {
            console.log(err);
        } else {
            console.log("Verification Email Sent");
        }
    });
};
