const fs = require('fs');
let md = fs.readFileSync('src/data/mockData.ts', 'utf-8');
const lines = md.split('\n').slice(0, 240);
const cleanMd = lines.join('\n') + `
export const MOCK_ACTIVITIES: Activity[] = [
  {
    id: 'act_1',
    type: 'EXCHANGE_REQUEST_RECEIVED',
    userId: 'u_1',
    actorId: 'u_2',
    exchangeId: 'ex_2', 
    resourceId: 'r_8',
    title: 'Ada requested your skill',
    description: 'Ada wants to exchange help for your Figma UI/UX Design Help.',
    createdAt: '2023-10-31T09:00:00Z',
    readAt: '2023-10-31T09:05:00Z'
  },
  {
    id: 'act_2',
    type: 'EXCHANGE_REQUEST_ACCEPTED',
    userId: 'u_1',
    actorId: 'u_3',
    exchangeId: 'ex_1', 
    resourceId: 'r_2',
    title: 'Your exchange request was accepted',
    description: 'Chinedu accepted your request for Introduction to Algorithms.',
    createdAt: '2023-10-30T14:30:00Z',
    readAt: '2023-10-30T15:00:00Z'
  },
  {
    id: 'act_3',
    type: 'NEW_EXCHANGE_MESSAGE',
    userId: 'u_1',
    actorId: 'u_3',
    exchangeId: 'ex_1',
    messageId: 'm_1',
    title: 'New message from Chinedu',
    description: 'When can we meet up?',
    createdAt: '2023-10-30T15:05:00Z',
  },
  {
    id: 'act_4',
    type: 'RATING_RECEIVED',
    userId: 'u_1',
    actorId: 'u_7',
    exchangeId: 'ex_99',
    ratingId: 'rat_1',
    title: 'Zainab rated your exchange',
    description: 'You received a 5-star rating.',
    createdAt: new Date().toISOString(),
  }
];
`;
fs.writeFileSync('src/data/mockData.ts', cleanMd);
console.log('Fixed');
