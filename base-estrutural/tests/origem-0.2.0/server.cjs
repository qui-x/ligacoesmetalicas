const http = require("http"),
  fs = require("fs"),
  path = require("path");
let offline = false;
const root = path.resolve(__dirname, "..");
exports.start = (tls = null) =>
  new Promise((resolve) => {
    const handler = (req, res) => {
      if (offline) {
        req.socket.destroy();
        return;
      }
      let name;
      try {
        name = decodeURIComponent(req.url.split("?")[0]);
      } catch (_) {
        res.writeHead(400);
        return res.end();
      }
      const file = path.resolve(
        root,
        "." + (name === "/" ? "/index.html" : name),
      );
      if (!file.startsWith(root + path.sep)) {
        res.writeHead(403);
        return res.end();
      }
      fs.readFile(file, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end("Not found");
          return;
        }
        res.setHeader(
          "Content-Type",
          {
            ".html": "text/html",
            ".js": "application/javascript",
            ".css": "text/css",
            ".svg": "image/svg+xml",
            ".json": "application/json",
            ".webmanifest": "application/manifest+json",
            ".png": "image/png",
          }[path.extname(file)] || "application/octet-stream",
        );
        res.end(data);
      });
    };
    const server = tls
      ? require("https").createServer(tls, handler)
      : http.createServer(handler);
    server.listen(0, "127.0.0.1", () =>
      resolve({
        server,
        setOffline: (v) => {
          offline = v;
        },
        url:
          (tls ? "https://" : "http://") + "127.0.0.1:" + server.address().port,
      }),
    );
  });
