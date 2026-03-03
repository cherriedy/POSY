/**
 * Defines a Unit of Work (UoW) transactional contract.
 *
 * The Unit of Work pattern coordinates the writing of changes
 * and ensures atomic entities of a business operation.
 *
 * This abstraction allows infrastructure-specific transaction
 * implementations (e.g., Prisma, TypeORM, Sequelize, in-memory)
 * to be used without coupling domain or application layers
 * to a specific ORM or database technology.
 *
 * Implementations may support:
 * - Manual transaction control (`start`, `commit`, `rollback`)
 * - Functional execution style (`execute`)
 * - Context exposure for repository binding (`getContext`)
 *
 * All methods are optional to support different transaction strategies.
 */
export abstract class UnitOfWork {
  /**
   * Starts a new transactional boundary.
   *
   * Intended for manual transaction management.
   * Implementations should initialize and bind the transaction context.
   *
   * @returns A promise that resolves when the transaction has started.
   */
  start?(): Promise<void>;

  /**
   * Commits the active transaction.
   *
   * Persists all changes performed within the current unit of work.
   * Should throw if called without an active transaction (implementation-dependent).
   *
   * @returns A promise that resolves when the commit is complete.
   */
  commit?(): Promise<void>;

  /**
   * Rolls back the active transaction.
   *
   * Reverts all changes made during the current unit of work.
   * Typically called after an error or business rule violation.
   *
   * @returns A promise that resolves when rollback is complete.
   */
  rollback?(): Promise<void>;

  /**
   * Returns the underlying transaction-bound context.
   *
   * This may represent:
   * - A transaction-scoped database client
   * - A query runner
   * - A session object
   * - Any entities-layer-specific transaction handle
   *
   * Consumers should avoid depending on this unless strictly necessary.
   *
   * @returns The implementation-specific transaction context.
   */
  getContext?(): unknown;

  /**
   * Executes the provided asynchronous function inside a transactional boundary.
   *
   * The implementation is responsible for:
   * - Starting the transaction
   * - Committing if the function resolves successfully
   * - Rolling back if the function throws or rejects
   *
   * This functional style is generally safer and preferred
   * over manual transaction management when supported.
   *
   * @template T The return type of the transactional operation.
   * @param fn An async function containing operations that must execute atomically.
   * @returns A promise resolving to the result of the function.
   *
   * @throws Rethrows any error thrown inside the callback after rollback.
   */
  execute?<T>(fn: () => Promise<T>): Promise<T>;
}
