$(function () {
    var st,lt;
    var data = {};
    var dayUnit = 5;
    var $reporting = $("#report");
    var recMin = (new Date()).getMinutes();
    //均线是否显示
    var meanLine = true;
    //产品切换
    $("#selectProduct .product").click(function(){
    	clearInterval(st);
    	clearInterval(lt);
    	var $pro = $(this),
    		$product = $pro.data('pro');
    	$pro.addClass('active').siblings().removeClass('active');
    	$("#feature-tab").find("li").eq(0).addClass("active").siblings().removeClass("active");
    	$.get('json/'+$product+'/1.json', function (msg) {
	        data[-1] = transData(msg);
	        getAreaStock(data);
	    });
    })
    
    // 绑定tab栏事件
    $("#feature-tab li").click(function () {
        var $li = $(this),
            $a = $li.find('a'),
            unit = $a.data('unit');
        clearInterval(st);
        clearInterval(lt);
        $li.addClass('active').siblings().removeClass('active');
        console.log(data)
        if (unit == -1) {
            getAreaStock(data);
            $("#report").hide();
        } else {
        	data = {};
            $.get('json/'+$("#selectProduct").find(".active").data("pro")+'/1.json', function (msg) {
            	console.log(msg)
		        data[-1] = transData(msg);
		        getKlineStock(data, unit);
		    },'json');
            $("#report").show();
            $("#report").html("");
        }
    });
    // Highcharts.wrap(Highcharts.Series.prototype, 'addPoint', function(proceed) {
    //     proceed.apply(this, [].slice.call(arguments, 1));
    //     // only do this for spline charts
    //     if (this.type === 'spline') {
    //         this.yAxis.setSideLabel(this, arguments[1][1].toFixed(2));
    //     }
    // });
    // Highcharts.Axis.prototype.setSideLabel = function(series, value) {
    //     if (this.sideLabels === undefined) {
    //         this.sideLabels = [];
    //     }
    //     var axis = this,
    //         label = axis.sideLabels[series._i];
    //     if (!label) {
    //         label = this.sideLabels[series._i] = axis.chart.renderer.label(value).attr({
    //             stroke: series.color,
    //             strokeWidth: 1,
    //             zIndex: 8
    //         }).add();

    //         axis.chart.renderer.path(['M', -5, 11, 'L', 5, 5, 'L', 30, 5, 'L', 30, 18, 'L', 5, 18, 'Z']).attr({
    //             stroke: series.color,
    //             fill: Highcharts.Color(series.color).brighten(0.3).get(),
    //             strokeWidth: 1
    //         }).add(label);
    //     }
    //     label.attr({
    //         translateX: axis.left + axis.width + 5,
    //         translateY: this.top + this.height - axis.translate(value) - 11,
    //         text: value
    //     });
    // }
    Highcharts.setOptions({
        global: {
            useUTC: false
        },
        colors: ['#7cb5ec', '#7cb5ec', '#7cb5ec', '#7cb5ec', '#7cb5ec', '#7cb5ec', '#7cb5ec', '#7cb5ec', '#7cb5ec']
    });
    
    $.get('json/'+$("#selectProduct").find(".active").data("pro")+'/1.json', function (msg) {
        data[-1] = transData(msg);
        getAreaStock(data);
    },'json');


    // 获取最新数据
    var getPrice = function(chart, unit) {
        //是否属于期货
        // var json = $("#jsonData").html();
        // if ($('.price').attr('data-value') == -1) {
        //     return false;
        // }
        var mydate = new Date();
        //交易时间：周一至周五，上午10:00至次日凌晨02:00 mydate.getHours(); //获取当前小时数(0-23)
        if (mydate.getDay() == 0 || mydate.getDay() == 6) {
            return $('#price').html('休市');
        } else {
            $.get('json/price.json?' + Math.random(), function(newData) {
                var nowProduct = $("#selectProduct").find(".active").data("pro"),
                    //random为我仿制的随机数
                    random = ((Math.random()-0.5)*0.03).toFixed(2),
                    price = parseFloat(newData[nowProduct])+ parseFloat(random),
//                  price = parseFloat(newData[nowProduct]),
                    date = new Date(),
                    minute = (new Date()).getMinutes(),
                    x = Date.parse(date.format('yyyy/MM/dd hh:' + minute + ':00')),
                    length = chart.data.length;
                    console.log(chart)
                if (length > 0) {
                    if (minute == recMin) {
                    	if(unit == -1){
                    		chart.data[length - 1].y = price;
                    	}else{
                    		chart.data[length - 1].close = price;
                    	}
                        chart.redraw();
                    } else {
                    	if(unit == -1){
                    		chart.addPoint([x, price], true, true);
                    	}else{
                    		$("#feature-tab .active").trigger("click");
                    	}
                        recMin = minute;
                    }
                }
		        var lastPrice = $('#price').html();
			    //价格箭头跳动
			    if (price != lastPrice) {
			        $('#price').removeClass('red');
			        $('#price').removeClass('green');
			    }
			    if (price > lastPrice) {
			        $('#price').addClass('red');
			    } else if (price < lastPrice) {
			        $('#price').addClass('green');
			    }
			    $('#price').html(price);
            }, 'json');
        }
    }

    function getAreaStock(data) {
        var length = data[-1].length;
        if (length > 60) {
            data = data[-1].slice(length-60,length);
        } else {
            data = data[-1];
        }
        $('#container').highcharts('StockChart', {
            title: {
                text: ''
            },
            chart: {
                backgroundColor: 'rgba(0,0,0,0)',
                events: {
                    load: function () {
                        var series = this.series;
                        st = setInterval(function () {
                            getPrice(series[0],-1);
                        }, 1500);
                    }
                },
                resetZoomButton: false,
                panning: false, //禁用放大
                pinchType: "null", //禁用手势操作
                zoomType: "null"
            },
            rangeSelector: {
                enabled: false
            },
            XAxis: {
                reversed: true
            },
            yAxis: [{
                title: {
                    text: ''
                },
                opposite: true,
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }]
            }, {
                title: {
                    enabled: false
                },
                gridLineWidth: 1,
                minorGridLineWidth: 1,
                minorTickInterval: 5,
                plotBands: [{
                    from: 0,
                    to: 25,
                    color: '#FCFFC5'
                }]
            }],
            // 图例
            legend: {
                enabled: false
            },
            exporting: {
                enabled: false
            },
            tooltip: {
                formatter: function() {
                    return '<b>' + Highcharts.dateFormat('%H:%M:%S', this.x) + '</b><br/><b>价格：</b>' + Highcharts.numberFormat(this.y, 2);
                },
                followPointer:true,
                followTouchMove:true
            },
            credits:{
                enabled: false
            },
            scrollbar: {
                enabled: false
            },
            navigator: {
                enabled: false
            },
            series : [{
                name : 'price',
                type: 'area',
                data : data,
                tooltip: {
                    valueDecimals: 2
                },
                fillColor : {
                    linearGradient : {
                        x1: 0,
                        y1: 0,
                        x2: 1,
                        y2: 1
                    },
                    stops : [
                        [0, Highcharts.getOptions().colors[1]],
                        [1, Highcharts.Color(Highcharts.getOptions().colors[5]).setOpacity(0).get('rgba')]
                    ]
                },
                threshold: null
            }]
        });
    }

    function getKlineStock(data, unit) {
    	console.log(data)
       var circle;
        switch (unit) {
           case 0:
                circle = 1;
                break;
            case 1:
                circle = 5;
                break;
            case 2:
                circle = 15;
                break;
            case 3:
                circle = 30;
                break;
            case 4:
	            circle = 60;
	            break;
        };
        if (!data[unit]) {
            data[unit] = [];
            var diff = 60 * 1000 * circle;
            var start = data[-1][0][0],
                end = 0,
                sub = [0, 0, 0, 999999, 0];
            for (var key in data[-1]) {
                end = data[-1][key][0];
                if (end - start >= diff) {
                    sub[4] = data[-1][key - 1][4];
                    data[unit].push(sub);
                    start = data[-1][key][0];
                    sub = [0, 0, 0, 999999, 0];
                }
                if (end == start) {
                    sub[0] = data[-1][key][0];
                    sub[1] = data[-1][key][1];
                }
                if (sub[2] < data[-1][key][2]) {
                    sub[2] = data[-1][key][2];
                }
                if (sub[3] > data[-1][key][3]) {
                    sub[3] = data[-1][key][3];
                }
            }
        }

        if(meanLine){
            var exma = function (num,unit) {
                var i,arr = []; 
                for (i = 0; i <data[unit].length; i++) {
                    var dateUTC = data[unit][i][0];
                    if(i>=num){
                        var ma5=0.00;
                        for( var j=0;j<num;j++){
                            ma5+=parseFloat(data[unit][i-j][4]);
                        }
                        arr.push([
                            parseInt(dateUTC), // the date
                            parseFloat(ma5/num)
                        ]);
                    }
                }    
                return arr;
            }
        }else{
            var exma = function (num,unit) {
                
            }
        }
        

        $('#container').highcharts('StockChart', {
            title: {
                text: ''
            },
            rangeSelector: {
                 buttons: [{
                    type: 'minute',
                    count: 30,
                }, {
                    type: 'hour',
                    count: 2,
                }, {
                    type: 'hour',
                    count: 4,
                }, {
                    type: 'hour',
                    count: 10,
                }, {
                    type: 'hour',
                    count: 60,
                }, {
                    type: 'day',
                    count: 7,
                }],
                buttonTheme: {
                    style: {
                        display: 'none'
                    },
                },
                inputStyle: {
                    display: 'none'
                },
                labelStyle: {
                    display: 'none'
                },
                selected: unit,
            },
            chart: {
                backgroundColor: 'rgba(0,0,0,0)',
                resetZoomButton: false,
                panning: false, //禁用放大
                pinchType: "null", //禁用手势操作
                zoomType: "null",
                events: {
                    load: function () {
                        var series = this.series;
                        lt = setInterval(function () {
                            getPrice(series[0],0);
                        }, 1500);
                    }
                },
            },
            scrollbar: {
                enabled: false
                  
            },
            navigator: {
                enabled: false
            },
            credits:{
                enabled: false
            },
            tooltip: {
                formatter: function() {
                    var date, hour, minute;
                    var fix = function (num) {
                        if (num < 10) {
                            return '0' + num;
                        } else {
                            return num;
                        }
                    }
                    if (unit == dayUnit) {
                        date = Highcharts.dateFormat('%m-%d', this.x);
                    } else if (circle == 1) {
                        date = Highcharts.dateFormat('%H:%M', this.x);
                    } else {
                        minute = parseInt(Highcharts.dateFormat('%M', this.x));
                        minute = Math.round(minute / 5) * 5;
                        if (minute == 60) {
                            hour = parseInt(Highcharts.dateFormat('%H', this.x)) + 1;
                            date = fix(hour) + ':00';
                        } else {
                            date = Highcharts.dateFormat('%H:', this.x) + fix(minute);
                        }
                        date = Highcharts.dateFormat('%m-%d', this.x)+"  "+date;
                    }
                    
                    if(this.points.length == 2){
                        MMA1 =this.points[1].y.toFixed(2);
                        // MMA5 =this.points[2].y.toFixed(2);
                        // MMA15 =this.points[3].y.toFixed(2);
                        $reporting.html(
                            '  <br/><b style="color:#00FF00;width:33%;padding-left:10px">MA1:</b> '+ MMA1
                            // +'  <b style="color: #3300FF;width:33%;padding-left:20px">MMA5:</b> '+ MMA5
                            // +'  <b style="color:#FF0000;width:33%;padding-left:20px">MMA15:</b> '+ MMA15
                        );
                    }else if(this.points.length == 3){
                        MMA1 =this.points[1].y.toFixed(2);
                        MMA5 =this.points[2].y.toFixed(2);
                        // MMA15 =this.points[3].y.toFixed(2);
                        $reporting.html(
                            '  <br/><b style="color:#00FF00;width:33%;padding-left:10px">MA1:</b> '+ MMA1
                                +'  <b style="color: black;width:33%;padding-left:20px">MA5:</b> '+ MMA5
                            // +'  <b style="color:#FF0000;width:33%;padding-left:20px">MMA15:</b> '+ MMA15
                        );
                    }else if(this.points.length == 4){
                        MMA1 =this.points[1].y.toFixed(3);
                        MMA5 =this.points[2].y.toFixed(3);
                        MMA15 =this.points[3].y.toFixed(3);
                        $reporting.html(
                            '  <br/><b style="color:#00FF00;width:33%;padding-left:10px">MA1:</b> '+ MMA1
                                +'  <b style="color: black;width:33%;padding-left:10px">MA5:</b> '+ MMA5
                            +'  <b style="color:red;width:33%;padding-left:10px">MA15:</b> '+ MMA15
                        );
                    }else {
                         $reporting.html(
                           ""
                        );
                    }
                    

                    return '<b>' + date + '</b><br/>' + 
                           '<b>开盘价：</b>' + Highcharts.numberFormat(this.points[0]['point']['open'], 2) + '<br/>' + 
                           '<b>最高价：</b>' + Highcharts.numberFormat(this.points[0]['point']['high'], 2) + '<br/>' + 
                           '<b>最低价：</b>' + Highcharts.numberFormat(this.points[0]['point']['low'], 2) + '<br/>' + 
                           '<b>收盘价：</b>' + Highcharts.numberFormat(this.points[0]['point']['close'], 2);
                },
                followPointer:true,
                followTouchMove:true
            },
            plotOptions: {
                candlestick: {
                    upColor: '#f0302d',        // 涨 颜色
                    upLineColor: '#f0302d',    // 涨 线条颜色
                    color: '#17b03e',        // 跌 颜色
                    lineColor: '#17b03e'     // 跌 线条颜色
                }
            },
            xAxis: {
                labels: {
                    formatter: function () {
                        return Highcharts.dateFormat(unit == dayUnit ? '%m-%d' : '%H:%M', this.value);
                    },
                }
            },
            yAxis: [{
                labels: {
                    align: 'left',
                    x: 2
                },
                lineWidth: 1
            }],
            series: [{
                type: 'candlestick',
                name: $("#futuresName").val(),
                data: data[unit],
                dataGrouping: {
                    enabled: false
                },
                tooltip: {
                    valueDecimals: 2
                }
            },
            {
                type: 'spline',
                name: 'MMA1',
                color:'#00FF00',
                data: exma(1, unit),
                lineWidth:1,
                dataGrouping: {
                    enabled: false
                }
            },
            {
                type: 'spline',
                name: 'MMA5',
                data: exma(5, unit),
                color:'black',
                threshold: null, 
                lineWidth:1,
                dataGrouping: {
                    enabled: false
                }
            },
            {
                type: 'spline',
                name: 'MMA15',
                data: exma(15, unit),
                color:'red',
                threshold: null, 
                lineWidth:1,
                dataGrouping: {
                    enabled: false
                }
            }]

        });
    }

	//对数据进行处理
    var transData = function (msg) {
    	var data = msg['data'];
        var arr = [];
        for (var i in data) {
        	var time = new Date(data[i]['uptime'].replace(/-/g,'/'));
        	var timeParse =  Date.parse(time);
            arr.unshift([
                parseInt(timeParse), // the date
                parseFloat(data[i]['open']), // open
                parseFloat(data[i]['high']), // high
                parseFloat(data[i]['low']), // low
                parseFloat(data[i]['close']) // close
            ]);
        }
        return arr;
    }
    
    
     /**
     * 获取当前时间
     */
    Date.prototype.format = function(format) {
        var options = {
            "M+": this.getMonth() + 1, //month 
            "d+": this.getDate(), //day 
            "h+": this.getHours(), //hour 
            "m+": this.getMinutes(), //minute 
            "s+": this.getSeconds(), //second 
            "q+": Math.floor((this.getMonth() + 3) / 3), //quarter 
            "S": this.getMilliseconds() //millisecond 
        }

        if (/(y+)/.test(format)) {
            format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        }

        for (var k in options) {
            if (new RegExp("(" + k + ")").test(format)) {
                format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? options[k] : ("00" + options[k]).substr(("" + options[k]).length));
            }
        }

        return format;
    }
    
});
