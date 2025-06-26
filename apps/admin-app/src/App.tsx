import {Routes, Route} from 'react-router-dom'
import {AdminLayout} from './components/AdminLayout'
import {Dashboard} from './pages/Dashboard'
import {UserManagement} from './pages/UserManagement'
import {SystemSettings} from './pages/SystemSettings'
import {Analytics} from './pages/Analytics'

export default function App() {
    return (
        <AdminLayout>
            <Routes>
                <Route path="/" element={<Dashboard/>}/>
                <Route path="/users" element={<UserManagement/>}/>
                <Route path="/settings" element={<SystemSettings/>}/>
                <Route path="/analytics" element={<Analytics/>}/>
            </Routes>
        </AdminLayout>
    )
}
