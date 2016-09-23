/*
 MakeFunnel JS v1.0.0 (2015-08-05)

 Based on D3.js

 Order BY : Cliff Zhu
*/

(function ()
{
	d3.selection.prototype.makeFunnel = function (obj)
	{
		function creatMakeFunnelClass()
		{
			this.setDefault = function (obj)
			{
				if (typeof obj.str == "undefined")
					obj.str = hukj123;
				if (typeof obj.width == "undefined")
					obj.width = 200;
				if (typeof obj.height == "undefined")
					obj.height = 200;
				if (typeof obj.data == "undefined")
					obj.data = [
						{ "name": "zxh", value: "13" },
						{ "name": "cliff", "value": "52" },
						{ "name": "v-clzh", "value": "130" }
					].sort(function (item1, item2) { return item1.value < item2.value });
				return obj;
			};
		};
		var mc = new creatMakeFunnelClass();
		var obj = mc.setDefault(obj);
		var svg = this.append("svg").attr("version", "1.1").attr("xmlns", "http://www.w3.org/2000/svg").attr("width", obj.width).attr("height", obj.height);
		svg.append("g").attr("width", "200").attr("height", "200").attr("fill", "#0f0").attr("transform", "translate(20,20)").append("text").text(obj.str).attr("fill", "#f00");
	};
})();