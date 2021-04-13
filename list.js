/*Modified LinkedList Implementation*/



exports.LinkedList =  class List{

  #listMap = new Map();
  #head = null;
  #tail = null;

  constructor(key, item){
   this.addNode(key, item);
  }

addNode(key, item) {
  if(!item || !key)
  return;

  var node = {
    item: item,
    prev: null,
    next: null,
  };

  if (!this.#tail) this.#head = this.#tail = node;
  else {
    this.#tail.next = node;
    node.prev = this.#tail;
    this.#tail = node;
  }
  this.#listMap.set(key, node);
}

#unlinkNode(node){
if(!node)
return;


if(node.next)
  node.next.prev = node.prev;
else {
  this.#tail = this.#tail.prev;
}

  if(node.prev)
  node.prev.next = node.next;
  else {
    this.#head = this.#head.next;
  }

node.next = null;
node.prev = null;

}

moveNode(node, toTop) {
  if(!node)
  return;

this.#unlinkNode(node);

if(!this.#head && !this.#tail){
this.#head = this.#tail = node;
return;
}
  if (toTop) {//make node new head

    this.#head.prev = node;
    node.next = this.#head;
    node.prev = null;
    this.#head = node;

  } else {//make node new tail

    this.#tail.next = node;
    node.prev = this.#tail;
    node.next = null;
    this.#tail = node;
  }
}

deleteNode(node){
  if(!node)
  return;
this.#unlinkNode(node);
this.#listMap.delete(node.item.text);
}


get(){
  return this.#head;
}

has(key){
  return this.#listMap.has(key);
}

 getNode(key){
  return this.#listMap.get(key);
}


}
