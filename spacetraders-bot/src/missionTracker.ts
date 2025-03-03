// missionTracker.ts
// Ce script suit l'état de votre mission

import dotenv from 'dotenv';
import axios, { AxiosError } from 'axios';

dotenv.config();

const API_URL: string = 'https://api.spacetraders.io/v2';
const TOKEN: string | undefined = process.env.SPACETRADERS_TOKEN;
const MISSION_ID: string = 'cm7swf3u2267xvt0j4u1071a6';

interface DeliveryItem {
  tradeSymbol: string;
  destinationSymbol: string;
  unitsRequired: number;
  unitsFulfilled: number;
}

interface Mission {
  id: string;
  factionSymbol: string;
  type: string;
  accepted: boolean;
  fulfilled: boolean;
  terms: {
    deadline: string;
    payment: {
      onAccepted: number;
      onFulfilled: number;
    };
    deliver: DeliveryItem[];
  };
}

interface MissionResponse {
  data: Mission;
}

async function checkMissionStatus(): Promise<Mission> {
  try {
    const response = await axios.get<MissionResponse>(
      `${API_URL}/missions/${MISSION_ID}`,
      {
        headers: {
          'Authorization': `Bearer ${TOKEN}`
        }
      }
    );
    
    const mission = response.data.data;
    console.log('=== État de la mission ===');
    console.log(`ID: ${mission.id}`);
    console.log(`Faction: ${mission.factionSymbol}`);
    console.log(`Type: ${mission.type}`);
    console.log(`Acceptée: ${mission.accepted ? 'Oui' : 'Non'}`);
    console.log(`Accomplie: ${mission.fulfilled ? 'Oui' : 'Non'}`);
    console.log(`Date limite: ${mission.terms.deadline}`);
    
    // Afficher les détails de livraison
    mission.terms.deliver.forEach(item => {
      console.log('\nDétails de livraison:');
      console.log(`Produit: ${item.tradeSymbol}`);
      console.log(`Destination: ${item.destinationSymbol}`);
      console.log(`Unités requises: ${item.unitsRequired}`);
      console.log(`Unités livrées: ${item.unitsFulfilled}`);
      console.log(`Progression: ${Math.round((item.unitsFulfilled / item.unitsRequired) * 100)}%`);
    });
    
    // Paiements
    console.log('\nPaiements:');
    console.log(`À l'acceptation: ${mission.terms.payment.onAccepted} crédits`);
    console.log(`À l'accomplissement: ${mission.terms.payment.onFulfilled} crédits`);
    
    return mission;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Erreur lors de la vérification de l\'état de la mission:', 
      axiosError.response ? axiosError.response.data : axiosError.message);
    throw error;
  }
}

// Exécuter la fonction
checkMissionStatus()
  .then(() => console.log('\nVérification terminée'))
  .catch(err => console.error('Échec:', err));