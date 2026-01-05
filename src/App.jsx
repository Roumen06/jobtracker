import { useState, useEffect } from 'react'
import { Plus, Briefcase, LogOut } from 'lucide-react'
import JobBoard from './components/JobBoard'
import AddJobModal from './components/AddJobModal'
import JobDetailModal from './components/JobDetailModal'

function App() {
  const [jobs, setJobs] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedJob, setSelectedJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (user) {
      fetchJobs()
    }
  }, [user])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/user', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    } finally {
      setAuthLoading(false)
    }
  }

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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Načítání...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <Briefcase className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Tracker</h1>
          <p className="text-sm text-gray-500 mb-8">by Roman Velička</p>
          <p className="text-gray-600 mb-6">
            Sledujte své pracovní nabídky a udržujte přehled o probíhajících pohovorech
          </p>
          <a
            href="/api/auth/google"
            className="inline-flex items-center gap-3 bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium w-full justify-center"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Přihlásit přes Google
          </a>
        </div>
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
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {user.picture && (
                  <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full" />
                )}
                <span className="text-sm text-gray-700">{user.name}</span>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Přidat nabídku
              </button>
              <a
                href="/api/auth/logout"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </a>
            </div>
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
