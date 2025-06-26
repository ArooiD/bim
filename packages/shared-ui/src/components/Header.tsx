import React from 'react'
import { SignOutButton } from './auth/SignOutButton'

export function Header() {
  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm h-16 flex justify-between items-center border-b shadow-sm px-6">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-semibold text-blue-600">BIM Platform</h1>
        <nav className="hidden md:flex space-x-6">
          <a href="/" className="text-gray-600 hover:text-gray-900">Проекты</a>
          <a href="/viewer" className="text-gray-600 hover:text-gray-900">3D Просмотр</a>
          <a href="/admin" className="text-gray-600 hover:text-gray-900">Админ</a>
        </nav>
      </div>
      <SignOutButton />
    </header>
  )
}
