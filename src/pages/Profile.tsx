import { PageContainer } from '../components/layout/PageContainer';
import { PageHeader } from '../components/layout/PageHeader';
import { ReputationCard } from '../components/trust/ReputationCard';
import { useResources } from '../contexts/ResourceContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Profile() {
  const { profile, signOut } = useAuth();
  const { getUserResources, deleteResource } = useResources();
  const navigate = useNavigate();
  
  const displayUser = profile;
  const myPosts = displayUser ? getUserResources(displayUser.id) : [];

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this post? This will remove it from Boski.')) {
      deleteResource(id);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/signin');
  };

  if (!displayUser) {
    return (
      <PageContainer className="flex justify-center items-center py-20">
        <div className="w-8 h-8 rounded-full border-4 border-t-accent border-border-subtle animate-spin"></div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="flex flex-col gap-10">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-start">
          <PageHeader 
            title="Profile" 
            description="Your reputation, settings, and history." 
          />
          <Button variant="secondary" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
        
        <div className="max-w-2xl">
          <ReputationCard user={displayUser} />
        </div>
      </div>

      <div className="flex flex-col gap-6 max-w-4xl">
        <h2 className="text-h2">My Posts</h2>
        
        {myPosts.length === 0 ? (
          <Card className="p-8 text-center bg-surface-subtle border-dashed">
            <p className="text-body text-text-secondary">You haven't posted anything yet.</p>
            <Button variant="secondary" className="mt-4" onClick={() => navigate('/post')}>
              CREATE POST
            </Button>
          </Card>
        ) : (
          <div className="flex flex-col gap-4">
            {myPosts.map(post => (
              <Card key={post.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                <div className="flex flex-col gap-2 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-caption font-bold uppercase tracking-wider text-text-secondary">
                      {post.intent === 'NEED' ? 'Request' : 'Offer'} • {post.type}
                    </span>
                    <span className="text-border-subtle">•</span>
                    <StatusBadge status={post.status} />
                  </div>
                  <h3 className="text-h4">{post.title}</h3>
                  <p className="text-body-sm text-text-secondary">
                    Posted on {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="secondary" size="sm" onClick={() => navigate(`/resource/${post.id}`)}>
                    VIEW
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => navigate(`/post?edit=${post.id}`)}>
                    EDIT
                  </Button>
                  <Button variant="tertiary" size="sm" className="text-error hover:bg-error/10" onClick={() => handleDelete(post.id)}>
                    DELETE
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
