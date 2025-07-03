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
          type: "Gene"
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
      geneData = await executeQuery(norfRegionQuery, 'Gene Region')
      console.log(`Found ${geneData.length} genes in ±50000bp region`)
    } catch (error) {
      console.error('Gene region query failed:', error)
      // Continue with other queries
    }

    try {
      transcriptData = await executeQuery(transcriptQuery, 'Transcript Region')
      console.log(`Found ${transcriptData.length} transcripts in ±50000bp region`)
    } catch (error) {
      console.error('Transcript region query failed:', error)
      // Continue with other queries
    }

    // Process gene data - updated to match the new field structure
    const processedGenes = geneData.map(gene => ({
      primaryIdentifier: gene['Chromosome.locatedFeatures.feature.gene.primaryIdentifier'],
      symbol: gene['Chromosome.locatedFeatures.feature.gene.symbol'],
      name: gene['Chromosome.locatedFeatures.feature.gene.name'] || null,
      chromosome: gene['Chromosome.primaryIdentifier'],
      start: gene['Chromosome.locatedFeatures.start'],
      end: gene['Chromosome.locatedFeatures.end'],
      featureId: gene['Chromosome.locatedFeatures.feature.primaryIdentifier']
    }))

    // Process transcript data - updated to match the new field structure
    const processedTranscripts = transcriptData.map(transcript => ({
      primaryIdentifier: transcript['Chromosome.locatedFeatures.feature.primaryIdentifier'],
      geneId: transcript['Chromosome.locatedFeatures.feature.gene.primaryIdentifier'],
      geneSymbol: transcript['Chromosome.locatedFeatures.feature.gene.symbol'],
      chromosome: transcript['Chromosome.primaryIdentifier'],
      start: transcript['Chromosome.locatedFeatures.start'],
      end: transcript['Chromosome.locatedFeatures.end']
    }))

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