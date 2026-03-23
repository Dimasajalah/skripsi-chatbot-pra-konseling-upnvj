# backend/app/services/ensemble.py
from app.utils.label_map import map_emotion

class EnsembleModel:

    def __init__(self, models):
        self.models = models

    def predict(self, text: str):
        original_predictions = []
        mapped_predictions = []
        confidences = []

        for model in self.models:
            result = model.predict(text)

            orig_label = result.get("label")
            conf = float(result.get("confidence", 0.0))

            mapped = map_emotion(orig_label)

            original_predictions.append(orig_label)
            mapped_predictions.append(mapped)
            confidences.append(conf)

        vote_count = {}
        confidence_sum = {}

        for label, conf in zip(mapped_predictions, confidences):
            vote_count[label] = vote_count.get(label, 0) + 1
            confidence_sum[label] = confidence_sum.get(label, 0.0) + conf

        # choose label by vote count then summed confidence
        best_label = max(
            vote_count.keys(),
            key=lambda x: (vote_count[x], confidence_sum[x])
        )

        avg_confidence = confidence_sum[best_label] / vote_count[best_label]

        return {
            "label": best_label,
            "confidence": float(avg_confidence),
            "details": {
                "votes": vote_count,
                "confidence_sum": confidence_sum,
                "original_predictions": original_predictions,
                "mapped_predictions": mapped_predictions,
                "individual_confidences": confidences
            }
        }
