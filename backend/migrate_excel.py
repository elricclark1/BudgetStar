import pandas as pd
import sys
import os
from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models
from datetime import datetime

# Ensure tables exist
models.Base.metadata.create_all(bind=engine)

def migrate(file_path):
    if not os.path.exists(file_path):
        print(f"File {file_path} not found.")
        return

    print(f"Reading {file_path}...")
    try:
        # Load Excel
        df = pd.read_excel(file_path)
    except Exception as e:
        print(f"Error reading Excel: {e}")
        return

    # Normalize columns
    df.columns = [c.strip() for c in df.columns]
    print(f"Found columns: {df.columns.tolist()}")

    # Mapping
    # Excel Col -> Model Field
    col_map = {
        'Date': 'date',
        'Description': 'description',
        'Amount': 'amount',
        'Necessity': 'necessity',
        'Method': 'method',
        'Category': 'category',
        'Tag': 'tag',
        'More info': 'notes'
    }

    db = SessionLocal()
    count = 0
    
    try:
        for index, row in df.iterrows():
            # Extract and clean data
            data = {}
            for excel_col, model_field in col_map.items():
                if excel_col in df.columns:
                    val = row[excel_col]
                    if pd.isna(val):
                        val = None
                    data[model_field] = val
                else:
                    data[model_field] = None

            # Validation / Defaults
            if not data['date']:
                continue # Skip empty dates
            
            # Handle Date (Pandas Timestamp to Python Date)
            if isinstance(data['date'], pd.Timestamp):
                data['date'] = data['date'].date()
            elif isinstance(data['date'], str):
                 try:
                     data['date'] = datetime.strptime(data['date'], '%Y-%m-%d').date()
                 except:
                     pass # Keep as is or handle error

            if data['amount'] is None: data['amount'] = 0.0
            if data['necessity'] is None: data['necessity'] = 3
            
            # Ensure necessity is int
            try:
                data['necessity'] = int(data['necessity'])
            except:
                data['necessity'] = 3

            # Create Record
            transaction = models.Transaction(
                date=data['date'],
                description=str(data['description']) if data['description'] else "No Description",
                amount=float(data['amount']),
                necessity=data['necessity'],
                method=str(data['method']) if data['method'] else "Unknown",
                category=str(data['category']) if data['category'] else "Uncategorized",
                tag=str(data['tag']) if data['tag'] else None,
                notes=str(data['notes']) if data['notes'] else None
            )
            db.add(transaction)
            count += 1

        db.commit()
        print(f"Successfully migrated {count} transactions to budgetstar.db")
        
    except Exception as e:
        print(f"Error during migration: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python migrate_excel.py <path_to_excel>")
    else:
        migrate(sys.argv[1])