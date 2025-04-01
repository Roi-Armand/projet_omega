import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "../services/auth.service"
import type { Role } from "@prisma/client"

// Ce fichier contient les middlewares pour l'authentification et l'autorisation

/**
 * Middleware d'authentification qui vérifie la validité du token JWT
 * @param req - Requête entrante
 * @param handler - Fonction de gestionnaire à exécuter si l'authentification réussit
 * @returns Réponse du gestionnaire ou erreur d'authentification
 */
export const authenticate = async (
  req: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>,
): Promise<NextResponse> => {
  try {
    // Récupère l'en-tête d'autorisation
    const authHeader = req.headers.get("authorization")

    // Vérifie si l'en-tête existe et commence par "Bearer "
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized: No token provided" }, { status: 401 })
    }

    // Extrait le token
    const token = authHeader.split(" ")[1]

    // Vérifie et décode le token
    const decoded = verifyToken(token)

    // Attache l'utilisateur décodé à la requête pour une utilisation ultérieure
    ;(req as any).user = decoded

    // Passe au gestionnaire suivant
    return handler(req)
  } catch (error) {
    // Renvoie une erreur si le token est invalide
    return NextResponse.json({ error: "Unauthorized: Invalid token" }, { status: 401 })
  }
}

/**
 * Middleware d'autorisation qui vérifie si l'utilisateur a les rôles requis
 * @param roles - Tableau des rôles autorisés
 * @returns Middleware configuré pour vérifier les rôles
 */
export const authorize = (roles: Role[]) => {
  return async (req: NextRequest, handler: (req: NextRequest) => Promise<NextResponse>): Promise<NextResponse> => {
    try {
      // Récupère l'utilisateur attaché par le middleware d'authentification
      const user = (req as any).user

      // Vérifie si l'utilisateur existe
      if (!user) {
        return NextResponse.json({ error: "Unauthorized: User not authenticated" }, { status: 401 })
      }

      // Vérifie si l'utilisateur a l'un des rôles requis
      if (!roles.includes(user.role)) {
        return NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 })
      }

      // Passe au gestionnaire suivant si l'autorisation est accordée
      return handler(req)
    } catch (error) {
      // Renvoie une erreur en cas d'échec de l'authentification
      return NextResponse.json({ error: "Unauthorized: Authentication failed" }, { status: 401 })
    }
  }
}

