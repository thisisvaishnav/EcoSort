import { SOCIETY_STRINGS } from '../content';

export interface SocietyVoiceManifestItem {
  id: string;
  speaker: 'Kai' | 'Resident' | 'Announcer';
  voice: 'Kajal' | 'Aditi' | 'Raveena'; // Polly neural voices
  text: string;
  file: string;
}

/**
 * Manifest of all Society World voice lines for AWS Polly generation.
 */
export const SOCIETY_VOICE_MANIFEST: SocietyVoiceManifestItem[] = [
  {
    id: 'society_voice_kai_welcome',
    speaker: 'Kai',
    voice: 'Aditi',
    text: SOCIETY_STRINGS.narrative.welcome,
    file: '/audio/en/society/kai_welcome.mp3',
  },
  {
    id: 'society_voice_van_arrive',
    speaker: 'Announcer',
    voice: 'Aditi',
    text: SOCIETY_STRINGS.van.arrival,
    file: '/audio/en/society/van_arrive.mp3',
  },
  {
    id: 'society_voice_hotspot_food',
    speaker: 'Kai',
    voice: 'Aditi',
    text: SOCIETY_STRINGS.hotspots.foodWaste.shortDesc,
    file: '/audio/en/society/hotspot_food.mp3',
  },
  {
    id: 'society_voice_hotspot_water',
    speaker: 'Kai',
    voice: 'Aditi',
    text: SOCIETY_STRINGS.hotspots.standingWater.shortDesc,
    file: '/audio/en/society/hotspot_water.mp3',
  },
  {
    id: 'society_voice_hotspot_plants',
    speaker: 'Kai',
    voice: 'Aditi',
    text: SOCIETY_STRINGS.hotspots.damagedPlants.shortDesc,
    file: '/audio/en/society/hotspot_plants.mp3',
  },
  {
    id: 'society_voice_hotspot_drain',
    speaker: 'Kai',
    voice: 'Aditi',
    text: SOCIETY_STRINGS.hotspots.litteredDrain.shortDesc,
    file: '/audio/en/society/hotspot_drain.mp3',
  },
  ...SOCIETY_STRINGS.residents.map((r) => ({
    id: r.voiceLineId,
    speaker: 'Resident' as const,
    voice: 'Raveena' as const,
    text: r.statement,
    file: `/audio/en/society/${r.id}.mp3`,
  })),
];

export const SOCIETY_AUDIO_KEYS = {
  bgmAmbient: 'society_bgm_ambient',
  truckHorn: 'society_sfx_truck_horn',
  sortCorrect: 'society_sfx_sort_correct',
  sortError: 'society_sfx_sort_error',
  hotspotScan: 'society_sfx_lens_scan',
  missionClear: 'society_sfx_mission_clear',
} as const;
