export enum IssueStatus {
  REPORTED = 'REPORTED',
  VERIFIED = 'VERIFIED',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  REJECTED = 'REJECTED'
}

export enum IssueCategory {
  POTHOLE = 'POTHOLE',
  STREETLIGHT = 'STREETLIGHT',
  GARBAGE = 'GARBAGE',
  WATER_LEAK = 'WATER_LEAK',
  DRAINAGE = 'DRAINAGE',
  OTHER = 'OTHER'
}

export enum Severity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: 'CITIZEN' | 'OFFICER' | 'ADMIN' | 'MODERATOR';
  points: number;
  badges: string[];
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  status: IssueStatus;
  severity: Severity;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  reporterId: string;
  reporterName: string;
  mediaUrl: string;
  createdAt: number;
  updatedAt: number;
  votes: number;
  verificationCount: number;
}

export interface VerificationEvent {
  id: string;
  issueId: string;
  userId: string;
  status: 'CONFIRMED' | 'FLAGGED';
  timestamp: number;
}
