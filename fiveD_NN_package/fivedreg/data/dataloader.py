import pandas as pd

class DataLoader:
    def __init__(self, data_path: str):
        self.data_path = data_path

# load data from pickle file
    def load_data(self) -> pd.DataFrame:
        return pd.read_pickle(self.data_path)

    def print_data_summary(self, data: pd.DataFrame) -> None:
        """
        Print a summary of the data.
        """
        """
        Args:
            data: pd.DataFrame
        Returns:
            None
        """
        print("Data Info:")
        print(data.info())
        print("\nData Description (describe()):")
        print(data.describe())
        print("\nFirst 5 rows (head()):")
        print(data.head())
        print("\nLast 5 rows (tail()):")
        print(data.tail())
        print(f"\nData Shape (rows, columns): {data.shape}")
        print(f"\nColumn Names: {data.columns.tolist()}")
        print(f"\nIndex: {data.index}")
        print(f"\nData Types:\n{data.dtypes}")
        print(f"\nMissing values per column: {data.isnull().sum()}")
        print(f"\nTotal missing values in the dataframe: {data.isnull().sum().sum()}")