import type { NextRequest } from "next/server"
import { getUsers } from "../../controllers/user.controller"
import { authenticate, authorize } from "../../middlewares/auth.middleware"
import { Role } from "@prisma/client"

// Route API pour récupérer tous les utilisateurs
// Méthode GET: /api/users
// Protégée: Nécessite authentification et rôle ADMIN ou ORGANIZER
export async function GET(req: NextRequest) {
  // Applique le middleware d'authentification
  return authenticate(req, (req) =>
    // Puis le middleware d'autorisation pour vérifier les rôles
    authorize([Role.ADMIN, Role.ORGANIZER])(req, getUsers),
  )
}

