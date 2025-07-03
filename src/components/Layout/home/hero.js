'use client'
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export function Hero() {
  const [searchTerm, setSearchTerm] = useState('');
  const [norfEntries, setNorfEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const parseGenomicLocation = (search) => {
    const match = search.match(/^(chr)?(\w+):(\d+)-(\d+)$/i);
    if (match) {
      return {
        seqname: match[1] ? match[2] : `chr${match[2]}`,
        start: parseInt(match[3]),
        end: parseInt(match[4])
      };
    }
    return null;
  };

  const fetchNorfEntries = useCallback(async (offset = 0) => {
    setError(null);
    try {
      let query = supabase
        .from('norfs')
        .select('*')
        .order('id', { ascending: true })
        .range(offset, offset + 8);

      const genomicLocation = parseGenomicLocation(searchTerm);
      if (genomicLocation) {
        query = query
          .or(`seqname.eq.${genomicLocation.seqname},seqname.eq.${genomicLocation.seqname.replace('chr', '')}`)
          .gte('start', genomicLocation.start)
          .lte('end', genomicLocation.end);
      } else if (searchTerm) {
        query = query.ilike('gene_id', `%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching nORF entries:', err);
      setError('Failed to fetch nORF entries. Please try again.');
      return [];
    }
  }, [searchTerm]);

  useEffect(() => {
    const loadInitialEntries = async () => {
      setIsLoading(true);
      try {
        const initialEntries = await fetchNorfEntries();
        setNorfEntries(initialEntries);
      } catch (err) {
        console.error('Error in loadInitialEntries:', err);
        setError('Failed to load initial entries');
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialEntries();
  }, [fetchNorfEntries]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const loadMoreEntries = async () => {
    setIsLoadingMore(true);
    try {
      const newEntries = await fetchNorfEntries(norfEntries.length);
      setNorfEntries(prevEntries => [...prevEntries, ...newEntries]);
    } catch (err) {
      console.error('Error loading more entries:', err);
      setError('Failed to load more entries');
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleEntryClick = (geneId) => {
    router.push(`/id/${geneId}`);
  };

  const SkeletonCard = () => (
    <div className="bg-white p-4 rounded-md shadow animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
    </div>
  );

  return (
    <main className="bg-gray-50">
      <div className="relative px-6 lg:px-8">
        <div className="mx-auto max-w-4xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              nORFs Database
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Explore novel open reading frames (nORFs) and their potential impact on gene regulation and protein synthesis.
            </p>
            <div className="mt-10">
              <div className="w-full max-w-4xl mx-auto">
                <div className="mb-4">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Search by Gene ID or genomic location (e.g., chr1:92109-92231 or 1:92109-92231)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                {error && <p className="text-center text-red-500 mb-4">{error}</p>}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {isLoading ? (
                    <>
                      <SkeletonCard />
                      <SkeletonCard />
                      <SkeletonCard />
                    </>
                  ) : norfEntries.length > 0 ? (
                    norfEntries.map((entry) => (
                      <div 
                        key={entry.id} 
                        className="bg-white p-4 rounded-md shadow hover:shadow-md transition-shadow duration-300 cursor-pointer"
                        onClick={() => handleEntryClick(entry.gene_id)}
                      >
                        <h3 className="text-lg font-semibold">Gene ID: {entry.gene_id}</h3>
                        <p className="text-sm text-gray-600">Chromosome: {entry.seqname}</p>
                        <p className="text-sm text-gray-600">Start: {entry.start}</p>
                        <p className="text-sm text-gray-600">End: {entry.end}</p>
                        <p className="text-sm text-gray-600">Feature: {entry.feature}</p>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center text-gray-500 py-8">
                      {searchTerm ? 'No nORFs found matching your search.' : 'No nORFs available.'}
                    </div>
                  )}
                </div>
                {norfEntries.length > 0 && (
                  <div className="mt-4 flex justify-center">
                    <button 
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 transition-colors duration-300 disabled:bg-gray-400"
                      onClick={loadMoreEntries}
                      disabled={isLoadingMore}
                    >
                      {isLoadingMore ? 'Loading...' : 'Load More'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
