

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  LayoutDashboard, 
  CreditCard, 
  Receipt, 
  FolderTree, 
  Settings,
  Target,
  TrendingUp,
  Wallet,
  BrainCircuit,
  ClipboardCheck,
  Repeat,
  PiggyBank,
  FilePieChart,
  TrendingDown, // New icon for debt management
  Zap // New icon for insights
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import UserMenu from "@/components/layout/UserMenu";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
  },
  {
    title: "Accounts",
    url: createPageUrl("Accounts"),
    icon: CreditCard,
  },
  {
    title: "Transactions", 
    url: createPageUrl("Transactions"),
    icon: Receipt,
  },
  {
    title: "Budget",
    url: createPageUrl("Budget"),
    icon: PiggyBank,
  },
  {
    title: "Reports",
    url: createPageUrl("Reports"),
    icon: FilePieChart,
  },
  {
    title: "Categories",
    url: createPageUrl("Categories"),
    icon: FolderTree,
  },
  {
    title: "Recurring",
    url: createPageUrl("Recurring"),
    icon: Repeat,
  },
  {
    title: "Reconciliation",
    url: createPageUrl("Reconciliation"),
    icon: ClipboardCheck,
  },
  {
    title: "Goals",
    url: createPageUrl("Goals"),
    icon: Target,
  },
  {
    title: "Debt Payoff", // New navigation item
    url: createPageUrl("DebtPayoff"),
    icon: TrendingDown,
  },
  {
    title: "Insights", // New navigation item
    url: createPageUrl("Insights"),
    icon: Zap,
  },
  {
    title: "Forecast",
    url: createPageUrl("Forecast"),
    icon: BrainCircuit,
  },
  {
    title: "Settings",
    url: createPageUrl("Settings"),
    icon: Settings,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [theme, setTheme] = useState(() => {
    // Initialize from localStorage first, fallback to system
    const savedTheme = localStorage.getItem('app-theme');
    return savedTheme || 'system';
  });

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    // Save to localStorage for immediate persistence
    localStorage.setItem('app-theme', newTheme);
  };

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.remove('light', 'dark');
      root.classList.add(systemTheme);
    } else {
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
    }
  }, [theme]);


  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar className="border-r border-border/60 glass-effect">
          <SidebarHeader className="border-b border-border/50 px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg
                  className="w-5 h-5 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2L2 7L12 12L22 7L12 2Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 17L12 22L22 17"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 12L12 17L22 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <h2 className="font-bold text-foreground text-base">LuminaFinance</h2>
                <p className="text-xs text-muted-foreground font-medium">Personal Finance</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="px-4 py-6">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2 mb-3">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`transition-all duration-200 rounded-xl px-3 py-3 ${
                          location.pathname === item.url 
                            ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 font-semibold border border-indigo-200 shadow-sm' 
                            : 'hover:bg-accent/80 text-muted-foreground hover:text-foreground border border-transparent hover:border-border/80'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3">
                          <item.icon className="w-4 h-4 shrink-0" />
                          <span className="font-medium text-sm">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-border/50 p-4">
            <UserMenu onThemeChange={handleThemeChange} />
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col min-w-0">
          <header className="glass-effect border-b border-border/50 px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-accent p-2 rounded-lg transition-colors duration-200" />
              <h1 className="text-lg font-semibold text-foreground">LuminaFinance</h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

