const express = require('express');
const path = require('path');
const app = express();

let port = process.env.PORT;
if (port == null || port === "" || port === undefined) {
  port = 3500;
}

app.listen(port, () => {
  console.log('server running on port ' + port);
})

app.use(express.static('./dist'));
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'dist/index.html'));
});
