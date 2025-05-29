import React from 'react'
import { CombinedAuthProvider } from '../contexts/authContext'

export const metadata = {
  title: 'nORFs.org | Novel Open Reading Frames Database',
  description:
    'Explore curated products from novel open reading frames (nORFs). A comprehensive database for researchers and scientists studying protein-coding sequences.',
  keywords:
    'nORFs, novel open reading frames, protein-coding sequences, genomics, bioinformatics, database',
  author: 'nORFs.org Team',
  openGraph: {
    title: 'nORFs.org | Novel Open Reading Frames Database',
    description:
      'Explore curated products from novel open reading frames (nORFs). A comprehensive database for researchers and scientists.',
    type: 'website',
    url: 'https://nORFs.org',
    image: '/og-image.jpg',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'nORFs.org | Novel Open Reading Frames Database',
    description:
      'Explore curated products from novel open reading frames (nORFs). A comprehensive database for researchers and scientists.',
    image: '/twitter-image.jpg',
  },
}

export default function AppLayout({ children }) {
  return (
    <html lang="en" className={`bg-white`}>
      <body className="flex flex-col min-h-screen">
        <CombinedAuthProvider>{children}</CombinedAuthProvider>
      </body>
    </html>
  )
}
