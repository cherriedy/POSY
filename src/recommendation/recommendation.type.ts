/**
 * @description Represents a recommended product with its associated score.
 *
 * @property {string} product_b_id - The ID of the recommended product.
 * @property {number} final_hybrid_score - The final score calculated by the hybrid recommendation algorithm.
 */
export type Recommendation = {
  product_b_id: string;
  final_hybrid_score: number;
};

/**
 * @description Represents the response structure for collaborative filtering recommendations.
 *
 * @property {Recommendation[]} data - An array of recommended products with their scores.
 */
export type CollaborativeResponse = {
  data: Recommendation[];
};
