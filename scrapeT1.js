function(c, ar){ // t:#s.np.c, what:"easy"
	if (!ar||!ar.t||ar.b){
		return {ok:false, msg:"t:#s.np.c, what:\"easy\""}//" me.jj{args}"}
	}
		
	var lib = #ns.@@jaybee3@@.lib();
	var lc = lib.locCall, rx = lib.findWithRegex, rs = lib.regexSearch, cc = lib.checkCorruption;
	//var breach = lib.breach;
	//Object.values()
	
	var typeOfCheck = { 
		breach: true,
		test: false,
		target: a,
		command:{
			regexSearchText : null,
			arguments : null
		}
	};


	const breach = (m,ex,p,pr) => {
		let s = {},e = {};s[m] = ex,s.project = pr;
		//check pr corrupted
		//check array of targets
        const r = (z) => lc(ar,z);
		["p","pass","password"].forEach(i => s[i]=p);
        const r2 = r(s);
		e.project = pr
		e.check = Array.isArray(r2);
		if (e.check)  {
            e.results = r2;
            //e.filtered = cc("text","","",r2);
            e.easy = e.results.filter(n => n.includes("_jr_"))
        }
		return e;
	}
	
	const projectList = (r) => rs.projects.flatMap(e => rx(e,lc(a,r)).filter((n,i) => ((i % 2 == 1) && (n))));
	const breachList = (c1,c2,pw1,pl) => pl.flatMap(e => breach(c1,c2,pw1,e)); 

	const gAn = () => {
        let p = {};
        typeOfCheck.command.regexSearchText = rs.page;
        let pb = cc(typeOfCheck); 
		typeOfCheck.command.regexSearchText = rs.command;
        typeOfCheck.command.arguments = {};
        let com = cc(typeOfCheck); 
        p[com[1]] = pb[3]; 
		typeOfCheck.command.regexSearchText = rs.password;
        typeOfCheck.command.arguments = p;
        let pw = cc(typeOfCheck);
        
        p[com[1]]=pb[1];
		let r = breachList(com[1],com[2],pw[1],projectList(p));

        //const r2 = (arr,w) => arr.reduce((v,o) => ((o.check && o.filtered.length>0) && v.push(o[w]), v),[]);
        const r2 = (arr,w) => arr.reduce((v,o) => ((o.check) && v.push(o[w]), v),[]);
        //return r2(r,ar.what);
        return r2(r,"easy");
	}

	return gAn();
}

