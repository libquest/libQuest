import datetime
import json
import random
import secrets
import string
import threading
import time

import pymongo as pymongo
from flask import Flask, request, Response
from flask_sock import Sock
from flask_cors import CORS

app = Flask('app')
sock = Sock(app)

quiz_sessions = {}

manager_keys = {}

player_keys = {}

client = pymongo.MongoClient(
    "mongodb+srv://SERVERONLY:oTLRlTgauH2Sm0M4@cluster0.cepv6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority")
quizzes = client.libquest.quizzes

CORS(app)

@app.route('/uploadquiz')
def add_big_pack():
    args = request.args
    pack = json.loads(args["pack"])
    author = args["author"]
    quizzes.insert_one({"pack": json.dumps(pack), "author": author, "date": datetime.datetime.utcnow()})


def get_big_pack(quiz_id):
    return json.loads(quizzes.find_one({"_id": quiz_id})["pack"])


def serve_app():
    app.run(host='0.0.0.0', port=5000)


@app.route('/')
def home():
    return 'libquest by john (stefan) o\'meara and sajjaad farzad'


@sock.route('/responseslengthfeed')
def ws_responses_length(ws):
    join_code = ""
    while True:
        if join_code == "":
            join_code = str(ws.receive())
        else:
            ws.send(len(quiz_sessions[join_code]["users"]) - sum(
                map((-1).__eq__, [d['selected_answer_index'] for d in quiz_sessions[join_code]["users"].values()])))
            time.sleep(0.05)


@sock.route('/wsconnect')
def wsconnect(ws):
    authenticated = False
    user_id = ""
    join_code = ""
    prev_globalping = ""
    prev_message = ""
    while True:
        if authenticated:
            if prev_globalping != quiz_sessions[join_code]["globalping"]:
                ws.send(quiz_sessions[join_code]["globalping"])
                prev_globalping = quiz_sessions[join_code]["globalping"]
            if prev_message != quiz_sessions[join_code]["users"][user_id]["message"]:
                ws.send(quiz_sessions[join_code]["users"][user_id]["message"])
                prev_message = quiz_sessions[join_code]["users"][user_id]["message"]
        text = str(ws.receive())
        if not authenticated:
            if text in player_keys.keys():
                user_id = player_keys[text][0]
                join_code = player_keys[text][1]
                authenticated = True
                ws.send("OK")
            else:
                ws.send("INVALID")
                ws.close()
        elif text == "started":
            ws.send(quiz_sessions[join_code]["started"])
        elif text == "availability":
            ws.send(quiz_sessions[join_code]["availability"])
        elif text == "question_index":
            ws.send(quiz_sessions[join_code]["question_index"])
        elif text == "points":
            ws.send(quiz_sessions[join_code]["users"][user_id]["points"])
        elif text == "streak":
            ws.send(quiz_sessions[join_code]["users"][user_id]["streak"])
        elif quiz_sessions[join_code]["availability"]:
            if text == "0":
                quiz_sessions[join_code]["users"][user_id]["selected_answer_index"] = 0
                quiz_sessions[join_code]["users"][user_id]["question_answered"] = time.time_ns() // 1_000_000
            elif text == "1":
                quiz_sessions[join_code]["users"][user_id]["selected_answer_index"] = 1
                quiz_sessions[join_code]["users"][user_id]["question_answered"] = time.time_ns() // 1_000_000
            elif text == "2":
                quiz_sessions[join_code]["users"][user_id]["selected_answer_index"] = 2
                quiz_sessions[join_code]["users"][user_id]["question_answered"] = time.time_ns() // 1_000_000
            elif text == "3":
                quiz_sessions[join_code]["users"][user_id]["selected_answer_index"] = 3
                quiz_sessions[join_code]["users"][user_id]["question_answered"] = time.time_ns() // 1_000_000


@app.route('/setquestionavailability')
def set_question_availability():
    args = request.args
    join_code = args["join_code"]
    manager_key = args["manager_key"]
    availability = args["availability"]
    question_index = int(args["index"])
    if manager_keys[join_code] == manager_key:
        quiz_sessions[join_code]["question_index"] = question_index
        quiz_sessions[join_code]["availability"] = json.loads(availability.lower())
    if quiz_sessions[join_code]["availability"]:
        quiz_sessions[join_code]["question_started"] = time.time_ns() // 1_000_000
        websocket_sendmsg(join_code, "*", "newquestion")
    else:
        websocket_sendmsg(join_code, "*", "reset")
        quiz_sessions[join_code]["responses"] = {
            0: 0,
            1: 0,
            2: 0,
            3: 0
        }
        grade_responses(join_code, question_index)
    response = {"availability": quiz_sessions[join_code]["availability"]}
    return Response(json.dumps(response), mimetype='application/json')


