// src/lib/email.ts
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

const FROM = process.env.EMAIL_FROM || 'noreply@samplewebsite.com'

export async function sendOTPEmail(email: string, otp: string, type: 'reset' | 'verify') {
  const subject = type === 'reset' ? 'Reset your password' : 'Verify your email'
  const action = type === 'reset' ? 'reset your password' : 'verify your email'

  await transporter.sendMail({
    from: `"Sample Website" <${FROM}>`,
    to: email,
    subject,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: 'Helvetica Neue', Arial, sans-serif; background: #0a0a0a; color: #fff; padding: 40px 20px; margin: 0;">
          <div style="max-width: 480px; margin: 0 auto; background: #111; border-radius: 16px; border: 1px solid #222; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #16a34a, #15803d); padding: 32px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #fff;">Sample Website</h1>
            </div>
            <div style="padding: 40px 32px;">
              <h2 style="margin: 0 0 16px; font-size: 20px; color: #fff;">${subject}</h2>
              <p style="color: #aaa; margin: 0 0 32px; line-height: 1.6;">
                Use this OTP to ${action}. It expires in 10 minutes.
              </p>
              <div style="background: #1a1a1a; border: 1px solid #333; border-radius: 12px; padding: 24px; text-align: center; margin: 0 0 32px;">
                <p style="margin: 0 0 8px; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Your OTP</p>
                <p style="margin: 0; font-size: 40px; font-weight: 700; letter-spacing: 8px; color: #22c55e; font-family: monospace;">${otp}</p>
              </div>
              <p style="color: #555; margin: 0; font-size: 13px;">
                If you didn't request this, please ignore this email.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  })
}

export async function sendWelcomeEmail(email: string, name: string) {
  await transporter.sendMail({
    from: `"Sample Website" <${FROM}>`,
    to: email,
    subject: 'Welcome to Sample Website! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: 'Helvetica Neue', Arial, sans-serif; background: #0a0a0a; color: #fff; padding: 40px 20px; margin: 0;">
          <div style="max-width: 480px; margin: 0 auto; background: #111; border-radius: 16px; border: 1px solid #222; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #16a34a, #15803d); padding: 32px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #fff;">Welcome aboard!</h1>
            </div>
            <div style="padding: 40px 32px;">
              <h2 style="margin: 0 0 16px; font-size: 20px; color: #fff;">Hi ${name}, your account is ready</h2>
              <p style="color: #aaa; margin: 0 0 24px; line-height: 1.6;">
                Your 30-day free trial has started. Build your affiliate store and start earning.
              </p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; background: #22c55e; color: #000; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                Go to Dashboard →
              </a>
            </div>
          </div>
        </body>
      </html>
    `,
  })
}
