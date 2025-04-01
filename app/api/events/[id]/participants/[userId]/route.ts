import type { NextRequest } from "next/server"
import { updateParticipantStatus, removeParticipant } from "../../../../../controllers/event.controller"
import { authenticate, authorize } from "../../../../../middlewares/auth.middleware"
import { Role } from "@prisma/client"

// Route API pour mettre à jour le statut d'un participant
// Méthode PUT: /api/events/:id/participants/:userId
// Protégée: Nécessite authentification et rôle ADMIN ou ORGANIZER
export async function PUT(req: NextRequest, { params }: { params: { id: string; userId: string } }) {
  // Applique le middleware d'authentification
  return authenticate(req, (req) =>
    // Puis le middleware d'autorisation pour vérifier les rôles
    authorize([Role.ADMIN, Role.ORGANIZER])(req, (req) => updateParticipantStatus(req, { params })),
  )
}

// Route API pour supprimer un participant d'un événement
// Méthode DELETE: /api/events/:id/participants/:userId
// Protégée: Nécessite authentification et rôle ADMIN ou ORGANIZER
export async function DELETE(req: NextRequest, { params }: { params: { id: string; userId: string } }) {
  // Applique le middleware d'authentification
  return authenticate(req, (req) =>
    // Puis le middleware d'autorisation pour vérifier les rôles
    authorize([Role.ADMIN, Role.ORGANIZER])(req, (req) => removeParticipant(req, { params })),
  )
}

