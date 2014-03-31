Teamwork
========

Teamwork is my second experiments with Neo4j and was inspired by the idea that hierarchical groups of groups are cosmically powerful. Teamwork utilizes two kinds of users and two kinds of organizations to create an expressive team management utility that could be useful for working with remote teams. Some of the features have yet to be implemented such as the message system between the manager and the heads of groups and the ability of heads to check off tasks.

Users
-----
*Members
Members are the workers of Teamwork. As of now they have little power within the program other than to observe tasks that have been delegated to their group from various missions. Members who are assigned to head their group have an extra set of powers such as direct communication with the manager and the ability to check off tasks as completed by their team.

*Managers
Managers are the core of Teamwork. The manager creates groups and missions and assigns them members and groups respectively. The communication network of the company is defined by who the manager selects as the head of each group. Tasks are also delegated to groups by the manager and stored in an array in the relationship between a group and a mission.

Organizations
-------------
*Groups
Groups are networks of members. Each group must have a head who is responsible for the content produced by a group and can contact a manager directly. Right now each member can only be a part of one group, but it is possible that an inter-group group could be formed by calling all the heads of the groups assigned to a given mission.

*Missions
Missions represent actual jobs and can be assigned any number of groups. Likewise, any given group may be assigned any number of missions. The main function of missions is to send tasks down to members via their groups. A simple template allows a manager easily delegate tasks to groups. When a member views a mission that their group has been assigned, they see all the tasks that are stored in the relationship between their group and that mission. 

