// // Include it and extract some methods for convenience
// const server = require('server');
// const { get, post } = server.router;

// // Launch server with options and a couple of routes
// server({ port: 8080 }, [
//   get('/', ctx => "test"),
//   post('/', ctx => console.log(ctx.data))
// ]);

const server = require('server');
const { get, socket } = server.router;
server(
  get('/', ctx => ctx.res.render('home')),
  socket('connect', ctx => ctx.io.emit('connected', ctx.socket.id)),
  socket('message', ctx => ctx.io.emit('message', ctx.data))
);