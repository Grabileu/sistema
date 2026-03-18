import React, { useMemo, useState } from 'react'
import { ShieldCheck, Save, RotateCcw, AlertTriangle } from 'lucide-react'
import { ProfilePermissions, PERMISSION_GROUPS, PERMISSION_LABELS, DEFAULT_PROFILE_PERMISSIONS, mergeWithDefaults } from '../utils/permissions'
import type { SistemaUsuario } from '../App'

interface PermissoesPerfisProps {
  permissions: ProfilePermissions
  onSave: (permissions: ProfilePermissions) => void
}

const PERFIL_LABELS: Record<SistemaUsuario['perfil'], string> = {
  admin: 'Administrador',
  rh: 'RH',
  gestor: 'Gestor',
  colaborador: 'Colaborador',
}

const PERFIL_COLOR: Record<SistemaUsuario['perfil'], string> = {
  admin: 'bg-violet-100 text-violet-800 border-violet-200',
  rh: 'bg-blue-100 text-blue-700 border-blue-200',
  gestor: 'bg-amber-100 text-amber-800 border-amber-200',
  colaborador: 'bg-gray-100 text-gray-700 border-gray-200',
}

const PermissoesPerfis: React.FC<PermissoesPerfisProps> = ({ permissions, onSave }) => {
  const [selectedPerfil, setSelectedPerfil] = useState<SistemaUsuario['perfil']>('rh')
  const [localPermissions, setLocalPermissions] = useState<ProfilePermissions>(() => mergeWithDefaults(permissions))
  const [toast, setToast] = useState<string | null>(null)

  const isDirty = useMemo(
    () => JSON.stringify(localPermissions) !== JSON.stringify(mergeWithDefaults(permissions)),
    [localPermissions, permissions]
  )

  const updatePermission = (key: keyof ProfilePermissions['rh'], value: boolean) => {
    if (selectedPerfil === 'admin') return

    setLocalPermissions(prev => ({
      ...prev,
      [selectedPerfil]: {
        ...prev[selectedPerfil],
        [key]: value,
      },
    }))
  }

  const handleSave = () => {
    const normalized = mergeWithDefaults(localPermissions)
    onSave(normalized)
    setLocalPermissions(normalized)
    setToast('Permissões salvas com sucesso.')
    setTimeout(() => setToast(null), 3000)
  }

  const handleResetDefaults = () => {
    const defaults = mergeWithDefaults(DEFAULT_PROFILE_PERMISSIONS)
    setLocalPermissions(defaults)
    setToast('Permissões restauradas para o padrão.')
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {toast && (
        <div className="fixed right-5 top-5 z-[90] w-full max-w-sm">
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 shadow-lg text-sm text-green-800">
            {toast}
          </div>
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Permissões por perfil</h1>
          <p className="mt-1 text-sm text-gray-500">
            Defina o que cada perfil pode acessar no sistema. Somente administradores podem alterar esta tela.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <RotateCcw size={16} />
            Restaurar padrão
          </button>
          <button
            onClick={handleSave}
            disabled={!isDirty}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save size={16} />
            Salvar alterações
          </button>
        </div>
      </div>

      <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
        <p className="font-semibold">Subgrupo de controle de acesso</p>
        <p className="mt-1">
          Escolha o perfil abaixo e marque quais módulos estarão liberados.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {(['admin', 'rh', 'gestor', 'colaborador'] as SistemaUsuario['perfil'][]).map((perfil) => (
          <button
            key={perfil}
            onClick={() => setSelectedPerfil(perfil)}
            className={`rounded-xl border px-3 py-3 text-left transition ${
              selectedPerfil === perfil
                ? `${PERFIL_COLOR[perfil]} shadow-sm`
                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} />
              <span className="text-sm font-semibold">{PERFIL_LABELS[perfil]}</span>
            </div>
            <p className="mt-1 text-xs opacity-80">
              {perfil === 'admin' ? 'Acesso total (fixo)' : 'Permissões configuráveis'}
            </p>
          </button>
        ))}
      </div>

      {selectedPerfil === 'admin' && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} className="mt-0.5" />
            <p>
              O perfil Administrador sempre possui acesso total. Esta regra é fixa para evitar bloqueio do sistema.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {PERMISSION_GROUPS.map((group) => (
          <section key={group.title} className="rounded-xl border border-gray-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold text-gray-800">{group.title}</h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {group.keys.map((key) => {
                const checked = localPermissions[selectedPerfil][key]
                const disabled = selectedPerfil === 'admin' || (selectedPerfil === 'rh' && key === 'permissoes_perfil')

                return (
                  <label
                    key={key}
                    className={`flex items-center justify-between rounded-lg border px-3 py-2 ${
                      checked ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'
                    } ${disabled ? 'opacity-70' : ''}`}
                  >
                    <span className="text-sm text-gray-700">{PERMISSION_LABELS[key]}</span>
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => updatePermission(key, !checked)}
                      className={`relative h-6 w-11 rounded-full transition ${checked ? 'bg-blue-600' : 'bg-gray-300'} ${disabled ? 'cursor-not-allowed' : ''}`}
                    >
                      <span
                        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                          checked ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </label>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

export default PermissoesPerfis
