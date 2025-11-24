import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
    console.log('Email Debug:', {
        user: process.env.EMAIL_USER ? 'Present' : 'Missing',
        pass: process.env.EMAIL_PASS ? 'Present' : 'Missing',
        userLength: process.env.EMAIL_USER?.length,
        passLength: process.env.EMAIL_PASS?.length
    });

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: `"Blogging Platform" <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html,
    };

    await transporter.sendMail(mailOptions);
};

export default sendEmail;
