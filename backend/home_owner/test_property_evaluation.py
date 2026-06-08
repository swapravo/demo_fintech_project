import unittest
from unittest.mock import patch
import sys
import os

# Add parent directory to path to allow imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from home_owner.property_evaluation import evaluate_property

class TestPropertyEvaluation(unittest.TestCase):

    @patch('home_owner.property_evaluation.ensure_env')
    @patch('home_owner.property_evaluation.call_llm_json')
    def test_evaluate_property_tier_1_all(self, mock_call_llm_json, mock_ensure_env):
        # Setup mock to return Tier 1 for location
        mock_call_llm_json.return_value = {"location_tier": 1}
        
        # Test with > 50k rent (Tier 1) and <= 1 month deposit (Tier 1)
        result = evaluate_property("Mumbai", 60000, 1)
        
        self.assertEqual(result["location"], 1)
        self.assertEqual(result["rent"], 1)
        self.assertEqual(result["deposit_neededd"], 1)
        mock_ensure_env.assert_called_once_with("OPENROUTER_API_KEY")

    @patch('home_owner.property_evaluation.ensure_env')
    @patch('home_owner.property_evaluation.call_llm_json')
    def test_evaluate_property_tier_2_all(self, mock_call_llm_json, mock_ensure_env):
        mock_call_llm_json.return_value = {"location_tier": 2}
        
        # Test with 15k-50k rent (Tier 2) and 2-3 months deposit (Tier 2)
        result = evaluate_property("Meerut", 30000, 2)
        
        self.assertEqual(result["location"], 2)
        self.assertEqual(result["rent"], 2)
        self.assertEqual(result["deposit_neededd"], 2)

    @patch('home_owner.property_evaluation.ensure_env')
    @patch('home_owner.property_evaluation.call_llm_json')
    def test_evaluate_property_tier_3_all(self, mock_call_llm_json, mock_ensure_env):
        mock_call_llm_json.return_value = {"location_tier": 3}
        
        # Test with < 15k rent (Tier 3) and > 3 months deposit (Tier 3)
        result = evaluate_property("Village A", 10000, 4)
        
        self.assertEqual(result["location"], 3)
        self.assertEqual(result["rent"], 3)
        self.assertEqual(result["deposit_neededd"], 3)

    @patch('home_owner.property_evaluation.ensure_env')
    @patch('home_owner.property_evaluation.call_llm_json')
    def test_evaluate_property_mixed_tiers(self, mock_call_llm_json, mock_ensure_env):
        # Location Tier 1, Rent Tier 3, Deposit Tier 2
        mock_call_llm_json.return_value = {"location_tier": 1}
        
        result = evaluate_property("Bangalore", 14000, 3)
        
        self.assertEqual(result["location"], 1)
        self.assertEqual(result["rent"], 3)
        self.assertEqual(result["deposit_neededd"], 2)

    @patch('home_owner.property_evaluation.ensure_env')
    @patch('home_owner.property_evaluation.call_llm_json')
    def test_evaluate_property_llm_failure_fallback(self, mock_call_llm_json, mock_ensure_env):
        # Simulate LLM throwing an exception
        mock_call_llm_json.side_effect = Exception("API Error")
        
        result = evaluate_property("Unknown City", 30000, 2)
        
        # Should fallback to location tier 3
        self.assertEqual(result["location"], 3)
        self.assertEqual(result["rent"], 2)
        self.assertEqual(result["deposit_neededd"], 2)

    @patch('home_owner.property_evaluation.ensure_env')
    @patch('home_owner.property_evaluation.call_llm_json')
    def test_evaluate_property_boundary_conditions(self, mock_call_llm_json, mock_ensure_env):
        mock_call_llm_json.return_value = {"location_tier": 2}
        
        # Rent boundary 15000 (Tier 2)
        result1 = evaluate_property("City", 15000, 1)
        self.assertEqual(result1["rent"], 2)
        
        # Rent boundary 50000 (Tier 2)
        result2 = evaluate_property("City", 50000, 1)
        self.assertEqual(result2["rent"], 2)

if __name__ == '__main__':
    unittest.main()
