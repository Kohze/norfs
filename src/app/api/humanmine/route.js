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

    // Calculate ±50000bp region around the nORF
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

    // Alternative query for transcripts in the region
    const transcriptQuery = {
      description: "For a specified organism and chromosomal location show all transcripts",
      where: [
        {
          path: "Chromosome.locatedFeatures.feature",
          type: "Transcript"
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
      name: "ChromRegion_Transcripts",
      title: "Chromosomal Location --> All Transcripts",
      from: "Chromosome",
      select: [
        "Chromosome.primaryIdentifier",
        "Chromosome.locatedFeatures.start",
        "Chromosome.locatedFeatures.feature.primaryIdentifier",
        "Chromosome.locatedFeatures.feature.gene.primaryIdentifier",
        "Chromosome.locatedFeatures.feature.gene.symbol",
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

    console.log('HumanMine query params:', { 
      normalizedChromosome, 
      start: parseInt(start), 
      end: parseInt(end),
      regionStart,
      regionEnd
    })

    // Execute queries with timeout and better error handling
    const timeout = 30000 // 30 seconds timeout
    
    const executeQuery = (query, queryName) => {
      return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error(`${queryName} query timed out after ${timeout}ms`))
        }, timeout)

        service.records(query, 
          (res) => {
            clearTimeout(timeoutId)
            resolve(res || [])
          }, 
          (err) => {
            clearTimeout(timeoutId)
            console.error(`${queryName} query error:`, err)
            reject(new Error(`${queryName} query failed: ${err.message || 'Unknown error'}`))
          }
        )
      })
    }

    // Execute queries sequentially
    let geneData = []
    let transcriptData = []

    try {
      geneData = await executeQuery(norfRegionQuery, 'Exon Region')
      console.log(`Found ${geneData.length} exons in ±50000bp region`)
      console.log('Exon data type:', typeof geneData)
      console.log('Exon data is array:', Array.isArray(geneData))
      console.log('Exon data sample:', geneData.slice(0, 2))
    } catch (error) {
      console.error('Exon region query failed:', error)
      // Continue with other queries
    }

    try {
      transcriptData = await executeQuery(transcriptQuery, 'Transcript Region')
      console.log(`Found ${transcriptData.length} transcripts in ±50000bp region`)
      console.log('Transcript data type:', typeof transcriptData)
      console.log('Transcript data is array:', Array.isArray(transcriptData))
      console.log('Transcript data sample:', transcriptData.slice(0, 2))
    } catch (error) {
      console.error('Transcript region query failed:', error)
      // Continue with other queries
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

    // Process transcript data - updated to handle tab-separated response format
    const processedTranscripts = (Array.isArray(transcriptData) ? transcriptData : []).map(row => {
      // Handle both object format and array format
      if (Array.isArray(row)) {
        // Array format: [chromosome, start, featureId, geneId, geneSymbol, organism]
        return {
          primaryIdentifier: row[2], // Feature ID (transcript ID)
          geneId: row[3], // Gene ID
          geneSymbol: row[4], // Gene Symbol
          chromosome: row[0], // Chromosome
          start: parseInt(row[1]), // Start position
          end: null // Not available in this format
        }
      } else {
        // Object format (fallback)
        return {
          primaryIdentifier: row['Chromosome.locatedFeatures.feature.primaryIdentifier'],
          geneId: row['Chromosome.locatedFeatures.feature.gene.primaryIdentifier'],
          geneSymbol: row['Chromosome.locatedFeatures.feature.gene.symbol'],
          chromosome: row['Chromosome.primaryIdentifier'],
          start: row['Chromosome.locatedFeatures.start'],
          end: row['Chromosome.locatedFeatures.end']
        }
      }
    })

    return NextResponse.json({
      genes: processedGenes,
      transcripts: processedTranscripts,
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