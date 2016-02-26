var $name = $('#name');

var data = [
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

$name.picker({
	data: data
}).picker('show');

