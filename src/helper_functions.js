_ACTIVITIES = [
  'Versammlung', 'Gastronomie', 'Lieferdienste', 'Rausgehen', 'Laeden',
  'Rausgehen Ausnahme', 'Offene Laeden', 'Sport draußen',
  'Freizeiteinrichtungen', 'Gottesdienste', 'Schulen', 'Besondere Gemeinden',
  'Versammlung Ausnahme', 'Sport Ausnahme'
];
_SUBACTIVITIES = [];
_ACTIVITIES_WITH_MAX_PPL = ['Versammlung']

_J_UNRESTRICTED = -1;
_J_PARTIAL_RESTRICTIONS = 1;
_J_FORBIDDEN = 0;

// We might need something with more states than binary here in case
// a) an activity is not covered for this state in our JSON
// b) if we want to be specific about restricted activities or comments
async function canGoOut(city, state, activity, number_of_people = -1) {
  const legal_table =
      JSON.parse(await _fillJSONContents('/data/json/LegalTabelle.json'));
  state_restrictions = legal_table['Bundesländer'][state];
  // TODO(ilinca) check cities too
  if (state_restrictions[activity] != null) {
    if (state_restrictions[activity] == _J_UNRESTRICTED) {
      return true;
    } else if (state_restrictions[activity] == _J_PARTIAL_RESTRICTIONS) {
      // For gatherings the number have a different significance - the max # of
      // ppl allowed together
      if (needPeopleCount(activity)) {
        console.log(' need ppl count ');
        return number_of_people <= state_restrictions[activity];
      } else {
        return true;
      }
    } else {
      return false;
    }
  }
  return true;
}

function needPeopleCount(activity) {
  return _ACTIVITIES_WITH_MAX_PPL.includes(activity);
}

async function _fillJSONContents(path) {
  const response = await fetch(path);
  return response.text();
}
