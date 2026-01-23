from enum import Enum

class Intent(str, Enum):
    LOAD_FORECASTING = "LOAD_FORECASTING"
    THEFT_DETECTION = "THEFT_DETECTION"
    OTHER = "OTHER"