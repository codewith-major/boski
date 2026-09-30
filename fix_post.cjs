const fs = require('fs');

function fixFile(path) {
    if(!fs.existsSync(path)) return;
    let content = fs.readFileSync(path, 'utf8');
    
    // Specifically looking for the broken lines:
    // `: string;` -> `price?: number;\n  currency?: 'NGN';\n  pricingUnit?: PricingUnit;\n  budget?: number;`
    // `location: '',\n    : '',` -> `location: '',\n    price: undefined,\n    currency: 'NGN',\n    pricingUnit: 'fixed',\n    budget: undefined,`
    
    content = content.replace(/:\s*string;/g, 'price?: number;\n  currency?: \'NGN\';\n  pricingUnit?: import(\'../types\').PricingUnit;\n  budget?: number;');
    
    // In Post.tsx
    content = content.replace(/:\s*'',/g, 'price: undefined, currency: \'NGN\', pricingUnit: \'fixed\', budget: undefined,');
    content = content.replace(/:\s*existing\.(\s*)\|\|\s*'',/g, 'price: existing.price, currency: existing.currency, pricingUnit: existing.pricingUnit, budget: existing.budget,');
    content = content.replace(/:\s*draft\.(\s*)\|\|\s*undefined,/g, 'price: draft.price, currency: draft.currency, pricingUnit: draft.pricingUnit, budget: draft.budget,');

    fs.writeFileSync(path, content);
}

fixFile('src/pages/Post.tsx');
fixFile('src/components/post/PostPreview.tsx');
fixFile('src/components/post/ResourceForm.tsx');
fixFile('src/pages/ResourceDetail.tsx');

console.log('Fixed post files part 1');
