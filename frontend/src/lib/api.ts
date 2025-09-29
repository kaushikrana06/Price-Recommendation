import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL ?? '/api'
export const api = axios.create({ baseURL })

export type Listing = {
  id: string; title: string; city: string; rooms: number;
}

export type Recommendation = {
  listing_id: string; dt: string; rec_price: string; conf_low: string; conf_high: string; reason: string; created_at: string
}

export async function fetchListings(){
  const { data } = await api.get<Listing[]>('/listings/')
  return data
}

export async function fetchRecommendations(id: string, fromISO: string, toISO: string){
  const { data } = await api.get<Recommendation[]>(`/listings/${id}/recommendations/`, { params: { from: fromISO, to: toISO } })
  return data
}

export async function triggerLiveQuote(listingId: string, days = 14){
  const { data } = await api.post('/llm/quote/', { listing_id: listingId, days })
  return data
}
