/*Express Modules */
const express = require("express");
const bodyParser = require("body-parser");

/*Custom Module */
const list = require("./list.js");
const session = require("./session");
const logger = require("./logger.js");
const tree = require('./tree.js');

/*Environment variable*/
const PORT = process.env.PORT || 3000;
const PATH = __dirname;
const PUBLIC_PATH = PATH + "/public";

/*Express Middleware*/
const app = express();
app.use(express.static(PUBLIC_PATH));
app.set("view engine", "ejs");
app.use(bodyParser.json());


/*GET request on page load*/
app.get("/", (req, res) => {
  var token;
  if(req.headers.cookie)
  req.headers.cookie.split(";").forEach((cookie) => {
    if (cookie.trim().startsWith("token=")) {
      token = cookie.split("=")[1];
    }
  });
logger.log(req.headers.cookie);
  if (token)
  var sessionData = session.getSession(token);

  var listInfo = [{id:0, name:"untitled"}];
  var list = null;
  var id = listInfo[0].id;

  if(sessionData){
  list = sessionData.lists.current().list.get();
  id = sessionData.lists.current().id;

  listInfo = sessionData.lists.getInfo();
}else {
    token = session.generateToken();
    res.clearCookie('token');
 res.cookie('token', token, {expires: Date.now() + (60*60*24*1000), secure:true, httpOnly:true});
}

  res.render("index", {
    list: list,
    id: id,
    listInfo: listInfo,
    day: new Date().toLocaleDateString("en-US", {
      day: "numeric",
      weekday: "long",
      month: "long",
    }),
  });
});

/*POST request on form submit*/
app.post("/add-item", (req, res) => {
  if (!req.body.token) {
    logger.log("No token available (@" + req.body.token + ")");
    res.send("Invalid Token. Access Denied.");
    return;
  }

  var sessionData = {
    token: req.body.token,
    lists: null
  };


  if (!session.isSession(req.body.token)) {
    let listData = { id: Number(req.body.listId), name: req.body.listName, list: null };
    listData.list = new list.LinkedList(
      req.body.item.text,
      req.body.item
    );
    sessionData.lists = new tree.SplayTree(listData);
    session.addSession(sessionData);
  } else {
    sessionData = session.getSession(req.body.token);
    if (!sessionData.lists.current().list.has(req.body.item.text)) {
      sessionData.lists.current().list.addNode(req.body.item.text, req.body.item);
    }
  }

  res.send('200');
});

/*POST request when list item is clicked*/
app.post("/update-item", (req, res) => {
  var sessionData = session.getSession(req.body.token);
  var node = sessionData.lists.current().list.getNode(req.body.item.text);
  if(!node){
  res.send('406');
  return;
}
  node.item = req.body.item; //update item
  if (req.body.item.color === "list-group-item-light") {
    sessionData.lists.current().list.moveNode(node, false); //move to bottom
  } else {
    sessionData.lists.current().list.moveNode(node, true); //move to top
  }
  res.send('200');
});

/*POST request when list item is deleted*/
app.post("/delete-item", (req, res) => {
  var sessionData = session.getSession(req.body.token);
  var node = sessionData.lists.current().list.getNode(req.body.item.text);
  if(!node){
  res.send('406');
  return;
}
  sessionData.lists.current().list.deleteNode(node);
  res.send('200');
});

/*POST request for new list */
app.post('/new-list', (req, res)=>{
var sessionData = session.getSession(req.body.token);

if(!sessionData){
  res.send('406');
  return;
}
var listData = {
  id: null,
  name: req.body.listName,
  list: new list.LinkedList(null,null)
}
sessionData.lists.push(listData);
res.send('200');
});

/*POST request for new list */
app.post('/change-list', (req, res)=>{
var sessionData = session.getSession(req.body.token);

if(!sessionData){
  res.send('406');
  return;
}
sessionData.lists.get(Number(req.body.listId));
res.send('200');
});

/*POST request for renaming list*/
app.post('/rename-list', (req, res)=>{
var sessionData = session.getSession(req.body.token);

if(!sessionData){
  res.send('406');
  return;
}

 let listData = sessionData.lists.get(Number(req.body.listId))

if(listData)
listData.name = req.body.listName;

res.send('200');
});

/*POST request for deleting the list*/
app.post('/delete-list', (req, res)=>{
var sessionData = session.getSession(req.body.token);

if(!sessionData){
  res.send('406');
  return;
}

if(sessionData.lists.delete(Number(req.body.listId)))
res.send('200');
else
res.send('406');
});

app.listen(PORT, () => {
  logger.log("listening on port: " + PORT);
});
