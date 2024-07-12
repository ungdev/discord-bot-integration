import { db } from "./db"
import { eventSchema } from "../schemas/event.schema"
import { roleSchema } from "../schemas/role.schema"

export const init = async () => {
    initEvent()
    initRole()
}

const initEvent = async () => {
    try {
        for (const event of events) {
            await db.insert(eventSchema).values(event);
        }
    } catch (e) {
        console.error('event already in the DB')
    }
}

const initRole = async () => {
    try {
        for (const role of roles) {
            await db.insert(roleSchema).values(role);
        }
    } catch (e) {
        console.error('role already in the DB')
    }
}

const events = [
    { name: "PreInscription", state: false },
    { name: "ShotgunCE", state: false },
    { name: "ShotgunPerm", state: false },
    { name: "Barbecue", state: false }
];

const roles = [
    { name: "Animation", description: "Animer, divertir et motiver les CE et les nouveaux étudiants tout au long de la pré-inté et de l’inté. Et pourquoi on est là ??" },
    { name: "Bouffe", description: "Prévoir, organiser et coordonner tous les repas de l’inté. La bouffe c’est sacré !" },
    { name: "Cahier de vacances", description: "Élaborer le futur cahier de vacances des nouveaux avec des petits exercices et blagues pour les motiver pendant l’été." },
    { name: "Communication & Graphisme", description: "Préparer et gérer toute la communication relative à l’intégration (stratégie, réseaux sociaux, plans de com, affiches, etc). Créer une charte une charte graphique liée au thème." },
    { name: "Déco", description: "Être créatif et fabriquer de quoi décorer l’UTT au thème de l’inté." },
    { name: "Défis TC", description: "Préparer un défi d’une aprèm où les nouveaux TC devront faire preuve d’ingéniosité pour fabriquer quelque chose à partir de peu (carton, marshmallow...)." },
    { name: "Dev / Info", description: "Maintenir le site et l’application de l’inté et développer de nouveaux outils informatiques" },
    { name: "Faux amphi", description: "Créer un faux premier cours compliqué pour les TC avec des professeurs et des faux élèves durant la première semaine." },
    { name: "Faux discours de rentrée", description: "Préparer et faire un discours de rentrée pour faire une petite frayeur aux nouveaux." },
    { name: "Logistique", description: "Préparer, organiser et mettre en place tout le matériel nécessaire avant et pendant la semaine d’intégration." },
    { name: "Médiatik", description: "Couvrir l’ensemble des événements de l’intégration, prendre des photos, et monter des films pour laisser à tout le monde de beaux souvenirs." },
    { name: "Parrainage", description: "Attribuer des parrains/marraines aux nouveaux étudiants de manière personnalisée." },
    { name: "Partenariat", description: "Rechercher et établir des partenariats utiles pour l'intégration et pour les nouveaux étudiants" },
    { name: "Prévention", description: "Évaluer les risques et mettre en place des mesures préventives pour les orgas, CE et nouveaux avant et pendant l’intégration." },
    { name: "Rallye", description: "Organiser une aprèm de folie pour les nouveaux avec pleins de jeux, d’activités sportives et autres idées que vous avez !" },
    { name: "Respo CE", description: "Gérer l’ensemble du planning des CE (shotgun, perms, planning...) et leur donner les grandes lignes directrices pour qu’ils accueillent au mieux les nouveaux. Tu es moteur indispensable à l’animation de l’inté !!!!" },
    { name: "Sécu", description: "Gérer la sécurité des évènements notamment durant le WEI et la soirée d’inté." },
    { name: "Soirée d'intégration", description: "Préparer et organiser une soirée sur le campus de l’UTT durant la semaine d’inté (organisation des boissons, de la nourriture, du vestiaire, de la sécurité, des animations, etc). Vous serez en relation avec les professionnels de la sécurité pour encadrer l’événement." },
    { name: "Son et lumière", description: "Prévoir, installer et gérer les éléments de S&L durant les événements qui le nécessitent (soirée d’inté, WEI, espace chill, etc)." },
    { name: "Soutenabilité", description: "Mettre en place des actions pour réduire l’impact environnemental de l’inté en étant formé : amélioration des commissions, bilan carbone, ateliers de sensibilisation, ..." },
    { name: "Traduction en anglais", description: "Participer à la traduction des contenus publiés par l’intégration en anglais (à destination des étudiants étrangers qui participeront également à cette semaine d’inté)." },
    { name: "Village Asso", description: "Organiser une aprèm en collaboration avec des associations UTTiennes afin de les présenter à travers de petites activités et coordonner l’évènement le jour J." },
    { name: "Visites", description: "Organiser les visites du samedi aprèm avant l'inté et celles pendant la première semaine pour les TC et les branches." },
    { name: "WEI", description: "Organiser le Week-end d’intégration (transport, animation, logistique, soirée, boissons) en coordonnant avec les différentes commissions de l’inté : log, bouffe, S&L, anim..." }
];
