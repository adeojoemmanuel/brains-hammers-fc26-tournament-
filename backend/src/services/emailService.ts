import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendRegistrationEmail = async (to: string, name: string, code: string) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: 'Welcome to the B&H FC26 Championship!',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome, ${name}!</h1>
        </div>
        <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; color: #333; line-height: 1.6;">You have successfully registered for the B&H FC26 Championship.</p>
          
          <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 5px;">
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #666; font-weight: bold;">YOUR UNIQUE REGISTRATION CODE:</p>
            <div style="background-color: white; padding: 15px; border-radius: 5px; text-align: center; border: 2px dashed #667eea;">
              <p style="margin: 0; font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; font-family: 'Courier New', monospace;">${code.toUpperCase()}</p>
            </div>
            <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">Please save this code for your records.</p>
          </div>

          <p style="font-size: 16px; color: #333; line-height: 1.6;"><strong>League begins on December 18th, 2025.</strong></p>
          <p style="font-size: 16px; color: #333; line-height: 1.6;">Thank you for joining us!</p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="http://localhost:5173/table" style="display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">View Players Table</a>
          </div>
        </div>
      </div>
    `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully with code:', code);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};
