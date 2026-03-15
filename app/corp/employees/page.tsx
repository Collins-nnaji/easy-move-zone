import { UserPlus, Search, MoreVertical, ShieldAlert, CheckCircle2 } from "lucide-react"

export default function CorpEmployeesPage() {
  const employees = [
    { name: "Sarah Jenkins", role: "VP Engineering", loc: "London, UK", status: "Compliant" },
    { name: "David Chen", role: "Product Manager", loc: "Austin, TX", status: "Compliant" },
    { name: "Elena Rodriguez", role: "Lead Designer", loc: "Lisbon, PT", status: "Risk: Residency > 183 Days" },
    { name: "James Wilson", role: "Account Executive", loc: "Dubai, UAE", status: "Onboarding" },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-[var(--font-playfair)] font-bold mb-2">Relocation Profiles</h1>
          <p className="text-slate-400">Manage your relocating talent, track visa statuses, and oversee their settlement process.</p>
        </div>
        <button className="bg-[#D4A843] text-[#0A0F1E] font-bold px-6 py-2.5 rounded-xl hover:bg-white transition-colors shrink-0 flex items-center gap-2">
          <UserPlus size={18} /> Invite Employee
        </button>
      </header>

      <div className="bg-slate-900/50 border border-white/10 rounded-3xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Search employees..." 
              className="w-full bg-black/40 border border-white/20 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-[#D4A843]"
            />
          </div>
          <div className="flex gap-2 text-sm">
            <select className="bg-black/40 border border-white/20 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-[#D4A843]">
              <option>All Locations</option>
              <option>UK</option>
              <option>USA</option>
              <option>UAE</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/20 text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium">Employee</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Location</th>
                <th className="px-6 py-4 font-medium">Compliance Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {employees.map((emp, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4 font-bold text-white flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#D4A843]/20 text-[#D4A843] flex items-center justify-center text-xs font-bold border border-[#D4A843]/30">
                      {emp.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    {emp.name}
                  </td>
                  <td className="px-6 py-4 text-slate-300">{emp.role}</td>
                  <td className="px-6 py-4 text-slate-300">{emp.loc}</td>
                  <td className="px-6 py-4">
                    {emp.status === "Compliant" ? (
                      <span className="inline-flex items-center gap-1.5 bg-green-500/10 text-green-400 px-2.5 py-1 rounded-md text-xs font-bold border border-green-500/20">
                        <CheckCircle2 size={12} /> {emp.status}
                      </span>
                    ) : emp.status === "Onboarding" ? (
                      <span className="inline-flex items-center gap-1.5 bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-md text-xs font-bold border border-blue-500/20">
                        {emp.status}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 bg-red-500/10 text-red-400 px-2.5 py-1 rounded-md text-xs font-bold border border-red-500/20">
                        <ShieldAlert size={12} /> {emp.status}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 group-hover:text-white">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
