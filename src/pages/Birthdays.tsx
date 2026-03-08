import React, { useMemo, useState } from 'react'
import { Search, Download, Cake, Medal } from 'lucide-react'
import { Employee } from '../App'
import Select from '../components/Select'

interface BirthdaysProps {
  employees: Employee[]
}

const monthNames = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro'
]

const getMonthIndexFromDate = (dateValue: string) => {
  const [day, month] = dateValue.split('/')
  if (!day || !month) return -1
  const monthIndex = Number(month) - 1
  if (Number.isNaN(monthIndex)) return -1
  return monthIndex
}

const Birthdays: React.FC<BirthdaysProps> = ({ employees }) => {
  const currentMonthIndex = new Date().getMonth()
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(currentMonthIndex)
  const [selectedMonthIndexWork, setSelectedMonthIndexWork] = useState(currentMonthIndex)
  const [employeeQuery, setEmployeeQuery] = useState('')
  const [workEmployeeQuery, setWorkEmployeeQuery] = useState('')

  const monthlyBirthdays = useMemo(() => {
    return employees.filter((employee) => {
      const monthIndex = getMonthIndexFromDate(employee.dataNascimento)
      if (monthIndex !== selectedMonthIndex) return false
      if (!employeeQuery.trim()) return true
      return employee.nomeCompleto.toLowerCase().includes(employeeQuery.trim().toLowerCase())
    })
  }, [employees, employeeQuery, selectedMonthIndex])

  const workAnniversaries = useMemo(() => {
    return employees.filter((employee) => {
      const monthIndex = getMonthIndexFromDate(employee.dataAdmissao)
      if (monthIndex !== selectedMonthIndexWork) return false
      if (!workEmployeeQuery.trim()) return true
      return employee.nomeCompleto.toLowerCase().includes(workEmployeeQuery.trim().toLowerCase())
    })
  }, [employees, selectedMonthIndexWork, workEmployeeQuery])

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-6 py-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Aniversariantes</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Aniversariantes do mês */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-gray-900 font-semibold">
                  <Cake size={22} className="text-pink-400" />
                  <span>Aniversariantes do mês</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Quem está fazendo aniversário neste mês
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500">Funcionário</label>
                <div className="relative mt-1">
                  <input
                    type="text"
                    placeholder="Comece digitando o nome"
                    value={employeeQuery}
                    onChange={(e) => setEmployeeQuery(e.target.value)}
                    className="w-full bg-gray-100 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <Search size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500">Mês <span className="text-red-500">*</span></label>
                <div className="mt-1">
                  <Select
                    value={selectedMonthIndex}
                    onChange={(value) => setSelectedMonthIndex(Number(value))}
                    options={monthNames.map((month, index) => ({ label: month, value: index }))}
                  />
                </div>
              </div>
            </div>

            <button className="mt-6 w-full bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-indigo-700">
              Pesquisar
            </button>

            <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
              <span />
              <button className="flex items-center gap-2 px-2 py-1 border border-gray-200 rounded-md hover:bg-gray-50">
                <Download size={14} />
                <span>Exportar</span>
              </button>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-end text-xs text-gray-500 mb-3">
                Página 1/1 - Exibindo {monthlyBirthdays.length} de {monthlyBirthdays.length} registros.
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="py-3">Aniversário</th>
                      <th className="py-3">Funcionário</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700">
                    {monthlyBirthdays.length === 0 ? (
                      <tr>
                        <td colSpan={2} className="py-6 text-center text-gray-500">
                          Nenhum aniversariante encontrado
                        </td>
                      </tr>
                    ) : (
                      monthlyBirthdays.map((employee) => (
                        <tr key={employee.id} className="border-b">
                          <td className="py-4">{(() => {
                            const [dia, mes] = employee.dataNascimento.split('/');
                            return `${dia}/${mes}`;
                          })()}</td>
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">
                                {employee.nomeCompleto.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-semibold text-indigo-700 hover:underline cursor-pointer"># {employee.nomeCompleto}</div>
                                <div className="text-xs text-gray-500">{employee.cargo || '-'}</div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Aniversariantes de trabalho */}
          <div className="bg-white shadow rounded-lg p-6">
            <div>
              <div className="flex items-center gap-2 text-gray-900 font-semibold">
                <Medal size={22} className="text-yellow-400" />
                <span>Aniversariantes de trabalho</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Quem está completando mais um ano trabalhando na empresa
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500">Funcionário</label>
                <div className="relative mt-1">
                  <input
                    type="text"
                    placeholder="Comece digitando o nome"
                    value={workEmployeeQuery}
                    onChange={(e) => setWorkEmployeeQuery(e.target.value)}
                    className="w-full bg-gray-100 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <Search size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500">Mês <span className="text-red-500">*</span></label>
                <div className="mt-1">
                  <Select
                    value={selectedMonthIndexWork}
                    onChange={(value) => setSelectedMonthIndexWork(Number(value))}
                    options={monthNames.map((month, index) => ({ label: month, value: index }))}
                  />
                </div>
              </div>
            </div>

            <button className="mt-6 w-full bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-indigo-700">
              Pesquisar
            </button>

            <div className="mt-4">
              <div className="flex items-center justify-end text-xs text-gray-500 mb-3">
                Página 1/1 - Exibindo {workAnniversaries.length} de {workAnniversaries.length} registros.
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="py-3">Aniversário</th>
                      <th className="py-3">Funcionário</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700">
                    {workAnniversaries.length === 0 ? (
                      <tr>
                        <td colSpan={2} className="py-10 text-center text-gray-500">
                          <div className="flex flex-col items-center justify-center">
                            <img src="https://marq-assets.s3.sa-east-1.amazonaws.com/empty-state.svg" alt="Nenhum dado" className="w-40 mb-2 opacity-80" />
                            <div className="font-bold text-lg text-gray-700 mb-1">Nenhum dado para visualização aqui</div>
                            <div className="text-xs text-gray-500">Caso esteja realizando alguma pesquisa, verifique os dados preenchidos e tente novamente.</div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      workAnniversaries.map((employee) => (
                        <tr key={employee.id} className="border-b">
                          <td className="py-4">{(() => {
                            const [dia, mes] = employee.dataAdmissao.split('/');
                            return `${dia}/${mes}`;
                          })()}</td>
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">
                                {employee.nomeCompleto.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-semibold text-indigo-700 hover:underline cursor-pointer"># {employee.nomeCompleto}</div>
                                <div className="text-xs text-gray-500">{employee.cargo || '-'}</div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Birthdays
