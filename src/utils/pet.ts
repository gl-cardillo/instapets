import type { PetDetails, Species } from "../types";

// must match firestore.rules
export const SPECIES: Record<Species, string> = {
  dog: "Dog",
  cat: "Cat",
  rabbit: "Rabbit",
  bird: "Bird",
  fish: "Fish",
  reptile: "Reptile",
  other: "Other",
};
export const MAX_PET_TEXT_LENGTH = 40;
export const MIN_BIRTH_YEAR = 1980;

export function petAge(birthYear: number, now = new Date()): string {
  const years = now.getFullYear() - birthYear;
  if (years < 1) return "under 1 year";
  return `${years} year${years === 1 ? "" : "s"}`;
}

// the tags shown on a profile, in order
export function petTags(pet: PetDetails | undefined, now = new Date()) {
  if (!pet) return [];
  return [
    pet.species && SPECIES[pet.species],
    pet.breed,
    pet.birthYear !== undefined && petAge(pet.birthYear, now),
    pet.city,
  ].filter((tag): tag is string => !!tag);
}
