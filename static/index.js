document.addEventListener("DOMContentLoaded", () => {
  let username = get_username();

  if (username) {
    // connect to socket
    let socket = io.connect(
      location.protocol + "//" + document.domain + ":" + location.port
    );

    socket.on("connect", () => {
      socket.emit("userdata", { username });

      setup(socket);

      socket.on("new channel", data => {
        show_channel(data.name, socket);
      });

      socket.on("msg", data => {
        show_msg(data);
      });

      socket.on("channels", data => {
        for (let c of data) {
          show_channel(c, socket);
        }
      });

      socket.on("msgs", data => {
        clear_msgs();
        data.forEach(msg => {
          show_msg(msg);
        });
      });
    });

    socket.on("duplicate username", () => {
      console.log("disconnection due to duplicate username");
      // TODO
      // localStorage.removeItem("username");
      // get_username(true);
      // window.location.reload(false);
    });
  }
});

const setup = socket => {
  let new_channel_btn = document.querySelector("#add-channel");
  let channel_name_inp = document.querySelector("#channel-name");
  let msg_inp = document.querySelector("#msg-text");
  let msg_send_btn = document.querySelector("#msg-send");

  new_channel_btn.addEventListener("click", () => {
    let name = channel_name_inp.value;

    if (!name) {
      console.log("no name");
      return;
    }

    socket.emit("new channel", { name });
  });

  msg_send_btn.addEventListener("click", () => {
    let msg = msg_inp.value;
    let channel = localStorage.getItem("channel");

    if (!msg) {
      console.log("no msg");
      return;
    }

    if (!channel) {
      console.log("no channel");
      return;
    }

    socket.emit("new msg", {
      msg,
      channel,
      username: localStorage.getItem("username")
    });
  });

  socket.emit("get channels");

  if (localStorage.getItem('channel')) {
      socket.emit("get msgs", { name: localStorage.getItem('channel')})
  }
};

const show_channel = (name, socket) => {
  // grab ul that displays channels
  let ul = document.querySelector(".channel-list");

  let li = document.createElement("li");

  li.innerHTML = name;

  li.addEventListener("click", () => {
    localStorage.setItem("channel", name);

    socket.emit("get msgs", { name });
  });

  ul.appendChild(li);
};

const clear_msgs = () => {
  let ul = document.querySelector(".msg-list");
  ul.innerHTML = "";
};

const show_msg = data => {
  if (localStorage.getItem("channel") == data.channel) {
    let ul = document.querySelector(".msg-list");
    let li = document.createElement("li");

    li.innerHTML = `${data.username} : ${data.msg} <small>- ${
      data.created_at
    }</small>`;
    ul.appendChild(li);
  }
};

const get_username = (dup = false) => {
  // get user display name
  let username = localStorage.getItem("username");

  while (!username) {
    if (dup) {
      username = prompt(
        "YOU ENTERTED DUPLICATE USERNAME, enter new username: "
      );
    } else {
      username = prompt("Enter your name: ");
    }

    if (typeof username == "string") {
      username = username.trim();
      if (username == "") {
        username = null;
      } else {
        localStorage.setItem("username", username);
      }
    }
  }

  return username;
};
