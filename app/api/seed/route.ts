import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { hashPassword } from "../services/auth.service"
import { Role } from "@prisma/client"

// Route API pour initialiser la base de données avec un utilisateur administrateur
// Méthode GET: /api/seed
// Non protégée: Accessible sans authentification pour la configuration initiale
export async function GET(req: NextRequest) {
  try {
    // Vérifie si un administrateur existe déjà
    const adminExists = await prisma.user.findFirst({
      where: { role: Role.ADMIN },
    })

    // Si un admin existe déjà, renvoie un message d'information
    if (adminExists) {
      return NextResponse.json({ message: "Admin user already exists" }, { status: 200 })
    }

    // Crée un utilisateur administrateur par défaut
    // Note: Dans un environnement de production, il faudrait utiliser un mot de passe plus sécurisé
    const hashedPassword = await hashPassword("admin123")
    const admin = await prisma.user.create({
      data: {
        email: "admin@example.com",
        name: "Admin",
        password: hashedPassword,
        role: Role.ADMIN,
        isVerified: true, // L'admin est vérifié par défaut
      },
    })

    // Renvoie un message de succès avec les détails de l'admin créé
    return NextResponse.json({ message: "Database seeded successfully", admin }, { status: 200 })
  } catch (error) {
    // Log l'erreur et renvoie un message d'erreur générique
    console.error("Seed error:", error)
    return NextResponse.json({ error: "Failed to seed database" }, { status: 500 })
  }
}

