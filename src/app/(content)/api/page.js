import dynamic from 'next/dynamic'

const APIComponent = dynamic(() => import('./APIComponent'), { ssr: false })

export const metadata = {
  description: 'API Documentation',
  title: 'API Documentation',
}

export default function ApiPage() {
  return <APIComponent />
}