import React from 'react'

export default function Methods() {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-8">Methods</h1>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Abstract</h2>
          <p className="text-lg leading-7 text-gray-600 mb-6">
            Recent evidence from proteomics and deep massively parallel sequencing studies have revealed that eukaryotic genomes contain substantial numbers of as-yet-uncharacterized open reading frames (ORFs). We define these uncharacterized ORFs as novel ORFs (nORFs). nORFs in humans are mostly under 100 codons and are found in diverse regions of the genome, including in long noncoding RNAs, pseudogenes, 3′ UTRs, 5′ UTRs, and alternative reading frames of canonical protein coding exons.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Data Overview</h2>
          <p className="text-lg leading-7 text-gray-600 mb-6">
            The nORFs data set contains 233,232 ORFs curated from OpenProt and sORFs.org. These nORFs were annotated with respect to canonical transcripts and CDS, and they are found in diverse locations in the genomes such as overlapping canonical CDSs in alternate frames (altCDSs), in UTRs, in noncoding RNAs (ncRNAs), and in intronic/intergenic regions.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Selection of Sources</h2>
          <p className="text-lg leading-7 text-gray-600 mb-6">
            We used OpenProt (Release 1.3) and sORFs.org as the main sources for the nORFs data set. These databases were chosen for their commitment to providing consistent, verifiable, and maintained data.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Curation of nORFs</h2>
          <p className="text-lg leading-7 text-gray-600 mb-6">
            Our curation process ensured that the final data set (1) contains only nORFs with translation evidence from either MS or ribosome profiling, (2) contains no duplicate or highly similar entries, and (3) contains only ORFs clearly distinct from currently annotated canonical proteins.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Annotation of nORFs</h2>
          <p className="text-lg leading-7 text-gray-600 mb-6">
            We annotated each nORF with reference to human GENCODE (v30) gene annotations. The annotation categories included nORFs mapping to UTRs or CDS of protein coding transcripts, ncRNAs, or intergenic regions.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Database and Web Platform</h2>
          <p className="text-lg leading-7 text-gray-600 mb-6">
            We built an online platform with REST API functionality to make the nORFs data set easily accessible. The curated and annotated GRCh38 raw data set is available in BED and GTF formats, as well as a downloadable nORFs.org UCSC track. All coordinates in our database are in GRCh38. For the fully reproducible code used to generate these files, please refer to our <a href="https://github.com/Kohze/norfs-data-prep" className="text-blue-600 hover:underline">GitHub repository</a>.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Original Research Paper</h2>
          <p className="text-lg leading-7 text-gray-600 mb-6">
            For a comprehensive understanding of our methods and findings, please refer to our original research paper:
          </p>
          <p className="text-lg leading-7 text-gray-600 mb-6">
            Neville MDC, Kohze R, Erady C, Meena N, Hayden M, Cooper DN, Mort M, Prabakaran S. A platform for curated products from novel open reading frames prompts reinterpretation of disease variants. Genome Res. 2021 Feb;31(2):327-336. doi: 10.1101/gr.263202.120. Epub 2021 Jan 19. PMID: 33468550; PMCID: PMC7849405.
          </p>
          <p className="text-lg leading-7 text-gray-600 mb-6">
            The full text of this paper is available at: <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7849405/" className="text-blue-600 hover:underline">https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7849405/</a>
          </p>

          <p className="text-lg leading-7 text-gray-600 mt-8">
            For more detailed information about our methods, please refer to our published paper or contact us directly.
          </p>
        </div>
      </div>
    </div>
  )
}
