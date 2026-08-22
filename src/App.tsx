import { Navigate, Route, Routes } from 'react-router';
import OAuthCallbackPage from './app/auth/callback/[provider]/page';
import GroupMembersPage from './app/groups/[groupId]/members/page';
import GroupDetailPage from './app/groups/[groupId]/page';
import GroupRolesPage from './app/groups/[groupId]/roles/page';
import GroupSettingsPage from './app/groups/[groupId]/settings/page';
import GroupsCreatePage from './app/groups/create/page';
import GroupsPage from './app/groups/page';
import RootLayout, { AuthGate } from './app/layout';
import LoginPage from './app/login/page';
import NotFoundPage from './app/not-found';
import HomePage from './app/page';
import UserProfilePage from './app/profile/[userId]/page';
import ProfilePage from './app/profile/page';
import RoomEditPage from './app/rooms/[roomId]/edit/page';
import RoomDetailPage from './app/rooms/[roomId]/page';
import RoomCreatePage from './app/rooms/create/page';
import RoomsPage from './app/rooms/page';
import SettingsPage from './app/settings/page';
import { AppProvider } from './context/AppContext';

export default function App() {
    return (
        <AppProvider>
            <Routes>
                <Route element={<RootLayout />}>
                    <Route index element={<HomePage />} />
                    <Route path="login" element={<LoginPage />} />
                    <Route path="auth/callback/:provider" element={<OAuthCallbackPage />} />
                    <Route
                        path="rooms"
                        element={
                            <AuthGate>
                                <RoomsPage />
                            </AuthGate>
                        }
                    />
                    <Route
                        path="rooms/create"
                        element={
                            <AuthGate>
                                <RoomCreatePage />
                            </AuthGate>
                        }
                    />
                    <Route
                        path="rooms/:roomId"
                        element={
                            <AuthGate>
                                <RoomDetailPage />
                            </AuthGate>
                        }
                    />
                    <Route
                        path="rooms/:roomId/edit"
                        element={
                            <AuthGate>
                                <RoomEditPage />
                            </AuthGate>
                        }
                    />
                    <Route
                        path="groups"
                        element={
                            <AuthGate>
                                <GroupsPage />
                            </AuthGate>
                        }
                    />
                    <Route
                        path="groups/create"
                        element={
                            <AuthGate>
                                <GroupsCreatePage />
                            </AuthGate>
                        }
                    />
                    <Route
                        path="groups/:groupId"
                        element={
                            <AuthGate>
                                <GroupDetailPage />
                            </AuthGate>
                        }
                    />
                    <Route
                        path="groups/:groupId/members"
                        element={
                            <AuthGate>
                                <GroupMembersPage />
                            </AuthGate>
                        }
                    />
                    <Route
                        path="groups/:groupId/roles"
                        element={
                            <AuthGate>
                                <GroupRolesPage />
                            </AuthGate>
                        }
                    />
                    <Route
                        path="groups/:groupId/settings"
                        element={
                            <AuthGate>
                                <GroupSettingsPage />
                            </AuthGate>
                        }
                    />
                    <Route
                        path="profile"
                        element={
                            <AuthGate>
                                <ProfilePage />
                            </AuthGate>
                        }
                    />
                    <Route
                        path="profile/:userId"
                        element={
                            <AuthGate>
                                <UserProfilePage />
                            </AuthGate>
                        }
                    />
                    <Route path="notifications" element={<Navigate to="/settings" replace />} />
                    <Route
                        path="settings"
                        element={
                            <AuthGate>
                                <SettingsPage />
                            </AuthGate>
                        }
                    />
                    <Route path="*" element={<NotFoundPage />} />
                </Route>
            </Routes>
        </AppProvider>
    );
}
