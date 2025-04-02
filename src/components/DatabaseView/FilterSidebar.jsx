'use client'
import { useState } from 'react'
import { Label } from '@/components/UI/label'
import { Input } from '@/components/UI/input'
import { Button } from '@/components/UI/button'
import { Separator } from '@/components/UI/separator'

export default function FilterSidebar({ filters, onFilterChange }) {
  const [localFilters, setLocalFilters] = useState(filters)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setLocalFilters((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleApplyFilters = () => {
    onFilterChange(localFilters)
  }

  const handleReset = () => {
    const resetFilters = {
      chromosome: '',
      feature: '',
      strand: '',
      minLength: '',
      maxLength: '',
    }
    setLocalFilters(resetFilters)
    onFilterChange(resetFilters)
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Filters</h2>
      
      <div className="space-y-6">
        <div>
          <Label htmlFor="chromosome">Chromosome</Label>
          <Input
            id="chromosome"
            name="chromosome"
            value={localFilters.chromosome}
            onChange={handleInputChange}
            placeholder="e.g., X"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="feature">Feature Type</Label>
          <Input
            id="feature"
            name="feature"
            value={localFilters.feature}
            onChange={handleInputChange}
            placeholder="e.g., CDS"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="strand">Strand</Label>
          <Input
            id="strand"
            name="strand"
            value={localFilters.strand}
            onChange={handleInputChange}
            placeholder="e.g., + or -"
            className="mt-1"
          />
        </div>

        <div>
          <Label>Sequence Length</Label>
          <div className="mt-1 grid grid-cols-2 gap-2">
            <Input
              name="minLength"
              value={localFilters.minLength}
              onChange={handleInputChange}
              placeholder="Min"
              type="number"
            />
            <Input
              name="maxLength"
              value={localFilters.maxLength}
              onChange={handleInputChange}
              placeholder="Max"
              type="number"
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <Button 
            onClick={handleApplyFilters}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Apply Filters
          </Button>
          <Button 
            onClick={handleReset}
            variant="outline"
            className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  )
}