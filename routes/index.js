

var NEO = require('neo4j');
var db = new NEO.GraphDatabase('http://localhost:7474');

exports.index = function(req, res){
  res.render('index');
};

exports.register = function(req, res) {
	req.session.data = {name: req.body.name, password: req.body.password};
	var query = req.session.data;
	db.query('CREATE (n:'+req.body.status+' {name: ({name}), password: ({password})})',query, function (err) {
		console.log(err);
		res.redirect('/login');
	})
};

exports.login = function(req, res) {
	if(!req.session.data) {
		var params = {name: req.body.login, password: req.body.pass};
	} else {
		var params = req.session.data;
	}
	db.query('MATCH n\nWHERE n.name = ({name})\nAND n.password = ({password})\nRETURN n, labels(n)',params, function(err, user) {
		console.log(user[0].n.id);
		req.session.user = {name: user[0].n._data.data.name, id: user[0].n.id};
		req.session.userType = user[0]['labels(n)'][0];		
		if(req.session.userType === 'Member') {
			res.redirect('/members');
		} else {
			res.redirect('/managers');
		}
	});
};

exports.members = function (req, res) {
  var params = {id: req.session.user.id};
  db.query('MATCH n-[r]->(g:Group)\nWHERE id(n)= ({id})\nRETURN r, g', params, function (err, data) {
    if(err) {console.log(err);}
    db.query('MATCH n-[]->(:Group)-[:ASSIGNED]->(m:Mission)\nWHERE id(n)= ({id})\nRETURN m',params, function (err, m) {
      var missions = [];
      var status;
      var group;
      forEach(m, function(mission) {
        missions.push({name: mission.m._data.data.name, id: mission.m.id});
      });
      if(data.length > 0) {
        status = data[0].r._data.type;
        group = data[0].g._data.data.name;
      } else {
        status = '';
      };
      if(status === 'HEAD_OF') {
        var head = true;
      } else {
        var head = false;
      };
      res.render('member', {
        user: req.session.user,
        group: group,
        head: head,
        missions: missions
    })
    });
  })
};

exports.managers = function (req, res) {
  db.query('MATCH (n:Group)\nRETURN n', function (err, n) {
    db.query('MATCH (n:Mission)\nRETURN n', function (err, m) {
      var groups = [];
      forEach(n, function(group) {
        groups.push({name: group.n._data.data.name, id: group.n.id});
      });
      var missions = [];
      forEach(m, function(mission){
        missions.push({name: mission.n._data.data.name, id: mission.n.id});
      });
      res.render('manager', {
        user: req.session.user,
        groups: groups,
        missions: missions
      })
    }) 
	})
};

exports.makegroup = function (req, res) {
	db.query('MATCH (n:Member)\nRETURN n', function (err, m) {
		var members = [];
		forEach(m, function(member) {
			members.push({id: member.n.id, name: member.n._data.data.name})
		})
    console.log(members);
		res.render('newgroup', {
			user: req.session.user,
			members: members
		})
	})
};

exports.savegroup = function (req, res) {
	var params = {name: req.body.name, head: req.body.head};
  var head = {head: req.body.head};
	db.query('CREATE (n:Group {name: ({name})})', params, function (err) { //create the group
    db.query('MATCH (b:Group)\nWHERE b.name = ({name})\nRETURN b',params, function (err, group) { //get the group
      var group = group[0].b
      req.session.groupId = group.id;
      req.session.groupName = group._data.data.name;
        db.getNodeById(req.body.head, function (err, head) {
          head.createRelationshipTo(group, 'HEAD_OF', function (err, rel) {
            res.redirect('/updategroup/'+group.id);
        })
      })
    })
	})
};

exports.addToGroup = function (req, res) {
    db.getNodeById(req.session.groupId, function (err, group) {
      db.getNodeById(req.params.id, function (err, member) {
        member.createRelationshipTo(group, 'MEMBER_OF', function (err, rel) {
          res.redirect('/updategroup/'+group.id);
        })
      })
    })
};

exports.updateGroup = function (req, res) {
  req.session.groupId = parseInt(req.params.grp);
  var params = {id: req.session.groupId};
  db.query('MATCH (n:Member), (g:Group)\n WHERE id(g)= ({id}) AND NOT (n)-->(g)\nRETURN n', params, function (err, o) {
    db.query('MATCH (n:Member), (g:Group)\n WHERE id(g)= ({id}) AND (n)-->(g)\nRETURN n', params, function (err, m) {
    var members = [];
    var outsiders = [];
    forEach(m, function(member) {
      members.push({name:member.n._data.data.name, id: member.n.id});
    })
    forEach(o, function(outsider) {
      outsiders.push({name:outsider.n._data.data.name, id: outsider.n.id});
    })
    res.render('updateGroup', {
      members: members,
      group: req.session.groupName,
      outsiders: outsiders
      })
    })
  })
};

