import type { NextRequest } from "next/server"
import { verifyAccount } from "../../controllers/auth.controller"

// Route API pour la vérification d'un compte utilisateur
// Méthode POST: /api/auth/verify
export async function POST(req: NextRequest) {
  // Délègue le traitement au contrôleur de vérification
  return verifyAccount(req)
}

