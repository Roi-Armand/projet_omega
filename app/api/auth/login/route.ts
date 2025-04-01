import type { NextRequest } from "next/server"
import { login } from "../../controllers/auth.controller"

// Route API pour la connexion d'un utilisateur
// Méthode POST: /api/auth/login
export async function POST(req: NextRequest) {
  // Délègue le traitement au contrôleur de connexion
  return login(req)
}

