"""
Doctor Recommendation ML Model
Uses symptom analysis to recommend appropriate specialists
"""

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pickle
import os

class DoctorRecommender:
    """
    Machine Learning model for doctor recommendation based on symptoms
    """
    
    def __init__(self):
        self.symptom_specialization_map = {
            # General Physician
            "fever": ["General Physician", "Pediatrician"],
            "cold": ["General Physician", "Pediatrician"],
            "cough": ["General Physician", "Pediatrician"],
            "headache": ["General Physician"],
            "body pain": ["General Physician", "Orthopedic"],
            "weakness": ["General Physician"],
            "fatigue": ["General Physician"],
            "nausea": ["General Physician", "Gynecologist"],
            "vomiting": ["General Physician", "Pediatrician", "Gynecologist"],
            "dizziness": ["General Physician", "Cardiologist"],
            "infection": ["General Physician"],
            "flu": ["General Physician"],
            
            # Pediatrician
            "child fever": ["Pediatrician"],
            "baby": ["Pediatrician"],
            "infant": ["Pediatrician"],
            "kid": ["Pediatrician"],
            "children": ["Pediatrician"],
            "growth": ["Pediatrician"],
            "vaccination": ["Pediatrician"],
            "developmental": ["Pediatrician"],
            
            # Cardiologist
            "heart pain": ["Cardiologist"],
            "chest pain": ["Cardiologist", "General Physician"],
            "heart attack": ["Cardiologist"],
            "palpitation": ["Cardiologist"],
            "high blood pressure": ["Cardiologist", "General Physician"],
            "low blood pressure": ["Cardiologist", "General Physician"],
            "shortness of breath": ["Cardiologist", "General Physician"],
            "arrhythmia": ["Cardiologist"],
            
            # Dermatologist
            "skin rash": ["Dermatologist"],
            "acne": ["Dermatologist"],
            "eczema": ["Dermatologist"],
            "psoriasis": ["Dermatologist"],
            "skin infection": ["Dermatologist"],
            "hair loss": ["Dermatologist"],
            "allergy": ["Dermatologist", "General Physician"],
            "itching": ["Dermatologist"],
            "fungal": ["Dermatologist"],
            
            # Orthopedic
            "bone pain": ["Orthopedic"],
            "joint pain": ["Orthopedic"],
            "fracture": ["Orthopedic"],
            "back pain": ["Orthopedic"],
            "neck pain": ["Orthopedic"],
            "arthritis": ["Orthopedic"],
            "sprain": ["Orthopedic"],
            "muscle pain": ["Orthopedic"],
            "dislocation": ["Orthopedic"],
            
            # Gynecologist
            "period problem": ["Gynecologist"],
            "menstrual": ["Gynecologist"],
            "pregnancy": ["Gynecologist"],
            "pregnant": ["Gynecologist"],
            "fertility": ["Gynecologist"],
            "uterus": ["Gynecologist"],
            "ovarian": ["Gynecologist"],
            "women health": ["Gynecologist"],
            
            # Dentist
            "tooth pain": ["Dentist"],
            "toothache": ["Dentist"],
            "dental": ["Dentist"],
            "gum": ["Dentist"],
            "cavity": ["Dentist"],
            "bleeding gum": ["Dentist"],
            "sensitivity": ["Dentist"],
            
            # Ayurveda
            "herbal": ["Ayurveda"],
            "natural": ["Ayurveda"],
            "digestion": ["Ayurveda", "General Physician"],
            "stress": ["Ayurveda"],
            "detox": ["Ayurveda"],
            "lifestyle": ["Ayurveda"],
        }
        
        # Initialize TF-IDF Vectorizer
        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),
            max_features=1000,
            stop_words='english'
        )
        
        # Train vectorizer on symptom descriptions
        self.symptoms_corpus = list(self.symptom_specialization_map.keys())
        self.symptom_vectors = self.vectorizer.fit_transform(self.symptoms_corpus)
        
    def predict(self, symptoms_text, location=None):
        """
        Predict appropriate doctor specialization based on symptoms
        
        Args:
            symptoms_text (str): User described symptoms
            location (str): Optional location filter
            
        Returns:
            dict: Recommendations with confidence scores
        """
        # Vectorize input symptoms
        input_vector = self.vectorizer.transform([symptoms_text.lower()])
        
        # Calculate similarity with corpus
        similarities = cosine_similarity(input_vector, self.symptom_vectors).flatten()
        
        # Get top matching symptoms
        top_indices = similarities.argsort()[-5:][::-1]
        
        # Collect specializations with cumulative scores
        specialization_scores = {}
        
        for idx in top_indices:
            if similarities[idx] > 0.1:  # Threshold
                symptom = self.symptoms_corpus[idx]
                specializations = self.symptom_specialization_map.get(symptom, [])
                score = similarities[idx]
                
                for spec in specializations:
                    if spec in specialization_scores:
                        specialization_scores[spec] += score
                    else:
                        specialization_scores[spec] = score
        
        # Sort by score
        sorted_specializations = sorted(
            specialization_scores.items(),
            key=lambda x: x[1],
            reverse=True
        )
        
        # If no match found, default to General Physician
        if not sorted_specializations:
            sorted_specializations = [("General Physician", 1.0)]
        
        recommendations = []
        for spec, score in sorted_specializations:
            recommendations.append({
                "specialization": spec,
                "confidence": round(float(score), 3)
            })
        
        return {
            "symptoms": symptoms_text,
            "recommendations": recommendations[:5],
            "matched_symptoms": [self.symptoms_corpus[i] for i in top_indices if similarities[i] > 0.1]
        }
    
    def recommend_doctors(self, symptoms_text, doctors_list, location=None):
        """
        Recommend specific doctors based on symptoms and location
        
        Args:
            symptoms_text (str): User described symptoms
            doctors_list (list): List of available doctors
            location (str): Optional location filter
            
        Returns:
            dict: Ranked doctor recommendations
        """
        # Get specializations predictions
        prediction = self.predict(symptoms_text, location)
        recommended_specializations = [r["specialization"] for r in prediction["recommendations"]]
        
        # Filter and rank doctors
        ranked_doctors = []
        
        for doctor in doctors_list:
            # Check if specialization matches
            if doctor["specialization"] in recommended_specializations:
                spec_index = recommended_specializations.index(doctor["specialization"])
                confidence = prediction["recommendations"][spec_index]["confidence"]
                
                # Calculate final score (confidence + rating + experience factor)
                rating_score = doctor.get("rating", 4.5) / 5.0
                experience_score = min(doctor.get("experience", 10) / 20.0, 1.0)
                final_score = (confidence * 0.5) + (rating_score * 0.3) + (experience_score * 0.2)
                
                # Location bonus
                if location and doctor["location"] == location:
                    final_score += 0.2
                
                ranked_doctors.append({
                    **doctor,
                    "match_score": round(final_score, 3),
                    "recommendation_reason": f"Based on symptoms: {prediction['matched_symptoms'][0] if prediction['matched_symptoms'] else 'general health'}"
                })
        
        # Sort by match score
        ranked_doctors.sort(key=lambda x: x["match_score"], reverse=True)
        
        return {
            "symptoms": symptoms_text,
            "top_specializations": prediction["recommendations"][:3],
            "recommended_doctors": ranked_doctors[:5],
            "total_matches": len(ranked_doctors)
        }

