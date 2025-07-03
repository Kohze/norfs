'use client'

import React, { useState, useEffect } from 'react'
import { Dna, MapPin, AlertTriangle, Loader2, ExternalLink } from 'lucide-react'

const HumanMineData = ({ norf }) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (norf && norf.chr && norf.start && norf.end) {
      fetchHumanMineData()
    }
  }, [norf])

  const fetchHumanMineData = async () => {
    setLoading(true)
    setError(null)
    setData(null)

    try {
      console.log('Fetching HumanMine data for nORF:', {
        chromosome: norf.chr,
        start: norf.start,
        end: norf.end
      })

      const response = await fetch('/api/humanmine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chromosome: norf.chr,
          start: norf.start,
          end: norf.end
        }),
      })

      const result = await response.json()

      console.log('Full HumanMine API response:', result)

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}`)
      }

      console.log('HumanMine data received:', result)
      setData(result)
    } catch (err) {
      console.error('Error fetching HumanMine data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!norf || !norf.chr || !norf.start || !norf.end) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-gray-600 mb-2">
          <Dna className="h-5 w-5" />
          <span className="font-medium">Genomic Context</span>
          <span className="text-xs text-gray-500 ml-auto">via HumanMine.org</span>
        </div>
        <p className="text-gray-500 text-sm">
          No genomic coordinates available for this nORF.
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-blue-700 mb-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="font-medium">Loading Genomic Context</span>
          <span className="text-xs text-blue-600 ml-auto">via HumanMine.org</span>
        </div>
        <p className="text-blue-600 text-sm">
          Searching for genes and transcripts in ±50000bp region around nORF...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-700 mb-2">
          <AlertTriangle className="h-5 w-5" />
          <span className="font-medium">Error Loading Genomic Context</span>
          <span className="text-xs text-red-600 ml-auto">via HumanMine.org</span>
        </div>
        <p className="text-red-600 text-sm">{error}</p>
        <button
          onClick={fetchHumanMineData}
          className="mt-2 text-sm text-red-700 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    )
  }

  if (!data) {
    return null
  }

  const { genes, transcripts, region } = data

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center gap-2 text-gray-900 mb-4">
        <Dna className="h-6 w-6 text-blue-600" />
        <h3 className="text-lg font-semibold">Genomic Context</h3>
        <a
          href="https://www.humanmine.org/humanmine/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-700 ml-auto"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      {/* Region Information */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 text-gray-700 mb-2">
          <MapPin className="h-4 w-4" />
          <span className="font-medium">Search Region</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Chromosome:</span>
            <span className="ml-2 font-mono">{region.chromosome}</span>
          </div>
          <div>
            <span className="text-gray-600">nORF Start:</span>
            <span className="ml-2 font-mono">{region.start.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-gray-600">nORF End:</span>
            <span className="ml-2 font-mono">{region.end.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-gray-600">Search Range:</span>
            <span className="ml-2 font-mono">±50000bp</span>
          </div>
        </div>
      </div>

      {/* Genes Section */}
      {genes && genes.length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-900 mb-3">
            Nearby Genes ({genes.length})
          </h4>
          <div className="space-y-3">
            {genes.map((gene, index) => (
              <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-blue-900">
                        {gene.symbol || gene.primaryIdentifier}
                      </span>
                      {gene.symbol && (
                        <span className="text-sm text-gray-600 font-mono">
                          ({gene.primaryIdentifier})
                        </span>
                      )}
                    </div>
                    {gene.name && (
                      <p className="text-sm text-gray-700 mb-2">{gene.name}</p>
                    )}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs text-gray-600">
                      <div>
                        <span className="font-medium">Position:</span>
                        <span className="ml-1 font-mono">
                          {gene.start?.toLocaleString()} - {gene.end?.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Distance:</span>
                        <span className="ml-1 font-mono">
                          {Math.min(
                            Math.abs(gene.start - region.start),
                            Math.abs(gene.end - region.end)
                          ).toLocaleString()}bp
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Feature ID:</span>
                        <span className="ml-1 font-mono">{gene.featureId}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transcripts Section */}
      {transcripts && transcripts.length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-900 mb-3">
            Nearby Transcripts ({transcripts.length})
          </h4>
          <div className="space-y-3">
            {transcripts.map((transcript, index) => (
              <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-green-900">
                        {transcript.primaryIdentifier}
                      </span>
                      {transcript.geneSymbol && (
                        <span className="text-sm text-gray-600">
                          (Gene: {transcript.geneSymbol})
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs text-gray-600">
                      <div>
                        <span className="font-medium">Position:</span>
                        <span className="ml-1 font-mono">
                          {transcript.start?.toLocaleString()} - {transcript.end?.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Gene ID:</span>
                        <span className="ml-1 font-mono">{transcript.geneId}</span>
                      </div>
                      <div>
                        <span className="font-medium">Chromosome:</span>
                        <span className="ml-1 font-mono">{transcript.chromosome}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {(!genes || genes.length === 0) && (!transcripts || transcripts.length === 0) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-700 mb-2">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">No Nearby Features Found</span>
            <span className="text-xs text-yellow-600 ml-auto">via HumanMine.org</span>
          </div>
          <p className="text-yellow-600 text-sm">
            No known genes or transcripts were found in the ±50000bp region around this nORF.
            This could indicate a novel genomic region or the nORF may be in an intergenic area.
          </p>
        </div>
      )}

      {/* Data Source */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Data sourced from{' '}
          <a
            href="https://www.humanmine.org/humanmine/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 underline"
          >
            HumanMine
          </a>
          {' '}using InterMine web services. Search region: ±50000bp around nORF coordinates.
        </p>
      </div>
    </div>
  )
}

export default HumanMineData 