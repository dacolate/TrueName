const frenchAuthErrors: Record<string, string> = {
  FAILED_TO_CREATE_USER: "Échec de la création de l'utilisateur.",
  USER_ALREADY_EXISTS: "Cet utilisateur existe déjà.",
  YOU_CANNOT_BAN_YOURSELF: "Vous ne pouvez pas vous bannir vous-même.",
  YOU_ARE_NOT_ALLOWED_TO_CHANGE_USERS_ROLE:
    "Vous n'êtes pas autorisé à modifier le rôle des utilisateurs.",
  YOU_ARE_NOT_ALLOWED_TO_CREATE_USERS:
    "Vous n'êtes pas autorisé à créer des utilisateurs.",
  YOU_ARE_NOT_ALLOWED_TO_LIST_USERS:
    "Vous n'êtes pas autorisé à lister les utilisateurs.",
  YOU_ARE_NOT_ALLOWED_TO_LIST_USERS_SESSIONS:
    "Vous n'êtes pas autorisé à voir les sessions des utilisateurs.",
  YOU_ARE_NOT_ALLOWED_TO_BAN_USERS:
    "Vous n'êtes pas autorisé à bannir des utilisateurs.",
  YOU_ARE_NOT_ALLOWED_TO_IMPERSONATE_USERS:
    "Vous n'êtes pas autorisé à vous connecter en tant qu'utilisateur.",
  YOU_ARE_NOT_ALLOWED_TO_REVOKE_USERS_SESSIONS:
    "Vous n'êtes pas autorisé à révoquer les sessions des utilisateurs.",
  YOU_ARE_NOT_ALLOWED_TO_DELETE_USERS:
    "Vous n'êtes pas autorisé à supprimer des utilisateurs.",
  YOU_ARE_NOT_ALLOWED_TO_SET_USERS_PASSWORD:
    "Vous n'êtes pas autorisé à définir le mot de passe de l'utilisateur.",
  BANNED_USER: "Vous avez été banni de cette application.",
  USER_NOT_FOUND: "Utilisateur non trouvé.",
  FAILED_TO_CREATE_SESSION: "Échec de la création de session.",
  FAILED_TO_UPDATE_USER: "Échec de la mise à jour de l'utilisateur.",
  FAILED_TO_GET_SESSION: "Impossible de récupérer la session.",
  INVALID_PASSWORD: "Mot de passe invalide.",
  INVALID_EMAIL: "Adresse email invalide.",
  INVALID_EMAIL_OR_PASSWORD: "Adresse email ou mot de passe incorrect.",
  SOCIAL_ACCOUNT_ALREADY_LINKED: "Ce compte social est déjà lié.",
  PROVIDER_NOT_FOUND: "Fournisseur non trouvé.",
  INVALID_TOKEN: "Jeton invalide.",
  ID_TOKEN_NOT_SUPPORTED: "Le jeton ID n'est pas supporté.",
  FAILED_TO_GET_USER_INFO:
    "Impossible de récupérer les informations de l'utilisateur.",
  USER_EMAIL_NOT_FOUND: "Adresse email de l'utilisateur introuvable.",
  EMAIL_NOT_VERIFIED: "L'adresse email n'est pas vérifiée.",
  PASSWORD_TOO_SHORT: "Le mot de passe est trop court.",
  PASSWORD_TOO_LONG: "Le mot de passe est trop long.",
  EMAIL_CAN_NOT_BE_UPDATED: "L'adresse email ne peut pas être modifiée.",
  CREDENTIAL_ACCOUNT_NOT_FOUND: "Compte d'identifiants introuvable.",
  SESSION_EXPIRED: "Session expirée. Veuillez vous reconnecter.",
  FAILED_TO_UNLINK_LAST_ACCOUNT: "Impossible de délier le dernier compte.",
  ACCOUNT_NOT_FOUND: "Compte introuvable.",
  USER_ALREADY_HAS_PASSWORD:
    "L'utilisateur a déjà un mot de passe. Fournissez-le pour supprimer le compte.",
};

export function translateAuthError({
  error,
  message,
}: {
  error?: Error;
  message?: string;
}): string {
  const defaultMessage = "Une erreur est survenue. Veuillez réessayer.";

  if (!error || typeof error !== "object") {
    if (message) {
      return frenchAuthErrors[message] || defaultMessage;
    }
    return defaultMessage;
  }

  const code = error.message;

  return frenchAuthErrors[code] || defaultMessage;
}
