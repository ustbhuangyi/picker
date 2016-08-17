# picker
移动端使用的筛选器组件，高仿ios的UIPickerView

##Fetures##
- 支持单列、多列选择
- 支持动态更新每列的数据

##依赖##
picker依赖[zepto](http://zeptojs.com/)和[gmu](http://gmu.baidu.com/)；
**注意**:gmu.js请使用demo里的[gmu.js](https://github.com/ustbhuangyi/picker/blob/master/demo/gmu.js)，gmu的基础库，和官网的略有不同。

##如何使用##

首先在html中引入zepto.js，gmu.js和build目录下的[picker.js](https://github.com/ustbhuangyi/picker/blob/master/build/picker.js)，接下来执行如下代码

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
		}
	];

	$name.picker({
    	data: [data1, data2, data3],
    	selectIndex: [0, 1, 2],
    	title: '我们都是小学生'
    }).on('picker.select', function (e, selectVal, selectIndex) {
    	$(this).text(data1[selectIndex[0]].text + ' ' + data2[selectIndex[1]].text + ' ' + data3[selectIndex[2]].text);
    }).on('picker.change', function (e, index, selectIndex) {
    	console.log(index);
    }).on('picker.valuechange',function(e, selectVal, selectIndex){
    	console.log(selectVal);
    });

	$name.on('click', function () {
		$(this).picker('show');
	});i

###options
options.title  (string)

筛选器标题，默认为空。

options.data  (array)

筛选器的数据，是一个二维数组，第一维表示多少列数据，第二维表示每列的数据，单个数据是一个object，由text和value两个字段组成，text表示显示在筛选器的文本，value表示数据的值。

options.selectIndex (array)

筛选器默认选择的数据索引，是一个二维数组，第一维表示列的序号，第二维表示每列的行号，从0开始。

###事件
picker.change

当一列滚动停止的时候，会派发picker.change事件，同时会传递列序号index及滚动停止的位置selectIndex。

picker.select

当用户点击确定的时候，会派发picker.select事件，同时会传递每列选择的值数组selectVal和每列选择的序号数组selectIndex。

picker.cancel

当用户点击取消的时候，会派发picker.cancel事件。

picker.valuechange

当用户点击确定的时候，如果本次选择的数据和上一次不一致，会派发picker.valuechange事件，同时会传递每列选择的值数组selectVal和每列选择的序号数组selectIndex。

###编程接口
.picker('show',next)

显示筛选器，next为筛选器显示后执行的回调函数。

.picker('hide')

隐藏筛选器，一般来说，筛选器内部已经实现了隐藏逻辑，不必主动调用。

.picker('refill',data,index)

重填某一列的数据，data为数据数组，index为列序号。

##如何构建
picker的源码是基于webpack构建的

首先，clone项目源码
```bash
git clone https://github.com/ustbhuangyi/picker.git
```

安装依赖
```bash
cd picker
npm install
```
如果没有安装webpack，请全局安装webpack

```bash
npm install -g webpack
```
如果没有安装webpack-dev-server，请全局安装webpack-dev-server

```bash
npm install -g webpack-dev-server
```
测试demo页

```bash
npm run dev
```
打开浏览器访问如下地址, 查看效果

> localhost:9090
