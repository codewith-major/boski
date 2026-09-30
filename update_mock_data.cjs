const fs = require('fs');
let code = fs.readFileSync('src/data/mockData.ts', 'utf-8');

// Replace User imports if needed (already updated in types.ts, just need to make sure School and Report are imported)
if (!code.includes('School')) {
  code = code.replace(/import \{ ([^}]+) \} from '\.\.\/types';/, (match, p1) => {
    const newImports = p1.split(',').map(s => s.trim());
    if (!newImports.includes('School')) newImports.push('School');
    if (!newImports.includes('Report')) newImports.push('Report');
    if (!newImports.includes('UserRole')) newImports.push('UserRole');
    if (!newImports.includes('VerificationStatus')) newImports.push('VerificationStatus');
    if (!newImports.includes('AccountStatus')) newImports.push('AccountStatus');
    return `import { ${newImports.join(', ')} } from '../types';`;
  });
}

// Add Mock Schools
const schoolsString = `
export const MOCK_SCHOOLS: School[] = [
  { id: 's_1', name: 'University of Lagos', shortName: 'UNILAG', domain: 'unilag.edu.ng', status: 'ACTIVE' },
  { id: 's_2', name: 'Obafemi Awolowo University', shortName: 'OAU', domain: 'oauife.edu.ng', status: 'ACTIVE' },
];
`;
if (!code.includes('MOCK_SCHOOLS')) {
  code = code.replace(/export const currentUser/, schoolsString + '\nexport const currentUser');
}

// Update users
const userRegex = /({[^{}]*name:\s*'([^']+)'[^{}]*})/g;
code = code.replace(userRegex, (match, body, name) => {
  if (body.includes('schoolId:')) return match; // Already updated
  
  let role = "'STUDENT'";
  let verificationStatus = "'VERIFIED'";
  let accountStatus = "'ACTIVE'";
  
  if (name === 'David') {
    role = "'ADMIN'";
  } else if (name === 'Ngozi') {
    verificationStatus = "'UNVERIFIED'";
  } else if (name === 'Bolaji') {
    accountStatus = "'SUSPENDED'";
  } else if (name === 'Tobi') {
    verificationStatus = "'PENDING'";
  }

  // insert new fields before `rating:` or at end
  const replacement = body.replace(/,\s*rating:/, `, schoolId: 's_1', role: ${role}, verificationStatus: ${verificationStatus}, accountStatus: ${accountStatus}, rating:`);
  if (replacement === body) {
    // maybe no rating?
    return body.replace(/,\s*isVerified:\s*[^,]+/, (m) => m + `, schoolId: 's_1', role: ${role}, verificationStatus: ${verificationStatus}, accountStatus: ${accountStatus}`);
  }
  return replacement;
});

// Add mock reports at the end
const reportsString = `
export const MOCK_REPORTS: Report[] = [
  {
    id: 'rep_1',
    reporterId: 'u_1',
    targetType: 'USER',
    targetId: 'u_4',
    reason: 'NO_SHOW',
    description: 'He never showed up to exchange the textbook.',
    status: 'OPEN',
    createdAt: '2023-11-01T10:00:00Z',
  },
  {
    id: 'rep_2',
    reporterId: 'u_2',
    targetType: 'RESOURCE',
    targetId: 'r_1',
    reason: 'MISLEADING',
    description: 'The description says it is in perfect condition but the screen is cracked.',
    status: 'REVIEWING',
    createdAt: '2023-11-02T14:20:00Z',
  }
];
`;
if (!code.includes('MOCK_REPORTS')) {
  code += reportsString;
}

fs.writeFileSync('src/data/mockData.ts', code);
console.log('Done');
