import api from './api';
import { API_ENDPOINTS } from '../config/api.config';

/**
 * Category service
 * Handles CRUD operations for categories
 */
class CategoryService {
  /**
   * Get all categories with optional filters
   * @param {Object} filters - Filter options
   * @param {string} filters.type - Category type (income or expense)
   * @param {string} filters.parentId - Parent category ID
   * @returns {Promise<Array>} List of categories
   */
  async getCategories(filters = {}) {
    try {
      const params = new URLSearchParams();

      if (filters.type) params.append('type', filters.type);
      if (filters.parentId) params.append('parent_id', filters.parentId);

      const url = params.toString()
        ? `${API_ENDPOINTS.CATEGORIES}?${params}`
        : API_ENDPOINTS.CATEGORIES;

      const response = await api.get(url);
      return response.data.data.map(this._mapCategoryFromAPI);
    } catch (error) {
      console.error('Get categories error:', error);
      throw error;
    }
  }

  /**
   * Get categories in tree structure (with children)
   * @returns {Promise<Array>} Tree structure of categories
   */
  async getCategoriesTree() {
    try {
      const response = await api.get(API_ENDPOINTS.CATEGORIES_TREE);
      return response.data.data.map(this._mapCategoryFromAPI);
    } catch (error) {
      console.error('Get categories tree error:', error);
      throw error;
    }
  }

  /**
   * Get single category by ID
   * @param {string} id - Category ID
   * @returns {Promise<Object>} Category object
   */
  async getCategory(id) {
    try {
      const response = await api.get(`${API_ENDPOINTS.CATEGORIES}/${id}`);
      return this._mapCategoryFromAPI(response.data.data);
    } catch (error) {
      console.error('Get category error:', error);
      throw error;
    }
  }

  /**
   * Create new category
   * @param {Object} categoryData - Category data
   * @returns {Promise<Object>} Created category
   */
  async createCategory(categoryData) {
    try {
      const apiData = this._mapCategoryToAPI(categoryData);
      const response = await api.post(API_ENDPOINTS.CATEGORIES, apiData);
      return this._mapCategoryFromAPI(response.data.data);
    } catch (error) {
      console.error('Create category error:', error);
      throw error;
    }
  }

  /**
   * Update category
   * @param {string} id - Category ID
   * @param {Object} categoryData - Updated category data
   * @returns {Promise<Object>} Updated category
   */
  async updateCategory(id, categoryData) {
    try {
      const apiData = this._mapCategoryToAPI(categoryData);
      const response = await api.put(`${API_ENDPOINTS.CATEGORIES}/${id}`, apiData);
      return this._mapCategoryFromAPI(response.data.data);
    } catch (error) {
      console.error('Update category error:', error);
      throw error;
    }
  }

  /**
   * Delete category
   * @param {string} id - Category ID
   * @returns {Promise<void>}
   */
  async deleteCategory(id) {
    try {
      await api.delete(`${API_ENDPOINTS.CATEGORIES}/${id}`);
    } catch (error) {
      console.error('Delete category error:', error);
      throw error;
    }
  }

  /**
   * Map category from API format to frontend format
   * @private
   */
  _mapCategoryFromAPI(apiCategory) {
    return {
      id: apiCategory.id,
      name: apiCategory.name,
      type: apiCategory.type,
      color: apiCategory.color,
      icon: this._mapColorToIcon(apiCategory.color),
      parentId: apiCategory.parent_id,
      isActive: apiCategory.is_active,
      createdAt: apiCategory.created_at,
      updatedAt: apiCategory.updated_at,
      // If tree structure, recursively map children
      children: apiCategory.children
        ? apiCategory.children.map(child => this._mapCategoryFromAPI(child))
        : [],
    };
  }

  /**
   * Map category from frontend format to API format
   * @private
   */
  _mapCategoryToAPI(category) {
    return {
      name: category.name,
      type: category.type,
      color: category.color || this._mapIconToColor(category.icon),
      parent_id: category.parentId || category.parent_id,
      is_active: category.isActive !== undefined ? category.isActive : category.is_active,
    };
  }

  /**
   * Map color to icon name (for frontend display)
   * @private
   */
  _mapColorToIcon(color) {
    const colorIconMap = {
      '#10B981': 'Coins',
      '#3B82F6': 'ShoppingCart',
      '#8B5CF6': 'CreditCard',
      '#F59E0B': 'Home',
      '#EF4444': 'AlertCircle',
      '#6366F1': 'Briefcase',
      '#EC4899': 'Heart',
      '#14B8A6': 'Car',
      '#F97316': 'Coffee',
      '#84CC16': 'Utensils',
    };
    return colorIconMap[color] || 'Tag';
  }

  /**
   * Map icon name to color (for API submission)
   * @private
   */
  _mapIconToColor(icon) {
    const iconColorMap = {
      'Coins': '#10B981',
      'ShoppingCart': '#3B82F6',
      'CreditCard': '#8B5CF6',
      'Home': '#F59E0B',
      'AlertCircle': '#EF4444',
      'Briefcase': '#6366F1',
      'Heart': '#EC4899',
      'Car': '#14B8A6',
      'Coffee': '#F97316',
      'Utensils': '#84CC16',
    };
    return iconColorMap[icon] || '#6B7280';
  }
}

export default new CategoryService();
