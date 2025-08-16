
export interface Folder {
  _id: string;
  name: string;
  description?: string;
  polls: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Poll {
  _id: string;
  question: string;
  topic?: string;
  options: string[];
  votes: number[];
  code: string;
  createdBy: string;
  isActive: boolean;
  allowMultiple?: boolean;
  createdAt: string;
  updatedAt: string;
  folderId?: string;
  votedFingerprints: string[];
  history?: Array<{
    votes: number[];
    votedFingerprints: number;
    timestamp: string;
    _id: string;
  }>;
}
