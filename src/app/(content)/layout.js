import '../globals.css'
import { Header, Footer } from '@/components/Layout'

export const metadata = {
  title: 'nORFs.org | Novel Open Reading Frames Database',
  description:
    'Explore curated products from novel open reading frames (nORFs). A comprehensive database for researchers and scientists studying protein-coding sequences.',
  keywords:
    'nORFs, novel open reading frames, protein-coding sequences, genomics, bioinformatics, database',
  openGraph: {
    title: 'nORFs.org | Novel Open Reading Frames Database',
    description:
      'Explore curated products from novel open reading frames (nORFs). A comprehensive database for researchers and scientists.',
    type: 'website',
    url: 'https://nORFs.org',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'nORFs.org | Novel Open Reading Frames Database',
    description:
      'Explore curated products from novel open reading frames (nORFs). A comprehensive database for researchers and scientists.',
  },
}

export default function ContentRootLayout({ children }) {
  return (
    <>
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </>
  )
}
