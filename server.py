from flask import Flask, render_template, request, session, redirect, url_for
from flask_socketio import SocketIO, emit
import random
import secrets

# helper functions
def generate_gameid():
    words = [
        'ace', 'add', 'age', 'air', 'ale', 'and', 'ant', 'ape', 'apt', 'ark',
        'bad', 'ban', 'bat', 'bed', 'bee', 'big', 'bin', 'bit', 'boa', 'bug',
        'cab', 'cam', 'cap', 'car', 'cat', 'cob', 'cod', 'cot', 'cow', 'cue',
        'dad', 'dam', 'day', 'den', 'dew', 'did', 'dig', 'dim', 'doe', 'dog',
        'ear', 'eat', 'egg', 'elf', 'elk', 'end', 'eon', 'era', 'eve', 'eye',
        'fad', 'fan', 'far', 'fat', 'fig', 'fin', 'fit', 'fix', 'fly', 'fog',
        'gag', 'gap', 'gas', 'gel', 'gem', 'get', 'gig', 'gin', 'god', 'gum',
        'had', 'ham', 'hat', 'hen', 'hey', 'hid', 'hip', 'hit', 'hot', 'hug',
        'ice', 'ink', 'ion', 'ire', 'ivy', 'jab', 'jam', 'jar', 'jaw', 'jet',
        'keg', 'key', 'kid', 'kit', 'lab', 'lap', 'law', 'lay', 'leg', 'let',
        'mad', 'man', 'map', 'mat', 'met', 'mug', 'mum', 'nab', 'nap', 'net',
        'oak', 'odd', 'off', 'oil', 'old', 'one', 'orb', 'owe', 'owl', 'own',
        'pad', 'pan', 'pea', 'peg', 'pen', 'per', 'pet', 'pig', 'pin', 'pod',
        'qua', 'rag', 'ram', 'ran', 'rap', 'red', 'rib', 'rid', 'rig', 'rim',
        'sag', 'sap', 'sat', 'sea', 'see', 'set', 'sin', 'sip', 'sir', 'ski',
        'tab', 'tan', 'tap', 'tar', 'tea', 'ten', 'tie', 'tin', 'tip', 'top',
        'urn', 'use', 'van', 'vat', 'vet', 'via', 'web', 'wet', 'wig', 'win',
        'yak', 'yam', 'yap', 'yen', 'yes', 'yet', 'yew', 'yin', 'yip', 'zap'
    ]

    nums = []
    selected = []
    gameid = ''
    for i in range(3):
        num = num = random.randint(0, len(words) - 1)
        while num in nums:
            num = random.randint(0, len(words) - 1)
        nums.append(num)
        word = words[num]

        if i == 2:
            gameid = gameid + word
        else:
            gameid = gameid + word + '-'

    return gameid


# create a Flask and socketIO app
app = Flask(__name__, static_folder='static')
app.config['SECRET_KEY'] = 'secret_key12'
socketio = SocketIO(app)
rooms = {}

# define flask url routes
@app.route('/u-ttt')
def index():
    return render_template('index.html')

@app.route('/u-ttt/local')
def local(): 
    return render_template('local.html')

@app.route('/u-ttt/<gameid>')
def game_page(gameid):
    return render_template('online.html')







# define socketio events

# index page
@socketio.on('online_request')
def online():
    gameid = generate_gameid()
    while gameid in rooms:
        gameid = generate_gameid()
    
    room = {
        'members': [], # [sessionid, playerid]
        'moves': [] # [playerid, move]
    }
    rooms[gameid] = room
    emit('online_response', { 'gameid': gameid })

@socketio.on('join_request')
def join(data):
    gameid = data['gameid']
    if gameid not in rooms:
        emit('join_error', { 'message': 'invalid game code' } )
        return

    if len((rooms[gameid])['members']) == 2:
        emit('join_error', {'message': 'game is full'} )
        return
    
    emit('join_response', { 'gameid': gameid } )

# online page
@socketio.on('connect')
def connect(data):
    sessionid = request.sid
    session['sessionid'] = sessionid
    emit('connection_response', { 'sessionid': sessionid })

@socketio.on('game_connect')
def game_connect(data):
    sessionid = request.sid
    gameid = data['gameid']

    if gameid not in rooms: # invalid gameid
        emit('join_error', { 'message': 'invalid gameid' })
        return
    
    if len(rooms[gameid]['members']) == 2: # game lobby is full
        emit('join_error', { 'message': 'game lobby full' })
        return
    
    if len(rooms[gameid]['members']) == 0:
        playerid = 'X'
    else: 
        playerid = 'O'
    rooms[gameid]['members'].append([sessionid, playerid])  

    for member in rooms[gameid]['members']:
        sessionid, playerid = member[0], member[1]
        print(sessionid)
        payLoad = { 'playerid': playerid, 'moves': rooms[gameid]['moves'] }
        emit('game_connect_response', payLoad, room=sessionid)

    if len(rooms[gameid]['members']) == 2:
        member = rooms[gameid]['members'][0]
        sessionid = member[0]
        emit('join_response', room=sessionid)

@socketio.on('play')
def play(data):
    sessionid = request.sid
    gameid = data['gameid']
    move = data['move']
    rooms[gameid]['moves'].append(move)

    for member in rooms[gameid]['members']:
        sessionid_to_send = member[0]
        if sessionid_to_send != sessionid:
            payLoad = { 'move': move }
            emit('play_response', payLoad, room=sessionid_to_send)

@socketio.on('game_reconnect')
def game_reconnect(data):
    gameid = data['gameid']
    oldSessionid = data['oldSessionID']
    sessionid = request.sid

    if gameid not in rooms:
        emit('join_error', { 'message': 'invalid game code' })
        return

    members = rooms[gameid]['members']
    moves = rooms[gameid]['moves']

    for i in range(len(members)):
        member = members[i]
        removeSessionid = member[0]
        playerid = member[1]

        if removeSessionid == oldSessionid:
            members[i] = [sessionid, playerid]
            payLoad = {
                'sessionid': sessionid,
                'playerid': playerid,
                'moves': moves
            }
            emit ('game_reconnect_response', payLoad)


# Flask app
if __name__ == '__main__':
    socketio.run(app, port=8000, debug=True)