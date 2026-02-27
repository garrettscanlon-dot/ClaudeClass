// Salesforce API response types

export interface SfAuthResponse {
  access_token: string;
  instance_url: string;
  id: string;
  token_type: string;
  issued_at: string;
  signature: string;
}

export interface SfQueryResponse<T> {
  totalSize: number;
  done: boolean;
  nextRecordsUrl?: string;
  records: T[];
}

export interface SfUserRecord {
  Id: string;
  Email: string;
  Name: string;
}

export interface SfAccountRecord {
  Id: string;
  Name: string;
  OwnerId: string;
  Type: string | null;
  AnnualRevenue: number | null;
  Industry: string | null;
  LastActivityDate: string | null;
  CreatedDate: string;
  LastModifiedDate: string;
  Description: string | null;
}

export interface SfOpportunityRecord {
  Id: string;
  Name: string;
  AccountId: string;
  StageName: string;
  Amount: number | null;
  CloseDate: string | null;
  Type: string | null;
  Probability: number | null;
  NextStep: string | null;
}

export interface SfTaskRecord {
  Id: string;
  Subject: string | null;
  Status: string | null;
  Priority: string | null;
  ActivityDate: string | null;
  WhoId: string | null;
  WhatId: string | null;
  Description: string | null;
  TaskSubtype: string | null;
}

export interface SfContactRecord {
  Id: string;
  Name: string;
  Email: string | null;
  Title: string | null;
  AccountId: string;
  LastModifiedDate: string;
}
