'use client'
import { useState, useMemo, useEffect, useCallback } from 'react'
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
  // Initialize state with default values
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

  // Destructure state for easier access
  const { filters, searchQuery, sortBy, sortOrder } = state

  // Memoize state updates to prevent unnecessary re-renders
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
  }, [updateState])

  const handleSearchChange = useCallback((query) => {
    updateState({ searchQuery: query })
  }, [updateState])

  const handleSortChange = useCallback((field) => {
    updateState(prevState => ({
      sortBy: field,
      sortOrder: prevState.sortBy === field 
        ? prevState.sortOrder === 'asc' ? 'desc' : 'asc'
        : 'asc'
    }))
  }, [updateState])

  const handleGeneClick = useCallback((geneId) => {
    router.push(`/id/${geneId}`)
  }, [router])

  // Memoize the search configuration
  const searchConfig = useMemo(() => ({
    filters,
    searchQuery,
    sortBy,
    sortOrder
  }), [filters, searchQuery, sortBy, sortOrder])

  return (
    <div className="flex min-h-screen bg-gray-50">
      <FilterSidebar 
        filters={filters} 
        onFilterChange={handleFilterChange} 
      />
      <div className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">nORFs Database</h1>
          <p className="text-gray-600">
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