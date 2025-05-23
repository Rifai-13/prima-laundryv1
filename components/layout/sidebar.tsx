import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ClipboardList,
  FileBarChart,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/layout/mode-toggle";
import { useState, useEffect } from "react";

const navItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    name: "Transactions",
    href: "/transactions",
    icon: <ClipboardList className="h-5 w-5" />,
  },
  {
    name: "Reports",
    href: "/reports",
    icon: <FileBarChart className="h-5 w-5" />,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [name, setName] = useState<string>("");

const fetchUser = async () => {
  try {
    const response = await fetch("/api/auth/me", {
      credentials: "include",
    });

    const data = await response.json();
    
    if (!response.ok) {
      if (response.status === 401) {
        router.push("/signin");
      }
      throw new Error(data.error || "Failed to fetch user");
    }

    setName(data.user.name);
  } catch (error: any) {
    console.error("Fetch user error:", error);
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive",
    });
  }
};

  // Fungsi untuk handle signout
  const handleSignOut = async () => {
    try {
      const response = await fetch("/api/auth/signout", {
        method: "POST",
      });

      if (response.ok) {
        // Redirect ke halaman login setelah signout
        router.push("/signin");
      }
    } catch (error) {
      console.error("Gagal signout:", error);
    }
  };

  // Ambil data user saat komponen dimount
  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <div className="flex h-screen flex-col border-r bg-background">
      <div className="flex h-14 items-center border-b px-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-semibold"
        >
          <span className="text-blue-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <path d="M14 3.45v9.95" />
              <path d="M18.15 4.75A9.33 9.33 0 0 0 14 3.5" />
              <path d="M11.85 20.5a9 9 0 0 1-8.38-5.62" />
              <path d="M7 16.9a9.02 9.02 0 0 0 6.85 2.9" />
              <path d="M10.32 19.1a1.8 1.8 0 0 0 2.56.8 1.77 1.77 0 0 0 .6-2.1L11.72 14" />
              <path d="M14 12.46l6.28 2.84c.65.3.86 1.13.56 1.77a1.33 1.33 0 0 1-1.82.5l-6.28-2.84" />
              <path d="M4.1 8.44l3.2 7.06" />
              <path d="M10.9 4.06A1.8 1.8 0 0 0 8.9 7.51" />
              <path d="M6.75 5.3A1.17 1.17 0 0 1 8 7.04" />
            </svg>
          </span>
          <span>Prima Laundry</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm font-medium">
          {navItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground",
                pathname === item.href
                  ? "bg-secondary text-foreground"
                  : "hover:bg-accent"
              )}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-auto p-4 border-t">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="icon" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-2">
            <ModeToggle />
            <div className="flex items-center space-x-1">
              <span className="relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full">
                <span className="flex h-full w-full items-center justify-center rounded-full bg-muted">
                  {name ? name.charAt(0).toUpperCase() : "U"}
                </span>
              </span>
              <div className="text-sm">
                <p className="font-medium">{name || "User"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function toast(arg0: { title: string; description: any; variant: string; }) {
  throw new Error("Function not implemented.");
}

