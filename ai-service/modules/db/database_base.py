from abc import ABC, abstractmethod
import pandas as pd
from typing import Optional

class Database(ABC):
    @abstractmethod
    def run_select_query(self, sql: str, params: Optional[tuple] = None) -> pd.DataFrame:
        pass

    @abstractmethod
    def execute_query(self, sql: str, params: Optional[tuple] = None) -> int:
        pass

    @abstractmethod
    def close(self):
        pass