# Initialize model
def load_model():
    """Load or create the ML model"""
    model_path = "doctor_recommender.pkl"
    
    if os.path.exists(model_path):
        with open(model_path, 'rb') as f:
            return pickle.load(f)
    else:
        model = DoctorRecommender()
        # Save model
        with open(model_path, 'wb') as f:
            pickle.dump(model, f)
        return model

# Example usage
if __name__ == "__main__":
    # Load model
    model = load_model()
    
    # Sample doctors
    sample_doctors = [
        {"id": 1, "name": "Dr. Rajesh", "specialization": "General Physician", "location": "Rampur", "rating": 4.8, "experience": 15},
        {"id": 2, "name": "Dr. Priya", "specialization": "Pediatrician", "location": "Shivpur", "rating": 4.9, "experience": 10},
        {"id": 3, "name": "Dr. Vikram", "specialization": "Cardiologist", "location": "Krishnapur", "rating": 4.9, "experience": 20},
    ]
    
    # Test predictions
    test_cases = [
        "I have fever and cold",
        "My child has cough",
        "Chest pain and shortness of breath",
        "Skin rash on arms",
        "Joint pain in knees"
    ]
    
    print("=" * 60)
    print("DOCTOR RECOMMENDATION ML MODEL - TEST RESULTS")
    print("=" * 60)
    
    for symptoms in test_cases:
        print(f"\nSymptoms: {symptoms}")
        result = model.recommend_doctors(symptoms, sample_doctors)
        print(f"Top Specializations: {[r['specialization'] for r in result['top_specializations']]}")
        if result['recommended_doctors']:
            print(f"Recommended: {result['recommended_doctors'][0]['name']} ({result['recommended_doctors'][0]['specialization']})")
        print("-" * 60)