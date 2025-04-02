'use client'
import { Input } from '@/components/UI/input'
import { Button } from '@/components/UI/button'
import { Download, ChevronDown, Filter } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function SearchBar({ searchQuery, onSearchChange, sortBy, sortOrder, onSortChange }) {
  const sortFields = [
    { id: 'gene_id', label: 'Gene ID' },
    { id: 'seqname', label: 'Chromosome' },
    { id: 'start', label: 'Start Position' },
    { id: 'end', label: 'End Position' },
  ]

  const selectedField = sortFields.find(f => f.id === sortBy)

  const convertToCSV = (data) => {
    const headers = [
      'Gene ID',
      'Chromosome',
      'Start',
      'End',
      'Length',
      'Feature',
      'Strand'
    ]

    const rows = data.map(item => [
      item.gene_id,
      item.seqname,
      item.start,
      item.end,
      item.sorf_length || (item.end - item.start + 1),
      item.feature,
      item.strand
    ])

    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell || ''}"`).join(','))
      .join('\n')
  }

  const handleDownload = async () => {
    try {
      let query = supabase.from('norfs').select('*')

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

      query = query.order(sortBy, { ascending: sortOrder === 'asc' })

      const { data, error } = await query

      if (error) throw error

      const csv = convertToCSV(data)
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      link.setAttribute('href', url)
      link.setAttribute('download', `norf_data_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error downloading CSV:', error)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search by Gene ID or location (e.g., chr1:1000-2000)"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2 md:items-center">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button 
                variant="outline" 
                className="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-50 w-full sm:w-auto"
              >
                <span className="truncate">
                  Sort: {selectedField?.label || 'Gene ID'}
                  {sortOrder === 'desc' ? ' ↓' : ' ↑'}
                </span>
                <ChevronDown className="h-4 w-4 flex-shrink-0" />
              </Button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="min-w-[180px] bg-white rounded-md shadow-lg p-1 z-50"
                sideOffset={5}
              >
                {sortFields.map((field) => (
                  <DropdownMenu.Item
                    key={field.id}
                    className={`
                      flex items-center px-3 py-2 text-sm rounded-sm cursor-pointer
                      ${sortBy === field.id ? 'bg-gray-100' : 'hover:bg-gray-50'}
                    `}
                    onClick={() => onSortChange(field.id)}
                  >
                    {field.label}
                    {sortBy === field.id && (
                      <span className="ml-2 text-gray-500">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          <Button
            onClick={handleDownload}
            variant="outline"
            className="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-50 w-full sm:w-auto"
          >
            <Download className="h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Download CSV</span>
            <span className="sm:hidden">Download</span>
          </Button>
        </div>
      </div>
    </div>
  )
}