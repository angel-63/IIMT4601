from datetime import datetime, timedelta
from math import radians, cos, sin, sqrt, atan2
from pymongo import MongoClient
import time
import pytz

client = MongoClient("mongodb+srv://aileen:Enha0420@4601sprint1.9qmij.mongodb.net/")
db = client["user"]

minibuses_collection = db["minibus"]
notification_collection = db["notification"]
payment_collection = db["payment"]
reservation_collection = db["reservation"]
route_collection = db["route"]
shift_collection = db["shift"]
stop_collection = db["stop"]
trip_collection = db["trip"]
userInfo_collection = db["userInfo"]

route1_travel_time = {
    0:  [1.5, 0.5, 0.5, 1.0, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
    1:  [1.5, 0.5, 0.5, 1.0, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
    2:  [1.5, 0.5, 0.5, 1.0, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
    3:  [1.5, 0.5, 0.5, 1.0, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
    4:  [1.5, 0.5, 0.5, 1.0, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0., 0.5],
    5:  [1.5, 0.5, 0.5, 1.0, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
    6:  [2, 0.7, 0.7, 1.3, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.5],
    7:  [2.3, 0.8, 0.8, 1.5, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.5],
    8:  [4, 1, 1, 3, 1, 1, 1, 1, 2, 1, 1, 0.5],
    9:  [3, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 0.5],
    10: [3, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 0.5],
    11: [3, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 0.5],
    12: [3, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 0.5],
    13: [3, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 0.5],
    14: [3, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 0.5],
    15: [3, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 0.5],
    16: [4, 1, 1, 3, 1, 1, 1, 1, 2, 1, 1, 0.5],
    17: [5, 1, 1, 4, 2, 1, 1, 1, 2, 1, 1, 0.5],
    18: [5, 1, 1, 4, 2, 1, 1, 1, 2, 1, 1, 0.5],
    19: [5, 1, 1, 4, 2, 1, 1, 1, 2, 1, 1, 0.5],
    20: [4, 1, 1, 3, 1, 1, 1, 1, 2, 1, 1, 0.5],
    21: [3, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 0.5],
    22: [3, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 0.5],
    23: [3, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 0.5],
}

route2_travel_time = {
    0:  [3, 0.5, 0.5, 1.0, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
    1:  [3, 0.5, 0.5, 1.0, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
    2:  [3, 0.5, 0.5, 1.0, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
    3:  [3, 0.5, 0.5, 1.0, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
    4:  [3, 0.5, 0.5, 1.0, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0., 0.5],
    5:  [3, 0.5, 0.5, 1.0, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
    6:  [4, 0.7, 0.7, 1.3, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.5],
    7:  [5, 0.8, 0.8, 1.5, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.5],
    8:  [6, 1, 1, 3, 1, 1, 1, 1, 2, 1, 1, 0.5],
    9:  [6, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 0.5],
    10: [6, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 0.5],
    11: [5, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 0.5],
    12: [5, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 0.5],
    13: [5, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 0.5],
    14: [5, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 0.5],
    15: [6, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 0.5],
    16: [6, 1, 1, 3, 1, 1, 1, 1, 2, 1, 1, 0.5],
    17: [6, 1, 1, 4, 2, 1, 1, 1, 2, 1, 1, 0.5],
    18: [7, 1, 1, 4, 2, 1, 1, 1, 2, 1, 1, 0.5],
    19: [7, 1, 1, 4, 2, 1, 1, 1, 2, 1, 1, 0.5],
    20: [6, 1, 1, 3, 1, 1, 1, 1, 2, 1, 1, 0.5],
    21: [5, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 0.5],
    22: [4, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 0.5],
    23: [4, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 0.5],
}

route3_travel_time = {
    0:  [1, 0.5, 4, 3, 0.5, 2, 0.5, 0.5, 0.5, 0.5, 1, 2, 2, 3, 4, 0.5, 0.5],
    1:  [1, 0.5, 4, 3, 0.5, 2, 0.5, 0.5, 0.5, 0.5, 1, 2, 2, 3, 4, 0.5, 0.5],
    2:  [1, 0.5, 4, 3, 0.5, 2, 0.5, 0.5, 0.5, 0.5, 1, 2, 2, 3, 4, 0.5, 0.5],
    3:  [1, 0.5, 4, 3, 0.5, 2, 0.5, 0.5, 0.5, 0.5, 1, 2, 2, 3, 4, 0.5, 0.5],
    4:  [1, 0.5, 4, 3, 0.5, 2, 0.5, 0.5, 0.5, 0.5, 1, 2, 2, 3, 4, 0.5, 0.5],
    5:  [1, 0.5, 4, 3, 0.5, 2, 0.5, 0.5, 0.5, 0.5, 1, 2, 2, 3, 4, 0.5, 0.5],
    6:  [2, 0.5, 4, 3, 0.5, 2, 0.5, 0.5, 0.5, 0.5, 1, 2, 2, 3, 4, 0.5, 0.5],
    7:  [4, 2, 5, 3, 0.5, 2, 0.5, 0.5, 0.5, 0.5, 2, 2, 3, 4, 4, 0.5, 0.5],
    8:  [4, 3, 6, 3, 0.5, 2, 0.5, 0.5, 0.5, 0.5, 2, 2, 3, 4, 4, 0.5, 0.5],
    9:  [3, 2, 7, 3, 0.5, 2, 0.5, 0.5, 0.5, 0.5, 2, 2, 3, 4, 4, 0.5, 0.5],
    10: [3, 3, 7, 3, 0.5, 2, 0.5, 0.5, 0.5, 0.5, 1, 2, 2, 3, 4, 0.5, 0.5],
    11: [2, 1, 6, 3, 0.5, 2, 0.5, 0.5, 0.5, 0.5, 1, 2, 2, 3, 4, 0.5, 0.5],
    12: [2, 1, 5, 3, 0.5, 2, 0.5, 0.5, 0.5, 0.5, 1, 2, 2, 3, 4, 0.5, 0.5],
    13: [2, 1, 5, 3, 0.5, 2, 0.5, 0.5, 0.5, 0.5, 1, 2, 2, 3, 4, 0.5, 0.5],
    14: [2, 1, 5, 3, 0.5, 2, 0.5, 0.5, 0.5, 0.5, 1, 2, 2, 3, 4, 0.5, 0.5],
    15: [2, 1, 5, 3, 0.5, 2, 0.5, 0.5, 0.5, 0.5, 1, 2, 2, 3, 4, 0.5, 0.5],
    16: [3, 3, 6, 3, 0.5, 2, 0.5, 0.5, 0.5, 0.5, 2, 2, 3, 4, 4, 0.5, 0.5],
    17: [4, 4, 6, 3, 0.5, 2, 0.5, 0.5, 0.5, 0.5, 2, 2, 3, 4, 4, 0.5, 0.5],
    18: [4, 3, 7, 3, 0.5, 2, 0.5, 0.5, 0.5, 0.5, 2, 2, 3, 4, 4, 0.5, 0.5],
    19: [3, 2, 7, 3, 0.5, 2, 0.5, 0.5, 0.5, 0.5, 2, 2, 3, 4, 4, 0.5, 0.5],
    20: [1, 0.5, 6, 3, 0.5, 2, 0.5, 0.5, 0.5, 0.5, 2, 2, 3, 4, 4, 0.5, 0.5],
    21: [1, 0.5, 5, 3, 0.5, 2, 0.5, 0.5, 0.5, 0.5, 1, 2, 2, 3, 4, 0.5, 0.5],
    22: [1, 0.5, 5, 3, 0.5, 2, 0.5, 0.5, 0.5, 0.5, 1, 2, 2, 3, 4, 0.5, 0.5],
    23: [1, 0.5, 5, 3, 0.5, 2, 0.5, 0.5, 0.5, 0.5, 1, 2, 2, 3, 4, 0.5, 0.5],
}

route4_travel_time = {
    0:  [1.5, 0.5, 0.5, 1.0, 0.5, 0.5, 0.5, 0.5],
    1:  [1.5, 0.5, 0.5, 1.0, 0.5, 0.5, 0.5, 0.5],
    2:  [1.5, 0.5, 0.5, 1.0, 0.5, 0.5, 0.5, 0.5],
    3:  [1.5, 0.5, 0.5, 1.0, 0.5, 0.5, 0.5, 0.5],
    4:  [1.5, 0.5, 0.5, 1.0, 0.5, 0.5, 0.5, 0.5],
    5:  [1.5, 0.5, 0.5, 1.0, 0.5, 0.5, 0.5, 0.5],
    6:  [2, 0.7, 0.7, 1.3, 0.7, 0.7, 0.7, 0.7],
    7:  [2.3, 0.8, 0.8, 1.5, 0.8, 0.8, 0.8, 0.8],
    8:  [4, 1, 1, 3, 1, 1, 1, 1],
    9:  [3, 1, 1, 2, 1, 1, 1, 1],
    10: [3, 1, 1, 2, 1, 1, 1, 1],
    11: [3, 1, 1, 2, 1, 1, 1, 1],
    12: [3, 1, 1, 2, 1, 1, 1, 1],
    13: [3, 1, 1, 2, 1, 1, 1, 1],
    14: [3, 1, 1, 2, 1, 1, 1, 1],
    15: [3, 1, 1, 2, 1, 1, 1, 1],
    16: [4, 1, 1, 3, 1, 1, 1, 1],
    17: [5, 1, 1, 4, 2, 1, 1, 1],
    18: [5, 1, 1, 4, 2, 1, 1, 1],
    19: [5, 1, 1, 4, 2, 1, 1, 1],
    20: [4, 1, 1, 3, 1, 1, 1, 1],
    21: [3, 1, 1, 2, 1, 1, 1, 1],
    22: [3, 1, 1, 2, 1, 1, 1, 1],
    23: [3, 1, 1, 2, 1, 1, 1, 1],
}

route5_travel_time = {
    0:  [1.5, 0.5, 0.5, 1.0, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
    1:  [1.5, 0.5, 0.5, 1.0, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
    2:  [1.5, 0.5, 0.5, 1.0, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
    3:  [1.5, 0.5, 0.5, 1.0, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
    4:  [1.5, 0.5, 0.5, 1.0, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0., 0.5, 0.5],
    5:  [1.5, 0.5, 0.5, 1.0, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
    6:  [2, 0.7, 0.7, 1.3, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.5, 0.5],
    7:  [2.3, 0.8, 0.8, 1.5, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.5, 0.5],
    8:  [4, 1, 1, 3, 1, 1, 1, 1, 2, 1, 1, 0.5, 0.5],
    9:  [3, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 0.5, 0.5],
    10: [3, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 0.5, 0.5],
    11: [3, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 0.5, 0.5],
    12: [3, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 0.5, 0.5],
    13: [3, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 0.5, 0.5],
    14: [3, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 0.5, 0.5],
    15: [3, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 0.5, 0.5],
    16: [4, 1, 1, 3, 1, 1, 1, 1, 2, 1, 1, 0.5, 0.5],
    17: [5, 1, 1, 4, 2, 1, 1, 1, 2, 1, 1, 0.5, 0.5],
    18: [5, 1, 1, 4, 2, 1, 1, 1, 2, 1, 1, 0.5, 0.5],
    19: [5, 1, 1, 4, 2, 1, 1, 1, 2, 1, 1, 0.5, 0.5],
    20: [4, 1, 1, 3, 1, 1, 1, 1, 2, 1, 1, 0.5, 0.5],
    21: [3, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 0.5, 0.5],
    22: [3, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 0.5, 0.5],
    23: [3, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 0.5, 0.5],
}

route6_travel_time = {
    0:  [1, 0.5, 4, 3, 0.5, 2, 0.5, 0.5, 0.5, 0.5, 2, 3, 4, 0.5, 0.5],
    1:  [1, 0.5, 4, 3, 0.5, 2, 0.5, 0.5, 0.5, 0.5, 2, 3, 4, 0.5, 0.5],
    2:  [1, 0.5, 4, 3, 0.5, 2, 0.5, 0.5, 0.5, 0.5, 2, 3, 4, 0.5, 0.5],
    3:  [1, 0.5, 4, 3, 0.5, 2, 0.5, 0.5, 0.5, 0.5, 2, 3, 4, 0.5, 0.5],
    4:  [1, 0.5, 4, 3, 0.5, 2, 0.5, 0.5, 0.5, 0.5, 2, 3, 4, 0.5, 0.5],
    5:  [1, 0.5, 4, 3, 0.5, 2, 0.5, 0.5, 0.5, 0.5, 2, 3, 4, 0.5, 0.5],
    6:  [2, 0.5, 4, 3, 0.5, 2, 0.5, 0.5, 0.5, 0.5, 2, 3, 4, 0.5, 0.5],
    7:  [4, 2, 5, 3, 0.5, 2, 0.5, 0.5, 0.5, 0.5, 2, 4, 4, 0.5, 0.5],
    8:  [4, 3, 6, 3, 0.5, 2, 0.5, 0.5, 0.5, 0.5, 2, 4, 4, 0.5, 0.5],
    9:  [3, 2, 7, 3, 0.5, 2, 0.5, 0.5, 0.5, 0.5, 2, 4, 4, 0.5, 0.5],
    10: [3, 3, 7, 3, 0.5, 2, 0.5, 0.5, 0.5, 0.5, 1, 3, 4, 0.5, 0.5],
    11: [2, 1, 6, 3, 0.5, 2, 0.5, 0.5, 0.5, 0.5, 2, 3, 4, 0.5, 0.5],
    12: [2, 1, 5, 3, 0.5, 2, 0.5, 0.5, 0.5, 0.5, 2, 3, 4, 0.5, 0.5],
    13: [2, 1, 5, 3, 0.5, 2, 0.5, 0.5, 0.5, 0.5, 2, 3, 4, 0.5, 0.5],
    14: [2, 1, 5, 3, 0.5, 2, 0.5, 0.5, 0.5, 0.5, 2, 3, 4, 0.5, 0.5],
    15: [2, 1, 5, 3, 0.5, 2, 0.5, 0.5, 0.5, 0.5, 2, 3, 4, 0.5, 0.5],
    16: [3, 3, 6, 3, 0.5, 2, 0.5, 0.5, 0.5, 0.5, 3, 4, 4, 0.5, 0.5],
    17: [4, 4, 6, 3, 0.5, 2, 0.5, 0.5, 0.5, 0.5, 2, 4, 4, 0.5, 0.5],
    18: [4, 3, 7, 3, 0.5, 2, 0.5, 0.5, 0.5, 0.5, 2, 4, 4, 0.5, 0.5],
    19: [3, 2, 7, 3, 0.5, 2, 0.5, 0.5, 0.5, 0.5, 2, 2, 4, 0.5, 0.5],
    20: [1, 0.5, 6, 3, 0.5, 2, 0.5, 0.5, 0.5, 0.5, 2, 4, 4, 0.5, 0.5],
    21: [1, 0.5, 5, 3, 0.5, 2, 0.5, 0.5, 0.5, 0.5, 1, 3, 4, 0.5, 0.5],
    22: [1, 0.5, 5, 3, 0.5, 2, 0.5, 0.5, 0.5, 0.5, 1, 3, 4, 0.5, 0.5],
    23: [1, 0.5, 5, 3, 0.5, 2, 0.5, 0.5, 0.5, 0.5, 1, 3, 4, 0.5, 0.5],
}

travel_time_list = [
    route1_travel_time,
    route2_travel_time,
    route3_travel_time,
    route4_travel_time,
    route5_travel_time,
    route6_travel_time
]
travel_time_matrix = None

mean_customer_per_hour = {
    0:  15,
    1:  12,
    2:  7,
    3:  5,
    4:  3,
    5:  5,
    6:  10,
    7:  25,
    8:  30,
    9:  20,
    10: 15,
    11: 15,
    12: 20,
    13: 25,
    14: 20,
    15: 15,
    16: 15,
    17: 25,
    18: 30,
    19: 35,
    20: 30,
    21: 20,
    22: 14,
    23: 12,
}

def get_time_range(current_time, time_ranges):
    current_hour = datetime.strptime(current_time, "%H:%M:%S").hour
    for time_range in time_ranges:
        if time_range[0] <= current_hour < time_range[1]:
            return time_range
    return None

def get_shift(route_id, current_stop):
    """
    Fetch the shift with the highest progress but less than the current stop for a given route.

    Args:
        route_id (str): The ID of the route (e.g., "Route1").
        current_stop (int): The stop number the user is checking.

    Returns:
        dict: The details of the shift with the highest progress, or None if no such shift exists.
    """
    
    # Query the shift collection to find the shift with the highest progress < current_stop for the given route_id
    shift = shift_collection.find_one(
        {
            "route_id": route_id,        # Match the route ID
            "progress": {"$lt": current_stop}  # Progress should be less than the current stop
        },
        sort=[("progress", -1)]  # Sort by progress in descending order to get the highest progress
    )
    return shift

def get_waiting_shift(route_id):
    """
    Fetch the next waiting shift for the given route at the starting station.

    Args:
        route_id (str): The ID of the route (e.g., "Route1").

    Returns:
        dict: The waiting shift at the starting station.
    """
    waiting_shift = shift_collection.find_one({"route_id": route_id, "progress": 0, "arrival_time": None})
    return waiting_shift
    
# Helper function to calculate distance between two coordinates using the Haversine formula
def haversine(lat1, lon1, lat2, lon2):
    R = 6371.0087714
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat / 2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return R * c

# Function to calculate the estimated arrival time
def calculate_eta(shift, stop_num, current_time):
    """
    Calculate the estimated arrival time at a specific stop for a given shift.

    Args:
        shift (dict): The shift object containing all relevant data (e.g., route_id, progress, latitude, longitude, etc.).
        stop_num (int): The stop number for which ETA is calculated.
        current_time (str): The actual current time in "HH:MM:SS" format.

    Returns:
        str: The estimated arrival time at the requested stop in "HH:MM:SS" format.
    """
    
    # Extract necessary data from the shift object
    route_id = shift.get("route_id")
    progress = shift.get("progress")
    latitude = shift.get("latitude")
    longitude = shift.get("longitude")
    arrival_time = shift.get("arrival_time")
    
    # use departure time as the arrival time if it is the waiting shift
    if arrival_time is None:
        arrival_time = current_time
    
    if isinstance(arrival_time, str):
        arrival_time = datetime.fromisoformat(arrival_time)
    
    hong_kong_tz = pytz.timezone("Asia/Hong_Kong")
    arrival_time = arrival_time.replace(tzinfo=pytz.utc).astimezone(hong_kong_tz)

    if route_id is None or progress is None or latitude is None or longitude is None:
        return "Incomplete shift data provided"

    # Fetch route data from the database
    route = route_collection.find_one({"route_id": route_id})
    if not route:
        return f"Route with ID '{route_id}' not found"

    # Fetch stop details for the stops in this route
    stops_info = route.get("stops")
    stop_ids = [stop["stop_id"] for stop in stops_info]

    if not stop_ids:
        return f"No stops found for route '{route_id}'"

    stops = list(stop_collection.find({"stop_id": {"$in": stop_ids}}))
    stops = sorted(stops, key=lambda stop: next(item["order"] for item in stops_info if item["stop_id"] == stop["stop_id"]))
    if not stops:
        return f"No stop details found for route '{route_id}'"

    # Validate inputs
    if stop_num <= progress or stop_num >= len(stops):
        return "Invalid stop number"

    # Parse input times
    current_hour = current_time.hour

    # Calculate delay or early arrival adjustment
    time_difference = (current_time - arrival_time).total_seconds() / 60.0  # Convert to minutes
    delay_adjustment = max(0, time_difference)

    # Initialize the total travel time
    total_travel_time = 0

    route_travel_time = travel_time_matrix[current_hour]
    if not route_travel_time:
        return f"No travel time matrix found for route '{route_id}'"

    # Calculate the travel time for each segment from the current stop to the desired stop
    for i in range(progress, stop_num):
        current_stop = stops[i]
        next_stop = stops[i + 1]

        # Get the mean travel time for the segment
        mean_travel_time = route_travel_time[i]

        if i == progress:
            # Calculate the real-time adjustment for the current segment
            distance_to_next_stop = haversine(latitude, longitude, next_stop["latitude"], next_stop["longitude"])
            total_distance_between_stops = haversine(current_stop["latitude"], current_stop["longitude"], next_stop["latitude"], next_stop["longitude"])

            if total_distance_between_stops == 0:  # Avoid division by zero
                real_time_travel_time = mean_travel_time + delay_adjustment
            else:
                proportion_completed = 1 - (distance_to_next_stop / total_distance_between_stops)
                real_time_travel_time = mean_travel_time * (1 - proportion_completed) + delay_adjustment

            total_travel_time += real_time_travel_time
        else:
            total_travel_time += mean_travel_time

    # Calculate the estimated arrival time
    estimated_arrival_time = current_time + timedelta(minutes=total_travel_time)
    return estimated_arrival_time.strftime("%H:%M:%S")

def get_next_shift_eta(shift, pickup_stop_id, current_time):
    """
    Calculate the estimated arrival time (ETA) of the next shift at the pickup location.

    Args:
        shift (dict): The shift object containing all relevant data (e.g., route_id, progress, latitude, longitude, etc.).
        pickup_stop_id (str): The stop_id of the pickup location (from the reservation).
        current_time (str): The current time in "HH:MM:SS" format.

    Returns:
        str: The estimated arrival time at the pickup location in "HH:MM:SS" format.
    """
    
    # Extract route_id from the shift
    route_id = shift.get("route_id")
    if not route_id:
        return "Invalid shift: Missing route_id"

    # Fetch route data from the database
    route = route_collection.find_one({"route_id": route_id})
    if not route:
        return f"Route with ID '{route_id}' not found"

    # Fetch the list of stop_ids in the route
    stop_ids = route.get("stops", [])
    if not stop_ids:
        return f"No stops found for route '{route_id}'"

    # Find the stop number (index) of the pickup_stop_id in the route's stop_ids
    try:
        stop_num = stop_ids.index(pickup_stop_id)
    except ValueError:
        return f"Pickup stop_id '{pickup_stop_id}' not found in route '{route_id}'"

    # Call the calculate_eta function to get the ETA
    next_shift_eta = calculate_eta(shift, stop_num, current_time)
    return next_shift_eta

def get_assigned_reservations(shift, route_id, current_time, available_seats):
    """
    Get the reservation IDs assigned to the next shift of a given route for all stops.

    Args:
        shift (dict): The shift object containing all relevant data (e.g., route_id, progress, latitude, longitude, etc.).
        route_id (str): The ID of the route (e.g., "Route1").
        current_time (str): The current time in "HH:MM:SS" format.

    Returns:
        list: A list of reservation IDs assigned to the next shift.
    """
    
    # Fetch the route details
    route = route_collection.find_one({"route_id": route_id})
    if not route:
        return f"[ERROR] Route {route_id} not found."

    # Extract all stop IDs from the route
    stops_info = route.get("stops", [])
    stop_ids = [stop["stop_id"] for stop in stops_info]

    print(f"[DEBUG] Found {len(stop_ids)} stops on route {route_id}: {stop_ids}")

    # Initialize an empty list to store all assigned reservation IDs
    all_assigned_reservations = []

    # Loop through each stop_id and fetch reservations
    for stop_id in stop_ids:
        print(f"[INFO] Checking reservations for stop ID: {stop_id}")

        # Calculate the ETA for the next shift at this stop
        next_shift_eta = get_next_shift_eta(shift, stop_id, current_time)
        if "Invalid" in next_shift_eta or "not found" in next_shift_eta:
            print(f"[WARNING] Skipping stop {stop_id} due to invalid ETA calculation.")
            continue  # Skip this stop if ETA calculation fails

        # Fetch reservations matching the criteria for this stop
        reservations = reservation_collection.find({
            "route_id": route_id,                             # Rule 1: Route of the reservation matches
            "reservation_status": "Reserved",                # Only consider active reservations
            "pickup_location": stop_id,                      # Match the pickup location (current stop)
            "reserved_time": {"$gte": datetime.strptime(next_shift_eta, "%H:%M:%S")}  # Rule 2: Reserved time >= ETA
        })

        # Extract reservation IDs from the matching reservations
        for reservation in reservations:
            if available_seats <= 0:
                print(f"[INFO] No more seats available. Skipping further reservations.")
                break  # Stop processing reservations if no more seats are available

            reservation_id = reservation.get("reservation_id")
            seat_number = reservation.get("seat", 1)
            print(f"[DEBUG] Found reservation ID: {reservation_id}, Seat: {seat_number}")
            
            if available_seats < seat_number:
                print(f"[INFO] Not enough available seats for reservation ID: {reservation_id}. Skipping.")
                continue
            
            # Add the reservation ID and seat information to the master list
            all_assigned_reservations.append({
                "reservation_id": reservation_id,
                "seat": seat_number
            })

            # Decrement the available seats count
            available_seats -= seat_number
            
    # Return the aggregated list of all assigned reservation IDs
    print(f"[INFO] Total reservations assigned to the next shift: {len(all_assigned_reservations)}")
    return all_assigned_reservations, available_seats

def estimate_departure_time(shift, current_time):
    """
    Estimate the departure time of a minibus based on available seats,
    pending reservations, and customer arrival rates, considering the next shift's ETA.

    Args:
        shift (dict): Shift object containing all relevant data (e.g., route_id, progress, available_seats).
        current_time (str): Current time in "HH:MM:SS" format.
        pickup_stop_id (str): Stop ID of the pickup location.

    Returns:
        str: Estimated departure time in "HH:MM:SS" format.
    """

    # Use current_datetime to calculate hour
    current_hour = current_time.hour

    # Validate that the current hour exists in `mean_customer_per_hour`
    if current_hour not in mean_customer_per_hour:
        return "Invalid or missing customer data for the current hour"

    # Get the number of available seats from the shift collection
    available_seats = shift.get("available_seats")

    # Get the number of assigned reservations for the next shift
    assigned_reservations, remaining_seats = get_assigned_reservations(shift, shift["route_id"], current_time, available_seats)
    try:
        shift_collection.update_one(
            {"_id": shift["_id"]},  # Match the shift by its unique ID
            {
                "$set": {
                    "reservations_id": [res["reservation_id"] for res in assigned_reservations],
                    "available_seats": remaining_seats
                }
            }
        )
        print(f"[INFO] Updated shift {shift['_id']} with {len(assigned_reservations)} assigned reservations")
    except Exception as e:
        print(f"[ERROR] Failed to update shift {shift['_id']} with reservations: {e}")
        return "Error updating shift with reservations"

    # Calculate the reservation arrival rate (customers per minute)
    customer_arrival_rate = mean_customer_per_hour[current_hour] / 60

    # Calculate the total number of passengers needed to fill the minibus
    passengers_needed = remaining_seats

    # If the minibus is already full or will be full with the current reservations, depart immediately
    if passengers_needed <= 0:
        return current_time

    # Estimate the time required to fill the remaining capacity
    time_to_fill = passengers_needed / customer_arrival_rate  # Time in minutes
    start_time = shift.get("start_time")
    if isinstance(start_time, str):
        start_time = datetime.fromisoformat(start_time)
    estimated_departure_datetime = min(current_time + timedelta(minutes=time_to_fill), start_time + timedelta(minutes=15))

    # Return the estimated departure time
    return estimated_departure_datetime

def estimate_stop_arrival(route_id, stop_index, pickup_stop_id, current_time):
    """
    Estimate the arrival time at a specific stop based on running and waiting shifts.

    Args:
        route_id (str): The ID of the route (e.g., "Route1").
        stop_index (int): The index of the stop to estimate arrival time for.
        pickup_stop_id (str): The stop ID for the pickup location.
        current_time (str): The current time in "HH:MM:SS" format.

    Returns:
        str: The estimated arrival time at the stop in "HH:MM:SS" format.
    """
    
    # Fetch all active shifts for the route
    arrival_times = []
    shift_ids = []
    active_shifts = list(shift_collection.find({"route_id": route_id, "arrival_time": {"$exists": True}}))

    # Filter out shifts with invalid arrival_time
    valid_shifts = []
    for shift in active_shifts:
        arrival_time = shift.get("arrival_time")
        # Convert invalid arrival_time values (e.g., "None", "null", or empty string) to None
        if isinstance(arrival_time, str) and arrival_time.lower() in ["none", "null", ""]:
            shift["arrival_time"] = None
        if shift["arrival_time"] is not None:
            valid_shifts.append(shift)

    # If no valid active shifts are found, fall back to the waiting shift
    if not valid_shifts:
        print(f"[INFO] No valid active shifts found for route '{route_id}'. Using waiting shift.")
        waiting_shift = get_waiting_shift(route_id)
        shift_id = waiting_shift.get("shift_id")
        departure_time = estimate_departure_time(waiting_shift, current_time)
        arrival_times.append(calculate_eta(waiting_shift, stop_index, departure_time))
        shift_ids.append(shift_id)
        return arrival_times, shift_ids

    # Sort valid active shifts by progress (highest progress first)
    valid_shifts = sorted(valid_shifts, key=lambda x: x["progress"], reverse=True)

    # Check for a running shift before this stop
    for shift in valid_shifts:
        if shift["progress"] < stop_index:  # A shift is approaching this stop
            shift_id = shift.get("shift_id")
            print(f"[INFO] Using shift {shift['minibus_id']} to estimate arrival at stop {stop_index}.")
            arrival_times.append(calculate_eta(shift, stop_index, current_time))
            shift_ids.append(shift_id)

    # If no active shift is before the stop, use the waiting shift
    print(f"[INFO] No active shift before stop {stop_index}. Using the waiting shift.")
    waiting_shift = get_waiting_shift(route_id)
    
    # Estimate departure time of the waiting shift
    departure_time = estimate_departure_time(waiting_shift, current_time)
    shift_id = waiting_shift.get("shift_id")
    
    # Use departure time to estimate arrival at the stop
    arrival_times.append(calculate_eta(waiting_shift, stop_index, departure_time))
    shift_ids.append(shift_id)
    return arrival_times, shift_ids

def main_loop():
    """
    Main loop to calculate and output expected arrival times at all 13 stops of Route1.
    Runs every 30 seconds.
    """
    
    route_ids = ["Route1", "Route2", "Route3", "Route4", "Route5", "Route6"]  # List of routes to be monitored
    stop_counts = [13, 13, 18, 9, 14, 16]      # Number of stops on Route1

    while True:
        hong_kong_tz = pytz.timezone("Asia/Hong_Kong")
        current_time = datetime.now(hong_kong_tz)
        print(f"\n[INFO] Main loop running at {current_time}")
        print("[INFO] Calculating expected arrival times for Route1 stops...\n")

        for i in range(len(route_ids)):
            route_id = route_ids[i]
            stop_count = stop_counts[i]
            global travel_time_matrix
            travel_time_matrix = travel_time_list[i]
            
            # Fetch route details
            route = route_collection.find_one({"route_id": route_id})
            stops_info = route.get("stops")
            stop_ids = [stop["stop_id"] for stop in stops_info]
            stops = list(stop_collection.find({"stop_id": {"$in": stop_ids}}))
            stops = sorted(stops, key=lambda stop: next(item["order"] for item in stops_info if item["stop_id"] == stop["stop_id"]))

            # Calculate expected arrival times for each stop
            stop_arrival_times = {}
            stop_shift_ids = {}
            for stop_index, stop in enumerate(stops):
                stop_id = stop["stop_id"]
                if stop_index == 0:
                    stop_name = stop["name"]
                    waiting_shift = get_waiting_shift(route_id)
                    shift_id = waiting_shift.get("shift_id")
                    departure_time = estimate_departure_time(waiting_shift, current_time).strftime("%H:%M:%S")
                    shift_ids = [shift_id]
                    arrival_times = [departure_time]
                    stop_arrival_times[stop_name] = arrival_times
                    stop_shift_ids[stop_name] = shift_ids
                else:
                    stop_name = stop["name"]
                    arrival_times, shift_ids = estimate_stop_arrival(route_id, stop_index, stop["stop_id"], current_time)
                    stop_arrival_times[stop_name] = arrival_times
                    stop_shift_ids[stop_name] = shift_ids
                #TODO: Push arrival times to database
                result = route_collection.update_one(
                    {"route_id": route_id, "stops.stop_id": stop_id},
                    {"$set": 
                        {
                            "stops.$.arrival_times": arrival_times,
                            "stops.$.shift_ids": shift_ids
                        }
                    }
                )
                if result.modified_count > 0:
                    print(f"[INFO] Successfully updated arrival times for stop '{stop_name}' in the database.")
                else:
                    print(f"[WARNING] Failed to update arrival times for stop '{stop_name}' in the database.")
            # Print the arrival times
            print("[INFO] Expected arrival times at Route1 stops:")
            for stop_name, arrival_times in stop_arrival_times.items():
                print(f"  Stop: {stop_name}\n        ETA: {arrival_times}\n")

        # Sleep for 30 seconds before the next iteration
        print("\n[INFO] Sleeping for 30 seconds before the next update...\n\n\n\n\n")
        time.sleep(20)
        
if __name__ == "__main__":
    main_loop()