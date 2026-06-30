import { Issue, IssueStatus, Severity, IssueCategory } from '../types';

export const mockIssues: Issue[] = [
  {
    id: '1',
    title: 'Major Pothole on Main St & 5th Ave',
    description: 'Deep pothole causing traffic slow down and potential vehicle damage. Water logging has made it wider.',
    category: IssueCategory.POTHOLE,
    status: IssueStatus.IN_PROGRESS,
    severity: Severity.CRITICAL,
    location: { lat: 37.7749, lng: -122.4194, address: 'Main St & 5th Ave, San Francisco' },
    reporterId: 'u1',
    reporterName: 'John Doe',
    mediaUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?q=80&w=400',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now(),
    votes: 42,
    verificationCount: 12
  },
  {
    id: '2',
    title: 'Broken Streetlight near Oak Park',
    description: 'Light is flickering and eventually goes off at night. Dangerous for pedestrians near the children park.',
    category: IssueCategory.STREETLIGHT,
    status: IssueStatus.REPORTED,
    severity: Severity.MEDIUM,
    location: { lat: 37.7849, lng: -122.4094, address: '124 Oak Street, San Francisco' },
    reporterId: 'u2',
    reporterName: 'Sarah Chen',
    mediaUrl: 'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?q=80&w=400',
    createdAt: Date.now() - 172800000,
    updatedAt: Date.now() - 172800000,
    votes: 15,
    verificationCount: 3
  },
  {
    id: '3',
    title: 'Illegal Garbage Dumping Ground',
    description: 'Piles of construction waste and commercial plastic garbage bags dumped on the green belt.',
    category: IssueCategory.GARBAGE,
    status: IssueStatus.VERIFIED,
    severity: Severity.HIGH,
    location: { lat: 37.7649, lng: -122.4294, address: '458 Market St, San Francisco' },
    reporterId: 'u3',
    reporterName: 'Alex Rivera',
    mediaUrl: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?q=80&w=400',
    createdAt: Date.now() - 259200000,
    updatedAt: Date.now() - 86400000,
    votes: 28,
    verificationCount: 8
  },
  {
    id: '4',
    title: 'Water Leakage / Broken Pipe',
    description: 'Main supply pipe leaking water continuously on the sidewalk, causing erosion.',
    category: IssueCategory.WATER_LEAK,
    status: IssueStatus.RESOLVED,
    severity: Severity.HIGH,
    location: { lat: 37.7549, lng: -122.4394, address: '782 Church St, San Francisco' },
    reporterId: 'u4',
    reporterName: 'Marcus Bell',
    mediaUrl: 'https://images.unsplash.com/photo-1542013936693-8848e57423e1?q=80&w=400',
    createdAt: Date.now() - 604800000,
    updatedAt: Date.now() - 86400000,
    votes: 56,
    verificationCount: 18
  }
];
