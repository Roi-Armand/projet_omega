import { type NextRequest, NextResponse } from "next/server"

// Route API pour la documentation de l'API
// Méthode GET: /api/docs
// Non protégée: Accessible sans authentification pour référence
export async function GET(req: NextRequest) {
  // Objet contenant la documentation complète de l'API
  const apiDocs = {
    // Informations générales sur l'API
    title: "API Documentation - Plateforme d'Anniversaire",
    version: "1.0.0",
    description: "Documentation de l'API pour la plateforme d'anniversaire",
    baseUrl: "/api",

    // Liste détaillée de tous les endpoints disponibles
    endpoints: [
      // Endpoints d'authentification
      {
        path: "/auth/register",
        method: "POST",
        description: "Inscription d'un nouvel utilisateur",
        body: {
          email: "string",
          name: "string",
          password: "string",
        },
        responses: {
          201: "Utilisateur enregistré avec succès",
          400: "Email déjà utilisé",
          500: "Erreur serveur",
        },
      },
      {
        path: "/auth/verify",
        method: "POST",
        description: "Vérification du compte utilisateur",
        body: {
          email: "string",
          verificationCode: "string",
        },
        responses: {
          200: "Compte vérifié avec succès",
          400: "Code de vérification invalide",
          404: "Utilisateur non trouvé",
          500: "Erreur serveur",
        },
      },
      {
        path: "/auth/login",
        method: "POST",
        description: "Connexion utilisateur",
        body: {
          email: "string",
          password: "string",
        },
        responses: {
          200: "Connexion réussie",
          401: "Identifiants invalides",
          403: "Compte non vérifié",
          500: "Erreur serveur",
        },
      },

      // Endpoints de gestion des utilisateurs
      {
        path: "/users",
        method: "GET",
        description: "Récupération de tous les utilisateurs",
        auth: "Bearer token",
        roles: ["ADMIN", "ORGANIZER"],
        responses: {
          200: "Liste des utilisateurs",
          401: "Non authentifié",
          403: "Non autorisé",
          500: "Erreur serveur",
        },
      },
      {
        path: "/users/:id",
        method: "GET",
        description: "Récupération d'un utilisateur par ID",
        auth: "Bearer token",
        responses: {
          200: "Détails de l'utilisateur",
          401: "Non authentifié",
          404: "Utilisateur non trouvé",
          500: "Erreur serveur",
        },
      },
      {
        path: "/users/:id",
        method: "PUT",
        description: "Mise à jour d'un utilisateur",
        auth: "Bearer token",
        roles: ["ADMIN"],
        body: {
          name: "string (optional)",
          email: "string (optional)",
          role: "string (optional)",
          password: "string (optional)",
        },
        responses: {
          200: "Utilisateur mis à jour",
          401: "Non authentifié",
          403: "Non autorisé",
          404: "Utilisateur non trouvé",
          500: "Erreur serveur",
        },
      },
      {
        path: "/users/:id",
        method: "DELETE",
        description: "Suppression d'un utilisateur",
        auth: "Bearer token",
        roles: ["ADMIN"],
        responses: {
          200: "Utilisateur supprimé",
          401: "Non authentifié",
          403: "Non autorisé",
          404: "Utilisateur non trouvé",
          500: "Erreur serveur",
        },
      },

      // Endpoints de gestion des événements
      {
        path: "/events",
        method: "GET",
        description: "Récupération de tous les événements",
        auth: "Bearer token",
        responses: {
          200: "Liste des événements",
          401: "Non authentifié",
          500: "Erreur serveur",
        },
      },
      {
        path: "/events",
        method: "POST",
        description: "Création d'un nouvel événement",
        auth: "Bearer token",
        roles: ["ADMIN", "ORGANIZER"],
        body: {
          title: "string",
          description: "string (optional)",
          date: "string (ISO date)",
          location: "string (optional)",
        },
        responses: {
          201: "Événement créé",
          401: "Non authentifié",
          403: "Non autorisé",
          500: "Erreur serveur",
        },
      },
      {
        path: "/events/:id",
        method: "GET",
        description: "Récupération d'un événement par ID",
        auth: "Bearer token",
        responses: {
          200: "Détails de l'événement",
          401: "Non authentifié",
          404: "Événement non trouvé",
          500: "Erreur serveur",
        },
      },
      {
        path: "/events/:id",
        method: "PUT",
        description: "Mise à jour d'un événement",
        auth: "Bearer token",
        body: {
          title: "string (optional)",
          description: "string (optional)",
          date: "string (ISO date) (optional)",
          location: "string (optional)",
        },
        responses: {
          200: "Événement mis à jour",
          401: "Non authentifié",
          403: "Non autorisé",
          404: "Événement non trouvé",
          500: "Erreur serveur",
        },
      },
      {
        path: "/events/:id",
        method: "DELETE",
        description: "Suppression d'un événement",
        auth: "Bearer token",
        responses: {
          200: "Événement supprimé",
          401: "Non authentifié",
          403: "Non autorisé",
          404: "Événement non trouvé",
          500: "Erreur serveur",
        },
      },

      // Endpoints de gestion des participants
      {
        path: "/events/:id/participants",
        method: "POST",
        description: "Ajout d'un participant à un événement",
        auth: "Bearer token",
        roles: ["ADMIN", "ORGANIZER"],
        body: {
          userId: "string",
          status: "string (optional: PENDING, CONFIRMED, DECLINED)",
        },
        responses: {
          201: "Participant ajouté",
          400: "Participant déjà ajouté",
          401: "Non authentifié",
          403: "Non autorisé",
          404: "Événement ou utilisateur non trouvé",
          500: "Erreur serveur",
        },
      },
      {
        path: "/events/:id/participants/:userId",
        method: "PUT",
        description: "Mise à jour du statut d'un participant",
        auth: "Bearer token",
        roles: ["ADMIN", "ORGANIZER"],
        body: {
          status: "string (PENDING, CONFIRMED, DECLINED)",
        },
        responses: {
          200: "Statut mis à jour",
          401: "Non authentifié",
          403: "Non autorisé",
          404: "Participant non trouvé",
          500: "Erreur serveur",
        },
      },
      {
        path: "/events/:id/participants/:userId",
        method: "DELETE",
        description: "Suppression d'un participant",
        auth: "Bearer token",
        roles: ["ADMIN", "ORGANIZER"],
        responses: {
          200: "Participant supprimé",
          401: "Non authentifié",
          403: "Non autorisé",
          404: "Participant non trouvé",
          500: "Erreur serveur",
        },
      },
      {
        path: "/seed",
        method: "GET",
        description: "Initialisation de la base de données avec un utilisateur admin",
        responses: {
          200: "Base de données initialisée",
          500: "Erreur serveur",
        },
      },
    ],
  }

  return NextResponse.json(apiDocs, { status: 200 })
}

