$(document).ready(() => {

  var listName = $(".list.active").text().trim();
  var listId = $(".list.active").attr("id").split("-")[1];

  //colour for the list items
  var listItemClasses = [
    "list-group-item-danger",
    "list-group-item-warning",
    "list-group-item-dark",
  ];
  var colorIndex = 0;

  //manage the message when there are no items in All list
  if ($(".list-item").length === 0) $("#no-item-msg").show();
  else $("#no-item-msg").hide();

  //set the colour for the next list item
  $(".list-group-item").each(function () {
    colorIndex++;
    if (colorIndex === listItemClasses.length) colorIndex = 0;
    if ($(this).attr("class").split(" ")[3] === "list-group-item-light")
      $(this).parent().append(this);
  });

  //set Active list

  //logic for the active filter button
  var activeBtn = "l";
  $(".btn-filter").on("pointerdown", function () {
    $("#no-item-msg").hide();
    if ($(this).val() !== activeBtn) {
      $("#btn-" + activeBtn).removeClass("btn-active");
      $(this).addClass("btn-active");
      activeBtn = $(this).val();
    }
    let count = 0;
    switch (activeBtn) {
      case "l":
        $(".list-group-item").each(function () {
          $(this).show();
          count++;
        });

        break;

      case "m":
        $(".list-group-item").each(function () {
          if ($(this).attr("class").split(" ")[3] === "list-group-item-light")
            $(this).hide();
          else {
            $(this).show();
            count++;
          }
        });
        break;

      case "r":
        $(".list-group-item").each(function () {
          if ($(this).attr("class").split(" ")[3] !== "list-group-item-light")
            $(this).hide();
          else {
            $(this).show();
            count++;
          }
        });
    }
    if (count === 0) $("#no-item-msg").show();
  });

  //logic when list item is clicked
  $(".list-item").on("pointerdown", function (event) {
    if (event.shiftKey) {
      deleteItem(this);
      return;
    }

    let classes = $(this).attr("class").split(" ");
    if (!classes.includes("list-group-item-light")) {
      $(this).removeClass(classes[3]);
      $(this).addClass("list-group-item-light");
      $(this).parent().append(this);
    } else {
      $(this).removeClass(classes[3]);
      let index = listItemClasses.indexOf(
        $(".list-item").first().attr("class").split(" ")[3]
      );
      if (index === -1) index = 0;
      else if (index === 0) index = listItemClasses.length - 1;
      else index--;
      $(this).addClass(listItemClasses[index]);
      $(this).parent().prepend(this);
    }

    let color = $(this).attr("class").split(" ")[3];
    callAjax(
      "/update-item",
      "POST",
      {
        listName: listName,
        listId: listId
      },
      {
        text: $(this).text().trim(),
        color: color,
      }
    ).done(status=>{
      if(status === '406')
        alert("Cannot perform operation.");
    }).fail((err)=>{
      console.log(err);
    }).catch((err)=>{
      console.log(err);
    });

    //hide/show based on current filter
    if (
      (color === "list-group-item-light" && activeBtn === "m") ||
      (color !== "list-group-item-light" && activeBtn === "r")
    )
      $(this).hide();
    else {
      $(this).show();
    }
  });

  function deleteItem(item) {
    $(item).remove();
    callAjax(
      "/delete-item",
      "POST",
      {
        listName: listName,
        listId: listId
      },
      {
        text: $(item).text().trim(),
      }
    ).done(status=>{
      if(status === '406')
      alert("Cannot perform operation.");
    }).fail((err)=>{
      console.log(err);
    }).catch((err)=>{
      console.log(err);
    });
    if ($(".list-item").length === 0) $("#no-item-msg").show();
  }

  //logic when new item is added
  $("form").on("submit", (event) => {
    event.preventDefault();
    if ($("#new-item-text").val().trim() === "") return;
    callAjax(
      "/add-item",
      "POST",
      {
        listName: listName,
        listId: listId
      },
      {
        text: $("#new-item-text").val(),
        color: listItemClasses[colorIndex],
      }
    ).done(() => {
      location.reload(true);
    }).fail((err)=>{
      console.log(err);
    }).catch((err)=>{
      console.log(err);
    });
  });

  //logic for new list
  $("#new-list").on("pointerdown", () => {
    let newListName = prompt("Enter list name.", "untitled");

    if (!newListName) return;
    else if (newListName.trim() === "") newListName = "untitled";

    let lists = $(".list.nav-link");

    for (let i = 0; i < lists.length; i++)
      if ($(lists[i]).text().trim() === newListName.trim()) return;

    callAjax(
      "/new-list",
      "POST",
      {
        listName: newListName,
        listId: null
      },
      null
    ).done((status) => {
      if (status === "406")
          alert("Cannot perform operation.");
        else
      location.reload(true);
    }).fail((err)=>{
      console.log(err);
    }).catch((err)=>{
      console.log(err);
    });
  });


  $(".dropdown-option").on("pointerdown", function () {
    let className = $(this).attr("class").split(" ")[1];
    switch (className) {
      case "option-go":
        listReq('/change-list');
        break;
      case "option-rename":
        renameList(this);
        break;
      case "option-delete":
      listReq('/delete-list');
        break;
      default:
        console.log(className);
    }
  });

function renameList(list){
  let newListName = prompt("Enter list name.", "untitled");
  if (!newListName) return;
  else if (newListName.trim() === "") newListName = "untitled";

  $(list).parent().prev().text(newListName);
  listReq($(list).parent().prev(), '/rename-list');
}


// I also found a solution.
//
// Assuming that the Twitter Bootstrap Components related events handlers are delegated to the document object, I loop the attached handlers and check if the current clicked element (or one of its parents) is concerned by a delegated event.
//
// $('ul.dropdown-menu.mega-dropdown-menu').on('click', function(event){
//     var events = $._data(document, 'events') || {};
//     events = events.click || [];
//     for(var i = 0; i < events.length; i++) {
//         if(events[i].selector) {
//
//             //Check if the clicked element matches the event selector
//             if($(event.target).is(events[i].selector)) {
//                 events[i].handler.call(event.target, event);
//             }
//
//             // Check if any of the clicked element parents matches the
//             // delegated event selector (Emulating propagation)
//             $(event.target).parents(events[i].selector).each(function(){
//                 events[i].handler.call(this, event);
//             });
//         }
//     }
//     event.stopPropagation(); //Always stop propagation
// });
// Hope it helps any one looking for a similar solution.
//
// Thank you all for your help.

// $('.list-menu').on('pointerdown',function(event){
//   event.stopPropagation();
// });

var clickedList;
$('.list').on('pointerdown', function(){
clickedList = this;
});

function listReq(url){
  return callAjax(
    url,
    "POST",
    {
      listName: $(clickedList).text().trim(),
      listId: $(clickedList).attr("id").split("-")[1],
    },
    null
  ).done((status) => {
    if (status === "406"){
        alert("Cannot perform operation.");
    }else;
   location.reload(true);
  }).fail((err)=>{
    console.log(err);
  }).catch((err)=>{
    console.log(err);
  });
}

  function callAjax(url, method, listData, item) {
    return $.ajax({
      url: url,
      method: method,
      contentType: "application/json",
      data: JSON.stringify({
        listName: listData.listName,
        listId: listData.listId,
        item: item,
      }),
    });
  }
});
