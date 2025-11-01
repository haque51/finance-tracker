
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Category, User } from "@/api/entities"; // Removed Transaction for performance optimization
import { GenerateImage } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApp } from "../context/AppContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, FolderTree } from "lucide-react"; // Removed FileText, Repeat as they are not used here

import CategoryCard from "../components/categories/CategoryCard";
import CategoryForm from "../components/categories/CategoryForm";
import CategoryStats from "../components/categories/CategoryStats";

const DEFAULT_CATEGORIES = {
    expense: [
        { name: 'Immediate Obligations', sub: ['Rent/Mortgage', 'Utilities', 'Internet', 'Mobile Phone', 'Home Insurance', 'Health Insurance', 'Auto Insurance', 'Loan Payment'] },
        { name: 'Food & Dining', sub: ['Groceries', 'Restaurants', 'Coffee Shops', 'Alcohol & Bars'] },
        { name: 'Personal', sub: ['Clothing', 'Haircut', 'Cosmetics', 'Subscriptions'] },
        { name: 'Transportation', sub: ['Fuel', 'Public Transport', 'Car Maintenance', 'Parking', 'Auto Registration'] },
        { name: 'Health & Wellness', sub: ['Pharmacy', 'Doctor', 'Dentist', 'Eyecare', 'Fitness'] },
        { name: 'Shopping', sub: ['Home Supplies', 'Electronics', 'Software', 'Hobbies', 'Books', 'Gifts'] },
        { name: 'Entertainment', sub: ['Movies', 'Concerts', 'Games', 'Travel'] },
        { name: 'Financial', sub: ['Bank Fees', 'Taxes', 'Charity'] },
    ],
    income: [
        { name: 'Wages', sub: ['Salary', 'Bonus', 'Commission'] },
        { name: 'Other Income', sub: ['Investment', 'Gift', 'Rental Income'] },
    ]
};

