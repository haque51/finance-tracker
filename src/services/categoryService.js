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
      console.log('getCategories response count:', response.data.data.length);
      console.log('First category from API:', response.data.data[0]);
      console.log('First category parent_id:', response.data.data[0]?.parent_id);

      const mapped = response.data.data.map(this._mapCategoryFromAPI);
      console.log('First mapped category:', mapped[0]);
      console.log('First mapped parent_id:', mapped[0]?.parent_id);
      console.log('Categories with parent_id:', mapped.filter(c => c.parent_id || c.parentId).length);

      return mapped;
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
    let apiData;
    try {
      apiData = this._mapCategoryToAPI(categoryData);

      // Debug logging
      console.log('Creating category:', categoryData.name);
      console.log('Mapped API data:', JSON.stringify(apiData, null, 2));

      const response = await api.post(API_ENDPOINTS.CATEGORIES, apiData);

      console.log('API response:', response);
      console.log('API response.data:', response.data);
      console.log('API response.data.data:', response.data.data);
      console.log('API response parent_id:', response.data.data?.parent_id);

      const mapped = this._mapCategoryFromAPI(response.data.data);
      console.log('Mapped category:', mapped);
      console.log('Mapped category parent_id:', mapped.parent_id);
      console.log('Mapped category parentId:', mapped.parentId);

      return mapped;
    } catch (error) {
      console.error('Create category error:', error);
      console.error('Failed category data:', categoryData);
      console.error('Failed API payload:', apiData);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Backend validation details:', error.originalError?.response?.data);
      throw error;
    }
  }

  /**
   * Create multiple categories in bulk
   * @param {Array<Object>} categoriesArray - Array of category data objects
   * @returns {Promise<Array>} Array of created categories
   */
  async createCategoriesBulk(categoriesArray) {
    try {
      console.log(`📦 Creating ${categoriesArray.length} default categories...`);

      // Helper to add delay between requests (avoid rate limiting)
      const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

      // Create categories one by one (since backend doesn't have bulk endpoint)
      // Create parent categories first, then children
      const parentCategories = categoriesArray.filter(cat => !cat.parentId);
      const childCategories = categoriesArray.filter(cat => cat.parentId);

      const createdParents = [];
      const createdChildren = [];

      // Map old demo IDs to new backend UUIDs
      const idMap = new Map();

      // Create parent categories first with delay to avoid rate limiting
      for (const category of parentCategories) {
        try {
          const created = await this.createCategory(category);
          createdParents.push(created);
          // Map old demo ID to new backend UUID
          idMap.set(category.id, created.id);
          console.log(`✅ Created parent: ${category.name} (${category.id} → ${created.id})`);

          // Add 150ms delay between requests to avoid rate limiting
          await delay(150);
        } catch (err) {
          console.warn(`❌ Failed to create category ${category.name}:`, err.message);
          // Continue with others even if one fails
        }
      }

      console.log(`Created ${createdParents.length}/${parentCategories.length} parent categories`);

      // Create child categories with corrected parent IDs
      for (const category of childCategories) {
        try {
          // Replace demo parent ID with real backend UUID
          const realParentId = idMap.get(category.parentId);
          if (!realParentId) {
            console.warn(`⚠️ Skipping subcategory ${category.name}: parent ${category.parentId} not found`);
            continue;
          }

          const categoryWithRealParent = {
            ...category,
            parentId: realParentId
          };

          const created = await this.createCategory(categoryWithRealParent);
          createdChildren.push(created);
          console.log(`✅ Created child: ${category.name} (parent: ${realParentId})`);

          // Add 150ms delay between requests to avoid rate limiting
          await delay(150);
        } catch (err) {
          console.warn(`❌ Failed to create subcategory ${category.name}:`, err.message);
          // Continue with others even if one fails
        }
      }

      console.log(`Created ${createdChildren.length}/${childCategories.length} subcategories`);

      const allCreated = [...createdParents, ...createdChildren];
      console.log(`✅ Successfully created ${allCreated.length}/${categoriesArray.length} categories total`);

      return allCreated;
    } catch (error) {
      console.error('Bulk create categories error:', error);
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
    // Determine icon - if backend stored an emoji icon, use it; otherwise map color to icon name
    let icon = apiCategory.icon;
    if (!icon) {
      // Try to extract emoji from name or use color mapping
      icon = this._mapColorToIcon(apiCategory.color);
    }

    return {
      id: apiCategory.id,
      name: apiCategory.name,
      type: apiCategory.type,
      color: apiCategory.color,
      icon: icon,
      parentId: apiCategory.parent_id,
      parent_id: apiCategory.parent_id, // Keep snake_case for compatibility with UI filters
      isActive: apiCategory.is_active,
      userId: apiCategory.user_id,
      user_id: apiCategory.user_id, // Keep both formats for compatibility
      createdBy: apiCategory.created_by || apiCategory.user_id, // Fallback to user_id
      created_by: apiCategory.created_by || apiCategory.user_id, // Fallback to user_id
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
    // Build payload - only include fields backend accepts
    const payload = {
      name: category.name,
      type: category.type,
    };

    // NOTE: Do NOT include user_id - backend gets it from JWT token automatically
    // The validation schema does not accept user_id in the request body

    // Only include parent_id if it has a value (don't send null)
    const parentId = category.parentId || category.parent_id;
    if (parentId) {
      payload.parent_id = parentId;
    }

    // Note: Backend does NOT accept 'color', 'icon', 'user_id', or 'is_active' fields on create/update
    // These are auto-generated or returned by the backend

    return payload;
  }

  /**
   * Get default color for category type
   * @private
   */
  _getColorForCategoryType(type) {
    return type === 'income' ? '#10B981' : '#3B82F6';
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

const categoryService = new CategoryService();
export default categoryService;
