"use client";

import { useSyncedState } from "./useSyncedState";
import type { Profile } from "@/types";

const empty: Profile = { name: "", email: "", university: "" };

export function useProfile() {
  return useSyncedState<Profile>("studymate-profile", empty);
}
