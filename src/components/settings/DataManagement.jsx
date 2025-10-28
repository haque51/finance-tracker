import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Category } from "@/api/entities";
import { AlertTriangle, RefreshCw, Trash2, PartyPopper } from "lucide-react";

// Default categories and subcategories
const DEFAULT_CATEGORIES = {
    expense: [
        { name: 'Housing', sub: ['Rent/Mortgage', 'Maintenance & Repairs', 'HOA/Condo Fees', 'Property Tax', 'Utilities & Bills', 'Electricity', 'Gas/Heating', 'Water/Sewer/Trash', 'Internet', 'Mobile Phone'] },
        { name: 'Transportation', sub: ['Fuel', 'Public Transit', 'Rideshare/Taxi', 'Parking & Tolls', 'Maintenance & Repairs', 'Registration/Inspection'] },
        { name: 'Food & Drink', sub: ['Groceries', 'Restaurants', 'Takeout/Delivery', 'Coffee & Snacks', 'Bars/Alcohol'] },
        { name: 'Health & Medical', sub: ['Doctor/Dentist/Clinic', 'Pharmacy', 'Mental Health', 'Vision', 'Medical Devices'] },
        { name: 'Insurance', sub: ['Health Insurance', 'Auto Insurance', 'Home/Renters Insurance', 'Life/Disability', 'Other Insurance'] },
        { name: 'Debt & Loans', sub: ['Credit Card Payment', 'Student Loan', 'Auto Loan/Lease', 'Personal Loan'] },
        { name: 'Shopping & Household', sub: ['Household Supplies', 'Furniture/Appliances', 'Electronics', 'Clothing & Accessories', 'Office/School Supplies'] },
        { name: 'Personal & Family', sub: ['Personal Care (hair, cosmetics, etc.)', 'Childcare/Kids', 'Pet Care', 'Gifts & Donations'] },
        { name: 'Entertainment & Subscriptions', sub: ['Streaming Services', 'Music/Books/Games', 'Events/Movies/Concerts', 'Hobbies', 'Apps/Software'] },
        { name: 'Taxes & Government & Fees', sub: ['Income Tax', 'Other Taxes & Duties', 'Bank Fees', 'Interest & Late Fees'] },
        { name: 'Travel & Experiences', sub: ['Flights/Long-distance Transport', 'Lodging', 'Local Transport/Car Rental', 'Activities/Tours', 'Trip Miscellaneous'] }
    ],
    income: [
        { name: 'Wages', sub: ['Salary', 'Bonus', 'Commission'] },
        { name: 'Other Income', sub: ['Investment', 'Gift', 'Rental Income'] }
    ]
};