exports.newmission = function (req, res) {
  var params = {name: req.body.name};
  db.query('CREATE (n:Mission {name: ({name})})',params, function (err) {
    req.session.mission = req.body.name;
    res.redirect('/updatemission/'+req.body.name);
  })
};

exports.updateMission = function(req, res) {
  var params = {name: req.params.name};
  req.session.mission = params.name;
  db.query('MATCH (n:Mission),(g:Group)\nWHERE n.name= ({name}) AND NOT (g)-->(n)\nRETURN g',params, function (err, out) {
    db.query('MATCH (n:Mission),(g:Group)\nWHERE n.name= ({name}) AND (g)-->(n)\nRETURN g',params, function (err, In) {
      var inside = [];
      forEach(In, function (group) {
        inside.push({name: group.g._data.data.name, id: group.g.id});
      });
      var outside = [];
      forEach(out, function (group) {
        outside.push({name: group.g._data.data.name, id: group.g.id});
      })
      res.render('updatemission', {
        mission: params.name,
        inside: inside,
        outside: outside
      })
    })
  })
};

exports.addToMission = function(req, res) { //connects groups with a mission
  var params = {id: parseInt(req.params.id), name: req.session.mission};
  db.query('MATCH (m:Mission),(g:Group)\nWHERE m.name= ({name}) AND id(g)= ({id})\nCREATE UNIQUE (g)-[:ASSIGNED {content:[]}]->(m)\nRETURN m',params, function (err, m) {
    console.log(err);
    res.redirect('/updatemission/'+req.session.mission);
  })
};

//exports.newtodo = function(req, res) { //finds all groups assigned to a mission and creates a LIST object connected to both the group and the mission
//  var params = {name: req.params.name};
//  db.query('MATCH (n:Mission)<-[:ASSIGNED]-(g:Group)\nWHERE n.name= ({name})\nRETURN g',params, function (err, data) {
//    if(err) {console.log(err);}
//    var groups = [];
//    var counter = 0;
//    forEach(data, function (group) {
//      var params = {id: group.g.id, name: req.params.name};
//      db.query('MATCH (g: Group),(m:Mission)\nWHERE id(g)= ({id}) AND m.name = ({name})\nCREATE UNIQUE (g)-[:TODO]->(t:LIST {content:[]})-[:LIST_OF]->(m)\nRETURN t', params, function (err, todo) {
//        if(err) {console.log(err);}        
//        counter+=1;
//        return;
//      })
//    })
//    req.session.mission = req.params.name;
//    if(counter === groups.length) {
//      res.redirect('/viewmission/'+req.session.mission);
//    }
//  })
//};

exports.viewmission = function(req, res) {
  var params = {name: req.params.mission};
  req.session.mission = params.name;
  db.query('MATCH (m:Mission)<-[l:ASSIGNED]-(g:Group)\nWHERE m.name= ({name})\nRETURN l,g', params, function (err, data) {
    if(err) {console.log(err);}
    var cluster = [];
    forEach(data, function (group) {
      cluster.push({name: group.g._data.data.name, id: group.g.id, list: group.l._data.data.content || []});
    })
    res.render('listview', {
      mission: req.params.mission,
      data: cluster
    })
  })
};

exports.memberview = function(req, res) {
  var params = {id: req.session.user.id, mission: parseInt(req.params.mission)};
  console.log(params);
  db.query('MATCH (n:Member)--(:Group)-[l:ASSIGNED]->(m:Mission)\nWHERE id(n)= ({id}) AND id(m)= ({mission})\nRETURN l, m',params, function (err, data) {
    console.log(data);
    var list = data[0].l._data.data.content;
    var mission = data[0].m._data.data.name;
    res.render('memberview', {
      mission: mission,
      list: list
    })
  })
}

exports.addtask = function(req, res) {
  var params = {group: parseInt(req.body.group), name: req.session.mission, task: req.body.task};
  db.query('MATCH (g:Group)-[l:ASSIGNED]->(m:Mission)\nWHERE id(g)= ({group}) AND m.name= ({name})\nSET l.content = l.content + ({task})\nRETURN l', params, function (err, data) {
    if(err) {console.log(err);}
    console.log(data[0].l._data);
    res.redirect('/viewmission/'+req.session.mission);
  })
};

exports.messageHead = function(req, res) {
  //TODO messaging system
}

var forEach = function(array, fn) {
	for(var i = 0; i < array.length; i++) {
		fn(array[i]);
	};
};
