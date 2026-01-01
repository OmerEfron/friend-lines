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
    headline: 'Just found the cutest coffee shop on 5th street!',
    subHeadline: 'They have the best caramel lattes and free wifi',
    media: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
    timestamp: new Date('2025-01-01T09:00:00'),
  },
  {
    id: '2',
    userId: '3',
    headline: 'Finally finished that project I was working on',
    subHeadline: 'So relieved! Time to celebrate with some gaming tonight',
    timestamp: new Date('2025-01-01T08:30:00'),
  },
  {
    id: '3',
    userId: '4',
    headline: 'Completed my first 5K run this morning!',
    subHeadline: 'My legs are killing me but totally worth it',
    media: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800',
    timestamp: new Date('2025-01-01T07:45:00'),
  },
  {
    id: '4',
    userId: '5',
    headline: 'Got my bike fixed, ready for weekend rides',
    subHeadline: 'Anyone want to join me for a trail ride on Saturday?',
    media: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800',
    timestamp: new Date('2025-01-01T07:00:00'),
  },
  {
    id: '5',
    userId: '2',
    headline: 'Reading the most amazing book right now',
    subHeadline: 'Can\'t put it down! Will recommend at next book club',
    timestamp: new Date('2024-12-31T18:00:00'),
  },
  {
    id: '6',
    userId: '1',
    headline: 'That hiking trip this weekend was absolutely perfect',
    subHeadline: 'The view from the top made all the climbing worth it',
    media: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800',
    timestamp: new Date('2024-12-31T16:00:00'),
  },
  {
    id: '7',
    userId: '3',
    headline: 'Tried that new Italian place everyone\'s talking about',
    subHeadline: 'Best pasta I\'ve had in years! Going back next week for sure',
    media: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800',
    timestamp: new Date('2024-12-31T14:00:00'),
  },
  {
    id: '8',
    userId: '4',
    headline: 'Just bought tickets for the summer music festival!',
    subHeadline: 'So excited! My favorite band is headlining',
    timestamp: new Date('2024-12-31T12:00:00'),
  },
  {
    id: '9',
    userId: '5',
    headline: 'Made homemade pizza for dinner tonight',
    subHeadline: 'Turned out better than expected! Feeling like a chef',
    timestamp: new Date('2024-12-31T11:00:00'),
  },
  {
    id: '10',
    userId: '2',
    headline: 'My dog learned a new trick today!',
    subHeadline: 'He can now roll over on command. So proud of him!',
    timestamp: new Date('2024-12-31T10:00:00'),
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

