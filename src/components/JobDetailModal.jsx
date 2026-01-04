import { useState } from 'react'
import { X, Save, Trash2, MapPin, Coins, Calendar, Building2, FileText, BarChart3, StickyNote, ThumbsUp, ThumbsDown, DollarSign } from 'lucide-react'
import FileManager from './FileManager'

const STAGES = [
  'Nový',
  'CV odesláno',
  'Čeká na odpověď',
  'Pohovor naplánován',
  'Po pohovoru',
  'Nabídka',
  'Zamítnuto',
  'Přijato'
]

function JobDetailModal({ job, onClose, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    title: job.title || '',
    company: job.company || '',
    location: job.location || '',
    salary: job.salary || '',
    description: job.description || '',
    stage: job.stage || 'Nový',
    cv_sent_date: job.cv_sent_date || '',
    notes: job.notes || '',
    pros: job.pros || '',
    cons: job.cons || '',
    offered_salary: job.offered_salary || ''
  })

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleSave = () => {
    onUpdate(job.id, formData)
    setIsEditing(false)
  }

  const handleDelete = () => {
    onDelete(job.id)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Detail nabídky
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4" />
                Název pozice
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-lg font-semibold text-gray-900">
                  {job.title || 'Bez názvu'}
                </p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Building2 className="w-4 h-4" />
                Společnost
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => handleChange('company', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">
                  {job.company || '—'}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4" />
                  Lokalita
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">
                    {job.location || '—'}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Coins className="w-4 h-4" />
                  Plat
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.salary}
                    onChange={(e) => handleChange('salary', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">
                    {job.salary || '—'}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <BarChart3 className="w-4 h-4" />
                  Fáze
                </label>
                {isEditing ? (
                  <select
                    value={formData.stage}
                    onChange={(e) => handleChange('stage', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {STAGES.map(stage => (
                      <option key={stage} value={stage}>{stage}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-900">
                    {job.stage}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4" />
                  Datum odeslání CV
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    value={formData.cv_sent_date}
                    onChange={(e) => handleChange('cv_sent_date', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">
                    {job.cv_sent_date || '—'}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4" />
                Popis
              </label>
              {isEditing ? (
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              ) : (
                <p className="text-gray-700 whitespace-pre-wrap">
                  {job.description || '—'}
                </p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4" />
                Nabízená mzda
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.offered_salary}
                  onChange={(e) => handleChange('offered_salary', e.target.value)}
                  placeholder="Mzda nabízená během pohovoru"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">
                  {job.offered_salary || '—'}
                </p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <StickyNote className="w-4 h-4" />
                Poznámky z pohovoru
              </label>
              {isEditing ? (
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  rows={5}
                  placeholder="Vaše poznámky z pohovoru, dojmy, otázky..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              ) : (
                <p className="text-gray-700 whitespace-pre-wrap">
                  {job.notes || '—'}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-green-700 mb-2">
                  <ThumbsUp className="w-4 h-4" />
                  Klady (Pros)
                </label>
                {isEditing ? (
                  <textarea
                    value={formData.pros}
                    onChange={(e) => handleChange('pros', e.target.value)}
                    rows={6}
                    placeholder="Co se vám líbí na této pozici/firmě?"
                    className="w-full px-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  />
                ) : (
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200 min-h-[100px]">
                    <p className="text-gray-700 whitespace-pre-wrap text-sm">
                      {job.pros || '—'}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-red-700 mb-2">
                  <ThumbsDown className="w-4 h-4" />
                  Zápory (Cons)
                </label>
                {isEditing ? (
                  <textarea
                    value={formData.cons}
                    onChange={(e) => handleChange('cons', e.target.value)}
                    rows={6}
                    placeholder="Co vás znepokojuje nebo se vám nelíbí?"
                    className="w-full px-4 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  />
                ) : (
                  <div className="bg-red-50 p-3 rounded-lg border border-red-200 min-h-[100px]">
                    <p className="text-gray-700 whitespace-pre-wrap text-sm">
                      {job.cons || '—'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <FileManager jobId={job.id} />

            {job.original_text && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Původní text inzerátu
                </label>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-64 overflow-y-auto">
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {job.original_text}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Smazat
          </button>
          
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Zrušit
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Uložit
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Upravit
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default JobDetailModal
