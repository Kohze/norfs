'use client'

import React, { useState, useEffect } from 'react'
import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import dynamic from 'next/dynamic'
import { Download, Home as HomeIconLucide } from 'lucide-react'
import { Button } from '@/components/UI/button'
import { Breadcrumb } from '@/components/UI/breadcrumb'
import SimilarNorfSidebar from '@/components/SimilarNorfSidebar'
import HumanMineData from '@/components/HumanMineData'

// Dynamic imports with ssr: false for client-side only components
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })
const FeatureViewer = dynamic(() => import('feature-viewer'), { ssr: false })
const DallianceViewer = dynamic(() => import('./dalliance-viewer.js'), {
  ssr: false,
})
const PDBViewer = dynamic(() => import('./PDBViewer.js'), { ssr: false })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
)

const getAminoAcidColor = (aa) => {
  const colorMap = {
    A: 'bg-blue-200',
    R: 'bg-red-200',
    N: 'bg-green-200',
    D: 'bg-yellow-200',
    C: 'bg-purple-200',
    Q: 'bg-pink-200',
    E: 'bg-indigo-200',
    G: 'bg-gray-200',
    H: 'bg-orange-200',
    I: 'bg-teal-200',
    L: 'bg-cyan-200',
    K: 'bg-lime-200',
    M: 'bg-amber-200',
    F: 'bg-emerald-200',
    P: 'bg-sky-200',
    S: 'bg-violet-200',
    T: 'bg-fuchsia-200',
    W: 'bg-rose-200',
    Y: 'bg-slate-200',
    V: 'bg-stone-200',
  }
  return colorMap[aa.toUpperCase()] || 'bg-gray-100'
}

