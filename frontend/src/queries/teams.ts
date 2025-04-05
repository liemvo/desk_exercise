import { gql } from '@apollo/client';
import { graphql } from '../generated';

export const TEAM_QUERY = graphql(`
  query teams {
    teams {
      id
      name
      members {
        id
        name
      }
    }
  }
`);

export const PUT_TEAM = graphql(`
  mutation putTeam($id: ID, $name: String!) {
    putTeam(id: $id, name: $name) {
      id
      name
      members {
        id
        name
      }
    }
  }
  `);

export const REMOVE_MEMBER = gql`
  mutation removeMember($teamId: ID!, $memberId: ID!) {
    removeMember(teamId: $teamId, memberId: $memberId) {
      id
      name
      members {
        id
        name
      }
    }
  }
  `;
