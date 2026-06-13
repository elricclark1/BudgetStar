import sqlite3
import re

conn = sqlite3.connect('/app/budgetstar.db')
cursor = conn.cursor()

# 1. Categorical Consolidation
cursor.execute("UPDATE transactions SET category = 'Transportation: Fuel' WHERE category = 'Fuel' OR (category = 'Transportation' AND (LOWER(description) LIKE '%gas%' OR LOWER(description) LIKE '%fuel%'))")
cursor.execute("UPDATE transactions SET category = 'Eat out' WHERE category = 'Groceries' AND (LOWER(description) LIKE '%pizza%' OR LOWER(description) LIKE '%restaurant%')")

# 2. String Standardization
cursor.execute("UPDATE transactions SET description = 'Subscription: YouTube Family' WHERE LOWER(description) IN ('youtube family', 'youtube fam', 'youtube premium')")
cursor.execute("UPDATE transactions SET description = 'Subscription: Google One' WHERE LOWER(description) = 'google 1'")

# 3. Orthographic Correction
cursor.execute("UPDATE transactions SET category = 'Groceries' WHERE LOWER(category) IN ('grociers', 'grocieries')")

cursor.execute("SELECT id, description FROM transactions")
rows = cursor.fetchall()
for row in rows:
    new_desc = re.sub(r'(?i)\bwalamrt\b', 'Walmart', row[1])
    new_desc = re.sub(r'(?i)\brods\b', 'Ross', new_desc)
    if new_desc != row[1]:
        cursor.execute("UPDATE transactions SET description = ? WHERE id = ?", (new_desc, row[0]))

# 4. Necessity Alignment
cursor.execute("UPDATE transactions SET necessity = 3 WHERE description = 'Subscription: YouTube Family'")
cursor.execute("UPDATE transactions SET necessity = 5 WHERE LOWER(category) IN ('tithing', 'rent', 'car insurance') OR LOWER(description) IN ('tithing', 'rent', 'car insurance')")

conn.commit()
conn.close()