"""
FarmVisionAI Grid-Based Mapping Module
======================================

Advanced grid-based farm mapping for efficient spatial organization.
Features:
- Grid cell indexing for fast spatial queries
- Heat maps of crop density and health
- Path planning and navigation
- Spatial clustering and analysis

"""

import numpy as np
import cv2
from typing import Dict, List, Tuple, Set
from collections import defaultdict
from utils.config import (
    MAP_GRID_SIZE, MAP_WIDTH, MAP_HEIGHT,
    get_logger
)

logger = get_logger(__name__)

class GridCell:
    """
    Represents a single grid cell on the farm map.
    """
    
    def __init__(self, x: int, y: int, size: int):
        """
        Initialize grid cell.
        
        Args:
            x (int): Grid X coordinate
            y (int): Grid Y coordinate
            size (int): Cell size in pixels
        """
        self.x = x
        self.y = y
        self.size = size
        self.crops = []  # List of crop IDs in this cell
        self.health_histogram = defaultdict(int)
    
    def add_crop(self, crop_id: int, health: str):
        """
        Add crop to cell.
        
        Args:
            crop_id (int): Crop ID
            health (str): Health status
        """
        if crop_id not in self.crops:
            self.crops.append(crop_id)
        self.health_histogram[health] += 1
    
    def remove_crop(self, crop_id: int):
        """Remove crop from cell."""
        if crop_id in self.crops:
            self.crops.remove(crop_id)
    
    def get_dominant_health(self) -> str:
        """Get dominant health status in cell."""
        if not self.health_histogram:
            return "unknown"
        return max(self.health_histogram, key=self.health_histogram.get)
    
    def get_population(self) -> int:
        """Get number of crops in cell."""
        return len(self.crops)
    
    def get_health_distribution(self) -> Dict[str, float]:
        """Get health distribution percentages."""
        total = sum(self.health_histogram.values())
        if total == 0:
            return {}
        return {health: count / total for health, count in self.health_histogram.items()}

