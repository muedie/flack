document.addEventListener("DOMContentLoaded", () => {
  get_username();
});

const init = username => {
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
      clear_channels();
      for (let c of data) {
        show_channel(c, socket);
      }

      // initial active channel
      show_active_channel(localStorage.getItem("channel"));
      change_msg_title(localStorage.getItem("channel"));
    });

    socket.on("msgs", data => {
      clear_msgs();
      data.forEach(msg => {
        show_msg(msg);
      });
    });
  });
};

const setup = socket => {
  let channel_form = document.querySelector("#channel-form");
  let channel_name_inp = document.querySelector("#channel-name");
  let msg_inp = document.querySelector("#msg-text");
  let msg_form = document.querySelector("#msg-form");

  channel_form.addEventListener("submit", e => {
    // no reload
    e.preventDefault();

    let name = channel_name_inp.value;

    if (!name) {
      console.log("no name");
      return;
    }

    socket.emit("new channel", { name });

    channel_name_inp.value = "";
  });

  msg_form.addEventListener("submit", e => {
    // no reloading
    e.preventDefault();

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

    msg_inp.value = "";
  });

  socket.emit("get channels");

  if (localStorage.getItem("channel")) {
    socket.emit("get msgs", { name: localStorage.getItem("channel") });
  }
};

const show_channel = (name, socket) => {
  // grab ul that displays channels
  let ul = document.querySelector("#channel-list");

  let li = document.createElement("li");

  li.classList.add("list-group-item");
  li.innerHTML = name;

  li.addEventListener("click", () => {
    localStorage.setItem("channel", name);

    socket.emit("get msgs", { name });

    change_msg_title(name);

    // color active channel
    show_active_channel(name);
  });

  ul.appendChild(li);
};

const change_msg_title = title_name => {
  // change title
  if (title_name) {
    let title = document.querySelector("#channel-label");
    title.innerHTML = '<span class="text-muted"># </span>' + title_name;
  }
};

const show_active_channel = name => {
  document.querySelectorAll("#channel-list > li").forEach(e => {
    if (e.innerHTML == name) {
      e.classList.add("active");
    } else {
      e.classList.remove("active");
    }
  });
};

const clear_channels = () => {
  let ul = document.querySelector("#channel-list");
  ul.innerHTML = "";
};

const clear_msgs = () => {
  let ul = document.querySelector("#msg-list");
  ul.innerHTML = "";
};

const show_msg = data => {
  if (localStorage.getItem("channel") == data.channel) {
    let ul = document.querySelector("#msg-list");
    let li = document.createElement("li");

    li.classList.add("list-group-item");

    li.innerHTML = `<strong>${data.username}</strong>: ${
      data.msg
    } <small class="text-muted d-flex justify-content-end">${get_date_string(
      data.created_at
    )}</small>`;
    ul.appendChild(li);

    // scroll msg-list
    ul.scrollTop = ul.scrollHeight - ul.clientHeight;
  }
};

const get_username = () => {
  // get user display name
  let username = localStorage.getItem("username");

  if (!username) {
    $(".modal").modal({ show: true, backdrop: "static" });

    document.querySelector("#username-form").addEventListener("submit", e => {
      e.preventDefault();

      username = document.querySelector("#username-text").value;

      console.log(username);

      if (typeof username == "string") {
        username = username.trim();
        if (username == "") {
          username = null;
        } else {
          localStorage.setItem("username", username);
          $(".modal").modal("hide");

          init(username);
        }
      }
    });
  } else {
    init(username);
  }
};

const get_date_string = time => {
  time = new Date(time * 1000);

  let m_string = `${time.toDateString().split(" ")[1]} ${time.getDate()}`;

  if (time.getFullYear() != new Date().getFullYear()) {
    m_string += `, ${time.getFullYear()}`;
  }

  return `${time.toLocaleString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true
  })} | ${m_string}`;
};
