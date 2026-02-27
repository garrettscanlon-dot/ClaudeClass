export const TEAM_ISSUES_QUERY = `
  query TeamIssues($email: String!) {
    users(filter: { email: { eq: $email } }) {
      nodes {
        id
        name
        email
        assignedIssues(
          filter: { state: { type: { nin: ["completed", "canceled"] } } }
          orderBy: updatedAt
          first: 50
        ) {
          nodes {
            id
            identifier
            title
            description
            priority
            priorityLabel
            createdAt
            updatedAt
            dueDate
            state { name type }
            labels { nodes { name } }
            project { name }
            team { name key }
          }
        }
      }
    }
  }
`;
