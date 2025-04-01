import type { NextRequest } from "next/server"
import { getUserById, updateUser, deleteUser } from "../../../controllers/user.controller"
import { authenticate, authorize } from "../../../middlewares/auth.middleware"
import { Role } from "@prisma/client"

// Route API pour récupérer un utilisateur par son ID
// Méthode GET: /api/users/:id
// Protégée: Nécessite authentification
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  // Applique le middleware d'authentification
  return authenticate(req, (req) =>
    // Délègue au contrôleur avec les paramètres de route
    getUserById(req, { params }),
  )
}

// Route API pour mettre à jour un utilisateur
// Méthode PUT: /api/users/:id
// Protégée: Nécessite authentification et rôle ADMIN
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  // Applique le middleware d'authentification
  return authenticate(req, (req) =>
    // Puis le middleware d'autorisation pour vérifier le rôle ADMIN
    authorize([Role.ADMIN])(req, (req) => updateUser(req, { params })),
  )
}

// Route API pour supprimer un utilisateur
// Méthode DELETE: /api/users/:id
// Protégée: Nécessite authentification et rôle ADMIN
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  // Applique le middleware d'authentification
  return authenticate(req, (req) =>
    // Puis le middleware d'autorisation pour vérifier le rôle ADMIN
    authorize([Role.ADMIN])(req, (req) => deleteUser(req, { params })),
  )
}

