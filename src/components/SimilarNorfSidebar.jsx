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

export default function SimilarNorfSidebar({ geneId }) {
  const [similarNorfs, setSimilarNorfs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [debugInfo, setDebugInfo] = useState(null)
  const [isFallback, setIsFallback] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function fetchSimilarNorfs() {
      try {
        setLoading(true)
        setError(null)
        setDebugInfo(null)
        setIsFallback(false)

        let featureVector = null
        try {
          const { data: testQuery, error: testError } = await supabase
            .from('norf_features')
            .select('gene_id, feature_vector')
            .eq('gene_id', geneId)
            .single()

          if (testError) {
            console.error('Error fetching feature vector:', testError.message)
          }
          if (testQuery?.feature_vector) {
            featureVector = testQuery.feature_vector
          } else if (!testError) {
            console.warn(
              'No feature vector found for this nORF, attempting fallback.',
            )
          }
        } catch (e) {
          console.error('Exception during feature vector fetch:', e)
        }

        let similarResults = []
        let similarityError = null

        if (featureVector) {
          const { data, error: rpcError } = await supabase.rpc(
            'find_similar_norfs_raw',
            {
              p_target_vector: featureVector,
              p_exclude_gene_id: geneId,
              p_similarity_threshold: 0.2,
              p_limit: 10,
            },
          )
          similarResults = data
          similarityError = rpcError
        }

        if (
          similarityError ||
          (!similarResults?.length && featureVector) ||
          !featureVector
        ) {
          if (similarityError) {
            console.warn(
              'Vector search failed, attempting fallback:',
              similarityError.message,
            )
          } else if (!similarResults?.length && featureVector) {
            console.warn(
              'Vector search returned no results, attempting fallback.',
            )
          } else if (!featureVector) {
            console.warn(
              'No feature vector for vector search, attempting fallback directly.',
            )
          }

          setIsFallback(true)
          const { data: fallbackNorfs, error: fallbackError } = await supabase
            .from('norfs')
            .select('gene_id, seqname, start, end, strand, feature')
            .gt('gene_id', geneId)
            .order('gene_id', { ascending: true })
            .limit(5)

          if (fallbackError) {
            console.error('Error fetching fallback nORFs:', fallbackError)
            throw new Error(
              `Failed to fetch fallback nORFs: ${fallbackError.message}`,
            )
          }

          if (!fallbackNorfs?.length) {
            setSimilarNorfs([])
            setDebugInfo((prev) => ({
              ...prev,
              message: 'No similar nORFs or fallback nORFs found',
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
            message: 'Showing fallback nORFs (next 5 in DB)',
            resultsCount: fallbackNorfs.length,
          }))
        } else {
          setSimilarNorfs(similarResults)
          setDebugInfo((prev) => ({
            ...prev,
            message: 'Showing similar nORFs based on vector search',
            resultsCount: similarResults.length,
            similarityRange: {
              min: Math.min(
                ...similarResults
                  .map((r) => r.similarity)
                  .filter((s) => s !== null && s !== undefined),
              ),
              max: Math.max(
                ...similarResults
                  .map((r) => r.similarity)
                  .filter((s) => s !== null && s !== undefined),
              ),
            },
          }))
        }
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

  const handleRetry = () => {
    setError(null)
    setDebugInfo(null)
    if (geneId) {
      fetchSimilarNorfs()
    }
  }

  if (loading) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Similar nORFs</h2>
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">
          {isFallback ? 'Next nORFs' : 'Similar nORFs'}
        </h2>
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={handleRetry}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Retry
        </button>
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
      <h2 className="text-lg font-semibold mb-4">
        {isFallback ? 'Next nORFs' : 'Similar nORFs'}
      </h2>
      {similarNorfs.length === 0 ? (
        <div className="text-gray-500">
          {isFallback
            ? 'No subsequent nORFs found.'
            : 'No similar nORFs found.'}
        </div>
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
                  {isFallback && norf.pdb_url && (
                    <div className="mt-2">
                      <PDBViewer
                        pdbUrl={norf.pdb_url}
                        height="240px"
                        showDebugInfo={false}
                      />
                    </div>
                  )}
                </div>
                <div className="text-sm font-medium text-blue-600">
                  {norf.similarity !== null
                    ? `${(norf.similarity * 100).toFixed(1)}%`
                    : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
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
