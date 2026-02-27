// Gong API response types

export interface GongUsersResponse {
  users: GongUser[];
}

export interface GongUser {
  id: string;
  emailAddress: string;
  firstName: string;
  lastName: string;
}

export interface GongCallsResponse {
  records: {
    totalRecords: number;
    currentPageSize: number;
    currentPageNumber: number;
    cursor?: string;
  };
  calls: GongCallRecord[];
}

export interface GongCallRecord {
  id: string;
  title: string;
  started: string;
  duration: number; // seconds
  direction: string;
  primaryUserId: string;
  parties: GongParty[];
  purpose: string | null;
}

export interface GongParty {
  name: string;
  emailAddress: string | null;
  speakerId: string;
  affiliation: "internal" | "external";
}

export interface GongTranscriptResponse {
  callTranscripts: GongTranscript[];
}

export interface GongTranscript {
  callId: string;
  transcript: GongTranscriptEntry[];
}

export interface GongTranscriptEntry {
  speakerId: string;
  topic: string | null;
  sentences: Array<{
    start: number;
    end: number;
    text: string;
  }>;
}
