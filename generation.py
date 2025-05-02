from pymongo import MongoClient
from datetime import datetime, timedelta
import random
import time
from math import radians, cos, sin, sqrt, atan2
import pytz
import string

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
    6:  15,
    7:  30,
    8:  40,
    9:  30,
    10: 25,
    11: 20,
    12: 25,
    13: 35,
    14: 25,
    15: 30,
    16: 25,
    17: 30,
    18: 40,
    19: 40,
    20: 35,
    21: 30,
    22: 25,
    23: 20,
}

def interpolate_location(lat1, lon1, lat2, lon2, proportion):
    """Interpolate the location between two points."""
    
    lat = lat1 + (lat2 - lat1) * proportion
    lon = lon1 + (lon2 - lon1) * proportion
    return lat, lon


def update_shifts():
    """Fetch and update all shifts for all routes."""

    for i in range(len(travel_time_list)):
        travel_time_matrix = travel_time_list[i]
        route_id = f"Route{i+1}"
        print(f"[INFO] Starting shift updates for route {route_id}.")

        # Fetch the route details
        route = route_collection.find_one({"route_id": route_id})
        if not route:
            print(f"[ERROR] Route {route_id} not found.")
            return

        # Fetch and sort stops
        stops_info = route.get("stops", [])
        stop_ids = [stop["stop_id"] for stop in stops_info]
        stops = list(stop_collection.find({"stop_id": {"$in": stop_ids}}))
        stops = sorted(stops, key=lambda stop: next(item["order"] for item in stops_info if item["stop_id"] == stop["stop_id"]))

        print(f"[DEBUG] Stops for route {route_id}:")
        for stop in stops:
            print(f"  - Stop {stop['name']} (Latitude: {stop['latitude']}, Longitude: {stop['longitude']})")

        # Validate stops
        if not stops:
            print(f"[ERROR] No stops found for route {route_id}. Cannot update shifts.")
            return

        # Validate travel time matrix completeness
        for hour, travel_times in travel_time_matrix.items():
            if len(travel_times) < len(stops) - 1:
                print(f"[WARNING] Travel time matrix for hour {hour} is incomplete. Adding default travel times.")
                travel_time_matrix[hour] += [1] * (len(stops) - 1 - len(travel_times))  # Add defaults if missing

        # Fetch all active shifts with a valid arrival_time
        shifts = list(shift_collection.find({"route_id": route_id, "arrival_time": {"$exists": True}}))
        print(f"[INFO] Found {len(shifts)} active shifts for route {route_id}.")

        for shift in shifts:
            try:
                print(f"\n[INFO] Processing shift {shift['_id']} with progress {shift['progress']}.")

                progress = shift["progress"]
                # Completed shifts should not be processed
                if progress >= len(stops) - 1:
                    arrival_time = shift.get("arrival_time")
                    if arrival_time:
                        if isinstance(arrival_time, str):
                            arrival_time = datetime.fromisoformat(arrival_time)

                        # Calculate how long the shift has been at the final stop
                        time_at_final_stop = (current_time - arrival_time).total_seconds() / 60.0  # Convert to minutes

                        if time_at_final_stop > 2:
                            print(f"[INFO] Removing completed shift {shift['_id']} for route {route_id}. "
                                  f"Minibus has been at the final stop for {time_at_final_stop:.2f} minutes.")
                            shift_collection.delete_one({"_id": shift["_id"]})
                            continue  # Move to the next shift
                hong_kong_tz = pytz.timezone("Asia/Hong_Kong")
                current_time = datetime.now(hong_kong_tz)

                print(f"[DEBUG] Current time (Hong Kong): {current_time.isoformat()}")

                # Parse and validate arrival_time and start_time
                arrival_time = shift.get("arrival_time")
                start_time = shift.get("start_time")

                if isinstance(arrival_time, str) and arrival_time.lower() in ["none", "null", ""]:
                    arrival_time = None

                if not arrival_time:
                    print(f"[WARNING] Shift {shift['_id']} has invalid 'arrival_time' or 'start_time'. Skipping.")
                    print(f"[DEBUG] Start time: {start_time}, Arrival time: {arrival_time}")
                    continue

                if isinstance(arrival_time, str):
                    arrival_time = datetime.fromisoformat(arrival_time)
                if isinstance(start_time, str):
                    start_time = datetime.fromisoformat(start_time)

                # Total time for the entire route
                total_route_time = (arrival_time - start_time).total_seconds() / 60.0

                # Elapsed time since the start of the route
                elapsed_time = (current_time - arrival_time).total_seconds() / 60.0
                current_hour = current_time.hour

                print(f"[DEBUG] Start Time: {start_time.isoformat()}")
                print(f"[DEBUG] Arrival Time: {arrival_time.isoformat()}")
                print(f"[DEBUG] Elapsed Time: {elapsed_time:.2f} mins")
                print(f"[DEBUG] Total Route Time: {total_route_time:.2f} mins")
                print(f"[DEBUG] Current Hour: {current_hour}")

                # Fetch travel times for the current hour
                travel_times = travel_time_matrix.get(current_hour, [])

                # Validate travel times
                if not travel_times or len(travel_times) < len(stops) - 1:
                    print(f"[ERROR] Travel time matrix for hour {current_hour} is invalid or incomplete.")
                    continue

                print(f"[DEBUG] Travel times for hour {current_hour}: {travel_times}")

                # Update progress based on elapsed time
                while progress < len(stops)-1 and elapsed_time >= travel_times[progress]:
                    # Move to the next stop
                    progress += 1

                    if progress == len(stops):
                        print(f"[INFO] Shift {shift['_id']} has reached the final stop and completed its route.")
                        shift_collection.update_one({"_id": shift["_id"]}, {"$set": {"status": "completed"}})
                        continue
                    elapsed_time -= travel_times[progress - 1]
                    current_stop_arrival_time = start_time + timedelta(minutes=sum(travel_times[:progress]))

                    # Update available seats based on the progress randomly
                    seats = shift.get("available_seats", 0)
                    if int(seats) < 5:
                        available_seats = int(seats) + random.randint(1, 3)
                    elif int(seats) < 10:
                        available_seats = int(seats) + random.randint(1, 2)
                    else:
                        available_seats = int(seats) + random.randint(0, 1)
                    available_seats = min(available_seats, 16)
                    
                    # Update the shift's progress and arrival_time in the database
                    result = shift_collection.update_one({"_id": shift["_id"]}, {"$set": {
                        "progress": progress,
                        "arrival_time": current_stop_arrival_time.isoformat(),
                        "available_seats": available_seats,  # Decrease available seats
                    }})
                    if result.modified_count == 0:
                        print(f"[ERROR] Failed to update progress for shift {shift['_id']}.")

                    print(f"[INFO] Shift {shift['_id']} reached {stops[progress]['name']} (progress: {progress}).")
                    print(f"[INFO] Updated arrival time for {stops[progress]['name']}: {current_stop_arrival_time.isoformat()}")

                # Interpolate location if the shift is between two stops
                if progress < len(stops) - 1:
                    stop_lat, stop_lon = stops[progress]["latitude"], stops[progress]["longitude"]
                    next_stop_lat, next_stop_lon = stops[progress + 1]["latitude"], stops[progress + 1]["longitude"]

                    # Proportion of the distance traveled between the current and next stop
                    segment_travel_time = travel_times[progress]
                    proportion = elapsed_time / segment_travel_time if segment_travel_time > 0 else 0
                    shift["latitude"], shift["longitude"] = interpolate_location(stop_lat, stop_lon, next_stop_lat, next_stop_lon, proportion)

                    shift_collection.update_one({"_id": shift["_id"]}, {"$set": {
                        "latitude": shift["latitude"],
                        "longitude": shift["longitude"]
                    }})
                    print(f"[DEBUG] Interpolated Location: Latitude={shift['latitude']}, Longitude={shift['longitude']}")

            except Exception as e:
                print(f"[ERROR] An error occurred while processing shift {shift['_id']}: {e}")

        print(f"[INFO] Completed updates for {len(shifts)} shifts.")
    
