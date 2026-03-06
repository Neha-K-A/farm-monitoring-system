import os
import sys
import json
import argparse
import time
import cv2
import numpy as np
from ultralytics import YOLO

# Add to path so we can import the YOLO script utilities
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(SCRIPT_DIR)

try:
    import veg_yolo_pipeline_final
except ImportError:
    pass # Assume variables are accessible or defined locally if needed

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--stream", required=True, help="IP Webcam Stream URL")
    parser.add_argument("--model", default="yolov8n-seg.pt")
    args = parser.parse_args()

    model_path = os.path.join(SCRIPT_DIR, args.model)
    if not os.path.exists(model_path):
        print(json.dumps({"success": False, "error": f"Model not found at {model_path}"}), flush=True)
        return

    model = YOLO(model_path)
    cap = cv2.VideoCapture(args.stream)
    
    if not cap.isOpened():
        print(json.dumps({"success": False, "error": f"Could not open stream: {args.stream}"}), flush=True)
        return

    # Use constants from target script for consistency
    TARGET_LABELS = {"apple", "orange", "banana", "tomato"}
    IMG_SZ = 416
    CONF = 0.35
    DETECT_EVERY = 5 # Run detection every 5 frames for CPU friendliness
    
    frame_count = 0
    
    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            frame_count += 1
            if frame_count % DETECT_EVERY != 0:
                continue

            # Standard detection loop
            results = model.predict(frame, imgsz=IMG_SZ, conf=CONF, verbose=False, device="cpu")
            r = results[0]
            
            items = []
            if r.boxes is not None:
                for i in range(len(r.boxes)):
                    cls_id = int(r.boxes.cls[i].item())
                    label = model.names.get(cls_id, str(cls_id))
                    
                    if label not in TARGET_LABELS:
                        continue
                    
                    conf = float(r.boxes.conf[i].item())
                    bbox = r.boxes.xyxy[i].tolist() # [x1, y1, x2, y2]
                    
                    # You could add damage analysis here calling veg_yolo_pipeline_final utils
                    items.append({
                        "label": label,
                        "confidence": round(conf, 3),
                        "bbox": [int(x) for x in bbox],
                        "condition": "Healthy" # Placeholder, can be extended
                    })
            
            # Print detection as single JSON line for Node.js to consume
            print(json.dumps({
                "ts": int(time.time() * 1000),
                "items": items
            }), flush=True)

    except KeyboardInterrupt:
        pass
    finally:
        cap.release()

if __name__ == "__main__":
    main()