export default function CategoriesPage() {
  const { categories: sharedCategories, loadCategories } = useApp();
  const [categories, setCategories] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [activeTab, setActiveTab] = useState("expense");
  const [isSettingUp, setIsSettingUp] = useState(false);

  // Use ref to prevent multiple simultaneous setup attempts
  const isSettingUpRef = useRef(false);
  const hasLoadedOnce = useRef(false);

  // Sync with shared categories from AppContext
  useEffect(() => {
    setCategories(sharedCategories);
  }, [sharedCategories]);

  const setupDefaultCategories = useCallback(async (user) => {
    // Prevent multiple simultaneous setup attempts
    if (isSettingUpRef.current) {
      console.log('⚠️ Category setup already in progress, skipping...');
      return;
    }

    isSettingUpRef.current = true;
    setIsSettingUp(true);

    try {
        console.log('🏗️ Setting up default categories...');
        for (const type in DEFAULT_CATEGORIES) {
            for (const cat of DEFAULT_CATEGORIES[type]) {
                const parentCategory = await Category.create({
                    name: cat.name,
                    type: type,
                    // user_id removed - backend gets it from JWT token
                });

                if (parentCategory && cat.sub) {
                    for (const subName of cat.sub) {
                        try {
                            await Category.create({
                                name: subName,
                                type: type,
                                parent_id: parentCategory.id,
                                // user_id removed - backend gets it from JWT token
                            });
                        } catch (subError) {
                            console.error(`Failed to create subcategory ${subName}:`, subError);
                        }
                    }
                }
            }
        }
        console.log('✅ Default categories setup complete');
    } catch(e) {
        console.error("❌ Failed to set up default categories", e);
    } finally {
        setIsSettingUp(false);
        isSettingUpRef.current = false;
    }
  }, []); // Empty dependency array as it only depends on fixed data and async calls

  const loadData = useCallback(async () => {
    // Prevent multiple loads
    if (hasLoadedOnce.current) {
      console.log('📋 Data already loaded, skipping...');
      return;
    }

    setIsLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);

      // Only load categories - removed transaction loading for performance
      const categoriesData = await loadCategories();

      // Transactions are no longer needed for category display
      // Transaction counts can be added later via a backend API endpoint if needed

      // If no categories exist for the user, set up defaults ONLY ONCE
      if (categoriesData.length === 0 && user && !isSettingUpRef.current) {
        console.log('📦 No categories found, setting up defaults...');
        await setupDefaultCategories(user);
        // After setup, reload categories to show the newly created ones
        await loadCategories();
      }

      hasLoadedOnce.current = true;
    } catch (error) {
      console.error('❌ Error loading data:', error);
    }
    setIsLoading(false);
  }, [setupDefaultCategories, loadCategories]); // loadCategories is now stable

  useEffect(() => {
    loadData();
  }, []); // Only run once on mount

  const handleResetCategories = async () => {
    if (!window.confirm('This will delete ALL categories and recreate them with subcategories. Any custom categories you created will be lost. Continue?')) {
      return;
    }

    setIsSettingUp(true);
    try {
      // Delete all existing categories
      console.log('Deleting all categories...');
      for (const category of categories) {
        await Category.delete(category.id);
      }
      console.log('All categories deleted');

      // Recreate default categories with subcategories
      if (currentUser) {
        await setupDefaultCategories(currentUser);
        // Reload data
        await loadData();
      }
    } catch (error) {
      console.error('Error resetting categories:', error);
      alert('Failed to reset categories. Please try again.');
    } finally {
      setIsSettingUp(false);
    }
  };

  const handleAddNew = (type = activeTab, parentId = null) => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleDelete = async (categoryId) => {
    // Check if category has subcategories
    const subcategories = categories.filter(c => c.parent_id === categoryId);
    if (subcategories.length > 0) {
      if (!window.confirm(`This category has ${subcategories.length} subcategories. Deleting it will also delete all subcategories. Continue?`)) {
        return;
      }

      // Delete subcategories first
      for (const subcategory of subcategories) {
        await Category.delete(subcategory.id);
      }
    } else {
      // Simple confirmation for categories without subcategories
      if (!window.confirm('Are you sure you want to delete this category?')) {
        return;
      }
    }

    try {
      await Category.delete(categoryId);
      loadData();
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Failed to delete category.");
    }
  };

  const handleSave = async (formData) => {
    try {
      let categoryData = {
        ...formData,
        // Ensure new categories are associated with the current user
      };

      if (editingCategory && editingCategory.id) {
        // If editing, only update existing data, keep icon_url if not explicitly changed
        await Category.update(editingCategory.id, categoryData);
      } else {
        // AI Icon Generation for new categories only if no icon is explicitly provided
        if (!categoryData.icon_url) {
          try {
            const iconPrompt = `a simple, modern, flat icon for a financial category: ${formData.name}, on a plain white background, vector art, minimal design`;
            const imageResult = await GenerateImage({ prompt: iconPrompt });
            if (imageResult.url) {
              categoryData.icon_url = imageResult.url;
            }
          } catch (error) {
            console.warn("Could not generate category icon:", error);
            // Continue without an icon if generation fails
          }
        }
        
        await Category.create({
          ...categoryData,
          type: editingCategory?.type || activeTab // Use type from editingCategory if it's a subcategory creation, else activeTab
        });
      }

      setIsFormOpen(false);
      setEditingCategory(null);
      loadData();
    } catch (error) {
      console.error("Error saving category:", error);
      alert("Failed to save category.");
    }
  };

  const handleAddSubcategory = (parentCategory) => {
    setEditingCategory({ parent_id: parentCategory.id, type: parentCategory.type });
    setIsFormOpen(true);
  };

  // Deduplicate categories by ID to prevent display issues
  const deduplicateById = (categories) => {
    const unique = categories.filter((cat, index, self) =>
      index === self.findIndex((c) => c.id === cat.id)
    );
    if (categories.length !== unique.length) {
      console.warn('Duplicate categories detected and removed:', categories.length - unique.length);
    }
    return unique;
  };

  const getCategoriesByType = (type) => {
    const filtered = categories.filter(c => c.type === type && !c.parent_id);
    return deduplicateById(filtered);
  };

  const getSubcategories = (parentId) => {
    const filtered = categories.filter(c => c.parent_id === parentId);
    return deduplicateById(filtered);
  };

  const getCategoryTransactionCount = (categoryId) => {
    // Transaction counts removed for performance - can be added back via backend API
    return null; // Return null to hide counts in UI
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Categories</h1>
          <p className="text-slate-600 mt-1">Organize your income and expenses</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleAddNew(activeTab)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>
                {editingCategory && editingCategory.id ? "Edit Category" : "Add New Category"}
              </DialogTitle>
            </DialogHeader>
            <CategoryForm
              category={editingCategory}
              defaultType={activeTab}
              onSubmit={handleSave}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingCategory(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <CategoryStats
        categories={categories}
        transactions={[]} // Empty array for performance - stats will show category counts only
        isLoading={isLoading}
      />
      
      {isSettingUp && (
        <div className="text-center p-8 bg-blue-50 rounded-lg">
            <p className="font-semibold text-blue-700">One moment... we're setting up some smart categories for you!</p>
            <p className="text-sm text-blue-600">This only happens once.</p>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full md:w-auto">
          <TabsTrigger value="expense" className="flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            Expenses
          </TabsTrigger>
          <TabsTrigger value="income" className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
            Income
          </TabsTrigger>
          <TabsTrigger value="transfer" className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            Transfer
          </TabsTrigger>
        </TabsList>

        {["expense", "income", "transfer"].map((type) => (
          <TabsContent key={type} value={type} className="space-y-6 mt-6">
            <div className="grid gap-6">
              {isLoading || isSettingUp ? ( // Also show skeleton if setting up
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array(3).fill(0).map((_, i) => (
                    <CategoryCard.Skeleton key={i} />
                  ))}
                </div>
              ) : (
                <>
                  {getCategoriesByType(type).length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed border-slate-300 rounded-xl">
                      <FolderTree className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                      <h3 className="text-xl font-semibold text-slate-800 mb-2">
                        No {type} categories yet
                      </h3>
                      <p className="text-slate-500 mb-4">
                        Create your first {type} category to start organizing your transactions.
                      </p>
                      <Button 
                        onClick={() => handleAddNew(type)} 
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add {type} Category
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {getCategoriesByType(type).map((category) => (
                        <CategoryCard
                          key={category.id}
                          category={category}
                          subcategories={getSubcategories(category.id)}
                          transactionCount={getCategoryTransactionCount(category.id)}
                          onEdit={() => handleEdit(category)}
                          onDelete={() => handleDelete(category.id)}
                          onAddSubcategory={() => handleAddSubcategory(category)}
                          onEditSubcategory={handleEdit}
                          onDeleteSubcategory={handleDelete}
                          getSubcategoryTransactionCount={getCategoryTransactionCount}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
