//data sets
var byMonthData;
var byUserData;
var byProjectData;
var bySoftwareData;

//about color
var done_color = '#90ED7D';
var exit_color = '#FFFF00';
var terminated_color = '#7CB5EC';
var failed_color = '#F7A35C';
var hour_color = '#7F35A6';
var gray_bg = '#EEF2EA';

//datepicker
$('#from_date').datetimepicker({
	yearOffset : 0,
	lang : 'ch',
	timepicker : false,
	format : 'Y/m/d',
	formatDate : 'Y/m/d',
	minDate : '-1999/01/01',
	// yesterday is minimum date
	maxDate : '+2016/01/01' // and tommorow is maximum date calendar
});
$('#to_date').datetimepicker({
	yearOffset : 0,
	lang : 'ch',
	timepicker : false,
	format : 'Y/m/d',
	formatDate : 'Y/m/d',
	minDate : '-1999/01/01',
	// yesterday is minimum date
	maxDate : '+2016/01/01' // and tommorow is maximum date calendar
});

//get data and draw chart
$(function() {
	$.ajax({
		type : "post",
		url : "groupStatisticBasic.action",
		contentType : "application/x-www-form-urlencoded; charset=utf-8",
		data : {
			groupCode : groupCode
		},
		success : function(a, b, c) {
			var tmp = c.responseJSON.result;
			if(tmp == null){
				$(".well").text("暂无统计信息");
			}else{
				var bas = tmp.split(',');
				document.getElementById('users').innerHTML = bas[0];
				document.getElementById('softs').innerHTML = bas[1];
				document.getElementById('pros').innerHTML = bas[2];
				document.getElementById('jobs').innerHTML = bas[3];
				if (bas[4] === 'null') {
					document.getElementById('jobTime').innerHTML = 0;
				} else {
					document.getElementById('jobTime').innerHTML = bas[4];
				}
			}
		}
	});
	var fromDate = document.getElementById("from_date").value;
	var toDate = document.getElementById("to_date").value;
	$.ajax({
		type : "post",
		url : "groupStatisticByMonth.action",
		contentType : "application/x-www-form-urlencoded; charset=utf-8",
		data : {
			groupCode : groupCode,
			fromDate : fromDate,
			toDate : toDate
		},
		success : function(a, b, c) {
			var tmp = c.responseJSON.result;
			if(tmp == null) {
				$("#timing_chart").html("很抱歉，没查到任何数据");
			}else {
				eval('byMonthData=' + tmp);
				timingChart(byMonthData);
			}
		}
	});
	$.ajax({
		type : "post",
		url : "groupStatisticByUser.action",
		contentType : "application/x-www-form-urlencoded; charset=utf-8",
		data : {
			groupCode : groupCode,
			fromDate : fromDate,
			toDate : toDate
		},
		success : function(a, b, c) {
			var tmp = c.responseJSON.result;
			if(tmp == null) {
				$("#user_chart").html("很抱歉，没查到任何数据");
			}else {
				eval('byUserData=' + tmp);
				$('#userAct').addClass('active');
				$('#userAll').removeClass('active');
				userChart(byUserData, true);
			}
		}
	});
	$.ajax({
		type : "post",
		url : "groupStatisticByPro.action",
		contentType : "application/x-www-form-urlencoded; charset=utf-8",
		data : {
			groupCode : groupCode,
			fromDate : fromDate,
			toDate : toDate
		},
		success : function(a, b, c) {
			var tmp = c.responseJSON.result;
			if(tmp == null) {
				$("#project_chart").html("很抱歉，没查到任何数据");
			}else{
				eval('byProjectData=' + tmp);
				$('#proAct').addClass('active');
				$('#proAll').removeClass('active');
				projectChart(byProjectData, true);
			}
		}
	});
	$.ajax({
		type : "post",
		url : "groupStatisticBySoft.action",
		contentType : "application/x-www-form-urlencoded; charset=utf-8",
		data : {
			groupCode : groupCode,
			fromDate : fromDate,
			toDate : toDate
		},
		success : function(a, b, c) {
			var tmp = c.responseJSON.result;
			if(tmp == null) {
				$("#software_chart").html("很抱歉，没查到任何数据");
			}else{
				eval('bySoftwareData=' + tmp);
				$('#SoftAct').addClass('active');
				$('#SoftAll').removeClass('active');
				softwareChart(bySoftwareData, true);
			}
		}
	});
});

