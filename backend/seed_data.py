#!/usr/bin/env python3
"""
Seed script for BudgetStar.
Run directly to populate realistic demonstration transactions, goals, subscriptions, and assets.
Usage: python seed_data.py
"""
import sys
from datetime import date, timedelta
import random
from database import SessionLocal, engine
import models

def seed():
    models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        today = date.today()
        sample_categories = [
            ("Groceries", ["Supermarket produce", "Weekly pantry staples", "Bakery and dairy", "Farmers market trip"], [45.20, 82.50, 115.00, 64.30], 4, "Credit Card"),
            ("Eat out", ["Coffee and pastry", "Lunch bistro", "Weekend pizza dinner", "Sushi takeaway"], [6.50, 14.80, 36.00, 48.50], 2, "Debit Card"),
            ("Fuel", ["Gas station refill", "Commuter fuel top-off"], [38.50, 46.20], 4, "Credit Card"),
            ("Living/Utilities", ["Apartment Rent", "Electric utility bill", "High-speed internet"], [1250.00, 78.40, 65.00], 5, "Bank Transfer"),
            ("Subscription", ["Cloud Backup Service", "Streaming Entertainment", "Music Streaming"], [9.99, 15.99, 10.99], 3, "Credit Card"),
            ("Fun", ["Board game purchase", "Museum exhibition tickets", "Cinema night"], [28.00, 32.00, 24.50], 2, "Credit Card"),
            ("Personal Care", ["Pharmacy essentials", "Haircut appointment"], [18.25, 35.00], 3, "Debit Card"),
            ("Income", ["Bi-weekly Paycheck", "Bi-weekly Paycheck", "Freelance Consulting"], [1850.00, 1850.00, 320.00], 5, "Bank Transfer")
        ]

        users = ["User 1", "User 2"]
        created_txs = 0

        for day_offset in range(75, -1, -2):
            tx_date = today - timedelta(days=day_offset)
            for _ in range(random.choice([1, 1, 2])):
                cat_tuple = random.choice(sample_categories)
                cat_name = cat_tuple[0]
                desc = random.choice(cat_tuple[1])
                base_amt = random.choice(cat_tuple[2])
                amt = round(base_amt * random.uniform(0.9, 1.15), 2)
                necessity = cat_tuple[3]
                method = cat_tuple[4]
                user = random.choice(users) if cat_name != "Living/Utilities" else "Shared"

                tx = models.Transaction(
                    date=tx_date,
                    description=desc,
                    amount=amt,
                    necessity=necessity,
                    method=method,
                    category=cat_name,
                    user=user,
                    notes="Sample seed record for demonstration"
                )
                db.add(tx)
                created_txs += 1

        if db.query(models.Goal).count() == 0:
            demo_goals = [
                models.Goal(category="Groceries, Fuel, Personal Care", amount=650.0, period="month", user="Shared"),
                models.Goal(category="Eat out", amount=160.0, period="month", user="User 1"),
                models.Goal(category="Fun", amount=120.0, period="month", user="User 2"),
                models.Goal(category="Subscription", amount=50.0, period="month", user="Shared")
            ]
            for g in demo_goals:
                db.add(g)

        if db.query(models.Recurring).count() == 0:
            demo_recurrings = [
                models.Recurring(name="Apartment Rent", amount=1250.0, category="Living/Utilities", period="month", day="1st", notes="Primary housing"),
                models.Recurring(name="High-speed Fiber Internet", amount=65.0, category="Living/Utilities", period="month", day="15th", notes="Home internet connection"),
                models.Recurring(name="Streaming Entertainment", amount=15.99, category="Subscription", period="month", day="10th", notes="Family plan")
            ]
            for r in demo_recurrings:
                db.add(r)

        if db.query(models.Asset).count() == 0:
            demo_assets = [
                models.Asset(name="Workstation PC", purchase_date=today - timedelta(days=360), purchase_price=1600.0, estimated_value=1150.0, description="Desktop computer setup", updated_at=today, user="User 1"),
                models.Asset(name="Commuter Vehicle", purchase_date=today - timedelta(days=700), purchase_price=9500.0, estimated_value=7800.0, description="Reliable daily driver", updated_at=today, user="Shared")
            ]
            for a in demo_assets:
                db.add(a)

        db.commit()
        print(f"Successfully seeded {created_txs} transactions, demo goals, subscriptions, and assets!")
    except Exception as e:
        print(f"Error seeding demo data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
