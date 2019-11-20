new Vue({
	el: "#app",
	data() {
		return {
			copyValue: '李杨敏',
			typeCN: {
				bank: '银行卡',
				alipay: '支付宝',
				wx: '微信',
				unionpay: '云闪付'
			},
			payInfo: { amount: 0, qrcode: '' },
			cpOrderPayeeAccountVo: { amount: 0, qrcode: '' },
			nav: [
				{ name: '微信', type: 'wx', active: true },
				{ name: '支付宝', type: 'ali', active: false },
				{ name: '云闪付', type: 'union', active: false },
				{ name: '银行卡', type: 'bank', active: false },
			],
			stateCN: {
				1: '已分配',
				2: '已接单',
				3: '超时',
				4: '关闭',
				5: '完成',
				6: '付款方已查看',
				7: '付款方已支付',
			},
			nowItem: { name: '', type: '', cpId: '', orderId: '', cpOrderId: '' },
			minutes: 5,
			seconds: 0,
			timeNmae: null,
			finish: false,
		}
	},
	created() {
		this.getData();
	},
	watch: {
		second: {
			handler(newVal) {
				this.num(newVal)
			}
		},
		minute: {
			handler(newVal) {
				this.num(newVal)
			}
		}
	},
	computed: {
		second: function () {
			return this.num(this.seconds)
		},
		minute: function () {
			return this.num(this.minutes)
		}
	},
	methods: {
		getData() {
			var type = 'wx';
			var url = location.search, urldata = {}
			if (url.indexOf("?") != -1) {
				var str = url.substr(1);
				strs = str.split("&");
				for (var i = 0; i < strs.length; i++) {
					urldata[strs[i].split("=")[0]] = decodeURIComponent(strs[i].split("=")[1]);
				}
			}
			urldata.name = this.typeCN[urldata.type];
			this.nowItem = urldata;
			this.getDetail();
		},
		navClick(item) {
			this.nowItem = item;
			clearInterval(this.timeNmae)
			this.getDetail();
		},
		randomChar(l) {
			var x = "0123456789qwertyuioplkjhgfdsazxcvbnm";
			var tmp = "";
			var timestamp = new Date().getTime();
			for (var i = 0; i < l; i++) {
				tmp += x.charAt(Math.ceil(Math.random() * 100000000) % x.length);
			}
			return tmp;
		},
		num(n) {
			return n < 10 ? '0' + n : '' + n
		},
		timer() {
			var _this = this
			_this.minutes = 5;
			_this.seconds = 0;
			this.timeNmae = setInterval(() => {
				if (_this.seconds === 0 && _this.minutes !== 0) {
					_this.seconds = 59
					_this.minutes -= 1
				} else if (_this.minutes === 0 && _this.seconds === 0) {
					_this.seconds = 0
					clearInterval(_this.timeNmae)
				} else {
					_this.seconds -= 1
				}
			}, 1000)
		},
		dopayment() {
			var _this = this;
			if (_this.payInfo.state != 2 || _this.payInfo.state != 6) {
				vant.Toast({
					duration: 2000,
					message: '订单'+_this.stateCN[_this.payInfo.state],
					type: 'fail',
				})
				return false;
			}
			var postData = {
				cpId: _this.nowItem.cpId,
				cpOrderId: _this.payInfo.cpOrderId,
				cpUserId: 1,
				orderId: this.nowItem.orderId
			}
			// var time = (new Date()).valueOf();
			// var nonce = this.randomChar(10);
			// var str = nonce + time + postData.cpId + postData.cpOrderId + postData.cpUserId + postData.orderId + getdata.apikey
			// var sign = md5(str);
			var time = _this.nowItem.time;
			var nonce = _this.nowItem.nonce;
			var sign = _this.nowItem.sign;
			var url = 'https://www.zhifutongzhushou.com/api/asset/dopayment?time=' + time + '&nonce=' + nonce + '&sign=' + sign
			$.ajax({
				url: url,
				type: 'POST',
				dataType: 'json',
				data: JSON.stringify(postData),
				cache: false,
				headers: {
					'Content-Type': 'application/json' //application/x-www-form-urlencoded   multipart/form-data  application/json
				},
				success: function (res) {
					if (res.code == 0) {
						vant.Toast({
							duration: 2000,
							message: '支付成功',
							type: 'success',
							onClose: function () {
								location.reload();
							}
						})
					}
				},
				error: function (e) {

				}
			})
		},
		getDetail() {
			var _this = this;
			var apikey = 'LTAIPcQ7kesYr6xd';
			var postData = {
				cpId: _this.nowItem.cpId,
				orderId: _this.nowItem.orderId,
				time: _this.nowItem.time,
				nonce: _this.nowItem.nonce,
				sign: _this.nowItem.sign
			}
			var postUrl = 'https://www.zhifutongzhushou.com/api/order/cp/get'
			for (var key in postData) {
				if (postUrl.indexOf('?') < 0) {
					postUrl = postUrl + '?' + key + "=" + postData[key]
				} else {
					postUrl = postUrl + '&' + key + "=" + postData[key]
				}
			}
			$.ajax({
				url: postUrl,
				type: 'POST',
				dataType: 'json',
				cache: false,
				headers: {
					'Content-Type': 'application/json' //application/x-www-form-urlencoded   multipart/form-data  application/json
				},
				// data: JSON.stringify(postData),
				success: function (res) {
					let data = {
						amount: 0
					}
					if (res.code == 0) {
						_this.payInfo = res.data ? res.data : data;
						_this.cpOrderPayeeAccountVo = res.data.cpOrderPayeeAccountVo
						if (res.data.state != 2 || res.data.state != 6) {
							_this.finish = true;
						}
						clearInterval(this.timeNmae)
						_this.timer();

					} else if (res.code == 10037) {
						_this.finish = true;
						_this.payInfo = res.data ? res.data : data;
					} else {
						vant.Toast(res.message)
					}

				},
				error: function (e) {

				}
			})
		},
		copy() {
			//检测是否兼容
			var _this = this;
			var copy = ClipboardJS.isSupported()
			// const btnCopy = new Clipboard('btn');
			let clipboard = new ClipboardJS('.copy');
			clipboard.on('success', function (e) {
				vant.Toast('复制成功')
				// 释放内存
				clipboard.destroy()
			});
			clipboard.on('error', function (e) {
				vant.Toast('复制失败')
				console.log(e);
			});
		},

	}
})