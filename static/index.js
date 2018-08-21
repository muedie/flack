document.addEventListener("DOMContentLoaded", () => {

    // get user display name
    let username = localStorage.getItem('username');

    while (!username) {
        username = prompt("Enter your name: ");
        
        if (typeof(username) == 'string') {
            username = username.trim()
            if (username == ''){
                username = null
            } else {
                localStorage.setItem('username', username)
            }
        }
    }

    if (username) {
        // connect to socket
        let socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

        socket.on('connect', () => {
            socket.emit('userdata', { username })
        });

        socket.on('new channel', (data) => {
            console.log('new channel', data)
        });
    }
});