import type { AccountAddress } from "@/lib/account/types";

export function getProfileFirstName(fullName: string | null): string | null {
  const trimmed = fullName?.trim();
  if (!trimmed) return null;
  return trimmed.split(/\s+/)[0] ?? null;
}

export function getDefaultAddress(addresses: AccountAddress[]): AccountAddress | null {
  return addresses.find((address) => address.isDefault) ?? addresses[0] ?? null;
}

export function formatAddressLocation(address: AccountAddress): string {
  const parts = [address.city, address.region, address.countryCode].filter(Boolean);
  return parts.join(", ");
}
