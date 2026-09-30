const fs = require('fs');

let content = fs.readFileSync('src/pages/RequestFlow.tsx', 'utf8');

// Remove OfferType import
content = content.replace(/import \{ ResourceType, Resource, Order \} from '\.\.\/types';/, "import { ResourceType, Resource, Order } from '../types';");

// Remove offerType and offerDetails state
content = content.replace(/const \[offerType, setOfferType\] = useState\('free'\);\s*const \[offerDetails, setOfferDetails\] = useState\(''\);/, "");

// Remove offer validation
content = content.replace(/if \(offerType !== 'free' && !offerDetails\.trim\(\)\) \{\s*newErrors\.offerDetails = 'Please provide details about your offer\.';\s*\}/, "");

// Remove from createOrderRequest
content = content.replace(/offerType,[\s]*offerDetails: offerDetails \|\| undefined,/, "");

// Rename "REQUEST TO BORROW" to "REQUEST TO RENT"
content = content.replace(/case 'ITEM': return 'REQUEST TO BORROW';/, "case 'ITEM': return 'REQUEST TO RENT';");

// Remove Offer section in Review step
content = content.replace(/<div>\s*<h3 className="text-label text-text-secondary uppercase">Offer<\/h3>\s*<p className="text-body font-medium capitalize">\s*\{offerType\} \{offerDetails && `- \$\{offerDetails\}`\}\s*<\/p>\s*<\/div>/, "");

// Replace the What can you offer section with a Price Review section
content = content.replace(/<div className="flex flex-col gap-6">\s*<h2 className="text-h4">What can you offer\?<\/h2>\s*<div className="flex flex-col gap-4">[\s\S]*?<\/div>\s*<\/div>/, 
`{(resource.price !== undefined || resource.budget !== undefined) && (
          <div className="flex flex-col gap-6">
            <h2 className="text-h4">{resource.intent === 'HAVE' ? 'Pricing Summary' : 'Budget'}</h2>
            <div className="bg-surface-subtle p-4 rounded-lg border border-border-subtle">
              <p className="text-h3 text-text-primary">
                {resource.intent === 'HAVE' 
                    ? \`₦\${resource.price} / \${resource.pricingUnit}\` 
                    : \`₦\${resource.budget}\`}
              </p>
              {resource.intent === 'HAVE' && <p className="text-caption text-text-secondary mt-1">Payment will be handled after the provider accepts your request.</p>}
            </div>
          </div>
        )}`);

// Fix "VIEW EXCHANGES" button
content = content.replace(/>\s*VIEW EXCHANGES\s*<\/Button>/, "> VIEW ORDERS </Button>");

fs.writeFileSync('src/pages/RequestFlow.tsx', content);

