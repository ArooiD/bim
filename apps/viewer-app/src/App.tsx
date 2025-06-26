import { Routes, Route } from 'react-router-dom'
import { ViewerLayout } from './components/ViewerLayout'
import { ModelViewer } from './components/ModelViewer'
import { ViewerDashboard } from './pages/ViewerDashboard'

export default function App() {
  return (
    <ViewerLayout>
      <Routes>
        <Route path="/" element={<ViewerDashboard />} />
        <Route path="/viewer/:buildingId" element={<ModelViewer />} />
      </Routes>
    </ViewerLayout>
  )
}
