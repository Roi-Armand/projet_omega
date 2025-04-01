import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { ParticipantStatus } from "@prisma/client"

// Ce contrôleur gère les opérations CRUD pour les événements et les participants

/**
 * Crée un nouvel événement
 * @param req - Requête contenant les informations de l'événement
 * @returns Événement créé ou erreur
 */
export const createEvent = async (req: NextRequest): Promise<NextResponse> => {
  try {
    // Extrait les données du corps de la requête
    const body = await req.json()
    const { title, description, date, location } = body
    // Récupère l'utilisateur authentifié depuis la requête (ajouté par le middleware)
    const user = (req as any).user

    // Crée l'événement avec l'utilisateur actuel comme organisateur
    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date), // Convertit la chaîne de date en objet Date
        location,
        organizerId: user.id,
      },
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    // Log l'erreur et renvoie un message d'erreur générique
    console.error("Create event error:", error)
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 })
  }
}

/**
 * Récupère tous les événements avec leurs participants
 * @param req - Requête entrante
 * @returns Liste des événements avec détails des participants
 */
export const getEvents = async (req: NextRequest): Promise<NextResponse> => {
  try {
    // Récupère tous les événements avec leurs participants
    const events = await prisma.event.findMany({
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(events, { status: 200 })
  } catch (error) {
    // Log l'erreur et renvoie un message d'erreur générique
    console.error("Get events error:", error)
    return NextResponse.json({ error: "Failed to get events" }, { status: 500 })
  }
}

/**
 * Récupère un événement par son ID
 * @param req - Requête entr  },
      { status: 500 }
    );
  }
};

/**
 * Récupère un événement par son ID
 * @param req - Requête entrante
 * @param params - Paramètres de route contenant l'ID de l'événement
 * @returns Détails de l'événement avec ses participants ou erreur
 */
export const getEventById = async (req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> => {
  try {
    const { id } = params

    // Récupère l'événement avec ses participants
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    })

    // Vérifie si l'événement existe
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    return NextResponse.json(event, { status: 200 })
  } catch (error) {
    // Log l'erreur et renvoie un message d'erreur générique
    console.error("Get event error:", error)
    return NextResponse.json({ error: "Failed to get event" }, { status: 500 })
  }
}

/**
 * Met à jour un événement existant
 * @param req - Requête contenant les nouvelles informations
 * @param params - Paramètres de route contenant l'ID de l'événement
 * @returns Événement mis à jour ou erreur
 */
export const updateEvent = async (req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> => {
  try {
    const { id } = params
    // Extrait les données du corps de la requête
    const body = await req.json()
    const { title, description, date, location } = body
    // Récupère l'utilisateur authentifié depuis la requête
    const user = (req as any).user

    // Vérifie si l'événement existe
    const existingEvent = await prisma.event.findUnique({
      where: { id },
    })

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Vérifie si l'utilisateur est l'organisateur ou un administrateur
    // Seuls l'organisateur et les administrateurs peuvent modifier l'événement
    if (existingEvent.organizerId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "You are not authorized to update this event" }, { status: 403 })
    }

    // Prépare les données à mettre à jour
    // N'inclut que les champs fournis dans la requête
    const updateData: any = {}
    if (title) updateData.title = title
    if (description) updateData.description = description
    if (date) updateData.date = new Date(date)
    if (location) updateData.location = location

    // Met à jour l'événement
    const updatedEvent = await prisma.event.update({
      where: { id },
      data: updateData,
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(updatedEvent, { status: 200 })
  } catch (error) {
    // Log l'erreur et renvoie un message d'erreur générique
    console.error("Update event error:", error)
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 })
  }
}

/**
 * Supprime un événement
 * @param req - Requête entrante
 * @param params - Paramètres de route contenant l'ID de l'événement
 * @returns Message de succès ou erreur
 */
