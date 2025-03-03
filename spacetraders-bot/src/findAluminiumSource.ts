import dotenv from 'dotenv';
import axios, { AxiosError } from 'axios';

dotenv.config();

const API_URL: string = 'https://api.spacetraders.io/v2';
const TOKEN: string | undefined = process.env.SPACE_TRADERS_TOKEN;

interface Ship {
  symbol: string;
  nav: {
    systemSymbol: string;
    waypointSymbol: string;
    status: string;
  }
}

interface Waypoint {
  symbol: string;
  type: string;
  systemSymbol: string;
  x: number;
  y: number;
  // Autres propriétés du waypoint...
}

interface ShipsResponse {
  data: Ship[];
}

interface ScanResponse {
  data: {
    waypoints: Waypoint[];
  }
}

async function getMyShips(): Promise<Ship[]> {
  try {
    const response = await axios.get<ShipsResponse>(
      `${API_URL}/my/ships`,
      {
        headers: {
          'Authorization': `Bearer ${TOKEN}`
        }
      }
    );
    
    return response.data.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Erreur lors de la récupération des vaisseaux:', 
      axiosError.response ? axiosError.response.data : axiosError.message);
    throw error;
  }
}

async function scanWaypoints(shipSymbol: string, systemSymbol: string): Promise<Waypoint[]> {
  try {
    const response = await axios.post<ScanResponse>(
      `${API_URL}/my/ships/${shipSymbol}/scan/waypoints`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TOKEN}`
        }
      }
    );
    
    const waypoints = response.data.data.waypoints;
    return waypoints.filter(wp => ['ASTEROID_FIELD', 'MARKETPLACE'].includes(wp.type));
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Erreur lors du scan des waypoints:', 
      axiosError.response ? axiosError.response.data : axiosError.message);
    throw error;
  }
}

/**
 * Finds potential aluminum sources by scanning nearby waypoints using the first available ship.
 * 
 * @returns {Promise<{ship: Ship, potentialSources: Waypoint[]} | void>} An object containing the ship and potential sources of aluminum ore, or void if no ships are available.
 * @throws Will log an error message if there is an issue during the process.
 */
async function findAluminumSources(): Promise<{ship: Ship, potentialSources: Waypoint[]} | void> {
  try {
    // 1. Obtenir tous les vaisseaux
    const ships = await getMyShips();
    if (ships.length === 0) {
      console.log('Vous n\'avez pas de vaisseaux disponibles.');
      return;
    }
    
    const ship = ships[0]; // Utiliser le premier vaisseau
    console.log(`Utilisation du vaisseau: ${ship.symbol} dans le système ${ship.nav.systemSymbol}`);
    
    // 2. Scanner les waypoints proches
    const potentialSources = await scanWaypoints(ship.symbol, ship.nav.systemSymbol);
    
    console.log('Sources potentielles pour ALUMINUM_ORE:');
    console.log(potentialSources);
    
    return {
      ship,
      potentialSources
    };
  } catch (error) {
    console.error('Erreur lors de la recherche de sources d\'aluminium:', error);
  }
}

// Exécuter la fonction
findAluminumSources()
  .then(() => console.log('Terminé'))
  .catch(err => console.error('Échec:', err));