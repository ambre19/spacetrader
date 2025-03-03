// deliverMission.ts
// Ce script livre l'ALUMINUM_ORE à la destination de la mission

import dotenv from 'dotenv';
import axios, { AxiosError } from 'axios';

dotenv.config();

const API_URL: string = 'https://api.spacetraders.io/v2';
const TOKEN: string | undefined = process.env.SPACETRADERS_TOKEN;

interface DeliveryResponse {
  data: {
    mission: {
      id: string;
      fulfilled: boolean;
      // Autres propriétés de mission...
    }
  }
}

async function deliverAluminumOre(): Promise<DeliveryResponse> {
  const shipSymbol: string = 'VOTRE_VAISSEAU_SYMBOL'; // Remplacez par le symbole de votre vaisseau
  const missionId: string = 'cm7swf3u2267xvt0j4u1071a6';
  const destinationSymbol: string = 'X1-Q87-H51'; // Destination de la mission
  
  try {
    // 1. Naviguer vers la destination
    await navigateToWaypoint(shipSymbol, destinationSymbol);
    
    // 2. Amarrer le vaisseau
    await dockShip(shipSymbol);
    
    // 3. Livrer le minerai d'aluminium
    const deliveryResponse = await axios.post<DeliveryResponse>(
      `${API_URL}/missions/${missionId}/fulfill`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TOKEN}`
        }
      }
    );
    
    console.log('Mission accomplie avec succès!');
    console.log(JSON.stringify(deliveryResponse.data, null, 2));
    return deliveryResponse.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Erreur lors de la livraison:', 
      axiosError.response ? axiosError.response.data : axiosError.message);
    throw error;
  }
}

// Fonctions d'aide pour la navigation
async function navigateToWaypoint(shipSymbol: string, waypointSymbol: string): Promise<any> {
  try {
    const response = await axios.post(
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

// Exécuter la fonction
deliverAluminumOre()
  .then(() => console.log('Terminé'))
  .catch(err => console.error('Échec:', err));