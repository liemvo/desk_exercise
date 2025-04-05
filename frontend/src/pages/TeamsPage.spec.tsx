import { MockedProvider } from '@apollo/client/testing';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { REMOVE_MEMBER, TEAM_QUERY } from '../queries/teams';
import { mock } from '../testUtil';
import TeamsPage from './TeamsPage';

const mocks = [
  mock(
    TEAM_QUERY,
    {},
    {
      teams: [
        {
          id: '3',
          name: 'A team',
          members: [
            { id: '101', name: 'Alice' },
            { id: '102', name: 'Bob' },
          ],
        },
        {
          id: '4',
          name: 'B team',
          members: [],
        },
      ],
    }
  ),
  mock(
    REMOVE_MEMBER,
    { teamId: '3', memberId: '101' },
    {
      removeMember: {
        id: '3',
        name: 'A team',
        members: [{ id: '102', name: 'Bob' }],
      },
    }
  ),
];

describe('TeamsPage', () => {
  it('renders list', async () => {
    render(
      <MockedProvider mocks={mocks}>
        <TeamsPage />
      </MockedProvider>
    );

    const names = await screen.findAllByTestId('name');
    expect(names).toHaveLength(2);
    expect(names[0].querySelector('input')).toHaveValue('A team');
    expect(names[1].querySelector('input')).toHaveValue('B team');
  });

  it('removes a member from a team', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <TeamsPage />
      </MockedProvider>
    );

    const memberChips = await screen.findAllByText(/Alice|Bob/);
    expect(memberChips).toHaveLength(2);

    const aliceChip = screen.getByText('Alice');
    const parent = aliceChip.parentElement;
    const deleteButton = parent!.querySelector('svg');
    fireEvent.click(deleteButton!);

    await waitFor(() => {
      expect(screen.queryByText('Alice')).not.toBeInTheDocument();
    });

    const remainingMembers = screen.getAllByText(/Alice|Bob/);
    expect(remainingMembers).toHaveLength(1);
    expect(remainingMembers[0]).toHaveTextContent('Bob');
  });
});
