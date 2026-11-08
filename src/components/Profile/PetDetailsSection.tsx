import { useState, type FormEvent } from "react";
import { useCanWrite } from "../../auth/AuthContext";
import { updatePetDetails } from "../../services/users";
import type { PetDetails, Species, UserProfile } from "../../types";
import { reportError } from "../../utils/alerts";
import {
  MAX_PET_TEXT_LENGTH,
  MIN_BIRTH_YEAR,
  petTags,
  SPECIES,
} from "../../utils/pet";
import { Button } from "../ui/Button";
import { TextField } from "../ui/TextField";

interface Props {
  user: UserProfile;
  editable: boolean;
  onSaved: () => Promise<unknown>;
}

export function PetDetailsSection({ user, editable, onSaved }: Props) {
  const canWrite = useCanWrite();
  const [editing, setEditing] = useState(false);
  const tags = petTags(user.pet);

  if (editing) {
    return (
      <PetDetailsForm
        pet={user.pet ?? {}}
        onCancel={() => setEditing(false)}
        onSave={async (pet) => {
          if (!canWrite()) return;
          await updatePetDetails(user.username, pet);
          await onSaved();
          setEditing(false);
        }}
      />
    );
  }

  if (!tags.length && !editable) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="rounded-pill border border-line bg-surface px-3 py-1 text-sm"
        >
          {tag}
        </span>
      ))}
      {editable && (
        <button
          type="button"
          onClick={() => {
            if (canWrite()) setEditing(true);
          }}
          className="cursor-pointer text-sm font-bold text-primary hover:text-primary-hover"
        >
          {tags.length ? "Edit pet details" : "Add pet details"}
        </button>
      )}
    </div>
  );
}

interface FormProps {
  pet: PetDetails;
  onSave: (pet: PetDetails) => Promise<void>;
  onCancel: () => void;
}

function PetDetailsForm({ pet, onSave, onCancel }: FormProps) {
  const [species, setSpecies] = useState<Species | "">(pet.species ?? "");
  const [breed, setBreed] = useState(pet.breed ?? "");
  const [birthYear, setBirthYear] = useState(pet.birthYear?.toString() ?? "");
  const [city, setCity] = useState(pet.city ?? "");
  const [saving, setSaving] = useState(false);

  const thisYear = new Date().getFullYear();
  const year = Number(birthYear);
  const yearError =
    birthYear &&
    (!Number.isInteger(year) || year < MIN_BIRTH_YEAR || year > thisYear)
      ? `Between ${MIN_BIRTH_YEAR} and ${thisYear}`
      : undefined;

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (yearError) return;
    // empty fields are left out
    const details: PetDetails = {};
    if (species) details.species = species;
    if (breed.trim()) details.breed = breed.trim();
    if (birthYear) details.birthYear = year;
    if (city.trim()) details.city = city.trim();
    setSaving(true);
    try {
      await onSave(details);
    } catch (error) {
      reportError(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={save}
      className="grid gap-3 rounded-card border border-line bg-surface p-4 sm:grid-cols-2"
    >
      <label className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-muted">Species</span>
        <select
          value={species}
          onChange={(e) => setSpecies(e.target.value as Species | "")}
          className="w-full rounded-control border border-line bg-surface px-3 py-2 text-ink outline-none transition-colors focus:border-primary"
        >
          <option value="">Not set</option>
          {Object.entries(SPECIES).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <TextField
        label="Breed"
        value={breed}
        maxLength={MAX_PET_TEXT_LENGTH}
        onChange={(e) => setBreed(e.target.value)}
      />
      <TextField
        label="Birth year"
        type="number"
        inputMode="numeric"
        min={MIN_BIRTH_YEAR}
        max={thisYear}
        value={birthYear}
        error={yearError}
        onChange={(e) => setBirthYear(e.target.value)}
      />
      <TextField
        label="City"
        value={city}
        maxLength={MAX_PET_TEXT_LENGTH}
        onChange={(e) => setCity(e.target.value)}
      />
      <div className="flex justify-end gap-2 sm:col-span-2">
        <Button variant="secondary" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={saving || !!yearError}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}