def create_new_shift(route_id):
    """Create a new shift at the starting station."""
    
    # Fetch the route details
    route = route_collection.find_one({"route_id": route_id})
    if not route:
        print(f"[ERROR] Route {route_id} not found.")
        return None

    # Get the starting station (first stop on the route)
    stops_info = route.get("stops")
    stop_ids = [stop["stop_id"] for stop in stops_info]
    stops = list(stop_collection.find({"stop_id": {"$in": stop_ids}}))
    stops = sorted(stops, key=lambda stop: next(item["order"] for item in stops_info if item["stop_id"] == stop["stop_id"]))
    starting_stop = stops[0]

    hong_kong_tz = pytz.timezone("Asia/Hong_Kong")
    current_time = datetime.now(hong_kong_tz)
    
    # Create a new shift at the starting station
    letters = ''.join(random.choices(string.ascii_uppercase, k=2))
    numbers = ''.join(random.choices(string.digits, k=4))
    minibus_id = f"{letters}{numbers}"
    new_shift = {
        "route_id": route_id,
        "progress": 0,  # Starting progress
        "latitude": starting_stop["latitude"],  # Location of the starting stop
        "longitude": starting_stop["longitude"],  # Location of the starting stop
        "available_seats": 16,  # Full capacity of the minibus
        "reservations_id": [],  # No reservations yet
        "start_time": current_time.isoformat(),  # Not started yet
        "arrival_time": None,  # Not moving yet
        "minibus_id": minibus_id,  # Unique ID for the minibus
        "trip_id": f"TRIP-{random.randint(0000, 9999)}",
        "shift_id": f"SHIFT-{random.randint(0000, 9999)}"
    }
    
    # Insert the new shift into the database
    shift_collection.insert_one(new_shift)
    print(f"[INFO] Created a new shift {minibus_id} at the starting station {starting_stop['name']}.")
    return new_shift

