// Ce fichier centralise la configuration de l'application
// Il récupère les variables d'environnement et fournit des valeurs par défaut

export const config = {
  // Clé secrète pour signer les tokens JWT
  jwtSecret: process.env.JWT_SECRET || "your-secret-key",

  // Durée de validité des tokens JWT
  jwtExpiresIn: "7d",

  // Configuration du service d'email
  emailService: {
    // Hôte SMTP pour l'envoi d'emails
    host: process.env.EMAIL_HOST || "smtp.example.com",

    // Port SMTP
    port: Number.parseInt(process.env.EMAIL_PORT || "587"),

    // Utilisation d'une connexion sécurisée
    secure: process.env.EMAIL_SECURE === "true",

    // Informations d'authentification SMTP
    auth: {
      user: process.env.EMAIL_USER || "user@example.com",
      pass: process.env.EMAIL_PASS || "password",
    },

    // Adresse d'expéditeur par défaut
    from: process.env.EMAIL_FROM || "noreply@example.com",
  },
}