def grade_responses(join_code, question_index):
    question_answer_index = quiz_sessions[join_code]["big_pack"]["questions"][question_index]["answer_index"]
    users = quiz_sessions[join_code]["users"]
    for user_id in users:
        user = users[user_id]
        selected_answer_index = user["selected_answer_index"]
        if selected_answer_index != -1:
            quiz_sessions[join_code]["responses"][selected_answer_index] += 1
        correct = question_answer_index == selected_answer_index
        if correct:
            pointsawarded = 1000 - (
                    quiz_sessions[join_code]["users"][user_id]["question_answered"] - quiz_sessions[join_code][
                "question_started"]) / 10
            if pointsawarded < 100:
                pointsawarded = 100
            quiz_sessions[join_code]["users"][user_id]["points"] += pointsawarded
            quiz_sessions[join_code]["users"][user_id]["streak"] += 1
            websocket_sendmsg(join_code, user_id, "correct")
        else:
            quiz_sessions[join_code]["users"][user_id]["streak"] = 0
            websocket_sendmsg(join_code, user_id, "incorrect")
    sorted_users = {}
    for i in range(len(quiz_sessions[join_code]["users"])):
        max = 0
        max_obj = {}
        max_user_id = ""
        for user_id in quiz_sessions[join_code]["users"]:
            if quiz_sessions[join_code]["users"][user_id]["points"] > max:
                max = quiz_sessions[join_code]["users"][user_id]["points"]
                max_obj = quiz_sessions[join_code]["users"][user_id]
                max_obj["rank"] = i + 1
                max_user_id = user_id
        if max_user_id != "":
            sorted_users[max_user_id] = max_obj
            del quiz_sessions[join_code]["users"][max_user_id]
        else:
            x = list(quiz_sessions[join_code]["users"].values())[0]
            x["rank"] = i + 1
            sorted_users[list(quiz_sessions[join_code]["users"].keys())[0]] = x
            del quiz_sessions[join_code]["users"][list(quiz_sessions[join_code]["users"].keys())[0]]
    quiz_sessions[join_code]["users"] = sorted_users



def websocket_sendmsg(join_code, user_id, msg):
    if user_id == "*":
        quiz_sessions[join_code]["globalping"] = msg
    else:
        quiz_sessions[join_code]["users"][user_id]["message"] = msg


@app.route('/getquestionstats')
def get_question_stats():
    args = request.args
    join_code = args["join_code"]
    question_index = int(args["index"])
    question_stats = {
        "answer_index": quiz_sessions[join_code]["big_pack"]["questions"][question_index]["answer_index"],
        "responses": quiz_sessions[join_code]["responses"]
    }
    return Response(json.dumps(question_stats), mimetype='application/json')


@app.route('/createquizsession')
def create_quiz_session():
    args = request.args
    quiz_id = args["quiz_id"]
    session = {"join_code": ''.join(random.choice(string.digits) for _ in range(7)),
               "big_pack": get_big_pack(quiz_id),
               "users": {},
               "started": False,
               "availability": False,
               "question_index": 0,
               "responses": {},
               "globalping": ""}
    while session["join_code"] in quiz_sessions.keys():
        session["join_code"] = ''.join(random.choice(string.digits) for _ in range(7))
    quiz_sessions[session["join_code"]] = session
    print("Started new quiz session (" + quiz_id + ") :: the join code is " + session["join_code"])
    manager_key = secrets.token_hex(20)
    response = {"manager_key": manager_key, "session": session}
    manager_keys[session["join_code"]] = manager_key
    return Response(json.dumps(response), mimetype='application/json')


@app.route('/getquizsession')
def get_quiz_session():
    try:
        args = request.args
        join_code = args["join_code"]
        return Response(json.dumps(quiz_sessions[join_code]), mimetype='application/json')
    except KeyError:
        return Response("PIN not found", mimetype='application/json', status=400)


@app.route('/quizsessionexists')
def quiz_session_exists():
    args = request.args
    join_code = args["join_code"]
    response = {"exists": join_code in quiz_sessions.keys()}
    return Response(json.dumps(response), mimetype='application/json')


@app.route('/startquizsession')
def start_quiz_session():
    args = request.args
    join_code = args["join_code"]
    manager_key = args["manager_key"]
    if manager_keys[join_code] == manager_key:
        quiz_sessions[join_code]["started"] = time.time_ns() // 1_000_000
    response = {"started": quiz_sessions[join_code]["started"]}
    return Response(json.dumps(response), mimetype='application/json')


@app.route('/joinquizsession')
def join_quiz_session():
    args = request.args
    join_code = args["join_code"]
    name = args["name"]
    if name not in quiz_sessions[join_code]["users"].keys():
        id = secrets.token_hex(20)
        player_key = secrets.token_hex(20)
        quiz_sessions[join_code]["users"][id] = {
            "name": name,
            "rank": -1,
            "points": 0,
            "streak": 0,
            "selected_answer_index": -1,
            "message": ""
        }
        player_keys[player_key] = (id, join_code)
        return Response(json.dumps({"id": id, "key": player_key, "session": quiz_sessions[join_code]}),
                        mimetype='application/json')
    response = {"error": "That name is taken, try something different."}
    return Response(json.dumps(response), mimetype='application/json')


def bg():
    print("libquest backend")


if __name__ == '__main__':
    threading.Thread(target=serve_app).start()
    bg()
