import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { SearchInput } from '../components/ui/SearchInput';
import { Button } from '../components/ui/Button';
import { ResourceCard } from '../components/resources/ResourceCard';
import { MatchSection } from '../components/matching/MatchSection';
import { getMatchesForResource, MatchResult } from '../lib/matching';
import { useResources } from '../contexts/ResourceContext';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { resources, loading } = useResources();
  const { profile } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const latestItems = resources.filter(r => r.type === 'ITEM' && r.intent !== 'NEED').slice(0, 4);
  const latestSkills = resources.filter(r => r.type === 'SKILL' && r.intent !== 'NEED').slice(0, 4);
  const latestRequests = resources.filter(r => r.intent === 'NEED').slice(0, 4);

  // Find matches for the user's active requests
  const activeUserRequests = profile ? resources.filter(
    r => r.provider.id === profile.id && 
    r.intent === 'NEED' && 
    (r.status === 'ACTIVE' || r.status === 'available')
  ) : [];

  let bestMatchResult: { requestTitle: string, matches: MatchResult[] } | null = null;
  for (const req of activeUserRequests) {
    const matches = getMatchesForResource(req, resources);
    if (matches.length > 0) {
      bestMatchResult = { requestTitle: req.title, matches };
      break; // Just show matches for the first request that has matches
    }
  }

  return (
    <PageContainer className="flex flex-col gap-12">
      {/* Hero Section */}
      <section className="flex flex-col gap-6 pt-4 md:pt-8">
        <div className="flex flex-col gap-2">
          <p className="text-label text-text-secondary uppercase">
            Good morning, {profile?.name || 'Student'}
          </p>
          <h1 className="text-display">What do you need?</h1>
        </div>

        <form onSubmit={handleSearch} className="max-w-2xl">
          <SearchInput 
            placeholder="Search for an item, skill, or person..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-14 text-lg"
          />
        </form>

        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => navigate('/explore?type=ITEM')}>
            RENT
          </Button>
          <Button variant="secondary" onClick={() => navigate('/explore?type=SKILL')}>
            SKILLS
          </Button>
          <Button variant="tertiary" onClick={() => navigate('/post')}>
            REQUEST
          </Button>
        </div>
      </section>

      {/* Recommended Matches */}
      {loading && resources.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 rounded-full border-4 border-t-accent border-border-subtle animate-spin"></div>
        </div>
      ) : bestMatchResult && (
        <section className="pt-2">
          <MatchSection 
            title="Boski found something"
            description={`Maybe this is what you need for: ${bestMatchResult.requestTitle}`}
            matches={bestMatchResult.matches}
          />
        </section>
      )}

      {/* Around You (Items) */}
      {latestItems.length > 0 && (
        <section className="flex flex-col gap-6 border-t border-border-subtle pt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-h2">Around You</h2>
            <Button variant="tertiary" size="sm" onClick={() => navigate('/explore?type=ITEM')}>
              See all
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {latestItems.map(resource => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        </section>
      )}

      {/* People with Skills */}
      {latestSkills.length > 0 && (
        <section className="flex flex-col gap-6 border-t border-border-subtle pt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-h2">People with Skills</h2>
            <Button variant="tertiary" size="sm" onClick={() => navigate('/explore?type=SKILL')}>
              See all
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {latestSkills.map(resource => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        </section>
      )}

      {/* Recent Requests */}
      {latestRequests.length > 0 && (
        <section className="flex flex-col gap-6 border-t border-border-subtle pt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-h2">Recent Requests</h2>
            <Button variant="tertiary" size="sm" onClick={() => navigate('/explore?type=NEED')}>
              See all
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {latestRequests.map(resource => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        </section>
      )}
    </PageContainer>
  );
}
