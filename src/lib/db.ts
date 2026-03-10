import rawData from "./data.json";

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface DataStore {
  teams: any[];
  players: any[];
  games: any[];
  player_stats: any[];
  football_metrics: any[];
  scouting_reports: any[];
  transfer_portal: any[];
  social_actions: any[];
  feed_posts: any[];
  merch_items: any[];
  nfl_projections: any[];
  scholastic_data: any[];
  nil_contracts: any[];
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
