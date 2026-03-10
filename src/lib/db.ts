import rawData from "./data.json";

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface DataStore {
  teams: any[];
  players: any[];
  games: any[];
  player_stats: any[];
  scouting_reports: any[];
  scholastic_data: any[];
  nextup_profiles: any[];
  physical_metrics: any[];
  nba_projections: any[];
}

// Deep clone so mutations don't corrupt the imported module cache
function freshData(): DataStore {
  return JSON.parse(JSON.stringify(rawData)) as DataStore;
}

let store: DataStore | null = null;

export function getData(): DataStore {
  if (!store) store = freshData();
  return store;
}
