var nameEl = document.getElementById('chose');

var first = []; /* 省，直辖市 */
var second = []; /* 市 */
var third = []; /* 镇 */

var checked = [0, 0, 0]; /* 已选选项 */

city.forEach(function(item, index, arr){
  var temp = new Object();
  temp.text = item.name;
  temp.value = index
  first.push(temp)
})

city[0].sub.forEach(function(item, index, arr){
  var temp = new Object();
  temp.text = item.name;
  temp.value = index
  second.push(temp)
})

var picker = new Picker({
	data: [first, second, third],
	selectedIndex: [0, 0, 0],
	title: '地址选择'
});

picker.on('picker.select', function (selectedVal, selectedIndex) {
  var text1 = first[selectedIndex[0]].text;
  var text2 = second[selectedIndex[1]].text;
  var text3 = third[selectedIndex[2]] ? third[selectedIndex[2]].text : '';

	nameEl.innerText = text1 + ' ' + text2 + ' ' + text3;
});

picker.on('picker.change', function (index, selectedIndex) {
  if (index === 0){
    firstChange();
  } else if (index === 1) {
    secondChange()
  }

  function firstChange() {
    second = [];
    third = [];
    checked[0] = selectedIndex;
    var firstCity = city[selectedIndex]
    firstCity.sub.forEach(function(item, index, arr){
      var temp = new Object();
      temp.text = item.name;
      temp.value = index;
      second.push(temp);
    })
    picker.refill(second, 1)
    picker.refill(third, 2)
  }

  function secondChange() {
    third = [];
    checked[1] = selectedIndex;
    var first_index = checked[0];
    if (city[first_index].sub[selectedIndex].hasOwnProperty('sub')) {
      var secondCity = city[first_index].sub[selectedIndex]
      secondCity.sub.forEach(function(item, index, arr){
        var temp = new Object();
        temp.text = item.name;
        temp.value = index;
        third.push(temp);
      })
      picker.refill(third, 2)
    } else {
      third = [''];
      checked[2] = 0;
      picker.refill(third, 2)
    }
  }

});

picker.on('picker.valuechange', function (selectedVal, selectedIndex) {

});

nameEl.addEventListener('click', function () {
	picker.show();
});



