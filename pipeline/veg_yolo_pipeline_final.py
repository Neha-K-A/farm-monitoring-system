import cv2
import numpy as np
import time
import threading
from ultralytics import YOLO

IP_URL = "http://10.251.206.46:8080/video"
FRAME_W, FRAME_H = 640, 480

MODEL_PATH = "yolov8n-seg.pt"   # segmentation model (recommended) [web:30]
IMG_SZ = 416
CONF = 0.35
IOU = 0.5
DETECT_EVERY = 3
TARGET_LABELS = {"apple", "orange", "banana", "tomato"}

ROI_ANALYZE = 192  # mask/feature size (square)

# Thresholds (start points; you will tune)
BITE_THR = 0.055                 # lower than before since masks are better
BOUNDARY_JAG_THR = 0.18          # boundary irregularity score
SPOT_RATIO_THR = 0.020
SPOT_LARGEST_BLOB_THR = 0.012
TEX_THR = 10
DARK_DIFF_THR = 16
MIN_FRUIT_PIXELS = 1800

FONT = cv2.FONT_HERSHEY_SIMPLEX

class FrameGrabber:
    def __init__(self, src, width=640, height=480):
        self.cap = cv2.VideoCapture(src)
        self.cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, width)
        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, height)
        self.lock = threading.Lock()
        self.frame = None
        self.stopped = False

    def start(self):
        t = threading.Thread(target=self.update, daemon=True)
        t.start()
        return self

    def update(self):
        while not self.stopped:
            if self.cap.grab():
                ret, frm = self.cap.retrieve()
                if ret:
                    with self.lock:
                        self.frame = frm
            else:
                time.sleep(0.005)

    def read(self):
        with self.lock:
            return None if self.frame is None else self.frame.copy()

    def stop(self):
        self.stopped = True
        time.sleep(0.05)
        self.cap.release()

def resize_square(img, size):
    return cv2.resize(img, (size, size), interpolation=cv2.INTER_AREA)

def bite_score_solidity(mask01):
    mask = (mask01 * 255).astype(np.uint8)
    cnts, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not cnts:
        return 0.0, 0.0, None
    c = max(cnts, key=cv2.contourArea)
    area = float(cv2.contourArea(c))
    if area < 600:
        return 0.0, area, c
    hull = cv2.convexHull(c)
    hull_area = float(cv2.contourArea(hull)) + 1e-6
    solidity = area / hull_area
    return max(0.0, 1.0 - solidity), area, c

def boundary_jaggedness(mask01, contour):
    if contour is None:
        return 0.0
    peri = float(cv2.arcLength(contour, True)) + 1e-6
    area = float(cv2.contourArea(contour)) + 1e-6
    # Circle-like shapes minimize peri^2/area; jagged edges increase it
    score = (peri * peri) / (4.0 * np.pi * area) - 1.0
    return float(max(0.0, score))

def spot_metrics(roi_bgr, mask01):
    mask = mask01.astype(np.uint8)
    fruit_pixels = int(mask.sum())
    if fruit_pixels < MIN_FRUIT_PIXELS:
        return 0.0, 0.0, 0.0

    gray = cv2.cvtColor(roi_bgr, cv2.COLOR_BGR2GRAY)

    # Remove specular highlights
    highlight = (gray > 245).astype(np.uint8)

    # Illumination-robust local darkness
    local = cv2.GaussianBlur(gray, (0, 0), 5)
    dark_diff = (local.astype(np.int16) - gray.astype(np.int16))
    dark = (dark_diff > DARK_DIFF_THR).astype(np.uint8)

    # Texture
    lap = cv2.Laplacian(gray, cv2.CV_16S, ksize=3)
    tex = (np.abs(lap) > TEX_THR).astype(np.uint8)

    defect = (dark & (tex | (dark_diff > (DARK_DIFF_THR + 10))).astype(np.uint8))
    defect = defect & mask
    defect = defect & (1 - highlight)

    defect = cv2.morphologyEx(defect, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8), iterations=1)
    defect = cv2.morphologyEx(defect, cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8), iterations=1)

    defect_pixels = int(defect.sum())
    spot_ratio = defect_pixels / float(fruit_pixels)

    num, _, stats, _ = cv2.connectedComponentsWithStats(defect, connectivity=8)
    largest = 0
    for i in range(1, num):
        largest = max(largest, int(stats[i, cv2.CC_STAT_AREA]))
    blob_ratio = largest / float(fruit_pixels)

    strength = float(np.mean(dark_diff[defect > 0])) if defect_pixels > 0 else 0.0
    return spot_ratio, blob_ratio, strength

