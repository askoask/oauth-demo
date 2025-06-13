import { usersData } from "../data/users.data.js";
import cryptoService from "./crypto.service.js";

class UserService {
  static #instance;

  constructor() {
    if (UserService.#instance) {
      return UserService.#instance;
    }

    UserService.#instance = this;
  }

  /**
   * Find a user by their unique ID.
   * @param {string} id - The user's ID.
   * @returns {object|null} The user object or null if not found.
   */
  findUserById(id) {
    return usersData.find((user) => user.id === id) || null;
  }

  /**
   * Find a user by username (email) and password.
   * @param {string} username - The user's email.
   * @param {string} password - The user's password (plain text).
   * @returns {Promise<object|null>} The user object or null if not found or password is incorrect.
   */
  async findUserByUsernamePassword(username, password) {
    const user = usersData.find(
      (user) => user.email.toLowerCase() === username.toLowerCase()
    );
    if (!user) return null;
    const isValid = await cryptoService.verifyPassword(password, user.password);
    return isValid ? user : null;
  }

  /**
   * Find all users in the system.
   * @returns {object[]} Array of all user objects.
   */
  findAll() {
    return usersData;
  }
}
export default new UserService();
