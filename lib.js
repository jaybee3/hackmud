function (c,a){

	var funcs = {
	
		marketKeys: function(a) { //type:"tool"
			var what = {},filter;
			if (a.type) { what.type = a.type};
			if (a.tier) { what.tier = a.tier};
			if (a.k3y) { filter = a.k3y};
	
			var listings = #fs.market.browse(what);
	
			var j,e,x,key,ar = [];
			for ([j,e] of listings.entries()){
				what.i = e.i;
				key = #fs.market.browse(what);
				if (key.upgrade.k3y == filter) { 
					ar.push(key.i + "\t" + key.upgrade.k3y + "\t" + key.upgrade.rarity + "\t" + key.seller + "\t" + key.count  + "\t" + key.cost + "\n");
				}
			}
			return ar;
		},
	
		scrapeSectors: function(a)  { // lvl:"FULLSEC"

			function chat(ch,lvl){
				var chat = {};
				var sector = {};
				chat.channel = ch;
				sector.sector = ch;
				var results = [];
				var x = #ms.chats.join(chat);
				
				switch(lvl) {
					case "FULLSEC": results = #fs.scripts.fullsec(sector);break;
					case "HIGHSEC": results = #hs.scripts.highsec(sector);break;
					case "MIDSEC": results = #ms.scripts.midsec(sector);break;
					case "LOWSEC": results = #ls.scripts.lowsec(sector);break;
					case "NULLSEC": results = #ns.scripts.nullsec(sector);break;
				}
				#db.i({_id: lvl + "_" + ch, type:"sector", level: lvl, channel: ch, locs: results}); 
				#ms.chats.leave(chat);
				
				return results;
			}
			
			
			var sectors = [];
			var level = a.lvl.toUpperCase();
			switch(level) {
				case "FULLSEC": sectors = #fs.scripts.fullsec();break;
				case "HIGHSEC": sectors = #hs.scripts.highsec();break;
				case "MIDSEC": sectors = #ms.scripts.midsec();break;
				case "LOWSEC": sectors = #ls.scripts.lowsec();break;
				case "NULLSEC": sectors = #ns.scripts.nullsec();break;
			}
		
			var i,e,result =[],x,cha = {};
			
			for([i,e] of sectors.entries()) {
				cha.channel = e;				
				if ( _END - new Date() <= 1000) { break; }
				if(!#db.f(cha).first()) {
					result.push(chat(e,level));
				}
			}
			return result;
		},
		
		returnSectors: function(a) { // search:"foobar"
			
			var o = #db.f({type:"sector"}).array()
			var i,e,ax=[];
			
			for([i,e] of o.entries()) {
				if (e.locs.length > 0) {
					ax.push(e.locs);
				} else {
					#db.r({channel:e.channel});
				}
			}	
			if (a) {
				ax = [].concat(...ax).filter(i=>(i.includes(a.search)));
			} else {
				ax = [].concat(...ax);
			}
			return ax.sort();
		},

		returnDb: function(a) {
			var o = #db.f(a);
			return o.array();

		},
		
		uniquify: function(a) {
			function onlyUnique(v,i,s){
				return s.indexOf(v) === i;
			}
			return a.filter(onlyUnique);
		},
		
		uniqueLocs : function(a) {
			var sectors = funcs.returnSectors();
			var map = sectors.map(x => x.split('.')[1])
			var ax =[];
			if (a) {
				ax = [].concat(...funcs.uniquify(map)).filter(i=>(i.includes(a.search)));
			} else {
				ax = [].concat(...funcs.uniquify(map));
			}
			return ax.sort();
		},

		locCall: function(a,b) { //wrapper for call
			return a.t.call(b);
		},

		fetchKeys: function(a) {
			return #db.f({lock:a}).first();
		},
		
		findWithRegex: function(x,r) {
			let arr =[];
			let m = x.exec(r);
			//#D(x);
			//#D(r);
			while (m){
				if (m.index === x.lastIndex) {
					x.lastindex++;
				}
				m.forEach(function(e){arr.push(e);});		
				m = x.exec(r);
			}
			//#D(m);
			//#D(arr);
			return [...new Set(arr)];
		},
		
		regexSearch: {
			page: /\s(\w+)\s\|/g,
			command: /(\w+):.(\w+)./g,
			password: /\sstrategy\s(\w+)\s/g,
			projects: [/(?:of\sthe\s|ew\sof\s|ok\sfor\s|ers\sfor\s)([^,\s]+)/g,/(\w+.?\w+)\sannounces/g,/ues\son\s(\w+.?\w+)/g,/ject\s(\w+.?\w+)\shas\scome/g]
				//(?>of\sthe\s|ew\sof\s|ok\sfor\s|ers\sfor\s)([^,\s]+)
				//    [/(\w+.?\w+)\sannounces/g,/ues\son\s(\w+.?\w+)/g,/ew\sof\s(\w+.?\w+)/g,/ject\s(\w+.?\w+)\shas\scome/g]
				//[/(\w+?.?\w+)\sannounces/g,/ues\son\s(\w+.\w+)/g,/ew\sof\s(\w+)/g,/ject\s(\w+)\shas\scome/g]
		},
		
		checkCorruption: function(typeOfCheck) {
    
			// const typeOfCheck = {
			//     breach: Boolean,
			//     text: Boolean,
			//     target: string,
			//     command: {
			//         regexSearchText = String,
			//         arguments = Object
			//     }
			// }
		
			const pages = {
				pages: {
					regex: funcs.regexSearch.page,
					expected: 4,
					positions: [1,3],
					breachArgs: null
				},
				command: {
					regex: funcs.regexSearch.command,
					expected: 3,
					positions: [1,2],
					breachArgs: {}
				},
				password: {
					regex: funcs.regexSearch.password,
					expected: 2,
					positions: [1],
					breachArgs: typeOfCheck.command.arguments
				}
			}

			//#D(pages.pages.regex.toString());
			
			const typeToUse = (x) => {switch(x) { // typeOfCheck.command.regexSearchText
				case pages.pages.regex: return pages.pages; break;
				case pages.command.regex: return pages.command; break;
				case pages.password.regex: return pages.password; break;
				}
			}
		
			//if args blank with it work?
			const rx = (regex,target,argsToUse) => funcs.findWithRegex(regex,funcs.locCall(target,argsToUse));
		
			const corrupted = (stringToCheck) => ("¡¢Á¤Ã¦§¨©ª".split("").some(ch => stringToCheck.includes(ch)));
		
			//if (type.breach) { }
			//if (type.text) { }
			let lookup = typeToUse(typeOfCheck.command.regexSearchText);
			
			const res = () =>  rx(   	lookup.regex,
										typeOfCheck.target,
										lookup.breachArgs);
			
			
			let checkNow = res();
			while (checkNow.length!=lookup.expected){
				checkNow = res();
			}

			const check = (r) => (lookup.positions.some(x => {corrupted(r[x])}));
			while (check(checkNow)){
				check(checkNow);
			}
			//Change output to page result, regexfind, regexFindArrayOfThingsWeWantBasedOnPositions, 
			return checkNow;
        },
        
		checkCorruptionOld: function(ty,a,p,q,l) {
			let res = [];
			var ch = {};
			var rx = funcs.findWithRegex, lc = funcs.locCall, rs = funcs.regexSearch;
			var standard = true;
			do {
				var check = true;
				switch(ty){
					case "pb": 
						res = rx(rs.page,lc(a));
						ch = {exp:4,pos1:1,pos2:3};
						break;
					case "com": 
						res = rx(rs.command,lc(a,{}));
						ch = {exp:3,pos1:1,pos2:2};
						break;
					case "pw": 
						res = rx(rs.password,lc(a,p));
						ch = {exp:2,pos1:1,pos2:1};
						break;
					case "jr":
					case "text":
						res = [...q];
						standard = false;
						break;
				}
				if (standard) {
					if (res.length==ch.exp){
						for (var letter of "¡¢Á¤Ã¦§¨©ª") {
							if (res[ch.pos1].includes(letter) || res[ch.pos2].includes(letter)) {
								check = false;
								break;
							}
						}			
					} else {
						check = false;
					}
				} else {

					var i = res.length;
					if (ty=="text") {
						while (i--) {
							for (var letter of "¡¢Á¤Ã¦§¨©ª") {
								if (res[i].includes(letter)) {
									res.splice(i, 1);
									break;
								}
							}
						}
					} else {
						while (i--) {
							if (!res[i].includes(l)){
								res.splice(i,1);
							//	#D(i);
							}
							//#D(i);
						}
					
					}
	
					check = true;
					//res = q;
				}
			}
			while (!check);
			return res;
		}



	};
	
	
	return funcs;
}