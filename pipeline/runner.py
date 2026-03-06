import os
import sys
import json
import argparse
import traceback

# Add to path so we can import the YOLO script
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(SCRIPT_DIR)

try:
    import veg_yolo_pipeline_final
    import cv2
    import numpy as np
    from ultralytics import YOLO
except ImportError as e:
    print(json.dumps({"success": False, "error": f"Import error: {str(e)}"}))
    sys.exit(1)

def ensure_square(img, size=192):
    return cv2.resize(img, (size, size), interpolation=cv2.INTER_AREA)

def process_single_image(img_path):
    # Minimal logic extracted from veg_yolo_pipeline_final.py main()
    # It must return JSON rather than drawing to cv2.imshow
    
    if not os.path.exists(img_path):
        return {"success": False, "error": f"File not found: {img_path}"}
        
    frame = cv2.imread(img_path)
    if frame is None:
        return {"success": False, "error": "Invalid image format"}

    # Resize input frame roughly like grabber
    H, W = frame.shape[:2]
    target_W, target_H = 640, 480
    frame = cv2.resize(frame, (target_W, target_H), interpolation=cv2.INTER_AREA)

    model_path = os.path.join(SCRIPT_DIR, veg_yolo_pipeline_final.MODEL_PATH)
    if not os.path.exists(model_path):
         return {"success": False, "error": f"Model file not found: {model_path}"}

    model = YOLO(model_path)
    
    # predict
    results = model.predict(frame, imgsz=veg_yolo_pipeline_final.IMG_SZ, conf=veg_yolo_pipeline_final.CONF, iou=veg_yolo_pipeline_final.IOU, verbose=False, device="cpu", max_det=10)
    
    r = results[0]
    out_items = []

    if r.boxes is not None and len(r.boxes) > 0:
        for i in range(len(r.boxes)):
            cls_id = int(r.boxes.cls[i].item())
            label = model.names.get(cls_id, str(cls_id))
            
            if label not in veg_yolo_pipeline_final.TARGET_LABELS:
                continue
                
            bbox, mask01_full = veg_yolo_pipeline_final.get_mask_for_box(r, i, frame.shape)
            if bbox is None:
                continue
                
            x1, y1, x2, y2 = bbox
            roi = frame[y1:y2, x1:x2]
            
            if roi.size == 0:
                continue

            if mask01_full is None:
                mask_roi = np.ones((y2-y1, x2-x1), np.uint8)
            else:
                mask_roi = mask01_full[y1:y2, x1:x2]
                if mask_roi.size == 0:
                    continue

            # clean mask
            mask_roi = cv2.morphologyEx(mask_roi, cv2.MORPH_OPEN, np.ones((3,3),np.uint8), iterations=1)
            mask_roi = cv2.morphologyEx(mask_roi, cv2.MORPH_CLOSE, np.ones((7,7),np.uint8), iterations=1)

            roi_s = ensure_square(roi, veg_yolo_pipeline_final.ROI_ANALYZE)
            mask_s = ensure_square(mask_roi*255, veg_yolo_pipeline_final.ROI_ANALYZE)
            mask_s = (mask_s > 128).astype(np.uint8)

            bite, area, contour = veg_yolo_pipeline_final.bite_score_solidity(mask_s)
            jag = veg_yolo_pipeline_final.boundary_jaggedness(mask_s, contour)
            spot_ratio, blob_ratio, strength = veg_yolo_pipeline_final.spot_metrics(roi_s, mask_s)

            damaged = (bite > veg_yolo_pipeline_final.BITE_THR) or \
                      ((blob_ratio > veg_yolo_pipeline_final.SPOT_LARGEST_BLOB_THR) and (spot_ratio > veg_yolo_pipeline_final.SPOT_RATIO_THR or strength > (veg_yolo_pipeline_final.DARK_DIFF_THR + 8))) or \
                      ((jag > veg_yolo_pipeline_final.BOUNDARY_JAG_THR) and (spot_ratio > (0.6 * veg_yolo_pipeline_final.SPOT_RATIO_THR) or bite > (0.6 * veg_yolo_pipeline_final.BITE_THR)))

            condition = "Damaged" if damaged else "Healthy"
            
            out_items.append({
                "label": label,
                "condition": condition,
                "confidence": float(r.boxes.conf[i].item()),
                "bbox": [x1, y1, x2, y2],
                "meta": {
                    "bite": round(bite, 3),
                    "jag": round(jag, 3),
                    "spot_ratio": round(spot_ratio, 3),
                    "blob_ratio": round(blob_ratio, 3)
                }
            })

    return {"success": True, "items": out_items}

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, help="Path to input image")
    parser.add_argument("--output-json", action="store_true", help="Format output as JSON")
    args = parser.parse_args()

    try:
        res = process_single_image(args.input)
        if args.output_json:
            # We ONLY print JSON to stdout so Node.js can parse it easily
            print(json.dumps(res))
    except Exception as e:
        err_res = {"success": False, "error": str(e), "trace": traceback.format_exc()}
        if args.output_json:
            print(json.dumps(err_res))
        else:
            print(f"Error: {e}")
            traceback.print_exc()

