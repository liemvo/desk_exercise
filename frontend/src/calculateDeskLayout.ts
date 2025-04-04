import type { PeopleQuery } from './generated/graphql';
import { DogStatus } from './generated/graphql';
import { orderChecker } from "./orderChecker";

type Person = PeopleQuery['people'][0];

/**
 * requirements teams must sit together.
 * People who don't like dogs should be placed as far away from those who have dogs as possible.
 * People who have dogs should be placed as far apart as possible.
 * Preference to be given to people who would like to avoid dogs. See Example below
 * Desks are arranged in a single line of adjacent desks.
 * Teams sit next to each other, so the team boundary must be taken into account.
 *
 * For example, if given a single team of 5 people with the following preferences:
 * 1. Alice - likes dogs
 * 2. Bob - likes dogs
 * 3. Charlie - doesn't like dogs
 * 4. David - has a dog
 * 5. Eve - has a dog
 *
 * A valid desk layout would be:
 * Charlie(Avoid), Alice(Like), David(Has), Bob(Like), Eve(Has)
 *
 * If Bob left, then a new valid desk layout would be
 * Charlie(Avoid), Alice(Like), David(Has), Eve(Has)
 *
 * There is a test suite provided that is disabled in calculateDeskLayout.spec.ts
 * This test suite may not be exhaustive for all edge cases.
 */
export const calculateDeskLayout = (people: Person[]): Person[] => {

  if (!people || people.length === 0) {
    return [];
  }

  const teams = new Map<string, Person[]>();
  const arrangedTeams: Person[][] = [];

  for (const person of people) {
    const teamId = person.team?.id ?? "none";
    if (!teams.has(teamId)) {
      teams.set(teamId, []);
      arrangedTeams.push([]);
    }
    const teamIndex = Array.from(teams.keys()).indexOf(teamId);

    const members = teams.get(teamId);

    if (members) {
      members.push(person);
      arrangedTeams[teamIndex] = calculateOneTeam(members);
    }
  }

  const teamPermutations = generatePermutations(arrangedTeams);

  let bestArrangement: Person[] = [];
  let highestScore = Number.NEGATIVE_INFINITY;

  for (const permutation of teamPermutations) {
    const combinations = generateReversedCombinations(permutation);
    for (const combination of combinations) {
      const score = orderChecker(combination.flat());
      if (score > highestScore) {
        highestScore = score;
        bestArrangement = combination.flat();
      }
    }
  }

  return bestArrangement;
};

const calculateOneTeam = (members: Person[]): Person[] => {
  const avoidDogs: Person[] = [];
  const likeDogs: Person[] = [];
  const hasDogs: Person[] = [];

  for (const person of members) {
    if (person.dogStatus === DogStatus.Avoid) {
      avoidDogs.push(person);
    } else if (person.dogStatus === DogStatus.Like) {
      likeDogs.push(person);
    } else if (person.dogStatus === DogStatus.Have) {
      hasDogs.push(person);
    }
  }

  const arrangedPeople: Person[] = [];

  if (hasDogs.length > 0) {
    const firstDogOwner = hasDogs.shift();

    if (firstDogOwner) {
      arrangedPeople.push(firstDogOwner);
    }
  }

  arrangedPeople.push(...likeDogs);

  arrangedPeople.push(...avoidDogs);

  if (hasDogs.length > 0) {
    const result: Person[] = [];

    for (let i = 0; i < hasDogs.length; i++) {
      const person = hasDogs[i];
      const insertIndex = calculateInsertIndex(
        result.length,
        hasDogs.length,
        i,
      );
      result.splice(insertIndex, 0, person);
    }

    arrangedPeople.splice(1, 0, ...result);
  }

  return arrangedPeople;
}

const calculateInsertIndex = (
  resultLength: number,
  totalItems: number,
  currentIndex: number,
): number => {
  return Math.floor((resultLength / (totalItems + 1)) * (currentIndex + 1));
};

const generatePermutations = <T>(array: T[]): T[][] => {
  if (array.length === 0) return [[]];
  const result: T[][] = [];
  for (let i = 0; i < array.length; i++) {
    const rest = [...array.slice(0, i), ...array.slice(i + 1)];
    const permutations = generatePermutations(rest);
    for (const permutation of permutations) {
      result.push([array[i], ...permutation]);
    }
  }
  return result;
};

const generateReversedCombinations = (teams: Person[][]): Person[][][] => {
  const result: Person[][][] = [[]];
  for (const team of teams) {
    const newResult: Person[][][] = [];
    for (const combination of result) {
      newResult.push([...combination, team]);
      newResult.push([...combination, [...team].reverse()]);
    }
    result.splice(0, result.length, ...newResult);
  }
  return result;
};