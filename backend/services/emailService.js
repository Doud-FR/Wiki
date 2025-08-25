const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'localhost',
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendWelcomeEmail(user) {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@wiki.local',
        to: user.email,
        subject: 'Bienvenue sur Wiki App',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">Bienvenue ${user.firstName} !</h1>
            <p>Votre compte a été créé avec succès sur Wiki App.</p>
            <p>Vous pouvez maintenant accéder à la plateforme et commencer à créer et organiser votre documentation.</p>
            <p>Détails du compte :</p>
            <ul>
              <li><strong>Email :</strong> ${user.email}</li>
              <li><strong>Nom :</strong> ${user.firstName} ${user.lastName}</li>
            </ul>
            <p>Bonne utilisation !</p>
            <hr>
            <p style="font-size: 12px; color: #666;">
              Cet email a été envoyé automatiquement, merci de ne pas y répondre.
            </p>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log('Welcome email sent to:', user.email);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
    }
  }

  async sendPasswordResetEmail(user, resetToken) {
    try {
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      
      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@wiki.local',
        to: user.email,
        subject: 'Réinitialisation de mot de passe - Wiki App',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">Réinitialisation de mot de passe</h1>
            <p>Bonjour ${user.firstName},</p>
            <p>Une demande de réinitialisation de mot de passe a été faite pour votre compte.</p>
            <p>Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe :</p>
            <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Réinitialiser mon mot de passe
            </a>
            <p>Ce lien expire dans 1 heure.</p>
            <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
            <hr>
            <p style="font-size: 12px; color: #666;">
              Cet email a été envoyé automatiquement, merci de ne pas y répondre.
            </p>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log('Password reset email sent to:', user.email);
    } catch (error) {
      console.error('Failed to send password reset email:', error);
    }
  }
}

module.exports = new EmailService();