import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { PageHeader } from '../components/layout/PageHeader';
import { SearchInput } from '../components/ui/SearchInput';
import { Button } from '../components/ui/Button';
import { ResourceCard } from '../components/resources/ResourceCard';
import { useResources } from '../contexts/ResourceContext';
import { ResourceType } from '../types';
import { calculateTextSimilarity } from '../lib/matching';

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const typeParam = searchParams.get('type') || 'all';

  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [activeFilter, setActiveFilter] = useState<import('../types').ResourceType | 'NEED' | 'all'>((typeParam as any) || 'all');
  
  const { resources, loading } = useResources();

  // Sync state when URL changes
  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
    setActiveFilter((searchParams.get('type') as import('../types').ResourceType | 'NEED' | null) || 'all');
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams(searchQuery, activeFilter);
  };

  const handleFilterClick = (filter: import('../types').ResourceType | 'NEED' | 'all') => {
    setActiveFilter(filter);
    updateParams(searchQuery, filter);
  };

  const updateParams = (q: string, type: string) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (type !== 'all') params.set('type', type);
    setSearchParams(params);
  };

  const filteredResources = useMemo(() => {
    const results = resources.filter(resource => {
      // Treat "request" filter as intent === 'NEED' or intent === 'NEED' to match older logic + new logic
      let matchesType = false;
      if (activeFilter === 'all') {
        matchesType = true;
      } else if (activeFilter === 'NEED') {
        matchesType = resource.intent === 'NEED';
      } else {
        matchesType = resource.type === activeFilter && resource.intent !== 'NEED';
      }

      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        resource.title.toLowerCase().includes(searchLower) ||
        resource.description.toLowerCase().includes(searchLower) ||
        resource.provider.name.toLowerCase().includes(searchLower);
      
      return matchesType && matchesSearch;
    });

    if (searchQuery.trim().length > 0) {
      // Sort by relevance based on our deterministic text matching
      results.sort((a, b) => {
        const scoreA = calculateTextSimilarity(a.title + " " + a.description, searchQuery);
        const scoreB = calculateTextSimilarity(b.title + " " + b.description, searchQuery);
        return scoreB - scoreA;
      });
    }

    return results;
  }, [searchQuery, activeFilter, resources]);

  const filters: { label: string; value: import('../types').ResourceType | 'NEED' | 'all' }[] = [
    { label: 'All', value: 'all' },
    { label: 'Items', value: 'ITEM' },
    { label: 'Skills', value: 'SKILL' },
    { label: 'Requests', value: 'NEED' },
  ];

  return (
    <PageContainer>
      <PageHeader 
        title="Explore" 
        description="Discover resources available on campus." 
      />
      
      <div className="flex flex-col gap-8">
        {/* Search and Filters */}
        <section className="flex flex-col gap-4">
          <form onSubmit={handleSearch} className="max-w-2xl">
            <SearchInput 
              placeholder="Search for an item, skill, or person..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          <div className="flex flex-wrap gap-2">
            {filters.map(filter => (
              <Button
                key={filter.value}
                variant={activeFilter === filter.value ? 'primary' : 'tertiary'}
                size="sm"
                onClick={() => handleFilterClick(filter.value)}
                className="rounded-full" // Pills are acceptable for compact filter controls
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </section>

        {/* Results */}
        <section>
          {loading && resources.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-8 h-8 rounded-full border-4 border-t-accent border-border-subtle animate-spin"></div>
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 border border-dashed border-border-subtle rounded-lg bg-surface-subtle text-center p-6">
              <h3 className="text-h3 mb-2">No results found</h3>
              <p className="text-body text-text-secondary max-w-md">
                We couldn't find any resources matching your search. Try adjusting your filters or search terms.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredResources.map(resource => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          )}
        </section>
      </div>
    </PageContainer>
  );
}
