/**
 * @etbs.validator
 * 1. 폼 유효성 검사시 유효하지 않은 경우 경고 말풍선을 띄운다. (help)
 * 2. submit 을 이용하여 직관적으로 콜백에 담는다. (exampleValidation.jsp 참고)
 */
(function(){
	'use strict';
	etbs.validator = {
		/**
		 * @validator.help : 유효하지 않을 경우 경고말풍선이 나타남
		 */
		help : function(settings){
			var base = {
				message : null,				//(필수)경고문구(validator에서 받음)
				speed : 300,				//(공통)말풍선 나타나는 속도
				input : null,				//(필수)validator에서 받음
				timeOut : 1500,				//(필수)말풍선이 사라지는 시간
				scroll : false,
				scrollTarget : null,
				element : $('#validHelp') 	//(공통)레이어
			}
			settings = $.extend(base, settings);
			settings.element.find('p').html(settings.message);
			var posX = settings.input.offset().left,
				posY = settings.input.offset().top + 26,
				overSize = parseInt($(window).width() - settings.input.width()),
				marginX = (posX + 30 < overSize) ? 0 : (parseInt(settings.input.width()) + 20);

			if(posX == 0 && posY == 26){ //hidden input 해당할때
				etbs.alert.open({message : settings.message});
				return;
			}
			settings.element.css({'left':posX,'top':posY}).fadeIn(settings.speed);
			if(settings.scroll){
				var targ = (settings.scrollTarget) ? settings.scrollTarget : settings.element;
				$(window).scrollTop(targ.offset().top - 100);
			}
			setTimeout(function(){
				settings.element.fadeOut(settings.speed);
			},settings.timeOut)
		},
		/**
		 * @validator.submit : 폼 submit 시
		 */
		submit : function(settings){
			var base = {
				element : null, //(필수)폼
				callback : function(success){}
			}
			settings = $.extend(base, settings);
			settings.element.submit(function(e){
				e.preventDefault();
				if(etbs.validator.validate(settings.element[0])){
					settings.callback(true);
				}else{
					settings.callback(false);
				}
			});
		},
		validate: function(form, vrs /* Optional */){
			this.currentForm = form;
			var sucess = true;
			$(form).find(':input[data-valid]').each(function(i){
				var j = $(this);
				var vrs = j.attr('data-valid');
				var overMessage = j.attr('data-message');
				var rs = etbs.validator.parseInlineVrs(vrs);
				for(var n in rs){
					if(n != 'label'){
						var param = rs[n];
						if(param == false){
							continue;
						}
						if(j.is(':disabled')){
							return true;
						}
						var result = etbs.validator.rules[n].check.call(etbs.validator, j.val(), this, param);
						if(result != true){
							var message = '\'' + rs['label'] + '\' ' + etbs.validator.formatMessage(etbs.validator.rules[n].msg, param);
							if(overMessage){
								message = overMessage;
							}
							etbs.validator.help({
								input : j,
								message : message
							});
							sucess = false;
							j.focus().select();
							return false;
						}
					}
				}
				return true;
			});
			return sucess;
		},
		validateField: function(element, vrs /* Optional */){
		},
		parseInlineVrs: function(vrs){
			var rs = new Object();
			var ss = vrs.split(';');
			for(var i = 0; i < ss.length; ++i){
				var r = $.trim(ss[i]);
				if(r){
					var rr = r.split(':');
					var ruleName = $.trim(rr[0]);
					var ruleValue = $.trim(rr[1]);
					if(etbs.validator.rules[ruleName] && etbs.validator.rules[ruleName].argc > 1){
						var ruleValueCount = etbs.validator.rules[ruleName].argc;
						// XXX 이거 뭐냐 이상해
						// var multiRuleValue = ruleValue.split(new RegExp(' +', 'g'), ruleValueCount);
						var multiRuleValue = ruleValue.split(',', ruleValueCount);
						for(var j = 0; j < multiRuleValue.length; ++j){
							multiRuleValue[j] = eval(multiRuleValue[j]);
						}
						rs[ruleName] = multiRuleValue;
					}else{
						rs[ruleName] = eval(ruleValue);
					}
				}
			}
			return rs;
		},
		parseVrs: function(vrs){
		},
		formatMessage: function(format, param){
			if(arguments.length <= 1){
				return format;
			}

			var s = format;
			if(param instanceof Array){
				for(var i = 0; i < param.length; ++i){
					s = s.replace(new RegExp('\\{' + i + '\\}', 'g'), param[i]);
				}
			}else{
				for(var i = 1; i < arguments.length; ++i){
					s = s.replace(new RegExp('\\{' + (i - 1) + '\\}', 'g'), arguments[i]);
				}
			}

			return s;
		},
		getLength: function(value, element){
			switch( element.nodeName.toLowerCase() ){
			case 'select':
				return $('option:selected', element).length;
			case 'input':
				if( this.checkable( element) ){
					return $(element).filter(':checked').length;
				}
			}
			return value.length;
		},
		getByteLength: function(value, element){
			switch( element.nodeName.toLowerCase() ){
			case 'select':
				return $('option:selected', element).length;
			case 'input':
				if( etbs.validator.checkable( element) ){
					return $(element).filter(':checked').length;
				}
			}
			var ibyte = 0;
			for(var i = 0; i < value.length; i++){
				var tmp = escape(value.charAt(i));
				if(tmp.length == 1){
					ibyte++;
				}else if(tmp.indexOf('%u') != -1){
					ibyte += 3;
				}else if(tmp.indexOf('%') != -1){
					ibyte += tmp.length/3;
				}
			}
			return ibyte;
		},
		depend: function(param, element){
			return etbs.validator.dependTypes[typeof param]
				? etbs.validator.dependTypes[typeof param](param, element)
				: true;
		},
		dependTypes: {
			'boolean': function(param, element){
				return param;
			},
			'number': function(param, element){
				return param;
			},
			'string': function(param, element){
				return !!$(param, element.form).length;
			},
			'function': function(param, element){
				return param(element);
			}
		},
		checkable: function( element ){
			return /radio|checkbox/i.test(element.type);
		},
		optional: function(element){
			return !etbs.validator.rules.required.check.call(etbs.validator, $.trim(element.value), element);
		},
		rules: {
			required: {
				argc: 1,
				msg: '(을)를 입력하세요',
				check: function(value, element, param){
					if(typeof param === 'string'){
						var checked = $(param).is(':checked'); // 셀렉트박스 옵션도 checked로 확인 가능
						if(!checked){
							// required 옵션에 true|false가 아닌 노드ID가 왔을 경우 대상의 체크여부 확인
							// ex) data-valid='required:'#target''
							return true;
						}
					}
					// FIXME depend 버그 있음
					// check if dependency is met
//					if( !etbs.validator.depend(param, element) ){
//						return false;
//					}
					switch( element.nodeName.toLowerCase() ){
					case 'select':
						var val = $(element).val();
						if(val == '선택하세요'){
							return false
						}
						return val && val.length > 0;
					case 'input':
						if( etbs.validator.checkable(element) ) {
							return $(this.currentForm).find('[name='+element.name+']:checked').size() > 0;
						}
					default:
						return $.trim(value).length > 0;
					}
				}
			},
			email: {
				argc: 1,
				msg: '올바른 이메일 형식으로 입력하세요.',
				check: function(value, element, param){
					return etbs.validator.optional(element) || /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i.test(value);
				}
			},
			url: {
				argc: 1,
				msg: '올바른 URL 형식으로 입력하세요.',
				check: function(value, element, param){
					return etbs.validator.optional(element) || /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value);
				}
			},
			date: {
				argc: 1,
				msg: '올바른 날짜 형식으로 입력하세요.',
				check: function(value, element, param){
					return etbs.validator.optional(element) || /^\d{4}[\/-]\d{1,2}[\/-]\d{1,2}$/.test(value);
				}
			},
			number: {
				argc: 1,
				msg: '올바른 숫자 형식으로 입력하세요.',
				check: function(value, element, param){
					return etbs.validator.optional(element) || /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(value);
				}
			},
			digit: {
				argc: 1,
				msg: '올바른 정수 형식으로 입력하세요',
				check: function(value, element, param){
					return etbs.validator.optional(element) || /^\d+$/.test(value);
				}
			},
			equal: {
				argc: 1,
				msg: '{0}와 같은 값을 입력하세요.',
				check: function(value, element, param){
					if(typeof param === 'string'){
						return $(param).val() == value;
					}
					return false;
				}
			},
			min: {
				argc: 1,
				msg: '{0} 이상의 값을 입력하세요.',
				check: function(value, element, param){
					return etbs.validator.optional(element) || value >= param;
				}
			},
			max: {
				argc: 1,
				msg: '{0} 이하의 값을 입력하세요.',
				check: function(value, element, param){
					return etbs.validator.optional(element) || value <= param;
				}
			},
			range: {
				argc: 2,
				msg: '{0} ~ {1} 사이의 값을 입력하세요.',
				check: function(value, element, param){
					return etbs.validator.optional(element) || ( value >= param[0] && value <= param[1] );
				}
			},
			equallength: {
				argc: 1,
				msg: '길이가 {0}인 값을 입력하세요.',
				check: function(value, element, param){
					return etbs.validator.optional(element) || etbs.validator.getLength($.trim(value), element) == param;
				}
			},
			minlength: {
				argc: 1,
				msg: '{0}자 이상의 값을 입력하세요.',
				check: function(value, element, param){
					return etbs.validator.optional(element) || etbs.validator.getLength($.trim(value), element) >= param;
				}
			},
			maxlength: {
				argc: 1,
				msg: '{0}자 이하의 값을 입력하세요.',
				check: function(value, element, param){
					return etbs.validator.optional(element) || etbs.validator.getLength($.trim(value), element) <= param;
				}
			},
			rangelength: {
				argc: 2,
				msg: '{0}자 ~ {1}자 사이의 값을 입력하세요.',
				check: function(value, element, param){
					var length = etbs.validator.getLength($.trim(value), element);
					return etbs.validator.optional(element) || ( length >= param[0] && length <= param[1] );
				}
			},
			minbytes: {
				argc: 1,
				msg: '{0} Byte 이상의 값을 입력하세요.',
				check: function(value, element, param){
					return etbs.validator.optional(element) || etbs.validator.getByteLength($.trim(value), element) >= param;
				}
			},
			maxbytes: {
				argc: 1,
				msg: '{0} Byte 이하의 값을 입력하세요.',
				check: function(value, element, param){
					return etbs.validator.optional(element) || etbs.validator.getByteLength($.trim(value), element) <= param;
				}
			},
			rangebytes: {
				argc: 2,
				msg: '{0} Byte ~ {1} Byte 사이의 값을 입력하세요.',
				check: function(value, element, param){
					var length = etbs.validator.getByteLength($.trim(value), element);
					return etbs.validator.optional(element) || ( length >= param[0] && length <= param[1] );
				}
			},
			xss: {
				argc: 1,
				msg: '특수문자는 입력할 수 없습니다.',
				check: function(value, element, param){
					if( !etbs.validator.checkable(element) ){
						var val = $(element).val();
						var re = /\<|\>|\'|\'|\%|\;|\(|\)|\&|\+|alert+|script+|javascript+|document\.+|\.cookie+|xss\:+|\:expression|style\=+|background\:+/g;
						if(val.match(re) ){
						    return false;
						}else{
							return true;
						}
					}
				}
			},
			xss1: {
				argc: 1,
				msg: '특수문자는 입력할 수 없습니다.',
				check: function(value, element, param){
					if( !etbs.validator.checkable(element) ){
						var val = $(element).val();
						var re = /\<|\>|\'|\'|\%|\;|\&|\+|alert+|script+|javascript+|document\.+|\.cookie+|xss\:+|\:expression|style\=+|background\:+/g;
						if(val.match(re) ){
						    return false;
						}else{
							return true;
						}
					}
				}
			},
			xssext: {  // kenny 추가 : 영문, 한글, 숫자 '_'(underBar), /,(,), 공백만 허용 ex) data-valid='xssext:true;'
				argc: 1,
				msg: '특수문자는 입력할 수 없습니다.',
				check: function(value, element, param){
					if( !etbs.validator.checkable(element) ){
						var val = $(element).val();
						var re = /^([0-9A-Za-zㄱ-ㅎ가-힣]|\_|\s|\/|\(|\)|\.|\:)+$/;
						if(!val.match(re) ){
						    return false;
						}else{
							return true;
						}
					}
				}
			}
		},
		/**
		 * data-valid 속성 교체
		 */
		replaceAttribute: function(element, target, replacement){
			var seperator = ';';
			var attrName = 'data-valid';
			var attr = $(element).attr(attrName);
			var attrs = attr.split(seperator);
			var found = false;
			for (var i in attrs){
				var splitstr = attrs[i].split(':');
				if(splitstr[0] == target){
					// target이 있으면 교체하고 종료
					attrs[i] = target + ':' + replacement;
					$(element).attr(attrName, attrs.join(seperator));
					return;
				}
			}
			// target이 없으면 추가
			attrs.push(target + ':' + replacement);
			$(element).attr(attrName, attrs.join(seperator));
		}
	};
})();