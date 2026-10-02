export const SPECIALTIES = [
  "Wedding", "Pre-wedding", "Candid", "Portrait", "Maternity", "Newborn", "Family",
  "Fashion", "Product", "Food", "Commercial", "Event", "Street", "Travel", "Landscape",
] as const;

export const CITIES = ["Mumbai", "Thane", "Bhiwandi", "Navi Mumbai", "Pune", "Nashik"] as const;

export const PACKAGES = [
  { key: "hourly", label: "Hourly", blurb: "Short sessions, portraits, headshots", unit: "per hour" },
  { key: "event", label: "Event", blurb: "Functions, launches, single-day events", unit: "per event" },
  { key: "package", label: "Full package", blurb: "Multi-day coverage with album & edits", unit: "all-inclusive" },
] as const;

export type PackageKey = (typeof PACKAGES)[number]["key"];
