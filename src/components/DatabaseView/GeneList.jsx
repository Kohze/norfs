'use client'
import { useEffect, useState, memo } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Button } from '@/components/UI/button'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const LoadingSkeleton = () => (
  <div className="animate-pulse">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="border-b border-gray-200 py-4">
        <div className="grid grid-cols-7 gap-4">
          {[...Array(7)].map((_, j) => (
            <div key={j} className="h-4 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    ))}
  </div>
)

const GeneList = memo(function GeneList({ searchConfig, onGeneClick }) {
  const { filters, searchQuery, sortBy, sortOrder } = searchConfig
  const [genes, setGenes] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState(null)
  const ITEMS_PER_PAGE = 20

  const fetchGenes = async (loadMore = false) => {
    try {
      let query = supabase
        .from('norfs')
        .select('*', { count: 'exact' })
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE - 1)

      // Apply filters
      if (filters.chromosome) {
        query = query.ilike('seqname', `%${filters.chromosome}%`)
      }
      if (filters.feature) {
        query = query.ilike('feature', `%${filters.feature}%`)
      }
      if (filters.source) {
        query = query.ilike('source', `%${filters.source}%`)
      }
      if (filters.strand) {
        query = query.eq('strand', filters.strand)
      }
      if (filters.minLength) {
        query = query.gte('sorf_length', parseInt(filters.minLength))
      }
      if (filters.maxLength) {
        query = query.lte('sorf_length', parseInt(filters.maxLength))
      }

      // Apply search
      if (searchQuery) {
        const isLocation = searchQuery.match(/^(chr)?(\w+):(\d+)-(\d+)$/i)
        if (isLocation) {
          const [, , chr, start, end] = isLocation
          query = query
            .eq('seqname', `chr${chr}`)
            .gte('start', parseInt(start))
            .lte('end', parseInt(end))
        } else {
          query = query.ilike('gene_id', `%${searchQuery}%`)
        }
      }

      const { data, error, count } = await query

      if (error) throw error

      setGenes(prev => loadMore ? [...prev, ...data] : data)
      setHasMore(count > (page + 1) * ITEMS_PER_PAGE)
      setError(null)
    } catch (error) {
      console.error('Error fetching genes:', error)
      setError('Failed to load data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setPage(0)
    setGenes([])
    setLoading(true)
    fetchGenes(false)
  }, [filters, searchQuery, sortBy, sortOrder])

  const loadMore = () => {
    setPage(prev => prev + 1)
    fetchGenes(true)
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        <p>{error}</p>
        <Button 
          onClick={() => fetchGenes(false)} 
          variant="outline" 
          className="mt-4"
        >
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Gene ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Chromosome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Start
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                End
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Length
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Feature
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Strand
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading && !genes.length ? (
              <tr>
                <td colSpan="7">
                  <LoadingSkeleton />
                </td>
              </tr>
            ) : (
              genes.map((gene) => (
                <tr
                  key={gene.id}
                  onClick={() => onGeneClick(gene.gene_id)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    {gene.gene_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {gene.seqname}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {gene.start.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {gene.end.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {gene.sorf_length?.toLocaleString() || (gene.end - gene.start + 1).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {gene.feature}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {gene.strand}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {hasMore && !loading && (
        <div className="mt-6 text-center">
          <Button
            onClick={loadMore}
            variant="outline"
            className="text-gray-600 hover:text-gray-900"
          >
            Load More
          </Button>
        </div>
      )}

      {loading && genes.length > 0 && (
        <div className="mt-6 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}
    </div>
  )
})

export default GeneList