export const deleteEvent = async (req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> => {
  try {
    const { id } = params
    // Récupère l'utilisateur authentifié depuis la requête
    const user = (req as any).user

    // Vérifie si l'événement existe
    const existingEvent = await prisma.event.findUnique({
      where: { id },
    })

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Vérifie si l'utilisateur est l'organisateur ou un administrateur
    // Seuls l'organisateur et les administrateurs peuvent supprimer l'événement
    if (existingEvent.organizerId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "You are not authorized to delete this event" }, { status: 403 })
    }

    // Supprime l'événement
    // Les participants associés seront également supprimés grâce à la cascade
    await prisma.event.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Event deleted successfully" }, { status: 200 })
  } catch (error) {
    // Log l'erreur et renvoie un message d'erreur générique
    console.error("Delete event error:", error)
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 })
  }
}

/**
 * Ajoute un participant à un événement
 * @param req - Requête contenant l'ID de l'utilisateur et le statut
 * @param params - Paramètres de route contenant l'ID de l'événement
 * @returns Participant ajouté ou erreur
 */
export const addParticipant = async (
  req: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse> => {
  try {
    const { id } = params
    // Extrait les données du corps de la requête
    const body = await req.json()
    // Statut par défaut est PENDING si non spécifié
    const { userId, status = ParticipantStatus.PENDING } = body

    // Vérifie si l'événement existe
    const existingEvent = await prisma.event.findUnique({
      where: { id },
    })

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Vérifie si l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Vérifie si l'utilisateur est déjà participant à cet événement
    const existingParticipant = await prisma.eventParticipant.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId: id,
        },
      },
    })

    if (existingParticipant) {
      return NextResponse.json({ error: "User is already a participant of this event" }, { status: 400 })
    }

    // Ajoute le participant à l'événement
    const participant = await prisma.eventParticipant.create({
      data: {
        userId,
        eventId: id,
        status,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(participant, { status: 201 })
  } catch (error) {
    // Log l'erreur et renvoie un message d'erreur générique
    console.error("Add participant error:", error)
    return NextResponse.json({ error: "Failed to add participant" }, { status: 500 })
  }
}

/**
 * Met à jour le statut d'un participant
 * @param req - Requête contenant le nouveau statut
 * @param params - Paramètres de route contenant l'ID de l'événement et l'ID de l'utilisateur
 * @returns Participant mis à jour ou erreur
 */
export const updateParticipantStatus = async (
  req: NextRequest,
  { params }: { params: { id: string; userId: string } },
): Promise<NextResponse> => {
  try {
    const { id, userId } = params
    // Extrait les données du corps de la requête
    const body = await req.json()
    const { status } = body

    // Vérifie si le participant existe
    const existingParticipant = await prisma.eventParticipant.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId: id,
        },
      },
    })

    if (!existingParticipant) {
      return NextResponse.json({ error: "Participant not found" }, { status: 404 })
    }

    // Met à jour le statut du participant
    const updatedParticipant = await prisma.eventParticipant.update({
      where: {
        userId_eventId: {
          userId,
          eventId: id,
        },
      },
      data: {
        status,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(updatedParticipant, { status: 200 })
  } catch (error) {
    // Log l'erreur et renvoie un message d'erreur générique
    console.error("Update participant status error:", error)
    return NextResponse.json({ error: "Failed to update participant status" }, { status: 500 })
  }
}

/**
 * Supprime un participant d'un événement
 * @param req - Requête entrante
 * @param params - Paramètres de route contenant l'ID de l'événement et l'ID de l'utilisateur
 * @returns Message de succès ou erreur
 */
export const removeParticipant = async (
  req: NextRequest,
  { params }: { params: { id: string; userId: string } },
): Promise<NextResponse> => {
  try {
    const { id, userId } = params

    // Vérifie si le participant existe
    const existingParticipant = await prisma.eventParticipant.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId: id,
        },
      },
    })

    if (!existingParticipant) {
      return NextResponse.json({ error: "Participant not found" }, { status: 404 })
    }

    // Supprime le participant
    await prisma.eventParticipant.delete({
      where: {
        userId_eventId: {
          userId,
          eventId: id,
        },
      },
    })

    return NextResponse.json({ message: "Participant removed successfully" }, { status: 200 })
  } catch (error) {
    // Log l'erreur et renvoie un message d'erreur générique
    console.error("Remove participant error:", error)
    return NextResponse.json({ error: "Failed to remove participant" }, { status: 500 })
  }
}

