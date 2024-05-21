inflate_detail = function(data, buf) {
    var detail = {blocks: []};

	var u8=Uint8Array;
	if(data[0]==3 && data[1]==0) return {};
	var F=UZIP.F, bitsF = F._bitsF, bitsE = F._bitsE, decodeTiny = F._decodeTiny, makeCodes = F.makeCodes, codes2map=F.codes2map, get17 = F._get17;
	var U = F.U;

	var noBuf = (buf==null);
	if(noBuf) buf = new u8((data.length>>>2)<<3);

	var BFINAL=0, BTYPE=0, HLIT=0, HDIST=0, HCLEN=0, ML=0, MD=0;
	var off = 0, pos = 0;
	var lmap, dmap;

	while(BFINAL==0) {
        var detail_block = {};
        detail.blocks.push(detail_block);
        detail_block.begin = pos;
		BFINAL = bitsF(data, pos  , 1);
		BTYPE  = bitsF(data, pos+1, 2);  pos+=3;
		//console.log(BFINAL, BTYPE);
        detail_block.BFINAL = BFINAL;
        detail_block.BTYPE = BTYPE;

		if(BTYPE==0) {
			if((pos&7)!=0) pos+=8-(pos&7);
            detail_block.body_begin = pos;
			var p8 = (pos>>>3)+4, len = data[p8-4]|(data[p8-3]<<8);  //console.log(len);//bitsF(data, pos, 16),
            detail_block.data_begin = p8 * 8;
            detail_block.data_length = len * 8;
			if(noBuf) buf=UZIP.F._check(buf, off+len);
			buf.set(new u8(data.buffer, data.byteOffset+p8, len), off);
            detail_block.out_data_begin = off;
            detail_block.out_data_length = len;
			//for(var i=0; i<len; i++) buf[off+i] = data[p8+i];
			//for(var i=0; i<len; i++) if(buf[off+i] != data[p8+i]) throw "e";
			pos = ((p8+len)<<3);  off+=len;
            continue;
		}
		if(noBuf) buf=UZIP.F._check(buf, off+(1<<17));  // really not enough in many cases (but PNG and ZIP provide buffer in advance)
		if(BTYPE==1) {
            lmap = U.flmap;  dmap = U.fdmap;  ML = (1<<9)-1;  MD = (1<<5)-1;
        }
		if(BTYPE==2) {
			HLIT  = bitsE(data, pos   , 5)+257;
			HDIST = bitsE(data, pos+ 5, 5)+  1;
			HCLEN = bitsE(data, pos+10, 4)+  4;  pos+=14;
            detail_block.HLIT = HLIT;
            detail_block.HDIST = HDIST;
            detail_block.HCLEN = HCLEN;

			var ppos = pos;
			for(var i=0; i<38; i+=2) {  U.itree[i]=0;  U.itree[i+1]=0;  }
			var tl = 1;
			for(var i=0; i<HCLEN; i++) {
                var l=bitsE(data, pos+i*3, 3);  U.itree[(U.ordr[i]<<1)+1] = l;  if(l>tl)tl=l;
            }  pos+=3*HCLEN;  //console.log(itree);
			makeCodes(U.itree, tl);
			codes2map(U.itree, tl, U.imap);
            detail_block.itree = U.itree;

			lmap = U.lmap;  dmap = U.dmap;

			pos = decodeTiny(U.imap, (1<<tl)-1, HLIT+HDIST, data, pos, U.ttree);
            detail_block.ttree = U.ttree;
			var mx0 = F._copyOut(U.ttree,    0, HLIT , U.ltree);  ML = (1<<mx0)-1;
			var mx1 = F._copyOut(U.ttree, HLIT, HDIST, U.dtree);  MD = (1<<mx1)-1;
            detail_block.ltree = U.ltree;
            detail_block.dtree = U.dtree;

			//var ml = decodeTiny(U.imap, (1<<tl)-1, HLIT , data, pos, U.ltree); ML = (1<<(ml>>>24))-1;  pos+=(ml&0xffffff);
			makeCodes(U.ltree, mx0);
			codes2map(U.ltree, mx0, lmap);

			//var md = decodeTiny(U.imap, (1<<tl)-1, HDIST, data, pos, U.dtree); MD = (1<<(md>>>24))-1;  pos+=(md&0xffffff);
			makeCodes(U.dtree, mx1);
			codes2map(U.dtree, mx1, dmap);
		}
        detail_block.data_begin = pos;
        detail_block.out_data_begin = off;
		//var ooff=off, opos=pos;
        detail_block.symbols = [];
		while(true) {
            var symbol = {};
            detail_block.symbols.push(symbol);
			var code = lmap[get17(data, pos) & ML];
            symbol.raw = bitsE(data, pos, code & 15);
            pos += code&15;
			var lit = code>>>4;  //U.lhst[lit]++;
            symbol.size = code & 15;
            symbol.value = lit;
			if((lit>>>8)==0) {  symbol.type = 'lit'; symbol.out = off; buf[off++] = lit;  }
			else if(lit==256) {  symbol.type = 'end'; break;  }
			else {
                symbol.type = 'rep'; 
                symbol.out = off;
				var end = off+lit-254;
                symbol.length_base_value = lit - 254;
                symbol.length_extra_size = 0;
                symbol.length_extra_value = 0;
				if(lit>264) {
                    var ebs = U.ldef[lit-257];
                    symbol.length_base_value = (ebs>>>3);
                    symbol.length_extra_size = ebs&7;
                    symbol.length_extra_value = bitsE(data, pos, symbol.length_extra_size);
                    end = off + symbol.length_base_value + symbol.length_extra_value;
                    pos += symbol.length_extra_size;
                }
				//UZIP.F.dst[end-off]++;

				var dcode = dmap[get17(data, pos) & MD];
                symbol.distance_raw = bitsE(data, pos, dcode & 15);
                pos += dcode&15;
				var dlit = dcode>>>4;
                symbol.distance_size = dcode & 15;
				var dbs = U.ddef[dlit];
                symbol.distance_base_value = (dbs>>>4);
                symbol.distance_extra_size = dbs&15;
                symbol.distance_extra_value = bitsF(data, pos, symbol.distance_extra_size);
                var dst = symbol.distance_base_value + symbol.distance_extra_value;
                pos += symbol.distance_extra_size;

				//var o0 = off-dst, stp = Math.min(end-off, dst);
				//if(stp>20) while(off<end) {  buf.copyWithin(off, o0, o0+stp);  off+=stp;  }  else
				//if(end-dst<=off) buf.copyWithin(off, off-dst, end-dst);  else
				//if(dst==1) buf.fill(buf[off-1], off, end);  else
				if(noBuf) buf=UZIP.F._check(buf, off+(1<<17));
				while(off<end) {  buf[off]=buf[off++-dst];    buf[off]=buf[off++-dst];  buf[off]=buf[off++-dst];  buf[off]=buf[off++-dst];  }
				off=end;
				//while(off!=end) {  buf[off]=buf[off++-dst];  }
			}
            detail_block.data_length = pos - detail_block.data_begin;
            detail_block.out_data_length = off - detail_block.out_data_begin;
		}
		//console.log(off-ooff, (pos-opos)>>>3);
	}
	//console.log(UZIP.F.dst);
	//console.log(tlen, dlen, off-tlen+tcnt);
    detail.buf = buf.length==off ? buf : buf.slice(0,off);
	return detail;
}