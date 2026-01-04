import { useState } from 'react'
import { MapPin, Coins, Calendar, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { cs } from 'date-fns/locale'

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

const STAGE_COLORS = {
  'Nový': 'bg-gray-100 text-gray-800 border-gray-300',
  'CV odesláno': 'bg-blue-100 text-blue-800 border-blue-300',
  'Čeká na odpověď': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'Pohovor naplánován': 'bg-purple-100 text-purple-800 border-purple-300',
  'Po pohovoru': 'bg-indigo-100 text-indigo-800 border-indigo-300',
  'Nabídka': 'bg-green-100 text-green-800 border-green-300',
  'Zamítnuto': 'bg-red-100 text-red-800 border-red-300',
  'Přijato': 'bg-emerald-100 text-emerald-800 border-emerald-300'
}

function JobCard({ job, onClick }) {
  return (
    <div
      onClick={() => onClick(job)}
      className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
    >
      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
        {job.title || 'Bez názvu'}
      </h3>
      
      {job.company && (
        <p className="text-sm text-gray-600 mb-2">{job.company}</p>
      )}

      <div className="space-y-1.5 mb-3">
        {job.location && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span className="line-clamp-1">{job.location}</span>
          </div>
        )}
        
        {job.salary && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Coins className="w-4 h-4" />
            <span className="line-clamp-1">{job.salary}</span>
          </div>
        )}

        {job.cv_sent_date && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>
              CV: {format(new Date(job.cv_sent_date), 'd. M. yyyy', { locale: cs })}
            </span>
          </div>
        )}
      </div>

      {job.description && (
        <p className="text-xs text-gray-500 line-clamp-2 mb-3">
          {job.description}
        </p>
      )}

      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>
          {format(new Date(job.created_at), 'd. M. yyyy', { locale: cs })}
        </span>
        <ChevronRight className="w-4 h-4" />
      </div>
    </div>
  )
}

function JobBoard({ jobs, onJobClick, onUpdateJob }) {
  const [isDragging, setIsDragging] = useState(false)
  const [draggedJob, setDraggedJob] = useState(null)

  const handleDragStart = (e, job) => {
    setIsDragging(true)
    setDraggedJob(job)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e, stage) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (draggedJob && draggedJob.stage !== stage) {
      onUpdateJob(draggedJob.id, { ...draggedJob, stage })
    }
    setDraggedJob(null)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    setDraggedJob(null)
  }

  const getJobsByStage = (stage) => {
    return jobs.filter(job => job.stage === stage)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {STAGES.map(stage => {
        const stageJobs = getJobsByStage(stage)
        const isDropTarget = isDragging && draggedJob?.stage !== stage

        return (
          <div
            key={stage}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, stage)}
            className={`bg-gray-50 rounded-lg p-4 min-h-[500px] transition-colors ${
              isDropTarget ? 'bg-blue-50 ring-2 ring-blue-300' : ''
            }`}
          >
            <div className={`inline-flex items-center justify-center px-3 py-1.5 rounded-full text-sm font-medium mb-4 border ${STAGE_COLORS[stage]}`}>
              {stage}
              <span className="ml-2 bg-white bg-opacity-50 px-2 py-0.5 rounded-full text-xs">
                {stageJobs.length}
              </span>
            </div>

            <div className="space-y-3">
              {stageJobs.map(job => (
                <div
                  key={job.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, job)}
                  onDragEnd={handleDragEnd}
                  className={draggedJob?.id === job.id ? 'opacity-50' : ''}
                >
                  <JobCard job={job} onClick={onJobClick} />
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default JobBoard
