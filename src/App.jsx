import { useState, useEffect } from 'react'
import { Plus, Briefcase } from 'lucide-react'
import JobBoard from './components/JobBoard'
import AddJobModal from './components/AddJobModal'
import JobDetailModal from './components/JobDetailModal'

function App() {
  const [jobs, setJobs] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedJob, setSelectedJob] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs')
      const data = await response.json()
      
      // Check if data is an array, otherwise set empty array
      if (Array.isArray(data)) {
        setJobs(data)
      } else {
        console.error('API error:', data)
        setJobs([])
      }
      setLoading(false)
    } catch (error) {
      console.error('Error fetching jobs:', error)
      setJobs([])
      setLoading(false)
    }
  }

  const handleAddJob = async (originalText) => {
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ original_text: originalText }),
      })
      const newJob = await response.json()
      setJobs([newJob, ...jobs])
      setShowAddModal(false)
    } catch (error) {
      console.error('Error adding job:', error)
    }
  }

  const handleUpdateJob = async (id, updates) => {
    try {
      const response = await fetch(`/api/jobs?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })
      const updatedJob = await response.json()
      setJobs(jobs.map(job => job.id === id ? updatedJob : job))
      setSelectedJob(updatedJob)
    } catch (error) {
      console.error('Error updating job:', error)
    }
  }

  const handleDeleteJob = async (id) => {
    if (window.confirm('Opravdu chcete smazat tuto nabídku?')) {
      try {
        console.log('Sending DELETE request for job ID:', id)
        const response = await fetch(`/api/jobs?id=${id}`, {
          method: 'DELETE',
        })
        console.log('DELETE response status:', response.status)
        const data = await response.json()
        console.log('DELETE response data:', data)
        
        if (response.ok) {
          setJobs(jobs.filter(job => job.id !== id))
          setSelectedJob(null)
        } else {
          console.error('DELETE failed:', data)
          alert('Chyba při mazání: ' + (data.error || 'Neznámá chyba'))
        }
      } catch (error) {
        console.error('Error deleting job:', error)
        alert('Chyba při mazání jobu')
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Načítání...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Briefcase className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Job Tracker</h1>
                <p className="text-xs text-gray-500">by Roman Velička</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Přidat nabídku
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <JobBoard
          jobs={jobs}
          onJobClick={setSelectedJob}
          onUpdateJob={handleUpdateJob}
        />
      </main>

      {showAddModal && (
        <AddJobModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddJob}
        />
      )}

      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onUpdate={handleUpdateJob}
          onDelete={handleDeleteJob}
        />
      )}
    </div>
  )
}

export default App
