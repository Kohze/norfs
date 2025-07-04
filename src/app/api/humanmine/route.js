import { NextResponse } from 'next/server'
import imjs from 'imjs'

const SERVICE_ROOT = 'https://www.humanmine.org/humanmine/service'

export async function POST(request) {
  try {
    const { chromosome, start, end, geneId, testMode, customQuery } = await request.json()

    if (testMode && customQuery) {
      // Test mode for experimenting with queries
      return await executeCustomQuery(customQuery)
    }

    if (!chromosome || !start || !end) {
      return NextResponse.json(
        { error: 'Missing required parameters: chromosome, start, or end.' },
        { status: 400 }
      )
    }

    // Normalize chromosome format (remove 'chr' prefix if present)
    const normalizedChromosome = chromosome.replace(/^chr/i, '')
    
    const service = new imjs.Service({ 
      root: SERVICE_ROOT,
      token: 'G1v997Ddt2K8Mf7792k3' // Adding token from working example
    })

    // Calculate ±50kb region around the nORF
    const regionStart = Math.max(1, parseInt(start) - 50000)
    const regionEnd = parseInt(end) + 50000

    // Using the exact working query structure from the user's example
    const norfRegionQuery = {
      description: "For a specified organism and chromosomal location show all genes, transcripts and exons",
      where: [
        {
          path: "Chromosome.locatedFeatures.feature",
          type: "Exon"
        },
        {
          path: "Chromosome.organism.name",
          op: "=",
          code: "D",
          value: "Homo sapiens"
        },
        {
          path: "Chromosome.primaryIdentifier",
          op: "=",
          code: "A",
          value: normalizedChromosome
        },
        {
          path: "Chromosome.locatedFeatures.start",
          op: ">=",
          code: "C",
          value: regionStart.toString()
        },
        {
          path: "Chromosome.locatedFeatures.end",
          op: "<=",
          code: "B",
          value: regionEnd.toString()
        }
      ],
      name: "ChromRegion_GenesTransExon",
      title: "Chromosomal Location --> All Genes + Transcripts + Exons",
      from: "Chromosome",
      select: [
        "Chromosome.primaryIdentifier",
        "Chromosome.locatedFeatures.start",
        "Chromosome.locatedFeatures.feature.primaryIdentifier",
        "Chromosome.locatedFeatures.feature.gene.primaryIdentifier",
        "Chromosome.locatedFeatures.feature.gene.symbol",
        "Chromosome.locatedFeatures.feature.gene.transcripts.primaryIdentifier",
        "Chromosome.organism.name"
      ],
      sortOrder: [
        {
          path: "Chromosome.primaryIdentifier",
          direction: "ASC"
        },
        {
          path: "Chromosome.primaryIdentifier",
          direction: "ASC"
        }
      ],
      constraintLogic: "A and B and C and D"
    }

    // Execute queries with timeout and better error handling
    const timeout = 30000 // 30 seconds timeout
    
    const executeQuery = (query, queryName) => {
      return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error(`${queryName} query timed out after ${timeout}ms`))
        }, timeout)

        // Use the exact method from the working example
        service.records(query, (res) => {
          clearTimeout(timeoutId)
          console.log(`${queryName} raw response:`, res)
          resolve(res || [])
        }, (err) => {
          clearTimeout(timeoutId)
          console.error(`${queryName} query error:`, err)
          reject(new Error(`${queryName} query failed: ${err.message || 'Unknown error'}`))
        })
      })
    }

    // Execute only the exon query (simplified)
    let geneData = []

    try {
      console.log('Executing exon query with params:', {
        chromosome: normalizedChromosome,
        regionStart,
        regionEnd
      })
      
      geneData = await executeQuery(norfRegionQuery, 'Exon Region')
      console.log(`Found ${geneData.length} exons in ±50000bp region`)
      console.log('Exon data type:', typeof geneData)
      console.log('Exon data is array:', Array.isArray(geneData))
      console.log('Exon data sample:', geneData.slice(0, 2))
      console.log('Full exon query sent:', JSON.stringify(norfRegionQuery, null, 2))
    } catch (error) {
      console.error('Exon region query failed:', error)
      console.error('Query that failed:', JSON.stringify(norfRegionQuery, null, 2))
      geneData = [] // Set empty array on error
    }

    // Process gene data - updated to handle exon response format
    const processedGenes = (Array.isArray(geneData) ? geneData : []).map(row => {
      // Handle both object format and array format
      if (Array.isArray(row)) {
        // Array format from exon query: [chromosome, start, exonId, geneId, geneSymbol, transcriptId, organism]
        return {
          primaryIdentifier: row[3], // Gene ID
          symbol: row[4], // Gene Symbol
          name: null, // Not available in this format
          chromosome: row[0], // Chromosome
          start: parseInt(row[1]), // Start position
          end: null, // Not available in this format
          featureId: row[2], // Exon ID
          transcriptId: row[5] // Transcript ID
        }
      } else {
        // Object format (fallback)
        return {
          primaryIdentifier: row['Chromosome.locatedFeatures.feature.gene.primaryIdentifier'],
          symbol: row['Chromosome.locatedFeatures.feature.gene.symbol'],
          name: row['Chromosome.locatedFeatures.feature.gene.name'] || null,
          chromosome: row['Chromosome.primaryIdentifier'],
          start: row['Chromosome.locatedFeatures.start'],
          end: row['Chromosome.locatedFeatures.end'],
          featureId: row['Chromosome.locatedFeatures.feature.primaryIdentifier']
        }
      }
    })

    return NextResponse.json({
      genes: processedGenes,
      transcripts: [], // Simplified - no separate transcript query
      region: { 
        chromosome: normalizedChromosome, 
        start: parseInt(start), 
        end: parseInt(end),
        searchStart: regionStart,
        searchEnd: regionEnd
      }
    })

  } catch (error) {
    console.error('HumanMine API route error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch data from HumanMine.', 
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

async function executeCustomQuery(customQuery) {
  try {
    const service = new imjs.Service({ root: SERVICE_ROOT })
    
    console.log('Executing custom query:', customQuery)
    
    const result = await new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Custom query timed out after 30 seconds'))
      }, 30000)

      service.records(customQuery, 
        (res) => {
          clearTimeout(timeoutId)
          resolve(res || [])
        }, 
        (err) => {
          clearTimeout(timeoutId)
          reject(err)
        }
      )
    })

    return NextResponse.json({
      success: true,
      data: result,
      count: result.length,
      query: customQuery
    })

  } catch (error) {
    console.error('Custom query error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error.message,
        query: customQuery,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
} 