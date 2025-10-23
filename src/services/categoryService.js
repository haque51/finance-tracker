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
    let apiData;
    try {
      apiData = this._mapCategoryToAPI(categoryData);

      // Debug logging
      console.log('Creating category:', categoryData.name);
      console.log('Mapped API data:', JSON.stringify(apiData, null, 2));

      const response = await api.post(API_ENDPOINTS.CATEGORIES, apiData);
      return this._mapCategoryFromAPI(response.data.data);
    } catch (error) {
      console.error('Create category error:', error);
      console.error('Failed category data:', categoryData);
      console.error('Failed API payload:', apiData);
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

      // Create categories one by one (since backend doesn't have bulk endpoint)
      // Create parent categories first, then children
      const parentCategories = categoriesArray.filter(cat => !cat.parentId);
      const childCategories = categoriesArray.filter(cat => cat.parentId);

      const createdParents = [];
      const createdChildren = [];

      // Map old demo IDs to new backend UUIDs
      const idMap = new Map();

      // Create parent categories first
      for (const category of parentCategories) {
        try {
          const created = await this.createCategory(category);
          createdParents.push(created);
          // Map old demo ID to new backend UUID
          idMap.set(category.id, created.id);
          console.log(`✅ Created parent: ${category.name} (${category.id} → ${created.id})`);
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
    // If category has an emoji icon, use a default color
    // Otherwise try to map icon name to color
    let color = category.color;
    if (!color) {
      // Check if icon is an emoji (non-ASCII characters)
      const isEmoji = category.icon && /[\u{1F000}-\u{1F9FF}]/u.test(category.icon);
      color = isEmoji ? this._getColorForCategoryType(category.type) : this._mapIconToColor(category.icon);
    }

    // Ensure color is always set
    if (!color) {
      color = this._getColorForCategoryType(category.type);
    }

    // Ensure is_active is always set (default to true)
    const isActive = category.isActive !== undefined ? category.isActive : (category.is_active !== undefined ? category.is_active : true);

    // Build payload - only include fields with actual values
    const payload = {
      name: category.name,
      type: category.type,
      color: color,
    };

    // Only include parent_id if it has a value (don't send null)
    const parentId = category.parentId || category.parent_id;
    if (parentId) {
      payload.parent_id = parentId;
    }

    // Only include is_active if explicitly set (don't send default true)
    if (category.isActive !== undefined || category.is_active !== undefined) {
      payload.is_active = isActive;
    }

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
