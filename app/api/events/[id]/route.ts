import type { NextRequest } from "next/server"
import { getEventById, updateEvent, deleteEvent } from "../../../controllers/event.controller"
import { authenticate } from "../../../middlewares/auth.middleware"

// Route API pour récupérer un événement par son ID
// Méthode GET: /api/events/:id
// Protégée: Nécessite authentification
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  // Applique le middleware d'authentification
  return authenticate(req, (req) => getEventById(req, { params }))
}

// Route API pour mettre à jour un événement
// Méthode PUT: /api/events/:id
// Protégée: Nécessite authentification
// Note: La vérification des droits (organisateur ou admin) est faite dans le contrôleur
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  // Applique le middleware d'authentification
  return authenticate(req, (req) => updateEvent(req, { params }))
}

// Route API pour supprimer un événement
// Méthode DELETE: /api/events/:id
// Protégée: Nécessite authentification
// Note: La vérification des droits (organisateur ou admin) est faite dans le contrôleur
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  // Applique le middleware d'authentification
  return authenticate(req, (req) => deleteEvent(req, { params }))
}

