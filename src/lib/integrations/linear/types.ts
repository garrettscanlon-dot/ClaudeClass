// Linear API response types

export interface LinearGraphQLResponse<T> {
  data: T;
  errors?: Array<{ message: string }>;
}

export interface LinearUsersData {
  users: {
    nodes: LinearUser[];
  };
}

export interface LinearUser {
  id: string;
  name: string;
  email: string;
  assignedIssues: {
    nodes: LinearIssueNode[];
  };
}

export interface LinearIssueNode {
  id: string;
  identifier: string;
  title: string;
  description: string | null;
  priority: number;
  priorityLabel: string;
  createdAt: string;
  updatedAt: string;
  dueDate: string | null;
  state: {
    name: string;
    type: string;
  };
  labels: {
    nodes: Array<{ name: string }>;
  };
  project: {
    name: string;
  } | null;
  team: {
    name: string;
    key: string;
  };
}
