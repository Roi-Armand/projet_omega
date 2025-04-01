import nodemailer from "nodemailer"
import { config } from "../config"

// Ce service gère l'envoi d'emails pour la vérification et la confirmation des comptes

// Crée un transporteur SMTP pour l'envoi d'emails
const transporter = nodemailer.createTransport({
  host: config.emailService.host,
  port: config.emailService.port,
  secure: config.emailService.secure,
  auth: {
    user: config.emailService.auth.user,
    pass: config.emailService.auth.pass,
  },
})

/**
 * Envoie un email de vérification avec le code unique
 * @param to - Adresse email du destinataire
 * @param name - Nom du destinataire
 * @param verificationCode - Code de vérification unique
 */
export const sendVerificationEmail = async (to: string, name: string, verificationCode: string): Promise<void> => {
  // Définit les options de l'email
  const mailOptions = {
    from: config.emailService.from,
    to,
    subject: "Vérification de votre compte",
    html: `
      <h1>Bienvenue, ${name}!</h1>
      <p>Merci de vous être inscrit sur notre plateforme d'anniversaire.</p>
      <p>Votre code de vérification est: <strong>${verificationCode}</strong></p>
      <p>Veuillez utiliser ce code pour vérifier votre compte.</p>
    `,
  }

  // Envoie l'email
  await transporter.sendMail(mailOptions)
}

/**
 * Envoie un email de confirmation après vérification du compte
 * @param to - Adresse email du destinataire
 * @param name - Nom du destinataire
 * @param verificationCode - Code de vérification unique (réutilisé comme code d'accès)
 */
export const sendConfirmationEmail = async (to: string, name: string, verificationCode: string): Promise<void> => {
  // Définit les options de l'email
  const mailOptions = {
    from: config.emailService.from,
    to,
    subject: "Confirmation de votre inscription",
    html: `
      <h1>Félicitations, ${name}!</h1>
      <p>Votre compte a été vérifié avec succès.</p>
      <p>Votre code d'accès est: <strong>${verificationCode}</strong></p>
      <p>Conservez ce code pour vos futures connexions.</p>
    `,
  }

  // Envoie l'email
  await transporter.sendMail(mailOptions)
}

