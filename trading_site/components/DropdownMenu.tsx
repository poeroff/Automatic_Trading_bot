"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { ChevronDown } from "lucide-react"

interface DropdownItem {
  label: string
  href: string
}

interface DropdownMenuProps {
  label: string
  items: DropdownItem[]
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ label, items }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-center items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        {label}
        <ChevronDown className="ml-1 h-4 w-4" />
      </button>
      {isOpen && (
        <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 min-w-[150px] rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
        <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
          {items.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="flex justify-center items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
      )}
    </div>
  )
}

export default DropdownMenu

