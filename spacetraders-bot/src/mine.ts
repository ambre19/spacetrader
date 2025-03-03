import axios from "axios";

const API_URL = "https://api.spacetraders.io/v2";
const TOKEN = "TON_JETON_ICI"; // Remplace par ton jeton d'authentification
const SHIP_SYMBOL = "JUDGE-X1"; // Ton vaisseau de minage
const MINING_LOCATION = "X1-Q87-B8"; // Astéroïde minier
const MARKETPLACE = "X1-Q87-B6"; // Station pour vendre les ressources

// Configuration Axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    "Content-Type": "application/json",
  },
});

// Vérifie si le vaisseau peut miner
async function checkMiningCapability() {
  const { data } = await api.get(`/my/ships/${SHIP_SYMBOL}`);
  const ship = data.data;

  const hasMiningLaser = ship.modules.some((mod: any) =>
    mod.name.toLowerCase().includes("mining")
  );

  if (!hasMiningLaser) {
    throw new Error("🚨 Ce vaisseau ne possède pas de laser de minage !");
  }

  console.log("✅ Le vaisseau peut miner.");
}

// Déplace le vaisseau
async function navigateTo(location: string) {
  console.log(`🛸 Navigation vers ${location}...`);
  await api.post(`/my/ships/${SHIP_SYMBOL}/navigate`, { waypointSymbol: location });
  console.log(`✅ Arrivé à ${location}`);
}

// Minage
async function mine() {
  console.log("⛏️ Minage en cours...");
  const { data } = await api.post(`/my/ships/${SHIP_SYMBOL}/extract`);
  console.log(`✅ Minage réussi : ${JSON.stringify(data)}`);
}

// Vérifie si le cargo est plein
async function isCargoFull() {
  const { data } = await api.get(`/my/ships/${SHIP_SYMBOL}`);
  const cargo = data.data.cargo;
  return cargo.units >= cargo.capacity;
}

// Vend les ressources
async function sellCargo() {
  console.log("💰 Vente des ressources...");
  const { data } = await api.post(`/my/ships/${SHIP_SYMBOL}/sell`, {
    goodSymbol: "MINERAL_ORE", // Remplace par la ressource extraite
    units: 10, // Mettre la quantité maximale possible
  });
  console.log(`✅ Vente terminée : ${JSON.stringify(data)}`);
}

// Boucle principale du minage
/**
 * Executes the mining loop which involves checking mining capability,
 * navigating to the mining location, mining resources, and handling
 * full cargo by selling it at the marketplace.
 *
 * The loop continues indefinitely until an error occurs.
 *
 * @async
 * @function miningLoop
 * @throws Will throw an error if any of the asynchronous operations fail.
 */
/**
 * The `miningLoop` function is an asynchronous loop that handles the mining process.
 * It first checks if the mining capability is available, then navigates to the mining location.
 * Once at the mining location, it continuously mines resources until the cargo is full.
 * When the cargo is full, it navigates to the marketplace to sell the cargo and then returns to the mining location.
 * If any error occurs during the process, it logs the error message to the console.
 *
 * @throws Will throw an error if any of the asynchronous operations fail.
 */
async function miningLoop() {
  try {
    await checkMiningCapability();
    await navigateTo(MINING_LOCATION);
    
    while (true) {
      await mine();

      if (await isCargoFull()) {
        console.log("🚀 Cargo plein, retour à la station...");
        await navigateTo(MARKETPLACE);
        await sellCargo();
        await navigateTo(MINING_LOCATION);
      }
    }
  } catch (error) {
    console.error("❌ Erreur :", error.message);
  }
}

// Exécute le script
miningLoop();
