const koa = require('koa');
const koa_static = require('koa-static');
const path = require('path');
const fs = require('fs');

function _static(relative_path) {
    return koa_static(path.join(process.cwd(), relative_path));
}

const app = koa();
app.name = 'Experiments';
app.env = 'development';

app.use(_static('./static'));
app.use(_static('./build'));

app.on('error', function (err) {
    console.error('server error: ', err);
});

app.listen(8080, () => {
    console.log('Server running on 8080');
});

