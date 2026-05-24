/**
 * Payload for creating a unit.
 * This is the contract between the controller and service layer.
 */
export interface UnitCreatePayload {
  name: string;
  abbreviation: string;
}

/**
 * Payload for updating a unit.
 * This is the contract between the controller and service layer.
 */
export interface UnitUpdatePayload {
  name?: string;
  abbreviation?: string;
}
