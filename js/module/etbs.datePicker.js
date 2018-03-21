/**
 * @etbs.datePicker
 * 1.(선택)은 사용자 임의로 설정할수 있음
 * 2.(필수)는 사용자가 반드시 설정해야함
 * 3.(공통)은 기능수정 또는 html 수정을 해야함
 * 4.etbs.alert & etbs.loading & etbs.dimmed 필요
 */
(function(){
	"use strict";
	/**
	 * @etbs.datePicker
	 * 날짜포맷 설정
	 */
	etbs.datePicker = function(settings){
		var base = {
			element : null, 			//(필수)화면당 중복되지 않는 id를 준다. 예) $('#id')
			layer : $('div#datePicker'),//(공통)레이어는 하나만 존재
			id : null,					//(공통)클래스가 아닌 아이디로 등록했을경우
			wrap : null,				//(공통)datePicker
			btn : null, 				//(공통)버튼 html 이 존재해야함
			today : new Date(),			//(공통)금일
			dual : false, 				//(공통)달력두개여부 (settings.end.date 가 존재해야함)
			hour : false,				//(공통)시간선택여부
			width : 212,				//(공통)넓이
			height : 245, 				//(공통)hour기 true면 271
			format : null,//(선택)data-format="yyyyMMdd"
			min : null,					//(공통)최소년도
			max : null,					//(공통)최대년도
			term : false, 				//(공통)기간선택여부
			termType : 'UL',			//(공통)기간선택 Tag(SELECT or Ul)
			termElement : null,			//(공통)기간선택 Element(SELECT or Ul)
			termElementLi : null,
			termElementOption : null,
			disabled : false,
			limitUrl : null, 			//(선택)제한일 API 요청 URL
			fail : false,
			firstLoading : false,
			beforeToday : true,			//처음 달력 오늘 이전 날짜 선택 여부
			limit : { //(선택)제한기간
				start : null,
				end : null
			},
			limitArray : { //(선택)제외날짜[]
				start : null,
				end : null
			},
			option : {
				year : null,
				month : null,
				hour : null,
				min : null,
				html : null
			},
			unit : {
				year : null,
				month : null,
				hour : null,
				min : null
			},
			start : {
				date : new Date(),
				dummy : null,
				backup : null,
				btnPrev : null,
				btnNext : null,
				selectYear : null,
				selectMonth : null,
				selectHour : null,
				selectMin : null,
				selectYearChange : function(obj){},
				selectMonthChange : function(obj){}
			},
			end : {
				date : new Date(),
				dummy : null,
				backup : null,
				btnPrev : null,
				btnNext : null,
				selectYear : null,
				selectMonth : null,
				selectHour : null,
				selectMin : null,
				selectYearChange : function(obj){},
				selectMonthChange : function(obj){}
			},
			endSettings : function(){
				if(this.id){
					etbs.datePicker[this.id] = this;
				}
				this.callback();
			},
			callback : function(){}, //(선택)기간선택 및 날짜선택시 발생
			open : function(){ //(선택)달력열기
				//레이어 위치 설정
				var posx = this.wrap.offset().left,
					posy = this.wrap.offset().top + 15;
				if($(window).width() < (posx + this.width)){ // 해상도 부족 : 상하좌우 정렬
					this.layer.css({'margin-left' : -(this.width - (this.dual == 0 ? 116 : 236)) + 'px'}); //To-do 116 : 236
				}else{
					this.layer.css({'margin-left' : '0'});
				}
				if($(window).height() < (posy + this.height) - $(window).scrollTop()){
					this.layer.css({'margin-top' : (-(this.height + 15)) + 'px'});
				}else{
					this.layer.css({'margin-top' : '0'});
				}
				this.layer.css({left : posx, top : posy});
				//레이어 열기
				this.layer.show();
				etbs.dimmed.open({target:'datePicker',transparent:true}); //딤투명처리
			},
			close : function(){ //(선택)달력닫기
				this.layer.hide();
				etbs.dimmed.close({target:'datePicker'});
			},
			firstDay : function(year, month){ //(공통)첫째 날짜,요일
				return new Date(year, month, 1).getDay();
			},
			lastDay : function(year, month){ //(공통)마지막 날짜
				return new Date(year, month + 1, 0).getDate();
			},
			addZero : function(n){ //(공통)숫자앞에 0을 붙인다.
				return n < 10 ? '0' + n : n;
			},
			addOtion : function(time){ //select option 만들기
				var self = this,min,max;
				switch (time) {
					case 'year':
						min = self.min;
						max = self.max;
				        break;
					case 'month':
						min = 1;
						max = 12;
				        break;
					case 'hour':
						min = 0;
						max = 23;
				        break;
					case 'min':
						min = 0;
						max = 59;
				        break;
				}
				settings.option[time] = '<select class="select_'+time+'">';
				for(var i = min; i <= max; i++){
					settings.option[time] += '<option>' + settings.addZero(i) + '</option>';
				}
				settings.option[time] += '</select>';
				return settings.option[time];
			}
		}
		settings = $.extend(base, settings);

		if(!settings.min){
			settings.min = parseInt(new Date().format('yyyy')) - 10;
		}
		if(!settings.max){
			settings.max = parseInt(new Date().format('yyyy')) + 10;
		}
		//global
		settings.id = settings.element.attr('id');
		if(settings.id){
			etbs.datePicker[settings.id] = settings;
		}
		settings.format = settings.element.attr('data-format');
		if(!settings.format){
			settings.format = "yyyy-MM-dd hh:mm";
		}
		var regExp = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"\' ']/gi; //특수문자 찾기
		var strRegExp = /\d+|[a-z|A-Z]/g; //알파벳 찾기
		settings.element.find('input').each(function(){
			$(this).mask(settings.format.replace(strRegExp,'0'));
			$(this).attr('placeholder', settings.format.replace(strRegExp,'0'));
		});
		
		//select option 기본 html 만들기
		settings.option.html =  '<div class="con">';
		settings.option.html += '<div class="nav"><span class="btn_prev"></span><span class="btn_next"></span>' + settings.addOtion('year') + settings.addOtion('month') +'</div>';
		settings.option.html += '<div class="calendar"></div>';
		settings.option.html += '<div class="time">' + settings.addOtion('hour') + ' 시' + settings.addOtion('min') + ' 분' + '</div>';
		settings.option.html += '</div>';

		//기본 날짜입력
		settings.start.date.setHours('00');
		settings.start.date.setMinutes('00');
		settings.start.date.setSeconds('00');
		settings.end.date.setHours('23');
		settings.end.date.setMinutes('59');
		settings.end.date.setSeconds('59');

		//핸재 yyyyMMddHHmm 포맷에 대한 검사만 존재함
		var dateVaild = function(input){
			var str = input.eq(0).val().replace(regExp,'');
			if(str.length < 8){
				settings.start.date = new Date();
				if(settings.dual){
					settings.end.date = new Date();
				}
				return;
			}
			settings.start.date.setFullYear(str.substring(0, 4));
			settings.start.date.setMonth(parseInt(str.substring(6, 4)) - 1);
			settings.start.date.setDate(str.substring(8, 6));
			settings.start.date.setHours(str.substring(10, 8));
			settings.start.date.setMinutes(str.substring(12, 10));
			if(settings.dual){
				var str = input.eq(1).val().replace(regExp,'');
				settings.end.date.setFullYear(str.substring(0, 4));
				settings.end.date.setMonth(parseInt(str.substring(6, 4)) - 1);
				settings.end.date.setDate(str.substring(8, 6));
				settings.end.date.setHours(str.substring(10, 8));
				settings.end.date.setMinutes(str.substring(12, 10));
			}
		}

		//limitArray init(limitUrl 이 있을경우 최초 해당 달의 휴일을 서버에 불러와 저장한다.)
		var setLimitArray = function(where,param){
			$.ajax({url : settings.limitUrl, data : params}).done(function(data) {
				settings.limitArray[where] = data.resultMap.date;
			});
		}
		if(settings.limitUrl != null){
			var input = settings.element.find('input');
			var params = {
				year : settings.today.format('yyyy'),
				month : settings.today.format('MM')
			}
			if(input.eq(0).val() != ''){
				var str = input.eq(0).val().replace(regExp,'')
				params.year = str.substring(0, 4);
				params.month = str.substring(6, 4);
				setLimitArray('start',params);
			}else{
				setLimitArray('start',params);
			}
			if(input.length > 1){
				if(input.eq(1).val() != ''){
					var str = input.eq(1).val().replace(regExp,'')
					params.year = str.substring(0, 4);
					params.month = str.substring(6, 4);
					setLimitArray('end',params);
				}else{
					setLimitArray('end',params);
				}
			}
		}
		//달력 그리기
		var setDay = function(obj,parent){
			var table = '<table><tr><th>일</th><th>월</th><th>화</th><th>수</th><th>목</th><th>금</th><th>토</th></tr>',
				tr = '',
				first = settings.firstDay(obj.getFullYear(),obj.getMonth()),
				last = settings.lastDay(obj.getFullYear(),obj.getMonth()),
				num = 0,
				flag = false;

			var where = 'start';
			if(parent.index() != 0){
				where = 'end';
			}
			var limitArray = (settings.limitArray[where]) ? settings.limitArray[where].split(',') : null;
			for(var week = 0 ; week < 6 ; week++){
				tr += '<tr>';
				for(var day = 0 ; day < 7 ; day++){
					if(day == first){
						flag = true;
					}
					if(num == last + 1){
						flag = false;
					}
					if(flag){
						num++;
					}
					var dayNum = settings.addZero(num),
						disabled = '',
						on = (num == obj.getDate()) ? 'on' : '';

					if(settings.limit.start){
						settings.limit.start = settings.limit.start.replace(regExp,'').substring(0,8); //특수문자제거
					}
					if(settings.limit.end){
						settings.limit.end = settings.limit.end.replace(regExp,'').substring(0,8);
					}
					//TODO : 리팩토링
					if(!settings.dual && settings.limit.start){
						if(settings.start.date.format('yyyyMM') + dayNum < settings.limit.start){
							disabled = 'disabled';
						}
					}
					if(!settings.dual && settings.limit.end){
						if(settings.start.date.format('yyyyMM') + dayNum > settings.limit.end){
							disabled = 'disabled';
						}
					}
					if(where == 'start' && settings.limit.start){
						if(settings.start.date.format('yyyyMM') + dayNum < settings.limit.start){
							disabled = 'disabled';
						}
					}
					if(where == 'end' && settings.limit.end){
						if(settings.end.date.format('yyyyMM') + dayNum > settings.limit.end){
							disabled = 'disabled';
						}
					}
					if(settings.dual && where == 'start' && settings.start.date.format('yyyyMM') == settings.end.date.format('yyyyMM')){
						if(settings.start.date.format('yyyyMM') + dayNum > settings.end.date.format('yyyyMMdd')){
							disabled = 'disabled';
						}
					}
					if(settings.dual && where == 'end' && settings.start.date.format('yyyyMM') == settings.end.date.format('yyyyMM')){
						if(settings.end.date.format('yyyyMM') + dayNum < settings.start.date.format('yyyyMMdd')){
							disabled = 'disabled';
						}
					}
					if(limitArray){
						for(var s in limitArray){ //제외기간 및 제외날짜 체크
							if(limitArray[s] == dayNum){
								disabled = 'disabled';
							}
						}
					}
					if (!settings.beforeToday && where == 'start') {
						if(settings.start.date.format('yyyyMM') + dayNum < (new Date()).format('yyyyMMdd')){
							disabled = 'disabled';
						}
					}
					if(num == 0 || num > last){
						tr += '<td></td>';
					}else{
						tr += '<td><span class="'+on+' '+disabled+'">' + dayNum + '</span></td>';
					}
				}
				tr += '</tr>';
			};
			tr += '</table>';
			parent.find('.calendar').html(table + tr);
		}
		//달력 셋팅
		var process = function(obj,parent){
			setDay(obj,parent);
			parent.find('td span').click(function(){
				if($(this).hasClass('disabled')){
					return;
				}
				var dummyObj;
				if(obj == settings.start.date){
					dummyObj = settings.start.dummy;
				}else{
					dummyObj = settings.end.dummy;
				}
				obj.setDate($(this).text());
				if(settings.start.date > settings.end.date && settings.dual){
					etbs.alert.open({message:'시작 날짜는 종료 날짜 이후로 설정할 수 없습니다.'});
					obj.setDate(dummyObj.getDate());
					return;
				}else{
					dummyObj.setDate($(this).text());
				}
				var idxCon = $(this).parent().parent().parent().parent().parent().parent();
				if(idxCon.index() > 0){
					setCalendar(settings.start.date,settings.layer.find('.con:eq(0)'));
				}
				if(idxCon.index() == 0 && settings.dual){
					setCalendar(settings.end.date,settings.layer.find('.con:eq(1)'));
				}

				$(this).parent().parent().parent().find('span').removeClass('on');
				$(this).addClass('on');
				settings.fail = false;
			});
			if(settings.today.format('yyyyMM') == obj.format('yyyyMM')){
				parent.find('td span').each(function(){
					if($(this).text() == settings.today.format('dd')){
						$(this).addClass('today');
					}
				});
			}
		}
		//달력 셋팅
		var setCalendar = function(obj,parent){
			if(parseInt(obj.format('yyyy')) < settings.min || parseInt(obj.format('yyyy')) > settings.max){
				obj = new Date();
				if(parent.index() == 0){
					settings.start.date = obj;
				}else{
					settings.end.date = obj;
				}
			}
			parent.find('.select_year').val(obj.format('yyyy'));
			parent.find('.select_month').val(obj.format('MM'));
			parent.find('.select_hour').val(obj.format('HH'));
			parent.find('.select_min').val(obj.format('mm'));

			var where = 'start';
			if(parent.index() != 0){
				where = 'end';
			}
			var params = {
				year : obj.format('yyyy'),
				month : obj.format('MM')
			}
			if(settings.limitUrl != null){
				$.ajax({url : settings.limitUrl, data : params}).done(function(data) {
					settings.limitArray[where] = data.resultMap.date;
				});
				process(obj,parent);
			}else{
				process(obj,parent);
			}
			if(settings.start.date.format('yyyyMM') == settings.end.date.format('yyyyMM') && settings.dual){
				settings.layer.find('.con:eq(0) .btn_next').hide();
				settings.layer.find('.con:eq(1) .btn_prev').hide();
			}else{
				settings.layer.find('.btn_prev').show();
				settings.layer.find('.btn_next').show();
			}
			if(settings.layer.find('.on.disabled').length > 0){
				settings.fail = true;
				if(settings.id == "drawDatePicker" ){
					etbs.alert.open({message:'추첨일시는 응모기간보다 빠를 수 없습니다.다른 날짜를 선택해주세요.'});
				}else if(settings.id == "winDatePicker" ){
					etbs.alert.open({message:'당첨 발표일시는 추첨일시보다 빠를 수 없습니다.다른 날짜를 선택해주세요.'});
				}else{
					etbs.alert.open({message:'입력 불가능한 날짜입니다. 다른 날짜를 선택해주세요.'});
				}
			}else{
				settings.fail = false;
			}
		}
		/**
		 * @etbs.datePicker
		 * 클릭후 레이어를 초기하며 달력을 그린다.
		 */
		settings.element.find('.btnDatePicker').click(function(event){

			if(settings.disabled){
				event.preventDefault();
				return;
			}
			//레이어 초기설정
			settings.wrap = $(this).parent();
			settings.format = settings.wrap.attr('data-format');

			//레이어 사이즈 설정
			var inputElement = settings.wrap.find('input');
			if(inputElement.length < 2){
				settings.dual = false;
				settings.width = 212;
			}else{
				settings.dual = true;
				settings.width = 422;
			}
			settings.layer.css({'width':settings.width});

			//시간여부 설정
			if(settings.format != 'yyyyMMdd' && settings.format != 'yyyy-MM-dd' && settings.format != 'yyyy/MM/dd'){
				settings.hour = true;
				settings.height = 271;
			}else{
				settings.hour = false;
			}
			settings.start.dummy = new Date(settings.start.date),
			settings.end.dummy = new Date(settings.end.date);

			//date input value valid
			if(inputElement.eq(0).val() != '' && inputElement.eq(1).val() != ''){
				dateVaild(inputElement);
			}
			//최초 로딩
			if(!settings.firstLoading){
				settings.start.backup = settings.start.date;
				settings.end.backup = settings.end.date;
			}
			settings.firstLoading = true;
			settings.open();

			var btnWrap = ''+
			'<div class="btnWrap">'+
				'<span class="button small confirm"><button type="button">확인</button></span>'+
				'<span class="button small cancel"><button type="button">취소</button></span>'+
			'</div>';

			settings.layer.html('<div class="wrap"></div>');
			if(settings.dual){
				settings.layer.find('.wrap').html(settings.option.html + settings.option.html + btnWrap);
				setCalendar(settings.start.date,settings.layer.find('.con:eq(0)'));
				setCalendar(settings.end.date,settings.layer.find('.con:eq(1)'));
			}else{
				settings.layer.find('.wrap').html(settings.option.html + btnWrap);
				setCalendar(settings.start.date,settings.layer.find('.con:eq(0)'));
			}
			var startCon = settings.layer.find('.con:eq(0)'),
				endCon = settings.layer.find('.con:eq(1)');

			//start.date nav
			startCon.find('.btn_prev').click(function(){
				settings.start.date.addMonths(-1);
				setCalendar(settings.start.date,startCon);
				settings.start.dummy.addMonths(-1);
			});
			startCon.find('.btn_next').click(function(){
				settings.start.date.addMonths(+1);
				setCalendar(settings.start.date,startCon);
				settings.start.dummy.addMonths(+1);
			});
			startCon.find('.select_year').change(function(){
				settings.start.date.setFullYear($(this).val());
				setCalendar(settings.start.date,startCon);
				if(settings.start.date > settings.end.date && settings.dual){
					etbs.alert.open({message:'시작 날짜는 종료 날짜 이후로 설정할 수 없습니다.'});
					settings.fail = true;
					//settings.start.date.setFullYear(settings.start.dummy.getFullYear());
					//setCalendar(settings.start.date,startCon);
					//return;
				}
				settings.start.dummy.setFullYear($(this).val());
			});
			startCon.find('.select_month').change(function(){
				settings.start.date.addMonths($(this).val() - (settings.start.date.getMonth() + 1));
				setCalendar(settings.start.date,startCon);
				if(settings.start.date > settings.end.date && settings.dual){
					etbs.alert.open({message:'시작 날짜는 종료 날짜 이후로 설정할 수 없습니다.'});
					settings.start.date.setMonth(settings.start.dummy.getMonth());
					setCalendar(settings.start.date,startCon);
					return;
				}
				settings.start.dummy.addMonths($(this).val() - (settings.start.dummy.getMonth() + 1));
			});
			startCon.find('.select_hour').change(function(){
				settings.start.date.setHours($(this).val());
				setCalendar(settings.start.date,startCon);
				if(settings.start.date > settings.end.date && settings.dual){
					etbs.alert.open({message:'시작 날짜는 종료 날짜 이후로 설정할 수 없습니다.'});
					settings.start.date.setHours(settings.start.dummy.getHours());
					setCalendar(settings.start.date,startCon);
					return;
				}
				settings.start.dummy.setHours($(this).val());
			});
			startCon.find('.select_min').change(function(){
				settings.start.date.setMinutes($(this).val());
				setCalendar(settings.start.date,startCon);
				if(settings.start.date > settings.end.date && settings.dual){
					etbs.alert.open({message:'시작 날짜는 종료 날짜 이후로 설정할 수 없습니다.'});
					settings.start.date.setMinutes(settings.start.dummy.getMinutes());
					setCalendar(settings.start.date,startCon);
					return;
				}
				settings.start.dummy.setMinutes($(this).val());
			});
			//end.date nav
			endCon.find('.btn_prev').click(function(){
				settings.end.date.addMonths(-1);
				// 2017-06-16, fixalot, 변경 시작
				if(settings.start.date > settings.end.date && settings.dual){
					settings.end.date.setMonth(settings.start.date.getMonth());
					settings.end.date.setDate(settings.start.date.getDate());
				}
				setCalendar(settings.end.date,endCon);
				settings.end.dummy.addMonths(-1);
			});
			endCon.find('.btn_next').click(function(){
				settings.end.date.addMonths(+1);
				if(settings.start.date > settings.end.date && settings.dual){
					settings.end.date.setMonth(settings.start.date.getMonth());
					settings.end.date.setDate(settings.start.date.getDate());
				}
				setCalendar(settings.end.date,endCon);
				// 2017-06-16, fixalot, 변경 끝
				settings.end.dummy.addMonths(+1);
			});
			endCon.find('.select_year').change(function(){
				settings.end.date.setFullYear($(this).val());
				setCalendar(settings.end.date,endCon);
				if(settings.start.date > settings.end.date && settings.dual){
					etbs.alert.open({message:'종료 날짜는 시작 날짜 이전으로 설정할 수 없습니다.'});
					settings.fail = true;
					//settings.end.date.setFullYear(settings.end.dummy.getFullYear());
					//setCalendar(settings.end.date,endCon);
					//return;
				}
				settings.end.dummy.setFullYear($(this).val());
			});
			endCon.find('.select_month').change(function(){
				settings.end.date.addMonths($(this).val() - (settings.end.date.getMonth() + 1));
				setCalendar(settings.end.date,endCon);
				if(settings.start.date > settings.end.date && settings.dual){
					etbs.alert.open({message:'종료 날짜는 시작 날짜 이전으로 설정할 수 없습니다.'});
					settings.end.date.setMonth(settings.end.dummy.getMonth());
					setCalendar(settings.end.date,endCon);
					return;
				}
				settings.end.dummy.addMonths($(this).val() - (settings.end.dummy.getMonth() + 1));
			});
			endCon.find('.select_hour').change(function(){
				settings.end.date.setHours($(this).val());
				setCalendar(settings.end.date,endCon);
				if(settings.start.date > settings.end.date && settings.dual){
					etbs.alert.open({message:'시작 날짜는 종료 날짜 이후로 설정할 수 없습니다.'});
					settings.end.date.setHours(settings.end.dummy.getHours());
					setCalendar(settings.end.date,endCon);
					return;
				}
				settings.end.dummy.setHours($(this).val());
			});
			endCon.find('.select_min').change(function(){
				settings.end.date.setMinutes($(this).val());
				setCalendar(settings.end.date,endCon);
				if(settings.start.date > settings.end.date && settings.dual){
					etbs.alert.open({message:'시작 날짜는 종료 날짜 이후로 설정할 수 없습니다.'});
					settings.end.date.setMinutes(settings.end.dummy.getMinutes());
					setCalendar(settings.end.date,endCon);
					return;
				}
				settings.end.dummy.setMinutes($(this).val());
			});
			//event
			if(settings.hour){
				settings.layer.find('.time').show();
			}
			settings.layer.find('.cancel').click(function(){
				settings.close();
			});
			settings.layer.find('.confirm').click(function(){
				if(settings.fail){
					if(settings.id == "drawDatePicker" ){
						etbs.alert.open({message:'추첨일시는 응모기간보다 빠를 수 없습니다.다른 날짜를 선택해주세요.'});
					}else if(settings.id == "winDatePicker" ){
						etbs.alert.open({message:'당첨 발표일시는 추첨일시보다 빠를 수 없습니다.다른 날짜를 선택해주세요.'});
					}else{
						etbs.alert.open({message:'입력 불가능한 날짜입니다. 다른 날짜를 선택해주세요.'});
					}
					return;
				}
				settings.start.date.setFullYear(startCon.find('.select_year').val());
				settings.start.date.setMonth(startCon.find('.select_month').val()-1);
				var start,
					end;
				if(settings.dual){
					settings.end.date.setFullYear(endCon.find('.select_year').val());
					settings.end.date.setMonth(endCon.find('.select_month').val()-1);
					end = settings.wrap.find('input:eq(1)').val(settings.end.date.format(settings.format)).val();
				}
				start = settings.wrap.find('input:eq(0)').val(settings.start.date.format(settings.format)).val();
				settings.endSettings();
				settings.close()
			});//end
		});
		/**
		 * @dateSelect
		 * 기간검색
		 */
		var setTermDate = function(term,startInput,endInput,format){
			switch (term){
			case '30':
				settings.start.date.addMonths(-1);
			    break;
			case '90':
				settings.start.date.addMonths(-3);
				break;
			case '180':
				settings.start.date.addMonths(-6);
				break;
			case '365':
				settings.start.date.addMonths(-12);
			    break;
			default:
				settings.start.date.setDate(settings.end.date.getDate()-term);
		    	break;
			}
			if(term == 'all'){
				startInput.prop('disabled',true).val('');
				endInput.prop('disabled',true).val('');
				settings.endSettings();
				settings.disabled = true;
				return;
			}else{
				startInput.prop('disabled',false);
				endInput.prop('disabled',false);
				settings.disabled = false;
			}
			startInput.val(settings.start.date.format(format));
			endInput.val(settings.end.date.format(format));
			settings.endSettings();
		}
		settings.element.each(function(){
			if($(this).next()[0]){
				settings.termType = $(this).next()[0].nodeName;
			}else{
				return;
			}
			if($(this).next().hasClass('dateSelect') && settings.termType == 'UL'){
				settings.term = true;
				settings.termElement = $(this).next();
				settings.termElementLi = settings.termElement.find('li');
			}
			if($(this).next().hasClass('dateSelect') && settings.termType == 'SELECT'){
				settings.term = true;
				settings.termElement = $(this).next();
				settings.termElementOption = settings.termElement.find('option');
			}
			if(settings.term && settings.termType == 'SELECT'){
				settings.termElement.change(function(){
					settings.start.date = new Date();
					settings.end.date = new Date();
					var startInput = $(this).prev().find('input:eq(0)'),
						endInput = $(this).prev().find('input:eq(1)'),
						term = $(this).val(),
						format = $(this).prev().attr('data-format');
					setTermDate(term,startInput,endInput,format);
				});
				settings.termElement.change();
			}
			if(settings.term && settings.termType == 'UL'){
				settings.termElementLi.click(function(){
					settings.start.date = new Date();
					settings.end.date = new Date();
					settings.termElementLi.removeClass('on');
					$(this).addClass('on');
					var startInput = $(this).parent().prev().find('input:eq(0)'),
						endInput = $(this).parent().prev().find('input:eq(1)'),
						term = $(this).attr('data-term'),
						format = $(this).parent().prev().attr('data-format');
					setTermDate(term,startInput,endInput,format);
				});
				settings.termElementLi.each(function(){
					if($(this).hasClass('on')){
						$(this).click();
					}
				});
			}
		});
	}
	/**
	 * Date.prototype.format
	 * 날짜포맷 설정
	 */
	String.prototype.string = function(len){var s = "", i = 0; while (i++ < len){ s += this; } return s;};
	String.prototype.subFormat = function(len){return '0'.string(len - this.length) + this;};
	Number.prototype.subFormat = function(len){return this.toString().subFormat(len);};
	Date.prototype.format = function(f){
	    if(!this.valueOf()) return '';
	    var weekName = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
	    var d = this;
	    return f.replace(/(yyyy|yy|MM|dd|E|hh|mm|ss|a\/p)/gi, function($1){
	        switch($1){
	            case 'yyyy': return d.getFullYear();
	            case 'yy': return (d.getFullYear() % 1000).subFormat(2);
	            case 'MM': return (d.getMonth() + 1).subFormat(2);
	            case 'dd': return d.getDate().subFormat(2);
	            case 'E': return weekName[d.getDay()];
	            case 'HH': return d.getHours().subFormat(2);
	            case 'hh': return ((h = d.getHours() % 12) ? h : 12).subFormat(2);
	            case 'mm': return d.getMinutes().subFormat(2);
	            case 'ss': return d.getSeconds().subFormat(2);
	            case 'a/p': return d.getHours() < 12 ? '오전' : '오후';
	            default: return $1;
	        }
	    });
	}
	Number.prototype.to2 = function() {
		return this < 10 ? '0' + this : this;
	};
	Date.prototype.getYMD = function() { // format : yyyy-mm-dd
		return this.getFullYear() + '-' + (this.getMonth() + 1).to2() + '-'
				+ this.getDate().to2();
	}
	Date.prototype.setDateStr = function(str) { // format : yyyy-mm-dd
		str = (str || (new Date()).getYMD()).split('-');
		return new Date(str[0], str[1] - 1, str[2]);
	}
	Date.prototype.getList = function(toStr) {
		var to = this.setDateStr(toStr);
		var r = [];
		while (1) {
			if (this.getYMD() > to.getYMD())
				break;
			r.push(this.getYMD());
			this.setDate(this.getDate() + 1);
		}
		return r;
	}
	/**
	 * 윤년 계산
	 */
	Date.isLeapYear = function(year) { 
	    return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0)); 
	};
	Date.getDaysInMonth = function(year, month) {
	    return [31, (Date.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
	};
	Date.prototype.isLeapYear = function() { 
	    return Date.isLeapYear(this.getFullYear()); 
	};
	Date.prototype.getDaysInMonth = function() { 
	    return Date.getDaysInMonth(this.getFullYear(), this.getMonth());
	};
	Date.prototype.addMonths = function(value) {
	    var n = this.getDate();
	    this.setDate(1);
	    this.setMonth(this.getMonth() + value);
	    this.setDate(Math.min(n, this.getDaysInMonth()));
	    return this;
	};
})();

function getDateList(fromStr, toStr) {
	return (new Date()).setDateStr(fromStr).getList(toStr);
}
