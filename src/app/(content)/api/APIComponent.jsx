'use client'

import React, { useState } from 'react'
import { Tab } from '@headlessui/react'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function APIComponent() {
  const [copiedText, setCopiedText] = useState('')
  const languages = ['cURL', 'Python', 'R']
  const examples = [
    { title: 'Fetch by ID', id: 'fetch-by-id' },
    { title: 'Fetch by Position', id: 'fetch-by-position' }
  ]

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopiedText('Copied!')
    setTimeout(() => setCopiedText(''), 2000)
  }

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-8">API Documentation</h1>
          
          <p className="text-lg leading-7 text-gray-600 mb-6">
            The nORFs.org API allows you to query our database directly. You can fetch data by ID or position using our Supabase-powered backend.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">API Endpoint</h2>
          <p className="text-lg leading-7 text-gray-600 mb-6">
            Base URL: <code className="bg-gray-100 p-1 rounded">https://cttifqllbbilseejcmow.supabase.co/rest/v1/norfs</code>
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Authentication</h2>
          <p className="text-lg leading-7 text-gray-600 mb-6">
            To use the API, you need to include the API key in the headers of your request:
          </p>
          <div className="relative bg-gray-100 p-4 rounded overflow-hidden">
            <pre className="overflow-x-auto pr-16">
              <code>
                eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0dGlmcWxsYmJpbHNlZWpjbW93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc3MjY5MzUsImV4cCI6MjA0MzMwMjkzNX0.F5EDPbJgEFOB0Q5TIQGqYmLinwErR-Y6_KobLtbj4z4
              </code>
            </pre>
            <button
              onClick={() => copyToClipboard('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0dGlmcWxsYmJpbHNlZWpjbW93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc3MjY5MzUsImV4cCI6MjA0MzMwMjkzNX0.F5EDPbJgEFOB0Q5TIQGqYmLinwErR-Y6_KobLtbj4z4')}
              className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-2 rounded-tr hover:bg-blue-600 transition-colors h-full"
            >
              {copiedText || 'Copy'}
            </button>
          </div>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Query Parameters</h2>
          <ul className="list-disc pl-5 text-lg leading-7 text-gray-600 mb-6">
            <li><code>id</code>: Fetch by nORF ID</li>
            <li><code>seqname</code>, <code>start</code>, and <code>end</code>: Fetch by genomic position</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Example Queries</h2>

          {examples.map((example) => (
            <div key={example.id} className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{example.title}</h3>
              <Tab.Group>
                <Tab.List className="flex space-x-1 rounded-t-xl bg-blue-900/20 p-1">
                  {languages.map((language) => (
                    <Tab
                      key={language}
                      className={({ selected }) =>
                        classNames(
                          'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                          'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                          selected
                            ? 'bg-white text-blue-700 shadow'
                            : 'text-gray-700 hover:bg-white/[0.12] hover:text-blue-700'
                        )
                      }
                    >
                      {language}
                    </Tab>
                  ))}
                </Tab.List>
                <Tab.Panels className="rounded-b-xl bg-gray-100">
                  <Tab.Panel className="p-4">
                    <pre className="overflow-x-auto">
                      <code className="language-bash">
                        {`
curl -X GET 'https://cttifqllbbilseejcmow.supabase.co/rest/v1/norfs?${example.id === 'fetch-by-id' ? 'id=eq.1ig9H1' : 'seqname=eq.chr1&start=gte.1000&end=lte.2000'}' \\
-H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0dGlmcWxsYmJpbHNlZWpjbW93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc3MjY5MzUsImV4cCI6MjA0MzMwMjkzNX0.F5EDPbJgEFOB0Q5TIQGqYmLinwErR-Y6_KobLtbj4z4"
                        `}
                      </code>
                    </pre>
                  </Tab.Panel>
                  <Tab.Panel className="p-4">
                    <pre className="overflow-x-auto">
                      <code className="language-python">
                        {`
import requests

url = "https://cttifqllbbilseejcmow.supabase.co/rest/v1/norfs"
headers = {
    "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0dGlmcWxsYmJpbHNlZWpjbW93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc3MjY5MzUsImV4cCI6MjA0MzMwMjkzNX0.F5EDPbJgEFOB0Q5TIQGqYmLinwErR-Y6_KobLtbj4z4"
}

params = ${example.id === 'fetch-by-id' ? '{"id": "eq.1ig9H1"}' : '{"seqname": "eq.chr1", "start": "gte.1000", "end": "lte.2000"}'}
response = requests.get(url, headers=headers, params=params)
print(response.json())
                        `}
                      </code>
                    </pre>
                  </Tab.Panel>
                  <Tab.Panel className="p-4">
                    <pre className="overflow-x-auto">
                      <code className="language-r">
                        {`
library(httr)

url <- "https://cttifqllbbilseejcmow.supabase.co/rest/v1/norfs"
headers <- c(
  "apikey" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0dGlmcWxsYmJpbHNlZWpjbW93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc3MjY5MzUsImV4cCI6MjA0MzMwMjkzNX0.F5EDPbJgEFOB0Q5TIQGqYmLinwErR-Y6_KobLtbj4z4"
)

params <- list(${example.id === 'fetch-by-id' ? 'id = "eq.1ig9H1"' : 'seqname = "eq.chr1", start = "gte.1000", end = "lte.2000"'})
response <- GET(url, add_headers(headers), query = params)
content(response)
                        `}
                      </code>
                    </pre>
                  </Tab.Panel>
                </Tab.Panels>
              </Tab.Group>
            </div>
          ))}

          <p className="text-lg leading-7 text-gray-600 mt-8">
            For more detailed information about our API or if you need assistance, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  )
}