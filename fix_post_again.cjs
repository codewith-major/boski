const fs = require('fs');

let content = fs.readFileSync('src/pages/Post.tsx', 'utf8');

content = content.replace(/export interface PostDraft \{[\s\S]*?\}/, 
`export interface PostDraft {
  id?: string;
  intent?: PostIntent;
  type?: ResourceType;
  title: string;
  description: string;
  location?: string;
  category?: string;
  condition?: string;
  availability?: string;
  price?: number;
  currency?: 'NGN';
  pricingUnit?: import('../types').PricingUnit;
  budget?: number;
}`);

// fix useState initialized state
content = content.replace(/const \[draft, setDraft\] = useState<PostDraft>\(\{[\s\S]*?\}\);/,
`const [draft, setDraft] = useState<PostDraft>({
    title: '',
    description: '',
    location: '',
    category: '',
    condition: '',
    availability: '',
  });`);
  
// fix setDraft on editId
content = content.replace(/setDraft\(\{[\s\S]*?\}\);[\s]*setStep\('form'\);/,
`setDraft({
          id: existing.id,
          intent: existing.intent,
          type: existing.type,
          title: existing.title,
          description: existing.description,
          location: existing.location || '',
          price: existing.price,
          currency: existing.currency,
          pricingUnit: existing.pricingUnit,
          budget: existing.budget,
          category: existing.category || '',
          condition: existing.condition || '',
          availability: existing.availability || '',
        });
        setStep('form');`);

// fix updateResource
content = content.replace(/updateResource\(draft\.id, \{[\s\S]*?\}\);/,
`updateResource(draft.id, {
        title: draft.title,
        description: draft.description,
        location: draft.location || undefined,
        price: draft.price,
        currency: draft.currency,
        pricingUnit: draft.pricingUnit,
        budget: draft.budget,
        category: draft.category || undefined,
        condition: draft.condition || undefined,
        availability: draft.availability || undefined,
      });`);
      
// fix addResource object
content = content.replace(/const newResource: Resource = \{[\s\S]*?\};\s*addResource\(newResource\);/,
`const newResource: Resource = {
        id: \`r_\${Date.now()}\`,
        type: draft.type as ResourceType,
        intent: draft.intent,
        title: draft.title,
        description: draft.description,
        provider: currentUser,
        status: 'available',
        createdAt: new Date().toISOString(),
        location: draft.location || undefined,
        price: draft.price,
        currency: draft.currency,
        pricingUnit: draft.pricingUnit,
        budget: draft.budget,
        category: draft.category || undefined,
        condition: draft.condition || undefined,
        availability: draft.availability || undefined,
      };
      
      addResource(newResource);`);

fs.writeFileSync('src/pages/Post.tsx', content);
