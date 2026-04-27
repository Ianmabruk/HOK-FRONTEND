import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import LiveChat from '../chat/LiveChat'
import ThemeController from './ThemeController'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <ThemeController />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <LiveChat />
    </div>
  )
}
