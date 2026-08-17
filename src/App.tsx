import { Route, Routes } from 'react-router'
import { AppProvider } from './context/AppContext'
import { AppLayout, AuthGate } from './layouts/AppLayout'
import { GroupDetailPage } from './pages/GroupDetailPage'
import { GroupsPage } from './pages/GroupsPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { NotificationsPage } from './pages/NotificationsPage'
import { ProfilePage } from './pages/ProfilePage'
import { RoomDetailPage } from './pages/RoomDetailPage'
import { RoomFormPage } from './pages/RoomFormPage'
import { RoomsPage } from './pages/RoomsPage'
import { SettingsPage } from './pages/SettingsPage'

export default function App() {
  return (
    <AppProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="rooms" element={<AuthGate><RoomsPage /></AuthGate>} />
          <Route path="rooms/create" element={<AuthGate><RoomFormPage /></AuthGate>} />
          <Route path="rooms/:roomId" element={<AuthGate><RoomDetailPage /></AuthGate>} />
          <Route path="rooms/:roomId/edit" element={<AuthGate><RoomFormPage edit /></AuthGate>} />
          <Route path="groups" element={<AuthGate><GroupsPage /></AuthGate>} />
          <Route path="groups/create" element={<AuthGate><GroupsPage create /></AuthGate>} />
          <Route path="groups/:groupId" element={<AuthGate><GroupDetailPage /></AuthGate>} />
          <Route path="groups/:groupId/members" element={<AuthGate><GroupDetailPage /></AuthGate>} />
          <Route path="groups/:groupId/roles" element={<AuthGate><GroupDetailPage /></AuthGate>} />
          <Route path="groups/:groupId/settings" element={<AuthGate><GroupDetailPage /></AuthGate>} />
          <Route path="profile" element={<AuthGate><ProfilePage /></AuthGate>} />
          <Route path="profile/:userId" element={<AuthGate><ProfilePage /></AuthGate>} />
          <Route path="notifications" element={<AuthGate><NotificationsPage /></AuthGate>} />
          <Route path="settings" element={<AuthGate><SettingsPage /></AuthGate>} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </AppProvider>
  )
}
