import { PrismaClient } from "@prisma/client"

// Ce fichier crée et exporte une instance unique de PrismaClient
// pour éviter de créer plusieurs connexions à la base de données

// En développement, PrismaClient est attaché à l'objet global
// pour éviter d'épuiser la limite de connexions à la base de données
// lors des rechargements à chaud (hot reloading)
const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Utilise l'instance existante ou crée une nouvelle instance
export const prisma = globalForPrisma.prisma || new PrismaClient()

// En développement, conserve l'instance dans l'objet global
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

export default prisma

