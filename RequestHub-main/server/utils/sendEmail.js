const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
    // 1. Create a transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || "smtp.ethereal.email",
        port: process.env.EMAIL_PORT || 587,
        auth: {
            user: process.env.EMAIL_USER || "test@test.com",
            pass: process.env.EMAIL_PASSWORD || "password",
        },
    });

    // 2. Define the email options
    const mailOptions = {
        from: `Request Management System <${process.env.EMAIL_FROM || "noreply@rms.com"}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    // 3. Actually send the email
    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${options.email}`);
    } catch (error) {
        console.error("Email could not be sent", error);
    }
};

module.exports = sendEmail;
