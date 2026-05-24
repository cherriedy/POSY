/**
 * Payload interface for creating a cuisine.
 */
export interface CuisineInsertPayload {
  name: string;
  region?: string | null;
}

/**
 * Payload interface for updating a cuisine.
 */
export interface CuisineUpdatePayload {
  name?: string | null;
  region?: string | null;
}
