const myEl = document.getElementById("list");
myEl.forEach(function(myEl) {
myEl.addEventListener("click", function() {
    myEl.style.color = "red";
    myEl.style.fontSize = "30px";
    myEl.style.fontWeight = "bold";
});
});

// const listItems = document.querySelectorAll("ul li");

// listItems.forEach(function(item) {
//     item.addEventListener("click", function() {
//         item.style.color = "red";
//         item.style.backgroundColor = "yellow";
//     });
// });