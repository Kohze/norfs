# HumanMine Integration for nORFs Detail View

## Overview

This integration adds genomic context data from HumanMine to the nORFs detail view, providing researchers with additional information about genes, proteins, and SNPs in the genomic region surrounding each nORF.

## Features

### API Route (`/api/humanmine`)
- **Location**: `src/app/api/humanmine/route.js`
- **Method**: POST
- **Purpose**: Fetches genomic data from HumanMine database
- **Parameters**:
  - `chromosome`: Chromosome identifier (e.g., "1", "X")
  - `start`: Start position in base pairs
  - `end`: End position in base pairs
  - `geneId`: Optional nORF gene ID for reference

### Data Retrieved
1. **Genes**: Primary identifiers, symbols, names, descriptions, lengths, and associated data
2. **Proteins**: Molecular weights, lengths, associated genes, and protein domains
3. **SNPs**: Identifiers, names, descriptions, associated genes, and allele frequencies
4. **Pathways**: Associated biological pathways
5. **Diseases**: Associated diseases and conditions

### React Component (`HumanMineData`)
- **Location**: `src/components/HumanMineData.js`
- **Purpose**: Displays HumanMine data in the nORF detail view
- **Features**:
  - Automatic data fetching based on nORF genomic coordinates
  - Loading states and error handling
  - Responsive design with Tailwind CSS
  - Links to external databases (e.g., NCBI SNP database)
  - Data pagination (shows limited results with counts)

## Integration Points

### Detail View Page
- **Location**: `src/app/(content)/id/[id]/page.js`
- **Integration**: Added `HumanMineData` component after Conservation Scores section
- **Data Flow**: Passes `norfData` object to component for automatic coordinate extraction

### Styling
- **CSS**: Added line-clamp utility in `src/app/globals.css`
- **Design**: Matches existing nORFs design system with consistent colors and spacing

## Usage

The integration is automatic and requires no user interaction:

1. When a user visits a nORF detail page, the component automatically extracts genomic coordinates
2. Coordinates are sent to the HumanMine API
3. Results are displayed in organized sections (Genes, Proteins, SNPs)
4. Each section shows relevant metadata and provides links to external resources

## Technical Details

### Dependencies
- `imjs`: Official InterMine JavaScript library for querying HumanMine
- `lucide-react`: Icons for the UI components
- `tailwindcss`: Styling framework

### Error Handling
- Network errors are caught and displayed to users
- Missing data scenarios are handled gracefully
- Loading states provide user feedback

### Performance
- API calls are made only when necessary (when norfData changes)
- Data is processed server-side to reduce client-side computation
- Results are paginated to prevent overwhelming the UI

## Future Enhancements

Potential improvements could include:
- Caching of HumanMine data to reduce API calls
- More detailed views for individual genes/proteins
- Integration with other genomic databases
- Export functionality for retrieved data
- Advanced filtering and search capabilities

## Testing

To test the integration:
1. Navigate to any nORF detail page
2. Scroll down to the "Genomic Context (HumanMine)" section
3. Verify that data loads and displays correctly
4. Check that links to external databases work properly 