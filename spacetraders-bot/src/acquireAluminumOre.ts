// acquireAluminumOre.ts
// Ce script acquiert de l'ALUMINUM_ORE (par minage ou achat)

import dotenv from 'dotenv';
import axios, { AxiosError } from 'axios';

dotenv.config();

const API_URL: string = 'https://api.spacetraders.io/v2';
const TOKEN: string | undefined = process.env.SPACETRADERS_TOKEN;

interface NavigationResponse {
  data: {
    nav: {
      route: {
        arrival: string;
      }
    }
  }
}

interface ExtractionResponse {
  data: {
    extraction: {
      yield: {
        symbol: string;
        units: number;
      }
    },
    cooldown: {
      remainingSeconds: number;
    }
  }
}

interface MarketResponse {
  data: {
    tradeGoods: Array<{
      symbol: string;
      type: string;
      // Autres propriétés de trade goods...
    }>
  }
}

interface PurchaseResponse {
  data: {
    transaction: {
      totalPrice: number;
    }
  }
}

// Option 1: Extraire de l'aluminium (si votre vaisseau a un équipement de minage)
/**
 * Mines aluminum ore from a specified asteroid waypoint using a given ship.
 * 
 * @param {string} shipSymbol - The symbol representing the ship to be used for mining.
 * @param {string} asteroidWaypointSymbol - The symbol representing the asteroid waypoint where the mining will take place.
 * @returns {Promise<number>} - A promise that resolves to the total amount of aluminum ore collected.
 * 
 * @throws {AxiosError} - Throws an error if the mining process fails.
 * 
 * @example
 * ```typescript
 * const aluminumOre = await mineAluminumOre('SHIP123', 'ASTEROID456');
 * console.log(`Total aluminum ore collected: ${aluminumOre}`);
 * ```
 */
async function mineAluminumOre(shipSymbol: string, asteroidWaypointSymbol: string): Promise<number> {
  try {
    // Naviguer vers l'astéroïde
    await navigateToWaypoint(shipSymbol, asteroidWaypointSymbol);
    
    // Vérifier que le vaisseau est en orbite
    await orbitShip(shipSymbol);
    
    // Commencer l'extraction
    console.log(`Début de l'extraction sur ${asteroidWaypointSymbol}`);
    
    let aluminumCollected: number = 0;
    while (aluminumCollected < 61) {
      const extractionResult = await axios.post<ExtractionResponse>(
        `${API_URL}/my/ships/${shipSymbol}/extract`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TOKEN}`
          }
        }
      );
      
      const yield_ = extractionResult.data.data.extraction.yield;
      if (yield_.symbol === 'ALUMINUM_ORE') {
        aluminumCollected += yield_.units;
        console.log(`Extrait ${yield_.units} unités d'ALUMINUM_ORE. Total: ${aluminumCollected}/61`);
      } else {
        console.log(`Extrait ${yield_.units} unités de ${yield_.symbol} (pas de l'aluminium)`);
      }
      
      // Attendre le délai de cooldown avant de continuer
      const cooldown = extractionResult.data.data.cooldown.remainingSeconds;
      console.log(`Attente de ${cooldown} secondes avant la prochaine extraction...`);
      await new Promise(resolve => setTimeout(resolve, cooldown * 1000));
    }
    
    return aluminumCollected;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Erreur lors de l\'extraction:', 
      axiosError.response ? axiosError.response.data : axiosError.message);
    throw error;
  }
}

// Option 2: Acheter de l'aluminium (si disponible sur un marché)
async function purchaseAluminumOre(shipSymbol: string, marketWaypointSymbol: string): Promise<number> {
  try {
    // Naviguer vers le marché
    await navigateToWaypoint(shipSymbol, marketWaypointSymbol);
    
    // Amarrer le vaisseau
    await dockShip(shipSymbol);
    
    // Vérifier la disponibilité et le prix
    const systemSymbol = `${marketWaypointSymbol.split('-')[0]}-${marketWaypointSymbol.split('-')[1]}`;
    const marketData = await axios.get<MarketResponse>(
      `${API_URL}/systems/${systemSymbol}/waypoints/${marketWaypointSymbol}/market`,
      {
        headers: {
          'Authorization': `Bearer ${TOKEN}`
        }
      }
    );
    
    const aluminumTrade = marketData.data.data.tradeGoods.find(good => good.symbol === 'ALUMINUM_ORE');
    if (!aluminumTrade || aluminumTrade.type !== 'EXPORT') {
      console.log(`ALUMINUM_ORE n'est pas disponible à l'achat sur ce marché.`);
      return 0;
    }
    
    // Acheter l'aluminium
    const purchaseResponse = await axios.post<PurchaseResponse>(
      `${API_URL}/my/ships/${shipSymbol}/purchase`,
      {
        symbol: 'ALUMINUM_ORE',
        units: 61
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TOKEN}`
        }
      }
    );
    
    console.log(`Acheté 61 unités d'ALUMINUM_ORE pour ${purchaseResponse.data.data.transaction.totalPrice} crédits`);
    return 61;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Erreur lors de l\'achat:', 
      axiosError.response ? axiosError.response.data : axiosError.message);
    throw error;
  }
}

// Fonctions d'aide pour la navigation
async function navigateToWaypoint(shipSymbol: string, waypointSymbol: string): Promise<any> {
  try {
    const response = await axios.post<NavigationResponse>(
      `${API_URL}/my/ships/${shipSymbol}/navigate`,
      {
        waypointSymbol: waypointSymbol
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TOKEN}`
        }
      }
    );
    
    const nav = response.data.data.nav;
    console.log(`Navigation vers ${waypointSymbol}. Arrivée prévue: ${nav.route.arrival}`);
    
    // Attendre jusqu'à l'arrivée
    const arrivalTime = new Date(nav.route.arrival).getTime();
    const now = new Date().getTime();
    const waitTime = Math.max(0, arrivalTime - now);
    
    if (waitTime > 0) {
      console.log(`Attente de ${Math.ceil(waitTime / 1000)} secondes pour l'arrivée...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Erreur lors de la navigation:', 
      axiosError.response ? axiosError.response.data : axiosError.message);
    throw error;
  }
}

async function orbitShip(shipSymbol: string): Promise<void> {
  try {
    await axios.post(
      `${API_URL}/my/ships/${shipSymbol}/orbit`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TOKEN}`
        }
      }
    );
    console.log(`Vaisseau ${shipSymbol} mis en orbite`);
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Erreur lors de la mise en orbite:', 
      axiosError.response ? axiosError.response.data : axiosError.message);
    throw error;
  }
}

async function dockShip(shipSymbol: string): Promise<void> {
  try {
    await axios.post(
      `${API_URL}/my/ships/${shipSymbol}/dock`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TOKEN}`
        }
      }
    );
    console.log(`Vaisseau ${shipSymbol} amarré`);
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Erreur lors de l\'amarrage:', 
      axiosError.response ? axiosError.response.data : axiosError.message);
    throw error;
  }
}


const shipSymbol: string = 'VOTRE_VAISSEAU_SYMBOL';
const asteroidWaypointSymbol: string = 'ASTEROID_WAYPOINT_SYMBOL'; // Si miné
const marketWaypointSymbol: string = 'MARKET_WAYPOINT_SYMBOL'; // Si acheté

// Choisissez l'une de ces méthodes selon votre stratégie
mineAluminumOre(shipSymbol, asteroidWaypointSymbol)
   .then(amount => console.log(`Total collecté: ${amount} unités`))
   .catch(err => console.error('Échec du minage:', err));