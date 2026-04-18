"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { APP_VERSION } from "@/lib/version";

interface UserInfo {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface NavItem {
  label: string;
  href: string;
  adminOnly?: boolean;
}

const NAV: NavSection[] = [
  {
    title: "Contenu",
    items: [
      { label: "Accueil (sections)", href: "/admin" },
      { label: "Pages", href: "/admin/pages" },
      { label: "Médiathèque", href: "/admin/media" },
      { label: "Menus", href: "/admin/menus" },
    ],
  },
  {
    title: "Compte",
    items: [
      { label: "Utilisateurs", href: "/admin/users", adminOnly: true },
      { label: "Mon mot de passe", href: "/admin/password" },
      { label: "Historique", href: "/admin/audit", adminOnly: true },
    ],
  },
];

export function AdminShell({
  children,
  title,
  actions,
}: {
  children: ReactNode;
  title?: string;
  actions?: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMe() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          router.push("/admin/login");
          return;
        }
        const data = await res.json();
        setUser(data.user);
      } catch {
        router.push("/admin/login");
      } finally {
        setLoading(false);
      }
    }
    fetchMe();
  }, [router]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#c2185b] border-t-transparent" />
      </div>
    );
  }

  const isAdmin = user?.role === "admin";

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Image src="/logo.svg" alt="BK Pulse" width={100} height={33} className="h-8 w-auto" />
            </Link>
            <span
              className="text-xs font-bold text-white px-2.5 py-1 rounded-full"
              style={{ background: "linear-gradient(135deg, #c2185b, #ea580c)" }}
            >
              ADMIN
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-400 hover:text-red-500 transition-colors font-medium"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
        <aside className="w-64 shrink-0">
          <nav className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden sticky top-20">
            {NAV.map((section) => (
              <div key={section.title}>
                <div className="p-4 border-b border-gray-100">
                  <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">{section.title}</h2>
                </div>
                <ul className="p-2">
                  {section.items
                    .filter((item) => !item.adminOnly || isAdmin)
                    .map((item) => {
                      const isActive =
                        item.href === "/admin"
                          ? pathname === "/admin"
                          : pathname === item.href || pathname.startsWith(item.href + "/");
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                              isActive
                                ? "text-[#c2185b] bg-rose-50 font-bold"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                          >
                            {item.label}
                          </Link>
                        </li>
                      );
                    })}
                </ul>
              </div>
            ))}
            <div className="p-3 border-t border-gray-100 text-center">
              <span className="text-[10px] font-mono text-gray-400">v{APP_VERSION}</span>
            </div>
          </nav>
        </aside>

        <main className="flex-1 min-w-0">
          {title ? (
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-extrabold text-gray-900">{title}</h1>
              {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
            </div>
          ) : null}
          {children}
        </main>
      </div>
    </div>
  );
}