def simulate_shift_waiting(shift, route_id, elapsed_seconds=20):
    """
    Simulate a shift waiting at the starting station.
    - Customers arrive based on the elapsed time and the mean_customer_per_hour.
    - The shift departs when it becomes full, and a new shift is created.

    Args:
        shift (dict): The shift currently waiting at the starting station.
        route_id (str): The ID of the route the shift belongs to.
        elapsed_seconds (int): Time elapsed since the last update, in seconds.
    """
    # Fetch the route details
    route = route_collection.find_one({"route_id": route_id})
    if not route:
        print(f"[ERROR] Route {route_id} not found.")
        return

    # Fetch the stops and get the starting station
    stops_info = route.get("stops")
    stop_ids = [stop["stop_id"] for stop in stops_info]
    stops = list(stop_collection.find({"stop_id": {"$in": stop_ids}}))
    stops = sorted(stops, key=lambda stop: next(item["order"] for item in stops_info if item["stop_id"] == stop["stop_id"]))
    starting_stop = stops[0]

    # Get the current hour and customer arrival rate
    hong_kong_tz = pytz.timezone("Asia/Hong_Kong")
    current_time = datetime.now(hong_kong_tz)
    current_hour = datetime.now(hong_kong_tz).hour
    customer_rate_per_hour = mean_customer_per_hour.get(current_hour)  # Default to 1 customer per minute

    # Calculate the expected number of customers arriving in the elapsed time
    n = 1000 # Adjust to simulate different customer arrival rates
    expected_customer = (customer_rate_per_hour/n) * elapsed_seconds
    if expected_customer < 1:
        if (random.random() < expected_customer):
            boarded_customer = 1
        else:
            boarded_customer = 0
    else:
        boarded_customer = int(expected_customer)
        fractional_part = expected_customer - int(expected_customer)
        if random.random() < fractional_part:
            boarded_customer += 1
            
    customers_boarding = min(boarded_customer, shift["available_seats"])

    # Update the shift's available seats
    shift["available_seats"] -= customers_boarding

    # Print status
    print(f"[INFO] {customers_boarding} customers boarded the shift {shift['minibus_id']} at {starting_stop['name']}.")
    print(f"[INFO] Available seats: {shift['available_seats']}.")

    # Update the shift in the database
    shift_collection.update_one({"_id": shift["_id"]}, {"$set": {"available_seats": shift["available_seats"]}})

    # If the minibus is full, the shift should depart
    if shift["available_seats"] == 0:
        print(f"[INFO] Shift {shift['minibus_id']} is full and ready to depart.")

        # Update the shift with departure details
        shift_collection.update_one({"_id": shift["_id"]}, {"$set": {
            "arrival_time": current_time.isoformat()
        }})

        print(f"[INFO] Shift {shift['minibus_id']} departed at {current_time.isoformat()}.")

        # Create a new shift at the starting station
        create_new_shift(route_id)
    
    start_time = shift.get("start_time")
    if start_time:
        start_time = datetime.fromisoformat(start_time)
        waiting_time = (current_time - start_time).total_seconds() / 60  # Convert to minutes
        if waiting_time > 25:
            print(f"[INFO] Shift {shift['minibus_id']} has waited more than 25 minutes and is ready to depart.")
            shift_collection.update_one({"_id": shift["_id"]}, {"$set": {
                "arrival_time": current_time.isoformat()
            }})
            create_new_shift(route_id)
            return
        

def main_loop():
    """Main loop to update shifts and simulate customer arrivals every 20 seconds."""

    while True:
        hong_kong_tz = pytz.timezone("Asia/Hong_Kong")
        current_time = datetime.now(hong_kong_tz)
        print(f"[INFO] Main loop running at {current_time.isoformat()}")

        # 1. Update active shifts on the route (those in progress)
        update_shifts()

        # 2. Check for a waiting shift at the starting station
        for i in range(len(travel_time_list)):
            route_id = f"Route{i+1}"
            travel_time_matrix = travel_time_list[i]
            waiting_shift = shift_collection.find_one({"route_id": route_id, "progress": 0, "arrival_time": None})
            if waiting_shift:
                print(f"[INFO] Simulating shift {waiting_shift['minibus_id']} waiting at the starting station.")
                simulate_shift_waiting(waiting_shift, route_id, elapsed_seconds=20)
            else:
                print("[INFO] No shift is currently waiting at the starting station. Creating a new shift.")
                create_new_shift(route_id)

        # Wait for 20 seconds before the next loop iteration
        print("[INFO] Sleeping for 20 seconds...\n\n\n\n\n")
        time.sleep(20)
        
if __name__ == "__main__":
    main_loop()