package com.phocas.exercise.desks.schema;

import java.util.Optional;

import org.junit.jupiter.api.Assertions;

import com.phocassoftware.graphql.database.manager.VirtualDatabase;
import com.phocas.exercise.desks.ApiContext;
import com.phocas.exercise.desks.DeskTestDatabase;

public class TeamsTest {

	@DeskTestDatabase
	public void testAddingTeam(VirtualDatabase database) {
		var context = new ApiContext(database);
		var aTeam = Team.putTeam(context, Optional.empty(), "A Team");
		var teams = Team.teams(context);
		Assertions.assertEquals(1, teams.size());
		aTeam = teams.getFirst();
		Assertions.assertEquals("A Team", aTeam.getName());
		Assertions.assertNotNull(aTeam.getId());
	}

	@DeskTestDatabase
	public void testUpdateTeam(VirtualDatabase database) {
		var context = new ApiContext(database);
		var aTeam = Team.putTeam(context, Optional.empty(), "A Team");

		var newName = "A Team Updated";

		Team.putTeam(context, Optional.of(aTeam.getId()), newName);

		var teams = Team.teams(context);
		Assertions.assertEquals(1, teams.size());
		aTeam = teams.getFirst();
		Assertions.assertEquals(newName, aTeam.getName());
	}

	@DeskTestDatabase
	public void testRemoveMember(VirtualDatabase database) {
		ApiContext context = new ApiContext(database);
		Team team = Team.putTeam(context, Optional.empty(), "A Team");
		Person person = Person.putPerson(context, Optional.empty(), "James", Person.DogStatus.HAVE);
		var updatedPerson = Person.setTeam(context, person.getId(), team.getId());

		Assertions.assertEquals(team.getId(), updatedPerson.getTeam(context).orElse(null).getId());

		var updatedTeam = Team.removeMember(context, team.getId(), person.getId());

		updatedPerson = context.database().get(Person.class, person.getId());
		Assertions.assertNull(updatedPerson.getTeam(context).orElse(null));
		Assertions.assertEquals(0, updatedTeam.getMembers(context).size());
	}
}
