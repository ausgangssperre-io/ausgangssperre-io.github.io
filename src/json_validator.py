# Run this with python3 -m unittest json_validator.py

import json
import unittest

class TestStringMethods(unittest.TestCase):

	def setUp(self):
		legal_req = open("../LegalTabelle.json")
		self.y = json.load(legal_req)

	def test_all_states_in_file(self):
		print(self.y["Bundesländer"].keys())
		self.assertTrue(len(self.y["Bundesländer"]) == 16)

	def test_state_names_correct(self):
		self.assertCountEqual(self.y["Bundesländer"].keys(), ["Baden-Württemberg", "Bayern", "Berlin", "Brandenburg","Bremen","Hamburg", "Hessen", "Mecklenburg-Vorpommern", "Niedersachsen", "Nordrhein-Westfalen", "Rheinland-Pfalz", "Saarland", "Sachsen", "Sachsen-Anhalt", "Schleswig-Holstein", "Thüringen"])


	def test_same_fields_covered_for_each_state(self):
		for key, state_restrict in self.y["Bundesländer"].items():
			print("Checking dictionary keys for: " + key)
			normal = {"Versammlung", "Gastronomie","Lieferdienste", "Rausgehen",
			"Laeden", "Rausgehen Ausnahme", "Offene Laeden", "Sport draußen",
			"Freizeiteinrichtungen", "Gottesdienste", "Schulen", "Besondere Gemeinden", "Gottesdienste Anmerkung", "Versammlung Ausnahme", "Sport Ausnahme"}
			observed = set(state_restrict.keys())
			self.assertTrue(observed.issubset(normal));
			self.assertEqual(len(observed), len(observed.intersection(normal)))

	if __name__ == '__main__':
		unittest.main()