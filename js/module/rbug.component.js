/**
 * @rbug.component
 * 1. rbug 전역변수 = container (모든 컴포넌트를 담는다.) 관련 기능의 모듈 주석에는 '@'를 추가한다.
 * 2. 모든 컴포넌트 플러그인은 선택옵션과 필수옵션을 받아 기본옵션을 덮는다. ($.extend 사용)
 * 3. rbug.common.js 에서 플러그인을 공통으로 실행시키지만 별도 사용시 class 또는 id 로 분기하여 각화면별 구현한다.
 */
var rbug = new Object();
(function(){
	'use strict';
	/**
	 * map이 지원되지 않는 브라우져를 위해 추가.
	 */
	if(!('map' in Array.prototype)){
		Array.prototype.map = function(mapper, that){
			var other = new Array(this.length);
			for(var i = 0, n = this.length; i < n; i++){
				if(i in this){
					other[i] = mapper.call(that, this[i], i, this);
				}
			}
			return other;
		};
	}
	/**
	 * IE7, IE8에서 trim 추가 
	 * 공백제거
	 */
	if(typeof String.prototype.trim !== 'function'){
		String.prototype.trim = function() {
			return this.replace(/^\s+|\s+$/g, '');
		}
	}
	/**
	 * Number.prototype.format([fix, seperator, seperator2])
	 */
	Number.prototype.format = function(c, d, t){
		var n = this,
		c = isNaN(c = Math.abs(c)) ? 2 : c, d = d == undefined ? "." : d,
		t = t == undefined ? "," : t, s = n < 0 ? "-" : "",
		i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))), j = (j = i.length) > 3 ? j % 3 : 0;

		return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t)
				+ (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
	};
	/**
	 * @modules 
	 */
	rbug = {
		modules : {},
		controller : function(target){
			var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m,
				FN_ARG_SPLIT = /,/,
				FN_ARG = /^\s*(_?)(\S+?)\1\s*$/,
				STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg,
				text = target.toString().replace(/ /gi, ''),
				args = text.match(FN_ARGS)[1].split(',');
			target.apply(target, this.getDependencies(args));
		},
		getDependencies : function(arr){
			var self = this;
			return arr.map(function(value){
				return self.modules[value];
			});
		},
		module : function(name, dependency){
			this.modules[name] = dependency;
		},
		browser : {
			ie7 : (!!window.navigator.userAgent.match(/MSIE 7.0/)) ? true : false,
			ie8 : (!!window.navigator.userAgent.match(/MSIE 8.0/)) ? true : false
		},
		zIndex : 400
	}
	/**
	 * @help : 말풍선 아이콘에 마우스 올렸을때 레이어 나타나는 기능
	 */
	rbug.help = function(settings){
		var base = {
			element : null, //(필수)아이콘
			target : null, 	//(필수)대상 레이어
			width : 200,
			height : 100
		}
		settings = $.extend(base, settings);
		settings.element.mousemove(function(e){
			var posX = e.pageX+10,
				posY = e.pageY+15,
				height = $(this).attr('data-height'),
				width = $(this).attr('data-width'),
				marginX = (posX < $(window).width()-width) ? 0 : -(parseInt(width)+20);
			if(!height || !width){
				height = settings.height;
				width = settings.width;
			}
			settings.target = '.' +$(this).attr('data-target');
			$(settings.target).show();
			$(settings.target).css({'height':height,'width':width,'left':posX,'top':posY,'margin-left':marginX});
		});
		settings.element.mouseout(function(){
			$(settings.target).hide();
		});
	}
	/**
	 * @helpColor : 말풍선 아이콘에 마우스 올렸을때 레이어 나타나는 기능
	 */
	/*rbug.helpColor = function(settings){
		var base = {
			element : $('span.rbugHelpColor'), //(필수)버튼
			layer : $('div.helpColor'), 	//(필수)대상 레이어
			target : $('.targetColor'),
			inputElement : $('.helpColorInput'),
			callback : function(){}
		}
		settings = $.extend(base, settings);
		if(settings.inputElement.val() != ''){
			settings.target.css('background-color',$('.helpColorInput').val());
		}
		settings.element.click(function(){
			settings.layer.show();
			rbug.dimmed.open({target : 'helpColor',transparent : true});
			var posX = $(this).offset().left,
				posY = $(this).offset().top + 17;
			settings.layer.css({'left':posX,'top':posY})
			settings.layer.find('.color li').mouseover(function(){
				var color = $(this).attr('data-color');
				settings.target.css('background-color',color);
			});
			settings.layer.find('.color li').click(function(){
				var color = $(this).attr('data-color');
				settings.inputElement.val(color);
				rbug.dimmed.open({target : 'helpColor'});
				settings.layer.hide();
			});
		});
	}*/
	rbug.helpColor = function(settings){
		var base = {
			element : $('span.rbugHelpColor'), //(필수)버튼
			layer : $('div.helpColor'), 	//(필수)대상 레이어
			target : $('.targetColor'),
			inputElement : $('.helpColorInput'),
			callback : function(){}
		}
		settings = $.extend(base, settings);

		settings.inputElement.each(function(index ){
			if($(this).val() != ''){
				$(this).siblings('.targetColor').css('background-color', $(this).val());
			}
		})

	    var $this = null;
		settings.element.click(function(){
			$this = $(this);
			settings.layer.show();
			rbug.dimmed.open({target : 'helpColor',transparent : true});

			var posX = $this.offset().left,
				posY = $this.offset().top + 17;
			settings.layer.css({'left':posX,'top':posY})
		});

		settings.layer.find('.color li').mouseover(function(){
			var color = $(this).attr('data-color');
			$this.siblings('.targetColor').css('background-color',color);
		});

		settings.layer.find('.color li').click(function(){
			var color = $(this).attr('data-color');
			$this.prev('.helpColorInput').val(color)
			rbug.dimmed.close({target : 'helpColor'});
			settings.layer.hide();
		});
	}
	/**
	 * @alert : 대화창(알림창,경고창)
	 */
	rbug.alert = {
		open : function(settings){
			var base = {
				target : null,		//(필수)대상 팝업(body 하단에 있는 pop*.jsp - rbugPopup 클래스에 추가하여 pair 시켜야함)
				confirm : false,	//(선택)확인창일 경우 true
				message : null,     //(필수)message
				width : 250,		//(선택)창넓이
				height : 100,		//(선택)창높이
				layer : $('div#alert'),						//(공통)레이어
				layerContent : $('div#alert .alert'),		//(공통)레이어
				btnCancel : $('div#alert .button.cancel'),	//(공통)레이어
				callback : function(e){
					console.log(1)
				}					//(선택)콜백
			}//base 객체 초기화하고
			settings = $.extend(base, settings);// 입력값+base 머지 
			if(settings.confirm){ // confirm값이 트루면 캔슬버튼 보여줌
				settings.btnCancel.show();
			}else{// false면 숨김
				settings.btnCancel.hide();
			}
			settings.layerContent.html(settings.message)
			settings.layer.show();
			settings.layer.find('.wrapper').css({'width': settings.width, 'height': settings.height, 'margin-left': -(settings.width/2), 'margin-top': -(settings.height/2)});
			$(document).one('keydown', function(event){
				var keyCode = event.keyCode || event.which; //키값 가져오기 keycode는 안되는 브라우져(파폭)도 있음
				if(keyCode == 13 || keyCode == 32){ // enter 혹은 spacebar를 누르면 레이어 닫힘
					rbug.alert.close(true);
				}
				if(keyCode == 27){
					rbug.alert.close(false); // esc를 누르면 alert 레이어 닫힘
				}
				return false; // 엔터를 눌렀을 때 포커스된 버튼의 작동 방지 ??
				//event.preventDefault(); // IE7은 없는 함수라 위처럼 함.
			});
			rbug.alert.callback = settings.callback; // 전역으로 밖에서 접근할일이 있어서 전역으로 넣어주는과정이 필요
			rbug.alert.close = function(e){ // 닫을때 이벤트처리
				settings.layer.hide();
				rbug.alert.callback(e); //무슨 키 눌렀는지 확인
			}
			//
		}
	}
	/**
	 * @fileUpload : 파일업로드 (jquery.form)
	 */
	rbug.fileObj = new Object();
	rbug.fileUpload = function(settings){
		var base = {
			form : $('form#fileForm'), 			//(공통)폼 - append 된 폼
			element : $('span.fileUpload'),     //(필수)
			inputElement : null,
			imgElement : null,
			name : null,
			url : null,							//(필수)
			method : 'post',					//(필수)post,get
			before : function(e){               //(선택)실행전 스크립트 (e.preventDefault()를 사용해 이벤트를 막을 경우 false 로 return )
				return true;
			},
			after : function(e){                //(선택)실행후 스크립트 (e.preventDefault()를 사용해 이벤트를 막을 경우 false 로 return )
				return true;
			},
			callback : function(id,imgPath){	//(기본)
				if(this.imgElement){
					this.imgElement.attr('src',imgPath);
				}else{
					$('img.'+id).attr('src',imgPath);
				}
				if(this.inputElement){
					this.inputElement.val(imgPath);
				}else{
					$('input[name="'+id+'"]').val(imgPath);
				}
			}
		}
		settings = $.extend(base, settings);
		var body = $('body');
		var name = settings.element.prev().attr('data-name'); //중복되는 name 이 있을경우 input 에 data-name 을 넣는다. (bannerPotion.jsp 참고)
		if(!name){
			name = settings.element.prev().attr('name'); //중복되는 name 이 없을 경우
		}
		if(settings.inputElement){
			name = settings.inputElement.attr('data-name');
		}
		rbug.fileObj[name] = settings;
		if(settings.form.length == 0){ //페이지당 fileForm 은 한개만 존재
			body.append('<form name="fileForm" id="fileForm" style="display:none;"></form>');
		}
		rbug.fileObj[name].element.each(function(){ //찾아보기 버튼 클릭시
			var id = $(this).prev().attr('name');
			body.append('<input type="file" id="'+name+'_hidden" style="display:none;" />');
			$(this).click(function(e){
				if(settings.before(e) != false){
					$('#'+name+'_hidden').click();
				}
			});
			$('#'+name+'_hidden').change(function(e){
				if(settings.after(e) != false){
					body.append($(this).clone(true));
					$('#fileForm').html('').append($(this).attr('name','uploadFile').removeAttr('id'));
					$(document.fileForm).ajaxSubmit({
						method: rbug.fileObj[name].method,
						url: rbug.fileObj[name].url,
						success: function(data){
							rbug.fileObj[name].callback(id, data.resultMap.targetWebPath, name, data);
						},
						error: function(data){
							rbug.alert.open({message: data.responseJSON ? data.responseJSON.message : 'upload error'});
						}
					});
				}
			});
		});
	}
	/**
	 * @dimmed : 딤처리
	 */
	rbug.dimmed = {
		openTarget : null,
		open : function(settings){
			var base = {
				element : $('div#dimmed'),	//(공통)
				target : null, 				//(선택)딤처리한 주체 저장
				status: false,				//(공통)딤처리 상태
				transparent : false,		//(선택)딤투명처리
				callback : function(e){}	//(선택)콜백
			}
			settings = $.extend(base, settings);
			this.openTarget = (settings.target) ? settings.target : null;
			settings.status = true;
			if(settings.transparent){
				settings.element.addClass('transparent');
			}
			settings.element.show();
		},
		close : function(settings){
			var base = {
				target : null
			}
			settings = $.extend(base, settings);
			if(this.openTarget == 'ibDatePicker'){
				IBCalendar.Close();
			}
			$('div#dimmed,div#datePicker,div.helpColor').hide();
			$('div.btnMenu,div#menu').removeClass('on');
			$('div#dimmed').removeClass('transparent');
		}
	}
	/**
	 * @byteChecker : byte체크
	 */
	rbug.byteChecker = function(settings){
		var base = {
			element : null,		//(필수)textarea 또는 input
			max : null,			//(필수)data-max='' 예)4000
			countElement : null //(공통)element 다음에 <p><b></b></p>가 존재해야함.
		}
		settings = $.extend(base, settings);
		if(settings.element.length <= 0){
			return
		}
		settings.max = parseInt(settings.element.attr('data-max')) - 1;
		settings.countElement = settings.element.next().find('b');
		var saveText;
		var getByte = function(val){
			var byte = 0;
			for(var i = 0; i < val.length; i++){
				byte += (val.charCodeAt(i) > 127) ? 2 : 1;
				if(settings.max <= byte){
					settings.element.val(val.substring(0,i));
					return;
				}
			}
			if(settings.countElement[0].tagName == 'B'){
				settings.countElement.text(byte);
			}
		}
		settings.element.on("keyup",function(){
			getByte(settings.element.val());
		});
		getByte(settings.element.val());
	}
	/**
	 * @lengthChecker : 글자수 체크
	 */
	rbug.lengthChecker = function(settings){
		var base = {
			element : null,		//(필수)textarea 또는 input
			max : null,			//(필수)data-max='' 예)80
			countElement : null //(공통)element 다음에 <p><b></b></p>가 존재해야함.
		}
		settings = $.extend(base, settings);
		if(settings.element.length <= 0){
			return
		}
		settings.max = parseInt(settings.element.attr('data-max')) - 1;
		settings.countElement = settings.element.next().find('b');
		var setCount = function(val,length){
			settings.countElement.text(length);
			if(settings.max <= length){
				settings.element.val(val.substring(0,settings.max));
			}
		}
		settings.element.on('keyup',function(e){
			var val = settings.element.val(),
			length = val.length;
			setCount(val,length);
		});
		setCount(settings.element.val(),settings.element.val().length);
	}
	/**
	 * @test : 개발시 사용
	 */
    rbug.test = function(settings){
		var base = {
			element : null,	//(공통)개발시 사용
			close : null	//(공통)개발시 사용
		}
		settings = $.extend(base, settings);
		settings.close.click(function(){
			settings.element.stop().animate({'right':-240},100);
		});
		settings.element.find('.open').click(function(){
			settings.element.stop().animate({'right':0},100);
		});
	}
    /**
	 * @slide : 아래화살표를 누르면 펴지고 위화살을 누르면 펴지는 기능(toggle slide)
	 */
	rbug.slide = function(settings){
		var base = {
			element : null,
			speed : 150
		}
		settings = $.extend(base, settings);
		settings.element.each(function(){
			var target = $(this).attr('data-target'),
				status = $(this).hasClass('up');
			if(status && target){
				$('.'+target).show();
			}else{
				$('.'+target).hide();
				$('.'+target).prev().addClass('off');
			}
			if(target){
				$(this).click(function(){
					status = $(this).hasClass('up');
					if(status){
						$(this).removeClass('up').addClass('down');
						$('.'+target).stop().slideUp(settings.speed);
						$('.'+target).prev().addClass('off');
					}else{
						$(this).removeClass('down').addClass('up');
						$('.'+target).stop().slideDown(settings.speed);
						$('.'+target).prev().removeClass('off');
					}
				});
			}
		});
	}
	/**
	 * @menu : 좌측메뉴,좌측메뉴찾기,상단메뉴,즐겨찾기
	 */
	rbug.menu = function(settings){ //common menu
		var base = {
			element : null, //element : $('div#menu') //rbug.common.js
			left : {
				btnMenu : $('.btnMenu'),
				favAdd : $('div#menu .iconFav')
			},
			top : {
				header : $('div#header')
			},
			highlight : function(str, param){
				var mask = param.split(/[\s~!@#\$%\^\-_+=\|,\.\?\/\\`&*'"\.,:;(){}<>\[\]]+/);
				for(var i in mask){
					if(mask[i] == ''){
						mask.splice(i,1);
					}
				}
				var result = str.replace(new RegExp(mask.sort().reverse().join('|'), 'ig'), '<b>' + '$&' + '</b>');
				if(result.match('<b>')){
					return result;
				}
				return '';
			}
		}
		settings = $.extend(base, settings);
		var menuMiddle = settings.left.menuMiddle,
			btnMenu = settings.left.btnMenu;
		btnMenu.click(function(){
			if($(this).hasClass('on')){
				$(this).removeClass('on');
				settings.element.removeClass('on');
				rbug.dimmed.close({target:'menu'})
			}else{
				$(this).addClass('on');
				settings.element.addClass('on');
				rbug.dimmed.open({target:'menu',transparent:true})
				$('#searchMenu').focus();
			}
		});
		/**
		 * 즐겨찾기
		
		if(FAVORITE_MENU){
			FAVORITE_MENU = $.parseJSON(FAVORITE_MENU);
		}
		for(var i in FAVORITE_MENU){
			$('#menu .iconFav').each(function(){
				if($(this).attr('data-menu-no') == FAVORITE_MENU[i].menuNo){
					var href = $(this).parent().find('a').attr('href');
					var menuNm = $(this).parent().find('strong').attr('data-text');
					$(this).addClass('on');
					$('#header ul.menu').append('<li data-menu-no="'+FAVORITE_MENU[i].menuNo+'"><a href="'+href+'">'+menuNm+'</a><span class="close" data-menu-no="'+FAVORITE_MENU[i].menuNo+'"></span></li>');
				}
			});
		} */
		var header = settings.top.header,
			favDel = settings.top.favDel,
			favAdd = settings.left.favAdd;
		var deleteUserMenuFavorite = function(obj){
			var menuNo = obj.attr('data-menu-no');
			if(!menuNo){
				return false;
			}
			$.post('/common/deleteUserMenuFavorite', 'menuNo=' + menuNo, function(data) {
				if(data.success){
					$('#header ul.menu li[data-menu-no="'+menuNo+'"]').remove();
					obj.removeClass('on');
				}
			});
		}
		var insertUserMenuFavorite = function(obj){
			if($('#header ul.menu li').length >= 9){
				rbug.alert.open({message : '더는 즐겨찾기 메뉴를 추가할 수 없습니다.'})
				return;
			}
			var href = obj.parent().find('a').attr('href');
			var menuNm = obj.parent().find('strong').attr('data-text');
			var menuNo = obj.attr('data-menu-no');
			if(!menuNo || !menuNm){
				return false;
			}
			$.post('/common/insertUserMenuFavorite', 'menuNo=' + menuNo, function(data) {
				if(data.success){
					$('#header ul.menu').append('<li data-menu-no="'+menuNo+'"><a href="'+href+'">'+menuNm+'</a><span class="close" data-menu-no="'+menuNo+'"></span></li>').find('.close').click(function(){
						deleteUserMenuFavorite($(this));
					});
					obj.addClass('on');
				}
			});
		}
		$('div#header ul.menu li .close').click(function(){
			deleteUserMenuFavorite($(this));
		});
		favAdd.click(function(){
			if($(this).hasClass('on')){
				deleteUserMenuFavorite($(this));
			}else{
				insertUserMenuFavorite($(this));
			}
		});
		$('#menu a').click(function(e){
			e.preventDefault();
			if($(this).attr('href') != ''){
				location.href = $(this).attr('href');
			}
		});
		$('#menu h4').click(function(){
			if($(this).parent().hasClass('on')){
				$(this).parent().removeClass('on');
			}else{
				$('#menu .menu').removeClass('on');
				$(this).parent().addClass('on');
			}
		});
		//현재 페이지
		$('div#header ul.menu li').each(function(){
			if($(this).find('a').attr('href') == location.pathname){
				$(this).addClass('on');
			}
		});
		$('input#searchMenu').on('keyup',function(){ //좌측 메뉴 찾기(공통)
			var param = $(this).val();
			$('div#menu .menu').removeClass('on');
			settings.element.find('strong').each(function(){
				var str = $(this).attr('data-text'),
					search = settings.highlight(str,param),
					parent = $(this).parent().parent(),
					tag = parent.get(0).tagName;
				if((param != '' || param == ' ') && search){
					$(this).html(search);
					switch(tag){
						case 'DIV':
							break;
						case 'H4':
							parent.parent().addClass('on');
							break;
						case 'H5':
							parent.parent().addClass('on');
							break;
						case 'H6':
							parent.parent().addClass('on');
							break;
					}
				}else{
					$(this).html(str);
				}
			});
		});
		$('#menuSearchForm').submit(function(e){ //조회 버튼 클릭시
			e.preventDefault();
			return;
		});
	}
	/**
	 * @popup : 팝업
	 */
	rbug.popup = function(settings){
		var base = {
			target : null, 				//(필수)rbug.popup 하위 객체를 생성, 주체 레이어
			width : 500, 				//(선택)팝업 넓이 사이즈
			height : 300, 				//(선택)팝업 높이 사이즈
			top : null, 				//(선택)팝업 상하 위치
			left : null, 				//(선택)팝업 좌우  위치
			radio : false, 				//(선택)그리드 단일(true),다중선택 값(false)
			status: false,				//(공통)팝업 상태
			override : false,			//(공통)팝업 위 팝업
			search : false,             //(선택)form 자동 검색
			form : null,
			searchParam : null,
			sheetId: null,
			reset: true,
			preView : false,
			callback : function(e){} 	//(선택)콜백 - 확인,취소에따라 어떤 값을 'e' 에 담을 수 있다.
		}
		settings = $.extend(base, settings);
		rbug.zIndex++;
		var layer = $('div.rbugPopup.' + settings.target);

		if(settings.preView){
			layer = $('div.rbugPreview.' + settings.target);
		}
		if(!settings.radio && settings.sheetId){ //복구시
			var sheet = window[settings.sheetId];
			for(var i in sheet.Cols){
				if(sheet.Cols[i].SaveName == 'selected'){
					sheet.SetColHidden(i, 0);
				}
				if(sheet.Cols[i].SaveName == 'radio'){
					sheet.SetColHidden(i, 1);
				}
			}
		}
		if(settings.radio && settings.sheetId){
			var sheet = window[settings.sheetId];
			for(var i in sheet.Cols){
				if(sheet.Cols[i].SaveName == 'radio'){
					sheet.SetColHidden(i, 0);
				}
				if(sheet.Cols[i].SaveName == 'selected'){
					sheet.SetColHidden(i, 1);
				}
			}
		}
		if(settings.left && settings.top){
			layer.find('.wrap').css({'width':settings.width,'height':settings.height,'margin-left':0,'margin-top':0,left:settings.left,top:settings.top});
		}else{
			layer.find('.wrap').css({'width':settings.width,'height':settings.height,'margin-left':-(settings.width/2),'margin-top':-(settings.height/2)});
		}
		layer.css({'z-index': rbug.zIndex }).fadeIn(200);
		// 다음창 그리드가 넓이 100% 로 잡히게 할때
		if (settings.sheetId != null) {
			window[settings.sheetId].FitColWidth();
		}
		if(layer.find('form').length > 0){
			if(settings.reset){
				layer.find('form')[0].reset();
			}
			if(settings.searchParam && settings.form){
				rbug.formWrite({
					element : layer.find('form[name="'+settings.form+'"]'),
					data : settings.searchParam
				});
			}
			if(settings.search){
				layer.find('form').submit();
			}
		}
		settings.close = function(e){
			layer.fadeOut(200);
			settings.callback(e);
		}
		rbug.popup[settings.target] = settings;
	}
	/**
	 * @wpopup : 윈도우팝업
	 */
	rbug.wpopup = function(settings){
		var base = {
			width: 800,
			height: 650,
			modal: false,
			location: 0,
			menubar: 0,
			resizable: 1,
			toolbar: 0,
			param: null,
			data: null,
			scrollbars: 1,
			status: 0,
			target: null,
			url: null,
			top: null,
			left: null,
			popWin: null,
			radio: false,
			name: null,
			callback: function(e){},
			close: function(e){
				this.callback(e);
			},
			open : function(){
				var posLeft = this.left,
					posHeight = this.top;
				if(!this.left && !this.top){
					posLeft = ((screen.width/2) - this.width/2);
					posHeight = ((screen.height/2) - this.height/2) - 30;
				}
				var a = this.url + ((this.url.indexOf('?') > -1 ) ? '&' : '?') + 'radio=' + this.radio + ((this.param) ? '&' + $.param(this.param) : '');
				var b = this.name;
				var c = 'height=' + this.height +
						',width=' + this.width +
						',toolbar=' + this.toolbar +
						',scrollbars=' + this.scrollbars +
						',status=' + this.status +
						',resizable=' + this.resizable +
						',location=' + this.location +
						',left=' + posLeft +
						',top=' + posHeight +
						',menuBar=' + this.menubar;
				var d = "dialogWidth="+this.width+"px; dialogHeight="+this.height+"px; center:yes; status:no; scroll:no; resizable:yes; help:no";
				if(this.modal){
					this.popWin = window.showModalDialog(a,b,d);
				}else{
					this.popWin = window.open(a,b,c);
				}
				this.popWin.focus();
			},
			selected : function(item) {
				if (this.callback != undefined && this.callback != null) {
					this.callback(item);
				}
				if (this.popWin != undefined && this.popWin != null) {
					this.popWin.close();
				}
			}
		}
		settings = $.extend(base, settings);
		rbug.wpopup[settings.target] = settings;
		rbug.wpopup[settings.target].open();
	}
	/**
	 * @tab : 텝기능
	 */
	rbug.tab = function(settings){
		var base = {
			element : null, 			//(필수)텝 엘레먼트
			index : null, 				//(선택)활성화된 텝
			toggleName : 'on', 			//(공통)텝클래스
			tabContentWrap : null, 		//(필수)텝내용을 감싸는 element
			id : null,
			init : null,
			callback : function(e){} 	//(선택)콜백
		}
		settings = $.extend(base, settings);
		settings.id = settings.element.attr('id');
		var li = settings.element.find('li'),
			liLength = li.length,
			tabContent = settings.tabContentWrap.children().siblings('.tabContent');
		settings.init = function(i){
			li.removeClass(settings.toggleName);
			li.eq(i).addClass(settings.toggleName);
			tabContent.hide();
			tabContent.eq(i).show();
			settings.callback(i)
		}
		li.click(function(){
			var idx = $(this).index();
			settings.index = idx;
			settings.init(idx);
		});
		settings.init(settings.index);
		if(settings.id){
			rbug.tab[settings.id] = settings;
		}
	}
	/**
	 * @loading : 로딩 기능
	 */
	rbug.loading = {
		start : function(settings){
			var base = {
				element : $('div#loading'),	//(공통)로딩 엘레먼트
				message : '로딩중입니다.',		//(선택)로딩 메세지
				transparent : false			//(선택)로딩시 딤처리 투명
			}
			settings = $.extend(base, settings);
			settings.element.addClass('on');
			settings.element.find('.message p').text(settings.message);
			if(settings.transparent){
				settings.element.addClass('transparent');
			}
		},
		stop : function(){
			$('div#loading').removeClass('on').removeClass('transparent');
		}
	}
	/**
	 * @formWrite : 폼에 데이터 변경
	 * NULL또는 ''값이 들어가야 하는 input 등은 각자 처리해야함
	 */
	rbug.formWrite = function(settings){
		var base = {
			element :null, //(필수)form element
			data : null, //(필수)
			decode: true // (선택) 명시하지 않으면 true
		}
		settings = $.extend(base, settings);
		if(settings.element.length > 0){
			settings.element[0].reset(); // 데이터 입력전 리셋
		}
		for(var i in settings.data){
			var input = settings.element.find('input[name="'+i+'"]'),
				textarea = settings.element.find('textarea[name="'+i+'"]'),
				select = settings.element.find('select[name="'+i+'"]'),
				type = input.attr('type');
			if(input.length > 0){
				if(type == 'text' || type == 'hidden'){
					if(input.hasClass('datetime')){
						var date = new Date(settings.data[i]),
							dateFormat = input.attr('data-format');
						input.eq(0).val(date.format(dateFormat));
					}else{
						input.eq(0).val(settings.decode ? decodeURIComponent(settings.data[i]) : settings.data[i]);
					}
				}
				if(type == 'radio' || type == 'checkbox'){
					input.each(function(){
						if($(this).val() == settings.data[i]){
							$(this).prop('checked',true);
						}
					});
				}
			}
			if(select.length > 0){				
				select.find('option').each(function(){
					if($(this).val() == settings.data[i]){
						$(this).prop('selected',true);
					}
				});
			}
			if(textarea.length > 0){				
				textarea.eq(0).val(settings.decode ? decodeURIComponent(settings.data[i]) : settings.data[i]);
			}
		}
	}
	/**
	 * serializeArray() 생성된 데이터일때 사용
	 * @formWriteByArray : 폼에 데이터 변경
	 * NULL또는 ''값이 들어가야 하는 input 등은 각자 처리해야함
	 */
	rbug.formWriteByArray = function(settings){
		var base = {
				element :null, //(필수)form element
				data : null //(필수)
		}
		settings = $.extend(base, settings);
		if(settings.element.length > 0){
			settings.element[0].reset(); // 데이터 입력전 리셋
			$(settings.element).find("input[type=checkbox]").prop('checked',false);
		}
		$(settings.data).each(function(){
			var key = this.name;
			var value = this.value;
			var input = settings.element.find('input[name="'+key+'"]'),
			textarea = settings.element.find('textarea[name="'+key+'"]'),
			select = settings.element.find('select[name="'+key+'"]'),
			type = input.attr('type');
			if(input.length > 0){
				if(type == 'text' || type == 'hidden'){
					if(input.hasClass('datetime')){
						var date = new Date(value),
						dateFormat = input.attr('data-format');
						input.eq(0).val(date.format(dateFormat));
					}else{
						input.eq(0).val(decodeURIComponent(value));
					}
				}
				if(type == 'radio' || type == 'checkbox'){
					input.each(function(){
						if($(this).val() == value){
							$(this).prop('checked',true);
						}
					});
				}
			}
			if(select.length > 0){
				select.find('option').each(function(){
					if($(this).val() == value){
						$(this).prop('selected',true);
					}
				});
			}
			if(textarea.length > 0){
				textarea.eq(0).val(decodeURIComponent(value));
			}
		});
	}
	/**
	 * rbug.param: 파라미터(쿼리스트링) 추출 유틸
	 */
	rbug.param = {
		getParams : function () {
			var vars = [];
			var hash;
			var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
			for (var i=0 ; i < hashes.length ; i++) {
				hash = hashes[i].split('=');
				vars.push(hash[0]);
				vars[hash[0]] = hash[1];
			}
			return vars;
		},
		getParam : function (value) {
			var vars = [];
			var hash;
			var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
			for (var i=0 ; i < hashes.length ; i++) {
				hash = hashes[i].split('=');
				if (hash[0] == value) {
					return hash[1];
				}
			}
			return null;
		}
	};
	/**
	 * @serializeObject : serializeArray 반대...
	 */
	$.fn.serializeObject = function(){
		var param = new Object();
		$(this).find('input,textarea,select').each(function(){
			var name = $(this).attr('name'),
				type = $(this).attr('type'),
				prop = $(this).prop('checked'),
				disabled = $(this).prop('disabled'),
				val = $(this).val();
			if(typeof name === 'undefined'){
				return true; // jquery each continue
			}
			if(type == 'checkbox' || type == 'radio'){
				if(prop && !disabled){
					param[name] = val;
				}
			}else{
				if(!disabled){
					param[name] = val;
				}
			}
		});
		return param;
	}
	/**
	 * @autoComplete : 자동완성 기능
	 */
	rbug.autoComplete = function(settings){
		var base = {
			element : null, 						 //(필수)자동완성 input 엘레먼트
			elementNumber : null,
			storage : {
				cmpyNm : null,
				cmpyNo : null,
				cmpyStatCd : null,
				dispMenuSetYn : null,
				dispScrnSetYn : null
			},
			searchLayer : $('#autoCompleteLayer'), 	  //(공통)자동완성 레이어 엘레먼트
			url : '/display/getAutoCompleteList' ,	  //(필수)API URL , test = /data/getCompanyList.json
			keyIndex : 0,							  //(공통)위아래 방향키 index
			close : function(settings){
				$.ajax({
					url : settings.url + '?cmpyNo='+settings.storage.cmpyNo,
					success : function(data){
						settings.callback(data.resultMap.items[0]);
					}
				});
			},
			init : function(){},
			callback : function(){},				 //(선택)콜백
			highlight : function(str, param, cmpyNo, cmpyNm){
				var mask = param.split(/[\s~!@#\$%\^\-_+=\|,\.\?\/\\`&*'"\.,:;(){}<>\[\]]+/);
				for(var i in mask){
					if(mask[i] == ''){
						mask.splice(i,1);
					}
				}
				if(!str){
					return '';
				}
				var result = '<li data-number="'+cmpyNo+'" data-name="'+cmpyNm+'">' + str.replace(new RegExp(mask.sort().reverse().join('|'), "ig"), '<b>' + "$&" + '</b>') + '</li>';
				if(result.match('<b>')){
					return result;
				}
				return '';
			}
		}
		settings = $.extend(base, settings);
		var keyIndex = settings.keyIndex,
			searchLayer = settings.searchLayer;
		if(settings.element.length == 0){
			return;
		}
		settings.init = function(){
			$.ajax({
				url : settings.url,
				success : function(data){
					if(!data.success){
						return;
					}
					data = data.resultMap.items;
					var setKeyIndex = function(idx){
						searchLayer.find('li').removeClass('on');
						searchLayer.find('li:eq('+idx+')').addClass('on');
						searchLayer.scrollTop(idx * 20);
					}
					var setSearchData = function(data,where){
						var param = settings.element.val().replace(/(^\s*)|(\s*$)/gi, '');
						var str = '<ul>';
						for(var i in data){
							str += settings.highlight('[' + data[i].cmpyNo + '] ' + data[i].cmpyNm, param, data[i].cmpyNo, data[i].cmpyNm);
						}
						str += '</ul>';
						searchLayer.html(str);
						searchLayer.find('li').on('click',function(){
							keyIndex = $(this).index();
							setKeyIndex(keyIndex);
							settings.storage.cmpyNo = $(this).attr('data-number');
							settings.storage.cmpyNm = $(this).attr('data-name');
							settings.elementNumber.val(settings.storage.cmpyNo);
							settings.element.val(settings.storage.cmpyNm);
							searchLayer.hide();
							settings.close(settings);
						});
						searchLayer.css({
							top : settings.element.offset().top+20,
							left : settings.element.offset().left
						});
						keyIndex = 0;
						setKeyIndex(0);
						if(settings.elementNumber.length > 0 && where != 'focus'){
							settings.elementNumber.val('');
						}
					}
					settings.element.on('keyup',function(e){
						if(e.keyCode == 37 || e.keyCode == 38 || e.keyCode == 39 || e.keyCode == 40){
							return;
						}
						setKeyIndex(keyIndex);
						setSearchData(data);
					});
					settings.element.on('focus', function(){
						searchLayer.css({
							top : settings.element.offset().top+20,
							left : settings.element.offset().left
						});
						setSearchData(data,'focus');
						searchLayer.show();
					});
					settings.element.on('blur', function(){
						setTimeout(function(){
							searchLayer.hide();
						},200);
					});
					settings.element.on('keydown',function(e){
						var len = searchLayer.find('li').length;
						if(e.keyCode == 13){} //enter
						if(e.keyCode == 38){ //up
							if(keyIndex > 0){
								keyIndex--;
								setKeyIndex(keyIndex);
							}
						}
						if(e.keyCode == 40){ //down
							if((len-1) > keyIndex){
								keyIndex++;
								setKeyIndex(keyIndex);
							}
						}
					});
					setSearchData(data);
					if(settings.element.attr('id')){
						rbug.autoComplete[settings.element.attr('id')] = settings;
					}
				}
			});
		}
		settings.init();
	}
	/**
	 * 폼 초기화 함수 (form.reset()은 hidden값은 초기화하지 않는다)
	 */
	$.fn.clearForm = function() {
	    return this.each(function() {
	        var type = this.type, tag = this.tagName.toLowerCase();
	        if (tag === 'form'){
	            return $(':input',this).clearForm();
	        }
	        if (type === 'text' || type === 'password' || type === 'hidden' || tag === 'textarea'){
	            this.value = '';
	        }
	    });
	};
	/**
	 * IE7에 stringify가 없어서 추가
	 */
	$.extend({
	    stringify  : function stringify(obj){
	    	if(window.JSON && window.JSON.stringify){
	    		return JSON.stringify(obj);
	    	}
	        var t = typeof (obj);
	        if(t != "object" || obj === null){
	            // simple data type
	            if(t == "string") obj = '"' + obj + '"';
	            return String(obj);
	        } else {
	            // recurse array or object
	            var n, v, json = [], arr = (obj && obj.constructor == Array);

	            for (n in obj){
	                v = obj[n];
	                t = typeof(v);
	                if(obj.hasOwnProperty(n)){
	                    if(t == "string") v = '"' + v + '"';
	                    else if(t == "object" && v !== null) v = jQuery.stringify(v);
	                    json.push((arr ? "" : '"' + n + '":') + String(v));
	                }
	            }
	            return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
	        }
	    }
	});
})();