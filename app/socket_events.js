// Socket.io events

var players = {},
    sockets = {},
    nextId = 0;

module.exports = function(io, socket) {
    var player;

    socket.on('logon', function(data) {
        if (!socket.handshake.session || !socket.handshake.session.user) {
            socket.disconnect();
            return;
        }
        var player_id = data._id || nextId++;
        sockets[player_id] = socket;

        // Create the player
        player = {
            _id: player_id,
            name: socket.handshake.session.user.username,
            x: data.x,
            y: data.y,
            direction: data.direction || {
                y: 'down'
            }
        };

        // Send existing players to client
        socket.emit('players', players);

        // Send the new player to other clients
        socket.broadcast.emit('connected', player);

        // Add client to list of players
        players[player_id] = player;
    });

    socket.on('move', function(data) {
        if (player) {
            player.x = data.x;
            player.y = data.y;
            player.direction = data.direction;

            // Broadcast position change to all other clients
            socket.broadcast.emit('moved', player);
        }
    });

    socket.on('shot', function(data) {
        if (player) {
            data._id = player._id;
            socket.broadcast.emit('shotFired', data);
        }
    });

    socket.on('kills', function(data) {

        socket.broadcast.emit('kills', data);

    });

    socket.on('disconnect', function() {
        if (player) {
            delete players[player._id];
        }
        io.emit('disconnected', player);
    });
};