class GridMapper:
    """
    Advanced grid-based mapping system for efficient farm analysis.
    """
    
    def __init__(self,
                 map_width: int = MAP_WIDTH,
                 map_height: int = MAP_HEIGHT,
                 grid_size: int = MAP_GRID_SIZE):
        """
        Initialize grid mapper.
        
        Args:
            map_width (int): Map width in pixels
            map_height (int): Map height in pixels
            grid_size (int): Size of each grid cell
        """
        self.map_width = map_width
        self.map_height = map_height
        self.grid_size = grid_size
        
        # Calculate grid dimensions
        self.grid_cols = map_width // grid_size + 1
        self.grid_rows = map_height // grid_size + 1
        
        # Initialize grid
        self.grid = {}
        self._initialize_grid()
        
        # Crop tracking
        self.crop_to_cell = {}  # Maps crop ID to cell coordinates
        self.next_crop_id = 0
        
        logger.info(f"GridMapper initialized: {self.grid_cols}x{self.grid_rows} grid ({grid_size}px cells)")
    
    def _initialize_grid(self):
        """Initialize all grid cells."""
        for y in range(self.grid_rows):
            for x in range(self.grid_cols):
                grid_coords = (x, y)
                self.grid[grid_coords] = GridCell(
                    x * self.grid_size,
                    y * self.grid_size,
                    self.grid_size
                )
    
    def _get_cell_coords(self, map_x: int, map_y: int) -> Tuple[int, int]:
        """
        Get grid cell coordinates from map coordinates.
        
        Args:
            map_x (int): X coordinate on map
            map_y (int): Y coordinate on map
            
        Returns:
            tuple: (grid_x, grid_y)
        """
        grid_x = min(map_x // self.grid_size, self.grid_cols - 1)
        grid_y = min(map_y // self.grid_size, self.grid_rows - 1)
        return (max(0, grid_x), max(0, grid_y))
    
    def add_crop(self,
                 map_coords: Tuple[int, int],
                 crop_class: str,
                 health: str) -> int:
        """
        Add crop to grid at map coordinates.
        
        Args:
            map_coords (tuple): (x, y) on map
            crop_class (str): Crop class name
            health (str): Health status
            
        Returns:
            int: Assigned crop ID
        """
        try:
            crop_id = self.next_crop_id
            self.next_crop_id += 1
            
            # Get cell coordinates
            map_x, map_y = map_coords
            grid_coords = self._get_cell_coords(map_x, map_y)
            
            # Add to cell
            cell = self.grid[grid_coords]
            cell.add_crop(crop_id, health)
            
            # Track mapping
            self.crop_to_cell[crop_id] = grid_coords
            
            logger.debug(f"Added crop {crop_id} to grid cell {grid_coords}")
            
            return crop_id
            
        except Exception as e:
            logger.error(f"Error adding crop to grid: {e}")
            return -1
    
    def remove_crop(self, crop_id: int):
        """Remove crop from grid."""
        if crop_id in self.crop_to_cell:
            grid_coords = self.crop_to_cell[crop_id]
            cell = self.grid[grid_coords]
            cell.remove_crop(crop_id)
            del self.crop_to_cell[crop_id]
    
    def get_cell_at(self, grid_x: int, grid_y: int) -> GridCell:
        """Get grid cell at coordinates."""
        coords = (grid_x, grid_y)
        if coords in self.grid:
            return self.grid[coords]
        return None
    
    def get_cell_population_map(self) -> np.ndarray:
        """
        Get 2D array of crop population density.
        
        Returns:
            np.ndarray: Population map
        """
        pop_map = np.zeros((self.grid_rows, self.grid_cols), dtype=np.uint8)
        
        for (x, y), cell in self.grid.items():
            pop_map[y, x] = min(255, cell.get_population() * 20)  # Scale for visibility
        
        return pop_map
    
    def get_health_status_map(self) -> Dict[str, np.ndarray]:
        """
        Get health status maps for each health state.
        
        Returns:
            dict: Maps for each health status
        """
        health_maps = {}
        health_states = ["healthy", "ripe", "unripe", "rotten", "diseased"]
        
        for health in health_states:
            health_map = np.zeros((self.grid_rows, self.grid_cols), dtype=np.uint8)
            
            for (x, y), cell in self.grid.items():
                if health in cell.health_histogram:
                    count = cell.health_histogram[health]
                    health_map[y, x] = min(255, count * 30)
            
            health_maps[health] = health_map
        
        return health_maps
    
    def get_high_density_regions(self, threshold: int = 5) -> List[Tuple[int, int]]:
        """
        Get grid cells with high crop density.
        
        Args:
            threshold (int): Minimum crops per cell
            
        Returns:
            list: List of high-density cell coordinates
        """
        high_density = []
        for coords, cell in self.grid.items():
            if cell.get_population() >= threshold:
                high_density.append(coords)
        return high_density
    
    def get_problem_areas(self) -> List[Tuple[int, int]]:
        """
        Get grid cells with problematic crops (diseased/rotten).
        
        Returns:
            list: List of problem cell coordinates
        """
        problem_areas = []
        for coords, cell in self.grid.items():
            health_dist = cell.get_health_distribution()
            if health_dist.get("rotten", 0) > 0.3 or health_dist.get("diseased", 0) > 0.2:
                problem_areas.append(coords)
        return problem_areas
    
    def get_path_to_region(self,
                          start: Tuple[int, int],
                          end: Tuple[int, int]) -> List[Tuple[int, int]]:
        """
        Get simple path between two grid regions (Manhattan distance).
        
        Args:
            start (tuple): Starting grid cell
            end (tuple): Ending grid cell
            
        Returns:
            list: Path coordinates
        """
        path = []
        x_start, y_start = start
        x_end, y_end = end
        
        # Simple Manhattan distance path
        x, y = x_start, y_start
        
        while x != x_end or y != y_end:
            path.append((x, y))
            
            if x < x_end:
                x += 1
            elif x > x_end:
                x -= 1
            
            if y < y_end:
                y += 1
            elif y > y_end:
                y -= 1
        
        path.append((x_end, y_end))
        return path
    
    def get_statistics(self) -> Dict:
        """
        Get grid statistics.
        
        Returns:
            dict: Statistics
        """
        total_crops = self.next_crop_id
        occupied_cells = sum(1 for cell in self.grid.values() if cell.get_population() > 0)
        
        health_counts = defaultdict(int)
        for cell in self.grid.values():
            for health, count in cell.health_histogram.items():
                health_counts[health] += count
        
        return {
            "total_crops": total_crops,
            "occupied_cells": occupied_cells,
            "occupancy_rate": occupied_cells / len(self.grid) if self.grid else 0,
            "health_distribution": dict(health_counts),
            "average_population": total_crops / len(self.grid) if self.grid else 0,
            "grid_dimensions": (self.grid_cols, self.grid_rows)
        }
    
    def clear(self):
        """Clear all grid data."""
        self._initialize_grid()
        self.crop_to_cell = {}
        self.next_crop_id = 0
        logger.info("Grid cleared")

class HeatmapGenerator:
    """
    Generate visualization heat maps from grid data.
    """
    
    @staticmethod
    def create_population_heatmap(pop_map: np.ndarray) -> np.ndarray:
        """
        Create color heatmap from population data.
        
        Args:
            pop_map (np.ndarray): Population density map
            
        Returns:
            np.ndarray: Color heatmap image
        """
        # Create 3-channel image
        heatmap = np.zeros((*pop_map.shape, 3), dtype=np.uint8)
        
        # Apply color gradient: blue (low) -> green -> yellow -> red (high)
        max_val = np.max(pop_map)
        if max_val > 0:
            normalized = pop_map / max_val
            
            for i in range(pop_map.shape[0]):
                for j in range(pop_map.shape[1]):
                    val = normalized[i, j]
                    
                    if val < 0.25:  # Blue
                        heatmap[i, j] = [255, 0, 0]
                    elif val < 0.5:  # Green
                        heatmap[i, j] = [0, 255, 0]
                    elif val < 0.75:  # Yellow
                        heatmap[i, j] = [0, 255, 255]
                    else:  # Red
                        heatmap[i, j] = [0, 0, 255]
        
        return heatmap
    
    @staticmethod
    def create_health_heatmap(health_map: np.ndarray) -> np.ndarray:
        """
        Create heatmap for specific health status.
        
        Args:
            health_map (np.ndarray): Health status map
            
        Returns:
            np.ndarray: Color heatmap
        """
        heatmap = cv2.applyColorMap(health_map, cv2.COLORMAP_JET)
        return heatmap
