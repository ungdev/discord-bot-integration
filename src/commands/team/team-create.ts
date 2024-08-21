import {db} from "../../database/db";
import {teamSchema} from "../../schemas/team.schema";
import {eq} from "drizzle-orm";
import {createError} from "../utils/error-embed";

/*
créer deux catégorie "Passé" et "Futur"
créer tous les chans d'équipe dans leur catégorie respective (c'est en db)
créer un rôle par équipe qui a accès au chanel
récupérer la liste des membres
leur attribuer le rôle correspondant en fonction de leur permission en db (Student avec teamId == CE, NewStudent == nouveau)
 */

export async function create(interaction) {

}