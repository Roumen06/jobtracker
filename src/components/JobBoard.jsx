import { useState } from 'react'
import { MapPin, Coins, Calendar, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { cs } from 'date-fns/locale'

const STAGES = [
  'Nový',
  'CV odesláno',
  'Pohovor naplánován',
  'Po pohovoru',
  'Nabídka',
  'Zamítnuto',
  'Přijato'
]

const STAGE_COLORS = {
  'Nový': 'bg-gray-100 text-gray-800 border-gray-300',
  'CV odesláno': 'bg-blue-100 text-blue-800 border-blue-300',
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
      className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
    >
      <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-1">
        {job.title || 'Bez názvu'}
      </h3>
      
      {job.company && (
        <p className="text-xs text-gray-600">{job.company}</p>
      )}
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
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
      {STAGES.map(stage => {
        const stageJobs = getJobsByStage(stage)
        const isDropTarget = isDragging && draggedJob?.stage !== stage

        return (
          <div
            key={stage}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, stage)}
            className={`bg-gray-50 rounded-lg p-3 min-h-[400px] transition-colors ${
              isDropTarget ? 'bg-blue-50 ring-2 ring-blue-300' : ''
            }`}
          >
            <div className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium mb-3 border ${STAGE_COLORS[stage]}`}>
              {stage}
              <span className="ml-1.5 bg-white bg-opacity-50 px-1.5 py-0.5 rounded-full text-xs">
                {stageJobs.length}
              </span>
            </div>

            <div className="space-y-2">
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
