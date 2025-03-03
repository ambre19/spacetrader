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

/**
 * Checks the status of a mission by making an API call to retrieve mission details.
 * 
 * @returns {Promise<Mission>} A promise that resolves to the mission details.
 * 
 * @throws {AxiosError} Throws an error if the API call fails.
 * 
 * @example
 * ```typescript
 * checkMissionStatus()
 *   .then(mission => {
 *     console.log('Mission details:', mission);
 *   })
 *   .catch(error => {
 *     console.error('Error checking mission status:', error);
 *   });
 * ```
 */
  }
}

// Exécuter la fonction
checkMissionStatus()
  .then(() => console.log('\nVérification terminée'))
  .catch(err => console.error('Échec:', err));