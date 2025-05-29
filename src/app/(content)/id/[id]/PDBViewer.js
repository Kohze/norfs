'use client'

import React, { useEffect, useRef, useState } from 'react'
import * as $3Dmol from '3dmol'

export default function PDBViewer({
  pdbUrl,
  height = '230px',
  showDebugInfo = true,
}) {
  const viewerRef = useRef(null)
  const [debugInfo, setDebugInfo] = useState(showDebugInfo ? 'Loading...' : '')

  useEffect(() => {
    // Initialize or clear debugInfo based on showDebugInfo prop
    setDebugInfo(showDebugInfo ? 'Loading...' : '')

    if (viewerRef.current && pdbUrl) {
      const viewer = $3Dmol.createViewer(viewerRef.current, {
        backgroundColor: '#f3f4f6',
      })

      fetch(pdbUrl)
        .then((response) => response.text())
        .then((data) => {
          // Remove the unexpected header
          const cleanedData = data.replace(/^PARENT.*\n/, '')

          try {
            viewer.addModel(cleanedData, 'pdb')
            viewer.setStyle({}, { cartoon: { color: 'spectrum' } })
            viewer.zoomTo()
            viewer.render()
            if (showDebugInfo) setDebugInfo('PDB loaded successfully')
          } catch (error) {
            if (showDebugInfo)
              setDebugInfo(`Error processing PDB: ${error.message}`)
          }
        })
        .catch((error) => {
          if (showDebugInfo) setDebugInfo(`Error loading PDB: ${error}`)
        })

      return () => {
        viewer.clear()
      }
    } else {
      if (showDebugInfo) setDebugInfo('Error: Viewer ref or PDB URL is missing')
    }
  }, [pdbUrl, height, showDebugInfo])

  return (
    <div>
      <div
        ref={viewerRef}
        style={{
          width: '100%',
          height: height,
          overflow: 'show',
          position: 'relative',
          marginTop: '4px',
          marginBottom: '0px',
          backgroundColor: '#f3f4f6',
        }}
      />
      {/* Render debug info only if showDebugInfo is true and debugInfo has content */}
      {showDebugInfo && debugInfo && (
        <div className="text-sm text-gray-600 mt-2">{debugInfo}</div>
      )}
    </div>
  )
}