def get_mask_for_box(r, i, frame_shape):
    """
    r: ultralytics Results
    i: index of detection
    returns: bbox (x1,y1,x2,y2), fullres mask01 (H,W)
    """
    x1, y1, x2, y2 = map(int, r.boxes.xyxy[i].tolist())
    H, W = frame_shape[:2]
    x1 = max(0, min(W-1, x1)); x2 = max(0, min(W-1, x2))
    y1 = max(0, min(H-1, y1)); y2 = max(0, min(H-1, y2))
    if x2 <= x1 or y2 <= y1:
        return None, None

    # Ultralytics segmentation: r.masks.data is (n, mask_h, mask_w) in model input scale
    if r.masks is None:
        return (x1,y1,x2,y2), None

    m = r.masks.data[i].cpu().numpy().astype(np.float32)  # 0..1
    # Resize mask to frame size
    m = cv2.resize(m, (W, H), interpolation=cv2.INTER_LINEAR)
    mask01 = (m > 0.5).astype(np.uint8)
    return (x1,y1,x2,y2), mask01

def main():
    try:
        cv2.setNumThreads(1)
    except Exception:
        pass

    model = YOLO(MODEL_PATH)  # task: segmentation supported in Ultralytics [web:30]
    try:
        model.fuse()
    except Exception:
        pass

    grabber = FrameGrabber(IP_URL, FRAME_W, FRAME_H).start()

    last = []
    frame_id = 0

    fps_ema = 0.0
    alpha = 0.15
    t_prev = time.time()

    while True:
        frame = grabber.read()
        if frame is None:
            time.sleep(0.005)
            continue
        frame = cv2.resize(frame, (FRAME_W, FRAME_H), interpolation=cv2.INTER_AREA)

        if frame_id % DETECT_EVERY == 0:
            results = model.predict(frame, imgsz=IMG_SZ, conf=CONF, iou=IOU, verbose=False, device="cpu", max_det=10)
            r = results[0]
            last = []
            if r.boxes is not None and len(r.boxes) > 0:
                for i in range(len(r.boxes)):
                    cls_id = int(r.boxes.cls[i].item())
                    label = model.names.get(cls_id, str(cls_id))
                    if label not in TARGET_LABELS:
                        continue
                    bbox, mask01 = get_mask_for_box(r, i, frame.shape)
                    if bbox is None:
                        continue
                    last.append((label, bbox, mask01))

        for (label, (x1,y1,x2,y2), mask01_full) in last:
            roi = frame[y1:y2, x1:x2]
            if roi.size == 0:
                continue

            if mask01_full is None:
                # Fallback: if no mask, treat whole box as mask (worse)
                mask_roi = np.ones((y2-y1, x2-x1), np.uint8)
            else:
                mask_roi = mask01_full[y1:y2, x1:x2]
                if mask_roi.size == 0:
                    continue

            # Clean mask
            mask_roi = cv2.morphologyEx(mask_roi, cv2.MORPH_OPEN, np.ones((3,3),np.uint8), iterations=1)
            mask_roi = cv2.morphologyEx(mask_roi, cv2.MORPH_CLOSE, np.ones((7,7),np.uint8), iterations=1)

            # Resize ROI + mask to square for stable thresholds
            roi_s = resize_square(roi, ROI_ANALYZE)
            mask_s = resize_square(mask_roi*255, ROI_ANALYZE)
            mask_s = (mask_s > 128).astype(np.uint8)

            mask_roi = cv2.medianBlur((mask_roi*255).astype(np.uint8), 5)
            mask_roi = (mask_roi > 128).astype(np.uint8)
            mask_roi = cv2.morphologyEx(mask_roi, cv2.MORPH_CLOSE, np.ones((9,9),np.uint8), iterations=1)

            bite, area, contour = bite_score_solidity(mask_s)
            jag = boundary_jaggedness(mask_s, contour)
            spot_ratio, blob_ratio, strength = spot_metrics(roi_s, mask_s)

            damaged = (bite > BITE_THR) or ((blob_ratio > SPOT_LARGEST_BLOB_THR) and (spot_ratio > SPOT_RATIO_THR or strength > (DARK_DIFF_THR + 8))) or ((jag > BOUNDARY_JAG_THR) and (spot_ratio > (0.6 * SPOT_RATIO_THR) or bite > (0.6 * BITE_THR)))

            color = (0,0,255) if damaged else (0,255,0)
            condition = "Damaged" if damaged else "Healthy"

            cv2.rectangle(frame, (x1,y1), (x2,y2), color, 2)
            cv2.putText(frame, f"{label} - {condition}", (x1, max(25, y1-10)), FONT, 0.75, color, 2)
            cv2.putText(frame, f"bite:{bite:.3f} jag:{jag:.3f} spot:{spot_ratio:.3f} blob:{blob_ratio:.3f}",
                        (x1, min(FRAME_H-10, y2+22)), FONT, 0.55, (255,255,0), 2)

        t_now = time.time()
        inst_fps = 1.0 / max(1e-6, (t_now - t_prev))
        t_prev = t_now
        fps_ema = (1 - alpha) * fps_ema + alpha * inst_fps
        cv2.putText(frame, f"FPS: {fps_ema:.1f} (det every {DETECT_EVERY})", (10, 30), FONT, 0.9, (255,0,0), 2)

        cv2.imshow("Farm Fruit Detection (YOLOv8-seg + Damage)", frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

        frame_id += 1

    grabber.stop()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
