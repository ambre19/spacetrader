import { getAvailableShip } from "./services/shipService";

async function main() {
    const shipSymbol = await getAvailableShip();
    if (!shipSymbol) {
        console.error("Aucun vaisseau disponible. Réessaye plus tard.");
        return;
    }

    console.log(`🚀 Prêt à envoyer le vaisseau ${shipSymbol} en mission !`);
}

main();
