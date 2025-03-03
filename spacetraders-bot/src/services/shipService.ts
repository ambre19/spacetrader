import { api } from "../api/apiClients";

export async function getAvailableShip(): Promise<string | null> {
    console.log("🔍 Recherche d'un vaisseau disponible...");

    try {
        const { data } = await api.get("/my/ships");

        const availableShips = data.data.filter((ship: any) => 
            (ship.nav.status === "DOCKED" || ship.nav.status === "IN_ORBIT") &&
            ship.fuel.current > 0 &&
            ship.cargo.capacity > ship.cargo.units &&
            ship.cooldown.remainingSeconds === 0 &&
            ship.crew.current >= ship.crew.required
        );

        if (availableShips.length === 0) {
            console.log("❌ Aucun vaisseau disponible !");
            return null;
        }

        console.log(`✅ Vaisseau disponible : ${availableShips[0].symbol}`);
        return availableShips[0].symbol;
    } catch (error) {
        console.error("❌ Erreur lors de la récupération des vaisseaux :", error);
        return null;
    }
}
