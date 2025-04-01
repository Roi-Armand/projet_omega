import type { NextRequest } from "next/server"
import { addParticipant } from "../../../../controllers/event.controller"
import { authenticate, authorize } from "../../../../middlewares/auth.middleware"
import { Role } from "@prisma/client"

// Route API pour ajouter un participant à un événement
// Méthode POST: /api/events/:id/participants
// Protégée: Nécessite authentification et rôle ADMIN ou ORGANIZER
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  // Applique le middleware d'authentification
  return authenticate(req, (req) =>
    // Puis le middleware d'autorisation pour vérifier les rôles
    authorize([Role.ADMIN, Role.ORGANIZER])(req, (req) => addParticipant(req, { params })),
  )
}

