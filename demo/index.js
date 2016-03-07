FastClick.attach(document.body);

var $name = $('#name');


var data1 = [
	{
		text: '小美',
		value: 1
	}, {
		text: '猪猪',
		value: 2
	}
];

var data2 = [
	{
		text: '张三',
		value: 1
	},
	{
		text: '李四',
		value: 2
	},
	{
		text: '王五',
		value: 3
	},
	{
		text: '赵六',
		value: 4
	},
	{
		text: '吴七',
		value: 5
	},
	{
		text: '陈八',
		value: 6
	},
	{
		text: '杜九',
		value: 7
	},
	{
		text: '黄十',
		value: 8
	},
	{
		text: '呵呵',
		value: 9
	},
	{
		text: '哈哈',
		value: 10
	},
	{
		text: '嘿嘿',
		value: 11
	},
	{
		text: '啦啦',
		value: 12
	}
];

var data3 = [
	{
		text: '开心',
		value: 1
	}, {
		text: '生气',
		value: 2
	},
	{
		text: '难过',
		value: 3
	}, {
		text: '搞笑',
		value: 4
	}
];

$name.on('click', function () {
	$(this).picker({
		data: [data1, data2, data3],
	}).picker('show')
		.on('select', function (e, data) {
			$(this).text(data1[data[0]].text + ' ' + data2[data[1]].text + ' ' + data3[data[2]].text);
		});
});



