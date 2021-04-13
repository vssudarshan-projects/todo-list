/*Splay Tree Implementation*/

exports.SplayTree = class SplayTree {
  #root = null;
  #idArray = [];

  #Node(listData) {
    var node = {
      listData: listData,
      parent: null,
      left: null,
      right: null,
    };
    return node;
  }

  constructor(listData) {
    this.#root = this.#Node(listData);
  }

  //update parent value of children
  #updateChildren(node) {
    if (!node) return;

    if (node.left) node.left.parent = node;

    if (node.right) node.right.parent = node;
  }

  #smallRotation(node) {
    let parent = node.parent;

    if (!parent) return;

    let gParent = parent.parent;
    let temp;
    //interchange node and parent
    if (parent.left === node) {
      temp = node.right;
      node.right = parent;
      parent.left = temp;
    } else {
      temp = node.left;
      node.left = parent;
      parent.right = temp;
    }

    this.#updateChildren(parent);
    this.#updateChildren(node);

    //update parent of node to grandparent
    node.parent = gParent;

    if (gParent) {
      if (gParent.left === parent) gParent.left = node;
      else gParent.right = node;
    }
  }

  #bigRotation(node) {
    if (
      (node.parent.left === node && node.parent.parent.left === node.parent) ||
      (node.parent.right === node && node.parent.parent.right === node.parent)
    ) {
      //zig-zig
      this.#smallRotation(node.parent);
      this.#smallRotation(node);
    } else {
      //zig-zag
      this.#smallRotation(node);
      this.#smallRotation(node);
    }
  }

  #splay(node) {
    while (node.parent) {
      if (!node.parent.parent) {
        this.#smallRotation(node);
        break;
      }
      this.#bigRotation(node);
    }
    return node; //new root
  }

  #getNode(key) {
    let node = this.#root;
    let last = null;
    let next = null;

    //splay search implementation
    while (node) {
      if (
        node.listData.id >= key &&
        (!next || node.listData.id < next.listData.id)
      )
        next = node;

      last = node;

      if (node.listData.id === key) break;

      if (node.listData.id < key && node.right) node = node.right;
      else node = node.left;
    }

    this.#root = this.#splay(last);
    return next; //return null if key is the largest
  }

  //split the tree with the given node as root.
  #splitTree(node) {
    if (!node) return { left: this.#root, right: null };

    let result = {
      left: null,
      right: null,
    };

    result.right = this.#splay(node);
    result.left = result.right.left;

    if (result.left) {
      result.left.parent = null;
      result.right.left = null;
    }

    return result;
  }

  //merge left as child of right
  #mergeTree(left, right) {
    if (!left) return right;

    if (!right) return left;

    let node = right;

    while (node.left) {
      node = node.left;
    }

    right = this.#splay(node);

    right.left = left;
    left.parent = right;

    return right;
  }

  #inOrderInfo() {
    let node = this.#root;

    let names = [];
    let stack = [];
    do {
      while (node) {
        stack.push(node);
        node = node.left;
      }

      node = stack.pop();
      names.push({id:node.listData.id ,name: node.listData.name});

      node = node.right;
    } while (stack.length !== 0 || node);

    return names;
  }

  #addNode(node) {
    if (!this.#root) this.#root = node;
    else {
      let found = this.#getNode(node.listData.id);
      let result = this.#splitTree(found);
      this.#root = this.#mergeTree(
        result.left,
        this.#mergeTree(node, result.right)
      );
    }
  }

  #deleteNode(node) {
    var next = node.right;

    if (next) {
      node.right = null;
      next.parent = null;
      while (next.left) next = next.left;

      next = this.#splay(next);
      next.left = node.left;
      node.left = null;
      if (next.left) next.left.parent = next;

    } else if(node.left){
      next = node.left;
      node.left = null;
      next.parent = null;
    }

    return next;
  }

  push(listData) {
    if (!listData.id)
      if (this.#idArray.length !== 0) listData.id = this.#idArray.pop();
      else {
        let node = this.#root;
        while (node.right) node = node.right;

        listData.id = Number(node.listData.id) + 1;
      }
    this.#addNode(this.#Node(listData));
  }

  get(key) {
    let node = this.#getNode(key);
    if (node) return node.listData;
    else return null;
  }

  current() {
    return this.#root.listData;
  }


  delete(key) {
    //cannot delete root
    if(!this.#root.right && !this.#root.left)
    return false;

    let oldRoot = this.#root;
    let node = this.#getNode(key);
    if (node) {
      let result = this.#deleteNode(node);
      if (oldRoot !== node) this.#root = this.#splay(oldRoot);
      else this.#root = result;
      this.#idArray.push(key);
      return true;
    }
    return false;
  }

  getInfo() {
    if (this.#root) return this.#inOrderInfo();
    else return null;
  }
};
