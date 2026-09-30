const fs = require('fs');

function fixResourceForm() {
    let content = fs.readFileSync('src/components/post/ResourceForm.tsx', 'utf8');
    
    // Replace broken inputs with proper ones for HAVE (price/currency/pricingUnit) and NEED (budget)
    content = content.replace(
        /<Input label="Order Preference" placeholder="e.g. Free to borrow, Swap" value={formData\.} onChange={e => handleChange\('', e\.target\.value\)} \/>/g,
        `<Input type="number" label="Price (NGN)" placeholder="e.g. 1500" value={formData.price || ''} onChange={e => handleChange('price', parseInt(e.target.value) || undefined)} />\n            <div className="flex flex-col gap-1.5"><label className="text-label">Pricing Unit</label><select className="flex h-12 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" value={formData.pricingUnit} onChange={e => handleChange('pricingUnit', e.target.value)}><option value="day">Per Day</option><option value="session">Per Session</option><option value="hour">Per Hour</option><option value="project">Per Project</option><option value="event">Per Event</option><option value="fixed">Fixed</option></select></div>`
    );

    content = content.replace(
        /<Input label="Order Preference" placeholder="e.g. Skill swap, Free" value={formData\.} onChange={e => handleChange\('', e\.target\.value\)} \/>/g,
        `<Input type="number" label="Price (NGN)" placeholder="e.g. 5000" value={formData.price || ''} onChange={e => handleChange('price', parseInt(e.target.value) || undefined)} />\n            <div className="flex flex-col gap-1.5"><label className="text-label">Pricing Unit</label><select className="flex h-12 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" value={formData.pricingUnit} onChange={e => handleChange('pricingUnit', e.target.value)}><option value="session">Per Session</option><option value="hour">Per Hour</option><option value="project">Per Project</option><option value="fixed">Fixed</option></select></div>`
    );

    content = content.replace(
        /<Input label="What can you offer\? \(Optional\)" placeholder="e.g. Can help with design" value={formData\.} onChange={e => handleChange\('', e\.target\.value\)} \/>/g,
        `<Input type="number" label="Budget (NGN) - Optional" placeholder="e.g. 3000" value={formData.budget || ''} onChange={e => handleChange('budget', parseInt(e.target.value) || undefined)} />`
    );

    content = content.replace(
        /<Input label="Optional order" placeholder="e.g. I can help with photography" value={formData\.} onChange={e => handleChange\('', e\.target\.value\)} \/>/g,
        `<Input type="number" label="Budget (NGN) - Optional" placeholder="e.g. 3000" value={formData.budget || ''} onChange={e => handleChange('budget', parseInt(e.target.value) || undefined)} />`
    );

    content = content.replace(
        /<Input label="Optional order" placeholder="e.g. Can buy you lunch" value={formData\.} onChange={e => handleChange\('', e\.target\.value\)} \/>/g,
        `<Input type="number" label="Budget (NGN) - Optional" placeholder="e.g. 3000" value={formData.budget || ''} onChange={e => handleChange('budget', parseInt(e.target.value) || undefined)} />`
    );

    fs.writeFileSync('src/components/post/ResourceForm.tsx', content);
}

function fixPostPreview() {
    let content = fs.readFileSync('src/components/post/PostPreview.tsx', 'utf8');

    content = content.replace(
        /\{\s*draft\.\s*&&\s*\(\s*<div>\s*<p className="text-label text-text-secondary mb-1">Order Preferences<\/p>\s*<div className="bg-surface-subtle p-3 rounded-lg border border-border-subtle">\s*<p className="text-body-sm">\{draft\.\}<\/p>\s*<\/div>\s*<\/div>\s*\)\}/g,
        `{(draft.price !== undefined || draft.budget !== undefined) && (
            <div>
              <p className="text-label text-text-secondary mb-1">{draft.intent === 'HAVE' ? 'Price' : 'Budget'}</p>
              <div className="bg-surface-subtle p-3 rounded-lg border border-border-subtle">
                <p className="text-body-sm font-bold">
                  {draft.intent === 'HAVE' 
                    ? \`₦\${draft.price} / \${draft.pricingUnit}\` 
                    : \`₦\${draft.budget}\`}
                </p>
              </div>
            </div>
          )}`
    );

    fs.writeFileSync('src/components/post/PostPreview.tsx', content);
}

function fixResourceDetail() {
    let content = fs.readFileSync('src/pages/ResourceDetail.tsx', 'utf8');
    
    // There are likely issues here with resource.
    content = content.replace(
        /\{resource\.\s*&&\s*\(\s*<div>\s*<h3 className="text-h4 mb-3">Order Preferences<\/h3>\s*<div className="bg-surface-subtle p-4 rounded-xl border border-border-subtle">\s*<p className="text-body-sm text-text-secondary">\{resource\.\}<\/p>\s*<\/div>\s*<\/div>\s*\)\}/g,
        `{(resource.price !== undefined || resource.budget !== undefined) && (
            <div>
              <h3 className="text-h4 mb-3">{resource.intent === 'HAVE' ? 'Price' : 'Budget'}</h3>
              <div className="bg-surface-subtle p-4 rounded-xl border border-border-subtle">
                <p className="text-h3 text-text-primary">
                  {resource.intent === 'HAVE' 
                    ? \`₦\${resource.price} / \${resource.pricingUnit}\` 
                    : \`₦\${resource.budget}\`}
                </p>
              </div>
            </div>
          )}`
    );

    fs.writeFileSync('src/pages/ResourceDetail.tsx', content);
}

fixResourceForm();
fixPostPreview();
fixResourceDetail();

console.log('Fixed post components');
