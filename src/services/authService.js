import api from './api';
import { API_ENDPOINTS } from '../config/api.config';

/**
 * Authentication service
 * Handles user registration, login, logout, etc.
 *
 * NOTE: Full implementation in Phase 2
 */
class AuthService {
  // Placeholder - will implement in Phase 2
  async login(email, password) {
    // TODO: Phase 2
    throw new Error('Not implemented yet');
  }

  async register(userData) {
    // TODO: Phase 2
    throw new Error('Not implemented yet');
  }

  async logout() {
    // TODO: Phase 2
    throw new Error('Not implemented yet');
  }
}

export default new AuthService();
