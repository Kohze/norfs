'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import supabase from '@/supabase/app'
import { Button } from '@/components/UI/button'
import { Loader2 } from 'lucide-react'

const PDBViewer = dynamic(
  () => import('../app/(content)/id/[id]/PDBViewer.js'),
  {
    ssr: false,
    loading: () => (
      <p className="text-sm text-gray-500 mt-2">Loading PDB preview...</p>
    ),
  },
)

// Skeleton component for individual nORF cards
const NorfCardSkeleton = () => (
  <div className="p-3 border rounded animate-pulse">
    <div className="flex-1 mb-2">
      {' '}
      <div className="h-5 bg-gray-300 rounded w-1/3 mb-2"></div>{' '}
      <div className="h-4 bg-gray-300 rounded w-3/4 mb-1"></div>{' '}
      <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>{' '}
    </div>
    <div className="mt-2">
      {' '}
      <div className="h-[240px] bg-gray-300 rounded w-full"></div>{' '}
    </div>
  </div>
)

export default function SimilarNorfSidebar({ geneId }) {
  const [similarNorfs, setSimilarNorfs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [debugInfo, setDebugInfo] = useState(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchSimilarNorfs() {
      try {
        setLoading(true)
        setError(null)
        setDebugInfo(null)

        const { data: fallbackNorfs, error: fallbackError } = await supabase
          .from('norfs')
          .select('gene_id, seqname, start, end, strand, feature')
          .gt('gene_id', geneId)
          .order('gene_id', { ascending: true })
          .limit(5)

        if (fallbackError) {
          console.error('Error fetching nORFs:', fallbackError)
          throw new Error(
            `Failed to fetch nORFs: ${fallbackError.message}`,
          )
        }

        if (!fallbackNorfs?.length) {
          setSimilarNorfs([])
          setDebugInfo((prev) => ({
            ...prev,
            message: 'No nORFs found',
            resultsCount: 0,
          }))
          return
        }

        setSimilarNorfs(
          fallbackNorfs.map((n) => ({
            ...n,
            similarity: null,
            pdb_url: `https://norfs.s3.eu-west-2.amazonaws.com/pdb/${n.gene_id}.pdb`,
          })),
        )
        setDebugInfo((prev) => ({
          ...prev,
          message: 'Showing next 5 nORFs in DB',
          resultsCount: fallbackNorfs.length,
        }))
      } catch (err) {
        console.error('Error in fetchSimilarNorfs:', err)
        setError(err.message)
        setDebugInfo((prev) => ({
          ...prev,
          error: err.message,
          errorTimestamp: new Date().toISOString(),
        }))
      } finally {
        setLoading(false)
      }
    }

    if (geneId) {
      fetchSimilarNorfs()
    }
  }, [geneId])

  if (loading) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Next nORFs</h2>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <NorfCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Next nORFs</h2>
        <div className="text-red-600 mb-4">{error}</div>
        {debugInfo && (
          <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
            <h3 className="font-semibold mb-2">Debug Info:</h3>
            <pre className="whitespace-pre-wrap">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Next nORFs</h2>
      {similarNorfs.length === 0 ? (
        <div className="text-gray-500">No subsequent nORFs found.</div>
      ) : (
        <div className="space-y-3">
          {similarNorfs.map((norf) => (
            <div
              key={norf.gene_id}
              className="p-3 border rounded hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => router.push(`/id/${norf.gene_id}`)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-medium">{norf.gene_id}</div>
                  <div className="text-sm text-gray-600">
                    {norf.seqname}:{norf.start}-{norf.end} ({norf.strand})
                  </div>
                  <div className="text-sm text-gray-500">{norf.feature}</div>
                  {norf.pdb_url && (
                    <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                      <PDBViewer
                        pdbUrl={norf.pdb_url}
                        height="240px"
                        showDebugInfo={false}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading &&
        similarNorfs.length > 0 &&
        debugInfo &&
        (debugInfo.message ||
          debugInfo.error ||
          debugInfo.resultsCount !== undefined) && (
          <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
            <h3 className="font-semibold mb-2">Debug Info:</h3>
            <pre className="whitespace-pre-wrap">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
    </div>
  )
}