//set date range
function setDateRange() {
	var fromDate = document.getElementById("from_date").value;
	var toDate = document.getElementById("to_date").value;
	$.ajax({
		type : "post",
		url : "groupStatisticByMonth.action",
		contentType : "application/x-www-form-urlencoded; charset=utf-8",
		data : {
			groupCode : groupCode,
			fromDate : fromDate,
			toDate : toDate
		},
		success : function(a, b, c) {
			var tmp = c.responseJSON.result;
			if(tmp == null) {
				$("#timing_chart").html("很抱歉，没查到任何数据");
			}else {
				eval('byMonthData=' + tmp);
				timingChart(byMonthData);
			}
		}
	});
	$.ajax({
		type : "post",
		url : "groupStatisticByUser.action",
		contentType : "application/x-www-form-urlencoded; charset=utf-8",
		data : {
			groupCode : groupCode,
			fromDate : fromDate,
			toDate : toDate
		},
		success : function(a, b, c) {
			var tmp = c.responseJSON.result;
			if(tmp == null) {
				$("#user_chart").html("很抱歉，没查到任何数据");
			}else {
				eval('byUserData=' + tmp);
				$('#userAct').addClass('active');
				$('#userAll').removeClass('active');
				userChart(byUserData, true);
			}
		}
	});
	$.ajax({
		type : "post",
		url : "groupStatisticByPro.action",
		contentType : "application/x-www-form-urlencoded; charset=utf-8",
		data : {
			groupCode : groupCode,
			fromDate : fromDate,
			toDate : toDate
		},
		success : function(a, b, c) {
			var tmp = c.responseJSON.result;
			if(tmp == null) {
				$("#project_chart").html("很抱歉，没查到任何数据");
			}else{
				eval('byProjectData=' + tmp);
				$('#proAct').addClass('active');
				$('#proAll').removeClass('active');
				projectChart(byProjectData, true);
			}
		}
	});
	$.ajax({
		type : "post",
		url : "groupStatisticBySoft.action",
		contentType : "application/x-www-form-urlencoded; charset=utf-8",
		data : {
			groupCode : groupCode,
			fromDate : fromDate,
			toDate : toDate
		},
		success : function(a, b, c) {
			var tmp = c.responseJSON.result;
			if(tmp == null) {
				$("#software_chart").html("很抱歉，没查到任何数据");
			}else{
				eval('bySoftwareData=' + tmp);
				$('#SoftAct').addClass('active');
				$('#SoftAll').removeClass('active');
				softwareChart(bySoftwareData, true);
			}
		}
	});
}

