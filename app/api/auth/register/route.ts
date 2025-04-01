import type { NextRequest } from "next/server"
import { register } from "../../controllers/auth.controller"

// Route API pour l'inscription d'un nouvel utilisateur
// Méthode POST: /api/auth/register
export async function POST(req: NextRequest) {
  // Délègue le traitement au contrôleur d'inscription
  return register(req)
}