export default function DataManagement({ user }) {
  const [isResetting, setIsResetting] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleResetCategories = async () => {
    if (confirmText !== "RESET CATEGORIES") {
      alert('Please type "RESET CATEGORIES" to confirm.');
      return;
    }

    if (!user || !user.id) {
      alert('Error: User not loaded. Please refresh the page and try again.');
      console.error('User is not loaded:', user);
      return;
    }

    setIsResetting(true);
    setShowSuccessAlert(false);

    try {
      console.log('=== CATEGORY RESET START ===');
      console.log('User ID:', user.id);

      // 1. Delete all existing categories for the user
      // First get all parent categories
      console.log('Step 1: Fetching parent categories...');
      const parentCategories = await Category.filter({});
      console.log(`Found ${parentCategories.length} parent categories`);

      // For each parent, fetch its children and delete them
      console.log('Step 2: Deleting all subcategories...');
      let totalSubcategoriesDeleted = 0;

      for (const parent of parentCategories) {
        try {
          // Fetch children of this parent - try both parentId and parent_id
          console.log(`  Querying children of "${parent.name}" (${parent.id})...`);
          let children = await Category.filter({ parentId: parent.id });
          console.log(`  Got ${children.length} children with parentId filter`);

          if (children.length === 0) {
            // Try snake_case
            children = await Category.filter({ parent_id: parent.id });
            console.log(`  Got ${children.length} children with parent_id filter`);
          }

          if (children && children.length > 0) {
            console.log(`  Parent "${parent.name}" has ${children.length} subcategories`);

            for (const child of children) {
              console.log(`    Deleting subcategory: ${child.name} (${child.id})`);
              await Category.delete(child.id);
              totalSubcategoriesDeleted++;
            }
          }
        } catch (error) {
          console.error(`Error processing parent ${parent.name}:`, error);
          // Continue with other parents even if one fails
        }
      }

      console.log(`Deleted ${totalSubcategoriesDeleted} subcategories total`);

      // Now delete all parent categories (they should have no children now)
      console.log('Step 3: Deleting all parent categories...');
      for (let i = 0; i < parentCategories.length; i++) {
        const parent = parentCategories[i];
        console.log(`  Deleting parent ${i + 1}/${parentCategories.length}: ${parent.name} (${parent.id})`);
        await Category.delete(parent.id);

        // Add delay to avoid rate limiting (every 10 deletions, wait 1 second)
        if ((i + 1) % 10 === 0) {
          console.log(`  Pausing to avoid rate limit...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      console.log('All existing categories deleted');

      // 2. Setup default categories
      console.log('Step 2: Creating default categories...');
      let categoriesCreated = 0;
      for (const type in DEFAULT_CATEGORIES) {
        console.log(`Creating ${type} categories...`);
        for (const cat of DEFAULT_CATEGORIES[type]) {
          console.log(`Creating parent category: ${cat.name}`);
          const parentCategory = await Category.create({
            name: cat.name,
            type: type,
            // NOTE: Don't send user_id - backend gets it from JWT token automatically
          });

          console.log('Parent category response:', parentCategory);

          if (!parentCategory || !parentCategory.id) {
            console.error('ERROR: Category creation returned null or missing id');
            console.error('Category name:', cat.name);
            throw new Error(`Failed to create parent category: ${cat.name}`);
          }

          console.log(`Created parent: ${parentCategory.name} with ID: ${parentCategory.id}`);
          categoriesCreated++;

          if (parentCategory && cat.sub) {
            console.log(`Creating ${cat.sub.length} subcategories for ${cat.name}...`);
            for (let j = 0; j < cat.sub.length; j++) {
              const subName = cat.sub[j];
              console.log(`Creating subcategory: ${subName}`);
              await Category.create({
                name: subName,
                type: type,
                parent_id: parentCategory.id,
                // NOTE: Don't send user_id - backend gets it from JWT token automatically
              });
              categoriesCreated++;

              // Add delay to avoid rate limiting (every 10 creates, wait 500ms)
              if (categoriesCreated % 10 === 0) {
                console.log(`  Pausing to avoid rate limit...`);
                await new Promise(resolve => setTimeout(resolve, 500));
              }
            }
          }

          // Add small delay between parent categories
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      console.log(`Successfully created ${categoriesCreated} categories total`);
      console.log('=== CATEGORY RESET COMPLETE ===');

      setShowSuccessAlert(true);

    } catch (error) {
      console.error("=== CATEGORY RESET ERROR ===");
      console.error("Error details:", error);
      console.error("Error message:", error.message);
      console.error("Error response:", error.response);
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
      }
      alert("An error occurred while resetting categories. Please check the console for details.");
    }

    setIsResetting(false);
    setConfirmText("");
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
        {showSuccessAlert && (
            <Alert className="border-emerald-200 bg-emerald-50">
                <PartyPopper className="h-4 w-4 text-emerald-600" />
                <AlertTitle className="text-emerald-800 font-semibold">Success!</AlertTitle>
                <AlertDescription className="text-emerald-700">
                    Your categories have been reset to the default settings.
                </AlertDescription>
            </Alert>
        )}
        <Card className="shadow-sm border-amber-200 bg-amber-50/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-800">
                    <RefreshCw className="w-5 h-5" />
                    Category Management
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-amber-900">
                    This action will delete all your current expense and income categories and replace them with the app's default list. This cannot be undone.
                </p>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button
                            variant="outline"
                            className="border-amber-300 bg-white hover:bg-amber-100/50"
                            disabled={!user || !user.id}
                        >
                            {!user ? 'Loading...' : 'Reset Categories to Default'}
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <AlertTriangle className="text-red-500" />
                                Are you absolutely sure?
                            </DialogTitle>
                            <DialogDescription>
                                This will permanently delete all your existing categories and subcategories. Your transactions will not be deleted, but they will become uncategorized. This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <Label htmlFor="confirm-reset" className="font-bold text-red-600">
                                To confirm, please type "RESET CATEGORIES"
                            </Label>
                            <Input
                                id="confirm-reset"
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                                placeholder="RESET CATEGORIES"
                                className="border-red-300 focus:border-red-500"
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button
                                onClick={handleResetCategories}
                                disabled={confirmText !== "RESET CATEGORIES" || isResetting}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                {isResetting ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                        Resetting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        I understand, reset my categories
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    </div>
  );
}