const fs = require('fs');

let content = fs.readFileSync('src/pages/Post.tsx', 'utf8');

content = content.replace(
    /export interface PostDraft \{\n  id\?price\?: number;\n  currency\?: 'NGN';\n  pricingUnit\?: import\('\.\.\/types'\)\.PricingUnit;\n  budget\?: number;/g,
    `export interface PostDraft {\n  id?: string;\n  price?: number;\n  currency?: 'NGN';\n  pricingUnit?: import('../types').PricingUnit;\n  budget?: number;`
);
content = content.replace(/locationprice\?: number;/g, 'location?: string;');
content = content.replace(/categoryprice\?: number;/g, 'category?: string;');
content = content.replace(/conditionprice\?: number;/g, 'condition?: string;');
content = content.replace(/availabilityprice\?: number;/g, 'availability?: string;');

// Wait, the regex `:\s*string;` was global!
content = content.replace(/titleprice\?: number;\n  currency\?: 'NGN';\n  pricingUnit\?: import\('\.\.\/types'\)\.PricingUnit;\n  budget\?: number;/g, 'title: string;');
content = content.replace(/descriptionprice\?: number;\n  currency\?: 'NGN';\n  pricingUnit\?: import\('\.\.\/types'\)\.PricingUnit;\n  budget\?: number;/g, 'description: string;');
content = content.replace(/locationprice\?: number;\n  currency\?: 'NGN';\n  pricingUnit\?: import\('\.\.\/types'\)\.PricingUnit;\n  budget\?: number;/g, 'location: string;');
content = content.replace(/categoryprice\?: number;\n  currency\?: 'NGN';\n  pricingUnit\?: import\('\.\.\/types'\)\.PricingUnit;\n  budget\?: number;/g, 'category: string;');
content = content.replace(/conditionprice\?: number;\n  currency\?: 'NGN';\n  pricingUnit\?: import\('\.\.\/types'\)\.PricingUnit;\n  budget\?: number;/g, 'condition: string;');
content = content.replace(/availabilityprice\?: number;\n  currency\?: 'NGN';\n  pricingUnit\?: import\('\.\.\/types'\)\.PricingUnit;\n  budget\?: number;/g, 'availability: string;');

fs.writeFileSync('src/pages/Post.tsx', content);
