import sqlite3
import sys

# Usage: python query_ai.py "search term"

def query(term):
    db_path = 'budgetstar.db'
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Search in description, category, tag, and notes (More info)
    search = f"%{term}%"
    cursor.execute("""
        SELECT date, description, amount, category, notes 
        FROM transactions 
        WHERE description LIKE ? OR category LIKE ? OR notes LIKE ? OR tag LIKE ?
        ORDER BY date DESC
    """, (search, search, search, search))
    
    rows = cursor.fetchall()
    if not rows:
        print(f"No transactions found matching '{term}'.")
    else:
        for r in rows:
            print(f"[{r[0]}] {r[1]} - ${r[2]:.2f} ({r[3]})")
            if r[4]:
                print(f"   Context: {r[4]}")
            print("-" * 20)
    
    conn.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Please provide a search term.")
    else:
        query(sys.argv[1])
