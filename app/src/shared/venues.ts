// Finer kinds of place within each venue, picked on the Scene step. The label
// goes to the story agent as the environment brief; `surfaceText` (and a
// smaller `surface` where the table really is smaller) override the default
// table so the proxy and the prompt match the place.

import type { Surface, Venue } from "./types";

export interface VenueType {
  id: string;
  label: string;
  /** How the place is described to the story agent: a short name, a colon, then the look. */
  prompt: string;
  surfaceText?: string;
  surface?: Surface;
  /** Retired ids that now mean this place, so saved scenes keep their choice. */
  aliases?: string[];
}

// One kind of place per look that reads differently on camera (Fernando, 2026-10-18): home went from four
// to three, restaurant from six to four. Each prompt is the generic look; a country's own venue profile in
// the knowledge base wins where it has one.
export const VENUE_TYPES: Record<Venue, VenueType[]> = {
  home: [
    { id: "genz-apartment", label: "Gen Z apartment", prompt: "a small, styled Gen Z rental apartment: compact and bright, a few plants, one or two design objects, personal touches such as prints or a string light, a sofa or window close behind", surfaceText: "a small apartment dining table", surface: "apartment-table" },
    { id: "dining-room", label: "Dining room", prompt: "a family dining room in a lived-in home: a proper dining table and chairs, a sideboard or cabinet with everyday things, a curtained window, family touches, furnished the way homes in this country really are, not a showroom", surfaceText: "a dining-room table", surface: "dining-table", aliases: ["family-home"] },
    { id: "kitchen-island", label: "Kitchen island", prompt: "a home kitchen seen from a seat at the kitchen island: cabinets, counters and everyday appliances softly behind, a window or pendant light", surfaceText: "a kitchen island countertop", surface: "kitchen-island" },
  ],
  restaurant: [
    { id: "casual-dining", label: "Sit-down", prompt: "a sit-down restaurant: table service, the neighbourhood or traditional kind typical of this country, local décor, simple tables and chairs, other tables softly behind, never upscale or white-cloth", surface: "restaurant-table", aliases: ["local-spot"] },
    { id: "fast-casual", label: "Counter service", prompt: "a counter-service restaurant or food court: order at the counter, bright practical light, simple tables, a menu board blurred to colour blocks, food on trays or in baskets", surfaceText: "a counter-service restaurant table", surface: "counter-service-table", aliases: ["food-court"] },
    { id: "cafe", label: "Café", prompt: "a small neighbourhood café: a counter with a coffee machine and pastry case softly behind, a few small tables, window light", surfaceText: "a small café table", surface: "cafe-table" },
    { id: "modern-bistro", label: "Modern bistro", prompt: "a modern bistro: design-led and elevated but relaxed, a cooler palette of concrete, dark wood and stone, statement pendant lights, an open-kitchen glow, no bar, bottles or taps behind", surfaceText: "a solid wood or stone bistro table", surface: "bistro-table", aliases: ["gastropub"] },
  ],
  "on-the-go": [
    // On the go, the kind of place sets the surface; the operator can change it on Time & Place.
    { id: "park", label: "Park", prompt: "a city park: trees, grass and paths", surface: "picnic-table" },
    { id: "street-market", label: "Street market", prompt: "an open-air street market with stalls", surface: "counter-top" },
    { id: "food-truck", label: "Food truck", prompt: "beside a food truck on a city street", surface: "food-truck-counter" },
    { id: "beach", label: "Beach or waterfront", prompt: "a beach or waterfront promenade", surface: "picnic-table" },
    { id: "stadium", label: "Stadium or event", prompt: "outside a stadium or at an outdoor event", surface: "counter-top" },
  ],
};

export function venueType(venue: Venue, id: string | undefined): VenueType | undefined {
  return id ? VENUE_TYPES[venue].find((t) => t.id === id || t.aliases?.includes(id)) : undefined;
}

/** The environment brief for the story agent, or "" when the operator gave none. */
export function environmentBrief(scene: { venue: Venue; venueType?: string | undefined; environmentNote?: string | undefined }): string {
  const t = venueType(scene.venue, scene.venueType);
  const note = scene.environmentNote?.trim();
  return [t && `Place: ${t.label} (${t.prompt}).`, note && `The operator's description: ${note}`].filter(Boolean).join(" ");
}
