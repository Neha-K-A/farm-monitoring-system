import sys
import json
import argparse
import cv2
import numpy as np
from veg_yolo_pipeline_final import (
    load_model, process_frame, estimate_damage_area, 
    calculate_spots_metrics, analyze_boundary_jaggedness, calculate_bite_score
)

def run_headless_inference(image_path):
    try:
        # Load Model
        model = load_model()
        
        # Read the image
        frame = cv2.imread(image_path)
        if frame is None:
            raise ValueError(f"Could not load image at {image_path}")

        # Run process_frame
        viz_frame, raw_mask, conf, coords = process_frame(model, frame)
        
        # If no detections
        if raw_mask is None:
            print(json.dumps({
                "detected_class": "Unknown",
                "condition": "Appears Healthy",
                "confidence": 0.0,
                "treatment": "No disease or crop detected.",
                "details": "No objects found in image"
            }))
            return

        # Use the pipeline's analysis functions
        damage_ratio = estimate_damage_area(raw_mask)
        num_spots, avg_spot_size = calculate_spots_metrics(raw_mask)
        jaggedness = analyze_boundary_jaggedness(raw_mask)
        bite_score = calculate_bite_score(raw_mask)
        
        # Aggregate logic for condition & treatment
        condition = "Appears Healthy"
        treatment = "Maintain current regimen."
        
        if damage_ratio > 0.15 or bite_score > 3 or jaggedness > 0.4:
            condition = "Damaged / Diseased"
            treatment = "Apply appropriate fungicide/pesticide and monitor closely."
            
        elif num_spots > 5 or avg_spot_size > 50:
            condition = "Early Signs of Spots"
            treatment = "Ensure proper air circulation and review watering practices to prevent fungal growth."

        # Fake class logic for now, could be passed from the Yolo Model classnames
        detected_class = "Crop Leaf" 

        # Output ONLY JSON to stdout
        result = {
            "detected_class": detected_class,
            "condition": condition,
            "confidence": float(conf),
            "treatment": treatment,
            "metrics": {
                "damage_ratio": float(damage_ratio),
                "spots": int(num_spots),
                "jaggedness": float(jaggedness),
                "bite_score": float(bite_score)
            }
        }
        
        print(json.dumps(result))

    except Exception as e:
        # print error as JSON so backend can parse it
        print(json.dumps({
            "error": str(e),
            "detected_class": "Error",
            "condition": "Analysis Failed",
            "confidence": 0,
            "treatment": "Please try again with a clearer image."
        }))

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Headless YOLOv8 Crop Detection")
    parser.add_argument("--image", required=True, help="Path to input image")
    args = parser.parse_args()
    
    run_headless_inference(args.image)
