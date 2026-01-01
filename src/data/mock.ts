import { User, Newsflash, Group, Friendship } from '../types';

export const currentUser: User = {
  id: '1',
  name: 'John Doe',
  username: 'johndoe',
};

export const users: User[] = [
  currentUser,
  {
    id: '2',
    name: 'Sarah Williams',
    username: 'sarahw',
  },
  {
    id: '3',
    name: 'Michael Chen',
    username: 'mchen',
  },
  {
    id: '4',
    name: 'Emma Johnson',
    username: 'emmaj',
  },
  {
    id: '5',
    name: 'David Martinez',
    username: 'davidm',
  },
];

export const friendships: Friendship[] = [
  { userId: '1', friendId: '2' },
  { userId: '1', friendId: '3' },
  { userId: '1', friendId: '4' },
  { userId: '1', friendId: '5' },
];

export const newsflashes: Newsflash[] = [
  {
    id: '1',
    userId: '2',
    headline: 'Breaking: New coffee shop opens downtown',
    subHeadline: 'Best espresso in town, locals say',
    timestamp: new Date('2025-01-01T09:00:00'),
  },
  {
    id: '2',
    userId: '3',
    headline: 'Tech startup raises $10M in funding',
    subHeadline: 'Revolutionary AI platform attracts major investors',
    timestamp: new Date('2025-01-01T08:30:00'),
  },
  {
    id: '3',
    userId: '4',
    headline: 'Local marathon sees record participation',
    timestamp: new Date('2025-01-01T07:45:00'),
  },
  {
    id: '4',
    userId: '5',
    headline: 'City council approves new bike lanes',
    subHeadline: 'Infrastructure improvements to begin next month',
    timestamp: new Date('2025-01-01T07:00:00'),
  },
  {
    id: '5',
    userId: '2',
    headline: 'Book club discovers hidden literary gem',
    subHeadline: 'Forgotten novel gains new following among readers',
    timestamp: new Date('2024-12-31T18:00:00'),
  },
  {
    id: '6',
    userId: '1',
    headline: 'Weekend hiking trip was incredible',
    subHeadline: 'Mountain views worth every step of the climb',
    timestamp: new Date('2024-12-31T16:00:00'),
  },
  {
    id: '7',
    userId: '3',
    headline: 'Restaurant review: Italian cuisine at its finest',
    timestamp: new Date('2024-12-31T14:00:00'),
  },
  {
    id: '8',
    userId: '4',
    headline: 'Concert announcement: Summer music festival lineup revealed',
    subHeadline: 'Headliners include major international acts',
    timestamp: new Date('2024-12-31T12:00:00'),
  },
];

export const groups: Group[] = [
  {
    id: '1',
    name: 'Close Friends',
    userIds: ['2', '3'],
  },
  {
    id: '2',
    name: 'Work Colleagues',
    userIds: ['3', '5'],
  },
  {
    id: '3',
    name: 'Family',
    userIds: ['4'],
  },
];

