'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ChatIA from '@/components/dashboard/ChatIA'
import {
  LayoutDashboard,
  Activity,
  CreditCard,
  Map,
  TrendingUp,
  Award,
  Heart,
  Tag,
  LogOut,
  Lock,
  ChevronRight,
  TrendingDown,
} from 'lucide-react'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Painel Geral',
  '/dashboard/diagnostico': 'Diagnóstico Financeiro',
  '/dashboard/dividas': 'Minhas Dívidas',
  '/dashboard/plano': 'Plano de Ação',
  '/dashboard/receita': 'Aumento de Receita',
  '/dashboard/lideranca': 'Liderança',
  '/dashboard/proposito': 'Propósito',
  '/planos': 'Planos e Preços',
}

const PLAN_BADGE: Record<string, { label: string; color: string }> = {
  ESSENCIAL: { label: 'Essencial', color: 'bg-gray-100 text-gray-600' },
  PRO: { label: 'Pro', color: 'bg-emerald-100 text-emerald-700' },
  ELITE: { label: 'Elite', color: 'bg-amber-100 text-amber-700' },
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<{ email: string; nome: string; plano: string } | null>(null)

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()
      if (!authUser) return router.push('/login')

      const res = await fetch('/api/usuario')
      if (res.ok) {
        const data = await res.json()
        setUser({ email: data.email, nome: data.nome || authUser.email!, plano: data.plano })
      }
    }
    loadUser()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const plano = user?.plano ?? 'ESSENCIAL'
  const badge = PLAN_BADGE[plano]

  const navItems = [
    { href: '/dashboard', label: 'Painel Geral', icon: LayoutDashboard, locked: false },
    { href: '/dashboard/diagnostico', label: 'Diagnóstico', icon: Activity, locked: false },
    { href: '/dashboard/dividas', label: 'Minhas Dívidas', icon: CreditCard, locked: false },
    { href: '/dashboard/plano', label: 'Plano de Ação', icon: Map, locked: false },
    {
      href: '/dashboard/receita',
      label: 'Aumento de Receita',
      icon: TrendingUp,
      locked: plano === 'ESSENCIAL',
    },
    {
      href: '/dashboard/lideranca',
      label: 'Liderança',
      icon: Award,
      locked: plano === 'ESSENCIAL',
    },
    {
      href: '/dashboard/proposito',
      label: 'Propósito',
      icon: Heart,
      locked: plano !== 'ELITE',
    },
    { href: '/planos', label: 'Planos e Preços', icon: Tag, locked: false },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col fixed h-full z-40">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-emerald-600 rounded-xl p-1.5">
              <TrendingDown className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-800">Quita</span>
          </div>
          {badge && (
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${badge.color}`}>
              {badge.label}
            </span>
          )}
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.locked && <Lock className="w-3 h-3 text-gray-400" />}
                {active && <ChevronRight className="w-3 h-3" />}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="mb-3">
            <p className="text-xs font-semibold text-gray-800 truncate">
              {user?.nome || 'Usuário'}
            </p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 ml-64 flex flex-col">
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <h1 className="text-lg font-semibold text-gray-800">
            {PAGE_TITLES[pathname] || 'Dashboard'}
          </h1>
          <button
            onClick={() => {
              const btn = document.querySelector<HTMLButtonElement>('.chat-trigger')
              btn?.click()
            }}
            className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-sm font-medium px-4 py-2 rounded-xl transition-colors"
          >
            Pedir conselho à IA
          </button>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>

      <ChatIA />
    </div>
  )
}
