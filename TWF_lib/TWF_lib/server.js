const express = require('express');
const path = require('path');
const app = express();
const port = 3500

app.use(express.static('./dist'));
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'dist/index.html'));
});

app.listen(port, function() {
  console.log('server running on port ' + port);
})
