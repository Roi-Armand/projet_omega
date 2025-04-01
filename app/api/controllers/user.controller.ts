import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { hashPassword } from "../services/auth.service"

// Ce contrôleur gère les opérations CRUD pour les utilisateurs

/**
 * Récupère tous les utilisateurs
 * @param req - Requête entrante
 * @returns Liste des utilisateurs avec informations filtrées
 */
export const getUsers = async (req: NextRequest): Promise<NextResponse> => {
  try {
    // Récupère tous les utilisateurs avec des champs sélectionnés
    // Exclut les informations sensibles comme les mots de passe
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isVerified: true,
        createdAt: true,
      },
    })

    return NextResponse.json(users, { status: 200 })
  } catch (error) {
    // Log l'erreur et renvoie un message d'erreur générique
    console.error("Get users error:", error)
    return NextResponse.json({ error: "Failed to get users" }, { status: 500 })
  }
}

/**
 * Récupère un utilisateur par son ID
 * @param req - Requête entrante
 * @param params - Paramètres de route contenant l'ID de l'utilisateur
 * @returns Informations détaillées de l'utilisateur ou erreur
 */
export const getUserById = async (req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> => {
  try {
    const { id } = params

    // Récupère l'utilisateur avec ses événements associés
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isVerified: true,
        createdAt: true,
        events: {
          include: {
            event: true, // Inclut les détails des événements
          },
        },
      },
    })

    // Vérifie si l'utilisateur existe
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user, { status: 200 })
  } catch (error) {
    // Log l'erreur et renvoie un message d'erreur générique
    console.error("Get user error:", error)
    return NextResponse.json({ error: "Failed to get user" }, { status: 500 })
  }
}

/**
 * Met à jour les informations d'un utilisateur
 * @param req - Requête contenant les nouvelles informations
 * @param params - Paramètres de route contenant l'ID de l'utilisateur
 * @returns Utilisateur mis à jour ou erreur
 */
export const updateUser = async (req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> => {
  try {
    const { id } = params
    // Extrait les données du corps de la requête
    const body = await req.json()
    const { name, email, role, password } = body

    // Vérifie si l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { id },
    })

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Prépare les données à mettre à jour
    // N'inclut que les champs fournis dans la requête
    const updateData: any = {}
    if (name) updateData.name = name
    if (email) updateData.email = email
    if (role) updateData.role = role
    if (password) updateData.password = await hashPassword(password)

    // Met à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isVerified: true,
        createdAt: true,
      },
    })

    return NextResponse.json(updatedUser, { status: 200 })
  } catch (error) {
    // Log l'erreur et renvoie un message d'erreur générique
    console.error("Update user error:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

/**
 * Supprime un utilisateur
 * @param req - Requête entrante
 * @param params - Paramètres de route contenant l'ID de l'utilisateur
 * @returns Message de succès ou erreur
 */
export const deleteUser = async (req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> => {
  try {
    const { id } = params

    // Vérifie si l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { id },
    })

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Supprime l'utilisateur
    // Les relations associées seront également supprimées grâce à la cascade
    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json({ message: "User deleted successfully" }, { status: 200 })
  } catch (error) {
    // Log l'erreur et renvoie un message d'erreur générique
    console.error("Delete user error:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}

