const fs = require('fs');
let content = fs.readFileSync('supabase/migrations/0002_rls_policies.sql', 'utf8');

content = content.replace(
    /RETURNS TRIGGER AS \$BEGIN/,
    "RETURNS TRIGGER AS $$\nBEGIN"
);
content = content.replace(
    /END;\$ LANGUAGE plpgsql SECURITY DEFINER;/,
    "END;\n$$ LANGUAGE plpgsql SECURITY DEFINER;"
);

fs.writeFileSync('supabase/migrations/0002_rls_policies.sql', content);
