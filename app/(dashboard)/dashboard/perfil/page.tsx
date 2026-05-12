'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User, Shield, Tag, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react'

const PLAN_BADGE: Record<string, { label: string; color: string }> = {
  ESSENCIAL: { label: 'Essencial', color: 'bg-gray-100 text-gray-700' },
  PRO: { label: 'Pro', color: 'bg-emerald-100 text-emerald-700' },
  ELITE: { label: 'Elite', color: 'bg-amber-100 text-amber-700' },
}

export default function PerfilPage() {
  const router = useRouter()
  const supabase = createClient()

  const [dadosPessoais, setDadosPessoais] = useState({ nome: '', email: '', telefone: '' })
  const [senhas, setSenhas] = useState({ atual: '', nova: '', confirmar: '' })
  const [plano, setPlano] = useState('ESSENCIAL')

  const [salvandoDados, setSalvandoDados] = useState(false)
  const [salvandoSenha, setSalvandoSenha] = useState(false)
  const [msgDados, setMsgDados] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null)
  const [msgSenha, setMsgSenha] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null)

  useEffect(() => {
    async function carregar() {
      const res = await fetch('/api/perfil')
      if (res.ok) {
        const data = await res.json()
        setDadosPessoais({
          nome: data.nome ?? '',
          email: data.email ?? '',
          telefone: data.telefone ?? '',
        })
        setPlano(data.plano ?? 'ESSENCIAL')
      }
    }
    carregar()
  }, [])

  async function handleSalvarDados(e: React.FormEvent) {
    e.preventDefault()
    setSalvandoDados(true)
    setMsgDados(null)
    console.log('[perfil] salvando dados pessoais:', dadosPessoais)
    try {
      const res = await fetch('/api/perfil', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: dadosPessoais.nome, telefone: dadosPessoais.telefone }),
      })
      if (res.ok) {
        setMsgDados({ tipo: 'ok', texto: 'Dados atualizados com sucesso!' })
      } else {
        const err = await res.json()
        console.error('[perfil] erro ao salvar dados:', err)
        setMsgDados({ tipo: 'erro', texto: 'Erro ao salvar. Tente novamente.' })
      }
    } catch (err) {
      console.error('[perfil] erro de rede:', err)
      setMsgDados({ tipo: 'erro', texto: 'Erro de conexão.' })
    } finally {
      setSalvandoDados(false)
    }
  }

  async function handleAlterarSenha(e: React.FormEvent) {
    e.preventDefault()
    setMsgSenha(null)

    if (senhas.nova !== senhas.confirmar) {
      setMsgSenha({ tipo: 'erro', texto: 'As senhas não coincidem.' })
      return
    }
    if (senhas.nova.length < 6) {
      setMsgSenha({ tipo: 'erro', texto: 'A nova senha deve ter pelo menos 6 caracteres.' })
      return
    }

    setSalvandoSenha(true)
    console.log('[perfil] alterando senha...')
    try {
      const { error } = await supabase.auth.updateUser({ password: senhas.nova })
      if (error) {
        console.error('[perfil] erro ao alterar senha:', error)
        setMsgSenha({ tipo: 'erro', texto: error.message || 'Erro ao alterar senha.' })
      } else {
        setSenhas({ atual: '', nova: '', confirmar: '' })
        setMsgSenha({ tipo: 'ok', texto: 'Senha alterada com sucesso!' })
      }
    } catch (err) {
      console.error('[perfil] erro de rede:', err)
      setMsgSenha({ tipo: 'erro', texto: 'Erro de conexão.' })
    } finally {
      setSalvandoSenha(false)
    }
  }

  async function handleExcluirConta() {
    const confirmado = window.confirm(
      'Tem certeza que deseja excluir sua conta? Esta ação é irreversível e todos os seus dados serão perdidos.'
    )
    if (!confirmado) return
    await supabase.auth.signOut()
    router.push('/login')
  }

  const badge = PLAN_BADGE[plano]

  function Feedback({ msg }: { msg: { tipo: 'ok' | 'erro'; texto: string } | null }) {
    if (!msg) return null
    return (
      <div className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm mt-4 ${
        msg.tipo === 'ok'
          ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
          : 'bg-red-50 border border-red-200 text-red-600'
      }`}>
        {msg.tipo === 'ok'
          ? <CheckCircle className="w-4 h-4 flex-shrink-0" />
          : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
        {msg.texto}
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-6">

      {/* Dados pessoais */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-5">
          <div className="bg-blue-50 rounded-xl p-2">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="font-semibold text-gray-800">Dados pessoais</h2>
        </div>
        <form onSubmit={handleSalvarDados} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Nome completo</label>
            <input
              type="text"
              value={dadosPessoais.nome}
              onChange={(e) => setDadosPessoais({ ...dadosPessoais, nome: e.target.value })}
              placeholder="Seu nome"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Email</label>
            <input
              type="email"
              value={dadosPessoais.email}
              readOnly
              className="w-full border border-gray-100 bg-gray-50 rounded-xl px-3 py-2.5 text-sm text-gray-400 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">O email não pode ser alterado.</p>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Telefone</label>
            <input
              type="tel"
              value={dadosPessoais.telefone}
              onChange={(e) => setDadosPessoais({ ...dadosPessoais, telefone: e.target.value })}
              placeholder="(11) 99999-9999"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <Feedback msg={msgDados} />
          <button
            type="submit"
            disabled={salvandoDados}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
          >
            {salvandoDados ? 'Salvando...' : 'Salvar dados'}
          </button>
        </form>
      </div>

      {/* Segurança */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-5">
          <div className="bg-emerald-50 rounded-xl p-2">
            <Shield className="w-5 h-5 text-emerald-600" />
          </div>
          <h2 className="font-semibold text-gray-800">Segurança</h2>
        </div>
        <form onSubmit={handleAlterarSenha} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Senha atual</label>
            <input
              type="password"
              value={senhas.atual}
              onChange={(e) => setSenhas({ ...senhas, atual: e.target.value })}
              placeholder="••••••••"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Nova senha</label>
            <input
              type="password"
              value={senhas.nova}
              onChange={(e) => setSenhas({ ...senhas, nova: e.target.value })}
              placeholder="Mínimo 6 caracteres"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Confirmar nova senha</label>
            <input
              type="password"
              value={senhas.confirmar}
              onChange={(e) => setSenhas({ ...senhas, confirmar: e.target.value })}
              placeholder="Repita a nova senha"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <Feedback msg={msgSenha} />
          <button
            type="submit"
            disabled={salvandoSenha || !senhas.nova}
            className="bg-gray-800 hover:bg-gray-900 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
          >
            {salvandoSenha ? 'Alterando...' : 'Alterar senha'}
          </button>
        </form>
      </div>

      {/* Plano atual */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-5">
          <div className="bg-amber-50 rounded-xl p-2">
            <Tag className="w-5 h-5 text-amber-600" />
          </div>
          <h2 className="font-semibold text-gray-800">Plano atual</h2>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-2">Seu plano ativo</p>
            <span className={`text-sm font-bold px-3 py-1.5 rounded-full ${badge?.color}`}>
              {badge?.label}
            </span>
          </div>
          <button
            onClick={() => router.push('/planos')}
            className="border border-emerald-600 text-emerald-600 hover:bg-emerald-50 font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
          >
            Ver planos
          </button>
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-white rounded-2xl p-6 border border-red-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-red-50 rounded-xl p-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <h2 className="font-semibold text-gray-800">Zona de perigo</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Excluir sua conta é permanente. Todos os seus dados serão removidos e não poderão ser recuperados.
        </p>
        <button
          onClick={handleExcluirConta}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
        >
          Excluir minha conta
        </button>
      </div>

    </div>
  )
}
