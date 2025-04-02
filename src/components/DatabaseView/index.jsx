'use client'
import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import FilterSidebar from './FilterSidebar'
import SearchBar from './SearchBar'
import GeneList from './GeneList'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const STORAGE_KEY = 'norf_search_state'

const defaultState = {
  filters: {
    chromosome: '',
    feature: '',
    strand: '',
    minLength: '',
    maxLength: '',
  },
  searchQuery: '',
  sortBy: 'gene_id',
  sortOrder: 'asc'
}

export default function DatabaseView() {
  const [showFilters, setShowFilters] = useState(false)
  const [state, setState] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem(STORAGE_KEY)
      if (savedState) {
        try {
          return JSON.parse(savedState)
        } catch (e) {
          console.error('Error parsing saved state:', e)
          return defaultState
        }
      }
    }
    return defaultState
  })

  const router = useRouter()

  const { filters, searchQuery, sortBy, sortOrder } = state

  const updateState = useCallback((updates) => {
    setState(prevState => {
      const newState = { ...prevState, ...updates }
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState))
      }
      return newState
    })
  }, [])

  const handleFilterChange = useCallback((newFilters) => {
    updateState({ filters: newFilters })
    if (window.innerWidth < 768) {
      setShowFilters(false)
    }
  }, [updateState])

  const handleSearchChange = useCallback((query) => {
    updateState({ searchQuery: query })
  }, [updateState])

  const handleSortChange = useCallback((field) => {
    setState(prevState => {
      const newState = {
        ...prevState,
        sortBy: field,
        sortOrder: prevState.sortBy === field && prevState.sortOrder === 'asc' ? 'desc' : 'asc'
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState))
      }
      return newState
    })
  }, [])

  const handleGeneClick = useCallback((geneId) => {
    router.push(`/id/${geneId}`)
  }, [router])

  const searchConfig = useMemo(() => ({
    filters,
    searchQuery,
    sortBy,
    sortOrder
  }), [filters, searchQuery, sortBy, sortOrder])

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {/* Mobile Filter Toggle */}
      <div className="md:hidden p-4 bg-white border-b">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {/* Filters Sidebar */}
      <div className={`
        ${showFilters ? 'block' : 'hidden'} 
        md:block 
        w-full 
        md:w-64 
        md:flex-shrink-0
        border-b 
        md:border-b-0
        md:border-r 
        border-gray-200
      `}>
        <FilterSidebar 
          filters={filters} 
          onFilterChange={handleFilterChange} 
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">nORFs Database</h1>
          <p className="text-sm md:text-base text-gray-600">
            Explore novel open reading frames (nORFs) with advanced search and filtering capabilities
          </p>
        </div>
        <SearchBar 
          searchQuery={searchQuery} 
          onSearchChange={handleSearchChange}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
        />
        <GeneList 
          searchConfig={searchConfig}
          onGeneClick={handleGeneClick}
        />
      </div>
    </div>
  )
}