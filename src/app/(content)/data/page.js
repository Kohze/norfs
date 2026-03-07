'use client'
import React, { useState } from 'react'
import Link from 'next/link'

export default function Data() {
  const [searchTerm, setSearchTerm] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    // Implement search functionality here
    console.log('Searching for:', searchTerm)
  }

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-8">
            Database Files
          </h1>

          <p className="text-lg leading-7 text-gray-600 mb-6">
            To accommodate programmatic access to the nORFs.org database and
            functionality, we provide all our data via direct download and UCSC
            track (annotationhub). The nORFs.org database has an open source MIT
            license and grants every user the right to download, edit, modify or
            redistribute, only requiring the inclusion of the original license
            file.
          </p>

          <p className="text-lg leading-7 text-gray-600 mb-6">
            All coordinates are in GRCh38. See our{' '}
            <a
              href="https://github.com/Kohze/norfs-data-prep"
              className="text-blue-600 hover:underline"
            >
              GitHub repository
            </a>{' '}
            for the fully reproducible code to generate these files.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
            Database Download
          </h2>
          <ul className="list-disc pl-5 text-lg leading-7 text-gray-600 mb-6">
            <li>
              <a
                href="https://firebasestorage.googleapis.com/v0/b/phoenix-6686b.appspot.com/o/nORFsDB.1.1.gtf?alt=media&token=a3e41fe4-b1e5-4002-9384-b9d48bd5e25d"
                className="text-blue-600 hover:underline"
              >
                nORFs_DB 1.1 (.gtf)
              </a>
            </li>
            <li>
              <a
                href="https://firebasestorage.googleapis.com/v0/b/phoenix-6686b.appspot.com/o/nORFsDB.1.1.bed?alt=media&token=044a4750-6704-425c-988c-fe1bbc38d3b6"
                className="text-blue-600 hover:underline"
              >
                nORFs_DB 1.1 (.bed)
              </a>
            </li>
            <li>
              <a
                href="https://firebasestorage.googleapis.com/v0/b/phoenix-6686b.appspot.com/o/nORFsDB.1.1.classification.tsv?alt=media&token=2c60916b-92ab-41a0-abe1-7519ccd1552c"
                className="text-blue-600 hover:underline"
              >
                nORFs_DB Classification 1.1 (.gtf)
              </a>
            </li>
            <li>
              <a
                href="https://firebasestorage.googleapis.com/v0/b/phoenix-6686b.appspot.com/o/nORFs_1.1_UCSC.bed?alt=media&token=deb7fa57-6036-4132-9414-35337c3a0309"
                className="text-blue-600 hover:underline"
              >
                nORFs_DB 1.1 UCSC track (.bed)
              </a>
            </li>
          </ul>

          <p className="text-lg leading-7 text-gray-600 mt-8">
            For more detailed information about our database or if you need
            assistance, please visit our{' '}
            <Link href="/methods" className="text-blue-600 hover:underline">
              Methods
            </Link>{' '}
            page or contact our support team.
          </p>
        </div>
      </div>
    </div>
  )
}
