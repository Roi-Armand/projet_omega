import type { NextRequest } from "next/server"
import { getEvents, createEvent } from "../../controllers/event.controller"
import { authenticate, authorize } from "../../middlewares/auth.middleware"
import { Role } from "@prisma/client"

// Route API pour récupérer tous les événements
// Méthode GET: /api/events
// Protégée: Nécessite authentification
export async function GET(req: NextRequest) {
  // Applique le middleware d'authentification
  return authenticate(req, getEvents)
}

// Route API pour créer un nouvel événement
// Méthode POST: /api/events
// Protégée: Nécessite authentification et rôle ADMIN ou ORGANIZER
export async function POST(req: NextRequest) {
  // Applique le middleware d'authentification
  return authenticate(req, (req) =>
    // Puis le middleware d'autorisation pour vérifier les rôles
    authorize([Role.ADMIN, Role.ORGANIZER])(req, createEvent),
  )
}

