/*
*
* Open Type / True Type Font to Bitmap Font Converter
* It export its data in the csv format, with '\n' as its separator
* If all the characters don't fit in the canvas, it creates a new one automatically
* Warning! Very dirty code ahead!
*
*/

// Polyfix for:
if(self.setImmediate === void 0) self.setImmediate = self.setTimeout;

onload = ()=>{
	canvas = document.body.querySelector('canvas');
	ctx = canvas.getContext('2d');
	
	canvas.width = 512;
	canvas.height = 512;
	
	c2 = document.querySelectorAll('canvas')[1];
	ct2 = c2.getContext('2d');
	
	c2.style.backgroundColor='black'
	
	c2.width=c2.height=1024

	document.getElementById("canvasSizBtn").onclick = function() {
		var s = prompt("Enter a size for the canvas [width]x[height]", c2.width + "x" + c2.height);
		if(s.indexOf("x") == -1) return alert("Not a valid size (missing x)")
		s = s.split("x");
		if(isNaN(s[0]) || isNaN(s[1])) return alert("Not a valid size (inproper format)")
		if(s[0] < 8 || s[1] < 8) return alert("Canvas size too small!!!")

		c2.width = s[0]
		c2.height = s[1]
		this.value = s.join("x")
	}

	document.getElementById("smoothchk").onclick = function() {
		ct2.imageSmoothingEnabled = !this.checked
		c2.style.imageRendering = this.checked ? 'pixelated' : '' 
	}

	canvas.style.backgroundColor = 'black';
	
	fontName = "BitmapFont";
	
	loadFont = function(url) {
		fontData = {
		chars: [],
		ix: 0
	}
		document.fonts.forEach(u => document.fonts.delete(u));
		
		opentype.load(url,(e,f) =>{
		var d = f.glyphs.glyphs;
		
		for(var i in d) d[i].unicode && fontData.chars.push(d[i].unicode)
	});
	
	fnt = new FontFace('Font','url("'+url+'")');
	fnt.load().then(()=>{
		document.fonts.add(fnt);
		setTimeout(startDraw,500)
	})
	}
	
	fontInput = document.body.querySelectorAll('input')[0];
	fontInput.oninput = function() {
		fontURL = URL.createObjectURL(this.files[0]);
		fontName = this.files[0].name.substr(0,this.files[0].name.indexOf('.'))
		loadFont(fontURL);
	}
	fontInput.multiple=false;
	
	restartInput = document.body.querySelectorAll('input')[1];
	restartInput.onclick = function() {
		if(!cancel) {
			cancel = true;
			setTimeout(startDraw,500);
		}
	}
	
	saveInput = document.body.querySelectorAll('input')[2];
	saveInput.onclick = function(){
		for(var i = 0, bft = "index,x,y,w,h,ox,oy,char";i<FRAMES.length;i++) {
			var r = FRAMES[i], s = "\n", t = ',';
			if(r.name == ",") r.name = "0x2c";
			if(r.name == " ") r.oy = 0;
			if(r.name != "\n") bft += s+r.bitmap_index+t+r.x+t+r.y+t+r.w+t+r.h+t+r.ox+t+r.oy+t+r.name
		}
		var n = prompt('Font name:',fontName.replace(/ /g,'-')) || 'BitmapFont';
		saveCanvas(n);
		saveText(n,bft);
	}
	
	sizeInput = document.body.querySelectorAll('input')[3];
	sizeInput.oninput = function() {
		document.body.querySelectorAll('text')[1].textContent = this.value;
		
		ctx.font = this.value + 'px Font';
	  
	  prev();
	}
	
	offsetInput = document.body.querySelectorAll('input')[4];
	offsetInput.oninput = function() {
		document.body.querySelectorAll('text')[2].textContent = this.value;
		
		offsetY = +this.value;
	  
	  prev();
	}
	
	addInput = document.body.querySelectorAll('input')[5];
	addInput.onclick = function() {
		var n = prompt("If a character isn't on the font glyph table, here you can add them, it'll use the System default font. Use comma for separating.");
		if(n) for(var i=0,p=n.split(',');i<p.length;i++)fontData.chars.push(p[i].charCodeAt(0));
	}
	
	
	onDrawStart = function() {
		ct2.clearRect(0,0,c2.width,c2.height);
		fontInput.disabled = true;
		saveInput.disabled = true;
  	BITMAPS = [];
	}
	
	onDrawEnd = function() {
		URL.revokeObjectURL(window.fontURL);
		saveInput.disabled = false;
		fontInput.disabled = false;
	}
	
	prev = function() {
		clear();
		drawText('A',true)
	}
	
	ctx.font = '72px Font';
	chs = [];
		fontData = {
		chars: [],
		ix: 0
	}
	offsetY = 256;
	bitmapIndex=0;
	BITMAPS = [];
	
	
	
	drawText = function(t,preview) {
		var ms = ctx.measureText(t);
		//ms.height = ms.actualBoundingBoxAscent + ms.actualBoundingBoxDescent;
	  
	  ctx.resetTransform();
	  ctx.fillStyle='white';
		ctx.translate(256,offsetY);
		ctx.fillText(t,-ms.width/2,0);
		
		var data = ctx.getImageData(0,0,512,512);
		
		rect = {
			left: 0,
			top: 0,
			right: 0,
			bottom: 0
		}
		
		var b = canvas.width<<2,
		d = data.data;
	
  	for(var i = 0,a = [i, i+b], y=0;i<d.length;i+=b) {
  		//Get bottom bounding box
  		for(var c = a[0]; c < a[1]; c+=4) {
  			if(d[c+3]>51) {
  				rect.bottom = y;
  				break;
  			}
  		}
  		y++;
  		a[0] = i;
  		a[1] = i+b;
  	}
  	
  	for(var i = d.length, a = [i-b, i], y=canvas.height;i>0;i-=b) {
  		//Get top bounding box
  		for(var c = a[0]; c < a[1]; c+=4) {
  			if(d[c+3]>51) {
  				rect.top = y;
  				break;
  			}
  		}
  		y--;
  		a[0] = i-b;
  		a[1] = i;
  	}
  	
  	for(var i = 0,a = [i, i+b], x=0;i<d.length;i+=b) {
  		//Get left bounding box
  		for(var c = a[0], xz=0; c < a[1]; c+=4) {
  			if(d[c+3]>51) {
  				512 - xz > x && (x = 512 - xz);
  			}
  			xz++;
  		}

  		a[0] = i;
  		a[1] = i+b;
  	}
  	rect.left = 512-x;
  	
  	for(var i = 0,a = [i, i+b], x=512;i<d.length;i+=b) {
  		//Get right bounding box
  		for(var c = a[1], xz=0; c > a[0]; c-=4) {
  			if(d[c]>51) {
  				xz < x && (x = xz);
  			}
  			xz++;
  		}

  		a[0] = i;
  		a[1] = i+b;
  	}
  	rect.right = 512-x;
  	
  data.data = null;
  
  ctx.resetTransform();
  
  ctx.fillStyle='red';
  ctx.fillRect(0,rect.top-5,512,4);
 
  
  ctx.fillStyle='green';
  ctx.fillRect(0,rect.bottom+1,512,4)
  
  ctx.fillStyle='blue';
  ctx.fillRect(rect.right+1,0,4,512)
  
  ctx.fillStyle='yellow';
  ctx.fillRect(rect.left-5, 0,4,512);
  
  if(window.debugDraw) {
  ctx.fillStyle='magenta';
  ctx.fillRect(0,257,512,4);
  
  ctx.fillStyle='aqua';
  ctx.fillRect(254,0,4,512)
  }
  
  var f = {
  	bitmap_index: bitmapIndex,
  	x: rect.left,
  	y: rect.top, 
    w: rect.right-rect.left+1,
    h: rect.bottom-rect.top+1,
    ox: (rect.left + (rect.right-rect.left) *.5)-256,
    oy: 256 - rect.bottom,
    name: t,
    r: 0,
    xw:0,
    yh:0
  };
  f.w<0&&(f.w=0);
  f.h<0&&(f.h=0)
  
  !preview && chs.push(f);

	};
	
	clear = function(a) {
		ctx.resetTransform();
		ctx.clearRect(0,0,canvas.width,canvas.height);
	}
	
overlapTest = function(z,l) {
  var t = z.x,
  o = z.y,
  a = z.w/2,
  n = z.h/2,
  r = l.x,
  i = l.y,
  s = l.w/2,
  c = l.h/2;
  return t-a <= r+s && t+a >= r-s && o-n <= i+c && o+n >= i-c
}
RandomFill = function() {
	var e = "#";
	e += Math.round(Math.random()*255).toString(16).padStart(2,"0");
	e += Math.round(Math.random()*255).toString(16).padStart(2,"0");
	e += Math.round(Math.random()*255).toString(16).padStart(2,"0");
	return e
}
//	drawText('load');

saveFrames = function() {
	for(var i=0;i<chs.length;i++) {
		delete chs[i].r;
		delete chs[i].xw;
		delete chs[i].yh;
	}
//	FRAMES.push(...chs);
	BITMAPS.push(c2.toDataURL());
}
saveCanvas = function(n) {
	var a = document.createElement('a');
	
	!n.endsWith('.png') &&(n += '.png');
	
	n = n.substr(0,n.length-4) + '-%INDEX%.png';
	
	for(var i = 0; i < BITMAPS.length; i++) {
		a.download = n.replace('%INDEX%',i);
		a.href = BITMAPS[i];
		a.click();
	}
	
}
saveText = function(n,bft) {
	URL.revokeObjectURL(window.bftFile);
	var a = document.createElement('a');
	a.download = n;
	!a.download.endsWith('.csv') && (a.download += '.csv');
	bftFile = URL.createObjectURL(new File([bft],a.download));
	a.href = bftFile;
	a.click();
}
cancel = false;

startDraw = function(){
	onDrawStart();
	fontData.ix = 0;
	bitmapIndex = 0;
	FRAMES = [];
	m = {
		x:0,
		y:0,
		w:0,
		h:0,
		r:0
	}
	chs=[];
	cancel = false;
	u();
}
	
	c2.style.width=canvas.style.width;
	u = function() {
		clear();
		
		drawText( String.fromCharCode(fontData.chars[fontData.ix]) );
	  
	  if(fontData.ix < fontData.chars.length) {
	  	fontData.ix++;
	  	!cancel && setImmediate(u);
	  }else {
	  	saveFrames();
	  	onDrawEnd();
	  	clear();
	    drawText(FRAMES.length > 1 ? 'done!':'error',true);
	  	return true;
	  }
	  
//	  for(var i = 0,x=0,y=0,w=0,h=0; i < chs.length; i++) {
	  	var f = chs[chs.length-1]
	 // 	drawChar(ctx.canvas,f);
			if(m.x+f.w > c2.width) {
	  		m.x=0
	  		m.y=0
	  		m.r++;
			}

	  	f.r = m.r;
	  	m.y>f.h/2&&(m.y-=f.h/2)
	  	for(var i = 0;i<chs.length;i++) if(chs[i].r === f.r-1) {
	  	  if( overlapTest(
	  	  	    {x:m.x+(f.w/2),y:m.y+((f.h*9999)/2),w:f.w+1,h:f.h*9999},
	  	  			{x:chs[i].xw+(chs[i].w/2),y:chs[i].yh+((chs[i].h+c2.height*999)/2),w:chs[i].w+1,h:chs[i].h+c2.height*999}) && 
	  	  	  chs[i].yh+chs[i].h+1 > m.y){m.y= chs[i].yh+chs[i].h+1}
	  	} else if(chs[i].r >= f.r) break;
	  //	m.y=y2
	  
	  if(m.y+f.h > c2.height) {
	  		saveFrames();
				ct2.clearRect(0,0,c2.width,c2.height);
				m.y=0
				m.r=0;
				m.x=0;
				chs=[];
				bitmapIndex++;
				fontData.ix--;
				return;
			}
	  
	  if(!window.debugDraw) ct2.drawImage(canvas,f.x,f.y,f.w,f.h,m.x,m.y,f.w,f.h);
	  else {
	  	ct2.fillStyle = RandomFill();
	  	ct2.globalAlpha = .7;
	  	ct2.globalCompositeOperation = 'lighter'
	  	ct2.fillRect(m.x,m.y,f.w,f.h);
	  }
	  FRAMES.push({
	  	bitmap_index: f.bitmap_index,
	  	x:m.x, y:m.y,
	  	w:f.w, h:f.h,
	  	ox:f.ox, oy:f.oy,
	  	name: f.name
	  });
	  
	  	f.xw = m.x+1;
	  	f.yh = m.y+1;
	  	m.x+=f.w+1;
	}
	
};
