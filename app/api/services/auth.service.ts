import { compare, hash } from "bcrypt"
import jwt from "jsonwebtoken"
import { config } from "../config"
import type { User } from "@prisma/client"

// Ce service gère toutes les fonctionnalités liées à l'authentification

/**
 * Hache un mot de passe en clair pour le stockage sécurisé
 * @param password - Mot de passe en clair
 * @returns Mot de passe haché
 */
export const hashPassword = async (password: string): Promise<string> => {
  return hash(password, 10) // Utilise bcrypt avec un facteur de coût de 10
}

/**
 * Compare un mot de passe en clair avec un mot de passe haché
 * @param password - Mot de passe en clair
 * @param hashedPassword - Mot de passe haché stocké en base
 * @returns Booléen indiquant si les mots de passe correspondent
 */
export const comparePasswords = async (password: string, hashedPassword: string): Promise<boolean> => {
  return compare(password, hashedPassword) // Utilise bcrypt pour comparer
}

/**
 * Génère un token JWT pour l'authentification
 * @param user - Objet utilisateur contenant les informations à inclure dans le token
 * @returns Token JWT signé
 */
export const generateToken = (user: Partial<User>): string => {
  // Crée le payload du token avec les informations essentielles de l'utilisateur
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  }

  // Signe le token avec la clé secrète et définit sa durée de validité
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  })
}

/**
 * Vérifie et décode un token JWT
 * @param token - Token JWT à vérifier
 * @returns Payload décodé du token
 * @throws Error si le token est invalide
 */
export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, config.jwtSecret)
  } catch (error) {
    throw new Error("Invalid token")
  }
}

/**
 * Génère un code de vérification aléatoire pour l'inscription
 * @returns Code de vérification alphanumérique
 */
export const generateVerificationCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

