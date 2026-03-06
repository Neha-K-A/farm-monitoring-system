"""
FarmVisionAI - Camera Package
=============================

Provides device and camera abstraction for video capture.

Modules:
- adb_camera: Real-time camera streaming via Android Debug Bridge
"""

from .adb_camera import ADBCamera

__all__ = ['ADBCamera']
