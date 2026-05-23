import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository-abstract';
import { User } from '../types/user.class';
import { UserNotFoundError } from '../errors/user-not-found.error';
import { UserQueryParams } from '../interfaces/user-query-params.interface';
import { Page } from '../../../common/interfaces/page.interface';

@Injectable()
export class GetUsersService {
  constructor(private userRepository: UserRepository) {}

  /**
   * Retrieves a user by their unique ID.
   *
   * @param {string} userId - The unique identifier of the user to retrieve.
   * @returns {Promise<User>} A promise that resolves to the user domain object.
   * @throws {UserNotFoundError} If the user with the given ID does not exist.
   */
  async getUserById(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError({ id: userId });
    }
    return user;
  }

  /**
   * Retrieves a paginated list of users with advanced filtering and sorting.
   *
   * @param {UserQueryParams} params - The query parameters for filtering, sorting, and pagination.
   * @param {string} [requesterRole] - The role of the user making the request (to filter results).
   * @param {string} [requesterId] - The ID of the user making the request (to exclude from results).
   * @returns {Promise<Page<User>>} A promise that resolves to a paginated list of users.
   */
  async getAll(
    params: UserQueryParams,
    requesterRole?: string,
    requesterId?: string,
  ): Promise<Page<User>> {
    return this.userRepository.getAllPaged(params, requesterRole, requesterId);
  }
}
