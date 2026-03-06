"""
FarmVisionAI IP Webcam Module
=============================

Handles phone camera streaming through IP Webcam protocol.
Features:
- Real-time frame capture from IP-based camera
- Support for MJPEG, RTSP, and HTTP streams
- Automatic reconnection handling
- Performance optimization with frame skipping
- Error tolerance and robustness

"""

import cv2
import numpy as np
import threading
import time
from typing import Optional, Tuple
from urllib.parse import urlparse
from utils.config import (
    CAMERA_FRAME_WIDTH, CAMERA_FRAME_HEIGHT,
    FRAME_SKIP, ADB_TIMEOUT, get_logger
)

logger = get_logger(__name__)

class ADBCamera:
    """
    Handles IP webcam streaming (MJPEG/RTSP).
    Implements real-time frame capture and error recovery.
    
    Compatible with:
    - IP Webcam app (Android)
    - RTSP streams
    - MJPEG HTTP streams
    - Any camera with network video access
    """
    
    def __init__(self,
                 camera_url: Optional[str] = None,
                 width: int = CAMERA_FRAME_WIDTH,
                 height: int = CAMERA_FRAME_HEIGHT,
                 frame_skip: int = FRAME_SKIP):
        """
        Initialize IP camera handler.
        
        Args:
            camera_url (str, optional): Camera URL (e.g., http://192.168.1.100:8080/video)
            width (int): Target frame width
            height (int): Target frame height
            frame_skip (int): Process every nth frame for performance
        """
        self.camera_url = camera_url
        self.width = width
        self.height = height
        self.frame_skip = frame_skip
        self.frame_count = 0
        self.skip_counter = 0
        
        # Connection management
        self.connected = False
        self.cap = None  # OpenCV VideoCapture
        self.thread = None
        self.is_running = False
        
        # Frame management
        self.current_frame = None
        self.frame_lock = threading.Lock()
        self.last_frame_time = time.time()
        
        # Error tracking
        self.error_count = 0
        self.max_errors = 5
        self.device_id = None
        
        logger.info(f"IPCamera initialized - {width}x{height}, frame skip: {frame_skip}")
    
    def check_camera_available(self) -> bool:
        """
        Check if camera URL is accessible.
        
        Returns:
            bool: True if camera is available
        """
        if not self.camera_url:
            logger.error("Camera URL not set")
            return False
        
        try:
            logger.info(f"Checking camera at {self.camera_url}...")
            cap = cv2.VideoCapture(self.camera_url)
            
            # Try to read a frame
            ret, frame = cap.read()
            cap.release()
            
            if ret:
                logger.info("[OK] Camera is accessible")
                return True
            else:
                logger.error("Camera not responding - check URL and network")
                return False
                
        except Exception as e:
            logger.error(f"Error checking camera: {e}")
            return False
    
    def get_camera_info(self) -> dict:
        """
        Get camera information and stream details.
        
        Returns:
            dict: Camera properties
        """
        if not self.camera_url:
            return {}
        
        try:
            cap = cv2.VideoCapture(self.camera_url)
            
            info = {
                "url": self.camera_url,
                "frame_width": int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)),
                "frame_height": int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)),
                "fps": cap.get(cv2.CAP_PROP_FPS),
                "backend": cap.get(cv2.CAP_PROP_BACKEND_NAME)
            }
            
            cap.release()
            return info
            
        except Exception as e:
            logger.error(f"Error getting camera info: {e}")
            return {}
    
    def connect(self, camera_url: str = None) -> bool:
        """
        Connect to IP camera.
        
        Args:
            camera_url (str): Camera URL (http://IP:PORT/video or rtsp://...)
                Example: http://192.168.1.100:8080/video
                Example: rtsp://192.168.1.100:554/stream
            
        Returns:
            bool: True if connection successful
        """
        try:
            # Use provided URL or fallback to stored URL
            if camera_url:
                self.camera_url = camera_url
            
            if not self.camera_url:
                logger.error("Camera URL not provided")
                return False
            
            # Check if camera is available
            if not self.check_camera_available():
                logger.error("Camera unavailable")
                return False
            
            # Create video capture
            self.cap = cv2.VideoCapture(self.camera_url)
            
            if not self.cap.isOpened():
                logger.error("Failed to open camera stream")
                return False
            
            # Set capture properties for better performance
            self.cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)  # Minimize buffering
            self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, self.width)
            self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, self.height)
            
            self.connected = True
            logger.info(f"[OK] Connected to camera at {self.camera_url}")
            
            return True
                
        except Exception as e:
            logger.error(f"Connection error: {e}")
            return False
    
    def _capture_frames(self):
        """
        Background thread function for continuous frame capture.
        Reads frames from IP camera stream.
        """
        logger.info("Frame capture thread started")
        
        while self.is_running:
            try:
                if not self.cap or not self.cap.isOpened():
                    logger.warning("Camera connection lost, attempting reconnect...")
                    if not self._reconnect_camera():
                        time.sleep(2)
                        continue
                
                # Read frame from camera
                ret, frame = self.cap.read()
                
                if not ret or frame is None:
                    logger.warning("Failed to read frame")
                    self.error_count += 1
                    if self.error_count >= self.max_errors:
                        logger.error("Max consecutive errors, reconnecting...")
                        self._reconnect_camera()
                        self.error_count = 0
                    continue
                
                self.error_count = 0  # Reset error count on success
                
                # Resize to target dimensions
                frame = cv2.resize(frame, (self.width, self.height))
                
                # Frame skipping for performance
                self.skip_counter += 1
                if self.skip_counter % self.frame_skip == 0:
                    with self.frame_lock:
                        self.current_frame = frame.copy()
                    self.last_frame_time = time.time()
                    self.frame_count += 1
                    
            except Exception as e:
                self.error_count += 1
                logger.debug(f"Frame capture error: {e}")
                
                if self.error_count >= self.max_errors:
                    logger.error("Max errors reached, reconnecting...")
                    self._reconnect_camera()
                    self.error_count = 0
                
                time.sleep(0.5)
        
        logger.info("Frame capture thread stopped")
    
    def _reconnect_camera(self) -> bool:
        """
        Attempt to reconnect to camera.
        
        Returns:
            bool: True if reconnection successful
        """
        try:
            if self.cap:
                self.cap.release()
            
            logger.info("Reconnecting to camera...")
            self.cap = cv2.VideoCapture(self.camera_url)
            
            if self.cap.isOpened():
                self.cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
                logger.info("[OK] Camera reconnected")
                return True
            else:
                logger.warning("Reconnection failed")
                return False
                
        except Exception as e:
            logger.error(f"Reconnection error: {e}")
            return False
    
    def start(self, camera_url: str = None) -> bool:
        """
        Start camera streaming.
        
        Args:
            camera_url (str, optional): IP camera URL
            
        Returns:
            bool: True if streaming started successfully
        """
        try:
            if not self.connected:
                if not self.connect(camera_url):
                    logger.error("Failed to connect to camera")
                    return False
            
            self.is_running = True
            
            # Start capture thread
            self.thread = threading.Thread(target=self._capture_frames, daemon=True)
            self.thread.start()
            
            logger.info("[OK] Camera streaming started")
            return True
            
        except Exception as e:
            logger.error(f"Failed to start camera: {e}")
            self.is_running = False
            return False
    
    def get_frame(self) -> Optional[np.ndarray]:
        """
        Get the latest captured frame.
        
        Returns:
            np.ndarray or None: Latest frame in BGR format
        """
        with self.frame_lock:
            if self.current_frame is not None:
                return self.current_frame.copy()
        return None
    
    def has_frame(self) -> bool:
        """
        Check if a frame is available.
        
        Returns:
            bool: True if frame available
        """
        with self.frame_lock:
            return self.current_frame is not None
    
    def is_streaming(self) -> bool:
        """
        Check if camera is actively streaming.
        
        Returns:
            bool: True if streaming
        """
        return self.is_running and self.connected
    
    def get_fps(self) -> float:
        """
        Get approximate frames per second.
        
        Returns:
            float: Frames per second
        """
        if self.frame_count > 0:
            elapsed = time.time() - self.last_frame_time
            if elapsed > 0:
                return 1.0 / elapsed
        return 0.0
    
    def stop(self):
        """Stop camera streaming and cleanup."""
        try:
            logger.info("Stopping camera stream...")
            self.is_running = False
            
            # Release camera
            if self.cap:
                self.cap.release()
                self.cap = None
            
            # Wait for thread
            if self.thread and self.thread.is_alive():
                self.thread.join(timeout=5)
            
            self.connected = False
            logger.info("[OK] Camera stream stopped")
            
        except Exception as e:
            logger.error(f"Error stopping camera: {e}")
    
    def reconnect(self) -> bool:
        """
        Attempt to reconnect to camera.
        
        Returns:
            bool: True if reconnection successful
        """
        try:
            logger.info("Attempting manual reconnection...")
            self.stop()
            time.sleep(2)
            return self.start(self.camera_url)
        except Exception as e:
            logger.error(f"Reconnection error: {e}")
            return False
    
    def __del__(self):
        """Cleanup on object destruction."""
        self.stop()
