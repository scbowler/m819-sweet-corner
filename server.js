const express = require('express');
const cors = require('cors');
const StatusError = require('./helpers/status_error');
const defaultErrorHandler = require('./middleware/default_error_handler');
const PORT = process.env.PORT || 9000;

global.StatusError = StatusError;
global.__rootdir = __dirname;

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const routes = require('./routes');
app.use(routes);

app.use(defaultErrorHandler);

app.listen(PORT, () => {
    console.log('Server running @ localhost:' + PORT);
});
