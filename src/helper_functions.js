_ACTIVITIES = ["Versammlung", "Gastronomie","Lieferdienste", "Rausgehen",
			"Laeden", "Rausgehen Ausnahme", "Offene Laeden", "Sport draußen",
			"Freizeiteinrichtungen", "Gottesdienste", "Schulen", "Besondere Gemeinden",
			"Versammlung Ausnahme", "Sport Ausnahme"];
_SUBACTIVITIES = [];
_ACTIVITIES_WITH_MAX_PPL = ["Versammlung"]

_J_UNRESTRICTED = -1;
_J_PARTIAL_RESTRICTIONS = 1;
_J_FORBIDDEN = 0;

// We might need something with more states than binary here in case 
// a) an activity is not covered for this state in our JSON
// b) if we want to be specific about restricted activities or comments
async function canGoOut(city, state, activity, number_of_people = -1) {


  const legal_table = await _fillJSONContents('../data/json/LegalTabelle.json');

  console.log(legal_table)
  state_restrictions = JSON.parse(legal_table)["Bundesländer"]["Bayern"];
  console.log("heyy");
  console.log(state_restrictions);
  // TODO(ilinca) check cities too
  if (state_restrictions[activity] != null){
  	if (state_restrictions[activity] == _J_UNRESTRICTED || state_restrictions[activity] == _J_PARTIAL_RESTRICTIONS) {
  		return true;
  	} else {
  		// For gatherings the number have a different significance - the max # of ppl allowed together
		if (activity in _ACTIVITIES_WITH_MAX_PPL){
			return number_of_people <= state_restrictions[activity]; 
		} else {
  			return false;
		}
  	}
  }
}

function needPeopleCount(activity){
	return activity in _ACTIVITIES_WITH_MAX_PPL;
}

async function _fillJSONContents(path){
	const response = await fetch(path);
	const legal_table = response.text();
	return legal_table;
}
