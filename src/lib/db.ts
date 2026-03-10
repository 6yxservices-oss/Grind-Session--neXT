import rawData from "./data.json";

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface DataStore {
  teams: any[];
  drivers: any[];
  races: any[];
  race_results: any[];
  performance_metrics: any[];
  scouting_reports: any[];
  driver_market: any[];
  social_actions: any[];
  fan_votes: any[];
  feed_posts: any[];
  merch_items: any[];
  f1_projections: any[];
  driver_contracts: any[];
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