//timing_chart
function timingChart(byMonthData) {
	if (byMonthData === null) {
		$('#monthNoData').removeClass('hidden');
		return;
	}
	//draw chart
	$('#timing_chart').highcharts({
		chart : {
			zoomType : 'xy'
		},
		title : {
			text : '<b>按提交作业日期统计</b>'
		},
		xAxis : [ {
			categories : byMonthData.month,
			crosshair : true
		} ],
		yAxis : [ { // Primary yAxis
			title : {
				text : '作业数',
				margin:20,
				style : {
					color : Highcharts.getOptions().colors[0]
				}
			},
			labels : {
				format : '{value}',
				style : {
					color : Highcharts.getOptions().colors[0]
				}
			}
		}, { // Secondary yAxis
			min:0,
			startOnTick: false,
			labels : {
				format : '{value}h',
				style : {
					color : hour_color
				}
			},
			title : {
				text : '用时',
				style : {
					color : hour_color
				}
			},
			opposite : true
		} ],
		tooltip : {
			shared : true,
			useHTML : true,
			formatter : function() {
				var s = '<b>' + this.x + '</b><table>';
				var flag = 0;
				$.each(this.points, function() {
					if (this.series.name != '用时') {
						if (flag === 0) {
							s += '<tr>';
							s += '<td>总作业数：</td>' + '<td style="text-align:right"><b>' + this.point.stackTotal + '</b></td>';
							s += '</tr>';
							flag = 1;
						}
					} else {
						s += '<tr>';
						s += '<td>' + this.series.name + ': </td>' + '<td style="text-align:right"><b>' + this.y + 'h' + '</b></td>';
						s += '</tr>';
					}
				});
				s += '</table>';
				return s;
			}
		},
		legend : {
			layout : 'vertical',
			align : 'right',
			x : -100,
			verticalAlign : 'top',
			y : 80,
			floating : true,
			backgroundColor : (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF',
			borderColor : '#CCC',
			borderWidth : 1,
			shadow : true
		},
		plotOptions : {
			column : {
				stacking : 'normal',
				dataLabels : {
					enabled : true,
					color : (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white',
					style : {
						textShadow : '0 0 3px black'
					}
				}
			}
		},
		series : [ {
			name : 'Done',
			color : done_color,
			type : 'column',
			yAxis : 0,
			data : byMonthData.doneNum,
			stack : "numOfJobs"
		}, {
			name : 'Exit',
			type : 'column',
			color : exit_color,
			yAxis : 0,
			data : byMonthData.exitNum,
			stack : "numOfJobs"
		}, {
			name : 'Failed',
			type : 'column',
			yAxis : 0,
			color : failed_color,
			data : byMonthData.failedNum,
			stack : "numOfJobs"
		}, {
			name : 'Terminated',
			type : 'column',
			yAxis : 0,
			color : terminated_color,
			data : byMonthData.terminatedNum,
			stack : "numOfJobs"
		}, {
			name : '用时',
			type : 'column',
			data : byMonthData.jobTime,
			color : hour_color,
			yAxis : 1,
			tooltip : {
				valueSuffix : ' 小时'
			},
			stack : "numOfHours"
		} ]
	});
}

//user_chart
var max_users = 7;
function userChart(byUserData, active) {
	if (byUserData === null) {
		$('#userNoData').removeClass('hidden');
		return;
	}
	var len = active ? byUserData.combinedNameAc.length : byUserData.combinedName.length;
	$('#user_chart').highcharts({
		chart : {
			zoomType : 'xy',
			backgroundColor : gray_bg
		},
		title : {
			text : '<b>按用户统计</b>',
			x : -20
		//center
		},
		scrollbar : {
			enabled : len > (max_users + 1)
		},
		xAxis : {
			max : (len > (max_users + 1) ? (max_users + 1) : len) - 1,
			min : 0,
			categories : active ? byUserData.combinedNameAc : byUserData.combinedName,
			crosshair : true
		},
		yAxis : [ { // Primary yAxis
			title : {
				text : '作业数',
				margin:20,
				style : {
					color : Highcharts.getOptions().colors[0]
				}
			},
			labels : {
				format : '{value}',
				style : {
					color : Highcharts.getOptions().colors[0]
				}
			}
		}, { // Secondary yAxis
			min:0,
			startOnTick: false,
			labels : {
				format : '{value}h',
				style : {
					color : hour_color
				}
			},
			title : {
				text : '用时',
				style : {
					color : hour_color
				}
			},
			opposite : true
		} ],
		tooltip : {
			shared : true,
			useHTML : true,
			formatter : function() {
				var s = '<b>' + this.x + '</b><table>';
				var flag = 0;
				$.each(this.points, function() {
					if (this.series.name != '用时') {
						if (flag === 0) {
							s += '<tr>';
							s += '<td>总作业数：</td>' + '<td style="text-align:right"><b>' + this.point.stackTotal + '</b></td>';
							s += '</tr>';
							flag = 1;
						}
					} else {
						s += '<tr>';
						s += '<td>' + this.series.name + ': </td>' + '<td style="text-align:right"><b>' + this.y + 'h' + '</b></td>';
						s += '</tr>';
					}
				});
				s += '</table>';
				return s;
			}
		},
		legend : {
			layout : 'vertical',
			align : 'right',
			x : -100,
			verticalAlign : 'top',
			y : 20,
			floating : true,
			backgroundColor : (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF',
			borderColor : '#CCC',
			borderWidth : 1,
			shadow : true
		},
		plotOptions : {
			column : {
				stacking : 'normal',
				dataLabels : {
					enabled : true,
					color : (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white',
					style : {
						textShadow : '0 0 3px black'
					}
				}
			}
		},
		series : [ {
			name : 'Done',
			type : 'column',
			yAxis : 0,
			data : active ? byUserData.doneNumAc : byUserData.doneNum,
			color : done_color,
			stack : "numOfJobs"
		}, {
			name : 'Exit',
			type : 'column',
			yAxis : 0,
			data : active ? byUserData.exitNumAc : byUserData.exitNum,
			color : exit_color,
			stack : "numOfJobs"
		}, {
			name : 'Failed',
			type : 'column',
			yAxis : 0,
			data : active ? byUserData.failedNumAc : byUserData.failedNum,
			color : failed_color,
			stack : "numOfJobs"
		}, {
			name : 'Terminated',
			type : 'column',
			yAxis : 0,
			data : active ? byUserData.terminatedNumAc : byUserData.terminatedNum,
			color : terminated_color,
			stack : "numOfJobs"
		}, {
			name : '用时',
			type : 'column',
			data : active ? byUserData.jobTimeAc : byUserData.jobTime,
			color : hour_color,
			yAxis : 1,
			tooltip : {
				valueSuffix : ' 小时'
			},
			stack : "numOfHours"
		} ]
	});
}

function drawUserChart(activated) {
	if (activated === 1) {
		userChart(byUserData, true);
		$('#userAct').addClass('active');
		$('#userAll').removeClass('active');
	} else {
		userChart(byUserData, false);
		$('#userAll').addClass('active');
		$('#userAct').removeClass('active');
	}
}

//project_chart
var max_projects = 7;
function projectChart(byProjectData, active) {
	if (byProjectData === null) {
		$('#proNoData').removeClass('hidden');
		return;
	}
	var len = active ? byProjectData.nameAc.length : byProjectData.name.length;
	$('#project_chart').highcharts({
		chart : {
			zoomType : 'xy'
		},
		title : {
			text : '<b>按项目统计</b>',
			x : -20
		//center
		},
		scrollbar : {
			enabled : len > (max_projects + 1)
		},
		xAxis : {
			max : (len > (max_projects + 1) ? (max_projects + 1) : len) - 1,
			min : 0,
			categories : active ? byProjectData.nameAc : byProjectData.name,
			crosshair : true
		},
		yAxis : [ { // Primary yAxis
			title : {
				text : '作业数',
				margin:20,
				style : {
					color : Highcharts.getOptions().colors[0]
				}
			},
			labels : {
				format : '{value}',
				style : {
					color : Highcharts.getOptions().colors[0]
				}
			}
		}, { // Secondary yAxis
			min:0,
			startOnTick: false,
			labels : {
				format : '{value}h',
				style : {
					color : hour_color
				}
			},
			title : {
				text : '用时',
				style : {
					color : hour_color
				}
			},
			opposite : true
		} ],
		tooltip : {
			shared : true,
			useHTML : true,
			formatter : function() {
				var s = this.x + '(点击查看项目详情)<table>';
				var flag = 0;
				$.each(this.points, function() {
					if (this.series.name != '用时') {
						if (flag === 0) {
							s += '<tr>';
							s += '<td>总作业数：</td>' + '<td style="text-align:right"><b>' + this.point.stackTotal + '</b></td>';
							s += '</tr>';
							flag = 1;
						}
					} else {
						s += '<tr>';
						s += '<td>' + this.series.name + ': </td>' + '<td style="text-align:right"><b>' + this.y + 'h' + '</b></td>';
						s += '</tr>';
					}
				});
				s += '</table></a>';
				return s;
			}
		},
		legend : {
			layout : 'vertical',
			align : 'right',
			x : -100,
			verticalAlign : 'top',
			y : 20,
			floating : true,
			backgroundColor : (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF',
			borderColor : '#CCC',
			borderWidth : 1,
			shadow : true
		},
		plotOptions : {
			column : {
				stacking : 'normal',
				dataLabels : {
					enabled : true,
					color : (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white',
					style : {
						textShadow : '0 0 3px black'
					}
				}
			}
		},
		series : [ {
			name : 'Done',
			type : 'column',
			yAxis : 0,
			data : active ? byProjectData.doneNumAc : byProjectData.doneNum,
			color : done_color,
			stack : "numOfJobs"
		}, {
			name : 'Exit',
			type : 'column',
			yAxis : 0,
			data : active ? byProjectData.exitNumAc : byProjectData.exitNum,
			color : exit_color,
			stack : "numOfJobs"
		}, {
			name : 'Failed',
			type : 'column',
			yAxis : 0,
			data : active ? byProjectData.failedNumAc : byProjectData.failedNum,
			color : failed_color,
			stack : "numOfJobs"
		}, {
			name : 'Terminated',
			type : 'column',
			yAxis : 0,
			data : active ? byProjectData.terminatedNumAc : byProjectData.terminatedNum,
			color : terminated_color,
			stack : "numOfJobs"
		}, {
			name : '用时',
			type : 'column',
			data : active ? byProjectData.jobTimeAc : byProjectData.jobTime,
			color : hour_color,
			yAxis : 1,
			tooltip : {
				valueSuffix : ' 小时'
			},
			stack : "numOfHours"
		} ]
	});
}

function drawProjectChart(activated) {
	if (activated === 1) {
		projectChart(byProjectData, true);
		$('#proAct').addClass('active');
		$('#proAll').removeClass('active');
	} else {
		projectChart(byProjectData, false);
		$('#proAct').removeClass('active');
		$('#proAll').addClass('active');
	}
}

//software_chart
var max_softwares = 9;
function softwareChart(bySoftwareData, active) {
	if (bySoftwareData === null) {
		$('#softNoData').removeClass('hidden');
		return;
	}
	var len = active ? bySoftwareData.softNameAc.length : bySoftwareData.softName.length;
	$('#software_chart').highcharts({
		chart : {
			zoomType : 'xy',
			backgroundColor : gray_bg
		},
		title : {
			text : '<b>按使用软件统计</b>',
			x : -20
		//center
		},
		scrollbar : {
			enabled : len > (max_softwares + 1)
		},
		xAxis : {
			useHTML : true,
			max : (len > (max_softwares + 1) ? (max_softwares + 1) : len) - 1,
			min : 0,
			categories : active ? bySoftwareData.softNameAc : bySoftwareData.softName,
			crosshair : true,
			labels : {
				rotation : 320
			//旋转30°
			}
		},
		yAxis : [ { // Primary yAxis
			title : {
				text : '作业数',
				margin:20,
				style : {
					color : Highcharts.getOptions().colors[0]
				}
			},
			labels : {
				format : '{value}',
				style : {
					color : Highcharts.getOptions().colors[0]
				}
			}
		}, { // Secondary yAxis
			min:0,
			startOnTick: false,
			labels : {
				format : '{value}h',
				style : {
					color : hour_color
				}
			},
			title : {
				text : '用时',
				style : {
					color : hour_color
				}
			},
			opposite : true
		} ],
		tooltip : {
			shared : true,
			useHTML : true,
			formatter : function() {
				var s = '<b>' + this.x + '</b><table>';
				var flag = 0;
				$.each(this.points, function() {
					if (this.series.name != '用时') {
						if (flag === 0) {
							s += '<tr>';
							s += '<td>总作业数：</td>' + '<td style="text-align:right"><b>' + this.point.stackTotal + '</b></td>';
							s += '</tr>';
							flag = 1;
						}
					} else {
						s += '<tr>';
						s += '<td>' + this.series.name + ': </td>' + '<td style="text-align:right"><b>' + this.y + 'h' + '</b></td>';
						s += '</tr>';
					}
				});
				s += '</table></a>';
				return s;
			}
		},
		legend : {
			layout : 'vertical',
			align : 'right',
			x : -100,
			verticalAlign : 'top',
			y : 20,
			floating : true,
			backgroundColor : (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF',
			borderColor : '#CCC',
			borderWidth : 1,
			shadow : true
		},
		plotOptions : {
			column : {
				stacking : 'normal',
				dataLabels : {
					enabled : true,
					color : (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white',
					style : {
						textShadow : '0 0 3px black'
					}
				}
			}
		},
		series : [ {
			name : '总作业数',
			type : 'column',
			yAxis : 0,
			data : active ? bySoftwareData.jobNumAc : bySoftwareData.jobNum,
			color : done_color,
			stack : "numOfJobs"
		}, {
			name : '用时',
			type : 'column',
			data : active ? bySoftwareData.jobTimeAc : bySoftwareData.jobTime,
			color : hour_color,
			yAxis : 1,
			tooltip : {
				valueSuffix : ' h'
			},
			stack : "numOfHours"
		} ]
	});
}

function drawSoftwareChart(activated) {
	if (activated === 1) {
		softwareChart(bySoftwareData, true);
		$('#softAct').addClass('active');
		$('#softAll').removeClass('active');
	} else {
		softwareChart(bySoftwareData, false);
		$('#softAct').removeClass('active');
		$('#softAll').addClass('active');
	}
}

function naviTo(toId) {
	$('body,html').animate({
		scrollTop : $('#' + toId).position().top
	}, 800);
}

function goToProStatistic(proCode, proName) {
	var url = 'statistic/proStatistic.jsp?pro_code=' + proCode;
	var params = '{' + 'pro_name : "' + proName + '"}';
	eval('var paramsObj=' + params);
	Xfinity.Util.post(url, paramsObj);
}

function goToUserStatistic() {
	var url = 'statistic/userStatistic.jsp';
	Xfinity.Util.post(url,null);
}