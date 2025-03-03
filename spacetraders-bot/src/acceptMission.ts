// acceptMission.ts

import dotenv from 'dotenv';
import axios, { AxiosError } from 'axios';

dotenv.config();

const API_URL: string = 'https://api.spacetraders.io/v2';
const TOKEN: string | undefined = process.env.SPACE_TRADERS_TOKEN;

interface MissionResponse {
  data: {
    mission: {
      id: string;
      factionSymbol: string;
      type: string;
      accepted: boolean;
      fulfilled: boolean;
    }
  }
}

/**
 * Accepts a mission by sending a POST request to the API.
 *
 * @returns {Promise<MissionResponse>} A promise that resolves to the mission response data.
 *
 * @throws {AxiosError} Throws an error if the request fails.
 *
 * @example
 * ```typescript
 * acceptMission()
 *   .then(response => {
 *     console.log('Mission accepted:', response);
 *   })
 *   .catch(error => {
 *     console.error('Error accepting mission:', error);
 *   });
 * ```
 */
async function acceptMission(): Promise<MissionResponse> {
  const missionId: string = 'cm7swf3u2267xvt0j4u1071a6';
  
  try {
    const response = await axios.post<MissionResponse>(
      `${API_URL}/missions/${missionId}/accept`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TOKEN}`
        }
      }
    );
    
    console.log('Mission acceptée avec succès!');
    console.log(JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Erreur lors de l\'acceptation de la mission:', 
      axiosError.response ? axiosError.response.data : axiosError.message);
    throw error;
  }
}

// Exécuter la fonction
acceptMission()
  .then(() => console.log('Terminé'))
  .catch(err => console.error('Échec:', err));