export default function NorfDetail({ params }) {
  const [norfData, setNorfData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sequence, setSequence] = useState('')
  const [phyloPScores, setPhyloPScores] = useState([])
  const [phastConsScores, setPhastConsScores] = useState([])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    const fetchNorfDetails = async () => {
      try {
        const { data, error } = await supabase
          .from('norfs')
          .select('*')
          .eq('gene_id', params.id)
          .single()

        if (error) throw error
        if (!data) notFound()

        setNorfData({
          ...data,
          pdb_url: `https://norfs.s3.eu-west-2.amazonaws.com/pdb/${data.gene_id}.pdb`,
        })
        setSequence(data.AA_seq || '')

        setPhyloPScores(
          Array(100)
            .fill(0)
            .map(() => Math.random()),
        )
        setPhastConsScores(
          Array(100)
            .fill(0)
            .map(() => Math.random()),
        )
      } catch (err) {
        console.error('Error fetching nORF details:', err)
        setError('Failed to fetch nORF details. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchNorfDetails()
  }, [params.id])

  const handlePDBDownload = async () => {
    if (!isClient || !norfData?.pdb_url) return
    try {
      const response = await fetch(norfData.pdb_url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${norfData.gene_id}.pdb`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Error downloading PDB file:', err)
    }
  }

  if (loading) {
    const commonFields = [
      { key: 'chr', staticLabel: 'chr' },
      { key: 'source', staticLabel: 'source' },
      { key: 'feature', staticLabel: 'feature' },
      { key: 'start', staticLabel: 'start' },
      { key: 'end', staticLabel: 'end' },
      { key: 'score', staticLabel: 'score' },
      { key: 'strand', staticLabel: 'strand' },
      { key: 'frame', staticLabel: 'frame' },
      { key: 'start_codon', staticLabel: 'start_codon' },
      { key: 'sorf_length', staticLabel: 'sorf_length' },
    ]

    return (
      <div className="bg-white pt-8 pb-24 sm:pt-12 sm:pb-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex gap-8">
            <div className="flex-1 animate-pulse">
              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
                <span className="flex items-center text-gray-600">
                  <HomeIconLucide className="h-4 w-4" />
                </span>
                <span className="flex items-center">
                  <span className="h-4 w-4 mx-1 text-gray-400"></span>
                  <span>Home</span>
                </span>
                <span className="flex items-center">
                  <span className="h-4 w-4 mx-1 text-gray-400"></span>
                  <span>Database</span>
                </span>
                <span className="flex items-center">
                  <span className="h-4 w-4 mx-1 text-gray-400"></span>
                  <span className="inline-block h-4 bg-gray-200 rounded w-32 align-middle"></span>
                </span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-8">
                nORF Id:{' '}
                <span className="inline-block h-10 bg-gray-300 rounded w-56 align-bottom"></span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-gray-900">
                    General Information
                  </h3>
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                    {commonFields.map((field) => (
                      <React.Fragment key={field.key}>
                        <dt className="text-sm font-medium text-gray-500">
                          {field.staticLabel}
                        </dt>
                        <dd className="text-sm text-gray-900">
                          <span className="inline-block h-4 bg-gray-200 rounded w-3/4"></span>
                        </dd>
                      </React.Fragment>
                    ))}
                  </dl>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-gray-900">
                    3D Structure
                  </h3>
                  <div className="w-full mt-2">
                    <div className="h-[240px] bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              </div>

              <div className="mt-12">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">
                  Sequence Information
                </h3>
                <div className="h-24 bg-gray-200 rounded w-full"></div>
              </div>

              <div className="mt-12">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">
                  Functional Map
                </h3>
                <div className="h-64 bg-gray-200 rounded w-full"></div>
              </div>

              <div className="mt-12">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">
                  Genome Browser
                </h3>
                <div className="h-[422px] bg-white rounded w-full border border-gray-200"></div>
              </div>

              <div className="mt-12">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">
                  Conservation Scores
                </h3>
                <div className="h-64 bg-white rounded w-full border border-gray-200"></div>
              </div>

              <div className="mt-12">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">
                  Genomic Context (HumanMine)
                </h3>
                <div className="h-48 bg-gray-200 rounded w-full"></div>
              </div>
            </div>

            <div className="hidden lg:block w-96">
              <SimilarNorfSidebar geneId={params.id} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error)
    return <div className="text-center py-24 text-red-500">{error}</div>
  if (!norfData) return notFound()

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Database', href: '/database' },
    { label: `nORF ${norfData.gene_id}` },
  ]

  return (
    <div className="bg-white pt-8 pb-24 sm:pt-12 sm:pb-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex gap-8">
          <div className="flex-1">
            <Breadcrumb items={breadcrumbItems} />
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-8">
              nORF Id: {norfData.gene_id}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-semibold mb-4">
                  General Information
                </h3>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                  {Object.entries(norfData)
                    .filter(
                      ([key]) =>
                        key !== 'AA_seq' &&
                        key !== 'pdb_url' &&
                        key !== 'id' &&
                        key !== 'gene_id',
                    )
                    .map(([key, value]) => (
                      <React.Fragment key={key}>
                        <dt className="text-sm font-medium text-gray-500">
                          {key === 'seqname' ? 'chr' : key}
                        </dt>
                        <dd className="text-sm text-gray-900">
                          {value !== null ? value : 'N/A'}
                        </dd>
                      </React.Fragment>
                    ))}
                </dl>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">3D Structure</h3>
                  {norfData.pdb_url && isClient && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePDBDownload}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    >
                      <Download className="h-4 w-4" />
                      Download PDB
                    </Button>
                  )}
                </div>
                <div className="w-full mt-2">
                  {norfData.pdb_url && isClient ? (
                    <PDBViewer
                      pdbUrl={norfData.pdb_url}
                      height="240px"
                      showDebugInfo={false}
                    />
                  ) : (
                    <p className="text-gray-600 p-4 text-center">
                      PDB structure not available
                    </p>
                  )}
                </div>
              </div>
            </div>

            {isClient && (
              <>
                <div className="mt-12">
                  <h3 className="text-xl font-semibold mb-4">
                    Sequence Information
                  </h3>
                  <div id="featureViewer"></div>
                  <div className="bg-gray-50 p-4 rounded-lg overflow-x-auto mt-4">
                    <div className="text-sm whitespace-pre-wrap">
                      {norfData.AA_seq.split('').reduce((acc, aa, index) => {
                        const colorClass = getAminoAcidColor(aa)
                        acc.push(
                          <span
                            key={`aa-${index}`}
                            className={`inline-block ${colorClass} w-6 h-6 text-center`}
                          >
                            {aa}
                          </span>,
                        )
                        if ((index + 1) % 50 === 0) {
                          acc.push(<br key={`br-${index}`} />)
                        }
                        return acc
                      }, [])}
                    </div>
                  </div>
                </div>

                <div className="mt-12">
                  <h3 className="text-xl font-semibold mb-4">
                    Functional Map{' '}
                    <span className="inline-flex items-center gap-2">
                      <a
                        href="https://deepmind.google.com/science/alphagenome/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200 transition-colors cursor-pointer"
                      >
                        AlphaGenome
                      </a>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                        experimental
                      </span>
                    </span>
                  </h3>
                  <div className="w-full mt-2">
                    {isClient ? (
                      <div className="bg-white p-4 rounded-lg">
                        <img
                          src={`https://norfs.s3.eu-west-2.amazonaws.com/pdb/${norfData.gene_id}_functional_map.svg`}
                          alt={`Functional map for ${norfData.gene_id}`}
                          className="w-full h-auto max-h-96 object-contain"
                          onError={(e) => {
                            e.target.style.display = 'none'
                            e.target.nextSibling.style.display = 'block'
                          }}
                        />
                        <p
                          className="text-gray-600 p-4 text-center hidden"
                          style={{ display: 'none' }}
                        >
                          Functional map is still being processed.
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-600 p-4 text-center">
                        Loading functional map...
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-12 min-h-[422px]">
                  <h3 className="text-xl font-semibold mb-4">Genome Browser</h3>
                  <DallianceViewer norfData={norfData} />
                </div>

                <div className="mt-12">
                  <h3 className="text-xl font-semibold mb-4">
                    Conservation Scores
                  </h3>
                  <div>
                    <Chart
                      options={{
                        chart: {
                          zoom: { enabled: false },
                          toolbar: { show: false },
                        },
                        xaxis: {
                          title: { text: 'Position' },
                          labels: {
                            formatter: function (value) {
                              return value % 5 === 0 ? value : ''
                            },
                          },
                        },
                        yaxis: {
                          title: { text: 'Score' },
                          min: 0,
                          max: 1,
                          labels: {
                            formatter: function (val) {
                              return val.toFixed(1)
                            },
                          },
                        },
                        legend: {
                          position: 'top',
                        },
                        stroke: {
                          width: 2,
                        },
                      }}
                      series={[
                        { name: 'PhyloP score', data: phyloPScores },
                        { name: 'PhastCons score', data: phastConsScores },
                      ]}
                      type="line"
                      height={400}
                    />
                  </div>
                </div>

                <div className="mt-12">
                  <HumanMineData norf={norfData} />
                </div>
              </>
            )}
          </div>

          <div className="hidden lg:block w-96">
            <SimilarNorfSidebar geneId={params.id} />
          </div>
        </div>
      </div>
    </div>
  )
}
