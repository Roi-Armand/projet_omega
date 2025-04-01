import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { hashPassword, comparePasswords, generateToken, generateVerificationCode } from "../services/auth.service"
import { sendVerificationEmail, sendConfirmationEmail } from "../services/email.service"
import { Role } from "@prisma/client"

// Ce contrôleur gère toutes les fonctionnalités liées à l'authentification des utilisateurs

/**
 * Gère l'inscription d'un nouvel utilisateur
 * @param req - Requête contenant les informations d'inscription
 * @returns Réponse avec message de succès ou erreur
 */
export const register = async (req: NextRequest): Promise<NextResponse> => {
  try {
    // Extrait les données du corps de la requête
    const body = await req.json()
    const { email, name, password } = body

    // Vérifie si un utilisateur avec cet email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    // Hache le mot de passe pour un stockage sécurisé
    const hashedPassword = await hashPassword(password)

    // Génère un code de vérification unique
    const verificationCode = generateVerificationCode()

    // Crée l'utilisateur dans la base de données
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: Role.PARTICIPANT, // Par défaut, tous les nouveaux utilisateurs sont des participants
        verificationCode,
      },
    })

    // Envoie un email de vérification avec le code
    await sendVerificationEmail(email, name, verificationCode)

    // Renvoie un message de succès
    return NextResponse.json(
      {
        message: "User registered successfully. Please check your email for verification code.",
        userId: user.id,
      },
      { status: 201 },
    )
  } catch (error) {
    // Log l'erreur et renvoie un message d'erreur générique
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Failed to register user" }, { status: 500 })
  }
}

/**
 * Vérifie le compte d'un utilisateur avec le code de vérification
 * @param req - Requête contenant l'email et le code de vérification
 * @returns Réponse avec message de succès ou erreur
 */
export const verifyAccount = async (req: NextRequest): Promise<NextResponse> => {
  try {
    // Extrait les données du corps de la requête
    const body = await req.json()
    const { email, verificationCode } = body

    // Recherche l'utilisateur par email
    const user = await prisma.user.findUnique({
      where: { email },
    })

    // Vérifie si l'utilisateur existe
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Vérifie si le compte est déjà vérifié
    if (user.isVerified) {
      return NextResponse.json({ error: "Account already verified" }, { status: 400 })
    }

    // Vérifie si le code de vérification est correct
    if (user.verificationCode !== verificationCode) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 })
    }

    // Met à jour l'utilisateur comme vérifié
    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true },
    })

    // Envoie un email de confirmation avec le même code de vérification
    // Ce code servira de code d'accès pour l'utilisateur
    await sendConfirmationEmail(user.email, user.name, verificationCode)

    // Renvoie un message de succès
    return NextResponse.json(
      { message: "Account verified successfully. Please check your email for confirmation." },
      { status: 200 },
    )
  } catch (error) {
    // Log l'erreur et renvoie un message d'erreur générique
    console.error("Verification error:", error)
    return NextResponse.json({ error: "Failed to verify account" }, { status: 500 })
  }
}

/**
 * Gère la connexion d'un utilisateur
 * @param req - Requête contenant les informations de connexion
 * @returns Réponse avec token JWT et informations utilisateur ou erreur
 */
export const login = async (req: NextRequest): Promise<NextResponse> => {
  try {
    // Extrait les données du corps de la requête
    const body = await req.json()
    const { email, password } = body

    // Recherche l'utilisateur par email
    const user = await prisma.user.findUnique({
      where: { email },
    })

    // Vérifie si l'utilisateur existe
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Vérifie si le compte est vérifié
    if (!user.isVerified) {
      return NextResponse.json({ error: "Account not verified. Please verify your account first." }, { status: 403 })
    }

    // Vérifie si le mot de passe est correct
    const isPasswordValid = await comparePasswords(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Génère un token JWT pour l'authentification
    const token = generateToken(user)

    // Renvoie le token et les informations de l'utilisateur
    return NextResponse.json(
      {
        message: "Login successful",
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      { status: 200 },
    )
  } catch (error) {
    // Log l'erreur et renvoie un message d'erreur générique
    console.error("Login error:", error)
    return NextResponse.json({ error: "Failed to login" }, { status: 500 })
  }
}

