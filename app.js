
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.bodyParser());
app.use(express.cookieParser('teams'));
app.use(express.session({
	key: app.session
}));
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);
app.post('/register', routes.register);
app.post('/login', routes.login);
app.get('/login', routes.login);
app.get('/members', routes.members);
app.get('/managers', routes.managers);
app.get('/makegroup', routes.makegroup);
app.post('/savegroup', routes.savegroup);
app.get('/addtogroup/:id', routes.addToGroup);
app.get('/updategroup/:grp', routes.updateGroup);
app.post('/newmission', routes.newmission);
app.get('/updatemission/:name', routes.updateMission);
app.get('/addtomission/:id', routes.addToMission);
//app.get('/newtodo/:name', routes.newtodo);
app.get('/viewmission/:mission', routes.viewmission);
app.get('/memberview/:mission', routes.memberview);
app.post('/addtask', routes.addtask);
app.post('/msghead', routes.messageHead);
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
